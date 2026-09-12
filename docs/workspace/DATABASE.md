# Base de données

Migration: `supabase/migrations/20260809_workspace_core_foundations.sql`. Elle ajoute organisations, départements, rôles/permissions/scopes, profils joueurs privés, snapshots, scouting, streams, calendrier, tâches, réunions, notifications/push et audit. Toutes les tables Workspace activent RLS. `workspace_player_profiles` référence `roster_members` au lieu de dupliquer le roster public. Appliquer via le workflow Supabase habituel, puis assigner explicitement les utilisateurs.

Phase 3 migration `20260811_live_center_web_push.sql` extends existing stream/push tables and adds `integration_subscriptions`, `webhook_events`, `stream_goals`, and `notification_deliveries`. Webhook/idempotency tables are service-role write-only; stream reads require explicit permissions and push remains user-owned.

Phase 4 adds `overlay_projects`, `overlay_scenes`, `overlay_versions`, `overlay_assignments`, hashed `overlay_access_tokens`, `overlay_runtime_state`, asset collections/assets, and campaign targets. Apply `20260812_overlay_cloud.sql` after the first three Workspace migrations.
