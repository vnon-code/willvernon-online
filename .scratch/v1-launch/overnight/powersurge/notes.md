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
