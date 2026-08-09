export type TrackerOperation = "search" | "profile" | "rankings" | "matches" | "history" | "leaderboard";

export type TrackerEndpointConfig = Partial<Record<TrackerOperation, string>>;

export type TrackerProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  endpoints: TrackerEndpointConfig;
  timeoutMs: number;
  maxRetries: number;
  cacheTtlMs: number;
  minimumRequestIntervalMs: number;
};

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getTrackerProviderConfig(env: NodeJS.ProcessEnv = process.env): TrackerProviderConfig {
  return {
    apiKey: env.FORTNITE_TRACKER_API_KEY,
    baseUrl: env.FORTNITE_TRACKER_API_BASE_URL,
    endpoints: {
      search: env.FORTNITE_TRACKER_SEARCH_ENDPOINT,
      profile: env.FORTNITE_TRACKER_PROFILE_ENDPOINT,
      rankings: env.FORTNITE_TRACKER_PR_ENDPOINT,
      matches: env.FORTNITE_TRACKER_MATCHES_ENDPOINT,
      history: env.FORTNITE_TRACKER_HISTORY_ENDPOINT,
      leaderboard: env.FORTNITE_TRACKER_LEADERBOARD_ENDPOINT,
    },
    timeoutMs: positiveInteger(env.FORTNITE_TRACKER_TIMEOUT_MS, 8_000),
    maxRetries: positiveInteger(env.FORTNITE_TRACKER_MAX_RETRIES, 2),
    cacheTtlMs: positiveInteger(env.FORTNITE_TRACKER_CACHE_TTL_SECONDS, 300) * 1_000,
    minimumRequestIntervalMs: positiveInteger(env.FORTNITE_TRACKER_MIN_REQUEST_INTERVAL_MS, 250),
  };
}

export function validateTrackerConfig(config: TrackerProviderConfig) {
  if (!config.apiKey) return "missing_api_key" as const;
  if (!config.baseUrl) return "missing_base_url" as const;
  try {
    const url = new URL(config.baseUrl);
    if (url.protocol !== "https:") return "invalid_base_url" as const;
  } catch {
    return "invalid_base_url" as const;
  }
  return null;
}
