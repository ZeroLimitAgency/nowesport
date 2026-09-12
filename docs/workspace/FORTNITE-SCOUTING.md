# Fortnite scouting

## Workflow and identity

A staff member can add a confirmed identity manually or paste an HTTPS profile URL on the allow-list `tracker.gg` / `fortnitetracker.com`. The parser never fetches the supplied URL and rejects arbitrary hosts, credentials and non-HTTPS schemes. Username search is supported by the provider contract when `FORTNITE_TRACKER_SEARCH_ENDPOINT` is configured; ambiguous results must be confirmed before creation. A disconnected/manual prospect remains usable and shows synchronization pending.

Statuses are `new`, `watching`, `interesting`, `contacted`, `discussion`, `rejected`, `archived`. The cockpit supports query/status filters, pagination, dense cards, freshness, PR/NOW score/progression when present, and links into the detail and comparator. The detail exposes Overview, Performance, Results, Scores, Notes and History. Recruitment remains a future non-destructive link to an existing roster member; it never creates a contract automatically.

## Notes and privacy

Notes have `fortnite_staff`, `fortnite_directors` or `direction` visibility. RLS requires note permissions and only users with `scouting.notes.direction_view` can read the two confidential levels. Notes never enter public roster queries or CSV exports.

## Scoring

Authorized directors can create versioned score profiles with 1–5 bounded criteria whose weights total 100%. Global, IGL and Fragger are not seeded because no approved criteria exist. Missing metrics can be renormalized, mark a score incomplete, or be required. The explanation stores raw/normalized values, effective weights, contributions and missing flags. The score UI says how many criteria were available and never substitutes zero for missing data.

## Refresh and audit

Manual refresh requires `scouting.refresh`; player refresh requires `players.performance.refresh`. Provider results are normalized before snapshots. Status changes, creation, archive, notes and refresh are audited; automatic snapshot volume is recorded in `fortnite_sync_runs` rather than `audit_logs`. Future notifications use `fortnite.pr_changed`, `fortnite.player_improved`, `fortnite.player_declined`, `fortnite.score_threshold_reached` and `fortnite.sync_failed`.
