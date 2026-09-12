import { getMetricDefinition, type MetricDirection } from "./metric-registry.ts";

export type MissingMetricStrategy = "renormalize" | "incomplete" | "required";
export type ScoreCriterion = { metricKey: string; weight: number; direction: MetricDirection; minimum: number; maximum: number; required?: boolean };
export type ScoreExplanation = { metricKey: string; label: string; rawValue?: number; normalizedScore?: number; weight: number; contribution?: number; missing: boolean };
export type ScoutingScore = { score: number | null; complete: boolean; availableCriteria: number; totalCriteria: number; explanation: ScoreExplanation[] };

export function validateScoreCriteria(criteria: ScoreCriterion[]) {
  const total = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (Math.abs(total - 100) > 0.001) return { valid: false, reason: "weights_must_total_100" } as const;
  if (criteria.some((criterion) => !getMetricDefinition(criterion.metricKey))) return { valid: false, reason: "unknown_metric" } as const;
  if (criteria.some((criterion) => criterion.weight < 0 || criterion.minimum >= criterion.maximum || criterion.direction === "neutral")) return { valid: false, reason: "invalid_bounds_or_direction" } as const;
  return { valid: true } as const;
}

export function computeScoutingScore(criteria: ScoreCriterion[], values: Record<string, number | undefined>, strategy: MissingMetricStrategy): ScoutingScore {
  const validation = validateScoreCriteria(criteria);
  if (!validation.valid) throw new Error(validation.reason);
  const available = criteria.filter((criterion) => Number.isFinite(values[criterion.metricKey]));
  const missingRequired = criteria.some((criterion) => criterion.required && !Number.isFinite(values[criterion.metricKey]));
  const usableWeight = available.reduce((sum, criterion) => sum + criterion.weight, 0);
  const cannotScore = missingRequired || strategy === "required" && available.length !== criteria.length || strategy === "incomplete" && available.length !== criteria.length || usableWeight === 0;
  const explanation = criteria.map((criterion) => {
    const value = values[criterion.metricKey];
    if (!Number.isFinite(value)) return { metricKey: criterion.metricKey, label: getMetricDefinition(criterion.metricKey)!.label, weight: criterion.weight, missing: true };
    const ratio = Math.max(0, Math.min(1, (value! - criterion.minimum) / (criterion.maximum - criterion.minimum)));
    const normalizedScore = Number(((criterion.direction === "lower_is_better" ? 1 - ratio : ratio) * 100).toFixed(2));
    const effectiveWeight = strategy === "renormalize" ? criterion.weight / usableWeight * 100 : criterion.weight;
    return { metricKey: criterion.metricKey, label: getMetricDefinition(criterion.metricKey)!.label, rawValue: value, normalizedScore, weight: Number(effectiveWeight.toFixed(2)), contribution: Number((normalizedScore * effectiveWeight / 100).toFixed(2)), missing: false };
  });
  return { score: cannotScore ? null : Number(explanation.reduce((sum, item) => sum + (item.contribution ?? 0), 0).toFixed(2)), complete: available.length === criteria.length, availableCriteria: available.length, totalCriteria: criteria.length, explanation };
}
