# Architecture

`src/workspace/core` contient RBAC, scopes, navigation et widgets génériques. `src/workspace/now` contient les presets configurables NOW. `src/workspace/games/fortnite` contient les contrats provider Fortnite. Les routes sont des Server Components sous `src/app/workspace`; le layout et chaque page vérifient une permission. Les mutations revalident leur route et revérifient la permission côté serveur. Supabase RLS constitue la dernière barrière.

Streaming is split into `streaming/core` (provider contract, analytics, polling) and `streaming/twitch` (Helix, OAuth, EventSub). Notifications and Web Push live in `workspace/notifications`; Twitch emits generic domain events and does not call browser push directly.

Overlay Cloud is split into portable core/config/token/runtime code, a controlled public renderer, authenticated editor/actions, and isolated NOW presets. Published design versions are immutable; fast runtime state is stored separately.
