<script setup lang="ts">
import SoundBand from './SoundBand.vue'

// The Visuals HUD (Will, 2026-10-04), in the bottom-left drawer: the same bands as the Sound HUD, but they tune
// the dot background live. DREAM is the same control as in the Sound HUD (one value, both drawers).
// Presets run along the foot. PLACEHOLDER: band choice, ranges and labels are Claude's picks from the prototype.
const sound = useSound()
const { v, preset, band, setBand, apply } = useVisuals()

const BANDS = [
  { key: 'scale', label: 'Zoom', format: () => v.value.scale.toFixed(1) },
  { key: 'warp', label: 'Warp', format: () => v.value.warp.toFixed(1) },
  { key: 'speed', label: 'Speed', format: () => v.value.speed.toFixed(1) },
  { key: 'cell', label: 'Grid', format: () => String(Math.round(v.value.cell)) },
  { key: 'dmax', label: 'Dots', format: () => String(Math.round(v.value.dmax * 100)) },
  { key: 'level', label: 'Bright', format: () => String(Math.round(v.value.level * 100)) },
] as const
const presetNames = Object.keys(VISUAL_PRESETS)
</script>

<template>
  <HudDrawer id="visual-hud" side="left" label="Visual controls">
    <template #icon>
      <!-- A 3×3 dot grid, dots growing to the corner -->
      <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
        <circle cx="3" cy="3" r="1" fill="currentColor" />
        <circle cx="8" cy="3" r="1.4" fill="currentColor" />
        <circle cx="13" cy="3" r="1.8" fill="currentColor" />
        <circle cx="3" cy="8" r="1.4" fill="currentColor" />
        <circle cx="8" cy="8" r="1.8" fill="currentColor" />
        <circle cx="13" cy="8" r="2.2" fill="currentColor" />
        <circle cx="3" cy="13" r="1.8" fill="currentColor" />
        <circle cx="8" cy="13" r="2.2" fill="currentColor" />
        <circle cx="13" cy="13" r="2.6" fill="currentColor" />
      </svg>
    </template>
    <template #bands>
      <SoundBand
        v-for="(b, i) in BANDS"
        :key="b.key"
        :label="b.label"
        :value="band(b.key)"
        :format="b.format"
        :value-text="b.format"
        :style="{ '--i': i }"
        @change="(n) => setBand(b.key, n)"
      />
      <span class="drawer-divider" aria-hidden="true" />
      <SoundBand
        label="Dream"
        tone="dream"
        :value="sound.dream.value"
        :style="{ '--i': BANDS.length }"
        @change="sound.setDream"
      />
    </template>
    <template #foot>
      <div class="presets" role="group" aria-label="Background presets">
        <button
          v-for="name in presetNames"
          :key="name"
          class="preset"
          type="button"
          :aria-pressed="preset === name"
          @click="apply(name)"
        >
          {{ name }}
        </button>
      </div>
    </template>
  </HudDrawer>
</template>

<style scoped>
.presets {
  display: flex;
  gap: 4px;
  width: 100%;
}

.preset {
  flex: 1 1 auto;
  height: 28px;
  padding: 0 6px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
  background: none;
  border: 1px solid color-mix(in srgb, var(--c-fg) 18%, transparent);
  cursor: pointer;
  transition: color 0.16s ease, border-color 0.16s ease, background-color 0.16s ease;
}

.preset[aria-pressed='true'] {
  color: var(--c-bg);
  background: var(--c-fg);
  border-color: var(--c-fg);
}

.preset:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .preset:hover {
    color: var(--c-fg);
    border-color: color-mix(in srgb, var(--c-fg) 45%, transparent);
  }
}
</style>
