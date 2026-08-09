export type ProviderStatus =
  | "available"
  | "not_configured"
  | "not_supported"
  | "rate_limited"
  | "not_found"
  | "provider_error";

export type ProviderResult<T> =
  | { status: "available"; data: T; cached: boolean }
  | { status: Exclude<ProviderStatus, "available">; message: string; retryAfterSeconds?: number };

export type FortniteIdentity = {
  providerPlayerId: string;
  nickname: string;
  platform?: string;
  region?: string;
};

export type FortnitePlayerSnapshot = {
  identity: FortniteIdentity;
  metrics: Array<{
    key: string;
    value: number;
    currency?: string;
    season?: string;
    region?: string;
  }>;
  recentResults: Array<{ occurredAt: string; placement?: number; eventName?: string }>;
  source: string;
  capturedAt: string;
};

export interface PerformanceProvider {
  readonly id: "manual" | "fortnite_tracker";
  searchPlayer(query: string, platform?: string): Promise<ProviderResult<FortniteIdentity[]>>;
  getPlayerProfile(providerPlayerId: string, platform?: string): Promise<ProviderResult<FortnitePlayerSnapshot>>;
  getPlayerHistory(providerPlayerId: string): Promise<ProviderResult<FortnitePlayerSnapshot[]>>;
  getLeaderboard(region?: string): Promise<ProviderResult<FortniteIdentity[]>>;
  refreshPlayer(providerPlayerId: string, platform?: string): Promise<ProviderResult<FortnitePlayerSnapshot>>;
}
