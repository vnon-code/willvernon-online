# State — v3

**Goal:** willvernon.online v1 is live: Gate, Landing, Project Sheets, the Design / Music / AI deep-dives, About, Contact and a 404.
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
- Clicking the centre card opens the Project Sheet (`ProjectSheet.vue`, layout not designed yet).

## Placeholders still in the build
- Nav links go to `#` until pages exist.
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
Run the next frontier ticket on the map. **Site navigation** unblocks most of the remaining pages.
