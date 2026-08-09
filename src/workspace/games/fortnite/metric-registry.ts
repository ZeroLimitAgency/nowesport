export type MetricDirection = "higher_is_better" | "lower_is_better" | "neutral";
export type MetricFormat = "integer" | "decimal" | "percentage" | "score" | "currency";
export type MetricDefinition = { key: string; label: string; source: "tracker" | "now"; direction: MetricDirection; format: MetricFormat; currency?: string; minimum?: number; maximum?: number };

export const FORTNITE_METRICS: MetricDefinition[] = [
  { key: "fortnite.pr", label: "Power Ranking", source: "tracker", direction: "lower_is_better", format: "integer" },
  { key: "fortnite.ranking", label: "Ranking", source: "tracker", direction: "lower_is_better", format: "integer" },
  { key: "fortnite.earnings_usd", label: "Earnings", source: "tracker", direction: "higher_is_better", format: "currency", currency: "USD" },
  { key: "fortnite.events_played", label: "Events played", source: "tracker", direction: "neutral", format: "integer" },
  { key: "fortnite.average_placement", label: "Average placement", source: "tracker", direction: "lower_is_better", format: "decimal" },
  { key: "fortnite.best_placement", label: "Best placement", source: "tracker", direction: "lower_is_better", format: "integer" },
  { key: "fortnite.top_10", label: "Top 10", source: "tracker", direction: "higher_is_better", format: "integer" },
  { key: "fortnite.top_5", label: "Top 5", source: "tracker", direction: "higher_is_better", format: "integer" },
  { key: "fortnite.top_3", label: "Top 3", source: "tracker", direction: "higher_is_better", format: "integer" },
  { key: "fortnite.wins", label: "Wins", source: "tracker", direction: "higher_is_better", format: "integer" },
  { key: "fortnite.fncs_score", label: "FNCS", source: "tracker", direction: "higher_is_better", format: "score", minimum: 0, maximum: 100 },
  { key: "now.consistency", label: "Consistency", source: "now", direction: "higher_is_better", format: "score", minimum: 0, maximum: 100 },
  { key: "now.recent_performance", label: "Recent performance", source: "now", direction: "higher_is_better", format: "score", minimum: 0, maximum: 100 },
  { key: "now.progression", label: "Progression", source: "now", direction: "higher_is_better", format: "percentage" },
  { key: "now.activity", label: "Activity", source: "now", direction: "higher_is_better", format: "score", minimum: 0, maximum: 100 },
  { key: "now.scouting_score", label: "NOW Score", source: "now", direction: "higher_is_better", format: "score", minimum: 0, maximum: 100 },
];

export function getMetricDefinition(key: string) { return FORTNITE_METRICS.find((metric) => metric.key === key); }
