---
title: willvernon.online v1 launch
labels: [wayfinder:map]
status: open
created: 2026-10-05
---

## Destination

willvernon.online v1 is live from `v3`: the Gate, then one scrolling page (the Landing on top, Sections below: Design, Music, AI, Tools, About, Contact), Project Sheets at `/work/<slug>`, and a 404.

## Notes

- Domain: Nuxt 4 prerendered site; stack in `docs/adr/0001-stack.md`, specs in `docs/specs/`, terms in `GLOSSARY.md`.
- **This map carries execution.** The destination is a live site, so tickets may build, not only decide.
- **Time-box: one session per ticket.** At the end of the session, whatever is approved ships. Leftover tweaks go to `LATER.md` as one line each.
- **New ideas mid-build:** raise each one with Will in the question panel; Will picks now (new ticket) or later (`LATER.md`).
- **Prototypes are built in Nuxt (Will, 2026-10-05):** as real pages or routes in the app with real components and content, not as throwaway HTML in `prototype/`. Variants switch inside the page, and the pick becomes the build.
- **Section tickets are deep, iterative loops** (Will, 2026-10-05): build variants on the real page, Will picks or mutates, repeat (the "Karpathy loop" from rounds 7–8). One that outgrows a session closes with what's locked and opens a follow-up.
- Content: `content/*.json` is source material, not a parity checklist.
- Design skills: `impeccable` for page design, `animate` / `gsap-*` for motion, `threejs-*` for the dot field.
- Tracker: local markdown. Tickets live in `tickets/`. Frontmatter carries `labels`, `status` (open/closed), `assignee` (the claim) and `blocked_by`.

## Decisions so far

<!-- one line per closed ticket -->

- [CSP vs Nuxt inline scripts](tickets/06-csp-inline-scripts.md): hash the 2 inline scripts in a post-build step and write them into `_headers`; built in [Hash inline scripts at build](tickets/14-csp-hash-step.md)
- [Archive STATE.md history](tickets/01-archive-state.md): history is in `docs/history/`; STATE.md is now 41 lines and points at this map
- [Remove /proto leftovers](tickets/02-proto-cleanup.md): already done in 12bf4a7
- [Approve the info row](tickets/03-info-row.md): already locked in round 23 (plates + tiles, 36px, Hug) and built
- [Site navigation](tickets/05-site-navigation.md): one scrolling page; the Landing is scroll-locked on top, the Index drawer morphs into Sections below; `/<section>` and `/work/<slug>` URLs; Gate first on deep links
- [Scroll page shell](tickets/15-scroll-page-shell.md): built. Learn More (no menu) scrolls the whole Landing up to the Sections (About me, Music, AI, Contact for now); dots scroll in the panel's margins; past the Landing the header turns solid with a lit edge and inline links

## Not yet specified

- **Launch hardening:** a mobile pass, accessibility, performance budget and SEO metadata across all pages. Sharpens once the pages exist. Known: Sections render only after the Gate, so the prerendered `/<section>` files hold no Section text yet.
- **Copy for Sections:** who writes the Section text, and whether old copy is reused or rewritten. Depends on each Section's design.
- **The full Section list and order:** About me, Music, AI and Contact for now (Will, 2026-10-05); Design and Tools are not in it, and Will may add more.
- **Header menu links:** set once the Section contents are known (Will, 2026-10-05).
- **Project Sheet content per project:** which media and teaser each of the 11+ projects needs. Depends on Project Sheet design.

## Out of scope

- Full `content/INVENTORY.md` parity (1,429 items). Content is reused; old-site scaffolding is not. (Will, 2026-10-05)
- A standalone Experiments page. Chosen experiments join the Strip instead. (Will, 2026-10-05)
