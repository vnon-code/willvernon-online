<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, FILM, INFO, moore, PB, PS, SEEN, TD, times, VERSIONS, YEARS } from './story'

// PROTOTYPE PwD "To scale" (overnight run, Powersurge r2). The page's own length is the data. First view: the burst
// big, the quiet three small → 01 To scale: one row per year, 1997 to 2021, each row as tall as Moore's Law says
// (model, floor 22px). Eighteen years pass as hairlines in a few hundred pixels, then the rows open up and fill with
// the film and the renders, edge to edge → 02 Diff: the build as a code diff (Blender reverted, TouchDesigner added,
// V1 → V2 parameter changes, the data wired into size, chaos, colour) beside the version pages → 03 The film: the
// climax clip, then the slider tool.
// Refs: Matt Korostoff's "Wealth, shown to scale" (scroll length as the number), The Pudding's scale pieces, GitHub's
// split diff view. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwd', [
  { id: 'scale', label: 'To scale' },
  { id: 'diff', label: 'Diff' },
  { id: 'film', label: 'The film' },
])

// 01 Rows: height follows the model, the top row 900px; media in the tall rows, labelled film or render
const TOP = 900
const FLOOR = 22
const MEDIA: Record<number, { p: typeof TD.blue, src: string }> = {
  2016: { p: TD.sphere, src: 'Render' },
  2017: { p: TD.blue, src: 'Render' },
  2018: { p: FILM.y2018, src: 'Film, 4:45' },
  2019: { p: TD.purple, src: 'Render' },
  2020: { p: FILM.y2020, src: 'Film, 5:00' },
  2021: { p: TD.redWide, src: 'Render' },
}
const ROWS = Array.from({ length: YEARS.to - YEARS.from + 1 }, (_, i) => {
  const year = YEARS.from + i
  const share = moore(year) / moore(YEARS.to)
  return { year, h: Math.max(FLOOR, Math.round(share * TOP)), w: Math.max(0.2, share * 100), m: MEDIA[year], line: SEEN[year] }
})

// 02 The diff
const [V1, V2] = VERSIONS
type Line = { t: '-' | '+' | ' ' | '@', s: string }
const DIFF: Line[] = [
  { t: '@', s: '@@ engine @@' },
  { t: '-', s: 'blender: particle count, force <- FLOPs' },
  { t: ' ', s: '# CPU bottleneck. File no longer opens.' },
  { t: '+', s: 'touchdesigner: "Exploding Star" base' },
  { t: '+', s: 'emitter cylinder; feedback; bloom' },
  { t: '@', s: '@@ V1 -> V2 @@' },
  { t: '-', s: `size ${V1.size[0]} -> ${V1.size[1]}` },
  { t: '+', s: `size ${V2.size![0]} -> ${V2.size![1]}` },
  { t: '-', s: `speed ${V1.speed[0]} -> ${V1.speed[1]}` },
  { t: '+', s: `speed ${V2.speed![0]} -> ${V2.speed![1]}` },
  { t: '-', s: `lifetime ${V1.life}` },
  { t: '+', s: `lifetime ${V2.life}` },
  { t: '@', s: '@@ wiring, V5 final @@' },
  { t: '+', s: 'size   <- FLOPs  (Math, multiply)' },
  { t: '+', s: 'chaos  <- FLOPs  (Post Add, inverts)' },
  { t: '+', s: 'red, green <- FLOPs; blue fixed  (Level)' },
  { t: '+', s: 'time locked  (Animation CHOP)' },
]
const PAGES = [PB.blender, PB.v1, PB.v2, PB.v5]

// The tall rows' media mounts only once the section is near, so no big decode lands during the open
const scaleEl = ref<HTMLElement>()
const near = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((es) => {
    if (es.some(e => e.isIntersecting)) {
      near.value = true
      io?.disconnect()
    }
  }, { rootMargin: '0px 0px 600px 0px' })
  if (scaleEl.value) io.observe(scaleEl.value)
})
onBeforeUnmount(() => io?.disconnect())
const page = ref(1)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwd">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <div class="op">
            <img class="op__big" :src="FILM.y2020.src" :alt="FILM.y2020.alt" :width="FILM.y2020.w" :height="FILM.y2020.h" loading="lazy" decoding="async">
            <div class="op__small">
              <img v-for="p in [FILM.title, FILM.y1997, FILM.y2018]" :key="p.src" :src="p.src" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 To scale: one row per year, as tall as the model -->
      <section class="sc" v-bind="sec('scale')" data-sheet-block="scale">
        <div class="sc__head">
          <SheetSectionNo id="scale" />
          <p class="pwd__cap">
            One row per year. Row height: Moore's Law, doubling every two years (a model, floor {{ FLOOR }}px). The film runs on the real data.
          </p>
        </div>
        <ol ref="scaleEl" class="rows">
          <li v-for="r in ROWS" :key="r.year" class="row" :class="{ 'row--m': r.m }" :style="{ [r.line && !r.m ? 'minHeight' : 'height']: `${r.h}px` }">
            <img v-if="r.m && near" :src="r.m.p.src" :alt="r.m.p.alt" :width="r.m.p.w" :height="r.m.p.h" loading="lazy" decoding="async">
            <span class="row__y">{{ r.year }}</span>
            <span class="row__mid">
              <span class="row__bar" :style="{ width: `${r.w}%` }" aria-hidden="true" />
              <span v-if="r.line" class="row__line">{{ r.line }}</span>
            </span>
            <span class="row__x">{{ r.year === YEARS.from ? '×1' : times(r.year) }}</span>
            <span v-if="r.m" class="row__src" aria-hidden="true">{{ r.m.src }}</span>
          </li>
        </ol>
      </section>

      <!-- 02 Diff: the build as a code diff beside the pages -->
      <section class="df" v-bind="sec('diff')" data-sheet-block="diff">
        <div class="sc__head">
          <SheetSectionNo id="diff" />
        </div>
        <div class="df__grid">
          <pre class="df__code" aria-label="The build as a diff: Blender removed, TouchDesigner added, version 1 to 2 changes, the data wired into size, chaos and colour"><code><span v-for="(l, i) in DIFF" :key="i" class="df__l" :class="`df__l--${l.t === '-' ? 'del' : l.t === '+' ? 'add' : l.t === '@' ? 'hunk' : 'ctx'}`"><i aria-hidden="true">{{ l.t === '@' ? '' : l.t }}</i>{{ l.s }}</span></code></pre>
          <figure class="df__page">
            <div class="df__tabs" role="group" aria-label="Process book page">
              <button v-for="(p, i) in PAGES" :key="p.src" type="button" :aria-pressed="page === i" @click="page = i">
                {{ ['Blender', 'V1', 'V2', 'V5'][i] }}
              </button>
            </div>
            <img :src="PAGES[page]!.src" :alt="PAGES[page]!.alt" :width="PAGES[page]!.w" :height="PAGES[page]!.h" loading="lazy" decoding="async">
            <figcaption class="pwd__cap">
              {{ PS.noise }} {{ PS.lock }}
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- 03 The film, then the tool -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="sc__head">
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
        <div class="fm__grid">
          <p class="pwd__text">
            {{ PS.out }} {{ PS.music }}
          </p>
          <figure>
            <img :src="PB.tool.src" :alt="PB.tool.alt" :width="PB.tool.w" :height="PB.tool.h" loading="lazy" decoding="async">
            <figcaption class="pwd__cap">
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
.pwd img,
.pwd video {
  display: block;
  width: 100%;
  height: auto;
}

.pwd figure {
  margin: 0;
}

.pwd__text {
  margin: 0;
  max-width: 44ch;
  font: 400 18px/1.5 var(--font-ui);
}

.pwd__cap {
  margin: 10px 0 0;
  max-width: 70ch;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

/* First view: the burst big, the quiet small */
.op {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
  background: #000;
}

.op__big {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.op__small {
  display: grid;
  grid-template-rows: repeat(3, minmax(0, 1fr));
  border-left: 1px solid #000;
}

.op__small img {
  height: 100% !important;
  min-height: 0;
  object-fit: cover;
}

.op__small img + img {
  border-top: 1px solid #000;
}

/* Sections */
.sc,
.df,
.fm {
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.sc__head {
  margin-bottom: 20px;
}

/* 01 Rows to scale */
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--rule);
}

.row {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: start;
  gap: 0 16px;
  overflow: hidden;
  border-top: 1px solid var(--rule);
  contain: paint;
}

.row__y,
.row__x {
  position: relative;
  z-index: 1;
  padding-top: 4px;
  font: 500 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.row__x {
  grid-column: 3;
  grid-row: 1;
}

.row__mid {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 6px;
  padding: 4px 0;
}

.row__bar {
  height: 2px;
  margin-top: 4px;
  background: var(--c-accent);
}

.row__line {
  max-width: 40ch;
  font: 500 15px/1.35 var(--font-ui);
}

.row--m .row__y,
.row--m .row__x,
.row--m .row__line {
  color: #f2f2ef;
  text-shadow: 0 1px 3px rgb(0 0 0 / 0.7);
}

.row--m .row__y,
.row--m .row__x {
  padding: 8px 8px 0;
}

.row--m .row__mid {
  padding-top: 8px;
}

.row img {
  position: absolute;
  inset: 0;
  height: 100% !important;
  object-fit: cover;
}

.row__src {
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

/* 02 Diff */
.df__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 24px 32px;
  align-items: start;
}

.df__code {
  margin: 0;
  padding: 12px 0;
  overflow-x: auto;
  border: 1px solid var(--rule);
  font: 400 13px/1.7 ui-monospace, SFMono-Regular, Menlo, monospace;
}

.df__l {
  display: block;
  padding: 0 14px 0 0;
  white-space: pre-wrap;
}

.df__l i {
  display: inline-block;
  width: 28px;
  font-style: normal;
  text-align: center;
  color: var(--muted);
}

.df__l--del {
  background: color-mix(in srgb, var(--c-accent) 16%, transparent);
  text-decoration: line-through;
  text-decoration-color: color-mix(in srgb, var(--c-fg) 45%, transparent);
}

.df__l--add {
  background: color-mix(in srgb, var(--c-fg) 9%, transparent);
}

.df__l--hunk {
  margin-top: 8px;
  color: var(--muted);
}

.df__l--hunk:first-child {
  margin-top: 0;
}

.df__l--ctx {
  color: var(--muted);
}

.df__tabs {
  display: inline-flex;
  margin-bottom: 10px;
  border: 1px solid var(--rule);
}

.df__tabs button {
  min-height: 32px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
}

.df__tabs button + button {
  border-left: 1px solid var(--rule);
}

.df__tabs button[aria-pressed='true'] {
  color: var(--c-bg);
  background: var(--c-fg);
}

.df__tabs button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 03 Film */
.fm__video {
  aspect-ratio: 16 / 9;
  background: #000;
}

.fm__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px 40px;
  align-items: start;
  margin-top: 24px;
}

@media (max-width: 720px) {
  .sc,
  .df,
  .fm {
    padding: 22px 16px 28px;
  }

  .df__grid,
  .fm__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .row {
    grid-template-columns: 40px minmax(0, 1fr) auto;
    gap: 0 10px;
  }

  .df__code {
    font-size: 12px;
  }
}
</style>
