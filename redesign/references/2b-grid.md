# Reference sweep 2b: the grid-line system

Angle: how do sites build a **visible, structural rule-line grid** that is also **animated / scroll-reactive**,
for the Phase 2b direction (minimal brutalist, moving grid lines, "like Cloudflare's website" but more dynamic).

Screenshots (1440 + 390, `--scroll` for a scrolled-state second shot) are local-only and gitignored under
`redesign/references/shots/2b/grid/` (contact sheet: `sheet.jpg`). Referred to here by site name only.

---

## 1. Cloudflare (`cloudflare.com`) — deep dive, DOM/CSS-level

Inspected live with Playwright (`page.evaluate` computed-style + DOM walk, not just a screenshot). Cloudflare's
system is **two separate primitives**, not a dense column grid:

### A. Vertical frame lines (left/right edge of the content column)
- Plain `<div>`s, absolutely positioned, `width: 1px` (Tailwind `w-px`), full section height
  (`h-full`), one pinned `left-0`, one `right-0`.
- **Not a CSS border** — the dash is a background image:
  `background-image: linear-gradient(to bottom, var(--color-border-100) 50%, transparent 50%); background-size: 1px 32px; background-repeat: repeat-y;`
  → a crisp 16px-on / 16px-off dash, pixel-snapped (this is why it isn't `border-style: dashed`, which renders blurrier at 1px).
- Color: `--color-border-100: #f0f0f0` (light mode). Extremely low contrast — the line reads as texture, not
  a UI element.
- At 1440 viewport the four vertical line x-positions found were **-20, 120, 1319, 1459px**: the content
  frame sits at 120/1319 (1199px wide, effectively a max-width container with ~120px side margins), and a
  second, wider pair of lines sits 140px further out (-20/1459) — evidence of two nested container widths
  each carrying their own frame, not one 12-column grid. **There are no internal vertical column dividers**
  — Cloudflare frames the content, it doesn't grid it.

### B. Horizontal section-boundary lines ("corner lines")
- Real SVG, not divs: `<div class="corner-lines-container"><svg class="corner-line top-line">…<svg class="corner-line bottom-line">…`
  one pair per section.
- Each SVG is **200dvw wide** (`w-[200dvw]`), centered with `left-1/2 -translate-x-1/2`, so it always spans
  edge-to-edge regardless of the section's own container width, clipped by an `overflow-hidden` ancestor.
- The line itself: `<line x1="0" y1="0.5" x2="100%" y2="0.5" stroke="var(--color-border-100)" stroke-width="1" stroke-dasharray="16,16">` — same 16/16 dash cadence as the vertical lines, kept in one system.
- **Animation found:** each `.corner-line` carries `transition-opacity duration-[2000ms] ease-out` and its
  opacity is toggled between discrete states (0, 0.5, 1) as sections scroll into view — confirmed by sampling
  the same node's computed `opacity` at four scroll positions (0.5 → ~0.6 → ~0.7 → 0.99 as the section
  approached the top of the viewport). **This is a slow (2s) cross-fade keyed to scroll position via an
  IntersectionObserver-style toggle, not a stroke-dashoffset "draw."** The dash pattern is always fully
  present; only its opacity changes. Cloudflare's own grid is closer to *ambient, restrained texture* than
  the "bold, dynamic" motion the brief wants — worth stating plainly so we consciously go further.
- No "+"/tick corner markers were found on Cloudflare itself (checked every small SVG near intersections —
  they're all UI icons, chevrons/search/nav, not grid ticks). The plus-mark motif our brief describes lives
  on Vercel's Geist system, not Cloudflare (see below) — useful to know before copying the wrong reference.
- No GSAP or Framer on the page (`window.gsap` undefined); everything is Tailwind + vanilla CSS transitions.
- `DomainSearchApp` (a sub-app, not the marketing pages) uses a third technique worth noting separately: a
  repeating-`linear-gradient` **checkerboard background** for a denser grid feel —
  `--registrar-grid-line: color-mix(in srgb, var(--registrar-fg) 6%, transparent)`, drawn as two
  pseudo-elements (`:before` 1px horizontal lines, `:after` 1px vertical lines) at `background-size: 40px 40px`
  (80px at ≥768px), masked with a `radial-gradient` so it fades out toward the section edges. This is the
  "dense field of graph-paper lines with a vignette" pattern, distinct from the frame-line pattern above.

**Concrete tokens to reuse:** 1px hairline, 16px dash / 16px gap, near-invisible line color (≈6–10% of
foreground, not a flat gray), full-bleed horizontal dividers wider than their container, a fixed side margin
(not a column count) as the "grid."

---

## 2. Vercel — Geist design system `Grid` docs (`vercel.com/geist/grid`)

This is the direct source of the "+" corner-tick pattern the brief describes, and it's live and inspectable
(it's the *documentation* of the exact component, not just a page that happens to use it).
- The `Grid` component renders literal cell borders (`#ebebeb` per Vercel's own docs) plus a small **cross/plus
  glyph at every internal intersection** — 39 small (16×16–24×24) SVGs found on the page, one per grid
  junction, confirmed by DOM (`crossCount: 39`). This is the missing piece Cloudflare doesn't have: Vercel's
  grid literally marks each intersection with a "+", Cloudflare only frames edges.
- Grid is used as a real layout primitive (two-dimensional cell-and-guide system for docs/marketing pages),
  configurable `rows`/`columns` per breakpoint, with a "solid cell" option to occlude the guide lines behind
  opaque content and let them show through elsewhere.
- Screenshot shows the literal teaching example: an orange-stroked 3×2 grid with numbered cells, and a mobile
  variant showing a single labelled cell ("6") — Vercel treats the grid/tick system as a documented, reusable
  primitive, which is the right mental model for our own component (`Ruler`/grid-line component with a
  cross-mark subcomponent at column∩row intersections).

## 3. Resend (`resend.com`)

- Dark theme; **not** a Cloudflare-style structural frame. Its "lines" are short (150–600px) horizontal
  `div`s with a **gradient stroke**, e.g.
  `background-image: linear-gradient(90deg, transparent 0%, rgba(143,143,143,.67) 50%, transparent 100%)`,
  centered under headings/cards, `height: 1px` — a glow/beam accent rather than a grid. A parallel
  `hidden dark:block` variant substitutes a blue-tinted gradient for dark mode.
  Still relevant to the "line frame" family the brief names (Resend), but it's decorative accenting, not a
  section/column grid — worth citing for the *glow-hairline* technique (soft radial fade instead of a hard
  edge) rather than the grid system itself.

## 4. Linear (`linear.app`)

- Uses hairline dividers/keylines (`_shadow`, `_keyline`, `commentDivider` classes, `rgba(255,255,255,.08)`)
  inside app-screenshot mockups and section separators, plus a `var(--hero-line)`-stroked SVG path in the
  hero. This is UI chrome (dividers inside a product screenshot), not a page-level grid-line system — cited
  because the brief names it, but it's the weakest of the four "line frame" references for our purposes;
  Cloudflare and Vercel are the stronger models to build from.

## 5. Uncommon Studio (`uncommonstudio.com.au`) — judge_candidate

Melbourne design/dev studio; Awwwards Site of the Day + Developer Award + FWA winner. Live, real studio
portfolio (comparable in kind to willvernon.online: multidisciplinary creative studio site), which is why
it's the strongest **judge_candidate** from this sweep.
- Ships an actual named line system in its CSS modules: `styles_line__k1pq9` with color variants
  (`styles_line__silver` = `rgba(18,18,18,.2)`, `styles_line__black-grey` = solid `#121212`) and position
  variants (`__left`, `__bottom`) — i.e. a small design-system component for hairline rules, reused across
  the page for section frames and card edges, exactly the "named line primitive" pattern we should copy
  structurally (their equivalent of our future `Ruler`/`GridLine` component).
- **Scroll-reactive draw confirmed**: sampled the same line nodes' computed `transform` before and while they
  approached the viewport. Vertical lines start collapsed as `matrix(1,0,0,0,0,0)` (`scaleY(0)`, pinned to a
  transform-origin so they grow downward), horizontal lines start as `matrix(0,0,0,1,0,0)` (`scaleX(0)`,
  growing outward from a fixed origin), each with `transition: all`. This is a genuine "line draws in as you
  scroll" effect — closer to what the brief is asking for than Cloudflare's own (much subtler) opacity
  cross-fade. No GSAP/Lenis/ScrollTrigger detected globally, so it's most likely vanilla
  IntersectionObserver + CSS class toggle, which is a fine, cheap pattern to imitate with our own
  ScrollTrigger-driven version (`scaleX/scaleY: 0 → 1`, transform-origin per edge, staggered per section).
- Visual identity is bold reversed-out wordmark typography (large "UNCOMMON" logotype, big case-study
  imagery) over a near-black ground with the thin rule system framing sections underneath — i.e. minimal
  brutalist type + a quiet structural grid, not a dense visible grid overlay. That balance (loud type, quiet
  structural lines that *do* move) is the right target for our home page.

---

## Synthesis for the D-brutalist-grid direction

- **Two-part line system, not one:** (1) a small number of long, low-contrast, dashed **frame lines**
  (Cloudflare's technique: 1px, ~16/16 dash via background-gradient for verticals and `stroke-dasharray` for
  horizontals, color ~6–10% of foreground) marking section/content edges, plus (2) an optional dense
  **field grid** (Cloudflare's `DomainSearchApp` checkerboard technique: repeating-linear-gradient background,
  40–80px cells, radial-gradient mask) for hero/feature moments where more "graph paper" texture is wanted.
- **Corner ticks:** borrow Vercel's Geist pattern — a small "+" glyph at line intersections — since neither
  Cloudflare nor our other four references actually do this; it's the one specific detail from the user's
  brief ("+ tick markers") that needs to be original construction on top of the Cloudflare technique, not a
  copy of it.
- **Motion:** none of these sites do a dramatic scroll-scrubbed "line drawing across the screen" the way the
  brief wants ("bold, raw, very dynamic"). Cloudflare only cross-fades opacity (2s, non-scrubbed); Uncommon
  Studio does a real scaleX/scaleY 0→1 draw-in but as a one-shot reveal, not scrubbed to scroll position. Our
  direction should go further than any single reference: drive the frame lines' `scaleX`/`scaleY` (or an SVG
  `stroke-dashoffset`) directly off `ScrollTrigger` `scrub` so they visibly extend/retract as the user scrolls
  (not just fade or fire once), which is the differentiator the user explicitly asked for.
- **Tokens to carry into `directions/D-brutalist-grid.md`:** 1px hairline weight, 16px dash / 16px gap
  cadence, line color at 6–10% opacity of the ink color (never a flat mid-gray), full-bleed horizontal
  dividers wider than their content container, a fixed side-margin "frame" rather than a 12-column grid as
  the default, plus-tick component at chosen intersections, and a named `GridLine`/`Ruler` component (mirrors
  Uncommon Studio's `styles_line` module) driven by GSAP ScrollTrigger `scrub` for draw/retract, with
  `prefers-reduced-motion` falling back to the fully-drawn static state.

---

## Site list (structured)
