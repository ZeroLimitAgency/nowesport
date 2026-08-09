# Portabilité

## Périmètre
Le Workspace est un noyau exportable d'opérations esport. Générique: `src/workspace/core`, routes opérations, composants shell/widgets, migration (hors seed NOW), tests et docs. NOW: `src/workspace/now`, textes/branding et seed. Fortnite: `src/workspace/games/fortnite` et routes `/workspace/fortnite`.

## Extraction
Copier les `portablePaths` du manifeste, appliquer la migration et supprimer/remplacer le seed NOW. Copier les helpers `core/auth.ts`, `permissions.ts`, `navigation.ts`; adapter l'auth Supabase hôte. Variables: Tracker et VAPID documentées dans le manifeste. Aucun bucket, cron ou webhook requis aujourd'hui. Les intégrations sont désactivées.

## Rebranding et organisations
Remplacer shell/metadata/preset NOW. Créer organisation, départements, rôles, grants et membres; ne jamais réutiliser un `organization_id` d'un autre tenant. Pour ajouter un jeu, créer module, permissions et routes. Pour retirer Fortnite, supprimer ses routes/module/preset, retirer permissions Fortnite et conserver le core.

## Inventaire
Migration Workspace: `20260809_workspace_core_foundations.sql`. Routes et chemins exhaustifs: `workspace.manifest.json`. Storage/jobs/webhooks: aucun en V1. Tracker attend son contrat; Twitch, push, calendrier et OBS attendent leurs phases.

## Phase 2 analytics extraction

Core analytics facts, scoring and downsampling live in portable Fortnite modules but depend only on stable internal contracts. Tracker-specific transport/config/adapter files can be replaced by another `PerformanceProvider` without changing snapshots, scoring or UI queries. Copy both Workspace migrations in chronological order. Phase 2 adds no bucket, webhook or enabled cron; the exported `syncTrackedFortnitePlayers` is the future scheduled entry point.

## Phase 3 extraction

`streaming/core` and `workspace/notifications` are provider/game agnostic. `streaming/twitch` and the EventSub route can be removed or replaced while retaining stream sessions, analytics, goals, notification preferences and Web Push. `app/workspace/fortnite/live` is the Fortnite-specific UI. Apply all three migrations in manifest order; configure or disable the prepared snapshot cron independently.

## Overlay Cloud extraction

Copy `src/workspace/overlays/core`, `renderer`, Workspace/public/API routes, the overlay UI components, migration `20260812_overlay_cloud.sql`, and the four overlay docs. `overlays.core`, `renderer`, `editor`, and `campaigns` are portable; `src/workspace/overlays/now` is replaceable branding/config. Supabase Database is required, Storage is optional for authored assets, and Live Center/Twitch bindings are optional. Create the `overlays` bucket using the migration or replace the asset URL policy. Remove Twitch bindings without changing token, versioning, editor, runtime or campaign code.
