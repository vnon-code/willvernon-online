import CARD from '~~/content/proto-cards/cargo-5015.json'

// The Sheet's data (cargo-5015, from the overnight curation run): the facts the Sheet shows, from Will's GDES5015 Professional
// Practice process book V2 (2024, pages 10–19 and 32, copied read-only from his PC) and the finished files in
// 5015\Finished and \Buisness Card. Media is dev-only under /proto-media (gitignored; public/proto-media/cargo-5015/
// UPLOAD.md lists it for R2). The card back is left out on purpose: it carries Will's phone number and email.
// Every string is PLACEHOLDER copy, not approved by Will.
export const _status = 'PLACEHOLDER copy, not approved by Will'

export const B = '/proto-media/cargo-5015/'
export type Pic = { src: string, w: number, h: number, alt: string }
const pic = (f: string, w: number, h: number, alt: string): Pic => ({ src: `${B}${f}.webp`, w, h, alt })

export const TITLE = CARD.title
export const HOOK = 'W and V, cut from triangles.'
export const INFO = { year: '2024', module: 'GDES5015 Professional Practice', tools: [...CARD.tools, 'Premiere Pro'].join(', ') }

// The outcome: the card on concrete and polystyrene
export const MOCK = {
  steps: pic('mock-steps', 1600, 1200, 'The business card on white polystyrene steps, the mark white on the topographic texture'),
  tray: pic('mock-tray', 1600, 1200, 'The card leaning on a black polystyrene tray'),
  box: pic('mock-box', 1600, 1200, 'The card sunk into a black polystyrene box'),
}

// 01 Eight to one: the mark's rounds, named as the process book names them
export const ROUNDS = [
  { n: '02', label: 'Monogram 2', p: pic('pb-p10', 1376, 1043, 'Monogram 2: a W and V in bold type, their negative space cut into triangles, and the gradient animation'), line: 'Negative space from a bold W and V. It read as a logo, not my initials.' },
  { n: '03', label: 'Monogram 3', p: pic('pb-p12', 1189, 901, 'Monogram 3: eight forms from white triangles on a black box, and the After Effects mask test'), line: 'White triangles on a black box, after the Marea Films mark.' },
  { n: '04', label: 'Monogram 4', p: pic('pb-p14', 990, 894, 'Monogram 4: eight shapes, then four variations of the favourite'), line: 'Eight shapes, then four. I kept the third.' },
  { n: '05', label: 'Monogram 5', p: pic('pb-p15', 986, 930, 'Monogram 5: the mark square, tall and wide'), line: 'I tried it square, tall and wide, then settled on a shorter one.' },
  { n: 'X', label: 'Final', p: pic('pb-p16', 1241, 993, 'The final monogram, black'), line: '' },
]

// 02 Mark as mask: the grounds from page 17, two ways round
export const MASK = `${B}mark-mask.png`
export const TEXTURE = '/img/posters/experiments-topographyav-test2-69s.webp' // Topography AV (in the repo already)
export const GROUNDS = [
  { id: 'texture', label: 'On texture', plate: `#111 url(${TEXTURE}) center / cover`, fill: '#fff' },
  { id: 'red', label: 'On red', plate: '#c8102e', fill: '#fff' },
  { id: 'black', label: 'On black', plate: '#000', fill: '#fff' },
  { id: 'inside', label: 'Texture inside', plate: '#fff', fill: `#111 url(${TEXTURE}) center / cover` },
  { id: 'gradient', label: 'Gradient inside', plate: '#fff', fill: 'linear-gradient(160deg, #000 10%, #c8102e 60%, #fff 110%)' },
]
export const MASK_LINE = 'Grounds from my TouchDesigner textures. Then I flipped it and used the mark as a mask.'
export const BLENDER = { ...pic('pb-p18', 1581, 347, 'Blender: the mark thickened into a reflective object, three frames of its spin'), line: 'In Blender I thickened it, made it reflective and spun it.' }
export const MASKED = { ...pic('pb-p19', 1749, 247, 'Four frames of the mask animation: the term\'s work seen through the mark'), line: 'In After Effects the mark masks the term\'s work.' }

// 03 Five fronts: four cut, one kept (page 32)
const front = (f: string, alt: string) => pic(f, 1004, 650, alt)
export const FRONTS = [
  front('front-1', 'Front option: the mark small, centred'),
  front('front-2', 'Front option: the mark small, top left'),
  front('front-3', 'Front option: the mark huge, rotated, cropped by the edges'),
  front('front-4', 'Front option: the mark large, centred'),
]
export const FRONT_FINAL = front('front-final', 'The final front: the mark white, centred at a moderate scale on the topographic texture')
export const FRONTS_LINE = 'Off-centre, rotated, scaled up. None of them worked, so it went back in the middle.'
