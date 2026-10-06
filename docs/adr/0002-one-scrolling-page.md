# ADR-0002: One scrolling page, not separate pages

**Status:** Accepted
**Date:** 2026-10-05
**Deciders:** Will

## Context
v1 needs Design, Music, AI, Tools, About and Contact content plus Project Sheets. The Landing's music, dot field and Visual/Sound drawers are the site's identity, and Will wants them present everywhere.

## Decision
The site is one page. The Landing sits on top with its scroll locked to stepping through projects. The Index drawer opens into Sections below, in a solid content panel with the dot field visible in the margins. Paths like `/music` render the same page and scroll to that Section; the URL follows the scroll. `/work/<slug>` opens a Project Sheet over whatever is behind it. Every path is prerendered and goes through the Gate first.

## Options considered
- **Separate routes with a shared shell:** real pages, simpler scroll. Rejected: the move between pages breaks the one continuous space Will wants, and the drawers would need re-placing per page.
- **Overlays on the Landing:** app-like, but no real URLs and weak SEO.
- **Hash anchors (`/#music`):** simplest, but one indexable page, and hashes fight the Landing's scroll lock.

## Consequences
- Easier: music, dot field and drawers never unmount; one continuous story.
- Harder: scroll lock ↔ free scroll hand-off, path ↔ scroll sync, per-path metadata on one page, and first-load weight grows with every Section (lazy-load Section media).
