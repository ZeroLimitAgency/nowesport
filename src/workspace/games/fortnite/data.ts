import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WorkspaceAccess } from "@/workspace/core/permissions";
import { downsampleSeries, periodStart, type MetricPeriod } from "./analytics";

export async function getMetricSeries(access: WorkspaceAccess, options: { metric: string; playerIds?: string[]; prospectIds?: string[]; period: MetricPeriod; maximumPoints?: number }) {
  const supabase = await createClient();
  let query = supabase.from("player_performance_snapshots").select("player_id,prospect_id,metric_value,recorded_at").eq("organization_id", access.organizationId).eq("metric_key", options.metric).order("recorded_at", { ascending: true }).limit(5_000);
  const from = periodStart(options.period);
  if (from) query = query.gte("recorded_at", from);
  if (options.playerIds?.length) query = query.in("player_id", options.playerIds.slice(0, 20));
  if (options.prospectIds?.length) query = query.in("prospect_id", options.prospectIds.slice(0, 20));
  const { data, error } = await query;
  if (error) return [];
  const grouped = new Map<string, Array<{ subjectId: string; recordedAt: string; value: number }>>();
  for (const item of data ?? []) {
    const subjectId = item.player_id ?? item.prospect_id;
    if (!subjectId) continue;
    const points = grouped.get(subjectId) ?? [];
    points.push({ subjectId, recordedAt: item.recorded_at, value: Number(item.metric_value) });
    grouped.set(subjectId, points);
  }
  return [...grouped.entries()].map(([subjectId, points]) => ({ subjectId, points: downsampleSeries(points, options.maximumPoints ?? 180) }));
}
