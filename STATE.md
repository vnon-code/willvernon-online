# State — v3

**Goal:** willvernon.online v1 is live: the Gate, then one scrolling page (Landing on top, Sections below), Project Sheets at `/work/<slug>`, and a 404.
**Plan:** `.scratch/v1-launch/MAP.md` (wayfinder map, local only). Each session works one ticket, time-boxed to that session.
**History:** every round from 2026-10-02 to 10-05 is in `docs/history/state-2026-10-02_to_05.md`. Look there for why a value is what it is.

## Locked (built on `v3`, pushed 2026-10-05)
- Stack: Nuxt 4 prerendered, Three.js, GSAP + Lenis, Web Audio, CSS tokens (`docs/adr/0001-stack.md`).
- Look: #0A0A0A / #F2F2EF / Race red #E10600 (accents only); Host Grotesk throughout; lit `--edges` borders.
- Gate: name-to-monogram intro, loader inside the primary button (`docs/specs/gate.md`).
- Landing background: dot field. The palette comes from the centred teaser. Each step plays a 3s colour wash with the Breath Bright band. A soft clear sits under UI (`docs/specs/landing-background.md`).
- Project Strip: ring seen from inside, centre card 16:9 and grown, steps every 10s, mono sides, Fit/Peek/Sweep; chips All / Project / Experiment; 11 projects in `content/strip.json`.
- Info row under the centre card: tag plate | name plate | tool tiles, 36px, Hug motion.
- Drawers: Visuals bottom left, Music (Sound HUD) bottom right, 420ms iOS curve with a band cascade.
- Header: monogram, icon (burger) nav, mute button. Mute covers music and UI sounds; VOL covers music only.
- UI sounds: the Tactile palette via `useSound.sfx`.
- Clicking the centre card opens the Project Sheet (`ProjectSheet.vue`; full rework ticketed).
- Navigation (2026-10-05/06, `docs/adr/0002-one-scrolling-page.md`): one page, built (Scroll page shell, uncommitted). The Landing is scroll-locked on top; Learn More (bottom centre) scrolls the whole Landing up to the Sections: About me, Music, AI, Contact, on a solid panel with the dots scrolling in the margins. On the way the header docks early (links inline, solid background fading in with the scroll over the last 240px). The Landing falls behind at 0.6×, shrinking up to 8%, its side cards parting out of the margins; the filter and info plates tuck behind the centre card. Scrolling back up is free, then the last 120px glides home; the plates deal back out from the card and Learn More rises. Rounds 5–7 scored in `.scratch/v1-launch/scroll-back-matrix.md`. No glass. `/<section>` and `/work/<slug>` URLs, Gate first on deep links, all paths prerendered. Logic: `useScrollPage.ts`.

## Placeholders still in the build
- Section contents are placeholders (real titles only); the Learn More look, the scroll timings (1.2s down and home, 0.45s glide), the depth factors, the plate timings and the 5px monogram inset.
- Scroll-page sounds (`depart`, `arrive` as tactile tick runs, `deal`; no section ticks, no hover on Learn More or the filter chips) and the monogram/link clicks: built, not yet heard by Will.
- Music/UI balance (`MUSIC_TRIM`, `UI_GAIN`), VOL rise 3s, tag weight 600, tool hover caption gap/timing.
- Theme: dark by default, light follows the OS; never reviewed in light.

## Known issues (ticket: Landing polish pass)
- 640–1000px: the centre card is narrower than the info row, so the name sits off-centre.
- Phones: the HUD band labels truncate (MELOD, VOCAL). At 375px the open nav pill touches the logo.
- The specs for project-strip, sound-hud and landing-background still describe pre-/proto values.
- Never observed: sounds by Will's ear, reduced motion, light theme, a low-end GPU.

## Deploy blockers
- CSP vs Nuxt inline scripts: decided (post-build hash step), not built. Ticket: Hash inline scripts at build.
- Cloudflare Workers Builds with pnpm 12 is untested.

## Project Sheets (ticket 08, branch `overnight/project-sheets`, 2026-10-06/07)
- Every project has a winning Sheet body (default in `app/components/sheets/<slug>/meta.json`): Smuggler's SF, Monolith MB, Amplified Spaces T2b, Topography TB, World Plays Here WE, Dredge DA, Remnants RD, Handheld HD, Synthetic Corals CD, Marimekko MkD, Powersurge PwB. Cargo 5015 (Ko) is a curated page behind `?proto`.
- Shared on every Sheet (Will): title, info rail, contents, "03 / 05" numbering, credits (`app/components/sheets/_shared/`). Bodies vary per project.
- Copy rule (Will): minimal, brutalist, through `no-ai-slop`. All Sheet copy is PLACEHOLDER until Will approves.
- Media is local only (`public/proto-media/`, gitignored); each project's `UPLOAD.md` lists what goes to R2.
- Tools: scorer `.scratch/v1-launch/overnight/tools/score.cjs`, rules `.scratch/v1-launch/overnight/BRIEF.md` + `TOOLS.md`, per-project `matrix.md` and `SUMMARY.md`.
- Review page (private): https://claude.ai/artifact/ETpgD1mB3qLj6AgToH8EdD
- Favicon is now the monogram (commit 4c59dc5).

## Next
1. Will reviews the Sheets live (`corepack pnpm dev`, open each card) with the review page: approve copy, decisions, R2 uploads.
2. Decide on scrubbing the PC address and employer name from the branch's git history (needs a force push).
3. Then fold the winners into the real code (karpathy-loop "Final pick": delete losers, the options panel and PROTOTYPE markers) and merge into `v3`.
Still open from before: Will hasn't heard the scroll-page sounds; the Tools Section ticket (17) question.
