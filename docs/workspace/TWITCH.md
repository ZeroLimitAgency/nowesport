# Twitch integration

## Application and Helix

Create a Twitch Developer application and configure `TWITCH_CLIENT_ID` and server-only `TWITCH_CLIENT_SECRET`. `TwitchProvider` obtains an OAuth client-credentials App Access Token from Twitch ID, caches it until shortly before expiry, refreshes once after 401, and calls current Helix Users, Streams and EventSub subscription APIs. It batches up to 100 IDs, applies timeout/retry/rate-limit handling and never logs tokens or authorization headers. Kraken is not used.

## EventSub Webhook

Vercel cannot keep a reliable permanent WebSocket, so production uses Webhook transport at `/api/integrations/twitch/eventsub`. Configure a stable production HTTPS callback such as `https://nowesport.org/api/integrations/twitch/eventsub`; do not use an ephemeral preview URL for production subscriptions. `TWITCH_EVENTSUB_SECRET` is never stored in Supabase.

The handler reads the exact raw body, computes HMAC SHA-256 over message ID + timestamp + raw body, uses timing-safe comparison, rejects messages older than ten minutes, limits payload size, and inserts the message ID into `webhook_events` for replay protection. Challenge responses are returned as plain text after signature validation. Revocations update `integration_subscriptions`; online/offline events create or close one active session idempotently.

The maintenance proxy already exempts `/api`, so EventSub remains reachable while the public site is in maintenance. Workspace pages remain private/noindex.

## Setup and testing

Create `stream.online` and `stream.offline` subscriptions only after an operator confirms the resolved broadcaster identity. Use Twitch CLI's official EventSub webhook simulation against a non-production organization, then verify challenge, invalid signature, stale timestamp, duplicate ID, online, offline and revocation. CI uses locally signed fixtures and never calls Twitch.
