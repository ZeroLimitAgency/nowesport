# OBS setup

1. Open Workspace → Overlay Cloud → project → scene.
2. Assign the scene to a player and generate an OBS URL.
3. Copy it immediately; the raw token is not stored and cannot be displayed again.
4. In OBS choose **Sources → Browser**, paste the URL, then set the scene's recommended width and height.

If the source is transparent, verify that the token was not revoked or expired and refresh the browser source cache. Wrong dimensions distort positioning. Missing assets must be uploaded again or replaced in a new version. Regenerating a URL immediately revokes the old one.

Workspace controls rendered content, not OBS scenes. Remote scene switching requires a future OBS WebSocket/local-agent integration.
