// PROTOTYPE (overnight run, The World Plays Here WA–WC): the facts every variant here shows, drawn from
// .scratch/v1-launch/overnight/the-world-plays-here/story.md (Will's 6003 D&AD process book, pp.3–37).
// The hero is the strip's teaser (the finished 10 s film from R2), so no body repeats it.
// Media is dev-only under /proto-media (gitignored; public/proto-media/the-world-plays-here/UPLOAD.md lists it for R2).
// Every string is PLACEHOLDER copy, not approved by Will. Not a variant (only *.vue files are).
export const _status = 'PLACEHOLDER copy, not approved by Will'

export const B = '/proto-media/the-world-plays-here/'
export type Pic = { src: string, w: number, h: number, alt: string }
const p = (f: string, w: number, h: number, alt: string): Pic => ({ src: B + f, w, h, alt })

export const TW = {
  title: 'The World Plays Here',
  // Inferred from the book (it mentions the 2025 grad show); Will to confirm
  year: '2025',
  brief: 'D&AD brief for Xbox: celebrate gamers wherever and however they play. Copy-led.',
  idea: "Xbox's own campaign was about the hardware. I wanted it about the people who play.",
  concept: 'The Xbox logo as a sphere, wrapped round the Earth. Bold type leads.',
  specs: [
    { k: 'Module', v: 'GDES6003, 3rd year' },
    { k: 'Tools', v: 'Blender, After Effects, Premiere Pro' },
    { k: 'Film', v: '10 s, 1080p, with sound' },
  ],
  credits: [
    { k: 'Concept, 3D, motion, mockups', v: 'William Vernon' },
    { k: 'Brief', v: 'D&AD, for Xbox' },
  ],
}

export const SLOGANS = [
  { t: "Wherever You Play, We're There.", why: 'Too reactive.' },
  { t: 'Play is Power.', why: 'Too abstract.' },
  { t: 'Play Your Way.', why: 'Generic.' },
  { t: 'Every Screen is an Xbox.', why: 'Literal, no feeling.' },
  { t: 'The World Plays Here.', why: 'Global, about community, Xbox as the hub.', pick: true },
]

// The logo split into four, from pp.15–16
export const QUARTERS = [
  'Duplicated the logo four times and deleted three quarters of the faces on each.',
  "Reset every origin to the Earth's centre.",
  'Rotated each quarter on Y, in orthographic view.',
  'Globe and clouds turn on their own. A green line comes in at the end.',
]

// Starts at 6 s (its poster frame: the logo, green, over the XBOX wordmark); the loop then runs from 0
export const LOOP = { src: `${B}logo-wrap.mp4#t=6`, poster: `${B}poster-logo-wrap.webp`, w: 800, h: 800, label: 'Logo wrap, 13 s loop' }

export const BP = {
  inLogo: p('blender/bp2.webp', 1242, 668, 'Blender: the Earth inside the spherical Xbox logo'),
  split: p('blender/bp3.webp', 1250, 668, 'Blender: the logo split into four quarters, two views'),
  wrap: p('blender/bp4.webp', 1247, 658, 'Blender: a quarter swinging round the globe, green edge lit'),
  arc: p('blender/bp5.webp', 1235, 669, 'Blender: one quarter as a thin arc around the Earth'),
  black: p('blender/bp12.webp', 1252, 663, 'Render on black, logo wrapped'),
  grey: p('blender/bp7.webp', 1242, 663, 'Render with the logo come out grey'),
  green: p('blender/bp9.webp', 1287, 663, 'Background pushed bright green'),
  toned: p('blender/bp10.webp', 1260, 663, 'Background toned down to Xbox green'),
}

export const CONCEPT = p('core-concept.webp', 1920, 1080, 'Core concept: THE WORLD PLAYS HERE beside the logo-wrapped Earth, on a starfield')
export const SHELTER_ART = p('mockups/busstopdesign.webp', 1357, 1920, 'Bus shelter poster: the logo above THE WORLD PLAYS HERE')

export const M = {
  subway: [
    p('mockups/xboxsubway1.webp', 1920, 1440, 'Subway billboard, front on'),
    p('mockups/xboxsubway2.webp', 1920, 1440, 'Subway billboard, from the stairs'),
    p('mockups/xboxsubway3.webp', 1920, 1440, 'Subway billboard, at an angle'),
  ],
  shelter: [
    p('mockups/xboxbusstop1.webp', 1920, 1440, 'Bus shelter, both panels'),
    p('mockups/xboxbusstop2.webp', 1920, 1440, 'Bus shelter, at an angle'),
  ],
  youtube: [
    p('mockups/ytmock1.webp', 1920, 1920, 'YouTube ad: the film in the player'),
    p('mockups/laptopmock1.webp', 1920, 1440, 'Laptop showing the YouTube ad, front on'),
    p('mockups/laptopmock2.webp', 1920, 1440, 'Laptop showing the YouTube ad, from the side'),
  ],
  insta: [
    p('mockups/phonemock2.webp', 645, 1384, 'Instagram post on a phone screen'),
    p('mockups/phonemock1.webp', 1920, 1440, 'Phone showing the Instagram post'),
  ],
}

// Where it ran, with the one decision each made (pp.24–37)
export const CHANNELS = [
  { k: 'Subway', n: 3, note: 'The green moved to a line under PLAYS.', pics: M.subway },
  { k: 'Bus shelter', n: 2, note: 'The layout turned 90° for the panel.', pics: M.shelter },
  { k: 'YouTube', n: 4, note: 'The premade mockup looked fake, so I keyed the player out of a real screenshot.', pics: M.youtube },
  { k: 'Instagram', n: 2, note: 'A feed post, on a phone.', pics: M.insta },
]

// Problems met and the fix for each (pp.15–19)
export const SNAGS = [
  { k: "One mesh wouldn't split or turn.", fix: "Rebuilt as four, origins at the Earth's centre.", pic: BP.split },
  { k: 'Rotoscoping failed on the curve.', fix: 'Re-exported from Blender with transparency.', pic: BP.wrap },
  { k: '.mkv has no alpha.', fix: 'PNG sequence, rendered in Premiere.', pic: BP.black },
  { k: 'The logo came out grey.', fix: 'Masked and corrected back to white.', pic: BP.grey },
  { k: 'Green too bright for the brand.', fix: 'Toned down.', pic: BP.toned },
]

// r2 (WC2, WD, WE): the shared head's info, from TW.specs; never retyped
const spec = (k: string) => TW.specs.find(s => s.k === k)?.v
export const INFO = { year: TW.year, module: spec('Module'), tools: spec('Tools') }

// The After Effects / Premiere pass (pp.18–19), one line
export const POLISH = 'Then After Effects and Premiere: the grey logo masked back to white, a dust pass, the Xbox startup sound and an AI voiceover.'
