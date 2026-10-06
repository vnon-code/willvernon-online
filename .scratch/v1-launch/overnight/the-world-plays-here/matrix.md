# The World Plays Here: matrix (machine /23 from tools/score.cjs; judged 9, 14, 15-readability by the reviewer)

| Variant | Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Raw |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| WA | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 1.06, 623/414ms, 1 slow (`r1b`); earlier runs 21 (776ms open, 4 slow, cold compile) and 22 (3 slow); one run lost to an HMR reload (all 0) |
| WB | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 1.03, 603/412ms, 0 slow |
| WC | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 1.13, 598/421ms, 1 slow; try 1: 22 (3 slow) |

Stills: `stills/r1/` (WA's scored run in `stills/r1b/`). Judged criteria pending.

## Results log
- r1 build: WA, WB, WC all 23/23 machine. Phone: no overflow (0px), opens and closes on all three.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Judged /7 | Total /30 | Wins |
|---|---|---|---|---|
| WC | 23 | 5 | 28 | 2 |
| WA | 23 | 5 | 28 | 1 |
| WB | 23 | 4 | 27 | 0 |

## Results log (r1)

- r1 WC (Orbit: logo loop as a planet with eight placements on a tilted dashed orbit, slogans as a fanned hand of cards, build as a circle cut in four beside the split-logo capture, grade as a drag-to-compare slider): 28/30. Inspiration: Lusion project pages, orbit diagrams, VFX before/after breakdowns.
- r1 WA (Entry board: brief beside the key frame, five slogans struck through in red on scroll, four numbered Blender frames, media-plan table): 28/30. Inspiration: D&AD New Blood entry boards, an agency copy deck, an OOH media plan.
- r1 WB (Brand book: Mark/Line/Colour/Frame/Portrait spec spread, slogans as a ballot with one green X, snag-to-fix ledger, four stacked channel panels): 27/30. Inspiration: Pentagram, Koto and Collins identity pages, a ballot paper, Apple stacked panels.
- Best WC 28/30; gain n/a (first round); stop: continue. WA default stays in meta.json until r2 (WC wins the tie on judge wins 2 vs 1).

## Judges' notes (r1)

**Judge 1 (WA > WB > WC order of fixability; WC most inventive):** WA: monochrome, red strikes, closest to the site, but no SheetHead/Contents/SectionNo (c9 -1); strike list, frames and table stay grid-and-table; 'Too abstract.' sits under the fixed close at 375px. WB: no shared head/contents/numbering; green UI accent on ballot X and swatches breaks monochrome + red; snag ledger is the best process beat; channels are four image-left rows. WC: orbit, hand, quartered circle, slider: the 'impress me' body; c10 hit by solid green card and quarter 4, grade slider pixelated (bp9/bp10 cropped), 05 Subway tile covers XBOX wordmark.
Next round (WC): 1 swap to _shared SheetHead + SheetContents + SheetSectionNo (useSheetSections); 2 take UI green off (white or red-edged card, neutral quarter 4; green only in media); 3 grade slider: full 1287x663 frame, object-fit contain, or full-res frames from the PC; 4 move orbit tiles off the XBOX wordmark, pause orbit off-screen and under reduced motion; 5 at most one line or still for the AE/Premiere polish; 6 red strike-through on the four rejected cards.

**Judge 2 (WC > WA > WB on wow; WA cleanest):** WC: most impressive, different device per beat; green UI fill on chosen card and quarter 4; slider frames misaligned (sphere off-left vs centred), both captures soft; quarter-circle is text-only; own title/info block. WA: green only as the real underline under PLAYS, red only on strikes and counts, tight copy; rest is grid, list and table; no shared head; reason text wraps unevenly. WB: ballot and ledger good; title shown three times in two screens; no info rail; '02 LINE' own numbering; green ballot fill; stacked panels leave an empty right column.
Next round (WC): 1 shared shell (hero video in #before, title, hook, Year/Module/Tools rail, contents, SheetSectionNo "NN / TT Label", SheetCredits not TwCredits), orbit first beat; 2 fix slider at WC.vue:145-147 so the sphere lines up at x=50%, sharper sources; 3 cut green UI (red edge or tick); 4 put bp3/bp4/bp5 captures masked inside the quarters; 5 strike the four rejected cards in red as they fan in; 6 end on the outcome (logo-wrap loop or subway frame).

## Round 2: build (machine /23; judged pending)

| Variant | Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Raw |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| WC | 1 (baseline, unchanged) | | | | | | | | | | | | | 23 | 28/30 total, r1 |
| WC2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | first run |
| WD | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | share 0.65, 629/416ms, 1 slow; try 1: 20 (share 0.47, 40px gap line → credits) |
| WE | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | share 0.79, 594/418ms, 0 slow; previous run 22 (3 slow, noise); first build 23 but zoom fill bug |

Stills: `stills/r2/`.

## Results log (r2)
- r2 WC2 (WC refined): shared SheetHead/Contents/SectionNo/Credits; orbit is beat 01, tiles offset half a step so none sits under the XBOX wordmark (video scale 1.45 -> 1.1); hand fans in on view with red strikes on the four dead lines, pick card white with a red top edge; bp3/bp4/bp5/bp12 masked in the four quarters, plus the one AE/Premiere line; grade frames aligned on the sphere (both hold it at x ≈ 662px; a 1196px window from x 64), never upscaled; ends on the subway frame. No UI green.
- r2 WD (Transit): split-flap departures board for the five lines (Cut / Runs), the 10 s film as its edit (five tracks under a playhead that follows the film, drag to scrub; clip times read off the cut), the four channels as stations on a line diagram. Inspiration: Solari/Vestaboard boards, Premiere/AE timelines in VFX breakdowns, Vignelli/Beck line diagrams.
- r2 WE (Zoom out): pinned scroll-timeline zoom from the key visual out to the subway platform with PiPs of the other placements, the slogans typed and deleted on one line with a log, the comp as an exploded 3D stack of five layers, closing on the loop. Inspiration: Powers of Ten / Apple scroll zooms, type-and-delete headlines, exploded comp breakdowns (Framestore, ILM).

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Judged /7 | Total /30 | Wins |
|---|---|---|---|---|
| WE | 23 | 7 | 30 | 2 |
| WC2 | 23 | 6.25 | 29.3 | 1 |
| WD | 23 | 6.25 | 29.3 | 1 |
| WC (r1 baseline, re-judged) | 22 | 4 | 26 | 0 |

Best WE 30/30; gain +2 over r1 best (28); stop: 30/30. WE is the default in meta.json.

## Results log (r2, scored)
- r2 WE (Zoom out): 30/30. Pinned CSS scroll-timeline zoom (compositor only) from the key visual out to the subway platform, PiPs for the other placements, a still on phones; slogans typed and deleted on one line with a red caret and a reasoned log; comp as an exploded 3D stack of five layers that lift on pointing at their legend line; closes on the loop in a circle. Inspiration: Eames' Powers of Ten, Apple scroll zooms, type-and-delete headlines, exploded comp breakdowns (Framestore, ILM).
- r2 WC2 (WC refined): 29.3/30. Shared shell, orbit, dealt hand with red strikes, circle cut in four with bp captures, before/after grade slider, ends on the front-on subway frame. No UI green. Inspiration: Lusion project pages, orbit diagrams, VFX before/after sliders.
- r2 WD (Transit): 29.3/30. Letterboxed billboard head, split-flap board, five-track scrubbable edit, line-map stations. Inspiration: Solari/Vestaboard, Premiere/AE timelines, Vignelli and Beck line maps.
- r2 WC (baseline): 26/30 re-judged; old head, UI green, pixelated slider, 05 tile covers the XBOX wordmark.

## Judges' notes (r2)

**Judge 1 (WE > WC2 > WD; fix WE first):** WC: r1 baseline, own title/info block, no SheetSectionNo, solid green UI, 05 tile covers wordmark, pixelated slider, most varied devices per beat. WC2: shared shell, monochrome plus red, tiles clear of wordmark, ends on subway frame; faults: bp9/bp10 10KB webps blocky, slider seam lags handle ~15px (WC2.vue:528, clip-path inset on an img 107.6% wide offset -5.35%), text over busy quarter captures, 03 left column mostly empty. WD: shared shell, red only on CUT and playhead, clean distinct devices; no Blender capture anywhere, film plays twice, clip times inferred, labels cut off at 375px. WE: most impressive; faults: WE.vue:79 'Render' tagged After Effects while copy says re-exported from Blender, WE.vue:80 Type tagged Premiere Pro (unsupported), 02 desktop still is an empty block with a caret, closing circle echoes WC's planet, grey log text low-contrast on phone.
Next round (WE): 1 fix tool tags WE.vue:79-80 (Render 'Blender -> After Effects', PNG sequence with transparency; Type 'After Effects' or no tag); 2 render the chosen line at rest before typing and under reduced motion; 3 put the grade into the stack (Background layer swaps pushed green / toned on hover of its legend line) using full-quality bp9/bp10 from the PC; 4 replace the closing circle with the outcome film full-bleed (play in view, unmuted only on user action) or the front-on subway frame; 5 keep PiPs inside the zoom frame (overhang ~11px), raise phone log contrast; 6 optional ghost sixth layer for the topographic overlay, 'tried, removed' (p19). If WC2 carried instead: slider clip on a full-width wrapper (WC2.vue:528).

**Judge 2 (WD > WE > WC2 > WC; stills only):** WD: shared head with extra letterboxed billboard, monochrome plus red, three distinct real-beat devices, frame counts match story; labels truncate on phones. WE: three cinematic devices; 02 still reads blank (caret only); Render and Type tool labels wrong. WC2: fixes green, four devices; bp captures pixelated, grade slider a ~990px flat green slab, green Xbox mark dominates orbit, strike only partly drawn in the still. WC: old head, UI green, pixelated slider, 4 slow frames.
Next round (WD): 1 phone timeline: drop in-bar clip text and list 'track: clip' below, or show the clip under the playhead in the caption; 2 hang bp3/bp4/bp5 on the Render track when the playhead is over 'Quarters wrap' (native size); 3 tool labels: 'After Effects / Premiere' or none; 4 line map: crop mockups to cover, bigger or clickable thumbnails; 5 head: one media block (letterboxed billboard), key visual moves into 02 or becomes station one; 6 optional circle loop end card from WE.
