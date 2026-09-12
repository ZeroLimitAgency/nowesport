# Overlay security

OBS tokens contain 256 random bits, are stored only as SHA-256 hashes and are shown only at generation. Validation is constant-time; missing, invalid, revoked and expired tokens all receive a neutral response. Tokens are scoped to one assignment and usage writes are throttled.

The renderer resolves only the documented public binding allowlist. It never queries private notes, contracts, finance, credentials or provider IDs. React escapes text; the renderer never uses administrable HTML. Asset URLs are restricted to the `overlays` public Storage bucket, and SVG is rejected.

Overlay responses are noindex/noarchive, private/no-store and use a dedicated restrictive CSP. `/overlay/*` and its runtime API bypass public maintenance, while Workspace management remains authenticated and permission checked. Public rendering uses server-side token validation rather than anonymous table access.
