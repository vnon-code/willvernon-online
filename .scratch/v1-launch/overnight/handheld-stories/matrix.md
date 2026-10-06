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
