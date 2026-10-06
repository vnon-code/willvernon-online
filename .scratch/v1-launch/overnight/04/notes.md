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

## Round 2 build (TD, TE, TF; TB kept unchanged as the baseline)
- Teaser poster changed: `/img/posters/experiments-topographyav-test2.webp` -> `/img/posters/experiments-topographyav-test2-69s.webp` in `content/strip.json`. Why: the old poster is pure black (mean luminance 0.1/255), so the card and the Sheet hero painted a black box until the video played (the judges' phone-hero note). New one is the R2 teaser's frame at 1:09 (red contour bands), cut from the public R2 file, 960px, 76 KB. Teaser video unchanged. The R2 teaser itself opens on black frames (0-3 s); only the shell could skip them, so that stays (shell is fixed).
- TD = TB refined: networks merged into the map as captioned squares (C2 audio, A3 colour, B4 visual), the separate key gone; picture tiles 8 -> 6 (dropped the near-black wide ring/river stills and sq2); the proof uses `poster-trailer-bright.webp` (4.8 s, the cut's brightest frame) and starts at 3.4 s (`#t=3.4`: the cut is black-with-thin-lines except ~3.5-5 s and ~7-8 s); rings draw in on scroll (IO, transform/opacity) and are buttons with a readout (Test 2 shows the piece's 1:09 frame; others say not shown). Phone: grey terrain full width (filled a grid hole).
- TE = TC carried forward with all six TC notes (hue 0-30 deg, colour beat beside its network, three lanes, filler line cut, phone clips 2-up, transform-only lens with one box read per enter, bright cut).
- TF new: Waveform. 16 bars, each the brightest frame of one sixteenth of the 1:57, height = that slice's measured loudness (RMS, scaled 28-100%); exploded isometric stack of the network layers; letterbox cut with running timecode; date numerals beside the grey terrain.
- Copy through `no-ai-slop` (detect): "The beat reads cleaner on the copy" -> "The copy makes the beat easier to detect"; fragments "Its own card." / "Last export. Not shown here." joined into sentences.
- New dev media on the upload list: `poster-trailer-bright.webp`, `wave/w00-w15.webp`.
