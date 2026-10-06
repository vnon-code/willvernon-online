# Amplified Spaces: the story from the source material

Read 2026-10-06 from Will's PC (over Tailscale SSH, read-only). Feeds the Project Sheet rework (round 2+).
Sheet copy drawn from this is PLACEHOLDER until Will approves it.

## Sources
- `D:\UNIVERSITY\Graphic Design\2nd Year\5006\Submission\William_Vernon_Process_Book_5006.pdf` (80pp, main source;
  also in `C:\Users\wvern\Documents\website\projects\01_amplified-spaces\documents\`)
- `...\5006\Submission\William Vernon Learning-Agreement_24.docx.pdf` (proposal)
- Not yet read: `D:\UNIVERSITY\Graphic Design\2nd Year\5006\5006presentation.indd`, the Obsidian vaults

## The project
- GDES5006 Integrated Projects 2 (Level 5, 2nd year), due 2 May 2024. Working title "Soundscapes In Motion: A Visual
  Exploration of Music": how visuals carry a track's mood and atmosphere, with a real artist as the client.
- Route in: mindmaps (maps, music, participation) → audiovisual design. Context: klsr.av, Portable Reef, Odyssey
  (an AV installation shown in a virtual space), Shreyas Jayaraman's virtual gallery.
- Experiments: Blender audio-reactive particles (split into low / mid / high bands); TouchDesigner particles GPU,
  topographic generative, mycelium; a home-made kick-detection tool because the built-in beat detection wasn't
  accurate enough.
- The idea: TouchDesigner makes the visual, Blender builds the room it's shown in.
- Client: Tom Vernon, house producer (Channel Islands, now Swansea). Will's brother: ask Will before saying so.
  They picked the tracks together. A fourth, Healing Process, was made and dropped.

## Three tracks, three rooms
| Track | The sound | The visual (TouchDesigner) | The room (Blender) |
|---|---|---|---|
| Onjuku | ambient, no kicks | the album art displaced, rotation driven by time (not audio); square 1200×1200 | the visual wrapped round a sphere over a torus: "resembles a planet" |
| Fading Away | a steady kick | an audio spectrum through a gradient map sampled from the album art, noise over it | a wide "long screen" showing the full spectrum, yellow light |
| B17 (Overseas Edit) | lo-fi | volume-driven circles in a CRT container: RGB split, hexagon pixels, noise, lens distort, bloom | a narrower room, blue light, brighter screen |

All three rooms: dark, lit only by the emissive screen and one area light; concrete from noise layers + bump +
Poly Haven textures; silhouetted 3D-scanned people, benches, speakers.

## Problems met
The tutorial track was too energetic; the free TouchDesigner licence caps output at 1280×1280; the topographic
setup wasn't fully understood; the CRT build was a struggle; mirror and text overlays were cut as too generic.

## Outcome
Per track: a splash and 4 renders. B17 has a final-crit video (`B17AV2`). No venue or grade stated.

## Media not yet on the site
Under `D:\UNIVERSITY\Graphic Design\2nd Year\5006\`: `Context\` gifs (Portable Reef, Odyssey), generative art
tests, `Touch Designer\Exports\` experiment videos, `Blender\Exports\` particle and material tests,
`Final Renders\OnjukuInsta.png`; process book pages with node graphs and Blender screenshots (pp.12–33, 37–64).
On the PC's website folder: each track's Splash + renders 1–4 (the site uses only two per track).

## Prototype media (dev only: `public/proto-media/amplified-spaces/`, gitignored; R2 upload needs Will's OK)
- Renders: `{b17,fadingaway,onjuku}splash.webp`, `{b17}{2,3,4}`, `{fadingaway,onjuku}{1..4}.webp` (1920px)
- Process book images `pb/pNN-k.webp` (page NN): 13, 15 Blender particle experiments (low/mid/high) · 16 first
  TouchDesigner network · 23 Particles GPU renders · 24 generative art tests · 27 topographic colour variants ·
  28 topographic network · 29–30 topographic renders (red) · 31 improved kick-detection network · 33 mycelium ·
  36 Tom Vernon / album art · 42 Onjuku visual (displaced album art) · 44 Fading Away gradient + spectrum strips ·
  45 Fading Away visual frames · 47 B17 network · 49 B17 CRT build · 50 B17 frames · 53 taking it into Blender ·
  54 concrete material · 55 scene layout · 62 Onjuku scene setup
- The book's own spine: Mindmaps → Discover → Develop → Define → Deliver → Outcomes (a double diamond).
