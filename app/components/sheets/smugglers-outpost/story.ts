import type { SheetMediaItem } from '~/types/project'

// PROTOTYPE (overnight run, Smuggler's Outpost SA–SC): the story every variant here tells, drawn from
// .scratch/v1-launch/overnight/smugglers-outpost/story.md (process book V4, learning agreement, crit slides).
// Media is dev-only under /proto-media (gitignored; public/proto-media/smugglers-outpost/UPLOAD.md lists it for R2).
// Not a variant (only *.vue files are). Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

const B = '/proto-media/smugglers-outpost/'
const img = (f: string, caption?: string, alt?: string): SheetMediaItem => ({ type: 'image', src: B + f, caption, alt: alt ?? caption ?? '', aspect: 16 / 9 })
const pb = (n: string, caption: string) => img(`pb/p${n}.webp`, caption, `Process book, page ${Number(n)}: ${caption}`)

export const SO = {
  title: 'Smuggler\'s Outpost',
  hook: 'An AI concept, rebuilt as a 3D desert outpost in Blender.',
  intro: 'My major project: take an AI-generated concept and turn it into a believable 3D space, learning Blender from scratch on the way.',
  quote: 'Less about the tool and more about learning the creative process itself.',
  meta: [
    { k: 'Module', v: 'GDES6001 Final Negotiated Practice, 3rd year' },
    { k: 'When', v: '27 Jan to 11 Apr 2025' },
    { k: 'Tools', v: 'Stable Diffusion, ChatGPT, Blender, After Effects, Premiere Pro, Photoshop' },
    { k: 'Influences', v: 'Dune (2021, 2024), Blade Runner 2049' },
  ],
  credits: [
    { k: 'Design, 3D, film', v: 'William Vernon (solo project)' },
    { k: 'Sourced', v: 'Ornithopter model, HDRIs and sound clips from asset libraries' },
    { k: 'References', v: 'Andrei Kurylovich (Aurora Machina), Thomas Dubois (Chateau Noir), Mark Mangini (Dune sound design interview)' },
    { k: 'World', v: 'Dune is Frank Herbert\'s' },
  ],

  concept: img('ai-concept.webp', 'The AI concept', 'The Stable Diffusion concept: an outpost carved into a canyon wall'),
  render: img('render-1.webp', 'The Blender render', 'The finished render: the outpost, an ornithopter on the landing pad, a sandstorm behind'),
  solid: img('viewport-solid.webp', 'Solid', 'Blender viewport, solid shading'),
  wire: img('viewport-wireframe.webp', 'Wireframe', 'Blender viewport, wireframe'),
  viewport: { type: 'video', src: `${B}viewport-build.mp4`, poster: `${B}viewport-solid.webp`, caption: 'The viewport: solid, material, wireframe, render', aspect: 16 / 9 } as SheetMediaItem,
  film: { type: 'video', src: `${B}outpost-film.mp4`, poster: `${B}render-4.webp`, caption: 'The film, 10s, with sound', aspect: 16 / 9 } as SheetMediaItem,

  // Concept generation
  models: ['SD 1.5', 'SD 2.1', 'SDXL'],
  checkpoints: ['BoomerArt', 'DreamshaperXL', 'JuggernautXL', 'leosamsHelloworldXL', 'PsyFiXL', 'CyberrealisticXL'],
  modelsText: 'I compared three base models and six checkpoints on CivitAI. They gave similar results, so the wording of the prompt mattered most.',
  ladder: [
    { add: 'brutalist', note: 'Where the structure prompts started.' },
    { add: 'sandworn brutalist monolithic mega-structure', note: '"Monolithic" pushed the results abstract.' },
  ],
  prompt: 'A hidden desert outpost carved directly into the rock face, Crates of contraband, Concealed tunnels, rust-covered landing pad sits at the edge of the canyon, half-buried, shifting dunes in background',
  promptText: 'After re-watching the Dune films, the first idea was a brutalist archive, the Lore Keeper\'s Vault. It became a smugglers\' outpost.',
  basePage: pb('042', 'Base models'),
  aiPages: [pb('046', 'Checkpoint comparison'), pb('053', 'Structure prompts'), pb('058', 'Generations'), pb('061', 'The shortlist of four')],
  pick: { m: pb('064', 'The selected concept'), text: 'One of four became the base. It was missing a landing pad and deeper dunes.' },

  // The Blender build
  build: [
    { k: 'Terrain', v: 'Displacement and colour ramps.', m: pb('067', 'Terrain') },
    { k: 'Cliffs', v: 'Modelled and sculpted, twice, to learn it.', m: pb('074', 'Cliffs') },
    { k: 'Measure', v: 'Measurements taken over the concept in Photoshop.', m: pb('079', 'Measurements') },
    { k: 'Building', v: 'Arch, windows, roof. The arch failed first; inset plus bevel worked.', m: pb('086', 'The arch') },
    { k: 'Assembly', v: 'The pieces put together into one scene.', m: pb('092', 'Final assembly') },
  ],
  // The atmosphere
  air: [
    { k: 'HDRI', v: 'Good desert skies were hard to find.', m: pb('093', 'HDRI') },
    { k: 'Sandstorm', v: 'Procedural, from a YouTube tutorial.', m: pb('096', 'Sandstorm') },
    { k: 'Ornithopter', v: 'A sourced model, plus a second building with crates.', m: pb('099', 'Scene') },
    { k: 'Dust', v: 'Volumetric dust through the canyon.', m: pb('100', 'Volumetric dust') },
    { k: 'Depth of field', v: 'To hide modelling flaws.', m: pb('102', 'Camera') },
  ],
  // Pins on render-1 (percent of the frame)
  pins: [
    { k: 'Ornithopter', v: 'A sourced model, parked on the landing pad.', x: 27, y: 54 },
    { k: 'Sandstorm', v: 'Procedural, rolling in behind.', x: 14, y: 44 },
    { k: 'Building', v: 'Arch by inset plus bevel, on the second try.', x: 60, y: 54 },
    { k: 'Crates', v: 'Contraband, from the final prompt.', x: 69, y: 58 },
    { k: 'Cliffs', v: 'Sculpted, twice.', x: 74, y: 30 },
    { k: 'Terrain', v: 'Displacement and colour ramps.', x: 40, y: 82 },
  ],

  problems: [
    { p: 'Inpainting a landing pad and dunes into the concept looked disconnected.', f: 'Dropped it for time and built them in 3D.' },
    { p: 'The arch failed on the first try.', f: 'Inset plus bevel worked.' },
    { p: 'Good desert HDRIs were hard to find.', f: '' },
    { p: 'Object scaling, stretched materials and UVs, slow renders, a messy scene.', f: 'Measured over the concept; depth of field hides what was left.' },
    { p: 'An ambitious plan with no clear roadmap.', f: 'Shifted from AI to 3D. I would move to 3D earlier next time.' },
  ],

  outcome: {
    text: 'Four renders, a 10s film rendered over 6 hours with a noise-driven camera shake, and sound: an ornithopter start-up and Tibetan horns, after Mark Mangini\'s Dune interview.',
    renders: [
      img('render-1.webp', 'Wide establishing'),
      img('render-2.webp', 'Low angle, the ornithopter'),
      img('render-3.webp', 'Tilted, landing and take-off'),
      img('render-4.webp', 'Pull back, flying away'),
    ],
    page: img('project-page.webp', 'Project overview page'),
    specs: [
      { k: 'Film', v: '10s, 1080p' },
      { k: 'Render', v: 'over 6 hours' },
      { k: 'Frames', v: '0001 to 0300' },
      { k: 'Renders', v: '4' },
    ],
    after: 'After it: a clearer pull toward 3D, film and dynamic work.',
  },
}

// ---------------------------------------------------------------------------------------------------------------
// Round 2 (SA2, SD, SE): the clean Blender renders (Blender\Renders\Dune*.png, no burned-in poster title), the clean
// AI concept (Images\ConceptGeneration.png) and process-book pages cropped to the image inside the page (pb/cNNN).
// Each still carries its pixel size so the <img> reserves its box (width/height) and decodes off the main thread.
export interface SoPic { src: string, w: number, h: number, alt: string, cap?: string }
const pic = (f: string, w: number, h: number, alt: string, cap?: string): SoPic => ({ src: B + f, w, h, alt, cap })
const crop = (n: string, w: number, h: number, cap: string): SoPic =>
  pic(`pb/c${n}.webp`, w, h, `Process book, page ${Number(n)}: ${cap}`, cap)

export const SO2 = {
  concept: pic('concept-clean.webp', 1216, 832, 'The Stable Diffusion concept: an outpost carved into a canyon wall', 'Stable Diffusion concept'),
  render: pic('clean-1.webp', 1600, 900, 'The Blender render: the outpost, an ornithopter on the landing pad, a sandstorm behind', 'Blender render'),
  solid: pic('clean-solid.webp', 1600, 900, 'The same shot in Blender, solid shading', 'Solid'),
  wire: pic('clean-wire.webp', 1600, 900, 'The same shot in Blender, wireframe', 'Wireframe'),
  renders: [
    pic('clean-1.webp', 1600, 900, 'Wide establishing shot of the outpost', 'Wide establishing'),
    pic('clean-2.webp', 1600, 900, 'Low angle on the ornithopter', 'Low angle, the ornithopter'),
    pic('clean-3.webp', 1600, 900, 'Tilted shot, the ornithopter landing', 'Tilted, landing and take-off'),
    pic('clean-4.webp', 1600, 900, 'Pull back, the ornithopter flying away', 'Pull back, flying away'),
  ],
  pages: {
    structure: crop('053', 1400, 634, 'Structure prompts, p.53'),
    generations: crop('058', 934, 691, 'Generations, p.58'),
    shortlist: crop('061', 1229, 829, 'The shortlist of four, p.61'),
    inpaint: crop('063', 1400, 642, 'Inpainting tries, p.63'),
    pick: crop('064', 1085, 740, 'The selected concept, p.64'),
    terrain: crop('067', 1254, 803, 'Terrain, p.67'),
    cliffs: crop('074', 1055, 800, 'Cliffs, p.74'),
    measure: crop('079', 994, 680, 'Measurements, p.79'),
    arch: crop('086', 1248, 667, 'The arch, p.86'),
    assembly: crop('092', 1228, 820, 'Final assembly, p.92'),
    hdri: crop('093', 1400, 437, 'HDRI options, p.93'),
    sandstorm: crop('096', 1400, 610, 'Sandstorm, p.96'),
    dust: crop('100', 1400, 561, 'Volumetric dust, p.100'),
    camera: crop('102', 1400, 615, 'Camera and depth of field, p.102'),
  },
  // Pins on clean-1 (percent of the frame), each with the problem met there (crit slides, pp.85-86, p.93)
  pins: [
    { k: 'Sky', v: 'An HDRI behind the haze.', p: 'Good desert HDRIs were hard to find.', x: 50, y: 12 },
    { k: 'Sandstorm', v: 'Procedural, from a YouTube tutorial.', x: 14, y: 44 },
    { k: 'Ornithopter', v: 'A sourced model, parked on the landing pad.', x: 27, y: 54 },
    { k: 'Building', v: 'Arch, windows, roof.', p: 'The arch failed first. Inset plus bevel worked.', x: 60, y: 54 },
    { k: 'Crates', v: 'Contraband, from the final prompt.', x: 69, y: 58 },
    { k: 'Cliffs', v: 'Modelled and sculpted, twice, to learn it.', p: 'Object scaling. Measurements taken over the concept in Photoshop.', x: 74, y: 30 },
    { k: 'Terrain', v: 'Displacement and colour ramps.', p: 'Stretched materials and UVs, slow renders. Depth of field hides the flaws left.', x: 40, y: 82 },
  ] as { k: string, v: string, p?: string, x: number, y: number }[],
  inpaint: 'Inpainting a landing pad and dunes into the concept looked disconnected, so I built them in 3D instead.',
  roadmap: 'An ambitious plan with no clear roadmap. I would move to 3D earlier next time.',
}

// SD: the final prompt's phrases, each with a crop of the render (and of the concept where the source says what it
// lacked). Crops are cut from clean-1 and concept-clean (720×540).
export const SO_PLACE = [
  { phrase: 'carved directly into the rock face', note: 'In the concept. Rebuilt with sculpted cliffs and an arch.', c: pic('x-rock-c.webp', 720, 540, 'Crop of the concept: the building cut into the rock'), r: pic('x-rock-r.webp', 720, 540, 'Crop of the render: the building in the cliff') },
  { phrase: 'Crates of contraband', note: 'Modelled into a second building with crates.', r: pic('x-crates-r.webp', 720, 540, 'Crop of the render: yellow crates by the door') },
  { phrase: 'rust-covered landing pad', note: 'Missing from the concept. Built in 3D, with the ornithopter on it.', c: pic('x-pad-c.webp', 720, 540, 'Crop of the concept: open sand where a landing pad would be'), r: pic('x-pad-r.webp', 720, 540, 'Crop of the render: the ornithopter on the landing pad') },
  { phrase: 'shifting dunes in background', note: 'Deeper dunes were missing too. Built in 3D, under a sandstorm.', c: pic('x-dunes-c.webp', 720, 540, 'Crop of the concept: a canyon with no dunes'), r: pic('x-dunes-r.webp', 720, 540, 'Crop of the render: sand haze behind the ridge') },
] as { phrase: string, note: string, c?: SoPic, r: SoPic }[]

// SD: problems crossed off: struck through where the sources say what fixed it, left open where they don't
export const SO_TRIES = [
  { a: 'Inpainting a landing pad and dunes into the concept', b: 'Looked disconnected. Dropped for time and built in 3D.' },
  { a: 'The arch, first try', b: 'Failed. Inset plus bevel worked.' },
  { a: 'Object scaling', b: 'Measurements taken over the concept in Photoshop.' },
  { a: 'Stretched materials and UVs', b: 'Depth of field hides the modelling flaws left.' },
  { a: 'Good desert HDRIs', b: 'Hard to find.', open: true },
  { a: 'Slow renders and a messy scene', b: '', open: true },
  { a: 'An ambitious plan with no clear roadmap', b: 'Shifted from AI to 3D. I would move to 3D earlier next time.' },
] as { a: string, b: string, open?: boolean }[]
