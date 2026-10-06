# Remnants — scoring matrix

## Round 1 (r1)

All variants scored 23/23 machine (perfect). Pending judge scores (9: reads as this site, 14: tells story, 15: text readable on phone).

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine | Notes |
|---------|---|---|---|---|---|---|---|----|----|----|----|----|---------|-------|
| RA | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 56 media, 47px max step, 93% body start, 614ms open, 417ms close, 1 slow frame |
| RB | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 15 media, 47px max step, 93% body start, 605ms open, 416ms close, 0 slow frames |
| RC | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 | 23 | 35 media, 47px max step, 93% body start, 619ms open, 421ms close, 0 slow frames |

### Stills (r1)

Desktop (1440×900 dark) and phone (375×812):

- **RA**: `RA-d0.png`, `RA-d1.png`, `RA-d2.png`, `RA-d3.png` (desktop); `RA-p0.png`, `RA-p1.png` (phone)
- **RB**: `RB-d0.png`, `RB-d1.png`, `RB-d2.png`, `RB-d3.png` (desktop); `RB-p0.png`, `RB-p1.png` (phone)
- **RC**: `RC-d0.png`, `RC-d1.png`, `RC-d2.png`, `RC-d3.png` (desktop); `RC-p0.png`, `RC-p1.png` (phone)

All in `.scratch/v1-launch/overnight/remnants/stills/r1/`.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| RA | 23 | 6.5 | 29.5 | 0 |
| RC | 23 | 6.5 | 29.5 | 0 |
| RB | 23 | 5.5 | 28.5 | 1 |

## Results log (r1)

- r1 RA (Specimen: the nine glyphs as stone slices under the hero, hover shows the glyph; a type tester for keys Q to O with a size slider; a 9x5 table tracing each glyph from object to line, grid, glyph and stone; a seed log you step through, with the 12 first tests as the problem; the 'remnants' title decrypting live): 29.5/30. Inspiration: Klim and Grilli Type specimen pages, Pentagram type case studies.
- r1 RC (Collection: the nine Pitt Rivers objects in a vitrine row; a catalogue of glyph cards opening one object record; a light table with the ControlNet guide over the stone and an opacity slider, plus a swipe rail of the first tests; the film split into chapters, one per glyph, following playback): 29.5/30. Inspiration: Pitt Rivers, British Museum and Cooper Hewitt collection pages, light-table onion skin, YouTube chapters.
- r1 RB (Strata: the title as four film frames; a pinned CSS scroll-driven dig down five layers of a chosen glyph with a depth gauge and picker; the Photoshop cut as a numbered parts list over the filled plate; the film with a 60%/100% speed switch): 28.5/30. Inspiration: archaeological section drawings, NYT Snow Fall and The Pudding pinned scrollytelling, IKEA parts diagrams.
- Best RA 29.5/30 (tied with RC; RA listed first); gain n/a (first round); stop: continue.

## Judges' notes (r1)

**Judge 1:** RA: shared shell intact; type tester, stone-slice hero, seed log and live decrypt read as a real specimen, red as accents only. Big gap: no <video>, so the 61 s film never appears though the copy mentions it. The 9x5 table repeats one row device about nine times (~1000px). On phones the table has min-width 680px with overflow-x (RA.vue:370-375), hiding glyph and stone columns. Title-decrypt glyph tiles show dark box backgrounds. RB: most inventive devices (film-frame title strip, pinned dig with depth gauge and picker, Safari @supports fallback, parts list, 60/100% switch), but skips first tests and seed story; low-res object photo upscaled soft; at 375px timecodes overlap glyphs (RB-p0); picker wraps to two rows, parts labels 10px. RC: tells the whole story (vitrine, catalogue and record, ControlNet light table with seed, rail of first tests, film chapters matching story.md). Weak: red guide offset from the stone in RC-d2; same Haa'sk stone three times in a row; section index highlighted 02 while 01's heading was in view.
Next round (RC): 1 align ControlNet guide with the stone (same box and object-fit for both layers); 2 light table and tests rail follow the catalogue's glyph, or default to different glyphs; 3 add one higher-impact beat (RA's live decrypt over the film title chapter, or RB's 60/100% switch beside the chapters), one device only; 4 phone: nine-object vitrine becomes a swipe rail with readable labels, check the record's three-image strip; 5 fix the section index highlight; 6 recheck copy with no-ai-slop, 1-3 lines per beat. If RA is carried forward it must add the film, and on phones show glyph and stone first instead of a 680px sideways table.

**Judge 2:** RB: fits the shell; the pinned dig is the strongest device in the round; beats vary; copy short and matches story.md. Gaps: no ControlNet seed or first-tests beat; Happy-mask object layer (d2) is an upscaled pixelated photo; at 375px timecodes print over glyphs (RB-p0). RA: type-specimen frame suits inventing a script; most story coverage (tester, object-to-stone table, seed log, first tests, decrypting title). Polish: d3 decrypted title row runs past the right edge and the last glyph clips; glyph PNGs show faint lighter squares; 9-row table long and image-dense; at 375px table spills sideways. RC: clean collection framing, film chapter rail matches story.md; reads image-text-image-text; same Haa'sk stone twice in a row; light-table red guide offset (d2); large empty black band before the film (d2); phone sound.
Next round (RB, best by this judge): 1 phone hero: move timecodes above/below glyph rows or give solid chips; 2 add the missing AI beat as its own 'Stone' beat (ControlNet guide over the stone, 12 first tests, kept seed 665821143) using a device other than the dig; 3 swap the pixelated Happy-mask crop for a higher-res photo or show smaller with object-fit: contain; 4 check the pinned dig is jank-free on a trackpad and no large cream panel flashes mid-wipe (dark-ground line variant); 5 keep the parts list, number parts on the plate IKEA-style with leader lines; optionally borrow RA's live decrypt, keeping the title row inside the body width.
