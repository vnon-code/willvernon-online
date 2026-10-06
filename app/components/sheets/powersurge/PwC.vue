<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, FILM, FILM_SECONDS, INFO, PB, PS, TD, VERSIONS } from './story'

// PROTOTYPE PwC "Control surface" (overnight run, Powersurge r1). The project ended as a slider tool, so the page is
// one: the first view is a preset bank (four renders as pads beside a big monitor that swaps to the one picked) →
// 01 Versions: V1, V2, V5 as pads that set range bars for size, speed, lifetime and particles, the book's page beside
// → 02 Patch: a pin matrix (FLOPs data or a fixed value, into size, chaos, red, green, blue); a pin shows its
// operator → 03 Arrangement: the edit as DAW lanes across 5:35 (frames on the video lane at their seconds, the
// particles going purple then red at the end, FLOPs timeline, year, music) → 04 Output: the climax beside the tool.
// Refs: Teenage Engineering product pages (hardware controls as the layout), the EMS Synthi pin matrix, Ableton
// Live's arrangement view, TouchDesigner's own parameter panels. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwc', [
  { id: 'versions', label: 'Versions' },
  { id: 'patch', label: 'Patch' },
  { id: 'edit', label: 'Arrangement' },
  { id: 'out', label: 'Output' },
])

// First view: the preset bank
const PRESETS = [
  { k: 'Sphere', p: TD.sphere },
  { k: 'Blue', p: TD.blue },
  { k: 'Purple', p: TD.purple },
  { k: 'Red', p: TD.red },
]
const preset = ref(3)

// 01 Versions: range bars on fixed scales
const ver = ref(0)
const v = computed(() => VERSIONS[ver.value]!)
type Bar = { k: string, max: number, val: readonly number[] | number | null, unit?: string }
const bars = computed<Bar[]>(() => [
  { k: 'Size', max: 10, val: v.value.size },
  { k: 'Speed', max: 0.2, val: v.value.speed },
  { k: 'Lifetime', max: 20, val: v.value.life },
  { k: 'Particles', max: 1000, val: v.value.particles },
])
const span = (b: Bar) => {
  if (b.val == null) return null
  const [a, z] = Array.isArray(b.val) ? b.val : [0, b.val as number]
  const lo = Math.min(a, z) / b.max
  const hi = Math.max(a, z) / b.max
  return { left: `${lo * 100}%`, width: `${Math.max(hi - lo, 0.012) * 100}%` }
}
const label = (b: Bar) => b.val == null ? 'Not listed' : Array.isArray(b.val) ? `${b.val[0]} → ${b.val[1]}` : String(b.val)

// 02 Patch: sources × parameters
const SOURCES = ['FLOPs data', 'Fixed']
const PARAMS = ['Size', 'Chaos', 'Red', 'Green', 'Blue']
const PINS: Record<string, { op: string, does: string }> = {
  'FLOPs data/Size': { op: 'Math, multiply', does: 'Size grows with the data.' },
  'FLOPs data/Chaos': { op: 'Post Add', does: 'A renamed parameter. Post Add inverts the shape.' },
  'FLOPs data/Red': { op: 'Level', does: 'Red rises first: a red tint.' },
  'FLOPs data/Green': { op: 'Level', does: 'Green rises with it, so the end goes white and the bloom shows.' },
  'Fixed/Blue': { op: 'Level', does: 'Blue stays fixed the whole film.' },
}
const pin = ref('FLOPs data/Size')

// 03 Arrangement: frames on the video lane at their seconds; lanes across 5:35
const pct = (s: number) => `${(s / FILM_SECONDS) * 100}%`
// Each frame hangs from its second: the 2018 frame ends at it, the 2020 frame starts at it, so they don't overlap
const FRAMES = [{ ...FILM.title, a: '0' }, { ...FILM.y1997, a: '-50%' }, { ...FILM.y2018, a: '-100%' }, { ...FILM.y2020, a: '0' }]
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const LANES = [
  { k: 'Particles', who: 'TouchDesigner', cls: 'ln--td' },
  { k: 'FLOPs timeline', who: 'After Effects', cls: 'ln--ae' },
  { k: 'Year', who: 'Suyash Sunar', cls: 'ln--yr' },
  { k: '"The End"', who: 'C418', cls: 'ln--mu' },
]
const RULER = [0, 60, 120, 180, 240, 300]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwc">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <div class="bank">
            <div class="bank__mon">
              <img
                v-for="(x, i) in PRESETS"
                :key="x.k"
                :class="{ on: preset === i }"
                :src="x.p.src"
                :alt="preset === i ? x.p.alt : ''"
                :aria-hidden="preset !== i"
                :width="x.p.w"
                :height="x.p.h"
                loading="lazy"
                decoding="async"
              >
            </div>
            <div class="bank__pads" role="group" aria-label="Renders">
              <button v-for="(x, i) in PRESETS" :key="x.k" type="button" class="bank__pad" :aria-pressed="preset === i" @click="preset = i">
                <img :src="x.p.src" alt="" :width="x.p.w" :height="x.p.h" loading="lazy" decoding="async">
                <span>{{ String(i + 1).padStart(2, '0') }} {{ x.k }}</span>
              </button>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Versions: pads set the range bars -->
      <section class="vs" v-bind="sec('versions')" data-sheet-block="versions">
        <SheetSectionNo id="versions" />
        <div class="vs__grid">
          <div class="vs__ctl">
            <div class="vs__pads" role="group" aria-label="Version">
              <button v-for="(x, i) in VERSIONS" :key="x.id" type="button" class="vs__pad" :aria-pressed="ver === i" @click="ver = i">
                {{ x.id }}
              </button>
            </div>
            <ul class="vs__bars" aria-live="polite">
              <li v-for="b in bars" :key="b.k" class="vs__bar">
                <span class="pwc__k">{{ b.k }}</span>
                <span class="vs__track" aria-hidden="true">
                  <i v-if="span(b)" :style="span(b)!" />
                </span>
                <span class="vs__val">{{ label(b) }}</span>
              </li>
            </ul>
            <p class="pwc__cap">
              {{ ver === 2 ? 'Final. The book shows its frames but lists no values.' : PS.limits }}
            </p>
          </div>
          <img class="vs__page" :src="v.page.src" :alt="v.page.alt" :width="v.page.w" :height="v.page.h" decoding="async">
        </div>
      </section>

      <!-- 02 Patch: the pin matrix -->
      <section class="pt" v-bind="sec('patch')" data-sheet-block="patch">
        <SheetSectionNo id="patch" />
        <div class="pt__grid">
          <table class="mx">
            <caption class="pwc__cap mx__cap">
              Source × parameter. Pick a pin.
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span class="sr-only">Source</span>
                </th>
                <th v-for="p in PARAMS" :key="p" scope="col">
                  {{ p }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in SOURCES" :key="s">
                <th scope="row">
                  {{ s }}
                </th>
                <td v-for="p in PARAMS" :key="p">
                  <button
                    v-if="PINS[`${s}/${p}`]"
                    type="button"
                    class="mx__pin"
                    :class="{ on: pin === `${s}/${p}` }"
                    :aria-pressed="pin === `${s}/${p}`"
                    :aria-label="`${s} to ${p}`"
                    @click="pin = `${s}/${p}`"
                  />
                  <span v-else class="mx__hole" aria-hidden="true" />
                </td>
              </tr>
            </tbody>
          </table>
          <div class="pt__read" aria-live="polite">
            <span class="pwc__k">{{ pin.replace('/', ' → ') }}</span>
            <b class="pt__op">{{ PINS[pin]!.op }}</b>
            <p>{{ PINS[pin]!.does }}</p>
          </div>
        </div>
        <div class="pt__foot">
          <img :src="PB.mods.src" :alt="PB.mods.alt" :width="PB.mods.w" :height="PB.mods.h" loading="lazy" decoding="async">
          <p class="pwc__text">
            {{ PS.td }} {{ PS.noise }} {{ PS.lock }}
          </p>
        </div>
      </section>

      <!-- 03 Arrangement: DAW lanes across 5:35 -->
      <section class="ar" v-bind="sec('edit')" data-sheet-block="edit">
        <SheetSectionNo id="edit" />
        <div class="ar__daw" role="img" :aria-label="`The edit across 5:35: frames at ${FRAMES.map(f => mmss(f.t)).join(', ')}; lanes for the particles, the FLOPs timeline, the year and the music.`">
          <div class="ar__row">
            <span class="ar__lab" aria-hidden="true">Time</span>
            <div class="ar__ruler" aria-hidden="true">
              <span v-for="r in RULER" :key="r" :style="{ left: pct(r) }">{{ mmss(r) }}</span>
            </div>
          </div>
          <div class="ar__row">
            <span class="ar__lab" aria-hidden="true">Video</span>
            <div class="ar__vid">
              <span v-for="f in FRAMES" :key="f.t" class="ar__frame" :style="{ left: pct(f.t), transform: `translateX(${f.a})` }">
                <img :src="f.src" alt="" :width="f.w" :height="f.h" loading="lazy" decoding="async">
                <i>{{ mmss(f.t) }}</i>
              </span>
            </div>
          </div>
          <div v-for="l in LANES" :key="l.k" class="ar__row">
            <span class="ar__lab" aria-hidden="true"><b>{{ l.k }}</b>{{ l.who }}</span>
            <div class="ar__lane" :class="l.cls" />
          </div>
        </div>
        <div class="ar__notes">
          <p>{{ PS.ae }}</p>
          <p>{{ PS.premiere }}</p>
          <p>{{ PS.music }}</p>
        </div>
      </section>

      <!-- 04 Output: the climax beside the tool -->
      <section class="op" v-bind="sec('out')" data-sheet-block="out">
        <SheetSectionNo id="out" />
        <div class="op__grid">
          <figure>
            <video
              class="op__video"
              :src="CLIMAX.src"
              :poster="CLIMAX.poster"
              :width="CLIMAX.w"
              :height="CLIMAX.h"
              :aria-label="CLIMAX.alt"
              muted
              loop
              playsinline
              preload="none"
              data-in-view
            />
            <figcaption class="pwc__cap">
              {{ mmss(CLIMAX.from) }}–{{ mmss(CLIMAX.to) }}. {{ PS.out }}
            </figcaption>
          </figure>
          <figure>
            <img :src="PB.tool.src" :alt="PB.tool.alt" :width="PB.tool.w" :height="PB.tool.h" loading="lazy" decoding="async">
            <figcaption class="pwc__cap">
              {{ PS.tool }}
            </figcaption>
          </figure>
        </div>
      </section>

      <SheetCredits :items="PS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.pwc img,
.pwc video {
  display: block;
  width: 100%;
  height: auto;
}

.pwc figure {
  margin: 0;
}

.pwc__k {
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pwc__text {
  margin: 0;
  max-width: 48ch;
  font: 400 15px/1.55 var(--font-ui);
}

.pwc__cap {
  margin: 10px 0 0;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* First view: the monitor and its pads */
.bank {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  background: #000;
}

.bank__mon {
  position: relative;
  aspect-ratio: 16 / 9;
}

.bank__mon img {
  position: absolute;
  inset: 0;
  height: 100% !important;
  object-fit: cover;
  opacity: 0;
  transition: opacity 360ms cubic-bezier(0.23, 1, 0.32, 1);
}

.bank__mon img.on {
  opacity: 1;
}

.bank__pads {
  display: grid;
  grid-template-rows: repeat(4, minmax(0, 1fr));
  border-left: 1px solid var(--rule);
}

.bank__pad {
  position: relative;
  min-height: 0;
  padding: 0;
  border: 0;
  background: #000;
  cursor: pointer;
  overflow: hidden;
}

.bank__pad + .bank__pad {
  border-top: 1px solid var(--rule);
}

.bank__pad img {
  height: 100% !important;
  object-fit: cover;
  opacity: 0.5;
  transition: opacity 200ms ease;
}

.bank__pad:hover img,
.bank__pad[aria-pressed='true'] img {
  opacity: 1;
}

.bank__pad span {
  position: absolute;
  left: 8px;
  top: 6px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
}

.bank__pad[aria-pressed='true'] {
  box-shadow: inset 3px 0 0 var(--c-accent);
}

/* Sections: one frame, padding only (no gaps) */
.vs,
.pt,
.ar,
.op {
  padding: 28px 24px 36px;
  border-top: 1px solid var(--rule);
}

/* 01 Versions */
.vs__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px 40px;
  margin-top: 20px;
}

.vs__pads {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.vs__pad {
  aspect-ratio: 1.6;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: color-mix(in srgb, var(--c-fg) 4%, transparent);
  color: var(--c-fg);
  font: 700 22px/1 var(--font-ui);
  cursor: pointer;
  transition: background-color 160ms ease, transform 120ms ease;
}

.vs__pad:active {
  transform: scale(0.97);
}

.vs__pad[aria-pressed='true'] {
  border-color: var(--c-accent);
  background: var(--c-accent);
  color: #fff;
}

.vs__bars {
  display: grid;
  gap: 14px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.vs__bar {
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr) 90px;
  gap: 12px;
  align-items: center;
}

.vs__track {
  position: relative;
  height: 6px;
  background: color-mix(in srgb, var(--c-fg) 12%, transparent);
}

.vs__track i {
  position: absolute;
  top: 0;
  bottom: 0;
  background: var(--c-fg);
  transition: left 320ms cubic-bezier(0.23, 1, 0.32, 1), width 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.vs__val {
  font: 400 13px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  text-align: right;
}

/* 02 Patch */
.pt__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 24px 40px;
  align-items: center;
  margin-top: 20px;
}

.mx {
  border-collapse: collapse;
  font: 500 12px/1.2 var(--font-ui);
}

.mx__cap {
  caption-side: bottom;
  text-align: left;
}

.mx th {
  padding: 8px 10px;
  color: var(--muted);
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.mx tbody th {
  text-align: right;
  color: var(--c-fg);
  text-transform: none;
  white-space: nowrap;
}

.mx td {
  padding: 8px 10px;
  text-align: center;
  border: 1px solid var(--rule);
}

.mx__pin,
.mx__hole {
  display: inline-block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  vertical-align: middle;
}

.mx__hole {
  width: 8px;
  height: 8px;
  background: var(--rule);
}

.mx__pin {
  padding: 0;
  border: 2px solid var(--c-fg);
  background: transparent;
  cursor: pointer;
  transition: background-color 160ms ease, transform 120ms ease;
}

.mx__pin:hover {
  transform: scale(1.1);
}

.mx__pin.on {
  border-color: var(--c-accent);
  background: var(--c-accent);
}

.pt__read {
  display: grid;
  gap: 8px;
  padding-left: 20px;
  border-left: 2px solid var(--c-accent);
}

.pt__op {
  font: 700 clamp(24px, 3vw, 36px)/1 var(--font-ui);
  letter-spacing: -0.03em;
}

.pt__read p {
  margin: 0;
  max-width: 36ch;
  font: 400 15px/1.5 var(--font-ui);
}

.pt__foot {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 24px 40px;
  align-items: end;
  margin-top: 32px;
}

/* 03 Arrangement */
.ar__daw {
  display: grid;
  gap: 4px;
  margin-top: 20px;
  padding: 12px;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: color-mix(in srgb, var(--c-fg) 3%, transparent);
}

.ar__row {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.ar__lab {
  display: grid;
  gap: 2px;
  font: 400 12px/1.2 var(--font-ui);
  color: var(--muted);
}

.ar__lab b {
  font-weight: 600;
  color: var(--c-fg);
}

.ar__ruler {
  position: relative;
  height: 18px;
  border-bottom: 1px solid var(--rule);
}

.ar__ruler span {
  position: absolute;
  top: 0;
  padding-left: 4px;
  border-left: 1px solid var(--rule);
  font: 400 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.ar__vid {
  position: relative;
  height: 64px;
}

.ar__frame {
  position: absolute;
  top: 0;
  width: 10%;
}

.ar__frame img {
  border: 1px solid var(--rule);
}

.ar__frame i {
  display: block;
  margin-top: 2px;
  font: 400 11px/1 var(--font-ui);
  font-style: normal;
  color: var(--muted);
}

.ar__lane {
  height: 26px;
  border-radius: 3px;
}

.ln--td {
  background: linear-gradient(90deg, transparent 0, #2b33a8 4%, #3a3fd0 74%, #8a3fd8 84%, #e0465a 92%, #fff 98%, transparent 100%);
}

.ln--ae {
  background: linear-gradient(90deg, transparent 0, color-mix(in srgb, var(--c-fg) 30%, transparent) 4% 96%, transparent 100%);
}

.ln--yr {
  background: linear-gradient(90deg, transparent 0, color-mix(in srgb, var(--c-fg) 20%, transparent) 4% 96%, transparent 100%);
}

.ln--mu {
  background:
    repeating-linear-gradient(90deg, transparent 0 2px, var(--c-bg) 2px 3px),
    linear-gradient(90deg, color-mix(in srgb, var(--c-accent) 20%, transparent), var(--c-accent) 96%, transparent);
}

.ar__notes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px 32px;
  margin-top: 24px;
}

.ar__notes p {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
}

/* 04 Output */
.op__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 24px 32px;
  margin-top: 20px;
}

.op__video {
  aspect-ratio: 16 / 9;
  background: #000;
}

@media (prefers-reduced-motion: reduce) {
  .bank__mon img,
  .vs__track i,
  .vs__pad,
  .mx__pin {
    transition: none;
  }
}

@media (max-width: 720px) {
  .bank {
    grid-template-columns: minmax(0, 1fr);
  }

  .bank__pads {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-template-rows: none;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .bank__pad {
    aspect-ratio: 16 / 9;
  }

  .bank__pad + .bank__pad {
    border-top: 0;
    border-left: 1px solid var(--rule);
  }

  .vs,
  .pt,
  .ar,
  .op {
    padding: 22px 16px 28px;
  }

  .vs__grid,
  .pt__grid,
  .pt__foot,
  .op__grid,
  .ar__notes {
    grid-template-columns: minmax(0, 1fr);
  }

  .vs__bar {
    grid-template-columns: 70px minmax(0, 1fr) 76px;
  }

  .mx th,
  .mx td {
    padding: 6px 4px;
  }

  .mx tbody th {
    white-space: normal;
  }

  .ar__daw {
    padding: 8px;
  }

  .ar__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .ar__vid {
    height: 40px;
  }
}
</style>
