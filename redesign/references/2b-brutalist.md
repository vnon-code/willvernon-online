# Reference sweep 2b: brutalist / minimal-kinetic portfolios & studios (2025–2026)

Angle: live, Awwwards-caliber **portfolio or studio** sites from 2025–2026 that read as **minimal
brutalist** — raw, typographic, high-contrast — while still being **dynamic** in motion. Explicitly
excluded from the read: scanlines, telemetry HUD chrome, scramble text, neon. Screenshots (1440 + 390,
several with `--scroll`) are local-only and gitignored under `redesign/references/shots/2b/brutal/`
(contact sheets: `brutal-sheet.jpg` through `brutal-sheet6.jpg`). Referred to here by domain only.

Awwwards itself is egress-blocked from this environment, so every award claim below comes from web
search (Awwwards SOTD/Developer Award/Honorable-Mention listings, Codrops case studies, the sites' own
press) and every site was then opened live to verify it still exists and to read its actual computed
palette/type/motion — not taken on the search snippet's word alone.

**Sites tried and rejected** (for the record, so the next sweep doesn't repeat the trip): `gianlucagradogna.com`
and `www.leoparpeix.com` and `www.gionatannese.com` never finish loading in a headless pass (stuck on a
WebGL/percentage preloader — "Loading portfolio" / "60" / "99" — a gate our own CLAUDE.md tells us to
avoid, and unscreenshottable here besides); `griflan.com` and `pensatori-irrazionali.com` and
`warmnfuzzy.tv` are real 2025–2026 Awwwards winners but are serif-editorial or full-colour
maximalist/claymode agency sites, not brutalist or minimal; `www.uncommon.nl` is a *different* company
from the Melbourne "Uncommon" studio (`uncommonstudio.com.au`) that actually won the Developer Award for
its grid system — that real site is already covered in depth in `2b-grid.md` §5, so it is not repeated
here to avoid duplicate coverage.

---

## 1. bleibtgleich.dev — judge_candidate

Maksym Bleibtgleich's personal portfolio, built and rebuilt yearly (`bleibtgleich25` and `bleibtgleich26`
both won individually: Awwwards Site of the Day + Developer Award, GSAP Site of the Day, CSS Design
Awards). Webflow + Lenis (`unpkg.com/lenis`) under the hood; verified live via `curl`, not just the
snippet.

- **Palette:** nearly monochrome — white/off-white ground (`#fff`, `#fafafa`), near-black ink (`#000`/`#222`
  for body copy vs. pure black for display type), thin hairline dividers around `#ddd`/`#ccc`. A single
  muted rust/blood red (`#c31f26`–`#ff633d` range in its own CSS variables) appears only as a small
  chip/dot accent (seen top-right of the hero, and again as a small square block used as a placeholder/
  loading tile) — never as a background wash, never neon. This is close to the palette CLAUDE.md's own
  Awwwards checklist already asks for (red ≤5% of the frame, one job only).
- **Type:** **Akzidenz Grotesk Pro** for display (confirmed via `@font-face`) — a classic Swiss grotesque,
  set bold, tight-leading, sentence case not all-caps for the name ("Maksym Bleibtgleich") but the section
  labels and footer wordmarks ("bleibt" / "gleich", split across the two bottom corners as a watermark)
  run in the same grotesque at low opacity. A small monospace face carries metadata labels ("Based in
  Kyiv", "Working w/ TFTL", "Designer & Developer") top-left/top-right — the one place the design admits a
  second family. Scale span is large: the hero name sits around 32–40px while the headline promise below
  it ("Design Digital Products,…") jumps to a much larger display size; the "Work 24-26" section header,
  once scrolled to, is full-viewport-width bold caps.
- **Grid:** a genuine **visible hairline grid** — a thin vertical rule splits the hero into a narrow
  left column (metadata + a small black square, functioning as a loading/media placeholder) and a wide
  right column (name + headline), and the same rule reappears, still visible, once you scroll into the
  work index. It's a column frame, not a dense field — exactly the "few lines, high value" approach
  CLAUDE.md's own grid research (`2b-grid.md`) recommends over a busy graph-paper grid.
- **Motion feel:** Lenis-smoothed scroll (eased, weighted, not 1:1 with the wheel) carries a hard content
  swap between hero and "Work 24-26" — no crossfade filler, just a clean cut once the threshold is
  crossed, which reads as confident rather than fussy. Small square media tiles (case-study thumbnails)
  animate in as the work grid populates. No cursor gimmicks, no scramble, no glitch — the "dynamism" here
  is entirely in the scroll weight and the hard cuts between sparse states, not in decorative chrome.
- **Why raw-yet-premium:** the emptiness is deliberate — most of the viewport is bare white or bare black
  at any given scroll position, with exactly one or two type elements doing all the work. It never fills
  space just because space exists, which is the opposite instinct from the HUD/telemetry direction we're
  retiring.
- **Judge fit:** live, reliably screenshots clean (no loader gate), and is a single-person designer/
  developer portfolio directly comparable in scope to willvernon.online — the strongest reference in this
  sweep for the brief as written.

## 2. madebynull.com (Studio Null) — judge_candidate

Studio Null, an Awwwards Site of the Day (Jun 2, 2025) for a "digital experience studio" (client work for
Disney, Google, Lovable, Jasper AI cited in their own materials).

- **Palette:** almost pure two-tone — white background, **pure blue `#0000ff`** as the entire accent
  system (confirmed in the raw HTML: the "Start a project" pill button and the rotating 3D pyramid/prism
  icon are both this exact blue). Black wordmark and footer copy, nothing else. This is the most extreme
  "minimal" data point in the sweep — useful as the far end of the dial we can pull back from, since our
  brief wants "raw" energy Studio Null doesn't really carry on its own first screen.
- **Type:** bold grotesque sans caps wordmark ("STUDIO NULL") top-left, small mixed-case sans for nav
  ("Info", "Start a project") and a small mono-flavoured footer credit line ("Design and engineering for
  standout brands" / "London, 2025-26"). Scale contrast is modest on the first screen — most of the
  typographic drama here is restraint, not size.
- **Grid/layout:** no visible rule lines on the first screen or after a scroll attempt (the whole first
  viewport is the wordmark, the floating blue prism icon dead-center, and the footer credit line — a
  single-column, centered composition, not a multi-column grid). The 3D prism appears to be the site's one
  signature motion moment (a slow rotation/idle animation); it did not visibly change between the
  unscrolled and scrolled capture, suggesting either a very long intro state or that the real work grid
  sits behind a click-through this sweep didn't trigger.
- **Motion feel:** quiet — a single rotating 3D object as the whole "hero," everything else static. This
  is the calmest site in the sweep; it earns its Awwwards nod on craft and confidence rather than density
  of movement.
- **Why include as judge_candidate anyway:** it's the cleanest "minimal" pole in the set — comparable in
  scope to a studio/portfolio homepage, live, trivial to screenshot — and it's useful precisely as a
  check on whether our own hero risks being *too* busy relative to what a 2025 Awwwards jury still
  rewards for "minimal."

## 3. eloyb.design — judge_candidate (with a colour caveat)

Eloy Benoffi's own 2025 portfolio ("UI Designer — Webflow Dev — Glitch Artist"), Awwwards Honorable
Mention + GSAP Site of the Day + CSSDA Best UI/UX/Innovation. Built in Webflow + GSAP (Codrops ran a full
case study on it in Oct 2025).

- **Palette:** confirmed via raw HTML — `#2B2C27` (a near-black, slightly olive charcoal) paired with
  **`#D8FB81`**, a lime/chartreuse that reads as neon on screen. **This is the one place in the sweep that
  directly collides with the brief's "no neon" rule** — flagging it plainly rather than glossing over it:
  the palette itself is not usable as-is, but the typographic and motion craft under it is worth studying
  independently of colour.
- **Type:** enormous stacked all-caps grotesque headline running the full viewport width and then some —
  "USER INTERFACE / DESIGNER / WEBFLOW DEVELOPER & GLITCH ARTIST" — repeated/overlapping lines at a size
  where individual words crowd and clip the frame edges. Extremely tight leading, letters touch line to
  line. This is the most aggressive display-type-as-image treatment in the sweep, and the closest any site
  here comes to "bold... raw." Each headline is doubled and glitch-displaced (every line offset by a few
  px, with a dither/halftone texture laid over the whole background) so the type itself looks
  damaged/scanned rather than crisp digital type — the raw, unpolished feel comes from print/photocopy
  artefacting, not from motion.
- **Grid:** no rule-line grid — the composition is built entirely from the stacked type blocks; layout
  structure is implied by the baseline grid of the headline itself, not by visible dividers.
- **Motion feel:** per Codrops, aggressive/kinetic scroll-triggered GSAP sequences, glitch/displacement
  effects on type and image, "extreme animations" by the designer's own description — closer to
  maximalism than restraint, so it's a data point for how far "raw" can go before it stops reading as
  minimal.
- **Judge fit:** live, loads cleanly (no gate), and is exactly "comparable to a designer portfolio" (it IS
  one, same discipline mix as William Vernon's UI/creative-tech side) — worth keeping in the judge panel
  for its type-as-hero and glitch-texture craft, on the understanding the panel scores craft/motion and
  not the neon-lime hex value.

## 4. adambricker.com — reference

Adam Bricker, ASC (Emmy-nominated cinematographer) — Awwwards Site of the Day, Mar 13 2026.

- **Palette:** the UI itself is essentially just black-on-black chrome (bold white caps nav on a black
  ground); all colour in the piece comes from the film/photo media itself (confirmed teal/rust/brown tones
  in the CSS are photography grading, not UI tokens).
- **Type:** `Inter` for UI text, `Space Mono` for small metadata/labels (video titles, timestamps) — the
  same "grotesque + mono for readouts" pairing pattern several of these sites use, just with different
  specific families than ours.
- **Grid:** no visible rule-line grid; the whole first screen is a single full-bleed autoplaying video
  (a red-carpet clip from "Hacks") with minimal top-nav chrome overlaid.
- **Motion feel:** the "motion" here is the media itself (video), not animated UI — a full-bleed clip
  autoplaying muted, a simple "Hacks" caption fading in. Calm, cinematic, not kinetic-typographic.
- **Why it's only a reference, not a judge_candidate:** it's a portfolio in the sense of "a body of work,"
  but the discipline (cinematography) and technique (video-hero, near-zero typographic ambition) are far
  enough from a multidisciplinary designer/AI/music portfolio that it's not a fair A/B comparison — useful
  only for the "full-bleed media with minimal chrome" technique, which we already do with our own project
  hover-previews.

## 5. cydstumpel.nl — reference (counter-example: too maximal for "minimal")

Cyd Stumpel, "Portfolio 2025" — Awwwards Site of the Day. Included deliberately as a **contrast** case:
this is what "bold and raw" looks like when it leans playful/maximalist rather than minimal, so we don't
accidentally drift toward it.

- **Palette:** warm terracotta/burnt-orange (`~#e2532f`-family, sampled from the "CYD STUMPEL" wordmark
  chips) on a cream ground, plus a lavender/purple block and full-colour photography — a saturated,
  illustrated, "sticker sheet" palette, the opposite of restrained.
- **Type:** a bold condensed grotesque for the marquee wordmark (repeated "CYD STUMPEL CYD S…" scrolling
  ticker-style across the top) paired with a large serif italic for the tagline ("*Creative Engineer*") —
  a display pairing (grotesque + italic serif) worth noting even though the overall effect is warm/playful
  rather than brutalist.
- **Grid:** none visible — a scrapbook/collage layout of tilted, drop-shadowed image cards for blog/work
  entries, deliberately imperfect rather than grid-locked.
- **Motion feel:** a horizontal marquee/ticker of the wordmark, small floating sticker badges ("AWARD
  WINNING", cursor-cluster icon) — kinetic in a friendly, bouncy register, not a hard-cut or scroll-scrubbed
  one.
- **Why it's useful:** it's proof that "Awwwards SOTD 2025" and "minimal brutalist" are not the same set —
  several of this year's winners (this one, Pensatori Irrazionali, Warm & Fuzzy) are maximalist/colourful,
  so picking references purely off award badges without checking the live site would have pulled the
  wrong tone in.

---

## Synthesis for the D-brutalist-grid direction

- **The palette range across genuinely minimal sites is narrower than "brutalist" branding suggests:**
  bleibtgleich.dev and madebynull.com both land on white/black/one-accent (rust-red and pure-blue
  respectively), never more than one hue beyond the neutrals, and neither uses grey as a background —
  greys, where they appear, are hairline-divider weight only (`#ccc`–`#ddd`). This matches CLAUDE.md's own
  red-as-single-job rule and argues for one accent hue total, not a palette of "brutalist" primaries.
- **Type is grotesque + mono, not grotesque + display-serif or grotesque + condensed-HUD-mono:**
  bleibtgleich.dev's Akzidenz Grotesk Pro, adambricker.com's Inter, and eloyb.design's stacked grotesque
  headline all point the same direction — a workhorse Swiss/neo-grotesque at extreme size for display, a
  plain monospace (not a "technical" one) reserved for small metadata labels only. None of these sites use
  a monospace for anything larger than a caption.
- **A visible column-hairline (bleibtgleich.dev) reads as more "designed" than either a busy field grid or
  no grid at all (madebynull.com's grid-less centred composition).** One or two persistent vertical rules
  that survive the scroll, framing rather than filling, is the sweet spot this angle confirms — consistent
  with `2b-grid.md`'s own conclusion (frame lines over dense fields).
- **"Raw" without a grid still reads as brutalist if the type itself is oversized and slightly damaged**
  (eloyb.design's glitch/halftone type, run at a size that clips the viewport) — an alternative lever to
  grid lines for the "bold, raw" half of the brief, worth keeping as a fallback texture treatment (e.g. a
  grain/halftone overlay on hero type) as long as the colour underneath stays restrained, unlike eloyb's
  neon.
- **Hard cuts over crossfades read as more confident:** bleibtgleich.dev's Lenis-eased scroll still snaps
  cleanly between sparse states rather than dissolving between them — motion "dynamism" in the strongest
  reference here comes from scroll weight and decisive state changes, not from a high count of animated
  elements.
- **Caution:** don't let "Awwwards Site of the Day 2025/2026" stand in for "fits the brief" — roughly half
  the sites this search surfaced (Griflan, Pensatori Irrazionali, Warm & Fuzzy, Cyd Stumpel) are
  serif-editorial or full-colour maximalist, not brutalist/minimal, despite the same badge.

---

## Site list (structured)

| # | URL | Type | Palette | Type/scale | Grid | Motion | Judge candidate | Why |
|---|-----|------|---------|-----------|------|--------|------------------|-----|
| 1 | https://bleibtgleich.dev | portfolio | white/black + one muted rust-red accent (`#c31f26`-family), hairlines `#ccc`–`#ddd` | Akzidenz Grotesk Pro display, sentence case; mono for metadata labels; large size jump hero→headline→work-index | one visible vertical hairline column split, persists on scroll | Lenis-eased scroll, hard content-swap cuts (no crossfade), quiet | yes | closest live match to the brief: raw, minimal, one accent, real grid line, designer-portfolio scope |
| 2 | https://madebynull.com | studio | white ground + pure `#0000ff` accent, black type | bold grotesque caps wordmark, small nav/footer text, modest scale contrast | none visible; single-column centred composition | one slow-rotating 3D prism, otherwise static | yes | the "minimal" floor of the set — useful check against over-decorating our own hero |
| 3 | https://eloyb.design | portfolio | `#2B2C27` near-black + `#D8FB81` lime (neon — conflicts with brief) | huge stacked all-caps grotesque headline, clipped by viewport, tight leading, glitch/halftone-displaced | none; layout is the type block itself | aggressive GSAP scroll sequences, glitch/displacement on type and image | yes (palette caveat) | strongest "bold/raw" type-as-hero and texture craft; judge on motion/type, not the neon hex |
| 4 | https://www.adambricker.com | portfolio (cinematographer) | black UI chrome; colour comes only from film/photo media | Inter (UI) + Space Mono (labels) | none; full-bleed video hero | full-bleed autoplaying video, minimal caption fades | no | different discipline/technique (video-hero, near-zero typographic ambition); reference only for full-bleed-media-minimal-chrome |
| 5 | https://cydstumpel.nl | portfolio | warm terracotta/orange + cream + lavender block, full colour photography | condensed grotesque marquee wordmark + large italic serif tagline | none; scrapbook/collage of tilted cards | horizontal marquee ticker, floating sticker badges, bouncy | no | counter-example: same "2025 Awwwards SOTD" badge but maximalist/playful, not minimal — kept to show award badges alone don't guarantee fit |

