// PROTOTYPE (overnight run, Remnants RA–RC): the facts every variant here shows, from Will's process book
// (WilliamVernon_ProcessBook_moduleGDES4002.pdf on his PC, Dec 2023), his portfolio PDF (Apr 2024) and content/projects.json.
// See .scratch/v1-launch/overnight/remnants/story.md. Media is dev-only under /proto-media (gitignored;
// public/proto-media/remnants/UPLOAD.md lists it for R2); the film is already on R2. Not a variant (only *.vue files are).
// Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

export const B = '/proto-media/remnants/'
export const FILM = {
  src: 'https://assets.willvernon.online/projects/03_remnants/assets/Remnants%20Outcome_1.mp4',
  poster: '/img/posters/assets-remnants-outcome-1.webp',
  w: 1920, h: 1080, dur: 61,
}

// The nine glyphs in the process book's order (p27). Each traced from one Pitt Rivers object (p25), set on keys Q to O
// in Glyphs (p28), and shown in the film from `t` seconds (read off the film). The old site's captions paired the
// names with the wrong glyphs from the third on; these follow the process book.
const G = [
  ['Haa\'sk', 'Happy mask', 9],
  ['Cra\'sk', 'Crazy mask', 14],
  ['Spheed', 'Spear head', 19.5],
  ['Saa\'sk', 'Sad mask', 30.5],
  ['Griin', 'Grinning mask', 24.5],
  ['T\'per', 'Tribal pattern', 36.5],
  ['Corash', 'Decorated shield', 42.5],
  ['Sree\'sk', 'Scared mask', 48.5],
  ['Ir\'wei', 'Iron weight', 54.5],
] as const
const KEYS = 'QWERTYUIO'
export type Glyph = { n: number, name: string, from: string, key: string, t: number, obj: string, line: string, grid: string, glyph: string, stone: string, stoneSm: string, stoneXs: string }
export const GLYPHS: Glyph[] = G.map(([name, from, t], i) => {
  const n = i + 1
  return {
    n, name, from, t, key: KEYS[i]!,
    obj: `${B}obj-${n}.webp`, line: `${B}line-${n}.webp`, grid: `${B}grid-${n}.webp`, glyph: `${B}glyph-${n}.webp`,
    stone: `${B}stone-${n}.webp`, stoneSm: `${B}stone-${n}-sm.webp`, stoneXs: `${B}stone-${n}-xs.webp`,
  }
})
export const byKey = (k: string) => GLYPHS.find(g => g.key === k.toUpperCase())

// The six stages of the brief (p18), shortened
export const STAGES = ['Object', 'Line', 'Grid', 'Glyph', 'Stone'] as const

// Stable Diffusion seeds and prompts (p34). The last one made the set (inferred from the page layout).
export const SEEDS = [
  { seed: '1169263809', prompt: 'remnants of a monolithic structure from a long lost civilization', img: `${B}seed-0.webp` },
  { seed: '469921674', prompt: 'floating remains of a futuristic sci-fi civilization', img: `${B}seed-1.webp` },
  { seed: '3966113268', prompt: 'monolithic structure of a tribal cult', img: `${B}seed-2.webp` },
  { seed: '819435130', prompt: 'wooden ruins of unknown origin', img: `${B}seed-3.webp` },
  { seed: '1471789430', prompt: 'neolithic structure made of crumbling stone in barren desert', img: `${B}seed-4.webp` },
  { seed: '281915430', prompt: 'lonely concrete structure in nature', img: `${B}seed-5.webp` },
  { seed: '665821143', prompt: 'remnants of a monolithic structure from a long lost civilization, realistic textures and lighting', img: `${B}stone-1-sm.webp`, pick: true },
]
// ControlNet's first tests (p33): twelve renders of Haa'sk and Cra'sk
export const TESTS = Array.from({ length: 12 }, (_, i) => `${B}test-${String(i).padStart(2, '0')}.webp`)
// The title sequence decrypting (film frames at 0.5, 2.5, 4.5, 6.5 s)
export const DECRYPT = [0, 1, 2, 3].map(i => `${B}decrypt-${i}-sm.webp`)
// Haa'sk cut into pieces in Photoshop, and the plate filled behind them (p36; the old site's names for the pieces)
export const CUT = {
  plate: '/img/remnants/breakdown6.jpeg',
  pieces: [
    { src: '/img/remnants/breakdown1.png', k: 'Left ring', w: 124, h: 125 },
    { src: '/img/remnants/breakdown2.png', k: 'Right ring', w: 127, h: 125 },
    { src: '/img/remnants/breakdown3.png', k: 'Stem and hook', w: 235, h: 533 },
    { src: '/img/remnants/breakdown4.png', k: 'Right wing', w: 228, h: 276 },
    { src: '/img/remnants/breakdown5.png', k: 'Top bar', w: 59, h: 229 },
  ],
}

export const RM = {
  title: 'Remnants',
  hook: 'Imagine writing doesn\'t exist yet. Invent it.',
  museum: 'Twelve objects from the Pitt Rivers Museum. Nine became glyphs.',
  lines: 'Each object traced in tone, cut to its lines, then run through a grid until only the lines it needs are left.',
  keys: 'Set in Glyphs, one per key from Q to O. Type.',
  cn: 'Each glyph went into Stable Diffusion as a ControlNet guide, so the stone follows the glyph\'s shape.',
  snag: 'In the first tests the prompt built the background too. Each material needed a new prompt.',
  seed: 'One seed and prompt kept for all nine, so they read as one set.',
  cut: 'Cut into pieces with the lasso. Content-Aware Fill rebuilt the sky behind, so nothing blank shows when they move.',
  ae: 'In After Effects the pieces float on the Y axis, the rings turn, fog keyed over the top.',
  decrypt: 'In the title, eight symbols swap until each lands on its letter of "remnants".',
  slow: 'It moved too fast. The glyph section runs at 60%, slowed with optical flow.',
  music: 'Music: Ambi Drift by Bliss Signal, Mumdance and Wife.',
  credits: [
    { k: 'Glyphs, images, film', v: 'William Vernon' },
    { k: 'Objects', v: 'Pitt Rivers Museum' },
    { k: 'Music', v: 'Ambi Drift, Bliss Signal, Mumdance, Wife' },
  ],
}

export const INFO = { year: '2023', module: 'GDES4002, Year 1', tools: 'Photoshop, Illustrator, Glyphs, Stable Diffusion (ControlNet), After Effects, Premiere Pro' }

// r2 (RD–RF): glyph and line masks with the stray 1/255 alpha cleared (the faint squares judges saw), and where the
// ControlNet guide sits in the seed renders (p34). Measured by overlaying glyph-1 on seed-0…5: all six renders put
// Haa'sk's 322px-of-360px glyph box at 66% of the frame's height, centred. The film frames don't match: the pieces
// float apart in After Effects, so the guide is only laid over the renders.
export const mask = (g: Glyph) => g.glyph.replace('.webp', '-c.webp')
export const lineMask = (g: Glyph) => g.line.replace('.webp', '-c.webp')
export const GUIDE = { h: 0.66 * 360 / 322 } // the mask square's height as a share of the 16:9 render
export const RENDERS = SEEDS.filter(s => !s.pick)
export const KEPT = SEEDS.find(s => s.pick)!
export const tc = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
// Film order (Griin comes before Saa'sk in the film)
export const FILM_ORDER = GLYPHS.slice().sort((a, b) => a.t - b.t)

export const RM2 = {
  _status: 'PLACEHOLDER copy, not approved by Will',
  guide: 'Each glyph went into Stable Diffusion as a ControlNet guide. Change the prompt and the shape stays.',
  kept: 'Seed 665821143 made all nine, so they read as one set.',
  match: 'Pick a glyph, then the object it was drawn from.',
}
