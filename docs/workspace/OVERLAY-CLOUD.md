# Overlay Cloud

Overlay Cloud is a game-independent Workspace module. Projects contain scenes; scenes have immutable published versions, generic assignments and independently mutable runtime state. OBS loads `/overlay/{publicId}?token=...`; the renderer works without a user session but requires a scoped, non-expired, non-revoked token.

## Lifecycle

1. Create a project and scene (1920×1080 by default).
2. Compose controlled elements in the editor and save a draft.
3. Publish an immutable version. Restore creates a new version rather than rewriting history.
4. Assign the scene to players, generate an OBS URL, and copy it once.
5. Update allowlisted runtime state; Browser Sources poll every five seconds by default.

The existing `overlays` Supabase Storage bucket stores non-sensitive versioned assets. V1 accepts PNG, JPEG, WEBP, MP4 and WEBM; SVG is rejected because active content is unsafe. Assets are public and must never contain private information.

Campaigns inject allowlisted sponsor runtime state and are a scheduling foundation only. There is no billing, impression estimate or sponsor valuation. `applyScheduledOverlayCampaigns()` is prepared but not scheduled.
