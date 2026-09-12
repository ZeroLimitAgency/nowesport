# Export vers Zero Limit Agency

1. Copier les chemins portables du manifeste. 2. Renommer le package branding et remplacer `src/workspace/now`. 3. retirer le seed NOW de la migration avant un nouveau déploiement. 4. créer l'organisation Zero Limit et ses départements. 5. conserver les clés de permission génériques. 6. inclure Fortnite seulement si utile. 7. revalider RLS avec deux organisations. 8. fournir de nouveaux secrets via l'environnement, jamais Git.

For Phase 2, copy the analytics/scoring modules and migration, but select a provider independently. Remove the Tracker transport if Zero Limit uses another data vendor; retain `PerformanceProvider`, the metric registry, snapshots and scoring. Recreate score profiles from approved business criteria rather than copying NOW scores blindly. Re-test cross-organization provider-link uniqueness, confidential notes and sync jobs.

Phase 3 export can keep core Web Push and streaming analytics without Twitch. Replace the `StreamProvider`, remove Twitch-specific env/webhook paths, and retain sessions/snapshots/goals. Generate new VAPID keys and Twitch secrets for the target organization; never copy NOW production secrets or subscriptions.

Overlay Cloud can be exported independently: retain core/renderer/editor/campaign migrations and replace `overlays/now`. Recreate permission grants for the destination roles, configure the destination asset host/bucket policy, and preserve `/overlay/*` maintenance bypass. Twitch is optional; remove its three stream bindings when absent.
