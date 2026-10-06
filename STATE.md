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

## Next
Will listens to the new scroll-page sounds (enter with sound: Learn More, scroll a Section, scroll home) and verifies the shell, then commits it. Next on the map: **Project Sheet rework**, or a Section ticket. Open question: Design and Tools aren't Sections any more; decide what happens to the Tools Section ticket (17). The round-1 morph variants are on local branch `prototype/scroll-shell-morph-abc`.
