# Workspace Web Push

NOW Workspace uses the standard Service Worker, Push API and Notifications API. `/workspace-sw.js` only handles `push` and `notificationclick`; it does not cache Next.js pages or public assets. The dedicated `/workspace.webmanifest` opens `/workspace` without changing the public-site manifest.

Permission is requested only from the explicit “Activer” control. Each browser endpoint is stored separately for multi-device use. Unsubscribe revokes only the current endpoint. RLS allows users to see and manage only their subscriptions. 404/410 delivery responses revoke an endpoint; notification business events continue even when push delivery fails.

VAPID public key is browser-visible. Private key and subject remain server-only. Production delivery uses the maintained `web-push` transport adapter. The delivery container could not download the package from npm, so the adapter loads it at runtime and reports `not_configured` until the deployment includes that dependency; cryptography was deliberately not reimplemented locally.

Push payloads are limited to title, body, internal Workspace URL, type and notification ID. Contract amounts, staff notes, medical data, tokens and credentials are forbidden. Notification clicks accept only `/workspace` paths and reuse an existing same-origin window where possible.

On compatible iPhone/iPad versions, users must first add NOW Workspace to the Home Screen, open the installed web app, then enable notifications. The application cannot install itself automatically.
