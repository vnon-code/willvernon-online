<script setup lang="ts">
// One fader band of the Sound HUD (docs/specs/sound-hud.md, dkton Leistungen reference).
// Drag up/down sets the level, a click toggles off/on, and it's a keyboard slider.
const props = withDefaults(defineProps<{
  label: string
  value: number // 0–1
  format?: (v: number) => string // readout; defaults to 0–100
  valueText?: (v: number) => string // what screen readers hear; defaults to "80%"
  tone?: 'plain' | 'dream'
  hidden?: boolean // entrance: the fill sits at 0 until revealed
}>(), {
  format: (v: number) => String(Math.round(v * 100)),
  valueText: (v: number) => `${Math.round(v * 100)}%`,
  tone: 'plain',
  hidden: false,
})
const emit = defineEmits<{ change: [value: number] }>()

const { uiSound } = useSound()
const el = ref<HTMLElement>()
const dragging = ref(false)
let last = props.value > 0 ? props.value : 0.8 // where a click brings it back to

const shown = computed(() => (props.hidden ? 0 : props.value))
const readout = computed(() => (props.value === 0 ? 'off' : props.format(props.value)))

function set(v: number) {
  v = Math.min(1, Math.max(0, v))
  if (v === props.value) return
  const step = Math.floor(v * 10)
  if (step !== Math.floor(props.value * 10)) uiSound.tick(v === 0 || v === 1 || step === 5)
  if (v > 0) last = v
  emit('change', v)
}
const toggle = () => set(props.value === 0 ? last : 0)

let startY = 0
let startV = 0
let moved = false
function onDown(e: PointerEvent) {
  el.value!.setPointerCapture(e.pointerId)
  startY = e.clientY
  startV = props.value
  moved = false
  dragging.value = true
  uiSound.grab()
}
function onMove(e: PointerEvent) {
  if (!dragging.value) return
  const dy = startY - e.clientY
  if (Math.abs(dy) > 3) moved = true
  if (moved) set(startV + dy / el.value!.clientHeight)
}
function onUp(e: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  el.value!.releasePointerCapture(e.pointerId)
  if (!moved) toggle()
  uiSound.release()
}

const KEY_STEPS: Record<string, number> = { ArrowUp: 0.05, ArrowRight: 0.05, ArrowDown: -0.05, ArrowLeft: -0.05, PageUp: 0.2, PageDown: -0.2 }
function onKey(e: KeyboardEvent) {
  const step = KEY_STEPS[e.key]
  if (step !== undefined) set(props.value + step)
  else if (e.key === 'Home') set(0)
  else if (e.key === 'End') set(1)
  else if (e.key === 'Enter' || e.key === ' ') toggle()
  else return
  e.preventDefault()
}

defineExpose({ el })
</script>

<template>
  <div
    ref="el"
    class="band"
    :class="[`band--${tone}`, { 'band--off': value === 0, 'band--dragging': dragging }]"
    :style="{ '--l': shown }"
    role="slider"
    tabindex="0"
    :aria-label="label"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(value * 100)"
    :aria-valuetext="value === 0 ? 'off' : valueText(value)"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
    @keydown="onKey"
  >
    <div class="band__face band__face--base" aria-hidden="true">
      <span>{{ label }}</span><span class="band__value">{{ readout }}</span>
    </div>
    <div class="band__fill" aria-hidden="true">
      <div class="band__face">
        <span>{{ label }}</span><span class="band__value">{{ readout }}</span>
      </div>
    </div>
    <i class="band__meter" aria-hidden="true" />
  </div>
</template>

<style scoped>
.band {
  position: relative;
  width: 52px;
  height: 128px;
  border: 1px solid var(--hud-line);
  overflow: hidden;
  cursor: ns-resize;
  touch-action: none;
  user-select: none;
  outline: none;
}

.band:focus-visible {
  outline: 1px solid var(--c-fg);
  outline-offset: 2px;
}

.band__face {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 6px 7px;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.band__value {
  font-variant-numeric: tabular-nums;
  opacity: 0.7;
}

.band--off .band__face--base {
  color: var(--hud-muted);
}

/* The fill rises to the level and the text inverts over it */
.band__fill {
  position: absolute;
  inset: 0;
  background: var(--c-fg);
  color: var(--c-bg);
  clip-path: inset(calc((1 - var(--l)) * 100%) 0 0 0);
  transition: clip-path var(--band-dur, 0.12s) var(--ease-out-expo) var(--band-delay, 0s);
}

.band--dragging .band__fill {
  transition: none;
}

.band--dream .band__fill {
  background: var(--c-red);
  color: var(--c-white);
}

/* Live level, written per frame by the HUD as --m */
.band__meter {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 2px;
  height: calc(var(--m, 0) * 100%);
  background: var(--c-red);
}

@media (max-width: 640px) {
  .band {
    flex: 1;
    width: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .band__fill {
    transition: none;
  }
}
</style>
