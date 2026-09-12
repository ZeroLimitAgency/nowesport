# Live Center

The generic streaming core uses `StreamProvider`, provider identities, sessions, audience snapshots and optional goals. Twitch is the first adapter; Fortnite supplies the current UI context but is not part of the core model. The cockpit reads persisted Supabase state and never calls Twitch while rendering.

Live cards show Twitch identity, title, game, observed viewers, start time, thumbnail and freshness. Offline accounts, recent sessions, per-player 7/30/90-day, 6-month and yearly analytics, session detail and 2–5 player comparison are available. Empty production databases render “No player is live right now.”

A weighted viewer average uses each observation until the next snapshot; a single observation is returned as-is. Peak is the maximum snapshot observed by NOW and may differ from Twitch historical reporting. Duration uses `ended_at - started_at`, or current time for an active session. Goals support hours or stream count over a bounded period and are optional; contract amounts are never joined.

EventSub Webhook is primary for online/offline. `captureActiveStreamSnapshots` batches up to 100 Twitch user IDs, records viewer points, and repairs missed online/offline state. Recommended initial frequency is `STREAM_SNAPSHOT_INTERVAL_MINUTES=5`, subject to the Twitch contract and Helix rate headers. Do not send a late online push when polling discovers an old stream.

Future overlay projects can reference both `player_id` and `stream_account_id`. Sponsor exposure, impressions and commercial value are intentionally not calculated.
