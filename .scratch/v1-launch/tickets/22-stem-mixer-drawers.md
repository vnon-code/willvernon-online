---
title: Stem mixer in place of the music and visuals drawers
labels: [wayfinder:grilling]
status: open
assignee:
blocked_by: []
---

## Question

Redo the music and visuals drawers (`TheSoundHud.vue`, `TheVisualHud.vue`, `HudDrawer.vue`). Will's idea (2026-10-08): all his songs are beatmatched and key-matched, so the visuals drawer becomes a stem selector. The visitor picks a stem group per slot from any song and layers them, e.g. the atmos from "Let Me Know", drums from another song, vocals from a third. Visuals stop being user-changeable. The right-hand drawer stops being volume and instead alters effects, such as "dream"; which effects is still open.

Grill first, then prototype:
- Which songs, and which stem groups (atmos, drums, bass, vocals, ...)? Where do the stem files come from, and in what format and length (Will exports; R2 upload is Will's step)?
- Playback: one shared tempo and loop length so any combination stays in sync (native Web Audio, per ADR 0001); how stems load without a heavy page (lazy, per selection).
- The effects list and its controls ("dream" and others), and whether volume survives anywhere (mute at least).
- How the fixed visuals react to the mix, if at all.
- Relation to the Music Section (10-deep-dive-music).
