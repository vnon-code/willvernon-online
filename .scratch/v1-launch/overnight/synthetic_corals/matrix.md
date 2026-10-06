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

## Round 2 build (2026-10-06): machine scores, `score.cjs … --out r2`
Baseline CA (29/30) unchanged. CD = CA refined with the judges' fixes; CE, CF new challengers.

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CD Plate, refined | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 (3, then 2 frames) | 2 | 2 | 2 | 1 | 23 |
| CE Latent map | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 (6, 0, 1 frames) | 2 | 2 | 2 | 1 | 23 |
| CF Lots | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 (3, 1, 4, 4, then 2 with content-visibility) | 2 | 2 | 2 | 1 | 23 |

Judged criteria (9, 14, 15 readability) pending the reviewer. Stills in `stills/r2/`.

## Results log (r2 build)
- r2 CD (CA refined): plate square-centred (1fr 2fr 1fr) round the preview still, so the clip isn't repeated there; FIG/Preview labels on solid black chips; node wires and ports white 40%, only the hovered node's wire and port race red; 'The settings…' line cut; legend copy 'Five runs, one pipeline. Run 3 not shown.'; Turning shows the 5 s clip once, top-aligned, beside six frames (0–8.3 s) of the 10 s clip. Inspiration as CA.
- r2 CE (Latent map): the four runs plotted as thumbnails on a dot-grid field with axes from the sources (bleached ↔ glowing, polyp ↔ rock; placed by eye, labelled so), pointing at one swaps a big readout with a 1–5 list where 3 is dashed; the prompt as the caption of the preview still with the settings as an EXIF bar; the 5 s clip alone on a white band. Inspiration: Google Arts & Culture t-SNE Map, TensorFlow Embedding Projector, Flickr's EXIF panel.
- r2 CF (Lots): a sale index of five lots (lot 3 struck, dashed); the runs as auction lots, a sticky viewer on the left swapping to the lot being read on the right (phones: image inline per lot); the prompt as a catalogue note with a ruled 'Further details' table and the 5 s clip as a detail. Inspiration: Christie's and Phillips online lot pages, Sotheby's catalogue notes.

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| CD | 23 | 7 | 30 | 3 |
| CE | 23 | 6 | 29 | 2 |
| CA | 23 | 6 | 29 | 0 |
| CF | 23 | 6 | 29 | 0 |

## Results log (r2)

- r2 CD (CA refined): 30/30. Plate square-centred on the preview still, FIG labels on black chips with the dashed run-3 legend; node canvas wires and ports white at 40%, only the hovered node's wire and port race red; Turning shows the 5 s clip once, top-aligned, beside six frames of the 10 s clip with label cards. Inspiration: Haeckel's Kunstformen plates, NHM specimen labels, ComfyUI's canvas.
- r2 CE (Latent map): 29/30. Four runs plotted as thumbnails on a dot-grid field (bleached to glowing, polyp to rock; placed by eye, and the page says so); pointing at a run swaps a big readout above a 1-5 list with run 3 dashed; prompt as the caption of the preview still with the settings as an EXIF bar; the 5 s clip alone on a white band. Inspiration: Google Arts & Culture t-SNE Map, TensorFlow Embedding Projector, Flickr's EXIF panel.
- r2 CA (baseline, unchanged): 29/30.
- r2 CF (Lots): 29/30. Sale index of five lots with lot 3 struck and dashed; runs as auction lots with a sticky viewer and a 'Lot 04 / 05' counter (phones: image inline); prompt as a catalogue note with a ruled 'Further details' table and the 5 s clip as a detail. Inspiration: Christie's and Phillips online lot pages, Sotheby's catalogue notes.
- Best CD 30/30; gain +1 over CA; stop: 30/30.

## Judges' notes (r2)

**Judge 1:** CA 29 (unchanged baseline): shared title, info, numbering and contents used; plate, node canvas and label cards are three devices, run 3 a dashed slot. c10 -1: lilac wires and ports remain (CA-d2); 'The settings, as the old site lists them.' still reads as a dev note; 5 s clip three times; FIG. 1 on the coral on phone (CA-p0). CD 30: every r1 fix landed; wires grey, purple gone; preview still at plate centre so the clip does not repeat; FIG chips black and legible on phone (CD-p0); dev note cut; legend copy matches story.md; three distinct devices. Weak, no point lost: the six frames from 0 to 8.3 s look almost the same; label chips cream #f4f1ea (CD.vue:484) borderline monochrome. CE 29: fresh, works on phone (CE-p0), big quoted prompt reads well. c14 -1: Turning is a mostly empty white band with the hero clip shown small again (CE-d3); EXIF bar wraps Upscale onto an orphan row (CE-d2); 'Four runs, one pipeline.' (CE.vue:33) clashes with story.md's five runs. CF 29: clean, in palette, sticky viewer and note read well. c14 -1: each still twice (index and lot; phone repeats the grid, CF-p0/p1); every lot table repeats Medium and Made rows; black voids under lots on desktop (CF-d1/d2); 'Detail' clip is the hero coral again.
Next round (ship CD): 1) Turning: three or four frames of clearly different angles, or one scroll-scrubbed strip; close the white void above each frame cell. 2) Label chips: #f4f1ea to pure white with 1px black rule, or black on white. 3) Turning repeats the hero coral: portrait clip at full height or tighten. 4) Optional: hover a FIG highlights its legend entry and the reverse; run 3 stays dashed. 5) Shell, all variants: at 375px the close button overlaps info rows and section tabs (CD-p1, CE-p1, CF-p1); fix in the shared shell. Carry on: CE's big quoted prompt, CF's ruled 'Further details' table.

**Judge 2:** CD best and ready to ship. All three variants use shared SheetHead, SheetSectionNo, SheetCredits. Node wires and ports white at 40%, only hovered turns race red (CD.vue:347,363,367). FIG chips solid black, readable on phone (CD-p0). Dev note gone; preview still at plate centre; three separate devices. Still weak: Turning column on white has empty space above the coral (CD-d2, the portrait clip's own white frame); six frames of the 10 s clip near-identical, so one coral appears about eight times. CE: latent map is the most inventive and honestly says 'Placed by eye'. c14 -1: prompt captioning the red and black preview still suggests the cyan and purple prompt made it (story.md only says the old site showed it); empty areas under the prompt, orphaned Upscale cell (CE-d2), wide white band round a narrow portrait clip (CE-d3); empty bleached quadrant (CE-d1). CF: palette and shared components correct, lot 3 struck and dashed; one device used four times, identical tables with Medium 'ComfyUI, Flux.1 Dev' and Made 'May 2026' repeating; min-height 52vh (CF.vue:303) leaves half-empty columns and dead area under the sticky viewer (CF-d1/d2); index thumbnails repeat the lot images; prompt beside the 5 s clip as 'Detail' has the same attribution risk as CE. CA: unchanged r1 baseline; lavender wires (CA-d2), dev-note copy, FIG. 1 on coral on phone (CA-p0).
Next round (CD.vue): 1) replace the six near-identical frames (lines 145-154) with a drag-to-scrub turntable of the 10 s clip, or a strip of runs 1, 2, 4, 5. 2) Crop or centre the 5 s portrait clip (object-fit: cover or object-position: center 35%) to remove the empty area above the coral. 3) Legend hover lifts its FIG and dims the rest; run 3 stays dashed. 4) Phone, all variants: close button overlaps info rows and section tabs; fix in SheetShell. 5) Fact check: story.md says coral_rotate.mp4 is square, story.ts:39 lists 1072x1920; correct story.md (portrait). If CE returns: stop captioning the preview still with the prompt; fill or drop the orphan Upscale cell and the white band.
