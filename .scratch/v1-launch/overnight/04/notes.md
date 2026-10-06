# 04 Topography AV Test: notes (overnight run)

## Teaser
Kept: `https://assets.willvernon.online/experiments/TopographyAV_Test2.mp4` (poster `/img/posters/experiments-topographyav-test2.webp`) -> no change. It is the finished 1:57 piece, square, already on the card; nothing in the sources beats it. `content/strip.json` untouched.

## Round 1 build (TA, TB, TC)
- Ids TA–TC, not A–C: those are shared body ids (TOOLS.md §1), same as monolith's MA–MC.
- The shell's hero already plays the outcome (the teaser), so no body repeats it; the bodies use the cinematic cut, the grey terrain, the stills and the slide networks.
- Shared facts in `app/components/sheets/04/story.ts`, credits in `TopoCredits.vue`; videos reuse monolith's `useOpenPlay` (play in view, 1.2 s after the Sheet settles), all `preload="none"` with posters.
- New posters (`poster-trailer.webp`, `poster-grey.webp`) added to `public/proto-media/04/UPLOAD.md`.
- Copy run through `no-ai-slop`: "a contour map that listens" -> "driven by the beat" (inanimate doing a human verb); the demo caption lost its "not the piece" contrast.
- TA try 1 scored 22 (c5 media share 0.47: the slate was text only); the output still moved into the slate as the chain's "Out": 0.55, then 0.56 at a 1:1 split.
- TB: phone grid left a hole beside B1; `grid-auto-flow: dense` fixed it.
- TC's hue fader is a demo of the colour circuit (hue-rotate on a still), labelled as one; the piece itself stays red.

## For Will
- Audio credit: `catching_flies_bootleg.wav`, artist not named anywhere (credits say "artist to confirm").
- Module: exports sit under 5006, slides under 5015 Cargo; the copy says only "2nd year".
- Tools: the strip says TouchDesigner, Blender; the copy adds Ableton (the slide says the filtered audio was made in Ableton).
