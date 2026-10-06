---
title: Site navigation
labels: [wayfinder:grilling]
status: closed
assignee: claude (Will)
blocked_by: []
---

## Question

How does a visitor get from the Landing to the deep-dives, About, Contact and a Project Sheet? Real routes or overlays, what's in the header, and whether Contact is a page or a footer. Settles the URL map for every page.

## Resolution (Will, 2026-10-05)

**One scrolling page, not separate pages.** ADR: `docs/adr/0002-one-scrolling-page.md`.

1. The Landing is the top of the page. Its scroll is locked to stepping through projects.
2. A new **Index drawer** sits at the bottom centre. Collapsed, it reads "Explore". Open, it lists the Sections. Opening it plays a transition: the page scrolls down while the drawer morphs into the Sections' content panel.
3. **Sections** are storytelling blocks under the Landing: Design, Music, thoughts on AI, the tools Will uses, About, Contact, and maybe more. Each sits in a solid content panel with the dot field visible in the margins. The Visual and Sound drawers and the music carry on through them.
4. Scrolling up past the first Section snaps back to the Landing and re-locks it. The monogram does the same from anywhere.
5. URLs: `/design`, `/music` etc. render the same page and scroll to that Section, and the URL follows the scroll. `/work/<slug>` opens that project's Sheet. Shared links show the Gate first, then go to the target.
6. One Project Sheet everywhere (the Landing strip and inside Sections), at `/work/<slug>`. Closing it returns to where you were. The Sheet's whole design is reworked in [Project Sheet rework](08-project-sheet.md).
7. Contact is a form in its own Section, delivered by our own Cloudflare Worker ([Contact form delivery](16-contact-form-delivery.md)).
8. Header menu links wait until the Section contents are known.
