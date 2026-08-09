import "server-only";
import type { FortniteIdentity, FortnitePlayerSnapshot, PerformanceProvider, ProviderResult } from "./performance-provider";
import { getTrackerProviderConfig, type TrackerProviderConfig } from "./tracker-config";
import { TrackerHttpClient } from "./tracker-http-client";
import { normalizeTrackerEnvelope, TrackerSchemaError, type TrackerContractEnvelope } from "./tracker-normalizer";

export type TrackerContractAdapter = {
  profile(payload: unknown): TrackerContractEnvelope;
  search(payload: unknown): TrackerContractEnvelope[];
  history(payload: unknown): TrackerContractEnvelope[];
  leaderboard(payload: unknown): TrackerContractEnvelope[];
};

const envelopeAdapter: TrackerContractAdapter = {
  profile: (payload) => payload as TrackerContractEnvelope,
  search: (payload) => payload as TrackerContractEnvelope[],
  history: (payload) => payload as TrackerContractEnvelope[],
  leaderboard: (payload) => payload as TrackerContractEnvelope[],
};

export class FortniteTrackerProvider implements PerformanceProvider {
  readonly id = "fortnite_tracker" as const;
  private readonly client: TrackerHttpClient;
  constructor(config: TrackerProviderConfig = getTrackerProviderConfig(), fetcher: typeof fetch = fetch, private readonly adapter = envelopeAdapter) {
    this.client = new TrackerHttpClient(config, fetcher);
  }

  async searchPlayer(query: string, platform = "epic") {
    const result = await this.client.request("search", { query, platform });
    return this.normalizeMany(result, "search");
  }

  async getPlayerProfile(providerPlayerId: string, platform = "epic") {
    const result = await this.client.request("profile", { playerId: providerPlayerId, platform });
    return this.normalizeOne(result);
  }

  async getPlayerHistory(providerPlayerId: string) {
    const result = await this.client.request("history", { playerId: providerPlayerId });
    if (result.status !== "available") return result;
    try { return { ...result, data: this.adapter.history(result.data).map((item) => normalizeTrackerEnvelope(item)) }; }
    catch { return this.schemaFailure(); }
  }

  async getLeaderboard(region = "global") {
    const result = await this.client.request("leaderboard", { region });
    return this.normalizeMany(result, "leaderboard");
  }

  refreshPlayer(providerPlayerId: string, platform = "epic") { return this.getPlayerProfile(providerPlayerId, platform); }

  private normalizeOne(result: ProviderResult<unknown>): ProviderResult<FortnitePlayerSnapshot> {
    if (result.status !== "available") return result;
    try { return { ...result, data: normalizeTrackerEnvelope(this.adapter.profile(result.data)) }; }
    catch (error) { return error instanceof TrackerSchemaError ? this.schemaFailure() : this.schemaFailure(); }
  }

  private normalizeMany(result: ProviderResult<unknown>, operation: "search" | "leaderboard"): ProviderResult<FortniteIdentity[]> {
    if (result.status !== "available") return result;
    try {
      const envelopes = operation === "search" ? this.adapter.search(result.data) : this.adapter.leaderboard(result.data);
      if (!Array.isArray(envelopes)) return this.schemaFailure();
      return { ...result, data: envelopes.map((item) => normalizeTrackerEnvelope(item).identity) };
    } catch { return this.schemaFailure(); }
  }

  private schemaFailure(): ProviderResult<never> { return { status: "provider_error", message: "Le format Tracker ne correspond pas au contrat configuré." }; }
}
