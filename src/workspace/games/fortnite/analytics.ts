export type MetricPoint = { subjectId: string; recordedAt: string; value: number };
export type MetricPeriod = "7d" | "30d" | "90d" | "6m" | "1y" | "season" | "all";

export function periodStart(period: MetricPeriod, now = new Date()) {
  if (period === "all" || period === "season") return null;
  const days = { "7d": 7, "30d": 30, "90d": 90, "6m": 183, "1y": 365 }[period];
  return new Date(now.getTime() - days * 86_400_000).toISOString();
}

export function downsampleSeries(points: MetricPoint[], maximumPoints: number) {
  if (maximumPoints < 2) throw new Error("maximumPoints must be at least 2");
  if (points.length <= maximumPoints) return points;
  const bucketSize = (points.length - 2) / (maximumPoints - 2);
  return [points[0], ...Array.from({ length: maximumPoints - 2 }, (_, index) => points[Math.floor((index + 0.5) * bucketSize) + 1]), points.at(-1)!];
}

export function deduplicateSnapshots(points: MetricPoint[], minimumSpacingMs = 60_000) {
  return [...points].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).filter((point, index, sorted) => {
    const previous = sorted[index - 1];
    return !previous || point.value !== previous.value || new Date(point.recordedAt).getTime() - new Date(previous.recordedAt).getTime() >= minimumSpacingMs;
  });
}

export function freshness(recordedAt: string | null, staleAfterMs: number, now = new Date()) {
  if (!recordedAt) return { state: "never" as const, ageMs: null };
  const ageMs = Math.max(0, now.getTime() - new Date(recordedAt).getTime());
  return { state: ageMs > staleAfterMs ? "stale" as const : "fresh" as const, ageMs };
}

export function relativeFreshness(recordedAt: string | null, now = new Date()) {
  if (!recordedAt) return "Never synced";
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(recordedAt).getTime()) / 60_000));
  if (minutes < 60) return `Updated ${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours} h ago`;
  return `Updated ${Math.floor(hours / 24)} d ago`;
}
