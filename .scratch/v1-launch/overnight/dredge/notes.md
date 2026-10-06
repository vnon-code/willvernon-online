# Dredge: notes (overnight run)

## Teaser (r1, 2026-10-06)
Kept: `content/strip.json` unchanged (old = new: poster `/img/posters/ai-dredge-preview-1.webp`, teaser R2
`ai/Dredge_preview_1.mp4`). Why: it is already a 9 s cut of the 44.7 s outcome and matches it; the best still
(`mj-whale-top.webp`) would lose the motion the strip is built on.

## Build decisions (r1)
- Ids DA, DB, DC (A–C are shared bodies, TOOLS.md §1). Shared facts in `app/components/sheets/dredge/story.ts`; the
  title and the prompt are read from `content/ai.json`, not retyped. All three use the shared SheetHead (film in its
  `before` slot), SheetSectionNo, SheetCredits, and Monolith's `useOpenPlay` (videos play in view, 1.2 s after open).
- DB's wall clips play on pointer only once the Sheet has settled (1.5 s): the pointer rests over the wall during the
  open, and a clip decoding in the flight cost 55 slow frames and a 659 ms close. Fixed: 1 slow frame, 419 ms.
- Made with AVFoundation (no ffmpeg): `poster-film.webp` (9 s frame, the figure on the slab; the film opens on a dark
  whirl), `poster-clip-*.webp`, 15 `strip-NN.webp` frames of the film (DA's scrub strip), and `-sm` half-size stills.
- DA's hotspots are placed by eye on `mj-gloves-dark.webp`. DB's plate shades are picked by eye.
- Copy is PLACEHOLDER, run through no-ai-slop ("in every shot" → "from shot to shot", a vague look line made concrete).

## Only Will can decide
- Tools: the files show Midjourney (stills and video), Nano Banana, Premiere Pro; the old site names Luma Dream Machine
  and frame interpolation. The Sheets use the file evidence.
- Info "Module: Personal experiment" (no brief or client exists).
