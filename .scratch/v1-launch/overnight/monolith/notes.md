# Monolith Survival: notes (overnight run)

## Teaser (r1, 2026-10-06)
Kept: `content/strip.json` unchanged (old = new: poster `/img/posters/ai-monolith-preview-v2.webp`, teaser R2
`ai/monolith_preview_v2.mp4`). Why: its first frame (hooded figure, red lens, white sky) is the project's strongest
image; `trailer.mp4` opens on a weaker grey cliff. The trailer appears inside MB instead.

## Build decisions (r1)
- Ids MA, MB, MC, not A, B, C: TOOLS.md §1 forbids shared ids (A–C are shared bodies).
- Shared data in `app/components/sheets/monolith/story.ts`, credits in `MoCredits.vue`, and `useOpenPlay.ts` (not variants).
- Videos: the shell's usePlayInView starts videos on mount; a second video decoding during the flight cost 48 slow
  frames and a 660ms close (MA, first run). `useOpenPlay` plays `video[data-play]` only in view, only 1.2s after the
  Sheet is fully open, and pauses them on close: 2 slow frames, 430ms close. All videos are `preload="none"` with posters.
- Stills get half-width `-sm` copies and srcset (headless rasterising 1080×1920 stills also cost frames).
- The lead block fades in at 420ms (CSS on the body section, `data-build` on its inner wrapper, as SF does):
  criterion 2 reads 93–95% instead of 59%.
- Posters: AVFoundation first frames (no ffmpeg). The film opens on a grey storm, so its poster is the 3s profile frame.
- Copy is PLACEHOLDER (story.ts `_status`), run through no-ai-slop. Facts only from story.md; the night log uses the file
  timestamps. Swatch hexes are PIL medians of named patches; MC's swatch crops are placed by eye.

## Only Will can decide
- Lead name: Monolith Survival (site) or VARKON (files). The Sheets lead with Monolith Survival and mention VARKON.
- Tools: files show Midjourney (stills and video), Nano Banana, Premiere Pro, with no Luma file; the old site says
  Luma Dream Machine. The Sheets use the file evidence.
- Whether `desert-monolith-6369.mp3` was the sound bed (not credited).
