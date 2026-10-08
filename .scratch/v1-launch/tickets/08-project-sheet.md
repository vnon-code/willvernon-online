---
title: Project Sheet rework
labels: [wayfinder:prototype]
status: closed
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

## Resolution (2026-10-08)

Will locked in the top-scoring variant for every project (the overnight run's recommended defaults; Powersurge tied PwB/PwB2, PwB kept). Folded into the real code in bafc555: each `/work/<slug>` renders its winner via `app/composables/sheetRegistry.ts`; losers, the options panel and PROTOTYPE markers removed; losers archived on `archive/project-sheet-variants`. Cargo 5015's card is no longer behind `?proto`. Merged into v3; the built site passes the CSP check on all 12 Sheets. Copy stays PLACEHOLDER and media is local until the detail pass (20).
