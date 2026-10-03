# State — v3

**Goal:** rebuild willvernon.online from scratch, piece by piece, with Will approving every visual choice.

**Decisions (2026-10-02)**
- Fresh start on orphan branch `v3`. Kept only `public/`, `content/`, `content/INVENTORY.md` and the deploy files.
- Will disliked both the legacy site and redesign/v2: the look, the heavy motion, the page structure and the costly phase process.
- Colour and type are decided; see below and references/REFERENCES.md.
- **Stack decided (Will, 2026-10-03):** Nuxt (prerendered) + Three.js + GSAP/ScrollTrigger + Lenis + native Web Audio + plain CSS tokens. See docs/adr/0001-stack.md. It matches pacomepertant.com's stack.

**Open items**
- `v3` isn't pushed to GitHub yet.

**Reference collection** (`references/REFERENCES.md`): 12 keepers over rounds 1–2. Visual system decided (2026-10-03):
- Colour: near-black #0A0A0A, off-white #F2F2EF, Race red #E10600 (accents and large text only). Both themes.
- Type: Host Grotesk for everything, including the name WILL VERNON (Archivo dropped 2026-10-03); red on the line underneath.

**Landing concept, round 1 (Will, 2026-10-03)**
- Main job: show the work first.
- One carousel mixes design, AI and music projects. Separate non-project deep-dive pages for Design, Music and AI.
- Opening: an enter-with / enter-without-sound gate before the page.
- Sound on the landing: interactive stems, plus track switching and a volume control.
- Opening motion: Pacôme-style, built from per-project teaser videos. How the work is shown and moves is still open.
- Repeat visits: the full intro plays every time (Will: it stays short).

**Landing concept, round 2 (Will, 2026-10-03)**
- Carousel: horizontal strip driven by vertical scroll; the centred card plays its teaser and grows. Counter + title + category underneath.
- Stems: the visitor can toggle or control stems. Background visuals react to the audio; their colour and form are procedurally generated, influenced by the hovered project.
- No nav, or a transparent one. It should feel like an app, not a website.

**Landing concept, round 3 (Will, 2026-10-03)**
- Sound controls: floating HUD along the bottom edge — stem toggles, track name with prev/next, volume.
- Chrome: monogram top-left, menu button top-right (opens a full-screen index), filter chips (All / Design / Music / AI) for the strip.
- WILL VERNON + the red line live on the gate screen only, not on the landing (Will, 2026-10-03).
- Landing: filter chips sit directly above the project strip, both centred on screen.
- Variant B is now a full-screen point cloud of each project's image (Will: point clouds of 3D images, filling the screen at all times). Depth is faked from brightness for now.
- DREAM slider next to the stems: more reverb, delay, low-pass and a slight slow-down (Will's ask: dreamy, cinematic, ambient). The visuals slow and soften with it.
- Variant C (mixed): one point cloud for all projects. "Gradient" projects feed the live field into it, laid flat with large points, so moving between cloud and gradient is one morph. Points sit at real depth; the camera drifts along a slow loop with mouse parallax and scroll dolly. Which projects are gradient is a placeholder: Amplified Spaces and Silver Linings.
- Depth maps: Depth Anything V2 Small only (Apache-2.0; Base/Large are CC-BY-NC). Prototype maps go in `prototype/depth/<image name>.png`, white = near. Will's Blender exports can replace them later for hero projects. The 4 maps for Will's picks are generated (Python venv in the session scratchpad; ComfyUI wasn't running). The Amplified Spaces map is weak: a flat dish with no real shape.
- Point-cloud images, picked by Will (2026-10-03) from the teaser-video stills in `public/img/posters/`: Smuggler's Outpost `assets-vidsmugglersoutpost-1`, Amplified Spaces `video-trailers-b17av2-1`, Monolithic Survival `ai-monolith-preview-v2`, Topographic AV `renders-cinematic-trailer-upscaled`. Silver Linings has no image, so it's always a gradient. Claude's earlier picks were rejected: poor, and some came from the wrong project.
- R2 serves `Access-Control-Allow-Origin: *`, so full-res R2 images and teaser videos can feed WebGL directly.
- **Background decided (Will, 2026-10-03): variant C, mixed.** Will is happy with the prototype. A (field only) and B (cloud only) are dropped.
- Top-left uses Will's real logo, `public/img/monogram-white-trans.png`.
- To check: which projects have a teaser video. Only ai_trailer, experiments_trailer, fading_away, Dredge and monolith previews are named so far.

**Prototype status:** saved on local branch `prototype/landing-bg` (not pushed; `git checkout prototype/landing-bg` to view). `prototype/landing-bg.html` is approved as the reference for the landing, with `prototype/pick-images.html` and `prototype/depth/`. It defaults to C with the switcher hidden; `?variant=A|B|C` brings the switcher back. Serve it with the "prototype" config in `../.claude/launch.json` (python http.server on :5173). It is throwaway code: rebuild it properly, don't promote it.

**Nuxt scaffold (2026-10-03, done, not committed):** Nuxt 4.5.2 + pnpm 12.8.1 (pinned via `packageManager`). Astro leftovers deleted. Tokens in `app/assets/css/tokens.css`; fonts self-hosted via `@fontsource-variable/host-grotesk`. `pnpm generate` → `.output/public`, and wrangler points there with a pnpm build command. Dev server: the "site" config in `../.claude/launch.json` (:3000). `app/app.vue` is a labelled placeholder.
- PLACEHOLDER: dark by default, light follows the OS. Not yet decided with Will.
- **Open, blocks deploy:** the CSP in `public/_headers` only allows the old Astro inline-script hash. Nuxt emits two inline scripts (importmap and `window.__NUXT__` config, whose buildId changes every build), so the deployed site would be blocked. Needs a decision: per-build hash generation, or moving the config out of inline. The `/_nuxt/*` immutable cache rule is updated.
- Cloudflare Workers Builds with pnpm 12 is untested.

**Gate (Will, 2026-10-03): spec signed off** → `docs/specs/gate.md`. Centred stack, logo-fill + % loader (counts stems too), "Design · Music · AI" tagline, primary/quiet buttons, follows OS theme. Preview: `prototype/gate-layouts.html` (untracked, throwaway). Terms in `GLOSSARY.md`.

**Gate built (2026-10-03, not committed, awaiting Will's browser check):** `app/components/TheGate.vue`, `app/composables/useLoader.ts` (real byte progress), `app/composables/useSound.ts` (Web Audio stems, decoded during load, context unlocked in the click). Copy in `content/gate.json`. First project's depth map copied to `public/img/depth/`.
- PLACEHOLDER: the Landing behind the Gate is the Smuggler's Outpost still, fading up, until the point cloud is built.
- Not built yet (no consumer exists): the synthetic pulse for no-sound visuals, and the Sound HUD's unmute button (`useSound().enableSound()` is ready for it).

**Gate revised (Will, 2026-10-03):** Pacôme-style entrance, concept A · Dot bloom (seed dot → dot-matrix ripple → logo loader → name rises → choices). The name moves to Host Grotesk Medium; Archivo is removed from the project. Tagline uppercase. Dot matrix as prototyped (18px, 12%). Spec updated; prototype `prototype/gate-entrance.html` (throwaway). Built in `TheGate.vue` + `GateDots.vue`.

**Gate rebuilt to the intro spec (2026-10-03, not committed):** goal: port `prototype/gate-intro.html` (defaults) into Nuxt per `docs/specs/gate.md`.
- `TheGate.vue`: seed dot → WILL VERNON as glyph outlines (`app/assets/gate-glyphs.json`, Host Grotesk 600, OFL) → squeeze → flubber morph (`flubber@0.4.2`, pinned, loaded client-side) → mark → name/word unfold → primary slot. Rotating word (Roll) from `content/gate.json` `words`. Tagline, counter and PNG mask loader removed.
- **Loader in the primary button (Will's pick):** at 4.2s, if not loaded, the slot is a progress bar: outline traces the perimeter by progress (eased, never backwards), small muted %. At 100% the outline retracts to the corner brackets, % rolls out, label rolls in, then the button goes live and takes focus; the quiet link fades up. Cached visit: the finished button shows directly. No early-click path any more.
- `GateDots.vue`: logo void (viewport-high monogram, centred on the mark) with an outward clearing wave timed with the morph; draws until 3.8s, then only on resize/theme change. Shared timeline + polygon in `app/utils/gate.ts`.
- Decisions not in the spec: the mark is solid (the prototype's fake-progress fill dropped); `--ease-out-expo` token added for the button hover; % is 11px/500.
- Verified in the browser pane (dev): no console errors, mark at exact viewport centre (portrait and 1280×720), void holes present, word rotates, both buttons enter, light mode follows the OS. The loading path was exercised by driving component state (local loading always finished before 4.2s), not with a real slow network. Reduced motion not observed (the pane can't emulate it).
- **Dot-matrix mouse interaction built (2026-10-03, not committed):** spotlight, lens, repel and click ripples per spec in `GateDots.vue` (constants in `GATE_MOUSE`, `app/utils/gate.ts`); after the intro a rAF loop runs only while the cursor, influence, springs or rings are still moving, then idles and wakes on pointermove/pointerdown (so `GateDots` no longer "only redraws on resize/theme" after 3.8s). Checked in the dev pane with synthetic mouse events; a real mouse and reduced motion not yet observed.
- **Dot-matrix entrance replaced (Will, 2026-10-03, not committed):** seed dot removed (black until the name rises); no bloom or void wave. At 3.5s (T.swap) the dots outside the void slide in as five pieces (l/r from the sides, tl/tr from the top, b from the bottom), all at once over 2400ms (slower than the prototype's 1600), cubic-bezier(0.77, 0, 0.175, 1); tune in `GATE_DOTS`, `app/utils/gate.ts`. Reduced motion: 200ms fade at 3.5s.
- Pre-existing type error (not from this work): `useLoader.ts` line 63, `new Blob(chunks)` with `Uint8Array<ArrayBufferLike>[]`. No type checker is installed (`nuxi typecheck` needs vue-tsc).

- **Committed to `v3` (2026-10-03).** Throwaway gate prototypes in `prototype/` stay untracked.

**Open items (gate):**
- Check the button loader on a slow connection (DevTools "Slow 4G"); reduced motion not yet seen.
- Portrait void: keep cropping at the sides (notches only), or turn it off.
- The first 0.65s is plain black since the seed dot went; start the name earlier?
- Slide speed: 2400ms, tune in `GATE_DOTS` if Will wants it slower.

**Next step:** the Sound HUD (dkton Leistungen-style faders), in a fresh session.
