# Scroll-back depth: scoring matrix

The way back from a Section to the Landing. Scored per variant with `scroll-back-harness.js` (Playwright, 1440×900,
dark, a real 12-notch wheel flick up from About me; every frame sampled) plus three stills at scroll 700 / 480 / 240.
Run it with the Playwright MCP `browser_run_code_unsafe` (set `variant` at the top).

Each criterion scores 0–2. A variant needs 14+/16 and no 0 to be shown to Will.

| # | Criterion | 2 | 1 | 0 | Measured by |
|---|---|---|---|---|---|
| 1 | No bleed: no strip under the panel's top edge | 0px every frame | ≤2px | more | `maxBleed` |
| 2 | Clean margins: no card sliced where no panel edge is, no card beside the docked panel | 0 cut frames, none visible | soft edge | hard cut | `cutFrames`, `dockedSideVisible`, stills |
| 3 | Arrival: the last 40px home | ≤300ms | ≤500ms | slower (a crawl) | `tailMs` |
| 4 | Continuity: no jump | step ≤40px, jerk ≤20 | one spike | jumps | `maxStep`, `maxJerk` |
| 5 | Sequence: header holds to home, then goes; Learn More rises after | off ≤350ms, rise ≤600ms | late | out of order | `hdrHeldUntilHome`, `hdrOffMs`, `lmUpMs` |
| 6 | Frame budget | ≤2 frames >25ms | ≤6 | more | `slowFrames` |
| 7 | Depth reads: the Landing visibly falls behind the plate | layers part and recede | layers only | flat | stills (judged) |
| 8 | Will's rules: no opacity change, no glass, plate corners gone when docked | all kept | — | any broken | stills + code |

## Round 5 (2026-10-06)

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Total |
|---|---|---|---|---|---|---|---|---|---|
| A, current: full-width cut, Lenis crawl home | 2 | 0 (34 cut frames) | 0 (632ms) | 2 | 2 | 2 | 1 | 2 | 11 |
| B, feathered cut + glide home | 2 | 1 (soft fade) | 2 (243ms) | 2 | 2 | 2 | 1 | 0 (the feather is a fade) | 12 |
| C, side cards part outward, no cut + glide home | 2 | 2 | 2 (257ms) | 2 | 2 | 2 | 1 | 2 | 15 |
| D, C + the Landing recedes 8% | 2 | 2 | 2 (243ms) | 2 | 2 | 2 | 2 | 2 | 16 |

Home reached 1.47s → 1.01s after the flick in B–D.

## Round 6 (2026-10-06): iterate on D

Will: the filter and info plates need a better way to appear once home; the header needs a better change on Learn More.
Harness: `round6-harness.js` (header sampled on the way down, plates on the way back), plus stills mid-change.

### Plates back home (0–2 each, /12)

| # | Criterion | Measured by |
|---|---|---|
| 1 | Out of sight on the way back (they arrive with the Landing, not drift in with it) | `platesVisibleMidReturn` = 0 |
| 2 | In within 600ms of home | `platesInMs` |
| 3 | Order: chips, then the row, before Learn More | `chipsBeforeRow`, `lmInMs` |
| 4 | Will's rule: no opacity change | code |
| 5 | Reads as part of the strip | stills |
| 6 | Frame budget | `slowFrames` |

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | Total |
|---|---|---|---|---|---|---|---|
| P1, always there (parallax) | 0 | 2 | 1 | 2 | 1 | 2 | 8 |
| P2, rise (fade + 14px, chips down, row up) | 2 | 2 (292ms) | 2 | 1 (fades) | 2 | 2 | 11 |
| P3, unfold from the centre line (clip-path, no fade) | 2 | 2 (486ms) | 2 | 2 | 2 | 2 | 12 |

### Header on Learn More (0–2 each, /12)

| # | Criterion | Measured by |
|---|---|---|
| 1 | Background full before the panel reaches it | `uncoveredFrames` = 0 |
| 2 | Done before the scroll lands (no late pop) | `hdrLateMs` ≤ 0 |
| 3 | One beat: first change to last ≤350ms (≤500 = 1) | `hdrSpreadMs` |
| 4 | No collisions mid-swap | stills |
| 5 | Follows a hand scroll too (re-docking after a partial scroll up) | code |
| 6 | Frame budget | `slowFrames` |

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | Total |
|---|---|---|---|---|---|---|---|
| H1, current: fade over the last 120px, swap at the end | 2 | 0 (+222ms) | 0 (757ms) | 0 (burger over CONTACT) | 2 | 2 | 6 |
| H2, one 320ms beat as the panel enters the last 120px | 2 | 2 (−229ms) | 2 (292ms) | 2 | 1 (timed) | 2 | 11 |
| H3, fade over the last 240px, links swap as it starts | 2 | 2 (−243ms) | 1 (424ms) | 2 | 2 | 2 | 11 |

H2 and H3 tie; H3 recommended as the smoother of the two (Will asked for smoother).

**Verdict, round 6 (Will):** D + H3 locked. Plates: more options; P3 "just looks like a mask revealing it".

## Round 7 (2026-10-06): plates back home, physical entrances

Harness: `round7-harness.js`. A plate's visibility = opacity × clip × projected height (hinge) × the part not under the
centre card (tuck). Two criteria added for Will's note: the plates move as objects, and they come from the card.

| # | Criterion | 2 | 1 | 0 | Measured by |
|---|---|---|---|---|---|
| 1 | Out of sight on the way back | 0 visible | — | visible | `visibleMidReturn` |
| 2 | In after home | ≤600ms | ≤800ms | slower | `platesInMs` |
| 3 | Order: chips, then row, with Learn More | yes | partly | no | trace |
| 4 | Will's rule: no fade | none | — | fades | code |
| 5 | Frame budget | ≤2 slow | ≤6 | more | `slowFrames` (clean run) |
| 6 | No jumps | step ≤12px/frame | ≤24 | more | `maxPlateStepPx` |
| 7 | Moves as an object, not revealed by a mask | moves | drifts | masked | stills |
| 8 | Comes from the card | from its edges | from near it | from nowhere | stills |

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Total |
|---|---|---|---|---|---|---|---|---|---|
| P1, always there | 0 | 2 | 1 | 2 | 2 | 2 | 1 | 0 | 10 |
| P3, unfold (clip-path) | 2 | 2 (556ms) | 2 | 2 | 2 | 2 | 0 | 1 | 13 |
| P4, tuck: slide out from behind the card | 2 | 2 (459ms) | 2 | 2 | 2 | 2 | 2 | 2 | 16 |
| P5, deal: tuck, then tag and tools fan out from behind the name | 2 | 1 (618ms) | 2 | 2 | 2 | 2 | 2 | 2 | 15 |
| P6, hinge: fold open from the card's edges | 2 | 2 (396ms) | 2 | 2 | 2 | 2 | 2 | 2 | 16 |

P4 and P6 tie; P4 recommended: the slide from behind the card reads at a glance, while P6's fold on thin plates reads
partly as a squash. Fixed before showing: P5's tool tiles showed over the name while gathered (now under it); P5 sped up
from 792ms.

**Final pick (Will, 2026-10-06):** D + H3 + P5, folded into the real code; the options panel and losing variants are deleted. 7 rounds in all.
