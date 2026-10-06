# Smuggler's Outpost: Sheet matrix (criteria 1–15, /30)

Machine /23 from `tools/score.cjs`; 9, 14 and 15's readability (/7) are judged by the reviewer, not here.

## Round 1 (2026-10-06)

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Judged /7 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA | Concept to canyon | 2 | 2 (93%) | 2 | 2 | 2 (0.65) | 2 | 2 (615/421) | 2 (1–2) | 2 | 2 | 2 | 1 | 22 | 6 | 28 |
| SB | Process book | 2 | 2 (92%) | 2 | 2 | 2 (0.66) | 2 | 2 (639/426) | 2 (2) | 2 | 2 | 2 | 1 | 23 | 5 | 28 |
| SC | Scene breakdown | 2 | 2 (93%) | 2 | 2 | 2 (0.66) | 2 | 2 (629/425) | 2 (1–2) | 2 | 2 | 2 | 1 (1px) | 23 | 4 | 27 |

Results log: stills and JSON in `stills/r1/` (first runs; SB's fix tries) and `stills/r1b/` (final run of each).
SB runs: 20 (video band, 55 frames) → 20 (no fan shadows, 49) → 23 with a still (diagnosis) → 22 (crossfade, 3 frames)
→ 23 / 21 (crossfade paused until open; open 699 / 709ms) → 23 (r1b: 639ms, 2 frames). SA and SC: 22 → 23 (r1b).

Machine totals above are the scorer's final read after each variant's own fixes; SA's was 22 on its last run (c10 off-token monospace, slowFrames=3).

### Results log

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| SA | 1 | 28 | kept, default | most varied beats; pins on render-1 standout; loses c10 (monospace only in SA.vue) and 3 slow frames |
| SB | 1 | 28 | kept | process-book idea fits; white pages break the dark site; build runs page, caption, page, caption |
| SC | 1 | 27 | kept | strong stats, sticky step and shot list; log and build repeat the same text-left, white-page-right device |

### Judges' notes

**Judge 1 (SA > SB > SC):** SA has the most varied beats; process pages stay small so the page keeps the dark look. Loses a c10 point: monospace appears only in the three sheet components, not the site CSS, plus slowFrames=3. SB: large white pages fill the width in the build beat and break the dark site; image-text rhythm Will rejected. SC: stat block, sticky step name and shot list are strong, but the AI log and build are back-to-back white pages beside text; heaviest monospace; phone build is image, caption, image, caption.

**Judge 2 (SA > SB > SC):** SA reads most like the site; numbered pins over render-1 are the standout; c10 loses a point for off-token system monospace (SA.vue:353,417,660; tokens.css only has --font-ui Host Grotesk). SB: fits the source, devices vary, but the build slides into image-text-image-text and white scans take over d2; same off-token mono; facts check out (p.53, p.58, p.60). SC: opening and shot list look right; command-line log adds a look the site lacks and uses the most mono; two middle beats are the same layout twice; stats match sources.

### Next-round changes for SA (not built; round 2 to decide)

1. c10: replace the system monospace in SA.vue (353, 417, 660) with Host Grotesk, tabular-nums and wider tracking; or label it PLACEHOLDER.
2. c14: make the concept/render diptych a keyboard-operable drag or scroll wipe.
3. Frame budget (slowFrames=3): word-by-word prompt lighting animates only transform/opacity; decoding=async and width/height on filmstrip and pinned render; viewport video starts only in view.
4. Use the clean Dune*.png renders and concept image, not the poster copies with the burned-in title (hero strip, 2x2 grid, phone pin image).
5. Link pins and legend (hover/focus lights the row in red, and back); on phone, legend directly under the render or tap-to-reveal.
6. Filmstrip: crop scans to the image inside the page or give a dark frame; keep page number as caption.
7. Problems table: hang each problem off its pin, or keep compact. Outcome viewport video as scroll-scrubbed solid, wireframe, render.
8. Shell (not this body): fixed close X covers body copy on phone at 375px; add top-right safe padding.

## Round 2 (2026-10-06)

Baseline SA kept unchanged (28/30). Machine reads below are the final run of each (stills and JSON in `stills/r2/`).
Judged /7 is for the separate reviewer.

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Judged /7 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA2 | SA refined: concept/render wipe, prompt type, cropped build filmstrip, pins with their problems, scroll-built shot | 2 | 2 (93%) | 2 | 2 | 2 (0.84) | 2 | 2 (617/417) | 2 (1) | 2 | 2 | 2 | 1 | 23 | 6 | 29 |
| SD | X-ray lens, prompt-to-place crops, scroll-driven build reel, problems crossed off, bento outcome | 2 | 2 (84%) | 2 | 2 | 2 (0.84) | 2 | 2 (654/416) | 2 (1) | 2 | 2 | 2 | 1 | 23 | 6 | 27 |
| SE | One frame: spec sheet + concept, pinned stage concept to render with rail and snags, prompt pull quote, shot hero + row | 2 | 2 (93%) | 2 | 2 | 2 (0.56) | 2 | 2 (615/408) | 2 (1) | 2 | 2 | 2 | 1 | 23 | 6.5 | 29.5 |

### Results log

| Variant | Try | Machine | Kept | Why |
|---|---|---|---|---|
| SA (baseline) | check | 18 → 23 | – | first read ran beside 3 other agents' scorers (82 frames); quiet re-run 23, 1 frame |
| SA2 | 1 | 18 / 17 | no | phone overflow 119px (scan figures sized by the image's intrinsic width); 82 slow frames |
| SA2 | 2 | 19 | no | overflow fixed; still 79–83 frames, open ~950ms. Diagnosis run with the scroll-scrub off: 21, 4 frames |
| SA2 | 3 | 23 | yes | scroll timelines attach only once `html[data-sheet=open]` (they re-resolved every frame of the grow/fold) |
| SD | 1–2 | 19 / 19 | no | same 82-frame cause |
| SD | 3 | 20 | no | timelines gated: 5 frames, open 871ms (container query + `:has`) |
| SD | 4 | 23 | yes | `cqw` replaced by a viewport-resolved sheet width, `:has` by a class |
| SE | 1 | 18 | no | media share 0.47 (type-only lead) |
| SE | 2 | 19 | no | AI concept beside the spec sheet: 0.56; 82 frames |
| SE | 3 | 23 | yes | timelines gated to the open phase |

SD took a fourth run: the third fixed one cause (8 → 1) but exposed a second (7); each run scored higher than the last.

### What r2 changed for SA (judges' list → SA2)
1. Host Grotesk everywhere, tabular figures and tracking for the ladder, chips and specs (no monospace).
2. Frame budget: word lighting is opacity only, on inline-block words, and runs only while open; every still has
   width/height and `decoding=async`; no second video (the closing beat is stills).
3. Clean Blender renders (Dune5RenderCorrected, Dune2, Dune7, Dune8) and the clean concept (ConceptGeneration.png).
4. Pins are buttons; pin and legend light each other (hover, focus, tap); phone legend sits right under the render.
5. Outcome ends on a pinned, scroll-scrubbed solid → wireframe → render of the same shot (Dune5Solid/WireFrame).
6. Phone text columns get 52px right padding so the shell's ✕ doesn't cover copy (body-side; shell untouched).
7. Concept/render wipe (native range input, keyboard-operable), inpainting problem hung under it.
8. Filmstrip and prompt pages show the image cropped out of each process-book page, on black, page number as caption.
9. Problems table removed: each problem hangs off its pin (red ring + red "Problem" line), the roadmap one in the outcome.

### Round 2 scores (judged, 2 reviewers, both orders)

| Variant | Machine /23 | Eye /7 | Total /30 | Pair wins | Layout |
|---|---|---|---|---|---|
| SE | 23 | 6.5 | 29.5 | 2 | One frame. Spec sheet beside the AI concept. One pinned 16:9 stage morphing prompt grid > concept > Photoshop measurements > solid > wireframe > dust > render, stage rail, caption with red Snag line. Prompt pull quote with Lore Keeper's Vault struck through. Outcome: big render, row of three, spec slate. Inspiration: Apple scroll-scrubbed product pages, Figure Film / Archi Malin stages, Rejouice type. |
| SA2 | 23 | 6 | 29 | 1 | SA refined. Concept/render wipe (native range, keyboard), prompt ladder and chips in Host Grotesk, opacity-only word light, filmstrip of process-book crops on black, pins as buttons linked to legend each with a red problem, pinned solid > wireframe > render scrub. Inspiration: BlenderNation breakdown sliders, OKTO / NIKI word-lit copy, Apple scrub sequences. |
| SD | 21 | 6 | 27 | 1 | X-ray lens over the render (pointer, touch, arrows), prompt-to-place with 4 numbered phrases and crops, Blender build as a sideways reel, problems crossed off, bento outcome. Inspiration: Lusion heroes, MOUNT inc, Elementis, proof-mark strikeouts. |
| SA | 23 | 3.5 | 26.5 | 0 | baseline (phone close button covers copy: c15 0) |

Best SE 29.5 (gain +1.5 over r1's 28). Stop: continue.

### Results log (r2 judging)

| Variant | Round | Score | Kept | Why |
|---|---|---|---|---|
| SE | 2 | 29.5 | default | quietest, most on-brief; single morphing stage is the standout; phone leaves empty black, Air stage letterboxed |
| SA2 | 2 | 29 | kept | varied devices, Host Grotesk fixed; filmstrip small in black cells, scrub stage grey, long outcome copy |
| SD | 2 | 27 | kept | best prompt-to-place; 5 slow frames, empty crates tile, strikeouts overstate fixes |
| SA | 2 | 26.5 | kept | baseline; mono ladder, phone close-button collision |

### Judges' notes (r2)

**Judge 1 (SE 2 wins; order SA2 > SE > SD > SA by eye 7/7 for SA2):**
- SA: reads as the site but prompt ladder and chips are monospace (breaks Host Grotesk); image-text pattern; phone close button over copy, c15 0.
- SA2: a different device per beat; only red and mono used; copy short and matches story.md. Weak: small filmstrip crops in wide black cells, flat grey scrub stage, long outcome paragraph.
- SD: best storytelling idea (prompt-to-place), inventive lens/strikeouts. But 5 slow frames, borderline timing, empty "Concept: -" crates tile, small left-aligned crops; strikeouts overstate ("Stretched materials and UVs" only hidden by DOF; "ambitious plan with no roadmap" is not fixed). Phone reel has empty black bands.
- SE: clean, quiet, smooth; red Snag line works. One pinned stage for all seven beats (same device). Air stage letterboxes a page in black; prompt shown twice; phone ~200px empty black above/below the stage.

**Judge 2 (best SE):**
- SE: quietest, most on-brief; morphing 16:9 stage with rail is the most impressive device. Weak: half the phone screen empty black, wireframe frame cropped through the building; Air stage letterboxed collage; render under the quote repeats the hero.
- SD: prompt-to-place best beat, struck-off list strong. Loses c10 (timing at boundary, 5 slow frames); empty crates tile; hero stacks two near-identical renders; phone captions small and clipped.
- SA2: Host Grotesk fixed, white pages gone. Heaviest copy (long pin legend, outcome paragraph, problems repeated). Wipe compares a concept and render that do not line up. Pins/legend image-then-text again.
- SA: monospace ladder/chips, white page strip breaks dark look, close button over copy on phone.

### Next-round changes for SE (not built)
1. Phone: taller 4:5 or 1:1 stage (or caption into the empty space); per-frame object-position so wireframe/solid keep the building in frame.
2. Borrow SD's prompt-to-place: underline 4 phrases in red in the pull quote, each jumps the stage (rock face > Solid, crates and pad > Wireframe, dunes > Air). Keep the struck-through Lore Keeper's Vault inside the quote's first view.
3. Air stage: full-bleed dust render crop (or volumetric off/on pair) instead of the letterboxed collage.
4. Under the quote use another render (pull-back or the 10s film in view), not the hero.
5. Copy: checkpoint list becomes "Three base models, six checkpoints. The wording mattered most." Every SNAG one clause. Re-run no-ai-slop.
6. Keep the morph opacity/clip only (no filter) to stay clear of c8 slow frames.

### Fallback for SA2 (if SE regresses)
Borrow prompt-to-place (4 numbered phrases matching pins); fill filmstrip cells (cover); hero to ~55vh; trim copy; crop scrub to subject, end on full-colour render; non-breaking hyphen in "mega-structure".

## Round 3 build (2026-10-07): SE kept as baseline (29.5), unchanged
Machine scores (frozen scorer, run one after another, stills in `stills/r3/`). Judged 9, 14, 15-readability pending.

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Raw |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SE2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 2 slow frames, 602/429ms (2 runs, both 23) |
| SA3 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 2 slow, 648/412ms, media 0.84 |
| SF | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 2 slow, 647/421ms; try 1 scored 22 (c5 media 0.47), split frame moved into the lead: 1.03 |

- SE2: SE plus all six "Next-round changes for SE" above.
- SA3: SA2 plus the fallback list, except the hero height: the shell owns the hero (BRIEF), so the wipe became a 21:9 band instead.
- SF (new): split-pass frame + prompt headline with inline render crops → scroll-panned horizontal build track (swipe rail on phones) → 2×2 shots and slate.

## Round 3 scores (judged, final)

Baseline SE kept unchanged. Machine /23 from the frozen scorer; Eye /7 is the mean of the judges' reads.

| Variant | Layout | Machine /23 | Eye /7 | Total /30 | Judge wins |
|---|---|---|---|---|---|
| SF | New. Lead is one frame split in 3 bands (solid / wireframe / render); final prompt as headline with a render crop inline after each phrase; build is a horizontal track panned by scroll, red progress bar and red snags (phones: swipe rail); outcome is a 2x2 of four shots plus the slate. Inspiration: Obys Agency scroll carousel (keeper), Awwwards Creative Pass horizontal scroll (Oscar Bravo, Tim Dunk), inline-image headlines, VFX split-pass frames | 23 | 6.75 | 29.8 | 3 |
| SE2 | SE refined: spec-sheet lead, pinned one-frame morph (opacity only); 1:1 phone stage with per-frame object-position; Air is a full-bleed dust crop; 4 red-underlined pull-quote phrases with stage numbers scroll the stage; outcome opens on pull-back; one-clause snags. Inspiration: Apple scroll-scrubbed pages, Figure Film, Archi Malin, SD prompt-to-place | 23 | 6.5 | 29.5 | 1 |
| SA3 | SA2 refined: 21:9 concept/render wipe; prompt lit word by word, 4 numbered underlined phrases linked to pins; full-cell crops; 8th legend cell removed; trimmed copy; closing build-up from one camera. Inspiration: BlenderNation sliders, OKTO/NIKI word-lit type, Apple scroll sequences | 23 | 6.25 | 29.3 | 0 |
| SE | baseline | 23 | 5.75 | 28.8 | 0 |

Best: SF 29.8 (gain +0.3 over SE2's 29.5 in r2). Stop: plateau. SF is the default Sheet.

### Results log

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| SF | final | 29.8 | kept, default | lean copy, red only on snags and progress; four distinct devices; loses on dead black spacers, empty Solid band, near-identical 2x2 renders |
| SE2 | final | 29.5 | kept | fixes SE; still one pinned stage carrying the middle; crates/pad links land on the wrong frame |
| SA3 | final | 29.3 | kept | most varied but heaviest copy; four numbering systems; one claim not in the sources |
| SE | final | 28.8 | kept | baseline, superseded by SE2 |

### Judges' notes

**Judge 1 (SF > SE2 > SA3 > SE; fix SF first):** SE: one device carries every beat; Air frame letterboxed; padded model list; phone gap above the strip. SE2: real fix on SE; still mostly one stage; "Crates of contraband" and "landing pad" both map to stage 05 (Wireframe) though crates came with the second building; phone ornithopter clipped left. SA3: most varied but copy-heavy for minimal/brutalist; four numbering systems; phone PROBLEM line above title; "so I built them in 3D instead" is not in the sources (story p.63: dropped for time); about 150px dead black in the build frame. SF: lean copy, red kept to snags, bar and the struck-through Lore Keeper's Vault; all devices different. Weak: dead spacers 150-200px around the pinned track, mostly empty grey Solid third, four near-identical renders in the 2x2, phone title twice and inline thumbs about 45px.

**Judge 2 (SF > SA3 > SE2 > SE; SF 6.5 judged):** SF: most impressive and least repetitive; monochrome plus red, Host Grotesk, no blur, one line per card true to story.md. Loses c9 half: 01 SOLID band empty grey at fold (d0), about 150px dead black above the track and between track and grid (d1, d3), prompt-grid crops keep white gutters. Phone readable, rail peeks correctly. SA3: reads as the site, word-lit prompt strong, but piles up devices; heaviest copy; numbering clashes; wipe pairs concept and render that do not line up; scrub stage flat grey under an empty black band. SE2: clear fix of SE; one device carries the middle; SE2.vue:40-41 sends both phrases to Wireframe, whose caption does not show them; phone black bands. SE: baseline, letterboxed Air stage, run-on nine-model caption, small phone stage; SE2 supersedes it.

### Next-round changes for SF (not built; run stopped on plateau)
1. Remove dead black spacers around the pinned track (about 150px above "01 PROMPT TO PIXELS", 200px above and 140px below the track, 140px before the outcome grid): size the pin to the track or centre the heading inside the pinned viewport.
2. Lead bands (SF.vue ~line 419, .bd__img--0): per-band object-position so Solid shows the ornithopter, or shrink the hero so all three bands fit the 900px fold.
3. Prompt-grid crops: crop past the white gutters or set on black.
4. Outcome: lead with the 10s film large (sound toggle) and one hero render plus three tight crops; phones use the same swipe rail.
5. Phones: drop the duplicate "SMUGGLER'S OUTPOST", shorten meta to "GDES6001, 3rd year, Jan-Apr 2025", inline thumbs at least 1.2x cap height or a row under the prompt; add a step counter or progress bar to the rail.
6. Track: each card's snag text fully in view at rest ("The arch failed u..." is clipped at right in d2).
7. Facts: "Object scaling" is a general crit-slide problem; move it to the Camera/renders card or word it generally.
8. Optional: inline thumbs scroll the track to their card (SE2's underline-to-frame link).
9. If SE2 stays as fallback: link "Crates of contraband" and "rust-covered landing pad" to the assembly frame, not Wireframe (SE2.vue:40-41).
