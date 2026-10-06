# Monolith Survival: matrix (overnight run)

Base matrix criteria 1–14 plus 15 (phone). Machine /23 from `tools/score.cjs`; 9, 14 and 15's readability judged
separately. Stills: `stills/r1/`.

## Round 1 (2026-10-06): machine scores

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MA | White-out: film between two stills on a white band, opening slices, world grid, stomp + prompt | 2 | 2 (93%) | 2 | 2 | 2 (0.60) | 2 | 2 (655/432ms) | 2 (2) | 2 | 2 | 2 | 1 | 23 |
| MB | Turnaround: film + trailer, pinned flipbook, night log, world ticker | 2 | 2 (95%) | 2 | 2 | 2 (0.65) | 2 | 2 (659/412ms) | 2 (2) | 2 | 2 | 2 | 1 | 23 |
| MC | Product page: viewer + views + hang tag, colourway swatches, field tests | 2 | 2 (93%) | 2 | 2 | 2 (0.63) | 2 | 2 (629/410ms) | 2 (1) | 2 | 2 | 2 | 1 | 23 |

Tries logged: MA run 1 scored 18 (body at 0%, 48 slow frames, 669ms close: video decoding during the flight), run 2
19 (srcset, fade), run 3 23 (useOpenPlay delay). Judged criteria pending.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Judged /7 | Total /30 | Wins |
|---|---|---|---|---|
| MB | 23 | 7 | 30 | 0 |
| MA | 23 | 6.5 | 29.5 | 0 |
| MC | 23 | 6.5 | 29.5 | 0 |

## Results log

- r1 MB (Turnaround: film and trailer over a four-column slate, pinned flipbook with 01/08 counter on a CSS scroll timeline, night as a file-timestamp log 15:16 to 01:39 then April 2026, world ticker that pauses on hover): 30/30. Inspiration: character turnaround sheets, Apple scroll-scrubbed sequences, Lusion pinned stages, edit logs, Rejouice ticker.
- r1 MA (White-out: film between VARKON 4 and 8 on a white band, eight hover/focus slices, asymmetric 12-column world grid, stomp clip beside verbatim prompt): 29.5/30. Inspiration: Your Majesty FILA Explore, expanding-panel galleries, Obys.
- r1 MC (Product page: film viewer with five view thumbnails, VARKON hang tag, four sampled swatches with hex, four field-test clips): 29.5/30. Inspiration: Arc'teryx and Salomon PDPs, hang tags, Pantone cards.
- Best MB 30/30; stop: 30/30. MB is now the default Sheet in meta.json.

## Judges' notes

**Judge 1 (MC > MB > MA on story; best pick MC):** MA fits the shell (red only on year and beat numbers) but the 34 s film is about 370 px wide between two stills, flanking stills sit lower than the film, closed slices crop to torsos, 07 and 08 show only snow; stomp clip beside its prompt is the best beat. MB: film and trailer side by side give real size; pinned turnaround with 01/08 counter is the strongest single device; the log tells the one-night story. Faults: "01 TURNAROUND" above a giant "01"; 22:33 and 01:35 rows share one storm thumbnail; five identical log-row shapes with thin text. MC: product-page idea suits a fake gear brand; colourway swatches (lens #ca031c) most original and make the red rule content. Faults: about 170 px empty under the hang-tag specs; "VARKON / the brand name in the files" reads as a meta note; phone first screen is a motion-blurred film frame (about 340x425); making-of facts mostly missing.
Next round (from MC): 1 sharp still (varkon-7 or nano-spires-figure) as phone poster, rail above the fold at 375x812; 2 fill space under specs with the stomp prompt in mono or a "Made" line 15:16 to 01:39; 3 cut "/ the brand name in the files", check tag lines with no-ai-slop; 4 swatch hover/focus zoom, transform only, hex in red on lens only; 5 field tests show prompt or take note on hover, stomp as wider hero tile; 6 active thumbnail at full opacity (rest 0.4) plus visible focus ring.

**Judge 2 (MA > MB > MC; MA narrowly):** MA: white-out band is the most campaign-like opening, monochrome with red accents, each beat a different device. Faults: film about 370 px wide; slices crop to torsos not faces. MB: night log is the best one-night telling; flipbook is a real turnaround device. Faults: pinned flipbook leaves the left half empty black around a giant numeral; 22:33 and 01:35 thumbnails near-identical; "One evening and night" beside a 15:16 start. MC: swatches clever and on-brand, hang-tag clean; field tests a plain four-up and the page is short; phone opens on a soft storm frame about 425 px tall that reads as a grey smear (the film's own content, not CSS blur).
Next round (from MA): 1 film about 80vh, VARKON 4 and 8 bleed off the edges; 2 object-position top on portrait slices; 3 one-line timestamp strip (15:16 stills, 01:39 V1 render, Apr 2026 trailer) under the stomp clip; 4 story.ts copy: "One evening and night" to "One afternoon and night", mark the stomp prompt's --v 6.0 as from the old site or drop params; 5 phone world beat as swipe rail or one image per screen; 6 keep the white band.
