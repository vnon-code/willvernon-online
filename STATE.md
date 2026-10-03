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

**Sound HUD, round 1 (Will, 2026-10-03)**
- Faders are dkton-style **vertical bands**, one per stem; the track card with album art sits underneath.
- Drag sets a stem's volume (0 = off); a click toggles it off/on. Subtle synthesised UI sounds (grab, detent tick, release).
- No track switching yet: Silver Linings only, until more tracks have stems.
- Layout preview: `prototype/sound-hud.html` (throwaway, untracked), `?v=A|B|C` (A Console centred, B Edge strip full width, C Corner tower bottom-right). Real stems, DREAM and volume work.
- **Layout locked: A · Console** (Will, 2026-10-03). B and C are dropped.
- **Bass band = low-pass cutoff** (Will): exponential 30 Hz–8 kHz, readout in Hz, 0 cuts the stem completely. The other stems stay volume. Range is Claude's pick (placeholder until Will has listened).

- Will approved the prototype by ear (2026-10-03). **Spec signed off:** `docs/specs/sound-hud.md`. No mute button (VOL at 0 is mute; entering without sound starts VOL at off, a click on VOL starts the music). The track card's right end is reserved for prev/next. Entrance: panel fades in, then the fills rise one by one (60ms stagger).

**Sound HUD built (2026-10-03, not committed):** `app/components/TheSoundHud.vue` + `SoundBand.vue`; `useSound.ts` rewritten (per-stem gain, bass low-pass, DREAM chain, master = VOL, meters, UI blips; `mute`/`soundOn` removed, no other consumers). Mounted in `app.vue` 1s after the Landing starts fading up.
- Verified in the dev pane: both Gate paths, meters live, VOL click starts the music, BASS drag + Hz readout, no console errors; `pnpm generate` passes. Not observed: the entrance stagger by eye, audio by ear, reduced motion, light theme.

- **Entrance revised (Will, 2026-10-03):** the first version popped in (opacity set in the mount frame, so no transition). Will picked "Build" from `prototype/hud-entrance.html` (throwaway, uses Motion from a CDN): glass fades, bands grow up 60ms apart, fills follow, track card last (~1.7s). Built as CSS keyframes in `TheSoundHud.vue`; fills now ease on expo. Sampled mid-animation in the dev pane: sequence and end levels correct.

- **Music fade tied to the entrance (Will, 2026-10-03):** on the sound path the music now starts when the HUD appears and fades from silence to VOL 80% over the entrance (1.67s), not 1s from the Gate click. `TheSoundHud` takes a `withSound` prop and calls `enableSound(entrance)`. Master gain sampled in the dev pane: 0 → 0.31 at 0.8s → 0.64 at 1.7s.

- **Starting mix + VOL rise (Will, 2026-10-03), replaces the fade above:** drums off, bass cutoff 100 Hz, DREAM 50%, others 80% (`STEM_DEFAULTS` in `useSound.ts`). On the sound path VOL sits at 0 through the entrance, then the fader and music rise to 80% over 3s ease-in-out (PLACEHOLDER duration; `VOL_RISE_MS` in `TheSoundHud.vue`); touching VOL stops the rise. `enableSound` and the fade option on `setVolume` are gone. Sampled in the dev pane: gain 0 until 1.7s, 0.35 at 3.5s, 0.64 at 4.7s.

- **Committed to `v3` (2026-10-03).** HUD prototypes (`prototype/sound-hud.html`, `prototype/hud-entrance.html`) stay untracked.

**Open items (Sound HUD):** VOL rise duration (3s placeholder); reduced motion and light theme not yet seen; the VOL readout shows "0" for a frame as the rise starts.

**Project strip, round 1 (Will, 2026-10-03)**
- Music tracks are out of the strip (music lives in the Sound HUD).
- Strip holds 11 projects, picked by Will: Amplified Spaces, Handheld Stories, Remnants, Powersurge, Marimekko Exhibition, Smuggler's Outpost, The World Plays Here, DREDGE, Monolith Survival, Synthetic Corals, Topography AV Test.
- Clicking the centred card does nothing yet (labelled placeholder) until project pages exist.
- Filter chips: All / Project / Experiment (Will). Open: whether DREDGE, Monolith Survival and Synthetic Corals sit under Project or Experiment (preview puts them under Project).
- Order: "strongest first, mixed" (Will); Claude's proposed order is in the preview, awaiting Will's edits.
- Round 1 variants (filmstrip, depth, slivers) not picked. **Will's brief:** more creative, curved paths, endless loop, subtle auto-rotation.
- Round 2 preview `prototype/project-strip.html` (throwaway, untracked): `?v=arc|ring|wave|tunnel|slivers&auto=drift|step|off`. Auto resumes 3s after the last input and pauses while hovering the centre card. Drift speed 1 card/7s and step rest 5s are placeholders.

- **Round 2 picks (Will):** Ring liked, but its back layer popped forward; Tunnel and Wave rejected (odd paths). Auto = **Drift**. DREDGE, Monolith Survival and Synthetic Corals sit under **Experiment** (Project 7, Experiment 4).
- Round 3 preview (same file, default `?v=ring&auto=drift`): ring cards are projected by hand and stacked strictly by depth, since CSS preserve-3d's plane sorting caused the pop. Back half ghosted (16% → full through the sides). New options: `ringhigh` (steeper view), `orbit` (flat cards, merry-go-round from above), `inside` (camera inside the ring). Arc and slivers kept. Orbit crowds the chips at 800px-tall viewports.

- Side-card treatment switch added (Will's ask): `&sides=depth|none|dark|mono|monodark|red|blur`, eased by distance from centre.
- Added `insidebig` (Will's ask): the Inside wall, but the centre card grows 1.6× and pushes its neighbours out.

- **Strip decided (Will, 2026-10-03):** layout **Inside, big centre** (`insidebig`: camera inside the ring, centre card 1.6×, neighbours pushed out), auto **Step with a 10s rest** (replaces Drift), side cards **mono** (black and white, full brightness, colour eases back in towards the centre). Preview defaults now match.

**Spec signed off (Will, 2026-10-03):** `docs/specs/project-strip.md`, placeholders as listed.

**Project strip built (2026-10-03):** `app/components/TheProjectStrip.vue`, list in `content/strip.json` (`from` + `id` point into projects/ai/experiments JSON; titles resolved at prerender via `useAsyncData`, so the 250 KB content JSON stays out of the client bundle). Mounted in `app.vue` inside the Landing, `active` once the Gate closes (wheel and auto ignored before that).
- Frame loop runs only while moving or dragging; auto-step is a timer, not the loop. Wheel is window-wide; drag starts on the strip only (so HUD faders don't turn it); arrow keys only when the strip has focus (the HUD bands use arrows too).
- Verified in the dev pane at 1280×800: wheel, drag, keys, side-card click, wrap 01→11, chips (All 11 / Project 7 / Experiment 4), auto-step, one video at a time, Powersurge GIF swap, no console errors; `pnpm generate` passes. Not observed: real mouse/trackpad feel, reduced motion, light theme, phones.
- **Caption vs HUD (Will, 2026-10-03): centre above the HUD.** The stack now fills the space above `--hud-clear` (213px token = HUD 197px + 16px). The strip area squeezes from 2× card height down to (never below) the 1.6× centre card + 16px to fit.
- **Committed to `v3` (2026-10-03).** `prototype/project-strip.html` stays untracked.

**Strip open items resolved (2026-10-03, not committed):** Will asked Claude to try every option in `prototype/strip-open.html` (throwaway, untracked), score them and build the best. Spec updated.
- Short screens: **Fit**. Scored against Squeeze (0px air at both ends at 1280×700) and Overlay (4px air at the top, caption covers the bottom 78px of the teaser). Fit keeps 24px both ends; the centre card shrinks only when it has to (1280×700: 468px wide; 1280×800: 645px).
- Phones (<640px): **Peek**. Scored against Full (343px card, no hint of more cards) and Ring (263px card, curled sides). Peek: 281px card plus 28px of each neighbour at 390×844.
- Filter change: **Sweep** (out 220ms while turning, in 380ms spinning from 2.2 cards right). Scored against Fade (safe, no character), Fold (scaleX squashes the 3D cards) and Cut. The caption jumps straight to the new first card instead of counting through.
- Card order: current mixed order approved by Will.
- Verified in the dev pane at 1280×700, 1280×800 and 390×844, plus a sweep with caption sampling; `pnpm generate` passes.
- Separately noticed: at 390px the Sound HUD's band labels are cut off (MELOD, VOCAL).

**Point cloud, round 1 (Will, 2026-10-03)**
- The 7 strip projects without a pick use their strip poster. Depth maps for all 11 are in `public/img/depth/` (Depth Anything V2 Small; std 0.145–0.357).
- Dolly moves with the strip: each turn pushes the camera in, then it settles back.
- No gradient-only projects. Flat depth maps (std < 0.15, so only Amplified Spaces) get faked depth: brightness plus a soft dome.
- Gradient colours are sampled from each image (3-colour k-means).
- DREAM melts the cloud into the gradient field as it rises.
- Will wants it more creative. All four ideas are in the preview `prototype/point-cloud.html` (throwaway, untracked), as toggles + `?teaser&cursor&stems&trans=scatter|scan|dust|fold`: live teaser colour, cursor parts the cloud, stems shape the cloud, and transition styles. Awaiting Will's picks.
- Found: the strip's `<video>` loads teasers without CORS, and the browser then reuses that cached copy, which blocks the WebGL use. The build needs `crossorigin="anonymous"` on the strip's videos (the preview cache-busts with `?cors`).
- Topography AV's cloud image (Will's pick) isn't from its teaser, so it gets no live teaser colour. Corals and Powersurge (GIF) have none either.

**Round 3 (Will, 2026-10-03): audio reactivity dropped**; all its code is removed from the preview (the record below stays for reference). The DREAM gradient was "a mush of monochrome": its colours were a 3-colour k-means average. Fixed: DREAM now melts the project's own image (averaged down to 32px wide, domain-warped along a slow flow, saturation ×1.5), and the points stay opaque. Checked: Monolith's red goggles stay red, Smuggler's stays amber.
- New ideas, all in the preview: **card burst** (`trans=card`: the old cloud gathers into the centre card's rectangle showing the new image, then bursts out, 2.4s; the card rectangle is hard-coded for 1280×800), **focus pull** (depth of field on the subject: mean depth of the frame's middle third; a spring racks to it on each turn), **grab to orbit** (drag the background, ±0.9 rad yaw / ±0.45 pitch around a pivot at depth 2.2, springs back), **LiDAR sweep** (every 12s, 2.6s top to bottom; L key triggers one). Toggles in the panel; `?focus&orbit&lidar=0|1`. All four checked by screenshot; orbit also with a real drag. Awaiting Will's picks.

**Audio reaction, round 2 (Will, 2026-10-03: "subtle but visible", verified, later dropped):** "Stems shape the cloud" became an Audio mode switch in the same preview (`?react=off|stems|breath|ripple|spectrum|glow&amt=0..2`), with live meters in the panel. Drivers are auto-levelled: stems and the mix by level ÷ slowly falling peak, the spectrum bands by deviation above their 1.5s average.
- Verification method: `__pc.test(mode)` measures frame-to-frame pixel change with all stems playing vs all muted (volume 0, teaser and cursor off), plus the correlation with each driver. `__pc.solo()` plays one stem at a time in stems mode.
- Results (music ÷ muted, final tuning): off 0.75–0.89 (control, as intended); stems 2.6–2.8; ripple 2.1 (tracks ripples, r .48); spectrum 2.0–2.2 (tracks band changes, r .86–.93); glow 1.5–1.9 (tracks bass, r .49–.51); breath 1.0–1.2 per frame but tracks bass changes at r .94–.95, since it's slow motion and the frame-diff metric undercounts it.
- Fixed during testing: the first auto-levelling saturated every band at ~1; melody's twist was ~25× the muted baseline (now 0.70 vs ~0.5); vocals and bass were invisible; ripples never fired (hit strength read before the hit registered); ripples limited to strong hits, ≥0.3s apart.
- The drum detector fires ~3.5/s (hats and snares too), so stems-mode drum bands are frequent. Not yet judged by eye or ear by Will.
- **"Looks delayed" (Will) → diagnosed and fixed.** `__pc.lag(mode)` cross-correlates raw drum onsets with the picture-change onsets. Ripple was 354ms late: rings started as a dot at the centre, so the change peaked only once they had spread. Stems and spectrum were already 0ms. Fix: rings start a third of the way out; strong hits (≥60% of recent peak) also give the whole cloud an instant ~70ms kick, with the ring or depth band as afterglow. Now 0ms in all runs (ripple ×5, stems ×4). Ratios after the fix: stems 2.7×, ripple 2.3–3.4×; kick spikes peak 10–15 (were ~6). The pane reports 40ms audio output latency, so the picture runs slightly ahead of the sound, not behind. Not checked: Will's own audio device (Bluetooth adds 150–250ms more lead).

## Background directions, round 4 (no point cloud; live teaser colour kept) — 2026-10-03
Will asked for "something completely different" and picked all four to try. Preview: `prototype/backgrounds.html`
(throwaway, untracked). Switch with the panel, 1–4 keys or `?mode=dots|liquid|slit|threads`; wheel/← → turns the strip stand-in.
- **Dots**: the Gate's dot grid (12px cells), dot size from the teaser's brightness, colour from the teaser. Monolith reads clearly as a halftone; DREAM melts the dots into smooth colour.
- **Liquid**: the 1/32-scale teaser, domain-warped with fbm and saturated. Smuggler's amber turns to flowing smoke.
- **Slit-scan**: a 64-frame history at 15 fps (~4.3 s) in an 8×8 atlas; a triangle wave picks each column's delay. Weakest of the four: on slow teasers (Monolith) or title cards (World Plays Here) it looks like a soft copy of the video behind the card.
- **Threads**: 24k CPU particles on a sine flow field, coloured by the teaser, with trails in an accumulation buffer. The fade is per second plus a 1/255 subtract per frame, so 144 Hz doesn't leave a haze. Strongest result on Monolith (red visor in white streams).
- Verified at 1280×800: all four render, teaser "live", ~144 fps on this machine, no GL errors. Not checked: phones, light theme, low-end GPU cost of Threads' CPU loop.
- Next: Will picks a direction, or a combination (e.g. Threads with Liquid under DREAM).
- **Round 4b (Will): the teaser sets the PALETTE only, never shapes.** Every 150 ms the 1/32 frame is read back and reduced to 5 stops: 4 luminance quartiles (saturation-weighted) plus the most saturated 15% as an accent. The stops ease over ~0.3 s. One shared fbm field draws every shape. Slit-scan was replaced by **Contours** (topo lines of the field), since slit-scan only works by showing the image. Verified: Monolith → red/black/white in all four modes with no teaser shapes; DREDGE → grey (its teaser is near-monochrome).
- **Round 4c (Will): Dots is the pick.** Liquid, Contours and Threads were deleted from `prototype/backgrounds.html`; it is now Dots only, with 11 sliders: grid, smallest/largest dot, square↔round, zoom, warp, speed, contrast, saturation, brightness, palette ease. Values live in the URL hash; "Copy values" copies them. Defaults match the round-4b look. Next: Will tunes the sliders and sends the values back; those become the build defaults.
- **Round 4d: presets** on the panel: Gate (defaults), Halftone, Mosaic, Grain, Lava, Atlas, Will (Will's own slider session, read from the URL hash), Tide. All 8 checked on Monolith at 1280×800. DREAM in this prototype does two things only: it slows the motion (to 40% at full) and from 0.15 up it melts the dots into the smooth field underneath (90% at full). The palette is unchanged. The Web Audio DREAM chain is not in this file.
- **Round 4e (Will): DREAM is a preset.** The Dream slider eases (smoothstep) every slider value from the current settings to `DREAM` = {cell 22, smallest .22, largest .72, zoom .6, warp 3.4, speed .25, ease 2.5}. The old melt-into-field and the separate slow-down were removed. Sliders cut to 7: the shape is fixed round, contrast .3 (Will's value), saturation 1.2. Brightness was replaced by a per-project auto-level: each palette is scaled so its lightest stop sits at ~0.85 luminance (×0.7–2.2), which lifts DREDGE out of near-black and stops Monolith's white clipping. The Mosaic preset was dropped because squares were its whole look. Verified on Monolith at Dream 0 / .5 / 1 and on DREDGE.
- **Round 4f (Will's screenshots): new defaults = the dream-off look**: grid 6, smallest .08, largest .46, zoom 3.9, warp 2.15, speed 2.35, ease .35. The preset "Gate" was renamed "Default". DREAM now moves only zoom → .85, warp → 3.35, speed → .55, ease → .35; grid and dot sizes stay put. Verified on Smuggler's at Dream 0 and 1.
- **Round 4g (Will):** zoom now scales about the screen centre (field coords are relative to `uRes/2`). The Dream slider runs through `cubic-bezier(.65,0,.35,1)`: 25% of the slider = 7% change, 50% = 50%, 75% = 93%. Zoom blends in log space so each step zooms by the same ratio. The browser pane cached the old file once; reload with `?v=N` if a change doesn't show.
- **LOCKED 2026-10-04:** Will signed off the dot background. Spec: `docs/specs/landing-background.md`. References in the Gate, Sound HUD and Project strip specs now point to it instead of "the point cloud". DREAM now starts at 0 (Will): changed in `app/composables/useSound.ts` and the Sound HUD spec.
