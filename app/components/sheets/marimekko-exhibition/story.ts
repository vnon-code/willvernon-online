import PROJECTS from '~~/content/projects.json'

// PROTOTYPE (overnight run, Marimekko Exhibition MkA–MkC): the facts every variant here shows, drawn from
// .scratch/v1-launch/overnight/marimekko-exhibition/story.md (Will's GDES5014 process book, Dec 2023, the A3 visual
// system PDF and the mock-ups, copied from his PC; content/projects.json). Media is dev-only under /proto-media
// (gitignored; public/proto-media/marimekko-exhibition/UPLOAD.md lists it for R2). Not a variant (only *.vue files are).
// Every string is PLACEHOLDER copy, not approved by Will. Colours sampled from the posters and book p.30.
export const _status = 'PLACEHOLDER copy, not approved by Will'

type Proj = { slug: string, title: string, software: string[] }
const SRC = (PROJECTS as unknown as { caseStudies: Proj[] }).caseStudies.find(p => p.slug === 'marimekko-exhibition')!

export const B = '/proto-media/marimekko-exhibition/'
export type Pic = { src: string, srcset: string, w: number, h: number, alt: string }
export const pic = (f: string, w: number, h: number, alt: string): Pic => ({
  src: `${B}${f}.webp`, w, h, alt, srcset: `${B}${f}-sm.webp ${w / 2}w, ${B}${f}.webp ${w}w`,
})

// The four designers, in the book's order, each with its colour pair (light ground, deep accent) and its four
// pieces. Names as Will's work spells them ("Anikka"; the real spelling is Annika, flagged in notes.md).
export type Artist = { id: string, name: string, light: string, deep: string, poster: Pic, tape: Pic, billboard: Pic, ticket: Pic }
const artist = (id: string, name: string, light: string, deep: string, t: number): Artist => ({
  id, name, light, deep,
  poster: pic(`poster-${id}`, 1358, 1920, `${name} poster, A3`),
  tape: pic(`tape-${id}`, 1920, 1440, `${name} floor tape running up a step`),
  billboard: pic(`billboard-${id}`, 1920, 1440, `${name} billboard on a street wall`),
  ticket: pic(`ticket${t}`, 1920, 1440, `${name} ticket`),
})
export const ARTISTS: Artist[] = [
  artist('kekki', 'Antti Kekki', '#bfd240', '#f8d000', 2),
  artist('isola', 'Maija Isola', '#c1dcee', '#4868b0', 1),
  artist('rimala', 'Anikka Rimala', '#f5dec4', '#f84810', 3),
  artist('ishimoto', 'Fujiwo Ishimoto', '#f15ead', '#d80048', 4),
]

export const OUT = {
  mural: pic('mural', 1920, 1281, 'The mural on a city building: patterns, the four names, the logo and dates on the roof'),
  flags: pic('flags', 1920, 1280, 'Four pattern flags against a blue sky'),
  wall: pic('concrete-wall', 1920, 1440, 'A concrete wall: "your journey with marimekko begins here" and the four names'),
  leaflet1: pic('leaflet1', 1920, 1229, 'Leaflet, folded open'),
  leaflet3: pic('leaflet3', 1920, 1075, 'Leaflet, the inside spread'),
  system: pic('a3-visual-system', 1358, 1920, 'The A3 visual system sheet: logotype, colour pairs, type, posters'),
  frameLogo: pic('anim-frame-logo', 1280, 720, 'Animation frame: the logotype and dates'),
  frameStrips: pic('anim-frame-strips', 1280, 720, 'Animation frame: "antti kekki" with a pattern strip up the right edge'),
}

// Process book pages (1920 × 1080)
const pg = (n: number, alt: string) => pic(`pb/p${n}`, 1920, 1080, `Process book p.${n}: ${alt}`)
export const PB = {
  trip: pg(19, 'field trip notes'),
  signs: pg(20, 'wayfinding research'),
  ideas: pg(24, 'initial ideas'),
  colour: pg(25, 'colour analysis'),
  type: pg(26, 'typography'),
  artists: pg(27, 'the four designers\' patterns, redrawn'),
  logo: pg(28, 'four logotype ideas'),
  system: pg(30, 'the visual system'),
  wayfinding: pg(33, 'wayfinding tape and map'),
  anim: pg(38, 'animation process'),
}

// PLACEHOLDER copy (not approved by Will), checked with no-ai-slop
export const MK = {
  title: SRC.title,
  hook: 'An identity for a made-up Marimekko retrospective at the Saatchi Gallery. Four designers, so everything comes in fours.',
  brief: 'Brief: a design system for an exhibition about one creative practitioner. Promotion, ephemera, wayfinding, a short animation.',
  fours: 'Every piece comes in four versions, one per designer: their pattern, their two colours.',
  colour: 'Each room has its own colour, so colour does the wayfinding.',
  logo: 'One repeating motif per designer sits in the logotype, above and below the word.',
  type: 'American Typewriter ITC. Bold, and close to Marimekko\'s old Olivetti-typewriter logotype.',
  redraw: 'The source patterns were low resolution, so I traced and redrew 16 motifs.',
  posters: 'The first posters were too small to read. I redid them at A3 with more pattern and clearer info.',
  logoIdeas: 'I drew four logotype ideas, each carrying all four designers, and chose the one with a repeating pattern from each.',
  trip: 'Field trip: a skate show used two yellow lines, like a road, to lead people round.',
  anim: 'A 22 s loop for a bus-stop screen. It ends on the logo and dates, so it loops cleanly.',
  animSteps: ['Pattern strips up the right edge', 'Designer names, centred', 'Masked line wipes', 'Logotype and dates'],
  out: 'Mock-ups: a mural, flags, a concrete wall.',
  credits: [
    { k: 'Identity, print, animation', v: 'William Vernon (solo)' },
    { k: 'Patterns', v: 'Antti Kekki, Maija Isola, Anikka Rimala, Fujiwo Ishimoto for Marimekko, redrawn by Will' },
  ],
}

export const INFO = { year: '2024', module: 'GDES5014 Visual Systems', role: 'Solo', tools: SRC.software.join(', ') }

// The project's own typeface (on Macs); a typewriter fallback elsewhere
export const TYPEWRITER = '\'American Typewriter\', \'Courier New\', ui-monospace, monospace'
