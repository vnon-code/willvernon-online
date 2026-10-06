---
title: Project Sheet rework
labels: [wayfinder:prototype]
status: open
assignee: will (claude session 2026-10-06)
blocked_by: [15-scroll-page-shell]
---

## Question

Rework the Project Sheet from scratch: layout, look, how it opens and closes, and its `/work/<slug>` URL (deep link opens the Landing or Section with the Sheet open; Back closes it). It opens from the Landing strip and from inside Sections. Prototype with one real project, then lock the template for the rest. Today's `ProjectSheet.vue` is a starting point, not a constraint.

## Brief (Will, 2026-10-06)

- Open/close: the centre card's teaser panel itself expands (and collapses back); the Sheet builds around it.
- The other Landing elements (side cards, plates, chips, HUD) drop away; the dot-field background stays visible in the margins. No blur.
- Shape: a centred sheet, but try different things within that.
- Media first. Today's content feels thin and flat.
- Prototype project: Amplified Spaces.
