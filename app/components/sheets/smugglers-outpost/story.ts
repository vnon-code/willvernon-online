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
