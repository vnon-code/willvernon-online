<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, FILM, FILM_SECONDS, INFO, moorePath, moorePoint, PATCH, PB, PS, SEEN, TD, times, YEARS } from './story'

// PROTOTYPE PwB2 "Curve, refined" (overnight run, Powersurge r2): PwB with the r1 judges' changes. The opening
// strip's frames carry their years; each sticky step says what the FILM shows that year (process facts moved to 02);
// the sticky chart gets PwA's Linear/Log toggle and a dashed 75% knee that the runtime bar in 04 repeats; each step
// carries the model's multiple of 1997 so the right column isn't empty, and steps are shorter; the four drives are
// PwC's pin matrix (a different device from the chart); on phones the sticky figure is a compact strip (curve 120px,
// HTML labels ≥ 12px) and inactive steps hide so none sits over the media.
// Refs: Bloomberg "What's Really Warming the World?", The Pudding's sticky-chart scrollytelling, Our World in Data's
// Linear/Log switch, the EMS Synthi pin matrix. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwb2', [
  { id: 'curve', label: 'The curve' },
  { id: 'engines', label: 'Two engines' },
  { id: 'patch', label: 'What the data drives' },
  { id: 'film', label: 'The film' },
])

// First view: five frames, widths growing like the data, each labelled with its year
const ARC = [
  { p: FILM.y1997, g: 1, y: '1997' },
  { p: TD.sphere, g: 1.1, y: '2005' },
  { p: TD.blue, g: 1.5, y: '2015' },
  { p: FILM.y2018, g: 2.3, y: '2018' },
  { p: FILM.y2020, g: 3.4, y: '2020' },
]

// 01 Steps: a year, what the film shows, its frame (film frame or render, said so)
const STEPS = [
  { year: 1997, p: FILM.y1997, src: 'Film, 1:00' },
  { year: 2005, p: TD.sphere, src: 'Render' },
  { year: 2015, p: TD.blue, src: 'Render' },
  { year: 2018, p: FILM.y2018, src: 'Film, 4:45' },
  { year: 2020, p: FILM.y2020, src: 'Film, 5:00' },
]
const W = 600
const H = 220
const log = ref(false)
const LIN = moorePath(W, H, false)
const LOG = moorePath(W, H, true)
const KNEE = 75 // % of the years (and of the film): 2015
const TICKS = [1997, 2005, 2013, 2021]
const tickX = (t: number) => `${((t - YEARS.from) / (YEARS.to - YEARS.from)) * 100}%`
const active = ref(0) // the chart's year: the last step whose top passed the reading line
const inBand = ref(-1) // the step across the reading line now (-1: none); only it shows on phones
const dot = computed(() => {
  const p = moorePoint(STEPS[active.value]!.year, W, H, log.value)
  return `translate(${(p.x / W) * 100}%, ${(p.y / H) * 100}%)`
})
const stepEls = ref<HTMLElement[]>([])
// Reading line: mid-screen on desktop; on phones below the sticky strip (it fills the top half). Read on scroll
// (any scroller, one rAF per frame), so a jump lands on the right year too.
let raf = 0
let phone = false
function read() {
  raf = 0
  const line = innerHeight * (phone ? 0.72 : 0.5)
  let a = 0
  let band = -1
  stepEls.value.forEach((el, i) => {
    const r = el.getBoundingClientRect()
    if (r.top < line) a = i
    if (r.top < line && r.bottom > line) band = i
  })
  active.value = a
  inBand.value = band
}
const onScroll = () => { raf ||= requestAnimationFrame(read) }
onMounted(() => {
  phone = matchMedia('(max-width: 600px)').matches
  addEventListener('scroll', onScroll, { capture: true, passive: true })
  read()
})
onBeforeUnmount(() => {
  removeEventListener('scroll', onScroll, { capture: true })
  cancelAnimationFrame(raf)
})

// 03 The pin matrix
const pin = ref('FLOPs data/Size')

// 04 The runtime bar
const pct = (s: number) => `${(s / FILM_SECONDS) * 100}%`
const MARKS = [FILM.y1997, FILM.y2018, FILM.y2020]
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwb">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <ul class="arc" aria-label="Five frames, 1997 to 2020, widths growing like the data">
            <li v-for="a in ARC" :key="a.p.src" :style="{ flexGrow: a.g }">
              <img :src="a.p.src" :alt="a.p.alt" :width="a.p.w" :height="a.p.h" loading="lazy" decoding="async">
              <span class="arc__y" aria-hidden="true">{{ a.y }}</span>
            </li>
          </ul>
        </template>
      </SheetHead>

      <!-- 01 The curve: sticky chart, steps drive the dot -->
      <section class="cu" v-bind="sec('curve')" data-sheet-block="curve">
        <div class="cu__head">
          <SheetSectionNo id="curve" />
        </div>
        <div class="cu__grid">
          <div class="cu__fig">
            <div class="cu__frames">
              <img
                v-for="(s, i) in STEPS"
                :key="s.year"
                :class="{ on: active === i }"
                :src="s.p.src"
                :alt="active === i ? s.p.alt : ''"
                :aria-hidden="active !== i"
                :width="s.p.w"
                :height="s.p.h"
                loading="lazy"
                decoding="async"
              >
              <span class="cu__src" aria-hidden="true">{{ STEPS[active]!.src }}</span>
            </div>
            <div class="cu__bar">
              <span class="pwb__k">Computing power, model</span>
              <div class="tog" role="group" aria-label="Y axis scale">
                <button type="button" :aria-pressed="!log" @click="log = false">
                  Linear
                </button>
                <button type="button" :aria-pressed="log" @click="log = true">
                  Log
                </button>
              </div>
            </div>
            <div class="cu__plot" role="img" :aria-label="`${PS.model} ${log ? 'Log scale: a straight line.' : 'Linear scale: flat for three quarters, then steep.'}`">
              <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" aria-hidden="true">
                <line class="cu__base" x1="0" :x2="W" :y1="H" :y2="H" />
                <path class="cu__path" :class="{ on: !log }" :d="LIN" />
                <path class="cu__path" :class="{ on: log }" :d="LOG" />
              </svg>
              <span class="knee" :style="{ left: `${KNEE}%` }"><i>75%</i></span>
              <span class="cu__dotlayer" :style="{ transform: dot }"><b /></span>
            </div>
            <div class="cu__ticks" aria-hidden="true">
              <span v-for="t in TICKS" :key="t" :style="{ left: tickX(t) }">{{ t }}</span>
            </div>
            <p class="pwb__cap cu__cap">
              {{ PS.model }}
            </p>
          </div>
          <ol class="cu__steps">
            <li v-for="(s, i) in STEPS" :key="s.year" ref="stepEls" :data-i="i" class="cu__step" :class="{ on: active === i, band: inBand === i }">
              <b class="cu__sy">{{ s.year }}</b>
              <p>{{ SEEN[s.year] }}</p>
              <span class="pwb__k">{{ i ? `${times(s.year)} vs 1997, model` : 'Base year' }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- 02 Two engines: a ledger, the abandoned side greyed; the process facts live here -->
      <section class="en" v-bind="sec('engines')" data-sheet-block="engines">
        <div class="cu__head">
          <SheetSectionNo id="engines" />
          <p class="pwb__text en__lead">
            {{ PS.data }}
          </p>
        </div>
        <div class="en__grid">
          <figure class="en__col en__col--off">
            <span class="pwb__k"><s>Blender</s> &nbsp;Abandoned</span>
            <img :src="PB.blender.src" :alt="PB.blender.alt" :width="PB.blender.w" :height="PB.blender.h" loading="lazy" decoding="async">
            <figcaption>{{ PS.blender }}</figcaption>
          </figure>
          <figure class="en__col">
            <span class="pwb__k">TouchDesigner &nbsp;Kept</span>
            <img :src="PB.whole.src" :alt="PB.whole.alt" :width="PB.whole.w" :height="PB.whole.h" loading="lazy" decoding="async">
            <figcaption>{{ PS.td }} {{ PS.sphere }}</figcaption>
          </figure>
        </div>
      </section>

      <!-- 03 What the data drives: the pin matrix, then the bloom -->
      <section class="pt" v-bind="sec('patch')" data-sheet-block="patch">
        <div class="cu__head">
          <SheetSectionNo id="patch" />
        </div>
        <div class="pt__grid">
          <table class="mx">
            <caption class="pwb__cap mx__cap">
              Source × parameter. Pick a pin.
            </caption>
            <thead>
              <tr>
                <th scope="col">
                  <span class="sr-only">Source</span>
                </th>
                <th v-for="p in PATCH.params" :key="p" scope="col">
                  {{ p }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in PATCH.sources" :key="s">
                <th scope="row">
                  {{ s }}
                </th>
                <td v-for="p in PATCH.params" :key="p">
                  <button
                    v-if="PATCH.pins[`${s}/${p}`]"
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
            <span class="pwb__k">{{ pin.replace('/', ' → ') }}</span>
            <b class="pt__op">{{ PATCH.pins[pin]!.op }}</b>
            <p>{{ PATCH.pins[pin]!.does }}</p>
          </div>
        </div>
        <p class="pwb__cap">
          {{ PS.lock }} {{ PS.noise }}
        </p>
        <div class="dr__bloom">
          <img :src="PB.experiments.src" :alt="PB.experiments.alt" :width="PB.experiments.w" :height="PB.experiments.h" loading="lazy" decoding="async">
          <blockquote class="dr__quote">
            <p>I fell in love with the bloom.</p>
            <footer class="pwb__cap">
              Three experiments: form, colour, flow.
            </footer>
          </blockquote>
        </div>
      </section>

      <!-- 04 The film: the climax over the runtime bar, the same 75% knee -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="cu__head">
          <SheetSectionNo id="film" />
        </div>
        <video
          class="fm__video"
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
        <div class="rt" role="img" :aria-label="`Runtime 5:35. Quiet for the first 75%, then the burst. This clip: ${mmss(CLIMAX.from)} to ${mmss(CLIMAX.to)}.`">
          <div class="rt__bar">
            <span class="rt__quiet" />
            <span class="rt__burst" />
            <span class="knee knee--bar" :style="{ left: `${KNEE}%` }" />
            <span class="rt__clip" :style="{ left: pct(CLIMAX.from), width: pct(CLIMAX.to - CLIMAX.from) }" />
            <span v-for="m in MARKS" :key="m.t" class="rt__mark" :style="{ left: pct(m.t) }">
              <i>{{ m.year }}</i>
            </span>
          </div>
          <div class="rt__scale" aria-hidden="true">
            <span>0:00</span><span>Quiet 75%</span><span class="rt__b">Burst</span><span>5:35</span>
          </div>
        </div>
        <p class="pwb__text fm__out">
          {{ PS.out }} {{ PS.music }}
        </p>
        <div class="fm__pair">
          <figure v-for="p in [{ i: PB.ae, t: PS.ae }, { i: PB.premiere, t: PS.premiere }]" :key="p.i.src">
            <img :src="p.i.src" :alt="p.i.alt" :width="p.i.w" :height="p.i.h" loading="lazy" decoding="async">
            <figcaption class="pwb__cap">
              {{ p.t }}
            </figcaption>
          </figure>
        </div>
      </section>

      <SheetCredits :items="PS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.pwb img,
.pwb video {
  display: block;
  width: 100%;
  height: auto;
}

.pwb figure {
  margin: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.pwb__k {
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pwb__text {
  margin: 0;
  max-width: 52ch;
  font: 400 16px/1.55 var(--font-ui);
}

.pwb__cap {
  margin: 10px 0 0;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

/* First view: widths grow like the data, years on the frames */
.arc {
  display: flex;
  height: clamp(220px, 34vw, 380px);
  margin: 0;
  padding: 0;
  list-style: none;
  background: #000;
}

.arc li {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
}

.arc li + li {
  border-left: 1px solid #000;
}

.arc img {
  height: 100% !important;
  object-fit: cover;
}

.arc__y {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 2px 5px;
  font: 600 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: #f2f2ef;
  background: rgb(0 0 0 / 0.6);
}

.arc li:last-child .arc__y {
  background: var(--c-accent);
}

/* Sections: one frame, a rule on top, padding only (no gaps) */
.cu,
.en,
.pt,
.fm {
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.cu__head {
  margin-bottom: 20px;
}

/* 01 The curve */
.cu__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 0 40px;
}

.cu__fig {
  position: sticky;
  top: calc(var(--header-h, 64px) + 16px);
  align-self: start;
}

.cu__frames {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}

.cu__frames img {
  position: absolute;
  inset: 0;
  height: 100% !important;
  object-fit: cover;
  opacity: 0;
  transition: opacity 400ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cu__frames img.on {
  opacity: 1;
}

.cu__src {
  position: absolute;
  right: 8px;
  bottom: 8px;
  padding: 2px 5px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f2f2ef;
  background: rgb(0 0 0 / 0.6);
}

.cu__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
}

.tog {
  display: inline-flex;
  border: 1px solid var(--rule);
}

.tog button {
  min-height: 32px;
  padding: 0 12px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.tog button + button {
  border-left: 1px solid var(--rule);
}

.tog button[aria-pressed='true'] {
  color: var(--c-bg);
  background: var(--c-fg);
}

.tog button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.cu__plot {
  position: relative;
  height: clamp(150px, 16vw, 220px);
  margin-top: 12px;
}

.cu__plot svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.cu__base {
  stroke: var(--rule);
  vector-effect: non-scaling-stroke;
}

.cu__path {
  fill: none;
  stroke: var(--c-fg);
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
  opacity: 0;
  transition: opacity 300ms ease;
}

.cu__path.on {
  opacity: 1;
}

/* The dot layer is the plot's size, so translate(%) moves the dot across the plot */
.cu__dotlayer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: transform 520ms cubic-bezier(0.65, 0, 0.35, 1);
}

.cu__dotlayer b {
  position: absolute;
  top: -7px;
  left: -7px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--c-accent);
}

.knee {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dashed var(--muted);
}

.knee i {
  position: absolute;
  top: 0;
  left: 6px;
  font: 500 12px/1 var(--font-ui);
  font-style: normal;
  color: var(--muted);
}

.cu__ticks {
  position: relative;
  height: 22px;
  margin-top: 6px;
  font: 400 12px/1 var(--font-ui);
  color: var(--muted);
}

.cu__ticks span {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
}

.cu__ticks span:first-child {
  transform: none;
}

.cu__ticks span:last-child {
  transform: translateX(-100%);
}

.cu__steps {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cu__step {
  display: grid;
  align-content: center;
  gap: 10px;
  min-height: 46vh;
  padding: 24px 0;
  border-top: 1px solid var(--rule);
  opacity: 0.35;
  transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cu__step.on {
  opacity: 1;
}

.cu__step p {
  margin: 0;
  max-width: 34ch;
  font: 400 18px/1.45 var(--font-ui);
}

.cu__sy {
  font: 700 clamp(40px, 5vw, 72px)/0.9 var(--font-ui);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}

.cu__step.on .cu__sy {
  color: var(--c-accent);
}

/* 02 Two engines */
.en__lead {
  margin-top: 12px;
}

.en__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.en__col {
  display: grid;
  gap: 12px;
  align-content: start;
  padding-right: 24px;
}

.en__col + .en__col {
  padding: 0 0 0 24px;
  border-left: 1px solid var(--rule);
}

.en__col figcaption {
  max-width: 44ch;
  font: 400 15px/1.5 var(--font-ui);
}

.en__col--off img {
  filter: grayscale(1);
  opacity: 0.55;
}

.en__col--off figcaption {
  color: var(--muted);
}

/* 03 The pin matrix */
.pt__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 24px 40px;
  align-items: center;
}

.mx {
  width: 100%;
  border-collapse: collapse;
  font: 500 12px/1.2 var(--font-ui);
}

.mx__cap {
  margin: 0 0 12px;
  text-align: left;
  caption-side: top;
}

.mx th {
  padding: 8px 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
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
  width: 24px;
  height: 24px;
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

.mx__pin:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
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
  max-width: 34ch;
  font: 400 15px/1.5 var(--font-ui);
}

.dr__bloom {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 24px 40px;
  align-items: center;
  margin-top: 36px;
}

.dr__quote {
  margin: 0;
}

.dr__quote p {
  margin: 0;
  font: 600 clamp(28px, 3.6vw, 48px)/1.05 var(--font-ui);
  letter-spacing: -0.03em;
  text-wrap: balance;
}

/* 04 The film and its runtime bar */
.fm__video {
  aspect-ratio: 16 / 9;
  background: #000;
}

.rt {
  margin-top: 14px;
}

.rt__bar {
  position: relative;
  display: flex;
  height: 14px;
}

.rt__quiet {
  flex: 75 1 0;
  background: color-mix(in srgb, var(--c-fg) 18%, transparent);
}

.rt__burst {
  flex: 25 1 0;
  background: var(--c-accent);
}

.knee--bar {
  top: -8px;
  bottom: -8px;
}

.rt__clip {
  position: absolute;
  top: -4px;
  bottom: -4px;
  border: 2px solid var(--c-fg);
}

.rt__mark {
  position: absolute;
  top: 100%;
  width: 1px;
  height: 8px;
  background: var(--c-fg);
}

.rt__mark i {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  font: 400 11px/1 var(--font-ui);
  font-style: normal;
  color: var(--muted);
}

.rt__scale {
  display: flex;
  justify-content: space-between;
  margin-top: 26px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.rt__b {
  color: var(--c-accent);
}

.fm__out {
  margin-top: 24px;
}

.fm__pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 28px;
}

@media (prefers-reduced-motion: reduce) {
  .cu__frames img,
  .cu__dotlayer,
  .cu__path,
  .cu__step,
  .mx__pin {
    transition: none;
  }
}

@media (max-width: 720px) {
  .cu,
  .en,
  .pt,
  .fm {
    padding: 22px 16px 28px;
  }

  .arc {
    height: 180px;
  }

  .cu__grid,
  .en__grid,
  .pt__grid,
  .dr__bloom,
  .fm__pair {
    grid-template-columns: minmax(0, 1fr);
  }

  .cu__fig {
    z-index: 1;
    padding-bottom: 8px;
    background: var(--c-bg);
  }

  .cu__cap {
    display: none;
  }

  .cu__step {
    min-height: 40vh;
  }

  .en__col {
    padding: 0 0 24px;
  }

  .en__col + .en__col {
    padding: 24px 0 0;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .mx th,
  .mx td {
    padding: 6px 4px;
  }
}

/* Phones: the sticky figure becomes a compact strip; only the active step shows */
@media (max-width: 600px) {
  .arc__y {
    left: 3px;
    bottom: 3px;
    padding: 2px 3px;
    font-size: 11px;
  }

  .cu__frames {
    aspect-ratio: 2.4 / 1;
  }

  .cu__frames img {
    object-position: 50% 0;
  }

  .cu__bar {
    margin-top: 8px;
  }

  .cu__plot {
    height: 120px;
    margin-top: 8px;
  }

  .cu__steps {
    padding-bottom: 20vh;
  }

  .cu__step {
    min-height: 34vh;
    transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1), visibility 0s 300ms;
  }

  .cu__step:not(.band) {
    opacity: 0;
    visibility: hidden;
  }

  .cu__step.band {
    opacity: 1;
    visibility: visible;
    transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
  }

  .cu__step p {
    font-size: 17px;
  }

  .mx tbody th {
    white-space: normal;
  }
}
</style>
