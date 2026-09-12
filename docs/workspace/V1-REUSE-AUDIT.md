# Phase 2 — V1 reuse audit

Phase 2 reuses rather than duplicates the V1 organization, department, member, role, permission and scope graph. `workspace_player_profiles` remains the private extension of public `roster_members`; `scouting_prospects`, score profiles/criteria, `player_performance_snapshots`, notifications and `audit_logs` remain canonical. The existing Workspace shell, permission guard, navigation and dashboard cards are extended. No chart dependency existed, so the existing lightweight chart primitives are evolved into an accessible SVG multi-series component rather than adding a package.

The additive migration follows `20260809_workspace_core_foundations.sql`. The original `/admin`, public roster, Supabase session flow, maintenance proxy and public PWA manifest remain unchanged.
