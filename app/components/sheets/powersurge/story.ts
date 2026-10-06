import PROJECTS from '~~/content/projects.json'

// PROTOTYPE (overnight run, Powersurge PwA–PwC): the facts every variant here shows, drawn from
// .scratch/v1-launch/overnight/powersurge/story.md (Will's GDES6002 process book, Dec 2024, the final film and the
// TouchDesigner stills, copied from his PC; content/projects.json). Media is dev-only under /proto-media (gitignored;
// public/proto-media/powersurge/UPLOAD.md lists it for R2). Not a variant (only *.vue files are).
// Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

type Proj = { slug: string, title: string, software: string[] }
const SRC = (PROJECTS as unknown as { caseStudies: Proj[] }).caseStudies.find(p => p.slug === 'powersurge')!

export const B = '/proto-media/powersurge/'
export type Pic = { src: string, w: number, h: number, alt: string }
const pic = (f: string, w: number, h: number, alt: string): Pic => ({ src: `${B}${f}.webp`, w, h, alt })
const film = (f: string, alt: string) => pic(f, 1920, 1080, alt)
const td = (f: string, alt: string) => pic(f, 1280, 720, alt)
const pg = (n: string, alt: string) => pic(`pb-p${n}`, 1920, 1080, `Process book p.${Number(n)}: ${alt}`)

// Frames from the final film (5:35), with the second they were taken at and the year on screen
export const FILM = {
  title: { ...film('film-2s', 'Film frame: the title card, Power Surge'), t: 2 },
  y1997: { ...film('film-60s', 'Film frame, 1997: a small blue sphere, the FLOPs timeline near its left end'), t: 60, year: 1997 },
  y2018: { ...film('film-285s', 'Film frame, 2018: the sphere bursts into purple strands'), t: 285, year: 2018 },
  y2020: { ...film('film-300s', 'Film frame, 2020: red and white feedback chaos'), t: 300, year: 2020 },
}
export const FILM_SECONDS = 335 // 5:35

// TouchDesigner render stills
export const TD = {
  purple: td('ss1', 'TouchDesigner still: a purple burst of particles'),
  red: td('ss2', 'TouchDesigner still: red and white strands'),
  redWide: pic('ss2-transformed', 1920, 1080, 'TouchDesigner still: red and white strands, wide'),
  blue: td('ss3', 'TouchDesigner still: a blue cloud of particles'),
  sphere: td('ss4', 'TouchDesigner still: the quiet blue sphere'),
  network: pic('td-network', 1900, 751, 'The whole TouchDesigner network, the sphere in its viewer'),
  flops: pic('flops-timeline', 1285, 628, 'Our World in Data chart: computational capacity of the fastest supercomputers'),
}

export const PB = {
  context: pg('03', 'context, data portraits by Mike Luan'),
  moore: pg('05', 'research, Moore\'s Law'),
  data: pg('06', 'data, FLOPs'),
  ideas: pg('07', 'first ideas, the timeline spreadsheet and particle references'),
  blender: pg('08', 'Blender, the first attempt'),
  base: pg('09', 'TouchDesigner, the base network'),
  base2: pg('10', 'TouchDesigner, the base network continued'),
  experiments: pg('11', 'TouchDesigner, six experiments in form and colour'),
  mods: pg('12', 'TouchDesigner, modifications'),
  whole: pg('13', 'TouchDesigner, the entire project'),
  v1: pg('14', 'version 1'),
  v2: pg('15', 'version 2'),
  v5: pg('16', 'version 5, final'),
  ae: pg('18', 'After Effects, the FLOPs timeline'),
  premiere: pg('19', 'Premiere Pro, the assembly'),
  keyframes: pg('20', 'final outcome, keyframes'),
  tool: pg('21', 'TouchDesigner, the experiment tool'),
}

// The 20 s climax (film 4:22–4:42), 640×360, plays only in view
export const CLIMAX = { src: `${B}climax-360.mp4`, poster: FILM.y2018.src, w: 640, h: 360, from: 262, to: 282, alt: 'Film clip, 4:22 to 4:42, about 2016 to 2018: the blue sphere swells and breaks into purple strands' }

// The versions, values as the book gives them (p.14–16). V5's values aren't listed.
export const VERSIONS = [
  { id: 'V1', page: PB.v1, size: [8, 1], speed: [0.02, 0.08], life: 1, particles: 1000 },
  { id: 'V2', page: PB.v2, size: [10, 2], speed: [0.02, 0.2], life: 20, particles: null },
  { id: 'V5', page: PB.v5, size: null, speed: null, life: null, particles: null },
] as const

// What the FLOPs curve drives (p.12–13)
export const DRIVES = [
  { k: 'Size', op: 'Math, multiply', does: 'Grows with the data.' },
  { k: 'Chaos', op: 'Post Add', does: 'Renamed parameter. Inverts the shape.' },
  { k: 'Colour', op: 'Level', does: 'Blue fixed. Red and green rise: a red tint, then white, so the bloom shows.' },
  { k: 'Time', op: 'Animation CHOP', does: 'Locks the data to the timeline, so it lands on the same frame every run.' },
]

// Moore's Law as a model (not the film's data): doubling every two years, 1997–2021
export const YEARS = { from: 1997, to: 2021 }
export const moore = (year: number) => 2 ** ((year - YEARS.from) / 2)

// PLACEHOLDER copy (not approved by Will), checked with no-ai-slop
export const PS = {
  title: SRC.title,
  hook: 'A data portrait of computing power. Ten seconds of film per year, 1997 to 2021.',
  brief: 'Brief: visual communication for a future public.',
  idea: 'Mike Luan\'s .senses let live data drive generative art. We pointed that at Moore\'s Law.',
  data: 'Our World in Data: the fastest supercomputers, in FLOPs, over 30 years. A spreadsheet turned it into a timeline.',
  blender: 'First try, Blender: FLOPs set particle count and force. The CPU couldn\'t keep up. The file no longer opens.',
  flat: 'Plotted on the timeline, the data is almost flat for 75% of the film, then shoots up.',
  td: 'Rebuilt in TouchDesigner from supermarket sallad\'s "Exploding Star": a cylinder emitter, a feedback loop, bloom.',
  sphere: 'Normalising the points pulls the particles into a sphere.',
  bloom: 'Three experiments: form, colour, flow. I fell in love with the bloom.',
  noise: 'Noise makes every render different. The data stays the same.',
  lock: 'An Animation CHOP locks the data to the timeline.',
  limits: 'Each parameter got its own limits to keep it balanced.',
  music: '"The End" by C418. Ambient, builds over five minutes.',
  ae: 'After Effects: the FLOPs timeline, a white circle keyed along it by the same data.',
  premiere: 'Premiere: labels either side, Suyash\'s year counter top left, his title typeface on every word.',
  tool: 'The network became a slider tool, a form tab and a colour tab, so anyone can play with it.',
  out: 'A blue sphere that barely moves for twenty years, then bursts.',
  model: 'Moore\'s Law, doubling every two years, drawn as a model. The film runs on the real data.',
  credits: [
    { k: 'Made by', v: 'Suyash Sunar & Will Vernon' },
    { k: 'Year animation, title typeface', v: 'Suyash Sunar' },
    { k: 'Music', v: '"The End" by C418' },
    { k: 'Tutorial', v: '"Exploding Star" by supermarket sallad' },
    { k: 'Inspiration', v: 'Mike Luan (.senses), Iago Mota' },
    { k: 'Data', v: 'Our World in Data' },
  ],
}

export const INFO = { year: '2024', module: 'GDES6002 Collaboration', tools: SRC.software.join(', '), with: 'Suyash Sunar' }

// An SVG path for the Moore model on a w×h box, linear or log y
export function moorePath(w: number, h: number, log: boolean, steps = 48) {
  const max = moore(YEARS.to)
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const yr = YEARS.from + (YEARS.to - YEARS.from) * (i / steps)
    const v = log ? Math.log2(moore(yr)) / Math.log2(max) : moore(yr) / max
    pts.push(`${(w * i / steps).toFixed(1)},${(h - v * h).toFixed(1)}`)
  }
  return `M${pts.join(' L')}`
}
export function moorePoint(year: number, w: number, h: number, log = false) {
  const max = moore(YEARS.to)
  const v = log ? Math.log2(moore(year)) / Math.log2(max) : moore(year) / max
  return { x: w * (year - YEARS.from) / (YEARS.to - YEARS.from), y: h - v * h }
}

// Round 2 (PwB2, PwD, PwE). PLACEHOLDER copy, not approved by Will.
// What the film shows in a year (story.md: Outcome; the film frames at 1:00, 4:45, 5:00). Not process facts.
export const SEEN: Record<number, string> = {
  1997: 'A small blue sphere, barely moving.',
  2005: 'Eight years on, the same quiet sphere.',
  2015: 'Three quarters in, still almost flat.',
  2018: 'It bursts into purple strands.',
  2020: 'Red and white feedback chaos.',
}

// The patch: what the FLOPs curve drives (p.12–13), as a pin matrix (after PwC)
export const PATCH = {
  sources: ['FLOPs data', 'Fixed'],
  params: ['Size', 'Chaos', 'Red', 'Green', 'Blue'],
  pins: {
    'FLOPs data/Size': { op: 'Math, multiply', does: 'Size grows with the data.' },
    'FLOPs data/Chaos': { op: 'Post Add', does: 'A renamed parameter. Post Add inverts the shape.' },
    'FLOPs data/Red': { op: 'Level', does: 'Red rises first: a red tint.' },
    'FLOPs data/Green': { op: 'Level', does: 'Green follows, so the end goes white and the bloom shows.' },
    'Fixed/Blue': { op: 'Level', does: 'Blue stays fixed the whole film.' },
  } as Record<string, { op: string, does: string }>,
}

// "×16" etc.: the model's multiple of 1997
export const times = (year: number) => {
  const v = moore(year)
  return `×${v < 10 ? v.toFixed(0) : Math.round(v).toLocaleString('en-GB')}`
}
