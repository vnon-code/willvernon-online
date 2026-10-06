<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, DRIVES, FILM, INFO, moorePath, moorePoint, PB, PS, TD, VERSIONS, YEARS } from './story'

// PROTOTYPE PwA "Datasheet" (overnight run, Powersurge r1). A film about computing power, written up as a chip's
// datasheet: the first view is four frames of the film in a row, labelled by second and year, over a part-number
// bar → 01 Description: a features list, the brief and the idea, the Mike Luan page → 02 Characteristic: the
// Moore's Law curve drawn in SVG with a Linear / Log toggle (flat for 75%, a straight line on log), beside the real
// FLOPs chart and the Blender failure as "Note 1" → 03 Pins: the whole TouchDesigner network over a pin table of
// what the data drives → 04 Revisions: a revision-history table (V1, V2, V5) whose rows open the book's page →
// 05 Application: the 20 s climax full width and the signal chain from spreadsheet to Premiere.
// Refs: Texas Instruments / Analog Devices datasheets (features, typical characteristics, pin table, revision
// history), Teenage Engineering's OP-1 field guide (technical manual as a designed object), Our World in Data's
// linear/log chart toggle. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwa', [
  { id: 'desc', label: 'Description' },
  { id: 'curve', label: 'Characteristic' },
  { id: 'pins', label: 'Pins' },
  { id: 'revs', label: 'Revisions' },
  { id: 'app', label: 'Application' },
])

const ROW = [
  { p: FILM.y1997, t: '1:00', y: '1997' },
  { p: TD.sphere, t: 'TD', y: 'Quiet' },
  { p: FILM.y2018, t: '4:45', y: '2018' },
  { p: FILM.y2020, t: '5:00', y: '2020' },
]
const FEATURES = ['1997 to 2021, ten seconds a year', 'One data curve, four parameters', 'Five versions, V5 final', '5:35 film, 1080p']

// The curve: an SVG on a 600×300 box, linear or log
const W = 600
const H = 300
const log = ref(false)
const LIN = moorePath(W, H, false)
const LOG = moorePath(W, H, true)
const at75 = YEARS.from + (YEARS.to - YEARS.from) * 0.75
const p75 = computed(() => moorePoint(at75, W, H, log.value))
const TICKS = [1997, 2005, 2013, 2021]

const rev = ref(2)
const fmt = (v: readonly number[] | number | null) => v == null ? '—' : Array.isArray(v) ? `${v[0]}–${v[1]}` : String(v)
const CHAIN = ['Excel', 'TouchDesigner', 'After Effects', 'Premiere Pro']
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwa">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <ul class="pk" aria-label="Four frames from the film">
            <li v-for="r in ROW" :key="r.p.src" class="pk__cell">
              <img :src="r.p.src" :alt="r.p.alt" :width="r.p.w" :height="r.p.h" loading="lazy" decoding="async">
              <span class="pk__tag"><b>{{ r.y }}</b>{{ r.t }}</span>
            </li>
          </ul>
          <div class="pk__bar" aria-hidden="true">
            <span>PS-6002</span><span>Data portrait</span><span>Rev. V5</span><span>5:35</span>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Description -->
      <section class="ds" v-bind="sec('desc')" data-sheet-block="desc">
        <SheetSectionNo id="desc" />
        <div class="ds__grid">
          <div>
            <h4 class="pwa__k">
              Features
            </h4>
            <ul class="ds__feat">
              <li v-for="f in FEATURES" :key="f">
                {{ f }}
              </li>
            </ul>
          </div>
          <div class="ds__text">
            <p>{{ PS.brief }}</p>
            <p>{{ PS.idea }}</p>
            <p>{{ PS.data }}</p>
          </div>
          <img class="ds__img" :src="PB.context.src" :alt="PB.context.alt" :width="PB.context.w" :height="PB.context.h" loading="lazy" decoding="async">
        </div>
      </section>

      <!-- 02 Characteristic: the curve, linear or log -->
      <section class="cv" v-bind="sec('curve')" data-sheet-block="curve">
        <SheetSectionNo id="curve" />
        <div class="cv__grid">
          <figure class="cv__fig">
            <div class="cv__bar">
              <span class="pwa__k">Fig. 1 &nbsp;Output vs year</span>
              <div class="cv__tog" role="group" aria-label="Y axis scale">
                <button type="button" :aria-pressed="!log" @click="log = false">
                  Linear
                </button>
                <button type="button" :aria-pressed="log" @click="log = true">
                  Log
                </button>
              </div>
            </div>
            <svg class="cv__svg" :viewBox="`-8 -8 ${W + 16} ${H + 36}`" role="img" :aria-label="`${PS.model} ${log ? 'Log scale: a straight line.' : 'Linear scale: flat for three quarters, then steep.'}`">
              <g class="cv__grid-lines">
                <line v-for="i in 5" :key="`h${i}`" x1="0" :x2="W" :y1="(H / 4) * (i - 1)" :y2="(H / 4) * (i - 1)" />
                <line v-for="t in TICKS" :key="t" :x1="moorePoint(t, W, H).x" :x2="moorePoint(t, W, H).x" y1="0" :y2="H" />
              </g>
              <path class="cv__path" :class="{ on: !log }" :d="LIN" />
              <path class="cv__path" :class="{ on: log }" :d="LOG" />
              <line class="cv__mark" :x1="p75.x" :x2="p75.x" :y1="p75.y" :y2="H" />
              <circle class="cv__dot" :cx="p75.x" :cy="p75.y" r="5" />
              <text class="cv__lbl" :x="p75.x - 8" :y="Math.max(p75.y - 12, 14)" text-anchor="end">75% of the film</text>
              <text v-for="t in TICKS" :key="`t${t}`" class="cv__tick" :x="moorePoint(t, W, H).x" :y="H + 24" :text-anchor="t === YEARS.from ? 'start' : t === YEARS.to ? 'end' : 'middle'">{{ t }}</text>
            </svg>
            <figcaption class="pwa__cap">
              {{ PS.model }}
            </figcaption>
          </figure>
          <div class="cv__side">
            <figure class="cv__src">
              <img :src="TD.flops.src" :alt="TD.flops.alt" :width="TD.flops.w" :height="TD.flops.h" loading="lazy" decoding="async">
              <figcaption class="pwa__cap">
                Fig. 2 &nbsp;Source data. {{ PS.flat }}
              </figcaption>
            </figure>
            <div class="cv__note">
              <span class="pwa__k">Note 1</span>
              <p>{{ PS.blender }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 03 Pins: the network over what the data drives -->
      <section class="pn" v-bind="sec('pins')" data-sheet-block="pins">
        <SheetSectionNo id="pins" />
        <img class="pn__net" :src="TD.network.src" :alt="TD.network.alt" :width="TD.network.w" :height="TD.network.h" loading="lazy" decoding="async">
        <div class="pn__grid">
          <p class="pwa__text">
            {{ PS.td }} {{ PS.sphere }}
          </p>
          <div class="pwa__scroll">
            <table class="pwa__table">
              <caption class="pwa__k">
                Pin configuration
              </caption>
              <thead>
                <tr><th>Pin</th><th>Name</th><th>Operator</th><th>Function</th></tr>
              </thead>
              <tbody>
                <tr v-for="(d, i) in DRIVES" :key="d.k">
                  <td class="pwa__num">
                    {{ i + 1 }}
                  </td>
                  <td><b>{{ d.k.toUpperCase() }}</b></td>
                  <td>{{ d.op }}</td>
                  <td>{{ d.does }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- 04 Revisions: rows open the book's page -->
      <section class="rv" v-bind="sec('revs')" data-sheet-block="revs">
        <SheetSectionNo id="revs" />
        <div class="rv__grid">
          <div>
            <div class="pwa__scroll">
              <table class="pwa__table rv__table">
                <caption class="pwa__k">
                  Revision history
                </caption>
                <thead>
                  <tr><th>Rev</th><th>Size</th><th>Speed</th><th>Lifetime</th><th>Particles</th></tr>
                </thead>
                <tbody>
                  <tr v-for="(v, i) in VERSIONS" :key="v.id" :class="{ on: rev === i }">
                    <td>
                      <button type="button" class="rv__btn" :aria-pressed="rev === i" @click="rev = i">
                        {{ v.id }}
                      </button>
                    </td>
                    <td>{{ fmt(v.size) }}</td>
                    <td>{{ fmt(v.speed) }}</td>
                    <td>{{ fmt(v.life) }}</td>
                    <td>{{ fmt(v.particles) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="pwa__cap">
              Values as the book lists them. {{ PS.limits }}
            </p>
            <figure class="rv__exp">
              <img :src="PB.experiments.src" :alt="PB.experiments.alt" :width="PB.experiments.w" :height="PB.experiments.h" loading="lazy" decoding="async">
              <figcaption class="pwa__cap">
                {{ PS.bloom }}
              </figcaption>
            </figure>
          </div>
          <figure class="rv__view">
            <img :key="VERSIONS[rev]!.id" :src="VERSIONS[rev]!.page.src" :alt="VERSIONS[rev]!.page.alt" :width="VERSIONS[rev]!.page.w" :height="VERSIONS[rev]!.page.h" decoding="async">
            <figcaption class="pwa__cap" aria-live="polite">
              {{ VERSIONS[rev]!.page.alt }}
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- 05 Application: the climax, the signal chain -->
      <section class="ap" v-bind="sec('app')" data-sheet-block="app">
        <SheetSectionNo id="app" />
        <video
          class="ap__video"
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
        <p class="pwa__cap ap__cap">
          4:22–4:42. {{ PS.out }}
        </p>
        <ol class="ap__chain" aria-label="Signal chain">
          <li v-for="c in CHAIN" :key="c">
            {{ c }}
          </li>
        </ol>
        <div class="ap__grid">
          <div class="ap__notes">
            <p>{{ PS.ae }}</p>
            <p>{{ PS.premiere }}</p>
            <p>{{ PS.music }}</p>
          </div>
          <figure>
            <img :src="PB.tool.src" :alt="PB.tool.alt" :width="PB.tool.w" :height="PB.tool.h" loading="lazy" decoding="async">
            <figcaption class="pwa__cap">
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
.pwa img,
.pwa video {
  display: block;
  width: 100%;
  height: auto;
}

.pwa figure {
  margin: 0;
}

.pwa__k {
  margin: 0;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pwa__text,
.ds__text p,
.ap__notes p,
.cv__note p {
  margin: 0;
  max-width: 48ch;
  font: 400 15px/1.55 var(--font-ui);
}

.pwa__cap {
  margin: 10px 0 0;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

.pwa__scroll {
  overflow-x: auto;
}

.pwa__table {
  width: 100%;
  border-collapse: collapse;
  font: 400 14px/1.4 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

.pwa__table caption {
  padding-bottom: 10px;
  text-align: left;
}

.pwa__table th {
  padding: 8px 12px 8px 0;
  border-bottom: 1px solid var(--c-fg);
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
  color: var(--muted);
}

.pwa__table td {
  padding: 10px 12px 10px 0;
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
}

.pwa__num {
  color: var(--c-accent);
}

/* First view: four frames in a row, then the part-number bar */
.pk {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #000;
}

.pk__cell {
  position: relative;
}

.pk__cell + .pk__cell {
  border-left: 1px solid var(--rule);
}

.pk__tag {
  display: flex;
  padding: 8px 10px;
  background: var(--c-bg);
  gap: 8px;
  font: 400 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.pk__tag b {
  font-weight: 600;
  color: var(--c-fg);
}

.pk__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 24px;
  padding: 10px 24px;
  border-top: 1px solid var(--rule);
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pk__bar span:first-child {
  color: var(--c-accent);
}

/* Sections share one frame: a rule on top, the same padding, no margins (no gaps) */
.ds,
.cv,
.pn,
.rv,
.ap {
  padding: 28px 24px 36px;
  border-top: 1px solid var(--rule);
}

.ds__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px 40px;
  margin-top: 20px;
}

.ds__feat {
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
  font: 400 14px/1.4 var(--font-ui);
}

.ds__feat li {
  padding: 8px 0;
  border-bottom: 1px solid var(--rule);
}

.ds__feat li::before {
  content: '■ ';
  color: var(--c-accent);
  font-size: 9px;
  vertical-align: 2px;
}

.ds__text {
  display: grid;
  gap: 12px;
  align-content: start;
}

.cv__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 24px 40px;
  margin-top: 20px;
}

.cv__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}

.cv__tog {
  display: flex;
  border: 1px solid var(--rule);
}

.cv__tog button,
.rv__btn {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--c-fg);
  font: 500 13px/1 var(--font-ui);
  cursor: pointer;
}

.cv__tog button[aria-pressed='true'],
.rv__btn[aria-pressed='true'] {
  background: var(--c-fg);
  color: var(--c-bg);
}

.cv__tog button:focus-visible,
.rv__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.cv__svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.cv__grid-lines line {
  stroke: var(--rule);
  stroke-width: 1;
}

.cv__path {
  fill: none;
  stroke: var(--c-fg);
  stroke-width: 2.5;
  opacity: 0;
  transition: opacity 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cv__path.on {
  opacity: 1;
}

.cv__mark {
  stroke: var(--c-accent);
  stroke-dasharray: 4 4;
  transition: all 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cv__dot {
  fill: var(--c-accent);
  transition: cy 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cv__lbl,
.cv__tick {
  fill: var(--muted);
  font: 400 13px var(--font-ui);
}

.cv__lbl {
  fill: var(--c-accent);
  transition: y 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cv__side {
  display: grid;
  gap: 24px;
  align-content: start;
}

.cv__src img {
  background: #fff;
}

.cv__note {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-left: 2px solid var(--c-accent);
}

.pn__net {
  margin-top: 20px;
  background: #000;
}

.pn__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px 40px;
  margin-top: 24px;
}

.rv__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 24px 40px;
  margin-top: 20px;
}

.rv__table tr.on td {
  background: color-mix(in srgb, var(--c-fg) 6%, transparent);
}

.rv__btn {
  min-width: 52px;
  border: 1px solid var(--rule);
}

.rv__exp {
  margin-top: 28px !important;
}

.rv__view {
  position: sticky;
  top: calc(var(--header-h, 64px) + 16px);
  align-self: start;
}


.ap__video {
  margin-top: 20px;
  aspect-ratio: 16 / 9;
  background: #000;
}

.ap__chain {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  margin: 24px 0 0;
  padding: 0;
  list-style: none;
  font: 600 clamp(18px, 2.4vw, 30px)/1.2 var(--font-ui);
  letter-spacing: -0.02em;
}

.ap__chain li + li::before {
  content: '→';
  margin: 0 14px;
  color: var(--c-accent);
  font-weight: 400;
}

.ap__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 24px 40px;
  margin-top: 28px;
}

.ap__notes {
  display: grid;
  gap: 12px;
  align-content: start;
}

@media (prefers-reduced-motion: reduce) {
  .cv__path,
  .cv__mark,
  .cv__dot,
  .cv__lbl {
    transition: none;
    animation: none;
  }
}

@media (max-width: 720px) {
  .pk {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pk__cell:nth-child(3) {
    border-left: 0;
  }

  .pk__bar {
    padding: 10px 16px;
  }

  .ds,
  .cv,
  .pn,
  .rv,
  .ap {
    padding: 22px 16px 28px;
  }

  .ds__grid,
  .cv__grid,
  .pn__grid,
  .rv__grid,
  .ap__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .rv__view {
    position: static;
  }

  .pwa__table {
    font-size: 13px;
  }
}
</style>
