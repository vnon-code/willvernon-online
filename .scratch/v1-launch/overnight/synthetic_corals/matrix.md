# Synthetic Corals: matrix (overnight run)

## Round 1 build (2026-10-06): machine scores, `score.cjs … --out r1`
| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CA Plate | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 |
| CB Re-roll | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 |
| CC Spectrum | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 |

Judged criteria (9, 14, 15 readability) pending the reviewer. Stills in `stills/r1/`.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| CA | 23 | 6 | 29 | 1 |
| CB | 23 | 6 | 29 | 0 |
| CC | 23 | 5 | 28 | 0 |

## Results log (r1)

- r1 CA (Plate: the four runs placed round the 5 s clip on one black natural-history plate, figure numbers keyed to a hover legend where run 3 is an empty dashed line; the settings as a ComfyUI-style node canvas; the 10 s clip and preview still on white with museum label cards): 29/30. Inspiration: Haeckel's Kunstformen der Natur plates, NHM specimen labels, ComfyUI's canvas.
- r1 CB (Re-roll: one big frame with a 'Run again' button stepping through runs 1, 2, 4, 5 (run 3 flashes in a struck-out list); prompt and settings on a tilted thermal ticket beside the 5 s clip; a lights switch from white to black as the bleached run gives way to the glowing one): 29/30. Inspiration: fxhash/Art Blocks token pages, receipt printouts, light/dark toggles.
- r1 CC (Spectrum: a bento of the runs, blue run biggest; each run as a colour-share bar (PIL median-cut) growing in on scroll; a 24-frame drag/slider turntable of the 10 s clip beside the 5 s clip; the prompt as colour-tagged token chips over a settings grid): 28/30. Inspiration: Google Arts & Culture Art Palette, Cooper Hewitt colour search, 360-degree product viewers, OpenAI's tokenizer page.
- Best CA 29/30; gain n/a (first round); stop: continue.

## Judges' notes (r1)

**Judge 1:** CA fits the site (shared title, info block, numbering, contents; dark, red indices). Plate, node canvas and label cards are three different devices; run-3 dashed slot is good. c10 -1: lilac node wires and ports (#b48ce0, CA.vue:342,357) break monochrome plus red. 5 s clip appears as hero and again at plate centre; white Turning block has a large empty top-left. CB stays in palette (cream receipt #f4f1ea borderline); c14 -1: receipt headed 'Same settings' (CB.vue:27), RUNS 01-05, contradicts story.md (small node-setting changes caused the differences); tall empty white block under the clip (d2/d3). CC shows 'each run wildly different' best; c10 -1: prompt chips tinted blue/olive/maroon/grey (CC.vue:421-424), hex labels unreadable on mid-tones, caption 'Preview: Run 5 over a white floor' (CC.vue:35) not in story.md, empty black block under the turntable (d3).
Next round (CC, best per this judge): 1) monochrome prompt chips (outline or #1a1a1a, white mono text, red index); 2) hex labels black/white by luminance or dropped on desktop; 3) fill the black block under the turntable (10 s frame full left column, counter and slider docked); 4) rename preview row to 'Preview'; 5) show the 5 s clip once, give the second slot the vertical clip or a still from runs 1/2/4/5; 6) borrow CA's dashed run-3 slot in the colour bars; 7) cut 'Five test runs from one base pipeline. Run 3 isn't on the site.' to one short fact. Shell (all variants): on phone the close button overlaps section tabs and info rows (CA-p1, CB-p1).

**Judge 2:** CA 29: strongest plate, apt ComfyUI canvas, three distinct devices. c10 -1 (high): lavender wires/ports (CA-d2). Meta copy 'The settings, as the old site lists them.' is a dev note in public copy. Medium: 5 s clip three times (hero, plate centre, Turning). Low: phone FIG. 1 label sits on the coral (CA-p0). CB 29: ticket, Run again and lights switch are distinct and interactive (again() skips 3 and flashes it; lights sets aria-pressed). c10 -1: run-3 flash #ff6a5e (CB.vue:257) is salmon, not race red; same 'old site' meta copy. By default a scroller sees only run 1; runs 4 and 5 only on click. Low: dead black area above the run list (CB-d1), white void under the clip (CB-d2/d3). CC 27: navy/olive/maroon chips off-palette (c9, c10); hex labels near invisible (#9d8b80 on taupe); empty black block under '01 / 24' (CC-d3); turntable repeats the hero clip; bars read as a data table.
Next round (CA): 1) node wires and ports white ~40% opacity, only active/hovered wire race red, drop purple; 2) coral-preview or the portrait clip in the plate centre so the 5 s clip appears once as hero and at most once after; 3) at 375px FIG labels below images or on a solid black chip; 4) cut 'The settings, as the old site lists them.' and replace 'Run 3 isn't on the site' with plain copy such as 'Five runs, one pipeline. Run 3 not shown.' (through no-ai-slop); 5) top-align the clip with the heading in Turning. Keep plate, dashed run-3 legend, label cards. If CB goes forward: filmstrip of all four runs under the re-roll frame, #ff6a5e to race red.
