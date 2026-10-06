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
