# 04 Topography AV Test: matrix (machine /23 from tools/score.cjs; judged 9, 14, 15-readability by the reviewer)

| Variant | Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Raw |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TA | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 0.56, 624/413ms, 1 slow; try 1: 22 (media 0.47) |
| TB | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 0.61, 619/418ms, 1 slow (2 runs, both 23) |
| TC | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 0.84, 595/420ms, 1 slow |

Stills: `stills/r1/`. Judged criteria pending.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Judged /7 | Total /30 | Wins |
|---|---|---|---|---|
| TB | 23 | 6.75 | 29.8 | 1 |
| TA | 23 | 6.25 | 29.3 | 0 |
| TC | 23 | 6 | 29 | 1 |

## Results log

- r1 TB (Survey sheet: lettered map grid of tiles A1-D4 with cover panel and legend as squares and the grey terrain as one tile, process as a keyed A/B/C table, cut as a proof in crop marks, versions as contour rings with the crit at the peak): 29.8/30. Inspiration: Swisstopo/OS map sheets, print proofs, Kenta Toshikura's tiled grids.
- r1 TA (Signal chain: slate split with the output still as the chain's Out, modules on a wire with a running pulse, audio network beside notes, colour circuit over a four-up swatch row, full-bleed cut, versions on a ruler broken for the six weeks to the crit): 29.3/30. Inspiration: TouchDesigner network editor, Ableton device chain, Teenage Engineering product pages.
- r1 TC (Arrangement: output frame under a transport bar with a pointer lens and toggle over the network, process as DAW lanes under a version-date ruler with scroll playhead, volume fader that hue-rotates a still (labelled demo), cut beside the grey terrain): 29/30. Inspiration: Ableton arrangement view, Apple/Lusion x-ray/loupe reveals.
- Best TB 29.8/30; stop: continue. TB is now the default Sheet in meta.json.

## Judges' notes

**Judge 1 (TB > TA > TC on impact; TC most creative):** TA reads as the site (dark, red, Host Grotesk, no blur); signal-chain strip is a smart device but the middle is network-beside-notes twice, then swatches and a full-bleed cut: mostly image-text alternation. Versions ruler with 6-week break is clean. Phone hero black in the still (all three). TB: lettered tile grid shows the most work above the fold; after that the A/B/C key is three identical text-plus-network rows (the image-text repetition Will rejected); contour rings are big empty ellipses that read as a diagram. Legend and crop-mark proof are nice. TC: most creative, each beat a different device. Lost a c10 point at TC.vue:43 (hue = vol*1.2 up to 120 deg turns still and ramp green, breaking monochrome + red). Phone lanes (overflow-x:auto, scrollbar hidden, TC.vue:640) cut images with no scroll cue.
Next round (from TC): 1 cap hue near 25-30 deg or use brightness/saturate (TC.vue:43); 2 phone lanes: 2-up grid under 640px or right-edge fade plus count; 3 cut lane 3 filler "The whole network, in three views."; 4 hero video poster (/img/posters/experiments-topographyav-test2.webp), all variants; 5 fader section: tighten to image height or put the colour-circuit crop beside it; 6 lens and playhead transform only, no layout reads in scroll handler.

**Judge 2 (TB best, TA weakest wow):** TB: survey-map idea comes from the subject (topography); monochrome and red only. Weak: A/B/C key still image-text rows; still grid 10+ tiles feels padded; cinematic proof captured on a near-black frame (d3). Phone stacks cleanly. TC: most interactive; TC.vue:43 hue up to 120 deg breaks the palette; desktop lanes still image-plus-text rows; default lens bubble sits awkwardly at the bottom edge in d0. TA: clean, on-brand, chain strip and ruler nice, but beats conventional (hero, text+network, swatches, full-bleed, ruler); chain stacks into a tall box list on phone.
Next round (from TB): 1 merge A/B/C key into the map: each network still inside a grid cell keyed A1/B2/C3 with 1-3 line caption; 2 cut tiles from 10+ to about 6, no near-duplicates; 3 bright poster and start offset for the crop-mark cinematic proof; 4 contour rings interactive: hover/tap shows that version's still (Test 2 = the outcome, others "not shown"), draw rings in on scroll; 5 check hero poster paints before video on phone; if TC carried, clamp hue near 30 deg.

## Round 2: machine (scorer, stills `stills/r2/`)

| Variant | Round | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Raw |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TD | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 0.61, 602/420ms, 1 slow (2 runs, both 23) |
| TE | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 1.03, 603/412ms, 0 slow (2 runs, both 23) |
| TF | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | media 0.57, 613/408ms, 0 slow (2 runs, both 23) |

Baseline TB (29.8) unchanged. Judged criteria pending. Last runs came after phone-only CSS fixes; copy edits after that are text only.
- r2 TD (Survey sheet, keyed): TB with the networks as captioned map squares, six picture tiles, bright cut in crop marks, contour rings that draw in and show each version. Inspiration: Swisstopo/OS sheets, print proofs, elevation-tint maps.
- r2 TE (Arrangement, tuned): TC with all six judge fixes. Inspiration: Ableton arrangement view, Apple/Lusion loupe reveals.
- r2 TF (Waveform): frame bars sized by measured loudness, exploded network stack, letterbox cut with timecode, date numerals beside the grey terrain. Inspiration: SoundCloud waveform player, Apple exploded product views / Stripe layered diagrams, cinema letterbox, Swiss poster numerals.

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Judged /7 | Total /30 | Wins |
|---|---|---|---|---|
| TB (baseline, unchanged) | 23 | 6.75 | 29.8 | 0 |
| TD | 23 | 0 (no judge scores recorded) | 23 | 0 |
| TE | 23 | 0 (no judge scores recorded) | 23 | 0 |
| TF | 23 | 0 (no judge scores recorded) | 23 | 0 |

## Results log (r2)

- r2 TD (Survey sheet, keyed: TB refined, one lettered map grid with the three networks as captioned squares among six picture tiles, legend and cover panel, bright-poster cut in crop marks, contour rings that draw in and show each version): 23/30 (machine only). Inspiration: Swisstopo/OS map sheets, print proofs, elevation-tint maps, Kenta Toshikura's tiled grids.
- r2 TE (Arrangement, tuned: TC with all six judge fixes, transform-only lens, three DAW lanes under a version ruler, 0-30 deg hue fader beside a still): 23/30 (machine only). Inspiration: Ableton arrangement view, Apple/Lusion loupe reveals.
- r2 TF (Waveform: 16 frame bars sized by measured loudness, exploded network stack, letterbox cut with timecode, date numerals beside the grey terrain): 23/30 (machine only). Inspiration: SoundCloud waveform player, Apple exploded product views, Stripe layered diagrams, cinema letterbox, Swiss poster numerals.
- Best TB 29.8/30; gain 0; stop: plateau. TB stays the default Sheet in meta.json.

## Judges' notes (r2)

No judge notes were recorded for round 2 (judged criteria not scored; eye = 0 for TD, TE, TF). The round-2 variants are therefore unranked against TB; TB's 29.8 stands.
