<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, FILM, FILM_SECONDS, INFO, moorePath, moorePoint, PB, PS, TD, YEARS } from './story'

// PROTOTYPE PwB "Curve" (overnight run, Powersurge r1). The data is the story, so the page rides it: the first view
// is five frames whose widths grow like the curve (quiet sphere narrow, the burst wide) → 01 The curve: a sticky
// chart of Moore's Law with a dot that climbs to each year as its step scrolls past, the frame for that year above
// it (1997, flat at 2005, still flat at 75%, the burst in 2018, white in 2020) → 02 Two engines: Blender and
// TouchDesigner as a two-column ledger, the abandoned one greyed → 03 What the data drives: four cards, each with a
// sparkline of how its parameter moves, then the bloom as a pull quote → 04 The film: the climax over a 5:35
// runtime bar (quiet three quarters, the burst, this clip's window), then After Effects and Premiere.
// Refs: Bloomberg's "What's Really Warming the World?" and The Pudding's sticky-chart scrollytelling (one chart,
// the text steps drive it), Our World in Data's line charts, Refik Anadol Studio's data-painting project pages
// (the output big, the data beside it). PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwb', [
  { id: 'curve', label: 'The curve' },
  { id: 'engines', label: 'Two engines' },
  { id: 'drives', label: 'What the data drives' },
  { id: 'film', label: 'The film' },
])

// First view: five frames, widths growing like the data
const ARC = [
  { p: FILM.y1997, g: 1 },
  { p: TD.sphere, g: 1.1 },
  { p: TD.blue, g: 1.5 },
  { p: FILM.y2018, g: 2.3 },
  { p: FILM.y2020, g: 3.4 },
]

// 01 The steps: a year, its frame, one line
const STEPS = [
  { year: 1997, p: FILM.y1997, line: PS.data },
  { year: 2005, p: TD.sphere, line: PS.sphere },
  { year: 2015, p: TD.blue, line: PS.flat },
  { year: 2018, p: FILM.y2018, line: 'Then it bursts, purple first.' },
  { year: 2020, p: FILM.y2020, line: 'Red, then white, so the bloom shows.' },
]
const W = 600
const H = 260
const PATH = moorePath(W, H, false)
const active = ref(0)
const dot = computed(() => moorePoint(STEPS[active.value]!.year, W, H))
const stepEls = ref<HTMLElement[]>([])
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i)
  }, { rootMargin: '-45% 0px -45% 0px' })
  stepEls.value.forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

// 03 Sparklines on a 120×48 box
const SW = 120
const SH = 48
const spark = (f: (t: number) => number) => {
  const pts: string[] = []
  for (let i = 0; i <= 24; i++) pts.push(`${(SW * i / 24).toFixed(1)},${(SH - 4 - f(i / 24) * (SH - 8)).toFixed(1)}`)
  return `M${pts.join(' L')}`
}
const exp = (t: number) => (2 ** (t * 12) - 1) / 4095
const CARDS = [
  { k: 'Size', op: 'Math, multiply', does: 'Grows with the data.', lines: [{ d: spark(exp), c: 'var(--c-fg)' }] },
  { k: 'Chaos', op: 'Post Add', does: 'Renamed. Inverts the shape.', lines: [{ d: spark(t => 1 - exp(t)), c: 'var(--c-fg)' }] },
  { k: 'Colour', op: 'Level', does: 'Blue fixed. Red and green rise to white.', lines: [
    { d: spark(() => 0.85), c: '#4a5cff' },
    { d: spark(t => exp(Math.min(1, t * 1.12))), c: '#ff3b3b' },
    { d: spark(t => exp(t) * 0.92), c: '#3bd16f' },
  ] },
  { k: 'Time', op: 'Animation CHOP', does: 'Locks the data to the timeline.', lines: [{ d: spark(t => t), c: 'var(--c-fg)' }] },
]

// 04 The runtime bar: 5:35, quiet for 75%, this clip's window, the frames' seconds
const pct = (s: number) => `${(s / FILM_SECONDS) * 100}%`
const MARKS = [FILM.y1997, FILM.y2018, FILM.y2020]
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwb">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <ul class="arc" aria-label="Five frames, quiet to burst">
            <li v-for="a in ARC" :key="a.p.src" :style="{ flexGrow: a.g }">
              <img :src="a.p.src" :alt="a.p.alt" :width="a.p.w" :height="a.p.h" loading="lazy" decoding="async">
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
            </div>
            <svg class="cu__svg" :viewBox="`-6 -10 ${W + 12} ${H + 34}`" role="img" :aria-label="PS.model">
              <line class="cu__base" x1="0" :x2="W" :y1="H" :y2="H" />
              <path class="cu__path" :d="PATH" />
              <g class="cu__dot" :style="{ transform: `translate(${dot.x}px, ${dot.y}px)` }">
                <circle r="7" />
              </g>
              <text class="cu__tick" x="0" :y="H + 22">{{ YEARS.from }}</text>
              <text class="cu__tick" :x="W" :y="H + 22" text-anchor="end">{{ YEARS.to }}</text>
            </svg>
            <p class="pwb__cap">
              {{ PS.model }}
            </p>
          </div>
          <ol class="cu__steps">
            <li v-for="(s, i) in STEPS" :key="s.year" ref="stepEls" :data-i="i" class="cu__step" :class="{ on: active === i }">
              <b class="cu__sy">{{ s.year }}</b>
              <p>{{ s.line }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 02 Two engines: a ledger, the abandoned side greyed -->
      <section class="en" v-bind="sec('engines')" data-sheet-block="engines">
        <div class="cu__head">
          <SheetSectionNo id="engines" />
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
            <figcaption>{{ PS.td }}</figcaption>
          </figure>
        </div>
      </section>

      <!-- 03 What the data drives: sparkline cards, then the bloom -->
      <section class="dr" v-bind="sec('drives')" data-sheet-block="drives">
        <div class="cu__head">
          <SheetSectionNo id="drives" />
        </div>
        <ul class="dr__cards">
          <li v-for="c in CARDS" :key="c.k" class="dr__card">
            <svg :viewBox="`0 0 ${SW} ${SH}`" aria-hidden="true" class="dr__spark">
              <path v-for="(l, i) in c.lines" :key="i" :d="l.d" :style="{ stroke: l.c }" />
            </svg>
            <b class="dr__k">{{ c.k }}</b>
            <span class="pwb__k">{{ c.op }}</span>
            <p>{{ c.does }}</p>
          </li>
        </ul>
        <p class="pwb__cap dr__note">
          {{ PS.noise }} {{ PS.limits }}
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

      <!-- 04 The film: the climax over the runtime bar -->
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
        <div class="rt" role="img" :aria-label="`Runtime 5:35. Quiet for three quarters, then the burst. This clip: ${mmss(CLIMAX.from)} to ${mmss(CLIMAX.to)}.`">
          <div class="rt__bar">
            <span class="rt__quiet" />
            <span class="rt__burst" />
            <span class="rt__clip" :style="{ left: pct(CLIMAX.from), width: pct(CLIMAX.to - CLIMAX.from) }" />
            <span v-for="m in MARKS" :key="m.t" class="rt__mark" :style="{ left: pct(m.t) }">
              <i>{{ m.year }}</i>
            </span>
          </div>
          <div class="rt__scale" aria-hidden="true">
            <span>0:00</span><span>Quiet</span><span class="rt__b">Burst</span><span>5:35</span>
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

/* First view: widths grow like the data */
.arc {
  display: flex;
  height: clamp(220px, 34vw, 380px);
  margin: 0;
  padding: 0;
  list-style: none;
  background: #000;
}

.arc li {
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

/* Sections: one frame, a rule on top, padding only (no gaps) */
.cu,
.en,
.dr,
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

.cu__svg {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 16px;
  overflow: visible;
}

.cu__base {
  stroke: var(--rule);
}

.cu__path {
  fill: none;
  stroke: var(--c-fg);
  stroke-width: 2.5;
}

.cu__dot {
  transition: transform 520ms cubic-bezier(0.65, 0, 0.35, 1);
}

.cu__dot circle {
  fill: var(--c-accent);
}

.cu__tick {
  fill: var(--muted);
  font: 400 13px var(--font-ui);
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
  min-height: 62vh;
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

/* 03 What the data drives */
.dr__cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border: 1px solid var(--rule);
}

.dr__card {
  display: grid;
  gap: 6px;
  align-content: start;
  padding: 18px;
}

.dr__card + .dr__card {
  border-left: 1px solid var(--rule);
}

.dr__card p {
  margin: 4px 0 0;
  font: 400 14px/1.45 var(--font-ui);
}

.dr__spark {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
  overflow: visible;
}

.dr__spark path {
  fill: none;
  stroke-width: 2;
}

.dr__k {
  font: 700 22px/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.dr__note {
  margin-top: 14px;
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
  .cu__dot,
  .cu__step {
    transition: none;
  }
}

@media (max-width: 720px) {
  .cu,
  .en,
  .dr,
  .fm {
    padding: 22px 16px 28px;
  }

  .arc {
    height: 180px;
  }

  .cu__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .cu__fig {
    z-index: 1;
    padding-bottom: 8px;
    background: var(--c-bg);
  }

  .cu__svg {
    max-height: 90px;
    margin-top: 8px;
  }

  .cu__fig .pwb__cap {
    display: none;
  }

  .cu__step {
    min-height: 44vh;
  }

  .en__grid,
  .dr__bloom,
  .fm__pair {
    grid-template-columns: minmax(0, 1fr);
  }

  .en__col {
    padding: 0 0 24px;
  }

  .en__col + .en__col {
    padding: 24px 0 0;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .dr__cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dr__card:nth-child(3) {
    border-left: 0;
  }

  .dr__card:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }
}
</style>
