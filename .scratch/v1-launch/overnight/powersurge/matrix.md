# Powersurge: matrix (base criteria 1–14 + 15, /30)

## Round 1 (machine, scorer r1; judged 9, 14, 15-read pending)
| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PwA Datasheet | 2 | 2 (93%) | 2 | 2 | 2 (0.58, 12) | 2 | 2 (604/420ms) | 2 (1) | 2 | 2 | 2 | 1 | 23 | phone overflow 0 |
| PwB Curve | 2 | 2 | 2 | 2 | 2 (0.65) | 2 | 2 | 2 (0–1) | 2 | 2 | 2 | 1 | 23 | phone overflow 0 |
| PwC Control surface | 2 | 2 | 2 | 2 | 2 (1.08) | 2 | 2 (652/416ms) | 2 (1) | 2 | 2 | 2 | 1 | 23 | min font 11px after fix |

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| PwB | 23 | 6.75 | 29.8 | 2 |
| PwC | 23 | 6.25 | 29.3 | 0 |
| PwA | 23 | 6 | 29.0 | 0 |

## Results log (r1)

- r1 PwB (Curve: five frames whose widths grow like the data, then a sticky Moore's Law chart whose red dot climbs to each year (1997, 2005, 75% in, 2018, 2020) as text steps scroll past, with that year's frame crossfading above it; Blender and TouchDesigner in a two-column ledger with Blender greyed; the four drives as sparkline cards, the bloom as a pull quote, the climax over a 5:35 runtime bar): 29.8/30. Inspiration: Bloomberg 'What's Really Warming the World?', The Pudding sticky-chart scrollytelling, Refik Anadol Studio project pages.
- r1 PwC (Control surface: a preset bank of four render pads swapping a big monitor; V1/V2/V5 pads set range bars beside the book page; a Synthi-style pin matrix reads out each operator; the edit as DAW lanes across 5:35 with film frames at their seconds; the climax beside the slider tool): 29.3/30. Inspiration: Teenage Engineering product pages, EMS Synthi pin matrix, Ableton arrangement view, TouchDesigner parameter panels.
- r1 PwA (Datasheet: the film as a chip datasheet; four frames over a part-number bar, features beside the brief, a Linear/Log Moore's Law curve next to the real OWID chart, Blender as 'Note 1'; TouchDesigner network over a pin table, a revision-history table opening each version's page, climax plus Excel to Premiere signal chain): 29.0/30. Inspiration: TI/Analog Devices datasheets, Teenage Engineering OP-1 field guide, Our World in Data's log toggle.
- Best PwB 29.8/30; gain n/a (first round); stop: continue. Default set to PwB.

## Judges' notes (r1)

**Judge 1:** PwB best: sticky Moore's Law curve with climbing dot is the premise as motion; weak on phones (sticky chart axis text a few px, previous step's grey '2018' overlaps media) and empty desktop step columns. PwC most app-like (pads, Synthi matrix, DAW lanes) but drops the premise (no S.data/flat/idea/blender/model). PwA clever datasheet but most copy, Features repeats brief, V5 revision row all dashes, 'Quiet TD' unclear, dry.
Next round (PwB): (1) below ~600px compact strip, curve >=120px tall, labels >=11px HTML, hide outgoing step label; (2) tie each step to what the film does that year, one line, process facts to section 02; (3) fill/collapse empty right column on desktop (shorter spacing, FLOPs/year counter); (4) borrow PwA's Linear/Log toggle; (5) swap sparkline drives for PwC's pin matrix; (6) label growing-width frames with years. Files: app/components/sheets/powersurge/PwB.vue, story.ts

**Judge 2:** PwB leads: shared shell, short copy, red only accent, sticky curve is the project's idea, device changes per beat. Weak: 2005 step pins a process fact to a year; empty right column; at 375px greyed '2018' heading shows above sticky figure. PwC: pads + pin matrix fit TD, but dead black space under hero red frame, gap before TD paragraph, full red waveform heavy. PwA: coherent datasheet, most copy, table-heavy so device repeats, V5 row all dashes, 'Quiet TD' unlabeled.
Next round (PwB): (1) steps describe the film that year (story.md one-liners); (2) Linear/Log toggle or faint OWID overlay; (3) close dead right column / year rail; (4) hide inactive step headings above sticky figure at 375px; (5) pin matrix for the four drives; (6) mark 75% knee, sync to runtime bar's 'quiet 75%'; (7) check lazy-load / play-in-view. Judged from 18 stills only, no live check.

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| PwB2 | 23 | 6.75 | 29.8 | 2 |
| PwD | 23 | 6.5 | 29.5 | 3 |
| PwE | 23 | 6.25 | 29.3 | 1 |
| PwB | 23 | 5.5 | 28.5 | 0 |

## Results log (r2)

- r2 PwB2 (Curve, refined: opening strip of growing-width frames now shows a year on each; each sticky step says in one line what the film shows that year with the model's multiple of 1997; steps shorter; Linear/Log toggle and a dashed 75% knee repeated on the runtime bar; drives as PwC's pin matrix; on phones the sticky figure shrinks to a compact strip, 120px curve, 12px HTML labels, only the active step shows): 29.8/30. Inspiration: Bloomberg 'What's Really Warming the World?', The Pudding sticky-chart scrollytelling, OWID Linear/Log switch, EMS Synthi pin matrix.
- r2 PwD (To scale: first view the 2020 burst big with three small quiet frames; one row per year 1997-2021, each as tall as Moore's Law makes it (model, 22px floor), eighteen years as hairlines then rows open edge to edge with film frames and renders; the build as a code diff beside tabbed version pages; climax clip, slider tool): 29.5/30. Inspiration: Matt Korostoff 'Wealth, shown to scale', The Pudding scale pieces, GitHub split diff.
- r2 PwE (Explorable: three renders quiet to bloom; a sentence with a draggable year (native range) driving multiple of 1997, film time, size/chaos meter, colour swatch and film frame; build as a staircase of process-book pages with Blender struck off the top rung; climax, slider tool): 29.3/30. Inspiration: Bret Victor Explorable Explanations/Tangle, Up and Down the Ladder of Abstraction, Nicky Case explorables.
- r2 PwB (baseline, unchanged): 28.5/30 (r1: 29.8; eye score varies by judge panel).
- Best PwB 29.8/30; gain 0; stop: plateau. Default stays PwB (PwB2 ties on score; PwD wins head-to-head, 3 wins to 2).

## Judges' notes (r2)

**Judge 1:** PwB2 clear fix of PwB: year-labelled strip, multiples (x16, x2,896 checked), Linear/Log, 75% knee, quiet/burst film bar all correct vs story.md; still the familiar Pudding sticky-chart pattern. Nits: 'FILM, 5:00' label nearly touches film's burnt-in '1.2gigaFLOPS' (d2); phone 20vh trailing padding leaves blank band under chart (p1; PwB2.vue:930-944). PwD most striking, device is the argument; diff accurate; loses half a point on c10 (diff in ui-monospace, PwD.vue:347); phone p1 row caption sits over film frame. PwE draggable year good (2005, x16, film 2:26 consistent) but the ladder is five stacked book pages beside text, the image-text pattern Will wants gone; white pages heavy on dark sheet. PwB: 2005 step caption is a build fact, phone labels ~6px, faded '2018' over figure.
Next round (PwD): (1) diff in Host Grotesk with tabular-nums, keep +/- gutter, red rows, strike-throughs; (2) phone: opened row caption in a solid strip above/below the frame; (3) one line on the first hairline ('1997: a small blue sphere, barely moving'); (4) PwB2's quiet-75%/burst bar under the climax film; (5) optional: 2016-2021 open rows scrub the film to that year on hover/tap, native, video plays only in view. Also fix the 'FILM, 5:00' collision and the 20vh blank band.

**Judge 2:** PwD strongest single idea: scroll itself is the data, 75% flat stretch felt not read; copy checks out vs story.md (V1 to V2 size 8-1 to 10-2, speed 0.02-0.08 to 0.02-0.2, lifetime 1 to 20, 2015 three quarters in); docked half a point on c10 (monospace diff). PwB2 polished; 2005 step now matches film; risk on phone: steps show only while crossing the 72% line (PwB2.vue:69, :932) so p1 shows an empty band under the curve with no step text; worth checking live. PwE honest device, but the ladder repeats book page plus caption six times, indented, wasting width on desktop and narrowing text on phone; blue swatch is a non-red UI accent (work's own colour, acceptable). PwB: 2005 step is process copy pinned to a film year; phone axis labels ~6px, stale grey '2018' heading.
Next round: (1) diff in Host Grotesk tabular-nums; (2) pinned sticky readout over the hairline rows (year, film time, multiple of 1997), annotations at 1997, 2005, 2015 only; (3) PwB2 runtime bar for the climax clip (grey quiet 75%, dashed knee, red burst, playhead); (4) slider-tool beat interactive via PwE's draggable year (native range driving size/chaos and colour); (5) phone: 22px rows, labels 13px+, check 2020/2021 red bars vs the film's FLOPs bar. For PwB2 if carried: on phone show the active step whenever it is the last one past the reading line (use `active`, not `inBand`), below the sticky strip; shrink the 20vh tail.
