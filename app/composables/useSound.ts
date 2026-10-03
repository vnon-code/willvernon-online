// Native Web Audio engine for the opening track's stems (ADR-0001).
// Stems are decoded during the Gate's load, but nothing plays until sound is enabled.
// The AudioContext is only created inside a click handler (browser autoplay rules).

const buffers = new Map<string, AudioBuffer>()
const soundOn = ref(false)
let ctx: AudioContext | null = null
let master: GainNode | null = null
let started = false

// Decoding needs no live context, so an OfflineAudioContext avoids the autoplay warning
let decoder: OfflineAudioContext | null = null

async function addStem(id: string, data: ArrayBuffer) {
  decoder ??= new OfflineAudioContext(2, 1, 48000)
  buffers.set(id, await decoder.decodeAudioData(data))
}

// Call from a click handler. Once unlocked, the context keeps running, so playback can start later.
function unlock() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
  }
  void ctx.resume()
}

// fade = seconds for the music to fade in (0 = instant). Needs unlock() first, or a click to call it from.
function enableSound(fade = 0) {
  unlock()
  if (!buffers.size || !ctx) return
  const now = ctx.currentTime
  master!.gain.cancelScheduledValues(now)
  master!.gain.setValueAtTime(fade ? 0 : 1, now)
  if (fade) master!.gain.linearRampToValueAtTime(1, now + fade)

  if (!started) {
    started = true
    const at = now + 0.05 // start every stem on the same sample
    for (const buffer of buffers.values()) {
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      src.connect(master!)
      src.start(at)
    }
  }
  soundOn.value = true
}

function mute() {
  if (!ctx || !master) return
  master.gain.setValueAtTime(0, ctx.currentTime)
  soundOn.value = false
}

export function useSound() {
  return { addStem, unlock, enableSound, mute, soundOn: readonly(soundOn) }
}
