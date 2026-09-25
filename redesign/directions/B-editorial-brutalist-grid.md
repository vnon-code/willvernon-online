# Direction B — Editorial Brutalist Grid

## Concept

Swiss/brutalist editorial system: the grid is visible furniture, not a guideline nobody sees. Type is huge
and kinetic, set like a newspaper masthead. The HUD survives only as typographic annotation — mono
captions, corner coordinates, scramble on metadata cells — never as chrome layered on top. Projects, tracks
and experiments read as an *index*, not a card gallery.

Draws on: **henry.codes** (#1) — condensed newspaper display full-width + dense small-caps meta strip,
styled with CSS not JS chrome. **Waka Waka** (index pattern) — numbered rows (`N°001`) with metadata
columns and a live coordinate readout. **MOUTHWASH** (index pattern) — INDEX/INFORMATION toggle and mono
project codes (`WV-001…`), adopted as this direction's row-code convention.

## Type pairing

- **Display/H1/H2/H3:** *Archivo* (Google Fonts, OFL 1.1, self-hostable), weight 900 for display/H1, 700 for
  H2/H3 — newspaper-masthead density without a licensed newspaper face.
- **Body:** *Inter* (Google Fonts, OFL 1.1), 400/500 — high x-height at small sizes on dark backgrounds; the
  audit's failing body colour was a contrast problem, not a face problem.
- **Mono/HUD captions:** *JetBrains Mono* (Google Fonts, Apache 2.0), 400/500/700, replacing Space Mono.
- 2 families in play (Archivo + Inter share the sans role at different weights; JetBrains Mono is the third,
  the allowed mono) — meets check 1's "at most 2 families + at most 5 sizes."

| Token | clamp() | @1440 | @390 |
|---|---|---|---|
| `--fs-display` | `clamp(3.5rem, 2rem + 9vw, 11.25rem)` | 180px | 72px |
| `--fs-h1` | `clamp(2.5rem, 1.6rem + 4.5vw, 6rem)` | 96px | 48px |
| `--fs-h2` | `clamp(1.75rem, 1.3rem + 2.2vw, 3.5rem)` | 56px | 32px |
| `--fs-h3` | `clamp(1.25rem, 1.05rem + 1vw, 2rem)` | 32px | 22px |
| `--fs-body` | `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)` | 18px | 16px |
| `--fs-small` | `clamp(0.8125rem, 0.8rem + 0.1vw, 0.875rem)` | 14px | 13px |
| `--fs-mono-caption` | `clamp(0.6875rem, 0.68rem + 0.05vw, 0.75rem)` | 12px | 11px |

Display/body ratio: 180/18 = **10x** @1440, 72/16 = **4.5x** @390 (meets check 1's ≥10x/≥4x). Tracking +
leading: display/H1 `-0.02em` / `0.92`; H2/H3 `-0.01em` / `1.05`; body `0` / `1.55`; small `0.01em` / `1.4`;
mono-caption `0.08em` / `1.3`, uppercase.

## Colour tokens

Measured vs `--bg` #0A0A0A (relative-luminance formula), slightly lighter than the audit's `#020000` to
lift ratios without going grey.

| Token | Hex | Role | Contrast vs bg |
|---|---|---|---|
| `--bg` | `#0A0A0A` | Page background | — |
| `--surface` | `#141414` | Index rows, panels | 1.07:1 (structural) |
| `--surface-2` | `#1C1C1C` | Nested panel, active row | 1.36:1 vs surface (structural) |
| `--line` | `#2E2E2E` | Grid rules/dividers, never text | 1.46:1 (structural) |
| `--text` | `#F2F1ED` | Body, headings | **17.52:1** — AA/AAA pass |
| `--text-muted` | `#A8A8A2` | Captions, secondary copy | **8.28:1** — AA pass (req ≥4.5:1) |
| `--accent` | `#FF3B30` | Live signal, links, used as text | **5.58:1** — AA pass (req ≥4.5:1); 5.19:1 vs surface |
| `--accent-2` | `#7A0F0F` | Decorative only: hover fills, active-row rule, underline base — never text (1.79:1, fails on purpose) |
| `--signal-live` | `#FF3B30` (=accent) | Blinking REC/LIVE dot | 5.58:1 |
| `--signal-idle` | `#6B3330` | Muted-red paused/offline dot, decorative only (2.02:1) |

Retires `#D91C1C` (4.12:1, fails) and `#6b7280` (4.33:1, fails) outright — no size-exempt reuse anywhere.

## Grid

| Breakpoint | Columns | Gutter | Margin | Max-width |
|---|---|---|---|---|
| 1440 | 12 | 24px | 64px | 1440px content, hero type full-bleed |
| 768 | 8 | 20px | 40px | 100% |
| 390 | 4 | 16px | 16px | 100% |

8px baseline scale: `4/8/16/24/32/48/64/96/128px` (`--space-1`…`--space-8`). Every text block starts on an
8px line; section padding is always `--space-6`/`--space-7` desktop, `--space-5` mobile.

## Motion language

Two named curves: `hud.out` `cubic-bezier(0.16, 1, 0.3, 1)` (every entrance — SplitText, index-row reveals,
Flip landings); `hud.inOut` `cubic-bezier(0.65, 0, 0.35, 1)` (on-screen movement — parallax, cursor
distortion, page-wipe). Durations: `120ms` press/hover · `200ms` scramble resolve / preview fade · `400ms`
SplitText reveal / Flip · `700ms` page wipe · `1200ms` ScrollSmoother-scrubbed. Stagger: `40ms` index rows,
`60ms` SplitText lines, capped `80ms` for groups ≤6.

GSAP: **ScrollSmoother** (desktop only via `matchMedia`, disabled ≤767px/reduced motion — native scroll
instead). **SplitText** on hero name/tagline, case-study intros (illoca-style falloff), H2s. **ScrambleText**
on mono metadata only (row codes, telemetry, hover labels) — never body/headings. **Flip** for index-row →
case-study morph and menu-overlay open/close. **CustomEase** registers `hud.out`/`hud.inOut` once; no stray
`ease:` literals.

Reduced motion: ScrollSmoother off (static sections); SplitText still splits but reveals as single
`opacity 0→1` at 200ms, no y-offset, stagger ≤20ms; ScrambleText skipped (final string renders instantly);
Flip replaced by a 200ms `autoAlpha` crossfade.

## Signature effects reinterpreted

| Effect | Trigger | Duration | Reduced-motion fallback |
|---|---|---|---|
| Text scramble | Hover/focus on nav link, index row, metadata cell; glyph pool `01XY/[]_#&@$%?><*` | ≤450ms | Final string instant, no cycling |
| Glitch | 1–2 frame `clip-path` slice on the hovered row's code cell only | 120ms | Disabled; colour change only |
| Telemetry/HUD | Corner readout (scroll%, section id, clock; on /music: BPM/key), updates on scroll/interval | throttled 1/250ms | Renders (it's data) but swaps text directly, no re-scramble |
| Audio-reactive | 2D canvas bars from `AnalyserNode`, only while playing | continuous, paused via `IntersectionObserver` off-screen | Static pre-baked waveform SVG |

## The one signature WebGL moment

**Where:** the project-index hover preview on `/work`, reused inside case-study outcome-media galleries —
one shader, one mount pattern, never two permanent canvases. **What:** displacement shader on the preview
image — a soft radial UV-offset (~40px falloff) warps around the cursor as it crosses the row, relaxing
flat on pointer-leave (`hud.inOut`); this is the brief's "distortion following the cursor" idea. **Library:**
**OGL** (~10KB min+gzip) over three.js (~150KB+) — one plane, one fragment shader, one mouse uniform is
OGL's whole job. **Perf budget:** lazy `import()` on `requestIdleCallback` after LCP paints; canvas created
only on hover/focus, destroyed on pointer-leave (≤1 live context at a time); `IntersectionObserver` gates it
off-screen; DPR capped `Math.min(devicePixelRatio, 1.5)`; zero cost when idle. **Fallback:** under reduced
motion or no WebGL, a plain 200ms opacity crossfade to the static poster frame, same crop, no layout shift.

## Page transitions and cursor

**Transition:** Flip-choreographed wipe — the outgoing page's `--line` grid rules extend into full-bleed
black bars sweeping left-to-right (`hud.inOut`, 700ms) while the incoming masthead SplitText-reveals
underneath; no spinner, no blank frame, the grid itself is the transition. **Cursor:** small mono
`[ + ]` marker that augments the native cursor (never `cursor: none`), expanding to a label (`VIEW`/`PLAY`/
`MUTE`) over index rows, tracking 1:1 via direct `pointermove` transform (no spring lag). Gated by
`(hover: hover) and (pointer: fine)` and off under reduced motion. **Touch fallback:** hover previews become
tap-to-reveal inline below the row; a second tap/"View" button navigates; the cursor never renders.

## Homepage — first 3 screens

**1440/S1 (hero):** `[ WORK ] [ MUSIC ] [ ABOUT ]` mono nav top-left + `+ MENU` trigger top-right (opens the
overlay holding Projects/AI/Experiments — fixes the missing-nav problem). `WILLIAM` / `VERNON` at
`--fs-display` (Archivo 900, SplitText, ~600ms, 60ms/line stagger) as the hero graphic, mono meta-strip
`DESIGN & MUSIC // OXFORD BROOKES ALUM` beneath, tagline at `--fs-h3`, description at `--fs-body`/
`--text-muted`, CTAs (`explore_projects`, `AI projects`) as underlined mono links not buttons, bottom-right
corner clock + scroll% readout.
**1440/S2 (Featured Work):** `Featured Work` H2, then the 4 featured-project rows (`N°01 — TITLE ———
TOOLSET ——— YEAR`), right third of each row hosting the hover-gated distortion preview — no thumbnail grid.
**1440/S3 (AI + Music teaser):** Two bands split by a `--line`: "AI as a Creative Partner." H2 + 2
paragraphs + toolset directory as a mono row-list + `explore_ai_work` CTA; "Liquid Drum & Bass." H2 + 2
paragraphs + the featured track (SILVER LININGS — VNON BOOTLEG) as one index row with an inline muted
waveform + `Explore_My_Music`/`Listen_on_SoundCloud` CTAs. Below the fold (present, nothing dropped):
contact form (name/email/message as index-row inputs) + email/social block + footer.
**390:** nav collapses to `+ MENU`; hero name drops to its 72px clamp, stacked full-width; meta-strip and
tagline stack at 16px margin; CTAs stack full-width; corner readout collapses to one line. Featured-work
rows keep numbering, preview reveals inline below the row on tap. AI/Music bands stack fully; toolset table
becomes a 2-column mono list; track row keeps its waveform with ≥44px touch controls.

## Projects, music, AI/experiments layout

**Projects (7):** `/work` is the full index (Waka-Waka numbered rows, discipline chips: Generative/3D/AI/
Audio). Opening a row Flips into the case-study template: hero (title, tool-stack as mono tags, brief) →
numbered process steps (step number mono `--fs-h3`, description `--fs-body`, right-rail detail panel per
step for process media — filling the Julienne-style gap `REFERENCES.md` flags) → outcome media (full-bleed,
no shader repeat) → next-project link.
**Music (5 tracks):** masthead "ALIAS: VNON" + "Sound & Style" intro, then the 5-track index (BPM/key as
mono tags). Selecting a track opens a sticky bottom transport with the 5-stem mixer (Drums/Bass/Melody/
Atmos/Vocals) as mono channel strips, MUTE + one `ACTIVE_CHANNEL` indicator. SoundCloud/Spotify sit below as
click-to-load facades. The audio-reactive canvas is a full-width waveform strip, paused off-screen/hidden.
**AI (4 + toolset):** same index pattern, 4 projects, same case-study template. Toolset directory as a
standalone mono table below — scramble-on-hover metadata only, no WebGL (the one moment stays singular).
**Experiments (5):** a denser, faster index, no process steps; each row expands inline to a looping preview
with a HUD keycap-styled controls legend (graffico-inspired) where relevant.

## Risk vs. build effort

**Risk:** the cursor-follow distortion shader must stay to exactly one live WebGL context across many hover
events, or it silently becomes the banned "three canvases" pattern. **Effort:** medium relative to the other
directions — the type/grid system is cheap CSS (`clamp()` tokens, hairline borders), but the Flip row→case-
study transition and the lazy-mounted OGL preview both need real engineering time a flatter direction
wouldn't.
