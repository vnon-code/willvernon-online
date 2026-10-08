import AI from '~~/content/ai.json'

// The Sheet's data (Dredge DA–DC, from the overnight run): the facts the Sheet shows, drawn from
// .scratch/v1-launch/overnight/dredge/story.md (file dates on Will's PC, content/ai.json, the strip card). No write-up
// exists, so the Sheet opens to the outcome. Media is dev-only under /proto-media (gitignored;
// public/proto-media/dredge/UPLOAD.md lists it for R2).
// Every string is PLACEHOLDER copy, not approved by Will. Tools: the files show Midjourney (stills and video), Nano
// Banana and Premiere Pro; the old site also names Luma Dream Machine. Will to confirm (notes.md).
export const _status = 'PLACEHOLDER copy, not approved by Will'

const SRC = (AI as { projects: { key: string, title: string, prompt: string, ar: string }[] }).projects.find(p => p.key === 'dredge')!

export const B = '/proto-media/dredge/'
export type Pic = { src: string, w: number, h: number, alt: string, srcset: string }
// Each still has a half-width `-sm` copy; the browser picks by the slot's size (`sizes` in each variant)
const p = (f: string, w: number, h: number, alt: string): Pic => ({
  src: `${B}${f}.webp`, w, h, alt, srcset: `${B}${f}-sm.webp ${w / 2}w, ${B}${f}.webp ${w}w`,
})
const tall = (f: string, alt: string) => p(f, 768, 1344, alt)
const tall2 = (f: string, alt: string) => p(f, 816, 1456, alt)

export const DR = {
  title: SRC.title,
  hook: 'Monolith Survival, moved to deep-sea fishing. A campaign for workwear that doesn\'t exist.',
  credits: [
    { k: 'Concept, images, film', v: 'William Vernon (solo)' },
    { k: 'Tools', v: 'Midjourney, Nano Banana, Premiere Pro' },
  ],
  scrub: 'Point at the strip to scrub the film.',
  kit: 'Black waxed shell, red gloves, red zips. Nano Banana references held the figure and kit from shot to shot.',
  ratio: 'The prompt asks for 2.35:1. The film and every file are 9:16.',
  world: 'A lone figure on a concrete slab, dark sea, fog. The whale is the one white shape.',
  whale: 'The whale is the one white shape.',
  day: 'One day, 11 Sep 2025. Recut for the site on 23 May 2026.',
  clips: 'Midjourney video, five seconds a clip. Cut to 44.7 s in Premiere Pro.',
  prompt: SRC.prompt,
  ar: SRC.ar,
}

export const INFO = { year: '2025', module: 'Personal experiment', role: 'Solo', tools: 'Midjourney V6, Nano Banana, Premiere Pro' }

// The outcome (portrait 1080 × 1872, 44.7 s). It opens on a dark sea whirl, so the poster is the figure on the slab at 9s.
export const FILM = { src: `${B}outcome-film.mp4`, poster: `${B}poster-film.webp`, w: 1080, h: 1872, dur: 44.7, label: 'Film, 44.7 s' }

// Fifteen frames of the film, evenly spaced (AVFoundation, 2026-10-06)
export const STRIP = Array.from({ length: 15 }, (_, i) => {
  const t = 0.5 + i * 44 / 15
  return { src: `${B}strip-${String(i).padStart(2, '0')}.webp`, t, tc: `0:${String(Math.floor(t)).padStart(2, '0')}` }
})

// Four of the five-second Midjourney clips (file names), no audio
export const CLIPS = {
  orbit: { k: 'Orbit', src: `${B}clip-orbit-slab.mp4`, poster: `${B}poster-clip-orbit-slab.webp`, alt: 'Camera orbit round the figure on the slab' },
  whale: { k: 'Whale', src: `${B}clip-whale.mp4`, poster: `${B}poster-clip-whale.webp`, alt: 'The white whale surfacing, from above' },
  whirl: { k: 'Whirl', src: `${B}clip-whirl.mp4`, poster: `${B}poster-clip-whirl.webp`, alt: 'A whirl in dark water' },
  fabric: { k: 'Rain', src: `${B}clip-fabric.mp4`, poster: `${B}poster-clip-fabric.webp`, alt: 'Rain on the black shell jacket and hood' },
}

export const WORLD = {
  concrete: tall('mj-concrete-sky', 'A concrete ledge over the sea, one figure on it, white sky'),
  fog: tall('mj-fog-slab', 'A figure on a concrete block in fog'),
  blue: tall2('mj-blue-sky-slab', 'The ledge again under a blue sky'),
  block: tall('mj-figure-on-block', 'The figure in full kit on a white block in the sea'),
  aerial: tall2('mj-aerial-slab', 'The slab from above, waves breaking on it'),
  wave: tall2('mj-wave-slab', 'Swell against the white slab'),
  whaleWave: tall2('mj-whale-wave', 'The white whale in breaking water'),
  whaleTop: tall('mj-whale-top', 'The white whale from above, dark water'),
}

export const KIT = {
  hood: tall('mj-hood-closeup', 'The hood, close, sea behind'),
  face: tall('mj-face-fog', 'A face in the hood, fog'),
  portrait: tall2('mj-portrait-red', 'Portrait in the shell, red tabs, black ground'),
  figure: tall('mj-gloves-dark', 'The figure in hood, bib straps and red gloves'),
  gloves: tall2('mj-gloves-red', 'A red glove against the black shell'),
  strap: tall('mj-fabric-strap', 'A strap buckle on the wet shell'),
  mask: tall('mj-fabric-detail', 'Collar, buckles and red tabs, close'),
  zip: tall('mj-red-zip-pocket', 'A chest pocket with red zips'),
}

// The day, from the file dates (story.md): stills from about 15:10, clips 15:52 to 18:00, edit autosaves 16:19 to 21:01
export const DAY = [
  { k: 'Stills', from: '15:10', to: '15:52', a: 15 + 10 / 60, b: 15 + 52 / 60, v: 'Midjourney and Nano Banana' },
  { k: 'Clips', from: '15:52', to: '18:00', a: 15 + 52 / 60, b: 18, v: 'Midjourney video' },
  { k: 'Edit', from: '16:19', to: '21:01', a: 16 + 19 / 60, b: 21 + 1 / 60, v: 'Premiere Pro' },
]
