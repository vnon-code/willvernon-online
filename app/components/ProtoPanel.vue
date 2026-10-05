<script setup lang="ts">
import { applyFx, type FxParams } from '~/composables/useProtoFx'
// PROTOTYPE (/proto) — throwaway. The variant switcher: yellow on purpose, so it never reads as part of the design.
// One row per decision (Will tests each, screenshots his picks); ★ marks Claude's pick from the scoring loop.
const { v, set } = useProto()
const { params, field } = useProtoFx()
const open = ref(true)
const LABELS: Record<string, string> = {
  medium: 'Medium', restrained: 'Restrained', expressive: 'Expressive', glide: 'Glide', morph: 'Morph', stagger: 'Stagger',
  fade: 'Fade', slide: 'Slide', scramble: 'Scramble', none: 'None', lift: 'Lift', tilt: 'Tilt', now: 'Now', ease: 'Ease',
  cascade: 'Cascade', pill: 'Pill', press: 'Press', magnetic: 'Magnetic', ripple: 'Ripple', pulse: 'Pulse', cursor: 'Cursor',
  bar: 'Bar', lit: 'Lit', litTint: 'Lit tint', tint: 'Tint', bevel: 'Bevel', shrink: 'Shrink', halo: 'Halo', rim: 'Rim', shadow: 'Shadow', halftone: 'Halftone', s30: '30px', s32: '32px', s34: '34px', s36: '36px', s38: '38px', swap: 'Swap', box: 'Box', bare: 'Bare', dot: 'Dot', line: 'Outline', underline: 'Underline', plate: 'Plate', tiles: 'Tiles', same: 'Same', small: 'Small', tiny: 'Tiny', hug: 'Hug', rise: 'Rise', anchored: 'Anchored', bright: 'Breath Bright', smooth: 'Smooth', ticks: 'Ticks', ticksFast: 'Ticks fast', ticksSlow: 'Ticks slow', blipSoft: 'Blip soft',
  blipTick: 'Blip tick', pulseSoft: 'Pulse soft', pulseLow: 'Pulse low', tickHi: 'Tick hi', blip: 'Blip', soft: 'Soft', muted: 'Muted', tick: 'Tick', double: 'Double', bloom: 'Breath Bloom', musical: 'Musical', tactile: 'Tactile', glitch: 'Glitch', off: 'Off',
}
const ROWS: { key: Exclude<keyof typeof PROTO_OPTIONS, 'info'>, label: string }[] = [
  { key: 'motion', label: 'Motion' }, { key: 'change', label: 'Boxes' }, { key: 'name', label: 'Name' },
  { key: 'card', label: 'Card' }, { key: 'drawer', label: 'Drawers' }, { key: 'chips', label: 'Chips' },
  { key: 'header', label: 'Header' }, { key: 'field', label: 'Field' }, { key: 'colour', label: 'Colour' }, { key: 'progress', label: 'Timer' }, { key: 'tagStyle', label: 'Tag' }, { key: 'nameStyle', label: 'Name box' }, { key: 'toolsStyle', label: 'Tools' }, { key: 'sides', label: 'Sides' }, { key: 'rowMotion', label: 'Row motion' }, { key: 'edges', label: 'Edges' }, { key: 'behind', label: 'Behind' },
  { key: 'sound', label: 'Sound' }, { key: 'drawerSfx', label: 'Drawer ♪' }, { key: 'sheetSfx', label: 'Sheet ♪' },
  { key: 'hoverSfx', label: 'Hover ♪' }, { key: 'stepSfx', label: 'Step ♪' }, { key: 'chipSfx', label: 'Chip ♪' },
]
// Rows Will has decided show as one line; only rows with a choice left get buttons
const open_ = ROWS.filter(r => PROTO_OPTIONS[r.key].length > 1)
const locked = ROWS.filter(r => PROTO_OPTIONS[r.key].length === 1).map(r => `${r.label} ${label(PROTO_OPTIONS[r.key][0])}`).join(' · ')
function label(o: string) { return LABELS[o] ?? o[0]!.toUpperCase() + o.slice(1) }
// Options and loop values onto <html>; `window.__fx(values)` lets the scoring loop move them
onMounted(() => {
  watch([v, params], () => applyFx(v.value, params), { deep: true, immediate: true })
  Object.assign(window, { __fx: (o: Partial<FxParams>) => Object.assign(params, o), __fxSet: set, __fxHold: (ms: number) => { field.hold = ms }, __fxField: field })
})
</script>

<template>
  <aside class="pp" aria-label="Prototype variants">
    <button class="pp__head" type="button" :aria-expanded="open" @click="open = !open">
      Proto {{ open ? '–' : '+' }}
    </button>
    <template v-if="open">
      <div v-for="r in open_" :key="r.key" class="pp__row" role="group" :aria-label="r.label">
        <span>{{ r.label }}</span>
        <button
          v-for="o in PROTO_OPTIONS[r.key]"
          :key="o"
          type="button"
          :aria-pressed="v[r.key] === o"
          @click="set(r.key, o as never)"
        >
          {{ label(o) }}{{ PROTO_PICKS[r.key] === o ? ' ★' : '' }}
        </button>
      </div>
      <p class="pp__locked">
        Locked: {{ locked }}
      </p>
      <p class="pp__hint">
        ★ = Claude's pick. Sound plays once you unmute (top right). Click the centre card for the Sheet
      </p>
    </template>
  </aside>
</template>

<style scoped>
.pp {
  position: fixed;
  top: 72px;
  left: 16px;
  z-index: 6000;
  display: grid;
  gap: 6px;
  padding: 8px;
  font: 600 11px/1 var(--font-ui);
  color: #111;
  background: #ffd400;
  box-shadow: 0 4px 16px rgb(0 0 0 / 0.4);
}

.pp__head {
  justify-self: start;
  padding: 2px 0;
  font: inherit;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.pp__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  max-width: 660px;
}

.pp__row span {
  width: 52px;
}

.pp__row button {
  padding: 5px 7px;
  font: inherit;
  color: inherit;
  background: none;
  border: 1px solid #111;
  cursor: pointer;
}

.pp__row button[aria-pressed='true'] {
  color: #ffd400;
  background: #111;
}

.pp__locked {
  max-width: 420px;
  margin: 2px 0 0;
  font-weight: 500;
  line-height: 1.4;
}

.pp__hint {
  margin: 2px 0 0;
  font-weight: 500;
}

.pp button:focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
}
</style>

<style>
/* PROTOTYPE Edges (round 24): one border system for every framed surface — strip cards, the info row's plates and
   tiles, the chip capsule, header buttons, drawer tabs and panels, the Sheet. Unscoped so it reaches every component;
   'now' leaves each component's own hairline (10–18%). */
@property --c-field {
  syntax: '<color>';
  inherits: true;
  initial-value: #888;
}

:root {
  transition: --c-field 1.2s ease-out; /* the field's accent, set by TheDotField */
}

/* lit: light from above — a brighter top edge, the sides quieter, almost nothing at the bottom */
:root[data-fx-edges='lit'] :is(.hug__bg:not(.hug--tools .hug__bg), .proto-tools .tools li, .chips, .header__logo, .header__mute, .header__links, .dock__tab, .ex__layer, .ex__close),
:root[data-fx-edges='lit'] .panel::before {
  border-color: color-mix(in srgb, var(--c-fg) 12%, transparent) !important;
  border-top-color: color-mix(in srgb, var(--c-fg) 28%, transparent) !important;
  border-bottom-color: color-mix(in srgb, var(--c-fg) 3%, transparent) !important;
}

/* the card's mat takes the same light, quieter: the teaser's own edge already separates it (judge) */
:root[data-fx-edges='lit'] .card,
:root[data-fx-edges='litTint'] .card {
  border-color: color-mix(in srgb, var(--c-fg) 6%, transparent) !important;
  border-top-color: color-mix(in srgb, var(--c-fg) 18%, transparent) !important;
  border-bottom-color: transparent !important;
}

/* lit-tint: lit, with the top edge in the dot field's accent (eased between projects) */
:root[data-fx-edges='litTint'] :is(.hug__bg:not(.hug--tools .hug__bg), .proto-tools .tools li, .chips, .header__logo, .header__mute, .header__links, .dock__tab, .ex__layer, .ex__close),
:root[data-fx-edges='litTint'] .panel::before {
  border-color: color-mix(in srgb, var(--c-fg) 12%, transparent) !important;
  border-top-color: color-mix(in srgb, var(--c-field) 20%, transparent) !important;
  border-bottom-color: color-mix(in srgb, var(--c-fg) 3%, transparent) !important;
}

:root[data-fx-edges='litTint'] .card {
  border-top-color: color-mix(in srgb, var(--c-field) 24%, transparent) !important;
}

/* tint: every hairline in the field's accent */
:root[data-fx-edges='tint'] :is(.hug__bg:not(.hug--tools .hug__bg), .proto-tools .tools li, .chips, .header__logo, .header__mute, .header__links, .dock__tab, .ex__layer, .ex__close),
:root[data-fx-edges='tint'] .panel::before,
:root[data-fx-edges='tint'] .card {
  border-color: color-mix(in srgb, var(--c-field) 10%, transparent) !important;
}

/* bevel: a faint hairline, a lit top inner edge, a dark bottom inner edge and a soft shadow underneath */
:root[data-fx-edges='bevel'] :is(.hug__bg:not(.hug--tools .hug__bg), .proto-tools .tools li, .chips, .header__logo, .header__mute, .header__links, .dock__tab, .ex__layer, .ex__close),
:root[data-fx-edges='bevel'] .panel::before,
:root[data-fx-edges='bevel'] .card {
  border-color: color-mix(in srgb, var(--c-fg) 9%, transparent) !important;
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--c-fg) 16%, transparent), inset 0 -1px 0 rgb(0 0 0 / 0.4), 0 6px 12px -6px rgb(0 0 0 / 0.6) !important;
}
</style>
