# Handheld Stories: matrix

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | 9 | 14 | 15r | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HA | Walkthrough | 2 | 2 | 2 | 2 | 2 (0.62) | 2 | 2 (614/410) | 2 (1) | 2 | 2 | 2 | 1 | 23 | | | | |
| HB | Collection record | 2 | 2 | 2 | 2 | 2 (0.63) | 2 | 2 (614/427) | 2 (2) | 2 | 2 | 2 | 1 | 23 | | | | |
| HC | UI kit | 2 | 2 | 2 | 2 | 2 (0.65) | 2 | 2 (610/418) | 2 (1) | 2 | 2 | 2 | 1 | 23 | | | | |

r1 log: HB first read 21 (open 720 ms, 4 slow frames); the ring's CSS turn now waits for `html[data-sheet=open]`, rescored 23. Stills: stills/r1/.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| HA | 23 | 6 | 29 | 2 |
| HC | 23 | 5.75 | 28.8 | 0 |
| HB | 23 | 5.25 | 28.3 | 0 |

## Results log (r1)

- r1 HA (Walkthrough: the head is a browser frame playing an 8 s cut of each of the four site pages in turn, address bar and storyboard chapter tabs following, a click jumps to a page; then the Oxford museum visit as a greyscale photo strip, a drag-to-turn Coiled Snake (44-frame sprite, arrow keys too), and all 150 roto frames as one grid beside a big '150'): 29/30. Inspiration: Figma prototype view and Vimeo chapters; Sketchfab and Apple product spin viewers; Pentagram/Locomotive contact-sheet process pages.
- r1 HC (UI kit: the four pages as a 2x2 of screens, the type scale as a ladder at 86/35/20/16, black/white swatches, the two faked components working for real, linear vs eased cursor lanes, the output clip with v1-v7 exports): 28.8/30. Inspiration: Vercel Geist / GOV.UK design-system docs, Storybook, Pentagram/Collins identity specimens, Emil Kowalski easing demos.
- r1 HB (Collection record: a vitrine with the netsuke ring turning beside the object-page clip and two exhibit figures, a museum wall label, a six-draft range slider, two catalogue rows sliding opposite ways, the database page as a filterable list beside its clip): 28.3/30. Inspiration: British Museum and Cooper Hewitt collection records and wall labels; Figma version history; Obys/Rejouice opposite-running marquees.
- Best HA 29/30; gain n/a (first round); stop: continue.

## Judges' notes (r1)

**Judge 1:** HA: shared title, info block, numbering and credits; four different devices, spark to object to craft. c10 loses a point: the roto grid is a large bright mint block, breaking monochrome plus race red. Copy says 'static photos'; source says static displays/dense panels. On phone the teaser and browser screen show the same landing twice. HB: monochrome with red slider accents, varied devices; section 03's '/ 04 CATALOGUE' is pale grey on white, barely legible (c9); wall label states the Edo dates twice; never shows the hook (faking a website in After Effects). HC: best fit to the 'couldn't code, so I animated it' line, strictly monochrome; skips the spark (Oxford) and object/roto story; INFO panel and lanes mostly empty at rest; 2x2 screens tiny at 375px.
Next round (HA > HC > HB; HA wins the HA/HC tie head-to-head): 1) make the 150-frame roto grid monochrome (alpha frames on black or paper, not keying green); 2) fix the stacked head (browser frame wraps the shell hero, or its cut starts on Catalogue); 3) add one beat for how the fake was built from HC (live 'Discover More' hover from two layers and an opacity keyframe, or v1-v7 chips with v7 kept); 4) copy: 'static displays, dense text panels' (story p7); 5) cap or self-scroll the roto grid on phone; check the close button vs the British Museum roundel.

**Judge 2:** HA: browser frame with chapter tabs (0:00/0:09/0:24/1:09 match the story), greyscale strip, drag-to-turn snake, big 150. Problems: mint-green roto block is the only non-monochrome slab; bottom rows mix huge cropped snakes with tiny ones; landing frame repeats the teaser above it on phone. HB: wall label, six-step slider, opposite rows, filterable list. Problems: '/ 04 CATALOGUE' light grey on white (d2); marquee seam shows a sliced British Museum disc and stray arc (d3); Edo period twice; Fig. 3 netsuke group photo has no source in story.md. HC: turns into a design-system doc after the head; HOVER/INFO panels and cursor lanes mostly empty; netsuke barely return until the output clip. Facts: specimen rows labelled Noto Sans but it is never loaded (HC.vue:314/405 fall back to UI font); 16 pt sample line 'Carved from wood or ivory...' (HC.vue:104) not in sources.
Next round (HA): 1) browser frame opens at Catalogue or becomes the head, no stacked duplicate; 2) near-black or transparent roto cells, all 150 at one uniform scale, keep the big '150'; 3) borrow HB's six-step draft slider or opposite catalogue rows (fix the seam first); 4) keep the 44-frame sprite lazy and small (one WebP sheet), start browser clips only in view; 5) no-ai-slop pass, cut 'That recording is the object viewer' to one line; for any type specimen load Noto Sans or drop the face labels, and use only real copy from the film.

## Round 2: machine (scorer, stills/r2/)

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| HA | Walkthrough (baseline, unchanged) | | | | | | | | | | | | | 23 (r1) |
| HA2 | Walkthrough, refined | 2 | 2 (93%) | 2 | 2 | 2 (0.62) | 2 | 2 (620/411) | 2 (1) | 2 | 2 | 2 | 1 | 23 |
| HD | Still / Moving | 2 | 2 (92%) | 2 | 2 | 2 (0.84) | 2 | 2 (626/412) | 2 (2) | 2 | 2 | 2 | 1 | 23 |
| HE | Audio guide | 2 | 2 (88%) | 2 | 2 | 2 (0.60) | 2 | 2 (634/409) | 2 (2) | 2 | 2 | 2 | 1 | 23 |

r2 log: HE first runs failed the phone close (✕ "not stable") and read 22 (c12 width 1227 vs 1186): a `:global(html[...]) .bz__ring` rule compiled to `html[...]` and rotated the whole page. Fixed (whole selector inside `:global()`), then 22 (4 slow frames), rerun 23 (2). Logged per the noise rule; scored the better run.

## Results log (r2, builder)

- r2 HA2 (HA plus the judges' fixes: the browser frame starts at Catalogue so it never repeats the hero's landing; 150 roto frames keyed from mint to near-black; new beat 04 The fake: a live two-layer 'Discover More' hover with its opacity keyframe drawn as a timeline, and v1-v7 export chips with v7 kept; spark copy per p7; on phones the roto grid is 300px tall and scrolls sideways inside itself): machine 23/23. Inspiration as HA, plus Storybook's interaction panels.
- r2 HD (Still / Moving: a divider dragged across each page's Photoshop still and its animated cut, three page tabs; the brief as struck-out ideas (Gravity, Eclipse, Pulsar → Netsuke) beside the Oxford photos as a deck you deal; six catalogue drafts cascaded on a light table, pick one to lift it; the object viewer as onion skin, scrub and ghosts on/off): machine 23/23. Inspiration: Juxtapose.js / NYT before-after sliders; Pentagram light-table process shots; Toon Boom / Procreate Dreams onion skin.
- r2 HE (Audio guide: a handset keypad 1-6 (number keys and arrows too) steps a display through six stops, Oxford → Sketchfab → first draft → roto → buttons → film; the brief beside the landing's netsuke ring turning; the catalogue rows sliding opposite ways with the scroll (seam fixed); the database as a big-type collection index beside its cut): machine 23/23. Inspiration: British Museum / Tate audio-guide handsets; Teenage Engineering product pages; Obys/Rejouice opposite rows; Cooper Hewitt collection index.

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| HD | 23 | 6.625 | 29.6 | 2 |
| HA2 | 23 | 6.25 | 29.3 | 2 |
| HA | 23 | 5 | 28 | 0 |
| HE | 21 | 5.5 | 26.5 | 1 |

## Results log (r2)

- r2 HD (Still / Moving: drag a red divider between each page's Photoshop still and its animated cut, 3 page tabs; the brief as struck-out ideas (Gravity, Eclipse, Pulsar, then Netsuke) beside the Oxford photos as a dealt deck; six catalogue drafts cascaded on a light table, pick one to lift it; the object viewer as onion skin, scrub frames and ghosts on/off): 29.6/30. Inspiration: Juxtapose.js and NYT before/after sliders; Pentagram light-table process shots; Toon Boom and Procreate Dreams onion skinning.
- r2 HA2 (HA refined: browser frame opens on Catalogue, Oxford photo strip, drag-to-turn Coiled Snake, 150 roto frames on near-black with a big '150', sideways-scrolling grid on phones; new beat 04 The fake: live two-layer 'Discover More' hover with its opacity keyframe as a timeline, v1-v7 export chips with v7 kept): 29.3/30. Inspiration: Figma prototype view, Vimeo chapters; Sketchfab and Apple spin viewers; Pentagram/Locomotive contact sheets; Storybook interaction panels.
- r2 HA (baseline): 28/30.
- r2 HE (Audio guide: handset keypad 1-6 steps a display and caption through six stops; brief beside the landing's netsuke ring; catalogue rows sliding opposite ways on a white band; big-type database index beside its clip): 26.5/30 (machine reads 21 in the judged run). Inspiration: British Museum and Tate audio-guide handsets; Teenage Engineering product pages; Obys/Rejouice opposite rows; Cooper Hewitt collection index.
- Best HD 29.6/30; gain +0.6 over r1 best (HA 29); stop: plateau. Default Sheet set to HD.

## Judges' notes (r2)

**Judge 1:** HA: round-1 build, r1 faults remain (bright mint roto block breaks monochrome; mixed-scale snakes; landing shown twice on phone). HA2: fixes most r1 notes (opens on Catalogue, near-black roto, p7 copy, new beat 04 matches p27/p35). Weak: roto grid still mixed scale (d3); every beat text-left/media-right; snake viewer ~770px tall leaves dead left column under 02 (d2). HD: most inventive devices. Weak: at Catalogue tab (d1) still and moving frames misalign and the moving side shows black loading silhouettes; deck is tilted colour polaroids, breaking monochrome; drops the 150 frames and the button/export beat. HE: strong keypad idea; fails open time (753ms) and 4 slow frames; plain text-plus-image beats below; netsuke ring repeats the hero teaser; a second cropped British Museum disc shows in the lower row (d3).
Next round (HA2 > HD narrowly): 1) one scale for the roto grid (fixed square cell, object-fit contain); 2) break the text-left/media-right pattern; 3) borrow HD's struck-out Gravity/Eclipse/Pulsar to Netsuke beside a greyscale Oxford strip, optional onion-skin toggle on the snake; 4) cut dead space beside the snake (cap near 16:10 or sticky text); 5) check the 375px sideways scroll doesn't trap vertical scroll, keep media lazy.

**Judge 2:** HD: shared head/info/numbering/credits, slider in SheetHead's #before slot; every beat a different device; monochrome with red accents; copy checks out. Weak: d0 moving half blank white before poster loads; light table cluttered; scrub counts 01/44 and the 150 frames never mentioned; page ends on onion skin with no outcome or film beat. HA2: fixes all three r1 faults; beat 04 is good. Weak: every beat the same text-left/media-right row; roto grid still tiny sprites beside huge cropped snakes; d0 hero and browser frame both show catalogue. HA: baseline faults as above, copy says 'static photos'. HE: monochrome, on-shell, fresh ideas; failed two machine checks (open 753ms, 4 slow frames); repeats itself (white catalogue band three times, phone hero same netsuke ring); keypad is a six-stop slideshow, roto and object steps reduced to stops.
Next round (HD): 1) load the poster eagerly or show the still on both sides until the clip is ready; 2) onion-skin counter tells the truth ('44 of 150 frames') and keep one big '150' in beat 03; 3) closing outcome beat with v1-v7 chips (v7 kept) and a 0:00-1:40 chapter scrubber; 4) thin the light table, lift the picked draft larger, 2-4 word labels from p12-p17; 5) greyscale the Oxford deck or state it is colour on purpose; 6) at 375px move STILL/MOVING labels clear of the divider handle. Re-run machine checks, c7/c8 stay at 2. Files: app/components/sheets/handheld-stories/HD.vue, story.ts.
