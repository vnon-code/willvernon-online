# Remnants: notes (overnight run)

## r1 build (RA, RB, RC)
- Teaser: kept. old = new = R2 `Remnants Outcome_1.mp4` (poster assets-remnants-outcome-1.webp). It is the only video in the
  sources and it is the outcome; nothing better exists. (A stone-glyph poster would beat the black title frame; Will to decide.)
- Fixed a source error: the old site's glyph captions 3–9 were mis-paired; the Sheets follow process book p25/p27.
- Kept seed (665821143) inferred from p34's layout — Will to confirm.
- Module code: about.json's GDES4002 used; the process book also prints GDES5002 / GDES4005 — Will to confirm.
- Ids RA–RC (A–C are shared body ids, TOOLS.md §1).
- Inspiration: RA type foundry specimens (Klim, Grilli Type: tester, glyph set; Pentagram type case studies);
  RB stratigraphy section drawings, NYT "Snow Fall" / The Pudding pinned scrollytelling, IKEA parts diagrams, player speed menus;
  RC Pitt Rivers object records, British Museum / Cooper Hewitt collection pages, light-table onion skin, YouTube chapters.

## r1 machine scores (scorer, --out r1; all runs logged)
- RA: 22 (3 slow frames) → smaller first-view stills (stone-*-xs) → 23 (2) · 19 (7 slow, open 776ms: first run after a story.ts
  recompile) · 23 (1) · 23 (1). Phone overflow 0, min font 10px.
- RB: 22 (5 slow) · run lost to HMR · 22 (5) → strata scroll timeline gated → 21 (3, close 465ms) → timeline attached once,
  1.2s after open → 23 (2) · 23 (1). Dig verified in headless Chrome: strata open at 8–84% of the run.
- RC: 19 (16 slow, open 717ms): the light table's mix-blend-mode forced the whole layer into a blend group during the flight;
  removed → 23 (1) · 23 (1).
- Copy run through no-ai-slop (two colon reveals rewritten). Light-table guide position is by eye per frame (PLACEHOLDER).

## r2 build (RD refined baseline, RE and RF challengers; RA kept unchanged as baseline)
- RD = RA refined (the brief said refine the baseline RA; RA-specific judge notes applied, plus the RC notes that carry over):
  film added with one device (a caption band above it that decrypts "remnants" live during the film's title, then names
  each glyph as it appears); the nine-row table became one lineage picked by key (phones: stone and glyph first, no
  sideways table); the seed log carries the ControlNet guide in the same 16:9 box as each render; decrypt row inside body width.
- Guide alignment measured, not by eye: overlaying glyph-1 on seed-0…5 puts the mask square at 66%×360/322 of the render's
  height, centred (story.ts `GUIDE`). The film frames don't match (AE floats the pieces apart), so no guide over the kept
  film frame.
- Faint squares on glyphs: the glyph/line webps have alpha 1/255 in the background. New `glyph-N-c.webp`, `line-N-c.webp`
  (alpha < 12 → 0) used by RD–RF; originals untouched so RA stays as scored.
- Shared fix (SheetContents.vue): the margin rail lit the next section while the current heading was still on screen
  (edge was view bottom − 80px). Edge is now the top 40% of the view. Affects every Sheet's rail, not their scores.
- Teaser: kept (same reason as r1).
- Inspiration: RE The Pudding / NYT play-along explainers ("You Draw It"), Alice Kober's Linear B cards, Knight Lab
  JuxtaposeJS before/after, player speed menus. RF OED / Merriam-Webster entry typography, Omniglot script pages,
  etymology stemma diagrams, edit-timeline rulers.
- Copy checked with no-ai-slop (detect): nothing flagged.

## r2 machine scores (--out r2)
- RD: 23 (1 slow) · 23 (1 slow) after the stone-cell fix.
- RE: 22 (3 slow, open 673ms) · 22 (6 slow) → dropped a `:has()` focus ring (style recalcs) → 23 (2 slow, open 636ms).
- RF: 23 (1 slow) → link labels widened → 23 (0 slow).
