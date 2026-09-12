# PWA and Push

The public manifest remains unchanged. Workspace pages reference `/workspace.webmanifest`, with standalone display, NOW colors, `/workspace` start URL and `/workspace/` scope. The service worker is push-only and avoids offline caching.

`push_subscriptions` supports multiple devices, last use and revocation. `notification_preferences` gates in-app/push per event. `notification_deliveries` records channel outcome and an endpoint hash, never the full endpoint in logs. See [WEB-PUSH.md](WEB-PUSH.md) for VAPID, iOS, privacy, subscription and click behavior.
