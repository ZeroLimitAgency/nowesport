# Permissions

Security uses permission keys, never role names. CEO has the complete catalogue. Manager Fortnite has operational Fortnite access including analytics, compare, manual Tracker refresh and ordinary staff notes, plus `contracts.view`; they do not receive financial, administration, role/user management, scoring-formula management, analytics export or direction-note access. Directors add `scouting.scores.manage`, `scouting.notes.direction_view` and `analytics.export`.

Phase 2 keys are `scouting.refresh`, `scouting.notes.view`, `scouting.notes.create`, `scouting.notes.direction_view`, `scouting.scores.manage`, `players.performance.refresh`, `players.performance.compare` and `analytics.export`. Player does not receive global scouting or comparison implicitly.

Scopes remain `organization`, `department`, `team`, `resource`. A Manager is assigned to Fortnite and RLS verifies organization membership rather than trusting an organization ID from the client. Kings is never hardcoded: it is an assignable display name for any eligible Auth user.

Phase 3 adds `streams.analytics.view`, `streams.goals.view`, `streams.goals.manage`, `streams.compare`, `notifications.push.manage`, and `notifications.test`. Manager Fortnite can view live/analytics/goals and compare but cannot manage Twitch accounts or goals. CEO, DG and Director Fortnite receive `streams.manage` and `streams.goals.manage`. Push subscription management is always additionally owner-scoped by RLS.

Overlay permissions are `overlays.view/create/edit/publish/assign/tokens.manage/campaigns.view/campaigns.manage`. CEO, DG and Directeur Fortnite receive management rights; Manager Fortnite receives view, assignment, token-copy/rotation and campaign-view access, but not global publishing or campaign mutation.
