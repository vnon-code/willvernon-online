# Amplified Spaces: scoring matrix (overnight)

Criteria 1-14 are in `.scratch/v1-launch/project-sheet-matrix.md`; 15 is added tonight.

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
| 0 | 1 | 5 | baseline | today's Sheet |
| 11 | The header is the Sections' docked header while the Sheet is open | same classes/state, solid, links inline | close but differs | Landing header or none | `headerDocked` |
| 12 | The Sheet's edges are the Sections panel's edges | same `--edges` border, radius and width as the panel | same border, other width | own style | `edgesMatch` |
| 13 | No gaps between sections: blocks meet edge to edge | max gap ≤ 1px, no bare background between blocks | ≤ 16px | larger | `maxGapPx` |
| 14 | Tells the story, not image, text, image, text | judged pairwise, both orders; uses the source material (the three rooms, the process) | — | — | stills + copy (judged) |
| 15 | Phones at 375x812: no horizontal scroll, text readable, open and close work | all | one | none | harness + judged readability |

## Round 1 (2026-10-06): final, T2 30/30

Machine /23 from the scorer + judged /7 (criteria 9, 14, 15's readability).

| Variant | Machine /23 | Eye /7 | Total /30 | Judge wins | Layout |
|---|---|---|---|---|---|
| T2, track switcher | 23 | 7 | **30** | 3 | Strip of the three visuals as index; Discover with the brief's question beside Tom and the album art; Develop as edge-to-edge contact sheet; Define with B17 pinned wiping network, visual, room; rooms in one tabbed switcher (video, visual/room before-after slider, renders, sound/visual/room); counted problems grid; outcome. |
| T1, stage and swap | 23 | 6.5 | 29.5 | 1 | Room strip index; Develop film strip panning while pinned; Define as two lines of big type; one pinned stage swapping per track; counted problems list; outcome. |
| T3, double diamond | 22 | 6.5 | 28.5 | 1 | Phase strip index; sticky double-diamond rail; Discover, Develop swipe strip, Define halves, Deliver three columns, Problems; T's huge type crossing the B17 crit video once. |
| T, baseline | 21 | 6 | 27 | 0 | Round-2 favourite. |

### Results log

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| T2 | 1 | 30 | kept, default | best on both judges; varied beats; stop rule met (30/30) |
| T1 | 1 | 29.5 | kept | pinned stage leaves ~250px dead space at d2; tracks reuse one stage + 2x2 grid |
| T3 | 1 | 28.5 | kept | 3 slow frames; narrow Deliver columns wrap and crop; rail takes a quarter of the width |
| T | 1 | 27 | baseline | one device repeated per track; body starts at 53% (timing); phone big word clipped |

### Judges' notes

**Judge 1 (T2 > T3 > T1 > T):** T repeats one device three times and the process row is a plain grid. T1: film strip and Define type work; stage reused, dead top half at d2, dark small room thumbs. T2: beats vary most; contact sheet and B17 steps read cleanly on phone. T3: rail fits the process book and huge type crossing the video is strong, but the rail eats a quarter of the width, the Deliver chip '02 Fading Away' wraps, BEATS 06 vs rail 05.

**Judge 2 (T2 > T3 > T1 > T):** T2 uses a different device per beat, readable at 375; weak spots: no climax, empty bands around the Define video. T3: most original, but closed Deliver columns crop rooms to slivers, 02 Develop tile near black, 3 slow frames, and its 'WARM LIGHT' Onjuku label comes from `content/stories/amplified-spaces.json:55` ('light': 'Warm'), unsupported by the story. T1: ~250px dead black above the pinned stage; index tiles wrap. T: same repetition, body at 53%, phone word clipped.

### Next-round changes for T2 (not built; stop rule met)

1. Climax: T's huge type crossing behind the B17 crit video once, after the problems grid (check slowFrames, transform only).
2. Define: size the pinned B17 stage to full viewport height; make the network-visual-room wipe the visible event. Discover: brief's question in big type in the blank left cell.
3. Contact sheet: vary spans (kick detection and first TD network 2 columns, GPU particles tall); staggered scroll reveal, transform and opacity only; play tile videos in view or on hover.
4. Slim sticky phase marker 01-05 in the left gutter.
5. Copy: cut 'dusty' from 'Lo-fi and dusty' (story says only 'lo-fi'), keep PLACEHOLDER marking; drop or source 'light: Warm' for Onjuku (story.json:55).
6. Phone: index chips as number plus short name; before/after handle at least 44px; problems numerals smaller or white with a red rule.
