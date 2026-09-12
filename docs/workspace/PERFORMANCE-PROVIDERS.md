# Performance providers

## Tracker Network contract

Tracker Network access is server-only and authenticates with the `TRN-Api-Key` header. The API key is never public, logged, placed in an URL, returned in an error, or stored in audit metadata. `FORTNITE_TRACKER_API_BASE_URL` is a trusted HTTPS origin. Endpoint templates are independent environment values for search, profile, rankings, matches, history and leaderboard; substitutions are URL-encoded and the resulting URL must keep the configured origin.

The old public Fortnite endpoints cited by PublicAPIs.io are historical and are **not** treated as contractual or modern endpoints. This repository has no built-in endpoint. Production activation requires the commercial/partner endpoint templates and a contract-specific `TrackerContractAdapter` mapping raw JSON into `TrackerContractEnvelope`. No business page reads raw provider JSON.

## Pipeline

`TrackerHttpClient` → `FortniteTrackerProvider` → contract adapter → `normalizeTrackerEnvelope` → `FortnitePlayerSnapshot` → Supabase snapshots → analytics UI. Capabilities return discriminated statuses: `available`, `not_configured`, `not_supported`, `rate_limited`, `not_found`, `provider_error`.

## Resilience and quotas

Default timeout is 8 seconds, with two retries only for timeout/network, 429 and selected 5xx. 400/401/403/404 are not retried. `Retry-After` is honored. A central in-process minimum request interval and TTL cache prevent render-time bursts; pages never invoke Tracker. Manual or scheduled refresh normalizes and persists first. A distributed rate limiter may be required once contractual limits and multi-instance concurrency are known.

Profile cache defaults to five minutes and is configurable. Scheduled sync uses bounded batches, stops a batch after rate limiting, uses separate intervals for active roster players and prospects, skips archived/unlinked subjects, records structured sync runs, and never logs headers or raw payloads.

## Environment and activation checklist

Configure base URL, API key, only the endpoint templates granted by the contract, timeouts/cache/rate policy, and a reviewed adapter. Run the mocked contract tests, then make one non-destructive validation call from a secured server environment. Verify normalized identity and metrics, quotas and `Retry-After`, without printing headers. No real endpoint or credentials were available during this phase, so no external validation call was made.
