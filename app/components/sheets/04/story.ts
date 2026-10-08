// The Sheet's data (04 Topography AV Test TA–TC, from the overnight run): the facts the Sheet shows, drawn from
// .scratch/v1-launch/overnight/04/story.md (Will's 3-page Cargo slide PDF, the file dates, the strip card).
// The hero is the strip's teaser (R2 Test 2, the finished 1:57 piece), so the bodies don't repeat it.
// Media is dev-only under /proto-media (gitignored; public/proto-media/04/UPLOAD.md lists it for R2).
// Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

export const B = '/proto-media/04/'
export type Pic = { src: string, w: number, h: number, alt: string }
const p = (f: string, w: number, h: number, alt: string): Pic => ({ src: B + f, w, h, alt })

export const TOPO = {
  title: 'Topography AV Test',
  year: '2024',
  line: 'A contour map driven by the beat. The terrain and its colour move with the track, live in TouchDesigner.',
  specs: [
    { k: 'Made', v: '10–12 Mar 2024, 2nd year' },
    { k: 'Tools', v: 'TouchDesigner, Ableton, Blender' },
    { k: 'Piece', v: '1:57, square, 60 fps, with sound' },
  ],
  audio: 'Two files feed the network: the track, and a copy with the mids boosted and the lows and highs cut in Ableton. The second one makes the beat easier to catch.',
  chops: 'Count and lag CHOPs hold the outputs back in sequence. Each output drives a different part of the visual, mostly through feedback loops.',
  colour: 'One colour feeds a second with a hue offset, then a ramp, then a lookup for the whole project. Volume drives the first colour, so the hue moves as the music gets louder or quieter.',
  visual: 'The whole network, in three views.',
  height: 'Grid heights follow the low-frequency sound level.',
  tests: 'Three tests in three days.',
  demo: 'Drag the volume to shift the hue. A demo of the colour circuit.',
  credits: [
    { k: 'Network, visuals', v: 'William Vernon' },
    { k: 'Audio', v: 'catching_flies_bootleg.wav (artist to confirm)' },
  ],
}

// The chain, from the slide captions (p1, p2)
export const NODES = {
  audio: p('pb/p1-img1.webp', 1406, 731, 'TouchDesigner network: the audio set up, two audio inputs into beat detection'),
  colour: p('pb/p1-img2.webp', 1071, 455, 'TouchDesigner network: the colour circuit, constant to hue offset to ramp to lookup'),
  full: [
    p('pb/p2-img1.webp', 1455, 601, 'The full network, view 1'),
    p('pb/p2-img2.webp', 1479, 583, 'The full network, view 2'),
    p('pb/p2-img3.webp', 1419, 649, 'The full network, view 3'),
  ],
}

export const SQ: Pic[] = [1, 2, 3, 6, 8].map(n => p(`still-sq${n}.webp`, 1080, 1080, `Screenshot ${n}: red contour terrain on black`))
export const WIDE = {
  lines: p('still-wide-lines.webp', 1920, 1080, 'Red contour ribbons filling the frame, 11 Mar 2024'),
  ring: p('still-wide-ring.webp', 1920, 1080, 'A single red contour ring on black, 11 Mar 2024'),
  river: p('still-wide-river.webp', 1920, 1080, 'One thin red line crossing the black, 11 Mar 2024'),
}

export const TRAILER = { src: `${B}trailer-1080.mp4`, poster: `${B}poster-trailer.webp`, w: 1920, h: 1080, label: 'Cinematic cut, 22 s' }
export const GREY = { src: `${B}terrain-grey-720.mp4`, poster: `${B}poster-grey.webp`, w: 720, h: 720, label: 'Grey terrain, 9 s' }

// The versions, from the export file dates
export const VERSIONS = [
  { d: '10', m: 'Mar', k: 'Test 1' },
  { d: '11', m: 'Mar', k: 'Test 2', v: 'The piece above.' },
  { d: '12', m: 'Mar', k: 'V3' },
  { d: '13', m: 'Mar', k: 'Static Gens', v: 'A stills spin-off.' },
  { d: '25', m: 'Apr', k: 'Final crit', v: 'Last export.' },
]

// Round 2 (TD–TF): additions only, so TA–TC read exactly as scored. PLACEHOLDER copy, not approved by Will.
// The cut's brightest stretch is ~3.5–5 s (the rest is thin lines on black): its poster is that frame and it starts there.
export const TRAILER_BRIGHT = { ...TRAILER, src: `${B}trailer-1080.mp4#t=3.4`, poster: `${B}poster-trailer-bright.webp` }
export const CAP = {
  audio: 'Two inputs: the track, and a copy with the lows and highs cut in Ableton. The copy makes the beat easier to detect.',
  colour: 'Volume drives the first colour, so the hue shifts as the track gets louder or quieter.',
  visual: 'Count and lag CHOPs hold the outputs back in sequence. Each drives a part of the visual through feedback.',
}
