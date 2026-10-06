# Synthetic Corals: notes (overnight run)

## Teaser (r1, 2026-10-06)
`content/strip.json` synthetic_corals: teaser `null` → `https://assets.willvernon.online/ai/coral_rotate.mp4` (2.6 MB,
already on R2, no upload). Why: the card showed only a poster; the poster is this clip's first frame, so the card
now moves without a visual jump, and it is the strongest moving asset. Poster unchanged.

## Build decisions (r1)
- Ids CA, CB, CC (A–C are shared bodies). Facts in `app/components/sheets/synthetic_corals/story.ts`; title, prompt,
  settings and run names are read from `content/ai.json`. All three use SheetHead (own first-view media in `before`),
  SheetSectionNo, SheetCredits, and Monolith's `useOpenPlay` (videos play in view, 1.2 s after open).
- Correction to story.md: both clips are portrait (10 s at 1072×1920, 5 s at 720×1280), not square.
- Made with AVFoundation + PIL (no ffmpeg): `poster-vertical.webp`, 24 `spin-NN.webp` frames of the 10 s clip
  (CC turntable, 444 KB, lazy), `-sm` half-size stills. Colour shares: PIL median-cut on the coral, near-black and
  near-white background dropped (CC).
- CA's node canvas shows the settings in the order ai.json lists them; it is not the real graph (no workflow file found).
- Copy PLACEHOLDER, checked with no-ai-slop ("Run 5, lifted" → "Run 5 over a white floor"). "intricate" stays: it is
  Will's prompt, shown as written.
- Inspiration: CA Haeckel's Kunstformen der Natur plates, NHM specimen labels, ComfyUI's canvas; CB fxhash / Art
  Blocks token pages, a thermal receipt, light/dark toggles; CC Google Arts & Culture Art Palette, Cooper Hewitt colour
  search, 360° product viewers (Apple, Nike, Sketchfab), OpenAI's tokenizer page.

## Only Will can decide
- Tools: ai.json says ComfyUI / HiDream / Flux.1 Dev (+ Ultrasharp 4x); the old card tag said AntiGravity.
- Year 2026 from file dates only; "Module: Personal experiment".
- Whether to say anything about run 3 (all three variants show it as missing).

## Build decisions (r2)
- Teaser unchanged since r1 (already `ai/coral_rotate.mp4`).
- The shell's hero is the 10 s clip (`coral_rotate.mp4`, the teaser). Each r2 variant shows the 5 s clip once more at most and
  never puts the 10 s clip in the body (CD shows six frames of it instead).
- CE's map positions are a judgement from the run names (story.md's two contrasts), labelled "Placed by eye" on the page.
- CF's "May 2026" is the file date; "Lot" is framing only (no estimates, no provenance invented).
- CF uses `content-visibility: auto` on its two lower sections: criterion 8 read 3–4 slow frames without it, 2 with it.
- New copy checked with no-ai-slop (detect pass: no patterns found). Media: nothing new; all files already in UPLOAD.md.
