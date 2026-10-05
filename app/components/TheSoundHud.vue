<script setup lang="ts">
import stems from '~~/content/stems.json'
import tracks from '~~/content/tracks.json'
import SoundBand from './SoundBand.vue'

// The Sound HUD (docs/specs/sound-hud.md; reference prototype/sound-hud.html?v=A), in the bottom-right drawer.
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

// First-open entrance: HudDrawer fades the glass in and rises the bands one after another (as on every open);
// then the fills rise to their levels 60ms apart (from "Build", Will, 2026-10-03). The fills are a transition, so
// they're held at 0 until FILL_START.
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

const fillCount = stemList.length + 2
const entranceMs = reduced ? 300 : FILL_START + fillCount * 60 + 800
function startEntrance() {
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
}

onMounted(() => {
  // Entered with sound: VOL rises from 0 to 100% once the tab is in (the Gate click already unlocked the audio)
  if (props.withSound) timers.push(window.setTimeout(riseVolume, reduced ? 300 : 600))
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
const VOL_TARGET = 1 // Will, 2026-10-04: full volume on the sound path (was 0.8)
let riseRaf = 0
function riseVolume() {
  const t0 = performance.now()
  let set = sound.volume.value
  const step = (now: number) => {
    if (sound.volume.value !== set || sound.muted.value) return // changed elsewhere, or muted: stop rising
    const p = Math.min(1, (now - t0) / VOL_RISE_MS)
    set = VOL_TARGET * inOutCubic(p)
    sound.setVolume(set)
    if (p < 1) riseRaf = requestAnimationFrame(step)
  }
  riseRaf = requestAnimationFrame(step)
}
function onVolume(v: number) {
  cancelAnimationFrame(riseRaf)
  sound.setVolume(v)
  if (v > 0 && sound.muted.value) sound.setMuted(false) // raising VOL while muted means "I want to hear it"
}

const enterStyle = (i: number) => ({ '--i': i, ...(entering.value && { '--band-dur': '0.8s', '--band-delay': `${i * 60}ms` }) })
</script>

<template>
  <HudDrawer id="sound-hud" side="right" label="Sound controls" @first-open="startEntrance">
    <template #icon>
      <!-- Beamed eighth notes -->
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <path d="M6 12.5V3.5l8-1.5v9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        <ellipse cx="4.25" cy="12.5" rx="2.25" ry="1.75" fill="currentColor" />
        <ellipse cx="12.25" cy="11" rx="2.25" ry="1.75" fill="currentColor" />
      </svg>
    </template>
    <template #bands>
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
      <span class="drawer-divider" aria-hidden="true" />
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
    </template>
    <template #foot>
      <img class="track__art" :src="track.artwork" :alt="`${track.title} artwork`" width="40" height="40">
      <div class="track__meta">
        <b>{{ track.title }}</b>
        <small>{{ track.desc }}</small>
      </div>
      <!-- Reserved for prev/next once more tracks have stems -->
    </template>
  </HudDrawer>
</template>

<style scoped>
.track__art {
  display: block;
  flex: none;
  width: 40px;
  height: 40px;
  object-fit: cover;
}

/* width: 0 keeps the card from widening the panel past the bands */
.track__meta {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  width: 0;
  min-width: 0;
}

.track__meta b,
.track__meta small {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.track__meta b {
  font-size: 12px;
  font-weight: 500;
}

.track__meta small {
  font-size: 11px;
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
}
</style>
