# Fortnite analytics

## Facts and snapshots

External facts enter only through a `PerformanceProvider`, a contract adapter and the stable `FortnitePlayerSnapshot`. They are appended to `player_performance_snapshots`; an identical value captured less than five minutes after the previous value is skipped. `fortnite_player_provider_links` separates provider identity from NOW players and prospects. Currency is stored explicitly; `fortnite.earnings_usd` is USD and is never silently converted.

## Metric registry

Provider metrics are `fortnite.pr`, `fortnite.ranking`, `fortnite.earnings_usd`, events played, average/best placement, top 10/5/3, wins and FNCS score. Derived facts use the `now.*` namespace: consistency, recent performance, progression, activity and scouting score. Every definition declares source, direction and format. PR is configured `lower_is_better`; update it through a migration if the commercial definition differs.

## Deterministic computations

Progression V1 is signed percentage change adjusted for metric direction. A fall from 14,200 to 12,300 on a lower-is-better metric is +13.38%. Stable defaults to ±2%, configurable by the caller. Consistency V1 is `100 × (1 − coefficient of variation)` clamped to 0–100 and requires at least three positive placements. No ML or LLM supplies facts.

## Query and rendering

`getMetricSeries` limits subjects, time range and database rows, then downsamples to at most 180 points per series. Detailed ranges are used for 7/30/90 days; long histories are bounded/downsampled. The chart is responsive, keyboard-toggleable, accessible through SVG title/figure labels, horizontally usable on mobile, and limits the visible comparison to ten series. Missing data renders an explicit empty state or `N/A`.

## Freshness

Every provider link exposes `last_synced_at`, `next_sync_at` and an explicit sync state. UI wording never claims live data. Stale thresholds are caller-controlled. Formula results reference score profile ID and version so historical scores are not mislabeled after a formula change.
