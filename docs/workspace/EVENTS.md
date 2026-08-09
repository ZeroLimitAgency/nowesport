# Événements

Taxonomie prévue: `task.assigned`, `task.due_soon`, `contract.expires_soon`, `player.stream_online`, `scouting.updated`, `meeting.created`, `calendar.reminder`. `notification_events` stocke l'événement métier; `notifications` stocke la livraison utilisateur. Les actions sensibles écrivent dans `audit_logs` lors de leur implémentation métier. Ne jamais inclure secret, token ou credential dans `payload`, `data` ou `metadata`.

Phase 2 reserves `fortnite.pr_changed`, `fortnite.player_improved`, `fortnite.player_declined`, `fortnite.score_threshold_reached` and `fortnite.sync_failed`. They may be written to `notification_events` after threshold policy is approved; push delivery remains disabled.

Phase 3 adds `stream.online`, optional `stream.offline`, `stream.goal_near`, `stream.goal_reached`, `stream.eventsub_revoked` and `stream.sync_failed`. EventSub creates domain events; preferences select in-app and push delivery. `stream.online` is deduplicated per session and viewer snapshots never emit notifications.

Overlay audit/domain events include project/scene creation, version publication/restoration, assignment changes, token generation/revocation and campaign lifecycle. Raw access tokens are never event metadata. Notification delivery for selected campaign/version events is prepared for a later dispatcher phase.
