# Project Sheet: scoring matrix

Ticket: [Project Sheet rework](tickets/08-project-sheet.md). Test project: Amplified Spaces.
Scored per variant with `project-sheet-harness.js`: run it in the page through the browser pane at 1440×900, dark mode. It clicks
through the Gate, steps the strip to Amplified Spaces, clicks the centre card, samples every frame of the open and
the close, and takes stills mid-open and once the Sheet has settled.

Each criterion scores 0–2. A variant needs 17+/20 and no 0 to be shown to Will.

| # | Criterion | 2 | 1 | 0 | Measured by |
|---|---|---|---|---|---|
| 1 | The teaser itself grows: one media box travels from the card's rect to its Sheet rect, video keeps playing | no step >60px/frame, no flash, time continues | one step or a re-buffer | a swap or a cut | `mediaMaxStep`, `videoRestarted` |
| 2 | The Sheet builds around it: body arrives after the media has mostly landed | body first visible ≥ 60% into the media's travel | overlaps earlier | body before media | `bodyStartPct` |
| 3 | The Landing drops away: side cards, chips, info row, Learn More and HUD out of sight when the Sheet settles | all gone by the media landing | gone by the end | some left | `landingLeftovers`, `landingGoneMs` |
| 4 | Dots in the margins: the dot field shows beside the Sheet, unblurred, undimmed | ≥ 64px clear each side, no blur, overlay ≤ 0.25 | narrower or dimmed | blurred or hidden | `marginPx`, `backdropFilter`, `overlayAlpha` |
| 5 | Media first: the work fills the first view and the Sheet has more than one piece | media ≥ 55% of the first view, ≥ 4 media | one of the two | neither | `mediaShare`, `mediaCount` |
| 6 | Close reverses: the media folds back into the card and the Landing returns | end rect within 4px of the card, Landing back | within 16px | elsewhere / Landing missing | `closeOffPx`, `landingBack` |
| 7 | Timing: open settles ≤ 700ms, close ≤ 450ms | both | one | neither | `openMs`, `closeMs` |
| 8 | Frame budget, open + close | ≤ 2 frames > 25ms | ≤ 6 | more | `slowFrames` |
| 9 | Reads as this site: lit edges, plates, Host Grotesk, red as accent only | judged pairwise, both orders | — | — | stills (judged) |
| 10 | Will's rules: no blur, no glass, focus moves in and returns, Escape closes, Back closes, `/work/<slug>` URL, reduced-motion path | all kept | — | any broken | code + harness |

## Round 1 (2026-10-06)

Brief (Will): the teaser panel expands and collapses; the Sheet builds around it; the other elements drop away so the
dots stay in the margins; no blur; a centred sheet but try different things; media first; content felt thin.

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0, current: clip-path reveal over a blurred dim | 0 (new video from 0s) | 1 (arrives with the media) | 0 (6 left) | 0 (blur 6px, 0.6 dim) | 0 (0.29, 1 piece) | 0 (373px off) | 2 (578 / 394ms) | 2 (1) | 0 | 0 (blur) | 5 |
| A, Hero column: hero grows, body rises below, Landing falls | 2 (max 51px) | 2 (68%) | 2 (322ms) | 2 (180px, 0.2) | 1 (0.50, 13 pieces) | 2 (0px) | 2 (691 / 446ms) | 2 (1) | 2 | 2 | **19** |
| B, Stage and plates: fixed stage, plates deal out, filmstrip; cards part sideways | 2 (max 45px) | 2 (65%) | 2 (321ms) | 2 (215px, 0.2) | 2 (0.58*, 14) | 2 (0px) | 1 (713 / 420ms) | 2 (1) | 2 | 2 | **19** |
| C, Split: sticky media left, text scrolls right; Landing recedes | 2 (max 46px) | 2 (68%) | 2 (208ms) | 2 (96px, 0.2) | 1 (0.38, 8) | 2 (0px) | 2 (682 / 430ms) | 2 (1) | 1 | 2 | 18 |

\* B's share counts filmstrip tiles clipped by the strip's edge, so it reads slightly high.
Criterion 9, pairwise both orders: A = B (tie both ways), A > C and B > C (both orders), every variant > 0.
Open notes: C re-crops vertical (AI) teasers once the box lands. Opened from a Section, the panel shows through the 0.2 dim.

### Results log

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| 0 | 1 | 5 | baseline | today's Sheet |
| A | 1 | 17 | discarded | first-frame leap 235px (the drawer curve starts fast) |
| B | 1 | 17 | discarded | first-frame leap 225px; open 727ms |
| C | 1 | 17 | discarded | first-frame leap 165px |
| A, B, C | 2 | 19 / 19 / 18 | kept | the flight eases in (`easeGrow` 0.5, 0, 0.2, 1); body still starts ≥ 65% in |

**Verdict, round 1 (Will):** build on A, with changes. The project info needn't copy the Landing's plates. No gaps
between sections. The header as it is on the Sections (docked), and the content area's edges as the Sections panel's.
Present the work more creatively than image, text, image, text. Pull references for inspiration, develop more
options, and read the original uni project files to tell the project's story from the source material.

## Round 2 (2026-10-06): build on A

Will's notes (verdict above) become criteria 11–14. Criteria 1–10 unchanged. Harness: `project-sheet-harness.js`
plus `round2-harness.js` (header, edges, gaps). Pass: 24+/28 and no 0.

| # | Criterion | 2 | 1 | 0 | Measured by |
|---|---|---|---|---|---|
| 11 | The header is the Sections' docked header while the Sheet is open | same classes/state, solid, links inline | close but differs | Landing header or none | `headerDocked` |
| 12 | The Sheet's edges are the Sections panel's edges | same `--edges` border, radius and width as the panel | same border, other width | own style | `edgesMatch` |
| 13 | No gaps between sections: blocks meet edge to edge | max gap ≤ 1px, no bare background between blocks | ≤ 16px | larger | `maxGapPx` |
| 14 | Tells the story, not image, text, image, text | judged pairwise, both orders; uses the source material (the three rooms, the process) | — | — | stills + copy (judged) |

Harness fix before scoring (a measuring bug, not a new judge): the docked header's fill is its `::before`, so `headerDocked` reads that too.

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A, round-1 pick + header, edges, no gaps | 2 (47px) | 2 (61%) | 2 | 2 (200px) | 1 (0.48) | 2 | 2 (647 / 429) | 2 (3) | 1 | 2 | 2 | 2 | 2 (0px) | 0 (image, text, image) | 24, fails (a 0) |
| R, Rooms: a chapter per track, pinned rail, renders slide over | 2 (47px) | 2 (77%) | 2 | 2 | 1 (0.47) | 2 | 2 (665 / 420) | 2 (2) | 2 | 2 | 2 | 2 | 2 | 2 | **27** |
| S, Signal chain: sound → visual → network → room runs, red line | 2 (48px) | 2 (61%) | 2 | 2 | 1 (0.47) | 2 | 2 (634 / 415) | 2 (2) | 2 | 2 | 2 | 2 | 2 | 2 | **27** |
| T, Type stage: names behind the stage, 01/03, credits rail | 2 (48px) | 2 (72%) | 2 | 2 | 1 (0.47) | 2 | 2 (614 / 415) | 2 (1) | 2 | 2 | 2 | 2 | 2 | 2 | **27** |
| U, Double diamond: phase mosaics, captions on the images | 2 (48px) | 1 (53%) | 2 | 2 | 1 (0.47) | 2 | 2 (671 / 415) | 2 (2) | 1 | 2 | 2 | 2 | 2 | 2 | 25 |

Judged pairwise, both orders. 9: R = T = S > U (the mosaics are busier than the rest of the site) > A. 14: R, S, T and U
each tell it a different way and tie both orders; A alternates image and text.
Open: media is 47% of the first view in every variant (the hero is held back by the frame's 200px margins).
Album art per track is a guess; B17 has none.

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| A, R, S, U | 1 | 23 / 26 / 26 / 24 | discarded | a stalled mount frame (67ms) made the box leap 75–216px |
| all | 2 | 24 / 27 / 27 / 27 / 25 | kept | the flight's clock advances ≤ 20ms a frame, so a stall delays it instead |

**Verdict, round 2 (Will):** T, Type stage, is the favourite.
