# Direction A — Signal Console

## Concept

The site is a precision instrument, not a page: every screen reads as a live oscilloscope console — calibration ticks, numbered channels, a signal that is actually being measured. The HUD grows from "glitch effect" into "instrument system": one authored WebGL scope replaces the ornamental particle canvas, and every readout (scroll position, cursor coordinate, track BPM) is wired to real state, never decoration.

**References drawn on:**
- **raviklaassens.com (#3)** — corner-anchored monogram/telemetry framing a quiet black centre, red used only as signal. Generalised into a persistent corner HUD (clock, cursor XY, scroll %) on every page; red is reserved for state changes only.
- **henry.codes (#1)** — condensed display type filling the viewport width, with a dense mono meta strip beneath the name acting like a spec sheet. Source of the "type as image" scale and the meta-strip-as-telemetry idea for the hero.
- **Waka Waka / MOUTHWASH index pattern (Mobbin sweep)** — numbered rows (`N°0001`), metadata columns, live readouts instead of a thumbnail grid. Becomes the project/AI index.

## Type

Display/H1: **Archivo** variable (OFL, Google Fonts) at `wdth` 62–75, weight 800/900 — the condensed cut of the same family gives gauge-stencil, instrument-lettering proportions.
H2/H3/body: **Archivo** variable at `wdth` 100, 400/500/700 — geometric grotesque, calm at body size.
Mono/telemetry/caption: **JetBrains Mono** (OFL, Google Fonts) 400/500/700.
*[Judge fix: the draft used Big Shoulders Display, which fails Awwwards-bar item 1 ("at most 2 families"). Archivo's `wdth` axis now supplies the condensed display, so 2 families ship.]*
Both self-host via `@font-face` (woff2, `font-display: swap`); no CDN font served at runtime.

Fluid scale (`clamp(min, preferred, max)`, 1rem = 16px):

| Token | clamp() | 390px | 1440px | Tracking | Leading |
|---|---|---|---|---|---|
| `--fs-display` | `clamp(3.5rem, 2rem + 11vw, 11.25rem)` | 75px | 180px | -0.02em | 0.92 |
| `--fs-h1` | `clamp(2.75rem, 1.8rem + 5vw, 5.5rem)` | 48px | 88px | -0.01em | 1.0 |
| `--fs-h2` | `clamp(2rem, 1.5rem + 2.4vw, 3.5rem)` | 33px | 56px | -0.005em | 1.08 |
| `--fs-h3` | `clamp(1.375rem, 1.2rem + 1vw, 2rem)` | 23px | 32px | 0 | 1.2 |
| `--fs-body` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 16px | 18px | 0 | 1.55 |
| `--fs-small` | `clamp(0.8125rem, 0.8rem + 0.1vw, 0.875rem)` | 13px | 14px | 0.01em | 1.4 |
| `--fs-mono-caption` | `clamp(0.6875rem, 0.68rem + 0.05vw, 0.75rem)` | 11px | 12px | 0.09em (uppercase) | 1.3 |

Display/body ratio: 180/18 = **10.0×** at 1440; 74.9/16.2 = **4.62×** at 390 (the body clamp resolves to 16.2px at 390, not 16) — clears item 1 (≥10× / ≥4×) at exactly 10.0× on desktop, so do not lower the display max or raise the body max. *[Judge fix: 4.68× corrected to 4.62×.]*

## Colour tokens

Base `#050505` (near-black, not pure `#000` — avoids OLED crush, reads as scope glass). Contrast computed with the WCAG relative-luminance formula against `--bg`.

| Token | Hex | Role | Contrast vs `--bg` |
|---|---|---|---|
| `--bg` | `#050505` | page background | — |
| `--surface` | `#0c0c0d` | panels, cards | 1.04:1 (structural, non-text) |
| `--surface-2` | `#15151a` | raised chrome (mixer decks, HUD headers) | 1.12:1 (non-text) |
| `--line` | `#26262b` | hairlines, calibration ticks | n/a (non-text) |
| `--text` | `#EDEDED` | primary text | **17.41:1** |
| `--text-muted` | `#7D838A` | secondary/meta text | **5.32:1** (≥4.5 required) |
| `--accent` | `#FF3B30` | signal red — CTA, live/active state, text-safe | **5.75:1** (≥4.5 required; fixes today's `#D91C1C` at 4.12:1) |
| `--accent-2` | `#FFB000` | signal amber — channel 2, secondary CTA | **11.12:1** |
| ~~`--signal-green`~~ | ~~`#39FF88`~~ | *removed by judge* | — |
| ~~`--signal-cyan`~~ | ~~`#5CE1E6`~~ | *removed by judge* | — |

*[Judge fix: neon green and neon cyan break REFERENCES anti-pattern #1 ("no neon-cyan… the only chroma is the red signal accent") and item 4 (red has a single job). Channels 3–5 are told apart by `--text` / `--text-muted` traces plus line style (solid / dashed / dotted) and a mono channel label, not by hue. `--accent-2` amber stays, limited to the channel-2 trace and a warning state, with the same 5%-of-first-screen budget as red.]*

Every colour used for text clears 4.5:1 with margin (verified by judge: 17.41, 5.32, 5.75, 11.12; `--text-muted` on `--surface-2` is 4.75:1, still AA); `--line`/`--surface*` are structural only and never carry text.

## Grid

| Breakpoint | Columns | Gutter | Margin | Max-width |
|---|---|---|---|---|
| 390 | 4 | 16px | 20px | 100% |
| 768 | 8 | 20px | 32px | 100% |
| 1440 | 12 | 24px | 64px | 1600px |

Baseline/spacing scale (8px base, 4px sub-tick for calibration marks): `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192`.

## Motion language

GSAP `CustomEase`: `consoleOut` = `cubic-bezier(0.16, 1, 0.3, 1)` (entrances/reveals); `consoleInOut` = `cubic-bezier(0.65, 0, 0.35, 1)` (on-screen movement, transition sweep); `snap` = `cubic-bezier(0.2, 0.8, 0.2, 1)` (HUD tick/digit rolls, filter reflow).
Durations (ms): `instant 120 · fast 220 · base 400 · slow 700 · scene 1200`. Stagger: SplitText lines/chars `45ms`, index rows `60ms`, HUD digit roll `20ms`/digit.

| Primitive | Where | Reduced-motion behaviour |
|---|---|---|
| ScrollSmoother | Desktop only, `(pointer:fine) and (min-width:1024px)` | Disabled; native scroll |
| SplitText | Hero name, case-study intros (line-by-line) | Final text rendered immediately, no reveal |
| ScrambleText | Nav hover, hero name entrance, HUD digits | Text/value set instantly, no scramble frames |
| Flip | Index row → case-study hero; filter reflow; lightbox open | Cross-fade 150ms, no morph |
| ScrollTrigger (pin/scrub) | Process-step rail, music track chapters | Pin removed; IntersectionObserver fade-in |

## Signature effects, reinterpreted

- **Scramble ("signal decode")** — trigger: hover + heading enter-viewport. Glyph pool `01#/[]—∆Ω`, resolves left-to-right, ≤0.6s. Reduced motion: instant final text, 150ms fade only.
- **Glitch ("signal dropout")** — trigger: state change only (filter applied, channel muted), 2px RGB-split + one clip-path slice, ≤180ms. Reduced motion: 120ms opacity flash, no split/transform.
- **Telemetry/HUD readouts** — live values (scroll %, cursor XY, track time) updated at 10fps via `gsap.quickTo`, tabular-nums, 80ms digit-roll on change. Reduced motion: value still updates live (it's information, not decoration) but swaps instantly, no roll.
- **Audio-reactive visuals** — 2D canvas per channel (not WebGL, so it never becomes a second signature canvas), amplitude → trace height/colour at 30fps, paused via IntersectionObserver off-screen. Reduced motion: canvas replaced by a static SVG waveform snapshot + a plain "LIVE" text badge.

## The one signature WebGL moment

**Where:** hero of `/` (idle/cursor mode) and reprised as the masthead of `/music` (audio mode) — same authored module, one input swap, so it never becomes a second canvas.
**What:** 6–9 thin horizontal scope traces spanning the hero width; idle state runs a simplex-noise waveform that bows toward the cursor (amplitude + colour shift within ~120px); music mode drives the same traces from the existing `AnalyserNode` data instead of noise.
**Library:** OGL (~7–8KB gzip core) over three.js (well over 100KB gzip even tree-shaken, since `WebGLRenderer` does not shake; *[judge fix: the draft's 35–45KB was wrong]*) — the scene is a handful of line meshes and one custom shader, not worth three.js's scene graph. Total added JS ≈ 12–14KB gzip.
**Perf budget:** init deferred until after LCP (`requestIdleCallback`, fallback `setTimeout`, gated on hero intersection); DPR capped at 1.5; render loop paused on `visibilitychange` and when the hero leaves viewport; mobile renders every other rAF tick (~30fps cap).
**Fallback:** a static SVG scope-trace poster behind the hero text — same calibration-tick language, zero motion — served under `prefers-reduced-motion` and on WebGL-context failure.

## Page transitions & cursor

**Transitions ("channel switch"):** outgoing content scales to 0.98/fades to 0 (`fast`, `consoleOut`); a 2px accent scanline sweeps top→bottom (`base`, `consoleInOut`); incoming content fades up from `translateY(12px)` with a 40ms block stagger. A fixed overlay intercepts internal links, plays the exit beat, then navigates (progressive enhancement over the native View Transitions API where supported). Reduced motion: instant navigation, no overlay.
**Cursor:** native pointer always visible (never hidden). An 8px accent ring tracks it 1:1 via a direct `pointermove` transform (*[judge fix: the draft's 0.5s `quickTo` lag is the REFERENCES "cursor that lags behind it" anti-pattern; B's 1:1 tracking adopted]*), becomes a crosshair with an XY-coordinate readout over the WebGL hero, and fills solid labelled "VIEW" over index rows. Disabled entirely on `(pointer: coarse)` and under reduced motion — native cursor only, nothing to fall back from.

## Homepage — first 3 screens

**Screen 1 (hero), 1440:** WebGL scope field full-bleed behind text; top-left mono readout `DESIGN & MUSIC // OXFORD BROOKES ALUM`; H1 "WILLIAM VERNON" (Archivo wdth 62 900, SSR text with a SplitText line reveal, never scrambled, since it is the LCP element), H2 tagline, bio paragraph (42ch max), 3 CTAs (`explore_projects` primary, `> AI projects`, `> experiments`); bottom-right corner clock/coordinate HUD + "Scroll" tick.
**390:** scope field reduced to 3 traces, confined to the top third (protects LCP/CLS); H1 ~75px; CTAs stack full-width, 12px gaps; HUD readout drops to one line below the CTAs.

**Screen 2 (Featured Work, 4 items), 1440:** H2 left, mono counter `04 SIGNALS` right; numbered index rows (`WV-001`…`WV-004`, title + tags + label) replace the card grid; hover raises a floating cursor-follow preview panel; click uses Flip into the case study.
**390:** rows become stacked full-width cards; preview media shows inline on tap (Flip height expand); each row ≥44px tap target.

**Screen 3 (AI as a Creative Partner), 1440:** two columns — left: H2 (the existing kicker copy kept as a data readout, not an eyebrow label, per the craft-floor ban), 2 body paragraphs, `explore_ai_work` CTA; right: the 9-tool AI directory as a HUD panel list, use-case readout on hover/focus (reuses the existing `updateHUD`/`data-tool` wiring, restyled with scramble-in text).
**390:** single column; toolset directory becomes a tap-to-expand accordion, 56px row height.

**Further down (unchanged, nothing dropped):** Screen 4 reprises the stems mixer (5 channel strips — Drums/Bass/Melody/Atmos/Vocals — each a live 2D trace in a signal colour + FX-slider HUD dials; SoundCloud loads as a click facade); mobile turns the strips into a swipe-snap carousel. Screen 5 is Contact — HUD contact card (email/links/social, scramble "Copied!") beside the terminal-style message form; single-column on mobile, 44px inputs.

## Projects, Music, AI, Experiments

**Projects:** index uses the numbered-row + SOFTWARE/DISCIPLINE filter rail (Flip reflows rows on filter change, no reload). Each of the 7 case studies: hero (title, tool-stack metadata, brief) → numbered process steps in a single column with a sticky right-rail calibration ruler that fills via `ScrollTrigger` scrub as steps pass → outcome media gallery (lightbox) → prev/next via Flip back into the index row's position.
**Music:** masthead is the WebGL scope in audio-reactive mode over "ALIAS: VNON"; the 5 tracks each get a short `ScrollTrigger`-pinned chapter (~60vh) with BPM/key telemetry tags, a 2D waveform, and click-to-load SoundCloud/Spotify facades; the full stems mixer for the featured bootleg lives here as its own console section (home shows the same component and detail — not a duplicate build).
**AI:** same directory component as home Screen 3, all 9 tools; the 4 AI projects (Monolith Survival, Dredge, Synthetic Corals, willvernon.online Rebuild) use the same numbered-index pattern as Projects, scoped to this page, opening via Flip.
**Experiments:** 5 items in a 2-up desktop / 1-up mobile grid (looser than full case studies); tag pills for tool combos; lightbox opens via Flip-zoom from the grid cell (not a plain overlay); Escape closes and returns focus to the trigger, arrow keys step between items — fixing today's missing keyboard trap.

## Risk & cost

**Risk:** corner-anchored HUD chrome (clock/coordinates/telemetry) risks curdling into eyebrow-label clutter across 7 pages if any instance isn't wired to real, per-page state — the craft floor bans decorative labels outright, so every readout must earn its place or be cut.
**Cost:** low-medium relative to the other directions. Most components (HUD panel, scramble, stems mixer, canvas audio-reactivity) are refinements of code that already exists in the current build; the OGL scope-field hero is the only wholly new subsystem, and it is deliberately small (~14KB gzip) and reused (idle + audio modes) rather than bespoke per page.
