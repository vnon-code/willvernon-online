# 04 Topography AV Test: the story from the source material

Read 2026-10-06 from Will's PC (Tailscale SSH, read-only). Sheet copy drawn from this is PLACEHOLDER until Will approves it.
Strip card: `id` 04, from `experiments` ("Topography AV Test"), chip/discipline "Experiment", teaser `https://assets.willvernon.online/experiments/TopographyAV_Test2.mp4`, poster `/img/posters/experiments-topographyav-test2.webp`. Site text: "A real-time 3D topographic map deformed dynamically by sub-bass wave vectors. Slices spatial peak limits and grid heights based on low-frequency sound pressure levels." Software: TouchDesigner, Blender. Aspect 1/1. (Sibling 05 "Topography Static Gens" is a separate card.)

## Sources
- `D:\UNIVERSITY\Graphic Design\2nd Year\5015\Cargo\CargoProjectDocs\TopgraphyAVSlides\Topography Project.pdf` (3pp, the only write-up: Will's own captions) + `Topography Project.indd`, `TopographyProject*.jpg`
- `C:\Users\wvern\Documents\website\experiments\01_topography\` (README.md staged by the site build; `renders\` screenshots dated 11 Mar 2024, `cinematic_*.mp4`, `touchdesigner_nodes_capture.mp4`; `touchdesigner\TopographyTestAV1(.7).toe`; `blender\Weird Shit.blend`; `audio\catching_flies_bootleg.wav`)
- `D:\UNIVERSITY\Graphic Design\2nd Year\5006\Touch Designer\Exports\` (TopographyAV_Test1.mov 10 Mar 2024, Test2.mov 11 Mar, TestAV3 / V3H264 / V3HEVC 12 Mar; `Final Crit\TouchDeisgnerTopography2.mp4` 25 Apr 2024, 417 MB, not pulled)
- `...\5015\Cargo\TopographySS\Topography1-8.png`, `TopographyAV_Thumb(Border).png`
- Not found: a prose brief or process book for this piece. `renders\topographic_reference_map.png` is a watermarked stock image (pngtree): do not use.

## Brief / module / date
Made in GDES5006 Integrated Projects 2 (2nd year; the TouchDesigner exports sit under `5006\`) as an audiovisual experiment alongside Amplified Spaces. The slides were laid out for the Cargo portfolio (folder `5015\Cargo`; module not confirmed). Tests dated 10-12 March 2024; final-crit export 25 April 2024.

## The idea
A topographic map that listens: audio drives the terrain's shape and colour in real time in TouchDesigner. The staged README frames it as translating spatial landscapes through generative soundscapes (soundscape waveforms, real-time noise displacement, scattered 3D worlds in Blender, cinematic camera sweeps). Audio file in the folder: `catching_flies_bootleg.wav` (artist/credit not stated: ask Will).

## Process beats (Will's PDF captions, paraphrased)
1. Audio set up: the network "listens" to the input and detects the beat live. Two audio files feed it, the raw track and a second with mids boosted and lows/highs filtered out in Ableton, to sharpen beat detection. Count and lag CHOPs stall outputs in sequences; each output drives a different part of the visual CHOPs, mainly through feedback loops.
2. Colour reactivity: a small circuit sets the palette. A first constant colour feeds a second ("hsvadj2") with a hue offset, into a layout, then a colour ramp, then a lookup CHOP for the whole project. Linking the audio's volume to the first colour shifts the ramp's hue as the music gets louder or quieter.
3. Visual set up (full): three network views of the whole graph.
4. Screenshots: red contour-line ribbons on black.
5. Versions: AV Test 1 (10 Mar), Test 2 (11 Mar, the site piece), V3 (12 Mar); then a Blender "scatter" file and cinematic sweeps, and the Static Gens spin-off (13 Mar).

## Problems met
Not written up in any source I could read. Don't invent. (Only inferable: beat detection needed a second filtered audio file.)

## Outcome
1:57 square (1280x1280, 60fps, with sound) TouchDesigner piece: red-on-black contour terrain driven by the beat. Also a 22s 4K "cinematic trailer" and a grey contour-terrain clip. Shown as a Cargo thumbnail and on the portfolio as an experiment. No venue or grade stated.

## Collaborators
None credited in the sources. Audio credit unknown (`catching_flies_bootleg`).

## Teaser
Keep the strip's current teaser (R2 Test 2): it is the finished piece, square, already on the card.

## Media manifest (`public/proto-media/04/`, see UPLOAD.md)
- Videos: `outcome-av-720.mp4` (1:57, sound), `trailer-1080.mp4` (22s), `terrain-grey-720.mp4` (9s, silent)
- Stills: `still-sq1,2,3,6,8.webp` (square), `still-wide-lines/ring/river.webp` (16:9)
- Process: `pb/p1,p2,p3.webp` (slide pages), `pb/p1-img1,p1-img2,p2-img1,p2-img2,p2-img3.webp` (node networks)
18 files, ~11 MB. Not pulled: Final Crit video, Test1/V3 movies (0.25-1.9 GB), Blender and .toe files, Cargo gifs.
