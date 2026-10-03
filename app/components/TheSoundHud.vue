<script setup lang="ts">
import stems from '~~/content/stems.json'
import tracks from '~~/content/tracks.json'
import SoundBand from './SoundBand.vue'

// The Sound HUD (docs/specs/sound-hud.md; reference prototype/sound-hud.html?v=A).
// Mounted once the Landing has faded up. Only the opening track for now; no track switching.
const props = defineProps<{ withSound: boolean }>()
const sound = useSound()
const track = tracks.tracks.find(t => t.title.includes('Silver Linings'))!
const stemList = Object.entries(stems.stemsConfig).map(([id, s]) => ({ id, name: s.name }))

const hz = (v: number) => {
  const f = sound.cutoff(v)
  return f >= 1000 ? `${(f / 1000).toFixed(1)}k` : String(Math.round(f))
}
const hzText = (v: number) => `cutoff ${hz(v)} hertz`

// Entrance "Build" (Will, 2026-10-03; prototype/hud-entrance.html?o=2): the glass fades in, each band grows up
// from its bottom edge 60ms apart, its fill follows, and the track card slides up last. The CSS keyframes run
// on mount; the fills are a transition, so they're held at 0 until FILL_START.
const FILL_START = 450 // ms
const revealed = ref(false)
const entering = ref(true)
const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
const timers: number[] = []

// Meters: the HUD writes each stem's live level straight into its band as --m
const bands: Record<string, InstanceType<typeof SoundBand>> = {}
const meters: Record<string, number> = {}
let raf = 0
function frame() {
  if (sound.playing.value) {
    sound.readMeters(meters)
    for (const id in meters) bands[id]?.el?.style.setProperty('--m', meters[id]!.toFixed(3))
  }
  raf = requestAnimationFrame(frame)
}

onMounted(() => {
  const fillCount = stemList.length + 2
  const entranceMs = reduced ? 300 : FILL_START + fillCount * 60 + 800
  // Entered with sound: once the entrance is done, VOL rises from 0 to 80% (the Gate click already unlocked the audio)
  if (props.withSound) timers.push(window.setTimeout(riseVolume, entranceMs))
  if (reduced) {
    revealed.value = true
    entering.value = false
  }
  else {
    timers.push(
      window.setTimeout(() => (revealed.value = true), FILL_START),
      window.setTimeout(() => (entering.value = false), entranceMs),
    )
  }
  raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  cancelAnimationFrame(raf)
  cancelAnimationFrame(riseRaf)
})

// VOL's slow rise: the fader and the music move together. Gain is level², so the start is gentle.
// PLACEHOLDER duration (Claude's pick): 3s, ease-in-out. Touching VOL stops the rise.
const VOL_RISE_MS = 3000
const VOL_TARGET = 0.8
let riseRaf = 0
function riseVolume() {
  const t0 = performance.now()
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / VOL_RISE_MS)
    sound.setVolume(VOL_TARGET * inOutCubic(p))
    if (p < 1) riseRaf = requestAnimationFrame(step)
  }
  riseRaf = requestAnimationFrame(step)
}
function onVolume(v: number) {
  cancelAnimationFrame(riseRaf)
  sound.setVolume(v)
}

const enterStyle = (i: number) => ({ '--i': i, ...(entering.value && { '--band-dur': '0.8s', '--band-delay': `${i * 60}ms` }) })
</script>

<template>
  <section class="hud" aria-label="Sound controls">
    <div class="hud__bands">
      <SoundBand
        v-for="(s, i) in stemList"
        :key="s.id"
        :ref="(c) => { if (c) bands[s.id] = c as InstanceType<typeof SoundBand> }"
        :label="s.name"
        :value="sound.levels[s.id] ?? sound.defaultLevel(s.id)"
        :format="sound.isFilterStem(s.id) ? hz : undefined"
        :value-text="sound.isFilterStem(s.id) ? hzText : undefined"
        :hidden="!revealed"
        :style="enterStyle(i)"
        @change="(v) => sound.setLevel(s.id, v)"
      />
      <span class="hud__divider" aria-hidden="true" />
      <SoundBand
        label="Dream"
        tone="dream"
        :value="sound.dream.value"
        :hidden="!revealed"
        :style="enterStyle(stemList.length)"
        @change="sound.setDream"
      />
      <SoundBand
        label="Vol"
        :value="sound.volume.value"
        :hidden="!revealed"
        :style="enterStyle(stemList.length + 1)"
        @change="onVolume"
      />
    </div>
    <div class="hud__track">
      <img :src="track.artwork" :alt="`${track.title} artwork`" width="40" height="40">
      <div class="hud__meta">
        <b>{{ track.title }}</b>
        <small>{{ track.desc }}</small>
      </div>
      <!-- Reserved for prev/next once more tracks have stems -->
    </div>
  </section>
</template>

<style scoped>
.hud {
  --hud-line: color-mix(in srgb, var(--c-fg) 18%, transparent);
  --hud-muted: color-mix(in srgb, var(--c-fg) 55%, transparent);
  position: fixed;
  left: 50%;
  bottom: 16px;
  translate: -50% 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
}

/* The glass sits on its own layer so it can fade in before the bands build */
.hud::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--hud-line);
  animation: hud-fade 0.5s ease-out both;
}

.hud__bands > .band {
  animation: hud-grow 0.6s var(--ease-out-expo) calc(150ms + var(--i) * 60ms) both;
}

.hud__divider {
  animation: hud-fade 0.4s ease-out 0.3s both;
}

.hud__track {
  animation: hud-rise 0.6s var(--ease-out-expo) 0.7s both;
}

@keyframes hud-fade {
  from { opacity: 0; }
}

@keyframes hud-grow {
  from { clip-path: inset(100% 0 0 0); }
  to { clip-path: inset(0 0 0 0); }
}

@keyframes hud-rise {
  from { opacity: 0; translate: 0 10px; }
}

/* Reduced motion: the whole panel fades in with the bands already at their levels */
@media (prefers-reduced-motion: reduce) {
  .hud {
    animation: hud-fade 0.3s ease-out both;
  }

  .hud::before,
  .hud__bands > .band,
  .hud__divider,
  .hud__track {
    animation: none;
  }
}

.hud__bands {
  display: flex;
  gap: 4px;
}

.hud__divider {
  flex: none;
  width: 1px;
  margin: 0 4px;
  background: var(--hud-line);
}

.hud__track {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 6px;
  border-top: 1px solid var(--hud-line);
}

.hud__track img {
  display: block;
  flex: none;
  width: 40px;
  height: 40px;
  object-fit: cover;
}

/* width: 0 keeps the card from widening the panel past the bands */
.hud__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  width: 0;
  min-width: 0;
}

.hud__meta b,
.hud__meta small {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.hud__meta b {
  font-size: 12px;
  font-weight: 500;
}

.hud__meta small {
  font-size: 11px;
  color: var(--hud-muted);
}

@media (max-width: 640px) {
  .hud {
    left: 16px;
    right: 16px;
    translate: none;
  }
}
</style>
