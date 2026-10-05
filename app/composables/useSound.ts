// Native Web Audio engine for the opening track's stems (ADR-0001, docs/specs/sound-hud.md).
// Stems are decoded during the Gate's load, but nothing plays until sound is enabled.
// The AudioContext is only created inside a user gesture (browser autoplay rules).
//
// Graph: stem → [bass low-pass] → stem gain → analyser → mix → DREAM low-pass → dry / reverb / delay → master
// UI blips go straight to the destination, so DREAM never touches them.

const buffers = new Map<string, AudioBuffer>()

// Fader positions, 0–1. They can change before sound starts and apply once it does.
const levels = reactive<Record<string, number>>({})
// Starting mix (Will, 2026-10-03): drums off, bass cutoff at 100 Hz, the rest at 80%. DREAM starts at 0 (Will, 2026-10-04)
// so the Landing background opens on its dream-off look.
const STEM_DEFAULTS: Record<string, number> = { drums: 0, bass: Math.log(100 / 30) / Math.log(8000 / 30) }
const defaultLevel = (id: string) => STEM_DEFAULTS[id] ?? 0.8
const dream = ref(0)
const volume = ref(0) // 0 = muted; the Sound HUD raises it after its entrance on the sound path
const playing = ref(false) // stems started, VOL above 0 and not muted
// Mute (Will, 2026-10-05): the header's button silences everything; VOL is the music's level only, so UI sounds
// play whatever VOL is set to. Starts muted; entering with sound (or unmuting) lifts it.
const muted = ref(true)

// Bass (Will, 2026-10-03): its fader sweeps a low-pass, exponential 30 Hz–8 kHz; 0 cuts it completely
const FILTER_STEMS = new Set(['bass'])
const cutoff = (v: number) => 30 * Math.pow(8000 / 30, v)

const GLIDE = 0.04 // seconds; level changes glide so nothing clicks

interface StemNodes { gain: GainNode; filter?: BiquadFilterNode; analyser: AnalyserNode; data: Float32Array<ArrayBuffer>; peak: number }
const nodes = new Map<string, StemNodes>()
const sources: AudioBufferSourceNode[] = []
let ctx: AudioContext | null = null
let master: GainNode
let ui: GainNode
let mix: GainNode
let lowpass: BiquadFilterNode
let dry: GainNode
let reverbWet: GainNode
let delayWet: GainNode
let started = false

// Decoding needs no live context, so an OfflineAudioContext avoids the autoplay warning
let decoder: OfflineAudioContext | null = null

async function addStem(id: string, data: ArrayBuffer) {
  decoder ??= new OfflineAudioContext(2, 1, 48000)
  buffers.set(id, await decoder.decodeAudioData(data))
  levels[id] ??= defaultLevel(id)
}

function impulse(c: AudioContext, seconds = 3.2) {
  const length = c.sampleRate * seconds
  const buffer = c.createBuffer(2, length, c.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 2.5
  }
  return buffer
}

// Call from a user gesture. Once unlocked, the context keeps running, so playback can start later.
function unlock() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    ui = ctx.createGain()
    ui.gain.value = 1 // Will, 2026-10-04: louder (was 0.5, so +6 dB)
    ui.connect(ctx.destination)

    mix = ctx.createGain()
    lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 20000
    lowpass.Q.value = 0.4
    dry = ctx.createGain()
    const reverb = ctx.createConvolver()
    reverb.buffer = impulse(ctx)
    reverbWet = ctx.createGain()
    reverbWet.gain.value = 0
    const delay = ctx.createDelay(2)
    delay.delayTime.value = 0.42
    const feedback = ctx.createGain()
    feedback.gain.value = 0.42
    const delayTone = ctx.createBiquadFilter()
    delayTone.type = 'lowpass'
    delayTone.frequency.value = 2400
    delayWet = ctx.createGain()
    delayWet.gain.value = 0

    mix.connect(lowpass)
    lowpass.connect(dry).connect(master)
    lowpass.connect(reverb).connect(reverbWet).connect(master)
    lowpass.connect(delay)
    delay.connect(delayTone).connect(feedback).connect(delay)
    delayTone.connect(delayWet).connect(master)
  }
  void ctx.resume()
}

function applyStem(id: string) {
  const n = nodes.get(id)
  if (!ctx || !n) return
  const v = levels[id] ?? defaultLevel(id)
  const t = ctx.currentTime
  if (n.filter) {
    n.filter.frequency.setTargetAtTime(cutoff(v), t, GLIDE)
    n.gain.gain.setTargetAtTime(v === 0 ? 0 : 1, t, GLIDE)
  }
  else {
    n.gain.gain.setTargetAtTime(v * v, t, GLIDE)
  }
}

function applyDream() {
  if (!ctx) return
  const t = ctx.currentTime
  const d = dream.value
  lowpass.frequency.setTargetAtTime(20000 * Math.pow(700 / 20000, d), t, 0.08)
  dry.gain.setTargetAtTime(1 - d * 0.35, t, 0.08)
  reverbWet.gain.setTargetAtTime(d * 0.7, t, 0.08)
  delayWet.gain.setTargetAtTime(d * 0.32, t, 0.08)
  // The same rate on every stem keeps them in sync
  for (const src of sources) src.playbackRate.setTargetAtTime(1 - d * 0.08, t, 0.3)
}

function startStems() {
  if (started || !ctx || !buffers.size) return
  started = true
  const at = ctx.currentTime + 0.05 // start every stem on the same sample
  for (const [id, buffer] of buffers) {
    const gain = ctx.createGain()
    gain.gain.value = 0
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    let filter: BiquadFilterNode | undefined
    if (FILTER_STEMS.has(id)) {
      filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.Q.value = 0.7
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true
    ;(filter ? src.connect(filter) : src).connect(gain).connect(analyser).connect(mix)
    src.start(at)
    sources.push(src)
    nodes.set(id, { gain, filter, analyser, data: new Float32Array(analyser.fftSize), peak: 0 })
    applyStem(id)
  }
  applyDream()
}

// Music volume, level². Above 0 also starts the stems (needs a user gesture, or unlock() earlier in one).
function setVolume(v: number) {
  volume.value = v
  if (v > 0) {
    unlock()
    startStems()
  }
  applyMute()
}
// Mute covers both buses: the music (master) and the UI sounds (ui)
function setMuted(m: boolean) {
  muted.value = m
  if (!m) unlock()
  applyMute()
}
function applyMute() {
  if (!ctx) return
  master.gain.setTargetAtTime(muted.value ? 0 : volume.value ** 2, ctx.currentTime, GLIDE)
  ui.gain.setTargetAtTime(muted.value ? 0 : 1, ctx.currentTime, 0.01)
  playing.value = started && volume.value > 0 && !muted.value
}

function setLevel(id: string, v: number) {
  levels[id] = v
  applyStem(id)
}

function setDream(v: number) {
  dream.value = v
  applyDream()
}

// Live level per stem, 0–1: fast rise, ~0.9 per frame decay. Call once per animation frame.
function readMeters(out: Record<string, number>) {
  for (const [id, n] of nodes) {
    n.analyser.getFloatTimeDomainData(n.data)
    let sum = 0
    for (const x of n.data) sum += x * x
    const rms = Math.min(1, Math.sqrt(sum / n.data.length) * 3.2)
    n.peak = Math.max(rms, n.peak * 0.9)
    out[id] = n.peak
  }
  return out
}

// Quiet synthesised fader sounds; silent while muted (VOL doesn't touch them)
function blip(freq: number, dur: number, amp: number, type: OscillatorType = 'sine') {
  if (!ctx || muted.value) return
  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const env = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  env.gain.setValueAtTime(amp, t)
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(env).connect(ui)
  osc.start(t)
  osc.stop(t + dur + 0.01)
}
// PROTOTYPE (/proto UI sounds): run a voice into the UI bus; silent while muted, whatever VOL is set to
function voice(play: (c: AudioContext, out: AudioNode, t: number) => void) {
  if (ctx && !muted.value) play(ctx, ui, ctx.currentTime)
}
const uiSound = {
  grab: () => blip(1400, 0.025, 0.04),
  release: () => blip(900, 0.04, 0.035),
  tick: (strong: boolean) => strong ? blip(2600, 0.02, 0.05, 'triangle') : blip(3400, 0.008, 0.018, 'triangle'),
}

export function useSound() {
  return {
    addStem, unlock, setVolume, setMuted, defaultLevel, setLevel, setDream, readMeters, uiSound, voice, cutoff,
    isFilterStem: (id: string) => FILTER_STEMS.has(id),
    levels: readonly(levels), dream: readonly(dream), volume: readonly(volume), muted: readonly(muted), playing: readonly(playing),
  }
}
