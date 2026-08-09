# Overlay editor

The desktop editor uses Layers, the same renderer used by OBS, and a property inspector. V1 supports controlled text, image, video, rectangle, gradient, social/player labels, sponsor slots, clocks and live-viewer labels. Coordinates remain in the original canvas space while preview is scaled. Mobile supports viewing, preview, assignments and token operations; advanced composition is desktop-first.

Configuration is schema-validated on every save and publish. It is limited to 200 KB and 100 elements, with bounded geometry, opacity, rotation and z-index. No custom HTML, scripts, iframes, `eval`, `javascript:` URLs or arbitrary bindings are accepted.
