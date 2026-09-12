import type { MetricDirection } from "./metric-registry.ts";

export function computeProgression(previous: number, current: number, direction: MetricDirection) {
  if (!Number.isFinite(previous) || !Number.isFinite(current) || previous === 0 || direction === "neutral") return null;
  const raw = ((current - previous) / Math.abs(previous)) * 100;
  return Number((direction === "lower_is_better" ? -raw : raw).toFixed(2));
}

export function progressionLabel(value: number | null, stableThreshold = 2) {
  if (value === null) return "Unavailable" as const;
  if (value > stableThreshold) return "Improving" as const;
  if (value < -stableThreshold) return "Declining" as const;
  return "Stable" as const;
}

// Coefficient of variation inverted to 0..100. Requires at least three positive placements.
export function computeConsistency(placements: number[]) {
  const values = placements.filter((value) => Number.isFinite(value) && value > 0);
  if (values.length < 3) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const coefficient = Math.sqrt(variance) / mean;
  return Number(Math.max(0, Math.min(100, 100 * (1 - coefficient))).toFixed(2));
}
