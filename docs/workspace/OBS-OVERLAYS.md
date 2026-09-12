# OBS overlays

Phase future: `overlay_projects` → `overlay_scenes` → `overlay_versions`, rattachés à organisation et joueur. Des `overlay_access_tokens` hachés, révocables, expirables donneront une URL OBS à privilège minimal. Aucun secret interne ne sera rendu dans la page overlay. Ces tables ne sont pas créées en V1.

Live Center sessions and audience snapshots can later correlate an overlay campaign activation with `stream_account_id`, `stream_session_id`, observed exposure hours and observed audience. This does not currently estimate impressions or sponsorship value.

## Phase 4 implementation

The implemented module is documented in `OVERLAY-CLOUD.md`, `OVERLAY-EDITOR.md`, `OBS-SETUP.md`, and `OVERLAY-SECURITY.md`. Live Center data is an optional allowlisted binding; the renderer remains functional without Twitch. Future OBS WebSocket control is deliberately out of scope. Stream sessions and audience snapshots may later be correlated with overlay campaign activation to measure observed exposure time, but Phase 4 does not estimate impressions or commercial value.
