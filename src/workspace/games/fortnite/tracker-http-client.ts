import type { ProviderResult } from "./performance-provider.ts";
import type { TrackerOperation, TrackerProviderConfig } from "./tracker-config.ts";
import { validateTrackerConfig } from "./tracker-config.ts";

type CacheEntry = { expiresAt: number; payload: unknown };
type RequestLogger = (event: { provider: "fortnite_tracker"; operation: TrackerOperation; status: string; durationMs: number; errorCode?: string }) => void;

export class TrackerHttpClient {
  private readonly cache = new Map<string, CacheEntry>();
  private lastRequestAt = 0;
  private readonly config: TrackerProviderConfig;
  private readonly fetcher: typeof fetch;
  private readonly logger: RequestLogger;
  constructor(config: TrackerProviderConfig, fetcher: typeof fetch = fetch, logger: RequestLogger = () => undefined) {
    this.config = config;
    this.fetcher = fetcher;
    this.logger = logger;
  }

  async request(operation: TrackerOperation, parameters: Record<string, string>): Promise<ProviderResult<unknown>> {
    const invalid = validateTrackerConfig(this.config);
    if (invalid) return { status: "not_configured", message: "Tracker Network n’est pas configuré." };
    const template = this.config.endpoints[operation];
    if (!template) return { status: "not_supported", message: "Cette capacité n’est pas prévue par le contrat configuré." };
    const path = template.replace(/\{([a-zA-Z]+)\}/g, (_, key: string) => encodeURIComponent(parameters[key] ?? ""));
    const url = new URL(path, this.config.baseUrl);
    const trustedBase = new URL(this.config.baseUrl!);
    if (url.origin !== trustedBase.origin) return { status: "provider_error", message: "La configuration Tracker est invalide." };
    const cacheKey = `${operation}:${url.href}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return { status: "available", data: cached.payload, cached: true };
    const startedAt = Date.now();
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt += 1) {
      const delay = Math.max(0, this.config.minimumRequestIntervalMs - (Date.now() - this.lastRequestAt));
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      this.lastRequestAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs);
      try {
        const response = await this.fetcher(url, { headers: { "TRN-Api-Key": this.config.apiKey! }, signal: controller.signal, cache: "no-store" });
        clearTimeout(timeout);
        if (response.ok) {
          let payload: unknown;
          try { payload = await response.json(); } catch { return this.failure(operation, startedAt, "invalid_json", "Tracker Network a renvoyé une réponse invalide."); }
          this.cache.set(cacheKey, { payload, expiresAt: Date.now() + this.config.cacheTtlMs });
          this.logger({ provider: "fortnite_tracker", operation, status: "available", durationMs: Date.now() - startedAt });
          return { status: "available", data: payload, cached: false };
        }
        if (response.status === 404) return { status: "not_found", message: "Profil Tracker introuvable." };
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfter = retryAfterHeader === null ? Number.NaN : Number(retryAfterHeader);
        if (response.status === 429 && attempt === this.config.maxRetries) return { status: "rate_limited", message: "Quota Tracker atteint. Nouvelle tentative plus tard.", retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined };
        if (![429, 500, 502, 503, 504].includes(response.status)) return this.failure(operation, startedAt, `http_${response.status}`, response.status === 401 || response.status === 403 ? "Le profil Tracker doit être reconnecté." : "Tracker Network a refusé la requête.");
        if (attempt < this.config.maxRetries) await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) ? retryAfter * 1_000 : 250 * 2 ** attempt));
      } catch (error) {
        clearTimeout(timeout);
        if (attempt === this.config.maxRetries) return this.failure(operation, startedAt, error instanceof Error && error.name === "AbortError" ? "timeout" : "network", "Tracker Network est temporairement indisponible.");
      }
    }
    return this.failure(operation, startedAt, "unknown", "Tracker Network est temporairement indisponible.");
  }

  private failure(operation: TrackerOperation, startedAt: number, errorCode: string, message: string): ProviderResult<never> {
    this.logger({ provider: "fortnite_tracker", operation, status: "provider_error", durationMs: Date.now() - startedAt, errorCode });
    return { status: "provider_error", message };
  }
}
