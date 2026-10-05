// PROTOTYPE (/proto) — throwaway (Will, 2026-10-05). The interaction exploration: what each option row in
// PROTO_OPTIONS does, the tunable values the scoring loop moves (`window.__fx`), the dot field's triggers, and the
// UI sound palettes. Off /proto none of this runs: the attributes and sounds are only set while the switcher is up.

import type { Proto } from './useProto'

type Opt = Omit<Proto, 'info'>

// Values the loop tunes. Durations in ms before the motion multiplier; distances in px before the travel multiplier.
export const FX_DEFAULTS = {
  changeMs: 320, enterMs: 240, staggerMs: 40, rise: 6, // the two boxes
  nameMs: 260, slide: 8, scrambleMs: 360, // the name
  cardMs: 180, lift: 1.015, tilt: 3, press: 0.985, // centre card
  drawerMs: 420, cascadeMs: 24, // drawers
  chipMs: 260, // chips
  pressMs: 120, pull: 4, pullR: 64, // header buttons
  // field: a slow pulse out of the centre card's border, lighting only dots that are already lit. Travel time,
  // strength, band width, how far it travels, distance fade, echoes and their spacing, how white the crest goes
  // (0–1), glow around lit dots, edge wobble (px), start after the change
  pulseMs: 4500, pulseAmp: 0.75, pulseW: 140, pulseReach: 120, pulseFall: 160, pulseEchoes: 1, pulseGap: 900,
  pulseWhite: 0.4, pulseBloom: 0, pulseWarp: 30, pulseDelay: 200,
  gain: 1, pitch: 0, samples: 1, // sound: level, transpose (semitones), sampled big moments
}
export type FxParams = typeof FX_DEFAULTS
// The Field row's options: the round-12 loop's finalists (judged on origin, atmosphere, pace, presence, restraint),
// relit to Will's brief, laid over the values above (which are Breath)
export const FIELD_PRESETS: Record<string, Partial<FxParams>> = {
  // swells out about one card-height from the border, then settles; crest ~40% to white (21/25)
  breath: {},
  bright: { pulseWhite: 0.7 }, // Breath with a whiter crest
  bloom: { pulseBloom: 1 }, // Breath with a faint glow around the lit dots
  halo: { pulseMs: 3600, pulseAmp: 0.8, pulseW: 110, pulseReach: 0, pulseFall: 180 }, // hugs the card, never travels (20/25)
  tide: { pulseMs: 6000, pulseAmp: 0.7, pulseW: 160, pulseReach: 100, pulseFall: 180, pulseWarp: 40 }, // the slowest, 6 s (21/25)
  fog: { pulseMs: 5000, pulseAmp: 0.5, pulseW: 220, pulseReach: 120, pulseFall: 200, pulseWarp: 80 }, // spreads over most of the screen (17/25)
}
const MOTION = { restrained: { t: 0.75, d: 0.6 }, medium: { t: 1, d: 1 }, expressive: { t: 1.35, d: 1.6 } }

const params = reactive<FxParams>({ ...FX_DEFAULTS })
// The dot field's trigger: the latest project change and the card it came from (read live, so the pulse hugs its border)
const field = reactive({ at: -1e9, el: null as Element | null, hold: -1 }) // hold: the scoring loop freezes the pulse at an age (ms)

// ---------- Sound ----------
// Scale for the musical palette: the track's key (PLACEHOLDER until detected from the stems), minor pentatonic
const KEY = { root: 57, scale: [0, 3, 5, 7, 10] } // A3
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12)
const degree = (i: number, oct = 0) => KEY.root + 12 * (oct + Math.floor(i / 5)) + KEY.scale[((i % 5) + 5) % 5]!

type Ctx = BaseAudioContext
type Voice = (c: Ctx, out: AudioNode, t: number, d: { i: number, up: boolean, p: FxParams }) => void
export type SfxEvent = 'step' | 'chip' | 'press' | 'hover' | 'drawerOpen' | 'drawerClose' | 'sheetOpen' | 'sheetClose'
export const SFX_EVENTS: SfxEvent[] = ['step', 'chip', 'press', 'hover', 'drawerOpen', 'drawerClose', 'sheetOpen', 'sheetClose']
export const SAMPLED: SfxEvent[] = ['drawerOpen', 'drawerClose', 'sheetOpen', 'sheetClose']

// An enveloped oscillator: 3ms attack (no click), exponential decay
function tone(c: Ctx, out: AudioNode, t: number, f: number, dur: number, amp: number, type: OscillatorType = 'sine') {
  const o = c.createOscillator(), g = c.createGain()
  o.type = type
  o.frequency.value = f
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(amp, t + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}
// A band-passed noise burst
let noiseBuf: AudioBuffer | null = null
function noise(c: Ctx, out: AudioNode, t: number, dur: number, amp: number, freq: number, q = 1.2, sweepTo = 0) {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain()
  s.buffer = noiseBuf
  f.type = 'bandpass'
  f.frequency.setValueAtTime(freq, t)
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur)
  f.Q.value = q
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(amp, t + 0.002)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(out)
  s.start(t)
  s.stop(t + dur + 0.02)
}
// Square blips through a 4-bit staircase: the dot field's grain, as sound. The square runs at full level into the
// shaper (quiet input would round to zero) and the envelope comes after it, so the steps never click
function crushed(c: Ctx, out: AudioNode, t: number, f: number, dur: number, amp: number) {
  const o = c.createOscillator(), ws = c.createWaveShaper(), curve = new Float32Array(256)
  for (let i = 0; i < 256; i++) curve[i] = Math.round(((i / 255) * 2 - 1) * 4) / 4
  ws.curve = curve
  const lp = c.createBiquadFilter(), g = c.createGain()
  lp.type = 'lowpass'
  lp.frequency.value = 4200
  o.type = 'square'
  o.frequency.value = f
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(amp, t + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(ws).connect(lp).connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}

const st = (p: FxParams) => 2 ** (p.pitch / 12)
export const PALETTES: Record<'musical' | 'tactile' | 'glitch', Record<SfxEvent, Voice>> = {
  // Soft plucks on the track's scale; the step climbs with the project index
  musical: {
    step: (c, o, t, { i, p }) => { tone(c, o, t, midi(degree(i, 1)) * st(p), 0.22, 0.05); tone(c, o, t, midi(degree(i, 2)) * st(p), 0.12, 0.012) },
    chip: (c, o, t, { i, p }) => { tone(c, o, t, midi(degree(i, 1)) * st(p), 0.2, 0.045); tone(c, o, t + 0.06, midi(degree(i + 2, 1)) * st(p), 0.26, 0.04) },
    press: (c, o, t, { p }) => tone(c, o, t, midi(degree(4, 1)) * st(p), 0.08, 0.035),
    hover: (c, o, t, { i, p }) => tone(c, o, t, midi(degree(i, 2)) * st(p), 0.05, 0.008),
    drawerOpen: (c, o, t, { p }) => [0, 2, 4].forEach((k, j) => tone(c, o, t + j * 0.045, midi(degree(k, 1)) * st(p), 0.32, 0.03)),
    drawerClose: (c, o, t, { p }) => [4, 2, 0].forEach((k, j) => tone(c, o, t + j * 0.04, midi(degree(k, 1)) * st(p), 0.26, 0.026)),
    sheetOpen: (c, o, t, { p }) => [0, 2, 4, 5].forEach((k, j) => tone(c, o, t + j * 0.05, midi(degree(k, 1)) * st(p), 0.5, 0.028, 'triangle')),
    sheetClose: (c, o, t, { p }) => [5, 4, 2, 0].forEach((k, j) => tone(c, o, t + j * 0.04, midi(degree(k, 1)) * st(p), 0.36, 0.024, 'triangle')),
  },
  // Dry clicks and slides, a hardware mixer
  tactile: {
    step: (c, o, t, { p }) => { noise(c, o, t, 0.012, 0.09, 3200 * st(p), 2); tone(c, o, t, 140, 0.03, 0.03) },
    chip: (c, o, t, { p }) => { noise(c, o, t, 0.016, 0.1, 2400 * st(p), 2); noise(c, o, t + 0.05, 0.012, 0.06, 3400 * st(p), 2) },
    press: (c, o, t, { p }) => noise(c, o, t, 0.01, 0.08, 2800 * st(p), 2.5),
    hover: (c, o, t, { p }) => noise(c, o, t, 0.006, 0.025, 4200 * st(p), 3),
    drawerOpen: (c, o, t, { p }) => { noise(c, o, t, 0.16, 0.05, 600 * st(p), 0.8, 2600 * st(p)); noise(c, o, t + 0.15, 0.012, 0.08, 2600 * st(p), 2) },
    drawerClose: (c, o, t, { p }) => { noise(c, o, t, 0.13, 0.045, 2400 * st(p), 0.8, 600 * st(p)); tone(c, o, t + 0.12, 110, 0.05, 0.05) },
    sheetOpen: (c, o, t, { p }) => { noise(c, o, t, 0.3, 0.045, 400 * st(p), 0.7, 3000 * st(p)); noise(c, o, t + 0.28, 0.014, 0.07, 2400 * st(p), 2) },
    sheetClose: (c, o, t, { p }) => { noise(c, o, t, 0.24, 0.04, 2800 * st(p), 0.7, 400 * st(p)); tone(c, o, t + 0.22, 100, 0.06, 0.05) },
  },
  // Crushed square blips, the dot matrix as sound
  glitch: {
    step: (c, o, t, { i, p }) => { crushed(c, o, t, 880 * st(p) * (1 + (i % 3) * 0.25), 0.03, 0.03); crushed(c, o, t + 0.035, 1320 * st(p), 0.02, 0.02) },
    chip: (c, o, t, { p }) => [0, 1, 2].forEach(j => crushed(c, o, t + j * 0.03, (660 + j * 330) * st(p), 0.022, 0.028)),
    press: (c, o, t, { p }) => crushed(c, o, t, 1100 * st(p), 0.02, 0.026),
    hover: (c, o, t, { p }) => crushed(c, o, t, 1760 * st(p), 0.012, 0.008),
    drawerOpen: (c, o, t, { p }) => [0, 1, 2, 3].forEach(j => crushed(c, o, t + j * 0.028, (440 * 1.25 ** j) * st(p), 0.03, 0.024)),
    drawerClose: (c, o, t, { p }) => [3, 2, 1, 0].forEach((k, j) => crushed(c, o, t + j * 0.026, (440 * 1.25 ** k) * st(p), 0.03, 0.022)),
    sheetOpen: (c, o, t, { p }) => { [0, 1, 2, 3, 4].forEach(j => crushed(c, o, t + j * 0.03, (330 * 1.2 ** j) * st(p), 0.035, 0.022)); noise(c, o, t, 0.18, 0.02, 1800, 0.6) },
    sheetClose: (c, o, t, { p }) => { [4, 3, 2, 1, 0].forEach((k, j) => crushed(c, o, t + j * 0.026, (330 * 1.2 ** k) * st(p), 0.03, 0.02)); noise(c, o, t, 0.14, 0.018, 1400, 0.6) },
  },
}

// Rounds 15–17 (Will, 2026-10-05): step, chip, press and the volume slider stay. Drawers, the Sheet and hover are
// redone digital, in the hover tick's language (round 15's acoustic samples were "too acoustic").
type Redo = 'drawerOpen' | 'drawerClose' | 'sheetOpen' | 'sheetClose' | 'hover' | 'step' | 'chip' | 'press'
const REDO_ROW = { drawerOpen: 'drawerSfx', drawerClose: 'drawerSfx', sheetOpen: 'sheetSfx', sheetClose: 'sheetSfx', hover: 'hoverSfx', step: 'stepSfx', chip: 'chipSfx' } as const
// A pitch-bent sine: a digital thump
function chirp(c: Ctx, out: AudioNode, t: number, f0: number, f1: number, dur: number, amp: number) {
  const o = c.createOscillator(), g = c.createGain()
  o.frequency.setValueAtTime(f0, t)
  o.frequency.exponentialRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(amp, t + 0.003)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.02)
}
const tick = (c: Ctx, o: AudioNode, t: number, f: number, amp = 0.09) => noise(c, o, t, 0.006, amp, f, 2.5)
// n ticks, each `ratio` higher (or lower) than the last; the last one lands hardest
const ticks = (c: Ctx, o: AudioNode, t: number, n: number, f0: number, ratio: number, gap: number, amp = 1) => {
  for (let j = 0; j < n; j++) tick(c, o, t + j * gap, f0 * ratio ** j, (j === n - 1 ? 0.14 : 0.1) * amp)
}
const blips = (c: Ctx, o: AudioNode, t: number, fs: number[], gap: number, dur = 0.07, amp = 0.03, type: OscillatorType = 'triangle') =>
  fs.forEach((f, j) => tone(c, o, t + j * gap, f, dur, amp, type))
// Round 17 (Will): Zip dropped; three variations each of Ticks, Blip and Pulse. One recipe per family for all four
// events: `big` is the Sheet (more ticks, more notes, deeper and longer), `open` runs up, close runs down.
function family(big: boolean, open: boolean): Record<string, Voice> {
  const r = (x: number) => (open ? x : 1 / x)
  const notes = (fs: number[]) => (open ? fs : [...fs].reverse())
  const f0 = big ? (open ? 1500 : 3000) : (open ? 1800 : 2900)
  const bend = (lo: number, hi: number): [number, number] => (open ? [lo, hi] : [hi, lo * 0.8])
  const scale = big ? [660, 990, 1320] : [880, 1320]
  return {
    ticks: (c, o, t) => ticks(c, o, t, big ? 6 : 4, f0, r(big ? 1.15 : 1.18), big ? 0.03 : 0.028),
    ticksFast: (c, o, t) => ticks(c, o, t, big ? 9 : 6, f0, r(big ? 1.08 : 1.1), 0.016, 0.75), // a tight ratchet
    ticksSlow: (c, o, t) => ticks(c, o, t, big ? 4 : 3, f0, r(1.3), 0.05), // fewer, wider steps
    blip: (c, o, t) => blips(c, o, t, notes(scale), 0.05),
    blipSoft: (c, o, t) => blips(c, o, t, notes(scale), 0.07, 0.12, 0.035, 'sine'), // rounder, longer
    blipTick: (c, o, t) => notes(scale).forEach((f, j) => { tone(c, o, t + j * 0.05, f, 0.07, 0.03, 'triangle'); tick(c, o, t + j * 0.05, f * 3, 0.05) }), // each note starts on a tick
    pulse: (c, o, t) => { const [a, b] = bend(big ? 120 : 180, big ? 260 : 320); chirp(c, o, t, a, b, big ? 0.16 : 0.09, 0.04); tick(c, o, t + (open ? 0 : big ? 0.15 : 0.08), open ? 2600 : 1800, 0.07) },
    pulseSoft: (c, o, t) => { const [a, b] = bend(big ? 180 : 220, big ? 260 : 300); chirp(c, o, t, a, b, big ? 0.2 : 0.14, 0.045) }, // no tick, a smaller bend
    pulseLow: (c, o, t) => { const [a, b] = bend(big ? 70 : 90, big ? 140 : 160); chirp(c, o, t, a, b, big ? 0.2 : 0.14, 0.06); tick(c, o, t + (open ? 0 : big ? 0.18 : 0.12), open ? 2200 : 1500, 0.08) }, // deeper
  }
}
export const REDO_VOICES: Record<Redo, Record<string, Voice>> = {
  drawerOpen: family(false, true),
  drawerClose: family(false, false),
  sheetOpen: family(true, true),
  sheetClose: family(true, false),
  // pointer onto a strip card; reopened in round 17
  hover: {
    tick: (c, o, t) => noise(c, o, t, 0.006, 0.1, 1800, 2), // a barely-there dry tick (round 16's pick)
    tickHi: (c, o, t) => noise(c, o, t, 0.004, 0.09, 3200, 3), // shorter and brighter
    blip: (c, o, t) => tone(c, o, t, 1760, 0.04, 0.018), // a tiny sine note
    pulse: (c, o, t) => chirp(c, o, t, 260, 380, 0.03, 0.015), // a tiny upward bend
  },
  // Round 18 (Will): the strip's step may be "slightly too aggressive/loud"; 'now' is today's tactile step
  step: {
    soft: (c, o, t) => { noise(c, o, t, 0.012, 0.055, 3200, 2); tone(c, o, t, 140, 0.03, 0.018) }, // today's, 4 dB down
    muted: (c, o, t) => { noise(c, o, t, 0.012, 0.05, 2200, 2); tone(c, o, t, 120, 0.025, 0.015) }, // darker and quieter
    tick: (c, o, t) => tick(c, o, t, 2400, 0.07), // just a tick, no low knock
  },
  // Round 18 (Will): a better filter click; 'now' is today's tactile double click
  chip: {
    blip: (c, o, t) => blips(c, o, t, [1320, 1760], 0.035, 0.05, 0.02), // two quick notes up
    blipTick: (c, o, t) => [1320, 1760].forEach((f, j) => { tone(c, o, t + j * 0.035, f, 0.05, 0.02, 'triangle'); tick(c, o, t + j * 0.035, f * 2, 0.05) }),
    pulse: (c, o, t) => { chirp(c, o, t, 300, 520, 0.06, 0.025); tick(c, o, t, 2800, 0.07) }, // a small bend up on a tick
    double: (c, o, t) => { tick(c, o, t, 2400, 0.1); tick(c, o, t + 0.03, 3600, 0.07) }, // two crisp ticks, a fifth apart
  },
  press: {}, // the menu button borrows the chip's blip tick (below); mute keeps the palette's press
}
REDO_VOICES.press.blipTick = REDO_VOICES.chip.blipTick!

// Sampled big moments (ElevenLabs SFX, public/proto/sfx/<palette>-<event>.mp3), decoded on first use
const samples = new Map<string, AudioBuffer | null>()
async function sample(c: Ctx, key: string) {
  if (samples.has(key)) return samples.get(key)
  samples.set(key, null)
  try {
    const r = await fetch(`/proto/sfx/${key}.mp3`)
    if (r.ok) samples.set(key, await c.decodeAudioData(await r.arrayBuffer()))
  }
  catch { /* no sample: the synth voice plays */ }
  return samples.get(key)
}
const SAMPLE_GAIN = 0.35 // PLACEHOLDER: samples sit under the music

// Plays one event into `out` at time t; shared by the live page and the offline scorer
export async function renderSfx(c: Ctx, out: AudioNode, t: number, palette: keyof typeof PALETTES, e: SfxEvent, i = 0, p: FxParams = params, variant = '') {
  const g = c.createGain()
  g.gain.value = p.gain * (e === 'hover' ? 0.4 : 1) // hover sits well under everything else
  g.connect(out)
  if (variant && variant !== 'now') return REDO_VOICES[e as Redo][variant]!(c, g, t, { i, up: true, p })
  const buf = p.samples && SAMPLED.includes(e) ? await sample(c, `${palette}-${e}`) : null
  if (buf) {
    const s = c.createBufferSource(), sg = c.createGain()
    s.buffer = buf
    s.playbackRate.value = st(p)
    sg.gain.value = SAMPLE_GAIN
    s.connect(sg).connect(g)
    s.start(t)
    return
  }
  PALETTES[palette][e](c, g, t, { i, up: true, p })
}

let lastAt = 0
export function useProtoFx() {
  const { on, v } = useProto()
  const { voice } = useSound()
  const opt = computed(() => v.value as unknown as Opt)
  // `force` plays a set variant whatever the row says (a hover over a filter chip is always the tick)
  function sfx(e: SfxEvent, i = 0, force = '') {
    const variant = force || (e in REDO_ROW ? String(opt.value[REDO_ROW[e as Redo]]) : '')
    if (!on.value || opt.value.sound === 'off' || variant === 'none') return
    const now = performance.now()
    if (e === 'step' && now - lastAt < 45) return // a fast wheel spin ticks, it doesn't buzz
    if (e === 'step') lastAt = now
    voice((c, out, t) => { void renderSfx(c, out, t, opt.value.sound as keyof typeof PALETTES, e, i, params, variant) })
  }
  // The field's pulse starts at the centre card's border; times are performance.now()
  function kickField(el?: Element) {
    if (!on.value || !el) return
    Object.assign(field, { el: markRaw(el), at: performance.now() })
  }
  return { on, opt, params, field, sfx, kickField }
}

// The switcher applies the options as attributes on <html> (CSS reads them) and the values as custom properties
export function applyFx(o: Opt, p: FxParams) {
  const html = document.documentElement
  for (const [k, val] of Object.entries(o)) html.dataset[`fx${k[0]!.toUpperCase()}${k.slice(1)}`] = String(val)
  const m = MOTION[o.motion as keyof typeof MOTION]
  const ms = (n: number) => `${Math.round(n * m.t)}ms`
  const vars: Record<string, string> = {
    '--fx-change': ms(p.changeMs), '--fx-enter': ms(p.enterMs), '--fx-stagger': ms(p.staggerMs), '--fx-rise': `${p.rise * m.d}px`,
    '--fx-name': ms(p.nameMs), '--fx-slide': `${p.slide * m.d}px`,
    '--fx-card': ms(p.cardMs), '--fx-lift': String(1 + (p.lift - 1) * m.d), '--fx-tilt': `${p.tilt * m.d}deg`, '--fx-press': String(p.press),
    '--fx-drawer': ms(p.drawerMs), '--fx-cascade': ms(p.cascadeMs), '--fx-chip': ms(p.chipMs), '--fx-press-ms': ms(p.pressMs),
  }
  for (const [k, val] of Object.entries(vars)) html.style.setProperty(k, val)
  return m
}
export const fxMotion = (o: Opt) => MOTION[o.motion as keyof typeof MOTION]
