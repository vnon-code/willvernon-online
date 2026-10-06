# Marimekko Exhibition: notes (overnight r1)

## Teaser
- Poster: `/img/posters/assets-vernon-gdes50014-animation-1.webp` → `/img/posters/marimekko-mural.webp` (content/strip.json).
  Why: the old poster is a mostly white banner; the mural crop (1280×720, 16:9 of `mural.webp`) is the most striking
  single image, and the poster also feeds the card at rest, the dot field and the Sections thumbnail.
  Trade-off for Will: when the centre card starts the video, the image swaps from the mural to the animation's white
  first frame. Revert is one line in strip.json.
  Note: the poster is a crop of a PC mock-up but lives in committed `public/img/posters/` (as the BRIEF says posters
  go); Will to OK committing it.
- Video: unchanged (R2 animation).

## Variants (ids MkA–MkC; A/B/C are shared ids, TOOLS.md §1)
- MkA Colourway: refs marimekko.com colourway swatches, Pentagram identity case studies, Obys/Rejouice hover lists.
- MkB Follow the tape: refs "Later Came Early" at Fabrica (It's Nice That, orange tape leads visitors), Powerhouse
  Museum one colour per level (SEGD), Will's field-trip note, Son Daven.
- MkC Rulebook: refs NASA Graphics Standards Manual reissue, Experimental Jetset identity pages, Will's A3 sheet.
- Machine scores r1: MkA 23/23, MkB 23/23, MkC 23/23 (phone overflow 0px). Judged criteria pending.

## For Will
- Spelling: Will's work says "Anikka Rimala"; the designer is Annika Rimala. The Sheet copies the work's spelling.
- Year shown as 2024 (due March 2024; the book is dated Dec 2023). Module "GDES5014 Visual Systems".
- The typeface on the Sheet is the system's American Typewriter (Mac only; Courier fallback elsewhere).

## Round 2 (build)
- Baseline MkC kept unchanged (29.3). New: MkC2 (MkC refined with judge 2's six fixes), MkB2 (judge 1's MkB list; a
  challenger because judge 1 rated MkB highest on c14), MkD (new layout). Copy added at the end of story.ts (MK2,
  BEATS, LOOP) so r1 variants render exactly as scored; checked with no-ai-slop.
- MkC2's loop track uses the video's real beats, read off frames at 1.5 s steps (logo 0 s, Isola ~1.7, Kekki 6,
  Rimala 10, Ishimoto 14, logo + dates 18–22 s). r1's four "technique" labels were not a timeline.
- MkD refs: Pentagram "Mushrooms" exhibition identity (pentagram.com/work/mushrooms), Mucho's MACBA system
  (wearemucho.com/work/macba), Grafik "Human Nature" (grafik.net/human-nature), museum tombstone labels, catalogue errata slips.
- The 51 MB R2 loop now also plays in the body (MkC2, MkB2, MkD): preload="none", plays only in view. A smaller
  encode would help (no ffmpeg here).
- Teaser: no change this round (r1's mural poster stands).
- Machine r2: MkC2 23/23, MkB2 23/23, MkD 23/23 (phone overflow 0px each).
