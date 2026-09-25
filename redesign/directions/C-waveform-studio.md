# Direction C — Waveform Studio

## Concept
Sound is the organising motif for every discipline, not just `/music`: a transport bar frames navigation, waveform
dividers replace section rules, and telemetry ticks pulse to BPM instead of a generic clock. 3D and AI work get read
as *signal* — something recorded, mixed and played back — so the whole site behaves like one long track with seven
chapters. Draws on **raviklaassens.com** (corner-pinned HUD framing a quiet centre, red used only as signal) for the
telemetry corners; the **Epidemic Sound / Music-app-track-view** Mobbin pattern (full-width waveform scrubber, BPM/key
as telemetry tags) for the sitewide transport bar; and **Waka Waka**'s numbered index rows (N°0001, metadata columns,
live readout) for how Projects/Work list case studies.

## Type pairing
- Display/body: **Bricolage Grotesque** (Google Fonts, OFL-1.1, variable 200–800), self-hosted as a static `.woff2` subset.
- Mono: **JetBrains Mono** (Google Fonts, OFL-1.1, weights 400/500/700), self-hosted, replacing Space Mono to give the HUD readouts a sharper technical face.
- Scale (fluid, `rem`/`clamp()`, viewport-width based on a 1440/390 pair):
  - `--font-display`: `clamp(3.5rem, 1.8rem + 9.5vw, 11rem)` → ~66px @390, ~166px @1440. Tracking `-0.02em`, leading `0.92`.
  - `--font-h1`: `clamp(2.5rem, 1.6rem + 4vw, 5rem)`. Tracking `-0.01em`, leading `1.0`.
  - `--font-h2`: `clamp(1.75rem, 1.3rem + 2.2vw, 3rem)`. Tracking `-0.005em`, leading `1.05`.
  - `--font-h3`: `clamp(1.25rem, 1.05rem + 0.9vw, 1.75rem)`. Tracking `0`, leading `1.15`.
  - `--font-body`: `clamp(0.9375rem, 0.9rem + 0.15vw, 1rem)` (15–16px). Tracking `0.01em`, leading `1.6`.
  - `--font-small`: `0.8125rem` (13px, fixed). Tracking `0.06em`, uppercase, leading `1.4`.
  - `--font-mono-caption`: `0.75rem` (12px, fixed), JetBrains Mono 500. Tracking `0.08em`, leading `1.3`.
  - Ratio check: display/body = 166/16 = **10.4x** @1440, 66/15 = **4.4x** @390 — both clear the ≥10x / ≥4 bar.

## Colour tokens
All ratios computed against `--bg` (WCAG relative-luminance formula).
| Token | Hex | Role | Contrast vs bg |
|---|---|---|---|
| `--bg` | `#050505` | page background | — |
| `--surface` | `#0d0d0d` | cards, panels | — |
| `--surface-2` | `#151515` | raised panels (mixer, HUD tiles) | — |
| `--line` | `#262626` | hairlines, grid, waveform baseline | — |
| `--text` | `#e8e8e6` | body/headings | **16.6:1** |
| `--text-muted` | `#9a9a97` | meta, captions, secondary copy | **7.2:1** |
| `--accent` | `#ff4433` | signal red — live/active/telemetry only | **5.95:1** |
| `--accent-2` | `#ffb020` | amber — VU/level-warning, buffering, "recording" state | **11.1:1** |
| signal-dim | `#7a3c33` | accent at rest / disabled channel (decorative only, never text) | n/a |
Both `--text-muted` and `--accent` clear 4.5:1 with margin (fixing the audit's 4.33 and 4.12 fails). `--accent-2` stays
in the warm family (ember, not a new hue) so the "red is the only chroma" rule still reads true at a glance; it is
capped at ≤2% of any first screen's pixels, same budget as `--accent`.

## Grid
- 1440: 12 columns, 24px gutter, 64px margins, `max-width: 1440px` (hero/canvas sections bleed full-width outside it).
- 768: 8 columns, 20px gutter, 40px margins.
- 390: 4 columns, 16px gutter, 20px margins.
- Spacing scale (baseline 8px, `--space-1`…`--space-9`): 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128px.

## Motion language
- Eases: `hud.out = cubic-bezier(0.16, 1, 0.3, 1)` (entrances/CTAs), `hud.inOut = cubic-bezier(0.65, 0, 0.35, 1)` (on-screen moves, pinning), `hud.snap = cubic-bezier(0.4, 0, 0.2, 1)` (scramble/glitch resolve). No stray `ease:` literals.
- Durations: `--dur-xs: 200ms` (feedback, scramble resolve), `--dur-sm: 400ms` (UI transitions, hover reveals), `--dur-md: 800ms` (section/case-study reveals), `--dur-lg: 1200ms` (hero entrance, page transition).
- Stagger: `40ms` (process-step rows, mixer channels), `60ms` (project-index rows), `90ms` (SplitText word reveal on hero/case-study intros).
- GSAP primitives: **SplitText** for the hero wordmark and case-study intro lines; **ScrambleText** on nav links, telemetry values, and hover states (shared module, not per-page copies — fixes the audit's 382KB duplication); **ScrollTrigger** for waveform-divider scrub reveals and BPM-synced pulses (no forced snap); **ScrollSmoother** desktop-only (≥1024px), off on touch and under reduced motion; **Flip** for the mixer track expand/collapse and the project-row → case-study media handoff (paired with `view-transition-name`).
- Reduced motion (`gsap.matchMedia` + `prefers-reduced-motion`): ScrollSmoother off entirely; SplitText skips stagger, fades as one block at `--dur-xs`; ScrambleText snaps straight to final text, 0ms; Flip becomes a plain opacity crossfade at `--dur-xs`; ScrollTrigger pins are dropped, scrub becomes fade-on-view.

## Signature effects, reinterpreted
- **Text scramble** — trigger: nav hover/focus and telemetry value ticks; when a stem is armed, the glyph-swap interval locks to `60000 / bpm` ms instead of a fixed rate, so the flicker itself is BPM-synced. Resolves in ≤600ms always. Reduced motion: instant final text, no interval.
- **Glitch** — one-shot, 220ms, 3–4 keyframe brightness/skew jitter (no chroma split — stays inside the red/amber family). Trigger: case-study hero media entrance, "download stem" click. Reduced motion: plain crossfade.
- **Telemetry/HUD readouts** — corner-pinned (top-left clock, bottom-left scroll %/section id, bottom-right — new — live transport time, BPM, key when a track is armed). Updates throttled to 4/sec via rAF, not scrambled on every tick (perf). Reduced motion: values still update as plain text swaps.
- **Audio-reactive visuals** — existing 2D-canvas pattern (AnalyserNode → particle/bar amplitude) extended to drive the transport bar's waveform-bar heights anywhere a stem is armed. Trigger: explicit opt-in play tap. Paused via IntersectionObserver + `visibilitychange`. Reduced motion: bars freeze to a static waveform silhouette; audio itself stays playable.

## Signature WebGL moment
A generative point-cloud in the index hero, built from the real decoded sample buffer of a vnon stem (2048–4096 points
mapped to particle positions). At rest: slow simplex-noise drift, reading as "signal idle." On opt-in tap: bass energy
drives particle spread/scale, highs drive flicker/brightness — additive-blended sprites so overlaps read as heat
within the red/amber palette, never a new hue. **Library: OGL** (~8KB core, single point-cloud shader pass) over
three.js (~150KB+) — no scene graph or loaders needed for one pass. Perf budget: lazy-init via
`requestIdleCallback` (200ms `setTimeout` fallback) only once LCP has fired and the hero is in-viewport; `dpr = min(devicePixelRatio, 1.5)`; particle count 2200 desktop / disabled below 768px width entirely; pauses via IntersectionObserver; killed outright under `prefers-reduced-motion` or no-WebGL. Fallback: a single pre-rendered still of the particle field at rest (WebP, ~80KB) sits behind the hero text on mobile, reduced-motion, and WebGL-unavailable paths — no canvas mounts at all in those cases.

## Page transitions & cursor
Astro ships static multi-page documents, so transitions use the native **View Transitions API** (progressive
enhancement, 0KB): outgoing page fades+scales at `--dur-xs`/`hud.out`, incoming HUD chrome scrambles in; browsers
without support (and reduced motion) get an instant navigation, which is the correct default, not a broken one. The
project-index → case-study hop pairs `view-transition-name` on the row's thumbnail and title so the browser
cross-fades/morphs them natively — this is what satisfies the "Flip-style" index-to-detail requirement without extra
script weight on a hard navigation. Cursor: native pointer stays visible always; a 24px trailing ring (GSAP
`quickTo`, lerp ≈0.15) follows it and fills solid `--accent` over anything scrubbable (waveform, transport, project
rows). Gated behind `(hover: hover) and (pointer: fine)`; on touch the ring never renders and `:active { scale: 0.97 }` carries the feedback instead.

## Homepage — first 3 screens
**1440 / Screen 1 (hero):** corner HUD (clock top-left, "+ MENU" top-right, à la the Freshman pattern); center-left "WILLIAM VERNON" as the wordmark (SplitText, scramble-in); tagline "Generative Design & Creative Technology." below it; the 3 CTAs (`explore_projects`, `AI projects`, `experiments`) as a row of transport-style buttons; bottom edge is a full-width idle waveform strip doubling as scroll indicator and stem opt-in ("press play to hear vnon while you scroll") — the WebGL point-cloud sits behind all of it.
**390 / Screen 1:** HUD corners collapse to one top bar (clock left, menu right); wordmark stacks 2 lines, tighter tracking; tagline + 3 CTAs stack full-width, ≥44px targets; waveform play strip pins full-width just above the fold.
**1440 / Screen 2 (Featured Work):** h2 "Featured Work" left on column 1, mono counter "04 SELECTED" right; the 4 projects render as a numbered index (WV-001…, not a bento grid), each row's tool-tag pills plus a right-side hover-preview media pane that slides in on Flip; click carries `view-transition-name` into the case study.
**390 / Screen 2:** rows become full-width stacked cards; the hover-preview media is always-visible as a static thumbnail above the text (no hover on touch); tap highlights then navigates.
**1440 / Screen 3 (AI as a Creative Partner):** left column keeps both paragraphs of copy + `explore_ai_work` CTA; right column turns the toolset directory into a HUD "signal chain" (Midjourney → ComfyUI → Blender → …), each tool a mono tile; hover/click scrambles in its spec panel — same behaviour as today's `updateHUD`, now one shared module instead of duplicated per page.
**390 / Screen 3:** the signal chain becomes a horizontal snap-scroll strip; the spec panel stacks below it instead of beside.
**Below the fold (unchanged content, not detailed per-screen here):** Liquid Drum & Bass (mixer preview + "SILVER LININGS" track + SoundCloud CTA) and Contact (email/links/social/music + the name/email/message form) continue exactly as today — nothing is dropped.

## Other pages
- **Projects (7 case studies):** index list (Waka Waka pattern: N°0001, year/tools/type columns, hover/focus preview) → case study template = hero + telemetry meta row (role, tools, year as mono chips), brief, then process steps laid along a horizontal scrub-timeline component with tick marks (the transport-bar motif reused structurally, even for non-audio projects), then outcome media full-bleed, alternating caption side.
- **Music:** "ALIAS: VNON" hero + Sound & Style copy; sticky bottom transport bar with a full-width waveform scrubber (Music-app-track-view pattern); 5 tracks as numbered rows with BPM/key telemetry tags, each expanding via Flip into the 5-channel stem mixer (Drums/Bass/Melody/Atmos/Vocals, mute buttons, its own small 2D audio-reactive canvas, paused off-screen); SoundCloud/Spotify embeds load as facades (poster + play button, iframe injected on click only).
- **AI:** the 4 AI case studies use the same case-study template as Projects (tagged "AI" in the tool-stack row); the toolset directory reuses the homepage's signal-chain HUD component at full length below them.
- **Experiments:** the 5 motion experiments render as a denser "patch bay" grid of looping preview clips with a keycap-styled controls legend (SPACE = play, R = replay), echoing the graffico reference without its 3D nav or load weight.

## Risk & cost
The WebGL point-cloud's dependency on decoding a real audio buffer pre-hero and staying inert under the DPR cap on
iOS Safari (WebGL1 context loss on backgrounding) is the direction's single real risk. Build cost is the **highest of
the three directions** — a custom OGL shader pass, a Web Audio decode pipeline, and a frame-budget watchdog all have
to ship before the hero can lazy-init — but the transport-bar, waveform-divider and signal-chain HUD components it
introduces are reused verbatim across Projects, Music, AI and Experiments, so the extra effort buys the whole site's
design-system surface rather than just the one hero.
