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
