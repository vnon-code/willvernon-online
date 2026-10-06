<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { CLIMAX, FILM, INFO, moore, PB, PS, TD, times, YEARS } from './story'

// PROTOTYPE PwE "Explorable" (overnight run, Powersurge r2). The reader plays the data. First view: three renders,
// quiet to bloom → 01 Drag the year: a sentence with a live year (a native range input), the film frame for that
// year, where it sits in the film, and what the data has done to size, chaos and colour so far → 02 The ladder: the
// build as a staircase of book pages, Blender struck off the top rung, down through TouchDesigner, the experiments,
// After Effects and Premiere → 03 The film: the climax full width, the slider tool beside the music.
// Refs: Bret Victor's "Explorable Explanations" and Tangle (numbers you drag inside a sentence), his "Up and Down the
// Ladder of Abstraction" (the staircase), Nicky Case's explorables. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('pwe', [
  { id: 'play', label: 'Drag the year' },
  { id: 'ladder', label: 'The ladder' },
  { id: 'film', label: 'The film' },
])

// 01 The year and what follows from it
const year = ref(2005)
const share = computed(() => moore(year.value) / moore(YEARS.to)) // 0..1, the model
// Film time from the frames read on the film: 1997 at 1:00, 2018 at 4:45, 2020 at 5:00 (between them, straight lines)
const KNOWN: [number, number][] = [[1997, 60], [2018, 285], [2020, 300], [2021, 307]]
const filmAt = computed(() => {
  const y = year.value
  for (let i = 1; i < KNOWN.length; i++) {
    const [y0, t0] = KNOWN[i - 1]!
    const [y1, t1] = KNOWN[i]!
    if (y <= y1) return Math.round(t0 + ((y - y0) / (y1 - y0)) * (t1 - t0))
  }
  return 307
})
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
// The frame on screen: the film's own frames where it has them
const frame = computed(() => {
  const y = year.value
  if (y === 2021) return { p: TD.redWide, src: 'Render' }
  if (y >= 2020) return { p: FILM.y2020, src: 'Film, 5:00' }
  if (y === 2019) return { p: TD.purple, src: 'Render' }
  if (y === 2018) return { p: FILM.y2018, src: 'Film, 4:45' }
  if (y >= 2016) return { p: TD.blue, src: 'Render' }
  if (y >= 2000) return { p: TD.sphere, src: 'Render' }
  return { p: FILM.y1997, src: 'Film, 1:00' }
})
const FRAMES = [FILM.y1997, TD.sphere, TD.blue, FILM.y2018, TD.purple, FILM.y2020, TD.redWide]
// A frame mounts the first time its year is picked, then stays for the crossfade (no seven decodes up front)
const seen = ref(new Set([frame.value.p.src]))
watch(frame, f => seen.value.add(f.p.src))
// Colour as the book describes it: blue fixed, red then green rise with the data (a sketch, not the film's values)
const rgb = computed(() => {
  const v = share.value
  const r = Math.round(60 + 195 * Math.min(1, v * 2.2))
  const g = Math.round(40 + 215 * v)
  return `rgb(${r} ${g} 255)`
})
const pctOf = (v: number) => `${Math.max(1, v * 100).toFixed(1)}%`

// 02 The ladder
const RUNGS = [
  { k: 'Blender', p: PB.blender, t: PS.blender, off: true },
  { k: 'TouchDesigner', p: PB.base, t: PS.td },
  { k: 'Experiments', p: PB.experiments, t: PS.bloom },
  { k: 'After Effects', p: PB.ae, t: PS.ae },
  { k: 'Premiere Pro', p: PB.premiere, t: PS.premiere },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="pwe">
      <SheetHead :title="PS.title" :hook="PS.hook" :info="INFO">
        <template #before>
          <div class="tri">
            <img v-for="p in [TD.sphere, TD.purple, TD.red]" :key="p.src" :src="p.src" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
          </div>
        </template>
      </SheetHead>

      <!-- 01 Drag the year -->
      <section class="pl" v-bind="sec('play')" data-sheet-block="play">
        <div class="pl__head">
          <SheetSectionNo id="play" />
        </div>
        <div class="pl__grid">
          <div class="pl__text">
            <p class="pl__sent">
              In
              <output class="pl__year" for="pwe-year">{{ year }}</output>,
              the fastest computers do <b>{{ year === YEARS.from ? 'the same work as' : `${times(year)} the work of` }}</b> 1997.
              The film is at <b>{{ mmss(filmAt) }}</b>.
            </p>
            <input
              id="pwe-year"
              v-model.number="year"
              class="pl__range"
              type="range"
              :min="YEARS.from"
              :max="YEARS.to"
              step="1"
              aria-label="Year"
              :aria-valuetext="`${year}`"
            >
            <div class="pl__ends" aria-hidden="true">
              <span>{{ YEARS.from }}</span><span>{{ YEARS.to }}</span>
            </div>
            <dl class="pl__read">
              <div>
                <dt>Size, chaos</dt>
                <dd><span class="pl__meter"><i :style="{ width: pctOf(share) }" /></span></dd>
              </div>
              <div>
                <dt>Colour</dt>
                <dd><span class="pl__sw" :style="{ background: rgb }" /></dd>
              </div>
            </dl>
            <p class="pwe__cap">
              {{ PS.model }} Colour sketched from the book: blue fixed, red and green rise.
            </p>
          </div>
          <figure class="pl__fig">
            <div class="pl__frames">
              <img
                v-for="p in FRAMES.filter(f => seen.has(f.src))"
                :key="p.src"
                :class="{ on: frame.p.src === p.src }"
                :src="p.src"
                :alt="frame.p.src === p.src ? p.alt : ''"
                :aria-hidden="frame.p.src !== p.src"
                :width="p.w"
                :height="p.h"
                loading="lazy"
                decoding="async"
              >
              <span class="pl__src" aria-hidden="true">{{ frame.src }}</span>
            </div>
          </figure>
        </div>
      </section>

      <!-- 02 The ladder: the build as a staircase of pages -->
      <section class="ld" v-bind="sec('ladder')" data-sheet-block="ladder">
        <div class="pl__head">
          <SheetSectionNo id="ladder" />
        </div>
        <ol class="ld__steps">
          <li v-for="(r, i) in RUNGS" :key="r.k" class="ld__rung" :class="{ 'ld__rung--off': r.off }" :style="{ '--i': i }">
            <span class="ld__k"><s v-if="r.off">{{ r.k }}</s><template v-else>{{ r.k }}</template></span>
            <img :src="r.p.src" :alt="r.p.alt" :width="r.p.w" :height="r.p.h" loading="lazy" decoding="async">
            <p>{{ r.t }}</p>
          </li>
        </ol>
      </section>

      <!-- 03 The film -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="pl__head">
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
          <p class="pwe__text">
            {{ PS.out }} {{ PS.music }}
          </p>
          <figure>
            <img :src="PB.tool.src" :alt="PB.tool.alt" :width="PB.tool.w" :height="PB.tool.h" loading="lazy" decoding="async">
            <figcaption class="pwe__cap">
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
.pwe img,
.pwe video {
  display: block;
  width: 100%;
  height: auto;
}

.pwe figure {
  margin: 0;
}

.pwe__text {
  margin: 0;
  max-width: 44ch;
  font: 400 18px/1.5 var(--font-ui);
}

.pwe__cap {
  margin: 10px 0 0;
  max-width: 60ch;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

/* First view: three renders, quiet to bloom */
.tri {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: #000;
}

.tri img {
  aspect-ratio: 4 / 5;
  object-fit: cover;
}

.tri img + img {
  border-left: 1px solid #000;
}

/* Sections */
.pl,
.ld,
.fm {
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.pl__head {
  margin-bottom: 20px;
}

/* 01 Drag the year */
.pl__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 28px 40px;
  align-items: center;
}

.pl__sent {
  margin: 0;
  font: 500 clamp(22px, 2.4vw, 32px)/1.3 var(--font-ui);
  letter-spacing: -0.02em;
  text-wrap: pretty;
}

.pl__sent b {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pl__year {
  color: var(--c-accent);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border-bottom: 2px dashed var(--c-accent);
}

.pl__range {
  width: 100%;
  margin: 24px 0 0;
  accent-color: var(--c-accent);
  cursor: ew-resize;
}

.pl__range:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 4px;
}

.pl__ends {
  display: flex;
  justify-content: space-between;
  font: 400 12px/1 var(--font-ui);
  color: var(--muted);
}

.pl__read {
  display: grid;
  gap: 10px;
  margin: 24px 0 0;
}

.pl__read div {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.pl__read dt {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pl__read dd {
  margin: 0;
}

.pl__meter {
  display: block;
  height: 10px;
  background: color-mix(in srgb, var(--c-fg) 12%, transparent);
}

.pl__meter i {
  display: block;
  height: 100%;
  background: var(--c-fg);
  transition: width 200ms ease-out;
}

.pl__sw {
  display: block;
  width: 64px;
  height: 22px;
  border: 1px solid var(--rule);
  transition: background-color 200ms ease-out;
}

.pl__frames {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #000;
}

.pl__frames img {
  position: absolute;
  inset: 0;
  height: 100% !important;
  object-fit: cover;
  opacity: 0;
  transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.pl__frames img.on {
  opacity: 1;
}

.pl__src {
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

/* 02 The ladder: each rung steps right and down */
.ld__steps {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ld__rung {
  display: grid;
  grid-template-columns: 160px minmax(0, 360px) minmax(0, 1fr);
  gap: 0 24px;
  align-items: start;
  margin-left: calc(var(--i) * 6%);
  padding: 18px 0;
  border-top: 1px solid var(--rule);
}

.ld__k {
  font: 700 20px/1.1 var(--font-ui);
  letter-spacing: -0.02em;
}

.ld__rung p {
  margin: 0;
  max-width: 38ch;
  font: 400 15px/1.5 var(--font-ui);
}

.ld__rung--off img {
  filter: grayscale(1);
  opacity: 0.55;
}

.ld__rung--off p,
.ld__rung--off .ld__k {
  color: var(--muted);
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

@media (prefers-reduced-motion: reduce) {
  .pl__frames img,
  .pl__meter i,
  .pl__sw {
    transition: none;
  }
}

@media (max-width: 900px) {
  .ld__rung {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px 20px;
    margin-left: calc(var(--i) * 3%);
  }

  .ld__k {
    grid-column: 1 / -1;
  }
}

@media (max-width: 720px) {
  .pl,
  .ld,
  .fm {
    padding: 22px 16px 28px;
  }

  .pl__grid,
  .fm__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .pl__fig {
    order: -1;
  }

  .ld__rung {
    grid-template-columns: minmax(0, 1fr);
    margin-left: calc(var(--i) * 12px);
  }
}
</style>
