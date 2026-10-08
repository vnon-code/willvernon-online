import AI from '~~/content/ai.json'

// The Sheet's data (Synthetic Corals CA–CC, from the overnight run): the facts the Sheet shows, drawn from
// .scratch/v1-launch/overnight/synthetic_corals/story.md (content/ai.json, file dates on Will's PC). No write-up
// exists, so the Sheet opens to the outcome. Media is dev-only under /proto-media (gitignored;
// public/proto-media/synthetic_corals/UPLOAD.md lists it for R2).
// Every string is PLACEHOLDER copy, not approved by Will. Tools as ai.json lists them (the old card tag said
// AntiGravity); Will to confirm (notes.md).
export const _status = 'PLACEHOLDER copy, not approved by Will'

type Src = { key: string, title: string, prompt: string, engine: string, ar: string, upscale: string, media: { items: { type: string, alt?: string }[] } }
const SRC = (AI as unknown as { projects: Src[] }).projects.find(p => p.key === 'synthetic_corals')!

export const B = '/proto-media/synthetic_corals/'
export type Run = { n: number, name: string, src: string, srcset: string, w: number, h: number, alt: string, pal: [string, number][] }

// The alt names come from ai.json ("Synthetic Coral 1 - White Calcification" → "White calcification")
const ALTS = SRC.media.items.filter(i => i.type === 'image').map(i => i.alt!.split(' - ')[1]!)
const run = (n: number, f: string, name: string, w: number, h: number, pal: [string, number][]): Run => ({
  n, name, w, h, pal,
  src: `${B}${f}.webp`,
  srcset: `${B}${f}-sm.webp ${Math.round(w / 2)}w, ${B}${f}.webp ${w}w`,
  alt: `Run ${n}: ${name.toLowerCase()}`,
})

// The four runs on the site (run 3 isn't), with each one's coral colours by share (background left out; PIL
// median-cut, 2026-10-06)
export const RUNS: Run[] = [
  run(1, 'coral-1', ALTS[0]!, 839, 873, [['#bcbfbc', 23], ['#9d8b80', 25], ['#966654', 15], ['#66615a', 15], ['#52322b', 22]]),
  run(2, 'coral-2', ALTS[1]!, 1024, 1024, [['#9fbfea', 12], ['#6895da', 15], ['#396ac7', 23], ['#1a3ea6', 27], ['#0c197f', 23]]),
  run(4, 'coral-4', ALTS[2]!, 1024, 1024, [['#b4ce50', 25], ['#809536', 18], ['#786319', 15], ['#285e33', 19], ['#2a351a', 23]]),
  run(5, 'coral-5', ALTS[3]!, 1024, 1024, [['#c28677', 13], ['#a65d59', 14], ['#a11c1e', 26], ['#7e4143', 15], ['#3f1c20', 32]]),
]
// The preview still: run 5's coral lifted over a white floor
export const PREVIEW = { src: `${B}coral-preview.webp`, srcset: `${B}coral-preview-sm.webp 512w, ${B}coral-preview.webp 1024w`, w: 1024, h: 1024, alt: 'The volcanic graft floating over a white floor', pal: [['#cdd7e3', 14], ['#b0a6a9', 12], ['#996361', 19], ['#a82526', 24], ['#3f262b', 30]] as [string, number][] }

// The two clips, both portrait, no audio
export const CLIPS = {
  turn: { src: `${B}coral_rotate.mp4`, poster: '/img/posters/ai-coral-rotate.webp', w: 1072, h: 1920, dur: 10, label: '10 s', alt: 'A black coral with red and white polyps turning on white' },
  cut: { src: `${B}coral_rotate_vertical.mp4`, poster: `${B}poster-vertical.webp`, w: 720, h: 1280, dur: 5, label: '5 s', alt: 'The same coral, a shorter cut' },
}

// 24 frames of the 10 s clip, evenly spaced (AVFoundation, 2026-10-06), for the turntable
export const SPIN = Array.from({ length: 24 }, (_, i) => `${B}spin-${String(i).padStart(2, '0')}.webp`)

// The prompt and the settings, as ai.json has them (shown as written)
const [prompt, nodes] = SRC.prompt.split(' // ')
export const PROMPT = prompt!
export const NODES = [
  { k: 'Engine', v: SRC.engine },
  ...nodes!.split(', ').map((s) => {
    const i = s.indexOf(': ')
    if (i > 0) return { k: s.slice(0, i), v: s.slice(i + 2) }
    // No colon ("shifted ModelSamplingSD3 noise coordinates", "VAE ae.safetensors"): the node name is the key
    const w = s.split(' ')
    const n = w.find(x => /^[A-Z]/.test(x)) ?? w[0]!
    return { k: n, v: w.filter(x => x !== n).join(' ') }
  }),
  { k: 'Ratio', v: SRC.ar },
  { k: 'Upscale', v: SRC.upscale },
]

export const CO = {
  title: SRC.title,
  hook: 'A custom ComfyUI workflow for imaginary coral. Small node changes, completely different forms.',
  runs: 'Five test runs from one base pipeline. Run 3 isn\'t on the site.',
  missing: 'Not on the site',
  lights: 'One run gave bleached white calcified shapes, the next glowing cyan tendrils.',
  nodes: 'The settings, as the old site lists them.',
  turn: 'Two short clips of one coral turning.',
  spin: 'Drag, or use the slider, to turn it.',
  colour: 'Each run\'s colours by share of the coral, background left out.',
  credits: [
    { k: 'Workflow, images, clips', v: 'William Vernon (solo)' },
    { k: 'Tools', v: 'ComfyUI, HiDream, Flux.1 Dev' },
  ],
}

export const INFO = { year: '2026', module: 'Personal experiment', role: 'Solo', tools: 'ComfyUI, HiDream, Flux.1 Dev, Ultrasharp 4x' }
