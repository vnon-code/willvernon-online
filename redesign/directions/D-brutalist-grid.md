# Direction D: Ruled Ground

**Status:** the single Phase 2b direction. It replaces direction A (Signal Console) outright, so builders should not reuse any of A's visuals. Content parity (INVENTORY.md) is unchanged.
**Authored:** 2026-09-25, Phase 2b direction spec (Opus).
**Skills behind it:** impeccable (craft floor, new-work world choice, font and colour calibration), emil-design-eng (easing, duration and interruptibility rules), gsap-scrolltrigger (the single master trigger, batch, and the refresh-order rules).

---

## 0. Thesis (read this first)

The page is a drawing sheet. A few hard, visible rule lines (the layout grid itself, not a decoration laid over it) divide the viewport into **bays**. Huge grotesque type sits on those bays, and the lines are alive. They **draw themselves** as the visitor scrolls, **shear sideways** with scroll speed and spring back, **light up** the bay the pointer is in, and **cut the page** into bays when it changes. Everything else is quiet: paper, ink, one state colour.

- **What it refuses:** the dark near-black/neon portfolio, HUD telemetry, glow, cards, eyebrow labels, section numbers, gradient anything, rounded corners, mono type used as a "technical" costume.
- **Recognisable with all content removed:** a light grey paper ground; 1px ink hairlines at 14% on a 4-bay rhythm, with `+` crosses where rules meet bays; black 800-weight wide grotesque; and a single highlighter yellow that appears only when something is *active, hovered, selected or focused*.
- **Physical scene** (this is what decides light versus dark): recruiters, studios and collaborators open the link on a laptop or phone in daylight, at a desk or on the move, and scan it quickly. That favours a light paper ground. Dark is kept for the two "studio" moments where William's audio work lives: the stems console and the footer.

### Grounding in the references (sweep: `redesign/references/2b-grid.md`, `2b-brutalist.md`)

| Reference | What we take | What we do beyond it |
|---|---|---|
| **cloudflare.com** | Two primitives, not a dense grid: long 1px frame verticals, plus full-bleed horizontal section rules wider than the container; line colour as a % of ink, never a flat grey; 16/16 dash cadence (used for our dashed variant). | Cloudflare's lines only cross-fade opacity over 2s. Ours scrub, shear and respond. |
| **vercel.com/geist/grid** | A `+` cross at rule∩bay intersections; the "solid cell" idea (opaque content occludes guides). | Our crosses rotate and snap in as the rule's draw passes them. |
| **uncommonstudio.com.au** | A named, reusable line primitive (`styles_line` → our `Rule`/`Frame`); `scaleX`/`scaleY` 0→1 draw from a fixed origin; loud type over quiet structure. | Theirs is a one-shot IntersectionObserver toggle. Ours is tied continuously to scroll position. |
| **bleibtgleich.dev** | A persistent visible vertical rule that splits metadata from content; a near-monochrome palette with one accent used sparingly; hard cuts with no crossfade filler; deliberate emptiness. | Our cuts are stepped per bay, so the transition itself is drawn by the grid. |
| **madebynull.com** | The minimal floor: one accent, one signature moment, nothing else moving. A check that the hero isn't over-decorated. | — |
| **eloyb.design** | Type-as-image: stacked, edge-to-edge, tight-leading grotesque headline; aggressive GSAP sequencing. (Its neon-lime palette is explicitly *not* taken.) | Our aggression lives in the variable width axis, not in glitch textures. |

---

## 1. Palette

**Strategy:** Restrained, meaning neutrals plus one accent, where the accent is a **state colour, never decoration**. The yellow never appears at rest on a page except on the current nav item and `::selection`.

### Tokens (`src/styles/tokens.css`)

```css
:root {
  /* Ground + ink */
  --paper:      #F1F1EE;  /* page ground: neutral light grey paper (not cream) */
  --paper-2:    #E6E6E2;  /* recessed field: form inputs, code/tool cells at rest */
  --ink:        #0B0B0B;  /* all primary text, buttons, focus rings */
  --ink-2:      #5C5C58;  /* secondary text: captions, meta, descriptions */
  --state:      #FFE14A;  /* highlighter yellow: hover / active / selected fill ONLY */

  /* Lines (decorative structure; derived from ink, never a flat grey) */
  --line:        color-mix(in srgb, var(--ink) 14%, var(--paper)); /* ≈ #D1D1CE, grid + rules */
  --line-strong: color-mix(in srgb, var(--ink) 32%, var(--paper)); /* ≈ #A7A7A5, "hot" bay + crosses */
  --line-ink:    var(--ink-2);  /* form control borders (must meet 3:1) */

  /* Inverted "studio" surfaces (stems console, footer) */
  --ink-ground:  #0B0B0B;
  --on-ink:      #F1F1EE;
  --on-ink-2:    #9C9C97;
  --line-inv:        color-mix(in srgb, var(--on-ink) 16%, var(--ink-ground)); /* ≈ #30302F */
  --line-inv-strong: color-mix(in srgb, var(--on-ink) 34%, var(--ink-ground)); /* ≈ #595958 */
}
```

- `SITE.themeColor` in `src/data/site.ts` becomes `#F1F1EE`.
- `color-scheme: light`.
- There is **no dark mode**. The design is one authored light world with two inverted sections. The site is a portfolio (Experience mode), not an app, so we don't make a theme toggle.

### Computed WCAG 2.x contrast (via `/tmp` script; sRGB relative luminance)

| Foreground | Background | Ratio | Use | Verdict |
|---|---|---|---|---|
| `--ink` #0B0B0B | `--paper` #F1F1EE | **17.39:1** | all text on the page | AAA |
| `--ink-2` #5C5C58 | `--paper` | **5.93:1** | secondary text, meta, captions | AA (body) |
| `--ink` | `--paper-2` #E6E6E2 | **15.73:1** | input text, tool cells | AAA |
| `--ink-2` | `--paper-2` | **5.37:1** | placeholder text | AA |
| `--ink` | `--state` #FFE14A | **15.11:1** | hovered/active row text, current nav, selection | AAA |
| `--ink-2` | `--state` | **5.16:1** | meta inside a hovered row | AA |
| `--on-ink` #F1F1EE | `--ink-ground` #0B0B0B | **17.39:1** | inverted sections | AAA |
| `--on-ink-2` #9C9C97 | `--ink-ground` | **7.14:1** | secondary text on ink | AAA |
| `--state` | `--ink-ground` | **15.11:1** | active mute/stem state text on ink | AAA |
| `--ink` focus ring | `--paper` | 17.39:1 | 2px focus ring (non-text ≥3:1) | pass |
| `--line-ink` #5C5C58 | `--paper-2` | 5.37:1 | input borders (non-text ≥3:1) | pass |
| `--state` | `--paper` | 1.15:1 | **never** used alone as a signal on paper. It is always a *fill behind ink text* | rule |
| `--line` / `--line-strong` | `--paper` | 1.35 / 2.13 | decorative structure, carries no information | exempt (decorative) |

**Rules.**
- (a) Yellow is never text on paper, and never the only cue for a state. The ink text or shape carries the meaning; the fill just emphasises it.
- (b) Focus is always a 2px solid `--ink` outline with a 3px offset. On inverted surfaces it's 2px `--on-ink`. It is never yellow.
- (c) Secondary text is always `--ink-2` or `--on-ink-2`, never an opacity-faded ink.
- (d) The browser surfaces are themed too:
  - `::selection { background: var(--state); color: var(--ink) }`
  - `caret-color: var(--ink)`
  - `accent-color: var(--ink)`
  - a thin scrollbar: `scrollbar-color: var(--ink) var(--paper)`
  - links use `text-underline-offset: 0.18em` and `text-decoration-thickness: 1px`

---

## 2. Type

### One family: **Mona Sans** (variable: `wdth` 75–125, `wght` 200–900, OFL)

- Package: `@fontsource-variable/mona-sans`. **Verified: `npm view @fontsource-variable/mona-sans version` → `5.3.0`**, license OFL-1.1.
- Import `@fontsource-variable/mona-sans/wdth.css`. That file carries the `wdth` and `wght` axes together (`font-stretch: 75% 125%`, `font-weight: 200 900`).
- Preload **only** `files/mona-sans-latin-wdth-normal.woff2` (98 KB). The italic is not loaded.
- `font-display: swap` is fontsource's default.
- CSP stays `font-src 'self'`.
- **Why this face:**
  - It's a real Swiss-lineage grotesque with a point of view (it's GitHub's, but not overused as a portfolio display face), and it isn't on impeccable's reflex list.
  - Its **width axis is the kinetic instrument.** The wide 125 cut is the "raw, bold" display voice, and squeezing 125→75 on scroll is the site's signature type motion (§4). One file serves display, body and labels.
- **Retire** `@fontsource-variable/archivo` and `@fontsource-variable/jetbrains-mono`. Remove both from `package.json`, delete the preload in `Base.astro`, and add `@fontsource-variable/mona-sans`.
  - No monospace ships. Mono as a "technical" costume is banned.
  - Numbers use `font-variant-numeric: tabular-nums`. Mona Sans ships `tnum`; builder A checks it once in the styleguide. If the digits don't align, wrap each numeric cell in a fixed `inline-size` span.
  - Legacy code-flavoured strings in the content (`explore_projects`, `> AI projects`, `// DEPLOYED_PLATFORMS_&_MODELS`, `View_Case_Study`) keep their authored characters. They are set in Mona Sans `--fset-label` and read as William's raw voice, not as mono cosplay.

### Families and axis presets

```css
--font: 'Mona Sans Variable', ui-sans-serif, system-ui, sans-serif;
--fset-display: 'wdth' 125, 'wght' 820;  /* hero name, page H1 */
--fset-title:   'wdth' 100, 'wght' 780;  /* H2, index row titles */
--fset-sub:     'wdth' 100, 'wght' 620;  /* H3/H4 */
--fset-body:    'wdth' 100, 'wght' 420;
--fset-strong:  'wdth' 100, 'wght' 640;
--fset-label:   'wdth' 112, 'wght' 600;  /* small labels, buttons, nav */
```

Use `font-variation-settings` only through these tokens. The kinetic width scrub (§4) writes `--wdth` on the H1 (see below), so the H1 uses `font-variation-settings: 'wdth' var(--wdth, 125), 'wght' 820`.

### Fluid scale (1rem = 16px; the values at 390 / 768 / 1440 are for reference)

| Token | clamp() | 390 | 768 | 1440 | Line height | Tracking |
|---|---|---|---|---|---|---|
| `--fs-mega` (hero name) | `clamp(3.5rem, 0.4rem + 15.6vw, 15.5rem)` | 67px | 126px | 231px | 0.84 | -0.035em |
| `--fs-h1` (page titles) | `clamp(3rem, 0.9rem + 8.6vw, 9.5rem)` | 48px | 81px | 138px | 0.9 | -0.03em |
| `--fs-row` (index row titles) | `clamp(2rem, 1rem + 4.2vw, 5.25rem)` | 32px | 48px | 77px | 0.95 | -0.025em |
| `--fs-h2` | `clamp(1.875rem, 1.2rem + 2.9vw, 4rem)` | 30px | 42px | 61px | 1.0 | -0.02em |
| `--fs-h3` | `clamp(1.25rem, 1.05rem + 0.9vw, 2rem)` | 20px | 24px | 30px | 1.15 | -0.01em |
| `--fs-body` | `clamp(1rem, 0.96rem + 0.2vw, 1.125rem)` | 16.8px | 17.5px | 18px | 1.55 | 0 |
| `--fs-small` | `clamp(0.875rem, 0.85rem + 0.1vw, 0.9375rem)` | 14px | 14.6px | 15px | 1.45 | 0 |
| `--fs-label` | `0.8125rem` | 13px | 13px | 13px | 1.2 | +0.06em |

- The 1440 ratio of mega to body is 12.8×. That meets the Awwwards "type as image" bar and goes deliberately past impeccable's 6rem display cap, because the brief pins "bold, raw".
- **Fit test (builder A must run it):** no single word of the hero H1 may overflow its container at 360, 390, 768, 1024 or 1440.
  - Below 768 the hero uses `'wdth' 108` (set `--wdth: 108` in the base media query). The kinetic scrub still runs 108→75.
  - If a word overflows, lower the `vw` coefficient, not the weight.
- **Case rules:**
  - Headings are set **as authored** (sentence/title case from content). Never `text-transform` a heading.
  - Only `--fs-label` elements are uppercased by CSS (nav links, button labels, row meta, form labels), with +0.06em tracking. The DOM text stays as authored, so parity is unaffected.
  - Body is sentence case. Measure is 60–70ch.
- **Weight steps:** only the preset weights above, meaning 420 body, 600/620 labels and subs, 640 strong, 780/820 display. No other values.
- `text-wrap: balance` on h1–h3; `text-wrap: pretty` on body.

---

## 3. The grid-line system

### 3.1 Layout grid and bays

| Breakpoint | Columns | Gutter `--g` | Margin `--m` | Bays `--bays` | Cols per bay | Vertical lines drawn |
|---|---|---|---|---|---|---|
| base (designed at 390) | 4 | 16px | 20px | 1 | 4 | 2 (the frame) |
| ≥768 | 8 | 20px | 32px | 2 | 4 | 3 |
| ≥1024 | 12 | 24px | 48px | 4 | 3 | 5 |
| ≥1440 | 12 | 24px | 64px | 4 | 3 | 5 |

- Container: `width: min(100% - 2*var(--m), var(--grid-max))`, centred, with `--grid-max: 1760px`.
- **Line positions:** lines sit on **gutter centres**, and the two frame lines sit half a gutter outside the container. Content therefore always clears every line by `--g/2`, and text never sits on a line.
  - In CSS this is a grid of `--bays` equal tracks with `column-gap: var(--g)`. Line *k* sits at the left edge of bay *k*, minus `--g/2`, and the last line at the right edge of the last bay plus `--g/2`.
  - This is pure CSS positioning, with **no JS measuring**.
- **Layout contract:** content blocks start and end on bay edges wherever possible (span 1, 2, 3 or 4 bays). Text is allowed on 12-column sub-positions inside a bay, but images and solid blocks must span whole bays so their edges land on a line.

### 3.2 The four primitives (markup built by A in `src/components/grid/`)

**1. `GridFrame.astro`: the fixed bay lines (one per page, rendered by `Base.astro`).**

```html
<div class="gf" data-grid-frame aria-hidden="true">
  <div class="gf-track container">          <!-- same container + bays as content -->
    <span class="gf-v" data-gf-line="0"></span> … <span class="gf-v" data-gf-line="N"></span>
  </div>
</div>
```

- `.gf` is `position: fixed; inset: 0; z-index: 0; pointer-events: none; contain: strict`.
- Each `.gf-v` is `position: absolute; top: -32px; bottom: -32px; width: 1px; background: var(--line); transform-origin: 50% 0`.
  - The 32px overrun hides edges while it shears.
- The lines needed per breakpoint are shown with CSS, via `display: none` on `[data-gf-line]` values above `--bays`. There are 5 spans in total.
- Each line has a sibling "hot" copy, `.gf-v-hot` (`background: var(--ink)`, `opacity: 0`), used for hover (see 3.4).
- `view-transition-name: grid-frame`, so the lines stay put during page transitions.
- **Prop `local`:** `<GridFrame local />` renders the same markup with `position: absolute; inset: 0` inside a solid section. The stems console, footer and nav use it so lines continue through opaque surfaces. It uses `--line-inv` inside `[data-surface="ink"]`.

**2. `Rule.astro`: a full-bleed horizontal section rule, with crosses.**

```html
<div class="rule" data-rule="start|end|center" [data-rule-dash] [data-rule-cross] aria-hidden="true">
  <span class="rule-line"></span>
  <div class="rule-x-track container"><span class="rule-x" data-x="0"></span>…</div>
</div>
```

- `.rule` is `position: relative; height: 1px; width: 100vw; margin-inline: calc(50% - 50vw)`. This makes it full-bleed like Cloudflare's 200dvw SVG. `html` has `overflow-x: clip`, so it never scrolls sideways.
- `.rule-line` has `height: 1px; background: var(--line)` and `transform-origin` set from `data-rule`: `start` = left, `end` = right, `center` = 50%.
- `data-rule-dash` switches to `background: linear-gradient(90deg, var(--line) 50%, transparent 0) 0 0 / 32px 1px`, the 16/16 dash that Cloudflare uses. Use it on the rules between index rows only.
- **Crosses (≥768 only):** `.rule-x` is an 11×11px `+` built from two 1px `--line-strong` bars (`::before`/`::after`). It is centred on each bay line's x, using the same track math as the GridFrame, so crosses land exactly on the verticals.
- A `Rule` goes at the **top of every major section**, under the nav, and under every index row. Budget: **≤ 16 rules per page**, **≤ 64 crosses per page**.

**3. `Frame.astro`: a four-edge box frame (used for tool cells, work panels, form, media).**

```html
<Frame as="article" class="…">…
  <!-- renders: <span class="fr fr-t"> <span class="fr fr-r"> <span class="fr fr-b"> <span class="fr fr-l"> (aria-hidden) -->
</Frame>
```

- Each edge is an absolutely positioned 1px `--line` element.
- Origins are set so the frame draws **clockwise** from the top-left: top from the left, right from the top, bottom from the right, left from the bottom.
- `data-frame` goes on the host. `data-hot` is added automatically, so hovering the frame lights the bay lines behind it (3.4).

**4. `Cross.astro`: a standalone `+` mark** for free-standing registration marks, e.g. the corners of the hero H1 box and the 404 page. It's the same styling as `.rule-x`.

### 3.3 Data-attribute API (page markup uses only these; B implements them, C consumes them)

| Attribute | On | Meaning |
|---|---|---|
| `data-grid-frame` | GridFrame root | The fixed bay lines: intro draw, velocity shear, hover hot-lines |
| `data-rule="start\|end\|center"` | Rule root | A full-bleed rule that draws scrubbed to scroll from that origin |
| `data-rule-dash` | Rule root | Dashed 16/16 variant (static dash; the draw still animates) |
| `data-rule-cross` | Rule root | Render and animate the intersection crosses |
| `data-frame` | any box | 4-edge frame that draws clockwise when it enters |
| `data-hot` | any hover target | While hovered, the bay lines it spans go ink (pointer: fine only) |
| `data-split="lines\|chars"` | heading | SplitText reveal (never on the LCP H1; see §4.3) |
| `data-kinetic="wdth"` | hero H1 / page H1 | Width axis scrubbed 125→75 as the element scrolls out |
| `data-reveal="rise\|cut"` | block | `rise`: y 24px→0 plus opacity. `cut`: hard stepped appear. Used with `data-reveal-stagger` on the parent |
| `data-rail` / `data-rail-step` | Phase 4 process steps | Vertical rule scrubbed with scaleY; the active step gets the state fill (replaces `data-ruler`) |
| `data-surface="ink"` | section | Inverted surface: swaps the line tokens, focus ring and selection |
| `data-vt="<name>"` | element | `view-transition-name` pairing (Phase 4 row→case study) |

All other old attributes are removed with their modules: `data-scramble`, `data-hud`, `data-bpm`, `data-cursor`, `data-scope`, `data-glyph`, `data-ruler`, `data-reveal="lines|fade"`.

### 3.4 Motion behaviours (built in B's `src/motion/lines.ts`)

**A. Intro draw (every page load, once).**
- The `.gf-v` lines go `scaleY 0→1` from the top, staggered 70ms from the left: 900ms, `expo.out`.
- Rules that are already in the first viewport draw `scaleX 0→1` from their origin over 700ms, 250ms after the verticals begin.
- Crosses pop in as the draw passes them: `scale 0→1` and `rotate 90°→0`, 240ms, `steps(3)`. This is the one deliberately "raw" stepped micro-moment.

**B. Scroll draw (scrubbed, continuous, reversible).**
- Every `data-rule` below the fold starts at `scaleX(0)`. Its progress is `p = clamp01((vh − (top − scrollY)) / (0.45·vh))`, which reaches full width by the time its top is 55% up the viewport.
- The draw **retracts when scrolling back up**. That's the difference from Uncommon Studio's one-shot.
- Crosses switch on (hard `steps(1)`) when `p` passes their x-fraction.
- `data-frame` edges run from the same master loop: top then right, bottom then left, each at 25% of the element's own progress window.

**C. Velocity shear (the "raw, alive" part).**
- The fixed verticals translate on X in proportion to scroll velocity: `x_k = clamp(v · 0.012 · s_k, −28px, 28px)`, where `s_k` runs from −1 (leftmost) to +1 (rightmost).
- The effect: the grid fans open when scrolling down and closes when scrolling up.
- Written with `gsap.quickTo(line, 'x', { duration: 0.55, ease: 'power3.out' })`, so the lines spring back to their exact gutter positions when scrolling stops.
- On `<768` the clamp is ±10px. Two lines on a phone should just breathe.
- The rules do **not** shear. They are the fixed horizon the verticals move against.

**D. Hover response.**
- Moving the pointer onto any `[data-hot]` element makes the bay lines at its left and right edges go ink: `.gf-v-hot` opacity 0→1, 120ms, `steps(2)`.
- Which lines those are is computed once at `pointerenter`: `Math.round((rect.left − containerLeft) / (bayW + g))`, from values cached on refresh plus a single `rect` read inside the enter handler, which is not a scroll path.
- `pointerleave` fades them out over 240ms `expo.out`.
- Only under `(hover: hover) and (pointer: fine)`.

**E. Page transition** (see §4.4): the new page is revealed bay by bay, and the GridFrame stays still above the wipe.

**Reduced motion** (`gsap.matchMedia()` `(prefers-reduced-motion: reduce)` branch plus a CSS fallback):
- Every line, rule, frame and cross is **fully drawn and static**.
- There's no shear. Hover still turns lines ink, but instantly (no transition).
- There's no view-transition wipe.
- Base CSS (A) *is* the reduced-motion and no-JS state. Only `motion.css` (B), under `html.js` plus `(prefers-reduced-motion: no-preference)`, sets the collapsed from-states (`scaleY(0)`, `scaleX(0)`).
- The existing 3s fail-open (`window.__motionReady`) removes `html.js` if the bundle doesn't claim them.

### 3.5 Performance rules (hard)

1. Only `transform` and `opacity` animate on lines, rules, frames and crosses. No `width`, `height`, `left`, `background-position` or `stroke-dashoffset`.
2. **One master ScrollTrigger** (`ScrollTrigger.create({ start: 0, end: 'max', onUpdate })`) drives every rule and frame draw plus the velocity shear.
   - Its `onUpdate` reads only `self.scroll()` and `self.getVelocity()` and cached numbers, then writes through `gsap.quickSetter(el, 'scaleX')`.
   - Element tops and heights are cached on `ScrollTrigger.addEventListener('refreshInit'/'refresh')` and after `document.fonts.ready`, with `ScrollTrigger.refresh()` called then.
   - **No `getBoundingClientRect` in any scroll path.**
3. Reveals (`data-reveal`, `data-split`) use **one `ScrollTrigger.batch()`** per attribute type, with `once: true`.
4. Extra triggers are allowed only for `data-kinetic` (≤ 1 per page) and `data-rail` (≤ 1 per case study).
5. Skip work for elements more than 1.5 viewports away: the master loop only iterates rules whose cached range overlaps `[scrollY − vh, scrollY + 2vh]`.
6. `will-change: transform` goes permanently on the 5 `.gf-v` elements only. Others get it via `gsap.set` at tween start and it is cleared at the end.
7. Limits: 5 fixed lines, ≤ 16 rules, ≤ 64 crosses, and ≤ 24 frame edges above the fold.
8. Everything is created top-to-bottom in DOM order (the refresh-order rule from the gsap-scrolltrigger skill).
9. `ScrollSmoother` is **not** used on these pages. Native scroll keeps the velocity honest and input latency at zero.

---

## 4. Motion system

### 4.1 Motion tokens (`tokens.css` for CSS; `src/motion/eases.ts` mirrors them for GSAP)

| Token | CSS | GSAP | Use |
|---|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | `expo.out` | draws, reveals, anything entering |
| `--ease-move` | `cubic-bezier(0.76, 0, 0.24, 1)` | `power4.inOut` | elements moving on screen (menu sheet, Flip) |
| `--ease-spring` | — | `power3.out` via `quickTo` | shear return, pointer-follow |
| `--ease-cut` | `steps(1, end)` | `steps(1)` | hard state swaps: crosses on, current nav, tab switch |
| `--ease-step` | `steps(4, end)` | `steps(4)` | "raw" stepped wipes: hover fill, page transition, menu open |
| `--dur-tap` | `100ms` | 0.1 | press feedback |
| `--dur-hover` | `180ms` | 0.18 | hover fills, hot lines out |
| `--dur-reveal` | `700ms` | 0.7 | text and block reveals |
| `--dur-draw` | `900ms` | 0.9 | intro line draws |
| `--dur-page` | `360ms` | 0.36 | view-transition wipe |
| `--stagger` | `60ms` | 0.06 | lines/words stagger |

- Never use `ease-in` on UI.
- Hover and press stay under 200ms.
- Nothing uses `transition: all`.
- Drop `CustomEase` and `ScrambleTextPlugin` from `src/motion/gsap.ts`. Built-in eases and `steps()` cover the language, and this makes the shared bundle smaller.

### 4.2 Hover and press language (identical everywhere)

- **Text links:** a 1px ink underline at rest. On hover a `--state` block wipes in behind the text from the left: a `::before` with `transform: scaleX(0→1)`, `--dur-hover`, `--ease-step`. The underline stays.
- **Primary button (`.btn`):**
  - At rest: an ink block, paper label (`--fs-label`, uppercase), `border-radius: 0`, 48px minimum height, 20px inline padding, an arrow icon after the label.
  - Hover: the fill changes to `--state` with ink text, again via a scaleX stepped wipe, and the arrow moves 4px right with `--ease-out`.
  - Press: `transform: translateY(1px)`, `--dur-tap`.
  - Disabled: `--paper-2` fill with `--ink-2` text, no wipe.
- **Secondary action (`.btn-line`):** a 1px ink border, transparent fill; same wipe.
- **Index rows (`[data-hot]`):** the whole row fills `--state` (stepped wipe from the left), the title shifts `x: 12px`, and the bay lines at its edges go ink. On pointer devices a media preview appears **locked to the bay** the pointer is in (never following the cursor 1:1): `clip-path: inset(0 0 100% 0 → 0)`, `--dur-reveal`, `--ease-out`.
- **Touch:** there's no hover state. Rows show their "View" affordance permanently, and `:active` gets the fill instantly.
- There's no custom cursor, no magnetic buttons and no tilt.

### 4.3 Kinetic type (GSAP SplitText)

- **The LCP H1 is never hidden, never split before paint, and never starts at opacity 0 or offset.** It is server-rendered at its final state.
  - Its only motion is `data-kinetic="wdth"`: a scrubbed ScrollTrigger (`start: 'top top'`, `end: 'bottom top'`, `scrub: 0.3`) that tweens the CSS custom property `--wdth` from 125 to 75 while the hero scrolls away. Below 768 it runs 108→75.
  - The name compresses like it's being pushed out by the next section.
  - **Guard:** the H1 box has fixed `block-size` (set from its first-render height on refresh) and `contain: layout paint`, so the width change never reflows the page.
  - If the Performance panel shows more than 4ms of layout per frame during the scrub on a mid-range device, fall back to `scaleX` on the same element (`transform-origin: left`). The effect stays; only the technique changes.
- **Section H2 and page H1 (non-LCP):**
  - `data-split="lines"` splits the heading into lines, wrapped in `overflow: clip` masks. It animates `yPercent: 105→0`, `--dur-reveal`, `expo.out`, `--stagger`.
  - They are pre-hidden only under `html.js` with motion allowed.
  - SplitText is called with `aria: 'auto'` (GSAP ≥3.13) so the accessible name stays intact, and it re-splits on resize with `autoSplit: true`.
- **`data-split="chars"`** is reserved for the 404 H1 and the stems console title. Characters arrive in `steps(3)` from a random `wdth` in the range 75–125 to 100. This is the "raw" type moment, used sparingly.
- **No scramble, no glitch, no text shuffle** anywhere.

### 4.4 Page transitions (native cross-document View Transitions, hard cut)

```css
@media (prefers-reduced-motion: no-preference) {
  @view-transition { navigation: auto; }
  ::view-transition-old(root) { animation: none; }           /* old page just sits there… */
  ::view-transition-new(root) { animation: vt-bays var(--dur-page) steps(4, end) both; }
  @keyframes vt-bays { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
  @media (max-width: 1023px) { ::view-transition-new(root) { animation-timing-function: steps(2, end); } }
  @media (max-width: 767px)  { ::view-transition-new(root) { animation-timing-function: steps(1, end); } }
  ::view-transition-group(grid-frame), ::view-transition-group(nav) { animation: none; }
}
```

- The four steps equal the four bays, so the new page is **cut in one bay at a time**, left to right, under stationary grid lines. On a phone it's a single hard cut.
- After `pagereveal`, the intro draw runs on the new page's rules only; the verticals are already drawn.
- Remove the old `.vt-scanline` element and CSS. The inline `pagereveal` listener stays only if it's needed to flag `html.vt-reveal` for skipping the vertical intro. Recompute the CSP hash (`npm run check:csp`) if the inline script changes.
- **Flip** stays for in-page reflow only (work filters, the Phase 4 lightbox).

---

## 5. Composition

In the diagrams below, `│` is a bay line and `─┼─` is a rule with crosses. At 1440 there are 4 bays (B1–B4).

### 5.1 Shell (A)

- **Nav:**
  - `position: sticky; top: 0`, 64px tall, `--paper` background (solid; no glass), with a `GridFrame local` inside so the lines continue through it. A `Rule data-rule="start"` sits on its bottom edge.
  - B1 holds the WV monogram (`/img/monogram-white-trans.png`, kept for parity) at 28px, drawn ink on paper with `filter: invert(1)`. Next to it, "William Vernon" in `--fset-label`.
  - B2–B4 hold the 7 links in `--fs-label` uppercase, spaced along the bays.
  - The current page's link gets a `--state` fill plus `aria-current="page"`.
  - The socials move out of the nav into the footer and mobile menu.
  - Below 1024 the links collapse into a "Menu" text button.
  - `view-transition-name: nav`.
- **MobileMenu:**
  - A full-screen `--paper` sheet that opens with a stepped vertical wipe: `clip-path` stepped over 4 steps, `--dur-page`.
  - The 7 links are stacked at `--fs-h1` in `--fset-display`, each separated by a dashed `Rule`.
  - Social icons sit at the bottom.
  - Focus trap and Escape-to-close stay (the a11y structure from Phase 2 is kept).
  - The `legacyLabel` links stay reachable as they are today.
- **Footer (`data-surface="ink"`):**
  - Full-bleed ink ground with a `GridFrame local` in `--line-inv`.
  - B1–B3: the contact email as a link at `--fs-h2`.
  - B4: social icon links (from `SOCIAL_LINKS`), then a "Back to top" `.btn-line` using the arrow `Icon`, replacing the `↑` glyph.
  - Delete the "vnon // online" status line, the BPM span and the status dot. They were Phase 2 chrome, not inventory.
- **Icon.astro:** the set stays. All icons use a 1.5px stroke on a 24 grid and `currentColor`, with square line caps to match the brutalist rules.
- **Base.astro:**
  - Mona Sans import and preload.
  - Renders `<GridFrame />` before `<Nav />`.
  - Drop the `channel` prop, the cursor ring and `.vt-scanline`.
  - The `html.js` / `__motionReady` fail-open stays.

### 5.2 Home (`/`): hero plus four sections

**Hero (1440).** Full viewport minus the nav; typographic; no WebGL, no canvas.

```
│ DESIGN & MUSIC // Oxford Brookes Alum │                  │                      │ (label, B1)
│                                       │                  │                      │
│ William ─────────────────────────────────────────────────────────────  (mega, wdth 125, B1–B4)
│ Vernon                                │                  │                      │
─┼───────────────────────────────────────┼──────────────────┼──────────────────────┼─  Rule (center)
│ Adaptable designer blending… (body,   │                  │ Generative Design &  │
│ max 40ch, B1–B2)                      │                  │ Creative Technology. │ (H2, B3–B4)
│ [EXPLORE_PROJECTS →]  > AI projects   │                  │                      │
│                       > experiments   │                  │               Scroll │ + a 64px vertical tick
```

- The label is `p.hero-subtitle` content in `--fs-label`, `--ink-2`, uppercase; no scramble.
- The H1 is `home.headings[0]`, as two lines ("William" / "Vernon"), with each word in a span so the break is deterministic.
  - It carries `data-kinetic="wdth"` and the `Cross` marks at its box's top-left and bottom-right.
  - Most of the page's weight is black type crossing the grey bay lines. That tension is the signature image.
- The H2 tagline is **plain text, `&` included** (index.h.022). **The `data-glyph` / `aria-label` workaround is deleted.** Parity for `index.copy.044` is handled by the checker alias (§6).
- CTAs:
  - `explore_projects` → `.btn` (ink) to `/projects`.
  - `> AI projects` and `> experiments` → text links to `/AI` and `/experiments`, stacked in B2.
- "Scroll" (index.copy.049) sits bottom-right in B4, with a 64px 1px ink tick under it that loops `scaleY` 0→1 from the top, then 1→0 from the bottom (1.6s, `power4.inOut`). It's paused under reduced motion and hidden once `scrollY > 0`.
- **768:** the H1 still fits across B1–B2, the H2 sits under the body, the CTAs go in one row, and "Scroll" goes bottom-right.
- **390:**
  - Order: label, H1 at `--wdth: 108` across the single bay, a rule, the H2, the body, the CTAs stacked full width (the primary `.btn` is 100% wide and the text links sit in a row below it), then "Scroll" hidden.
  - The hero is `min-height: auto` with 96px top padding, and the H1 stays above the fold.

**Section 1, Featured Work (`FeaturedWorkIndex`): an index, not cards.**
- A `Rule data-rule-cross` sits on top. The H2 "Featured Work" is in B1–B2 with `data-split="lines"`.
- 4 rows (Smuggler's Outpost, Amplified Spaces, Monolithic Survival, Topographic AV). Each row is an `<a data-hot>` spanning B1–B4, separated by dashed rules.
  - B1: the "Project" label (`--fs-label`, `--ink-2`).
  - B2–B3: the title at `--fs-row` (`--fset-title`) plus the description (`--fs-small`, `--ink-2`, clamped to 2 lines, fully shown on focus/hover).
  - B4: tags plus `View_Case_Study →`, right-aligned.
- Hover: a row fill plus a media preview clipped into B4, over the row's own height × 1.6. The media URLs are the existing card images and videos from `home.featuredWork`, unchanged.
- 390: each row stacks label, title, description, then CTA. The media shows inline above the title at 16:10 with `loading="lazy"`.

**Section 2, "AI as a Creative Partner." (`AiPartner`).**
- The H2 and intro copy are in B1–B2. The eyebrow becomes a plain `--fs-label` line, with no scramble and no channel label.
- The **toolset directory is laid out on the bays themselves**: a 4-column (1440), 2-column (768) or 1-column (390) grid of `Frame` cells, each exactly one bay wide.
  - Each cell holds the tool name (`--fs-h3`) and its category or description.
  - Frames draw clockwise, scrubbed. Each cell is `data-hot`.
  - The grid is literally the table.

**Section 3, Stems console (`StemsConsole`), `data-surface="ink"`.** This is the studio moment.
- Full-bleed ink with a `GridFrame local`.
- The title uses `data-split="chars"`.
- The mixer channels are **vertical strips aligned to the bays**. At 1440 each stem gets a half-bay strip with its own 1px `--line-inv` edge.
- The mute toggles are square `.btn-line` buttons (on ink). The on state is a `--state` fill with ink text plus `aria-pressed`.
- The level meter becomes one vertical 1px `--on-ink` line per strip, `scaleY` driven by the analyser. That is transform-only, and it's the only audio-reactive visual (2D DOM, no canvas).
- Remove the SignalScope hookup and the BPM event dispatch. All content, audio wiring and a11y stay.

**Section 4, Contact (`ContactChannel`).**
- A `Rule` on top.
- B1–B4: the email as a link at `--fs-h1` (it breaks at `@` below 768 via `<wbr>`). It has the stepped-wipe hover, and the existing copy-to-clipboard behaviour, confirmed with a static "Copied" label swap (`--ease-cut`) instead of scramble.
- B3–B4: the form inside a `Frame`. Inputs have a `--paper-2` fill, a 1px `--line-ink` bottom border, `--fs-body`, and labels in `--fs-label`. The submit is a `.btn`. Error and success states are shown in ink text with an icon and never rely on colour alone.
- B1–B2: the socials as a ruled list.

### 5.3 About (`/about`)

- **Hero:** the H1 "About & Credentials" at `--fs-h1` (`--fset-display`) spanning B1–B4. The old kicker becomes a `--fs-label` line in B1 (`data-scramble` removed; the `ChannelLabel` removed).
- **Body, as a bleibtgleich-style split:**
  - **B1 is a sticky label column** (`position: sticky; top: 96px`), holding the section H2 (Design Personality / Design Skills / Generative Design / Education / Experience) at `--fs-h3` weight 640.
  - **B2–B4 hold the content**, and each section opens with a `Rule data-rule-cross`.
  - Skills are a ruled list, with group names in `--fs-label`.
  - Education and experience are `details` accordions restyled as rows: summary equals the title at `--fs-h3`, plus dates or meta in `--ink-2`, plus a `+` Cross that rotates 45° to × when open (`--ease-cut`). The linked-project list is inside.
  - The contact block reuses the footer link style.
- Images (if any are on the page) span whole bays with no radius.
- **390:** the label column stops being sticky and sits above its content.

### 5.4 Work (`/work`)

- The H1 "Works" at `--fs-mega` (it's short, so it fills the width), with `data-kinetic="wdth"` (this is the page's LCP, so it's never hidden).
- The **three panels (Projects / AI / Experiments) are full-bleed stacked rows**, each ~60svh, separated by `Rule data-rule-cross`.
  - The title is at `--fs-h1` in B1–B3. The panel description and links are in B4.
  - The panel's media sits behind a clip in B3–B4 and reveals scrubbed (`clip-path` inset 0→ full, driven by the master loop) as the row crosses the viewport centre.
  - The whole row is `data-hot` and links to its page.
- Keep the INDEX/INFORMATION toggle if `WorkHubIndex` has it. The toggle is a two-segment `.btn-line` with the current segment filled `--state`, and switching uses Flip (`power4.inOut`, 500ms).

### 5.5 404

- New copy is allowed; this page isn't inventory. Replace "SIGNAL LOST", "NO CARRIER" and "Return to signal" (they're HUD voice).
- The H1 is "404" at `--fs-mega` with `data-split="chars"`. The body reads "This page doesn't exist, or it moved." The CTA is a `.btn` labelled "Back to home".
- **Signature:** on this page only, the GridFrame verticals are rendered **out of register**. Each line gets `data-gf-offset` with a static −40…+40px x offset, set in markup by A.
  - When the button is hovered or focused, the lines snap back into alignment: B tweens `x→0` with `steps(4)`.
  - Under reduced motion the lines are simply aligned.

### 5.6 Styleguide (`/styleguide`, noindex)

The sections, in order:
1. Palette swatches, each with its hex and the contrast table from §1, rendered from tokens.
2. The type scale: every `--fs-*` token with a live specimen in real content strings, plus the width axis at 75/100/125.
3. The grid: a demo showing bays, gutters and lines at the current breakpoint.
4. `Rule` variants (start, end, center, dash, cross).
5. `Frame`.
6. `Cross`.
7. Buttons and links in every state: rest, hover (forced via a class), focus, disabled.
8. Form controls.
9. The motion token table, with a "replay" `.btn-line` beside each behaviour: intro draw, scrub, shear (a note to scroll), hot lines, stepped wipe, split lines/chars, kinetic width.
10. The `data-*` API table from §3.3.

Remove every demo of ChannelLabel, HudReadout, scramble and SignalScope.

### 5.7 Guidance for Phases 4–5 (they inherit this system; the A/B judge runs at the end of each)

- **Projects index and case studies (Phase 4):**
  - The index is the same numbered-free row language as Featured Work, with `data-vt` pairing the row title to the case-study H1.
  - Case-study hero: the H1 at `--fs-h1` in B1–B3, and the meta (year, discipline, software) in B4 as a ruled list.
  - Process steps use `data-rail`, with the right-rail detail in B4.
  - Media spans whole bays.
  - The 16 World Plays Here mockups become a bay-aligned grid of `Frame`s.
  - Filters are `.btn-line` segments, with Flip for reflow.
  - The lightbox is a full-screen `--ink` surface with `GridFrame local`, opened with a stepped wipe.
- **Music (Phase 5):**
  - The whole page is `data-surface="ink"`.
  - The per-track palettes appear **only** as a full-bleed band behind each track chapter's artwork (the colour comes from the art). The UI stays ink, on-ink and state.
  - BPM and key stay as **data** in the track meta row (they're content), without the ticker chrome.
  - Visualisers are 2D canvas, drawn as 1px lines on the bay grid (a line per stem, like the stems strips). There's no scope and no WebGL.
  - Embeds use click-to-load facades, each a `Frame` with a `.btn`.
- **AI:** the same index-row language. Model and platform lists (`// DEPLOYED_PLATFORMS_&_MODELS`) are laid out as bay-cell tables like the home toolset.
- **Experiments:** a bay-aligned grid of `Frame` tiles, where one tile equals one bay. The hover shows the video preview clipped into the tile.

---

## 6. What to delete (builder A, first, alone)

| Delete | Notes |
|---|---|
| `src/components/SignalScope.astro`, `src/webgl/` (whole dir) | WebGL hero retired |
| `src/components/HudReadout.astro`, `src/components/ChannelLabel.astro` | Remove every import and usage: Nav, MobileMenu, Footer, home/*, work.astro, about.astro, 404, styleguide, and the stubs projects/AI/music/experiments.astro |
| `src/motion/scramble.ts`, `hud.ts`, `bpm.ts`, `cursor.ts` | A removes their imports from `src/motion/index.ts` so the build passes. B then owns `index.ts` |
| `src/motion/ruler.ts` | Replaced by B's `rail.ts` (`data-rail`) |
| `ogl` from `package.json` dependencies | `npm uninstall ogl` |
| `@fontsource-variable/archivo`, `@fontsource-variable/jetbrains-mono` | Replaced by `@fontsource-variable/mona-sans` |
| `src/data/scope-envelope.json` | Only SignalScope and scope.ts used it. `redesign/scripts/build_envelope.mjs` stays in the (unshipped) scripts folder, marked retired in its header |
| `channel` field on `NavItem`, `homeChannel()` in `src/data/site.ts`; `channel` prop on `Base.astro` | The CH-xx system is gone |
| `.cursor-ring`, `.vt-scanline` elements (Base) and their CSS | |
| `data-glyph` ampersand workaround in `index.astro` | The H2 renders the full text |
| In `src/scripts/home/stems-console.ts`: `import type { ScopeController }`, `scopeController()`, `attachAnalyser`/`detachAnalyser` calls, the two `vnon:bpm` dispatches | A makes this minimal compile fix. The `TRACK_BPM` const can stay only if it's still used |
| `scope`/HUD/`--accent`/`--accent-2` tokens and their styles in base.css/motion.css | New tokens only |

**Parity checker (C):** teach `redesign/scripts/check_dom_parity.py` the equivalence and remove the workaround.
- The extraction dropped the one-character `&` span, so `index.copy.044` ("Generative Design Creative Technology.") is the same string as `index.h.022` minus the `&`.
- Add `EQUIV = {"index.copy.044": "index.h.022"}`.
- In `main()`, when an item id is in `EQUIV`, check the target item's label (with the `h\d: ` prefix stripped) using `has_text`. Report it as `ok` with the note `equiv index.h.022`, and fall back to the item's own label.
- The gate still has to exit 0 for `index,about,work`.

---

## 7. File-ownership contract (no two builders edit the same file)

### Builder A: tokens, shell, grid markup, deletions (runs FIRST, alone; must leave `npm run build` and `npm run check` green)

- **Owns:**
  - `src/styles/tokens.css`, `src/styles/base.css`
  - `package.json` (plus the lockfile)
  - `src/layouts/Base.astro`
  - `src/components/{Nav,MobileMenu,Footer,Icon}.astro`
  - **new** `src/components/grid/{GridFrame,Rule,Frame,Cross}.astro`
  - `src/pages/404.astro`
  - the stub pages `src/pages/{projects,AI,music,experiments}.astro` (ChannelLabel removal plus the new H1 styling only)
  - `src/data/site.ts`
  - `public/_headers` (CSP hash refresh via `npm run check:csp`)
  - `public/favicon.svg` (ink-on-paper redraw, optional)
  - every deletion in §6
- **Build-unblocking exception:** before B and C start, A may make *minimal* edits in B's or C's files, only to remove imports and usages of deleted modules and components so the site compiles. That covers `src/motion/index.ts`, `src/motion/gsap.ts`, `src/scripts/home/stems-console.ts`, `src/components/home/*`, `src/components/work/*`, and `src/pages/{index,about,work,styleguide}.astro`. A lists every such touch in its handoff. Once B and C start, those files belong to them.
- **Delivers:**
  - Base CSS that renders every line, rule, frame and cross **fully drawn and static**: the reduced-motion and no-JS truth.
  - Global type and colour, `.container`, the bay grid utilities (`.bays`, `.span-1…4`, `.start-1…4`), `.btn`, `.btn-line`, the text-link style, form control base styles, the `[data-surface="ink"]` token swap, `::selection`, focus, scrollbar and caret.
  - The components' markup exactly matches the §3.3 API.
  - The fit test (§2) passes.

### Builder B: motion (after A; parallel with C)

- **Owns:**
  - `src/motion/*`, including the new `lines.ts`, `kinetic.ts`, `hover.ts`, `rail.ts`, and rewritten `reveal.ts`, `transition.ts`, `eases.ts`, `gsap.ts` and `index.ts`
  - `src/styles/motion.css`
- **Implements:** §3.4 (intro draw, scrub draw with its retraction, velocity shear, hot lines, 404 re-register), §4 (tokens, SplitText lines/chars, kinetic `wdth` with its perf fallback, `data-reveal` rise/cut through a single batch, the view-transition CSS, hover-fill wipes), and every `gsap.matchMedia` reduced-motion branch.
- **Rules:**
  - B never edits markup or base.css. If a hook is missing, B reads it through the §3.3 attributes only. Anything B can't reach is noted in PROGRESS.md for the fix pass, not patched in someone else's file.
  - Pre-hidden states live only in motion.css under `html.js` plus `(prefers-reduced-motion: no-preference)`, and never apply to the LCP H1.

### Builder C: pages onto the system (after A; parallel with B)

- **Owns:**
  - `src/pages/{index,about,work,styleguide}.astro`
  - `src/components/home/*`, `src/components/work/*`
  - `src/scripts/home/*`, `src/scripts/work/*`
  - `redesign/scripts/check_dom_parity.py`
- **Implements:** the §5.2–5.4 and §5.6 compositions using only A's tokens, utilities and grid components, and B's `data-*` API. It keeps every content wiring, a11y structure (headings, landmarks, labels, `aria-pressed`, `details`) and behaviour (stems audio, contact form, work toggle).
- **Parity:** the §6 checker tweak. It must pass `check_dom_parity.py --dist dist --pages index,about,work` with exit 0 and `extract_content.py --check-assets`.
- **Rules:**
  - Never hand-type content copy; read it from `src/content`.
  - No `<style>` block may redefine a token. Component styles only use them.

**Order:** A → (B ∥ C) → Opus verify (A/B judge plus global gates) → one fix pass.

---

## 8. A/B judge reference set (Phase 2b verify, and again at the end of Phases 4 and 5)

The judge compares our pages at 1440 and 390 against:

1. **https://bleibtgleich.dev**: the closest live match to the brief (a persistent visible rule, a monochrome palette with one accent, hard cuts). It's a one-person designer/developer portfolio, and has won Awwwards SOTD plus the Developer Award.
2. **https://uncommonstudio.com.au**: a studio portfolio (Awwwards SOTD, Developer Award, FWA) with a named hairline-rule system that draws in `scaleX`/`scaleY` on scroll. It's the direct benchmark for our line motion.
3. **https://madebynull.com**: Awwwards SOTD, and the "minimal" pole. It checks that we aren't over-decorating.
4. **https://eloyb.design**: GSAP SOTD and Awwwards HM. It's the benchmark for type-as-image and aggressive GSAP sequencing. Judge the craft only (its neon-lime palette is out of scope).

cloudflare.com is **excluded** from the judge. It's the technical source of the line primitives but not an Awwwards-standard portfolio, and its motion is deliberately ambient, so comparing a portfolio against a corporate marketing site would skew the Creativity and Design scores.

**Target:** ≥ 7.5 on Design 40 / Usability 30 / Creativity 20 / Content 10 for each page, and not clearly behind any reference. On top of that, the global gates: parity 100%, axe 0 serious, reduced motion verified, no horizontal overflow at 360–1440, and Lighthouse on the preview.

---

Skills used: impeccable, emil-design-eng and gsap-scrolltrigger. Their roles in this spec:
- **impeccable:** the world and colour calibration (it kept us off "near-black + neon" and "cream + terracotta"), the font reflex list (it ruled out Space Grotesk, Inter-as-display and mono costume, and led to Mona Sans with its width axis), and the craft floor (no eyebrows, cards or section numbers; themed browser surfaces; a contrast floor).
- **emil-design-eng:** easing and duration tokens (expo out, no ease-in, hover under 200ms, interruptible `quickTo` springs, transform/opacity only).
- **gsap-scrolltrigger:** the single master trigger plus `batch()`, top-to-bottom creation, and refreshing after fonts and layout changes.
