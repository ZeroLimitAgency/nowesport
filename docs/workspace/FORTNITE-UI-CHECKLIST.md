# Fortnite Workspace UI validation checklist

Run with authenticated CEO, Director Fortnite, Manager Fortnite and Player fixtures after both migrations are applied.

- Desktop 1440×900: shell, scouting 3-column cards, sticky add panel, comparison chart/legend, score profile form, prospect detail anchors.
- Tablet 768×1024: navigation overflow, 2-column cards, chart horizontal behavior, forms and filters.
- Mobile 320×720 and 390×844: no clipped actions, cards replace wide tables, multi-select is usable, chart has a 42rem scroll surface, touch targets and note form remain reachable.
- Keyboard/screen reader: navigation labels, chart title/figure label, legend toggle pressed state, form labels/context, focus order.
- Empty/error/loading: no player/PR/score/earnings fixtures; pending, rate-limited, unavailable and failed sync states; no stack or raw provider JSON.
- Permissions: Manager has no score-profile or direction-note UI; Player has no global scouting; cross-organization IDs return no rows.

No Chromium executable was available in the delivery container, so this checklist is not marked complete and no visual validation is claimed.
