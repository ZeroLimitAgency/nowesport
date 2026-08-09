import type { FortnitePlayerSnapshot } from "./performance-provider.ts";

export class TrackerSchemaError extends Error {
  constructor() { super("Tracker response does not match the configured contract adapter."); this.name = "TrackerSchemaError"; }
}

// This is NOW's stable contract envelope. A contract-specific adapter must map raw Tracker JSON to it.
export type TrackerContractEnvelope = {
  player: { id: string; name: string; platform?: string; region?: string };
  capturedAt?: string;
  metrics?: Array<{ key: string; value: number; currency?: string; season?: string; region?: string }>;
  results?: Array<{ occurredAt: string; placement?: number; eventName?: string }>;
};

export function normalizeTrackerEnvelope(payload: unknown, now = new Date()): FortnitePlayerSnapshot {
  if (!payload || typeof payload !== "object") throw new TrackerSchemaError();
  const envelope = payload as Partial<TrackerContractEnvelope>;
  if (!envelope.player || typeof envelope.player.id !== "string" || typeof envelope.player.name !== "string") throw new TrackerSchemaError();
  const metrics = envelope.metrics ?? [];
  if (!metrics.every((metric) => typeof metric.key === "string" && Number.isFinite(metric.value))) throw new TrackerSchemaError();
  const results = envelope.results ?? [];
  if (!results.every((result) => typeof result.occurredAt === "string")) throw new TrackerSchemaError();
  return {
    identity: { providerPlayerId: envelope.player.id, nickname: envelope.player.name, platform: envelope.player.platform, region: envelope.player.region },
    metrics,
    recentResults: results,
    source: "fortnite_tracker",
    capturedAt: envelope.capturedAt ?? now.toISOString(),
  };
}
