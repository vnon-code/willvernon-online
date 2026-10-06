# Powersurge: notes (overnight r1)

## Teaser
- `content/strip.json` teaser: `/img/powersurge/powersurgegif.gif` → `/proto-media/powersurge/teaser-360.mp4`. Poster unchanged
  (`/img/powersurge/PowerSurgeSS.png`).
  Why: same burst imagery from the final film, 4.3MB vs 15.6MB, a real video that plays only in view and can continue
  through the card-to-Sheet grow (criterion 1). Every other card already uses an mp4.
  Trade-off: 640×360 vs the gif's 800×450, so a little softer. Re-cut at 1080p once ffmpeg is available.
  Needs R2 upload before ship (on `public/proto-media/powersurge/UPLOAD.md`); revert is one line.

## Variants (ids PwA–PwC; A/B/C are shared ids, TOOLS.md §1)
- PwA Datasheet. Refs: Texas Instruments / Analog Devices datasheets, Teenage Engineering OP-1 field guide, Our World in Data's linear/log toggle.
- PwB Curve. Refs: Bloomberg "What's Really Warming the World?", The Pudding's sticky-chart scrollytelling, Refik Anadol Studio data-painting pages.
- PwC Control surface. Refs: Teenage Engineering product pages, EMS Synthi pin matrix, Ableton Live arrangement view, TouchDesigner parameter panels.
- Shared head, contents, numbering and credits used in all three (TOOLS.md, 2026-10-07).
- Copy in `app/components/sheets/powersurge/story.ts`, PLACEHOLDER, run through no-ai-slop.

## Decisions
- The curve in PwA/PwB is Moore's Law as a model (doubling every two years, 1997–2021), labelled as a model. The
  spreadsheet with the film's real data wasn't pulled; the real OWID chart sits beside it (PwA).
- Info rail has no Role: the sources don't split roles beyond Suyash's year animation and title typeface (credited).
- Clip 4:22–4:42 shows about 2016–2018 (frames read: 4:45 = 2018, 5:00 = 2020, 1:00 = 1997).

## For Will
- OK the teaser swap and its R2 upload; upload the full 1080p film if the Sheet should play it whole.
- Your role on the project, for the info rail.

## Round 2 build (machine scores, `stills/r2/`)
- Teaser: already `/proto-media/powersurge/teaser-360.mp4` in `content/strip.json` since r1 (old `/img/powersurge/powersurgegif.gif`, 15.6MB gif); kept, same reasons as above. Still needs the R2 upload.
- Baseline PwB unchanged (29.8/30).
- PwB2 (PwB refined, 23/23 machine; open 609ms, close 419ms, 1 slow frame): years on the opening frames; steps say what the film shows that year (`SEEN` in story.ts), process facts moved to 02 (data line, "normalising → sphere"); PwA's Linear/Log toggle on the sticky chart; dashed 75% knee on the curve, repeated on the runtime bar ("Quiet 75%"); each step carries the model multiple of 1997 and steps are shorter (46vh); the drives are PwC's pin matrix; phones ≤600px: compact strip (frames 2.4:1, curve 120px, HTML ticks 12px), only the step crossing the reading line shows, active year read on scroll (rAF) so jumps land right. Frames say "Film, m:ss" or "Render". Climax video preload none + data-in-view; frames lazy.
- PwD "To scale" (23/23; 619/414ms, 1 slow frame after deferring row media until the section is near; first try 19/23, 8 slow frames). Refs: Matt Korostoff "Wealth, shown to scale", The Pudding scale pieces, GitHub split diff.
- PwE "Explorable" (23/23; 643/421ms, 2 slow frames; frames mount on first pick). Refs: Bret Victor "Explorable Explanations"/Tangle and "Up and Down the Ladder of Abstraction", Nicky Case explorables.
- Decisions: film time in PwE is interpolated between the frames read on the film (1997 1:00, 2018 4:45, 2020 5:00), shown as a time, not claimed exact; PwE colour swatch is a sketch from the book's description (blue fixed, red and green rise), labelled so. Copy checked with no-ai-slop ("Three quarters in. Still almost flat." → one sentence).
