# Handheld Stories: notes (overnight run)

## r1 build (HA, HB, HC)
- Ids HA–HC, not A–C (shared ids, TOOLS.md §1).
- Media cut locally from the film with avconvert (Preset960x540, 8 s each): clip-landing / -catalogue / -object / -database. Frames via AVFoundation.
  The full film stays on R2 (the hero teaser), so no variant repeats it in the body.
- Turntable: 44 frames of the film's object viewer (24–35 s), cropped, logotype remnant masked, one 11×4 sprite (490 KB, loads near view).
- Catalogue rows (HB): Will's CatalogueFrame.png with its blue viewport guide keyed out.
- Copy run through no-ai-slop (detect): fixed two colon reveals and one fragment run.
- The 'game character-select' reference image (p13, a commercial game screenshot) is left out on purpose.

## Teaser
Kept (task said keep): https://assets.willvernon.online/projects/02_handheld-stories/assets/Vernon_HandheldStories_GDES6004.mp4 -> unchanged.
For Will: that file is 86 MB for 100 s; a short cut of the object viewer (24–52 s) would be a lighter, stronger teaser. Not applied.

## Only Will can decide
- Year 2025 and the module line; whether to name the ambient track (the book doesn't).
- Whether the Osake logotype crop and the BM roundel can be shown publicly.

## r2 build (HA2, HD, HE)
- HA unchanged (baseline). New strings and media were added to story.ts beside the old ones (spark2, turn2, rotoK, rowTopC/rowBotC) so HA renders exactly as scored.
- roto-grid-k.webp: the 150 cells from roto-grid.webp keyed (green-dominance matte, despill) onto #0a0a0a. Judge 2 asked for one uniform scale: not done. The source frames themselves zoom in (the recording pushes in), so rescaling would misstate the work; the order and crop are Will's (p25).
- row-top-c / row-bot-c.webp: rows cropped and the stray disc arc and '=' bar painted white (the HB seam artefact).
- Close button on the BM roundel (phone): the roundel is in the shell's hero (the R2 teaser) and the button is the shell's. Not fixable in a body; teaser kept as told. For Will: a teaser cut that starts on the catalogue would clear it.
- Noto Sans: no r2 variant labels a face or sets type in it.
- Copy run through no-ai-slop (detect): fixed fragment pairs ("Static displays, dense text panels."), two colon reveals, and "Seven exports later, the walkthrough." Rewrites in story.ts.
- Bug found in HB (not touched, not a baseline): `:global(html[data-sheet='open']) .vt__ring img` compiles to `html[...]`, so its ring never runs. HE hit the same trap with `animation` and rotated the whole page; fixed there.

## Teaser (r2)
Kept, unchanged: Vernon_HandheldStories_GDES6004.mp4 -> same.
