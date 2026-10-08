import PROJECTS from '~~/content/projects.json'

// The Sheet's data (Handheld Stories HA–HC, from the overnight run): the facts the Sheet shows, drawn from
// .scratch/v1-launch/overnight/handheld-stories/story.md (Will's GDES6004 process book, 43 pp, Apr 2025, and the
// ISTD ideas deck, both copied from his PC; content/projects.json). Media is dev-only under /proto-media (gitignored;
// public/proto-media/handheld-stories/UPLOAD.md lists it for R2).
// Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

type Proj = { slug: string, title: string, outcome: { media: { src: string } } }
const SRC = (PROJECTS as unknown as { caseStudies: Proj[] }).caseStudies.find(p => p.slug === 'handheld-stories')!

export const B = '/proto-media/handheld-stories/'
export type Pic = { src: string, w: number, h: number, alt: string, srcset?: string }
const p = (f: string, w: number, h: number, alt: string, sm = true): Pic => ({
  src: `${B}${f}.webp`, w, h, alt, srcset: sm ? `${B}${f}-sm.webp ${w / 2}w, ${B}${f}.webp ${w}w` : undefined,
})

export const HS = {
  title: SRC.title,
  hook: 'A digital exhibition for the British Museum\'s netsuke. I couldn\'t code yet, so I animated the website instead.',
  credits: [
    { k: 'Design and animation', v: 'William Vernon (solo)' },
    { k: '3D scans', v: 'The British Museum, on Sketchfab' },
    { k: 'Brief', v: 'ISTD, "Interactions"' },
  ],
  brief: 'ISTD brief: Interactions. The first ideas were space typefaces (Gravity, Eclipse, Pulsar). None of them stuck.',
  spark: 'Then a trip to the Oxford University Museum of Natural History, all dense text panels and static photos.',
  subject: 'Netsuke: carved toggles that held small cases to a kimono sash, Edo period, 1603 to 1868. The British Museum has them on Sketchfab as 3D scans.',
  turn: 'I turned the Coiled Snake in Sketchfab and screen-recorded it. That recording is the object viewer.',
  turnHint: 'Drag to turn it',
  roto: 'Cut out with Roto Brush, frame by frame. When the cursor drifted onto the snake, I masked it by hand.',
  drafts: 'Six passes at the catalogue page.',
  hover: 'Every hover is two layers, idle and hover, and one opacity keyframe.',
  info: 'The info box was the one button built from scratch in After Effects, from an underbox and an overbox.',
  cursor: 'The cursor is keyframed by hand, eased in and out on every move.',
  type: 'Osake for the logotype, Noto Sans for everything else. Noto covers Japanese.',
  colour: 'Black and white only, so the netsuke carry the colour.',
  canvas: '1920 × 1080, treated like a moving poster.',
  exports: 'Seven exports out of After Effects. Then Premiere Pro, with a sound on every click, scroll and hover and ambient music under it.',
  circle: 'The landing page: the netsuke strung on a ring, the way they hung on a cord. It turns.',
  rows: 'The catalogue: two rows sliding opposite ways.',
  film: 'The walkthrough, 1:40.',
  // r2 (HA2, HD, HE)
  spark2: 'Then a trip to the Oxford University Museum of Natural History, where the displays were static and the text panels dense.',
  turn2: 'I turned the Coiled Snake in Sketchfab and screen-recorded it.',
  exports2: 'I exported seven versions from After Effects, in H.264.',
  ideas: ['Gravity', 'Eclipse', 'Pulsar'],
  brief2: 'ISTD brief: Interactions. My first ideas were space typefaces. None of them stuck.',
  still: 'Every page started as a still in Photoshop.',
  onion: 'I turned the snake in Sketchfab and screen-recorded it.',
  stops: [
    { k: 'Museum', line: 'At the Oxford University Museum of Natural History, the displays were static and the text panels dense.' },
    { k: 'Netsuke', line: 'The British Museum has its netsuke on Sketchfab as 3D scans.' },
    { k: 'Draft', line: 'The first catalogue draft sat under the British Museum\'s own header.' },
    { k: 'Roto', line: 'I cut out 150 frames with Roto Brush.' },
    { k: 'Buttons', line: 'Every button is an idle layer, a hover layer and one opacity keyframe.' },
    { k: 'Film', line: 'After seven exports, I added a sound in Premiere Pro to every click, scroll and hover.' },
  ],
  index: 'The database page is a searchable list of the netsuke.',
  rows2: 'On the catalogue page, two rows slide opposite ways.',
  sound: 'Then Premiere Pro: a sound on every click, scroll and hover, ambient music under it.',
}

export const INFO = { year: '2025', module: 'GDES6004 Professional Practice', role: 'Solo', tools: 'Photoshop, After Effects, Premiere Pro' }

// The outcome film, already on R2 (the strip's teaser): 1280 × 720, 30 fps, 99.97 s
export const FILM = { src: SRC.outcome.media.src, poster: `${B}poster-film.webp`, w: 1280, h: 720, dur: 99.97 }

// The film's chapters, one per page of the site (times read off the film)
export const CHAPTERS = [
  { k: 'Landing', t: 0, sb: 'landing' },
  { k: 'Catalogue', t: 9, sb: 'catalogue' },
  { k: 'Object', t: 24, sb: 'object' },
  { k: 'Database', t: 69, sb: 'database' },
] as const

// Eight-second cuts of the film (960 × 540, no sound used), one per page
export const CLIPS = {
  landing: { src: `${B}clip-landing.mp4`, poster: `${B}poster-clip-landing.webp`, alt: 'Landing page: the ring of netsuke turning behind the Handheld Stories logotype' },
  catalogue: { src: `${B}clip-catalogue.mp4`, poster: `${B}poster-clip-catalogue.webp`, alt: 'Catalogue page: two rows of netsuke silhouettes sliding' },
  object: { src: `${B}clip-object.mp4`, poster: `${B}poster-clip-object.webp`, alt: 'Object page: the Coiled Snake up close, the info box open' },
  database: { src: `${B}clip-database.mp4`, poster: `${B}poster-clip-database.webp`, alt: 'Database page: a searchable list, the Meditating Skeleton selected' },
}

// The final storyboards (Photoshop, 1920 × 1080; shown at 1600)
export const SB = {
  landing: p('sb-landing', 1600, 900, 'Storyboard: the landing page'),
  catalogue: p('sb-catalogue', 1600, 900, 'Storyboard: the catalogue page'),
  object: p('sb-object', 1600, 900, 'Storyboard: the object page, the Coiled Snake on a grid'),
  database: p('sb-database', 1600, 900, 'Storyboard: the database page'),
  buttons: p('sb-buttons', 1600, 900, 'The button states, idle and hover, on separate layers'),
}

// The catalogue page, pass by pass (process book pp. 12–17)
export const DRAFTS = [
  { k: 'First draft', note: 'The British Museum\'s own header, a radial layout.', pic: p('dr-1-first', 1228, 691, 'First draft: a radial layout under the British Museum header') },
  { k: 'Grid', note: 'Grids, after character-select screens in games.', pic: p('dr-2-grid', 608, 342, 'Grid layouts in black blocks') },
  { k: 'Wireframe', note: 'Image, text and interaction pinned down.', pic: p('dr-3-wire', 608, 342, 'Wireframe with the Coiled Snake') },
  { k: 'Dark', note: 'Black ground, like a spotlit case.', pic: p('dr-4-dark', 609, 352, 'The catalogue inverted, black ground') },
  { k: 'Developed', note: 'Noto Sans chosen.', pic: p('dr-5-dev', 608, 342, 'Developed catalogue with two rows of netsuke') },
  { k: 'Final', note: 'Osake logotype, white ground.', pic: p('sb-catalogue', 1600, 900, 'The final catalogue page') },
]

// The Oxford museum visit (process book p. 7), small phone photos
export const OXFORD = Array.from({ length: 12 }, (_, i) => ({ src: `${B}oxf-${String(i).padStart(2, '0')}.webp`, w: 199, h: i === 2 || i === 11 ? 149 : 265 }))

export const PICS = {
  row: p('netsuke-row', 609, 239, 'Five netsuke in a row', false),
  sketchfab: p('sketchfab', 1226, 630, 'The British Museum\'s netsuke collection on Sketchfab', false),
  capture: p('sketchfab-snake', 1228, 606, 'The Coiled Snake in the Sketchfab viewer', false),
  circle: { src: `${B}circle.webp`, w: 816, h: 816, alt: 'The ring of netsuke cutouts round the British Museum roundel' },
  rowTop: { src: `${B}row-top.webp`, w: 1800, h: 144, alt: '' },
  rowBot: { src: `${B}row-bot.webp`, w: 1800, h: 120, alt: '' },
  logo: { src: `${B}logotype.webp`, w: 860, h: 380, alt: 'Handheld Stories logotype in Osake, the kanji for netsuke behind it' },
  rotoK: { src: `${B}roto-grid-k.webp`, w: 1530, h: 580, alt: 'All 150 frames of the rotoscoped Coiled Snake, cut out, in a grid' },
  rowTopC: { src: `${B}row-top-c.webp`, w: 1800, h: 131, alt: '' },
  rowBotC: { src: `${B}row-bot-c.webp`, w: 1800, h: 110, alt: '' },
  roto: { src: `${B}roto-grid.webp`, w: 1530, h: 580, alt: 'All 150 frames of the rotoscoped Coiled Snake, in a grid' },
}

// The turntable: 44 frames of the film's object viewer (24–35 s), cropped to the snake, in one 11 × 4 sprite
export const TURN = { src: `${B}turn-sprite.webp`, cols: 11, rows: 4, n: 44, cw: 420, ch: 412 }

// The type sizes (process book p. 39)
export const TYPE = [
  { pt: 86, k: 'Logotype', face: 'Osake' },
  { pt: 35, k: 'Netsuke titles', face: 'Noto Sans' },
  { pt: 20, k: 'Buttons, subheadings', face: 'Noto Sans' },
  { pt: 16, k: 'Body, 14 pt leading', face: 'Noto Sans' },
]

// Names in the database page's list (storyboard)
export const NAMES = ['Coiled Snake', 'Goldfish', 'Sleeping Rat', 'Mermaid and young with jewel and ball', 'Meditating Skeleton', 'Mikoshi Nyudo and a scarecrow']
