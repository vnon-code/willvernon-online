# Marimekko Exhibition: matrix (overnight run)

Criteria: base matrix `.scratch/v1-launch/project-sheet-matrix.md` (1-14, plus 15). Machine /23 from `score.cjs`; judged 9, 14 and 15 readability.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| MkC | 23 | 6.25 | 29.3 | 1 |
| MkB | 23 | 5.5 | 28.5 | 1 |
| MkA | 23 | 5.25 | 28.3 | 0 |

## Results log (r1)

- r1 MkC (Rulebook: the A3 visual-system sheet beside a 2x2 of the billboards, then four rules set as huge typewriter numerals, each with four pieces of evidence; a problem/fix ledger with the problem struck through in red, the loop's four beats as a numbered track over its frames and the process page, and a full-bleed triptych of mural, flags and wall): 29.3/30. Inspiration: the reissued NASA Graphics Standards Manual, Experimental Jetset's identity pages, Will's own A3 sheet.
- r1 MkB (Follow the tape: the mural over the four floor tapes, then four full-width colour rooms, each with its tape drawing down the left edge as the room scrolls into view and the poster, billboard and ticket hung on its wall; book pages pinned to a grey board with problem tags; a green EXIT sign over the wall and flags): 28.5/30. Inspiration: the orange tape in 'Later Came Early' at Fabrica, the Powerhouse Museum's one colour per level, Will's field-trip note, Son Daven.
- r1 MkA (Colourway: the four A3 posters side by side, a swatch picker for the four designers that switches billboard, floor tape and ticket, the process as a hover list with the book page beside it (inline on phones), a bento of mural, flags, wall and leaflets): 28.3/30. Inspiration: marimekko.com colourway swatches, Pentagram identity case studies, Obys/Rejouice hover lists.
- Best MkC 29.3/30; gain n/a (first round); stop: continue.

## Judges' notes (r1)

**Judge 1:** MkA uses the shared shell; section devices vary (swatch picker, hover list, bento). Problems: large lime swatch panel; chips and list keys in typewriter, not Host Grotesk; at 1440 the desktop hover viewer is an empty white box (d2) because the viewer has #fff background and its stacked opacity-0 images are loading=lazy (MkA.vue:114, :333); process beat is mostly text rows; 'Field trip' row text starts 'Field trip:' (repeat). Phone layout sound. MkB has the best story (colour as wayfinding: rooms, back office, EXIT) with a different device per beat. Problems: green EXIT bar (#0b7a3e), warm grey board and cream tilted notes break monochrome + red; desktop posters cropped ('arimekk', 'chi Gallery | Opens 05.01.2') by grid-row 1/3 with object-fit:cover (MkB.vue:248-250); 'Field trip:' repeat. MkC is closest to the site (black, red numerals, red strikes); ledger and loop track are good. Problems: four rule rows share one device and rule 4's tiles are padding; ledger on cream; full-bleed wall crops its text ('arimekko', 'urney with'); book-page tiles tiny at 375.
Next round (push MkB, highest c14, cheap c9/c10 fixes): (1) recolour EXIT to site black with a race-red arrow/rule, or keep green only as a small pictogram in the EXIT image; (2) neutral near-black board (#141414), notes white or transparent with 1px rule, no tilt or shadows, red pin dots the only accent; (3) fix poster crop at MkB.vue:248-250 (object-fit:contain or size billboard/ticket to poster height); (4) room labels and note tags in Host Grotesk, typewriter only for designer names; (5) drop the 'Field trip:' prefix, map 'problem' notes to the story's three problems (low-res patterns, posters redone at A3, logo ideas respecting all four designers); add the missing A3 poster redo; (6) optional: the 22s loop in the EXIT section, playing only in view. MkA: hover viewer needs eager loading or no white background on the is-on image.

**Judge 2:** MkC fix first. All three use the shared shell correctly. MkC changes device on every beat (typewriter rule numerals with evidence, strike-through ledger, numbered loop track, triptych), looks like the work itself, stays monochrome + red; copy matches story.md (16 motifs, 22 s loop, posters redone at A3, Olivetti logotype). Defects: object-fit cover crops the work (rule-1 lime ticket clipped at left, triptych wall cuts logotype to 'arimekko', rule-4 poster tops lost at 375px); rule-3 book thumbnails too small; ledger on cream; orphan 'Brief:' line under the contents bar. MkB: strongest idea but posters cropped through the logotype ('arimekk', 'ikka rimala', 'chi Gallery'); four rooms repeat one device; green EXIT outside palette; rotated paper notes with shadows read skeuomorphic; logotype note wrongly tagged 'problem'; 'Field trip:' repeat. MkA: good swatch picker but reads panel/list/bento; hover preview an empty white box on desktop (lazy-load gap or broken image, needs live check); pills in typewriter on a large lime panel; 'Field trip' twice; plain bento. Unverified: MkA's blank preview judged from the still only.
Next round (MkC, in order): (1) show the work uncropped (object-fit:contain, or crop only the pattern side) for posters, tickets, wall; (2) rule 3: one legible page (e.g. exhibition-identity at full width) or tap-to-enlarge thumbnails; (3) make rule 2 (one colour per room) the moment: MkB's four floor-tape stills at full width or a tape line across the row; (4) ledger on the site's dark or neutral grey, not cream; (5) remove the orphan 'Brief:' line or fold into one small line in rule 1; (6) highlight the loop-track beat matching the video's current time. Keep the strike-through ledger and giant red numerals.

## Decision for r2 (recorded)
Judges split: Judge 1 pushes MkB, Judge 2 pushes MkC. MkC leads on total (29.3 vs 28.5) and both lists are cheap fixes; default stays MkC. Judge 1's MkB fixes are worth borrowing (floor-tape stills, EXIT idea) per Judge 2's item 3.

## Round 2: build (machine scored; judged criteria pending)

| Variant | Machine /23 | Notes |
|---|---|---|
| MkC (baseline, unchanged) | 23 | 29.3 in r1 |
| MkC2 | 23 | MkC + judge 2's fixes 1–6 |
| MkB2 | 23 | MkB + judge 1's fixes 1–6 |
| MkD | 23 | new: Catalogue |

- r2 MkC2 (Rulebook, refined): every piece uncropped; brief inside rule 1; rule 2 = four floor tapes full width over a four-colour tape line drawn by scroll (CSS view timeline); rule 3 = one legible p.28; ledger on #141414; loop video (in view only) over a six-beat timeline lit by currentTime; triptych at native ratios.
- r2 MkB2 (Follow the tape, refined): room walls sized by the poster (poster | billboard over ticket at native ratios); near-black board, ruled notes, no tilt/shadow, red pins only; Problem tags = low-res patterns, A3 poster redo, logotype for four; Host Grotesk labels; black EXIT bar with red arrow over the loop, wall and flags.
- r2 MkD (Catalogue): 16-piece matrix re-sorting by designer or piece (TransitionGroup FLIP); research pages hung on a line with wall labels; errata slip ("for … read …") beside the four A3 posters; loop full width; mural, then flags and wall uncropped.

## Round 2: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| MkD | 23 | 6.625 | 29.6 | 2 |
| MkC2 | 23 | 6.25 | 29.3 | 1 |
| MkB2 | 23 | 5.375 | 28.4 | 1 |
| MkC (baseline) | 23 | 5.125 | 28.1 | 0 |

## Results log (r2)

- r2 MkD (Catalogue: a 16-piece system matrix, designers x poster/tape/billboard/ticket, that re-sorts by designer or by piece with FLIP moves; research pages hung on a line with museum wall labels; the problems as an errata slip ('for ... read ...') beside the four A3 posters; the loop full width, then the mural, flags and wall uncropped): 29.6/30. Inspiration: Pentagram 'Mushrooms' identity, Mucho MACBA, Grafik 'Human Nature', museum tombstone labels.
- r2 MkC2 (Rulebook, refined: the A3 system sheet beside the billboards; four rules as big red typewriter numerals with every piece uncropped: tickets 2x2, four floor tapes full width over a four-colour tape line drawn on scroll, one legible p.28 page, the four posters; strike-through ledger on #141414; loop video, playing only in view, over a six-beat timeline that lights the current beat; triptych at native ratios): 29.3/30. Inspiration: NASA Graphics Standards Manual reissue, Experimental Jetset identity pages, video-editor timelines.
- r2 MkB2 (Follow the tape, refined: the mural over four uncropped floor tapes; four colour rooms, each with its tape drawing down the edge and a wall sized by its poster; near-black back office with plain ruled notes and red pins, the three Problem tags are the story's three problems; black EXIT bar with a red arrow over the 22 s loop, the wall and the flags): 28.4/30. Inspiration: 'Later Came Early' at Fabrica, Powerhouse Museum's one colour per level, Will's field-trip note.
- r2 MkC (baseline, unchanged): 28.1/30 (r1: 29.3; eye score varies by judge panel).
- Best MkD 29.6/30; gain +0.3 over r1 best (29.3); stop: plateau. Default set to MkD.

## Judges' notes (r2)

**Judge 1:** MkC (r1 baseline): shared shell; tickets/tapes cropped to strips, process pages too small, cream ledger breaks dark monochrome, all rules the same numeral+text+image row. MkC2 fixes these (2x2 uncropped tickets, legible p.28, dark ledger, good six-beat timeline); still four same-layout rules, p.28 shown twice, and story.md has no source for the timeline timestamps. MkB2: most striking (full-bleed mural, colour rooms, full-size posters) but lime, peach and pink room backgrounds are site UI in the work's colours, breaking monochrome + race-red-only; pin cards clean; phone holds. MkD: a different device per beat (interactive 16-piece matrix, research pages with wall labels, errata slip with facts matching story.md beside uncropped posters, full-width mural); feels like an app and invites interaction. One catch: matrix row rules use designers' colours. Phone readable.
Next round: MkD is best; MkB2 most striking but breaks the colour rule; MkC2 safe runner-up. To raise MkD: (1) matrix row rules neutral grey, race red only on active row/hover (MkD-d0, MkD-p0); (2) research rows: wall label sits at the bottom of a tall empty dark box, ~120px dead space (MkD-d1, d2), top-align or make sticky; (3) errata slip in light ink on #141414, not a white card; (4) at 375px matrix thumbnails ~85px wide: 2-column layout or tap-to-enlarge; (5) cut the helper line 'Rows: designers. Columns: ...'; (6) borrow MkC2's six-beat timeline under the loop, with timestamps from the real video only; (7) check FLIP re-sort at 60fps on a phone with 16 lazy images. Stills: .scratch/v1-launch/overnight/marimekko-exhibition/stills/r2/

**Judge 2:** MkC2 closest to the site (near-black, red numerals and strikes, shared shell); r1 faults fixed (dark ledger, uncropped triptych and posters, legible p.28); different device per beat. Copy repeats in beat 03: story.ts:76 ('so it loops cleanly') and :111 ('so it loops'). Rules rows share one numeral+evidence layout; the 1.7 s beat shows as '00:01'. MkD: matrix and errata are the cleverest devices, copy short and factual; matrix rows underlined yellow, blue, orange, pink (non-red UI accents); errata on a white card; research beat reads image/text/image/text with a big empty black panel above a small label; readable at 375. MkB2: strongest narrative idea, r1 fixes landed (black EXIT with red arrow, ruled notes, nothing cropped) but four full-width lime/blue/peach/pink fields pull away from monochrome + red; four rooms share one device; back office a 2-up card grid; phone sound. MkC: r1 baseline, cream ledger, cropped wall type, tiny book pages; superseded by MkC2.
Next round (MkC2 fixes, if pursued): merge the two 'loops' lines in beat 03; round the timeline label or set the beat to t: 2; run the loop full width with the timeline under it and move the p.29 page; borrow MkD's re-sort for rule 1; use errata wording in the ledger and drop the repeated p.28 thumbnail; keep the #141414 ledger and native-ratio triptych, no coloured UI rules.

## Decision (recorded)
Plateau: gain +0.3 over r1 best, MkD leads the panel. Final: MkD default. Open items for LATER.md: MkD matrix row rules neutral grey, research label top-align, errata on #141414, 2-col matrix on phones, drop helper line, add loop timeline from real video timestamps, check FLIP perf on phone.
