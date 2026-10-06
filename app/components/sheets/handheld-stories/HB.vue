<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, DRAFTS, HS, INFO, NAMES, PICS } from './story'

// PROTOTYPE HB "Collection record" (overnight run, Handheld Stories r1). The Sheet as a museum's object record, each
// beat its own device: a vitrine (Will's netsuke ring turning, the object page's close-up, the collection) → a wall
// label for the netsuke beside the brief → a version slider through six passes at the catalogue page → his two
// catalogue rows sliding opposite ways as you scroll → his database page made real, a list you can filter.
// Refs: the British Museum's and Cooper Hewitt's online collection records and gallery wall labels; Figma's version
// history; the opposite-running marquee rows in Obys's and Rejouice's case studies (and Will's own catalogue page).
// Videos play only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy, label fields.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('hb', [
  { id: 'label', label: 'The subject' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'rows', label: 'Catalogue' },
  { id: 'index', label: 'Database' },
])

// Drafts: one slider, six passes
const step = ref(DRAFTS.length - 1)

// Catalogue rows: the section's place in the layer slides the rows opposite ways (transform only, while in view)
const band = ref<HTMLElement>()
const shift = ref(0)
let layer: HTMLElement | null = null
let io: IntersectionObserver | undefined
let raf = 0
function measure() {
  raf = 0
  if (!band.value || !layer) return
  const r = band.value.getBoundingClientRect()
  const h = layer.clientHeight
  shift.value = Math.min(1, Math.max(0, (h - r.top) / (h + r.height)))
}
const onScroll = () => { if (!raf) raf = requestAnimationFrame(measure) }
onMounted(() => {
  if (!band.value) return
  layer = band.value.closest('[data-sheet-layer]')
  if (!layer || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  io = new IntersectionObserver((es) => {
    if (es.some(e => e.isIntersecting)) {
      layer!.addEventListener('scroll', onScroll, { passive: true })
      measure()
    }
    else layer!.removeEventListener('scroll', onScroll)
  }, { root: layer })
  io.observe(band.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  layer?.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(raf)
})

// Database: filter the list
const q = ref('')
const found = computed(() => NAMES.filter(n => n.toLowerCase().includes(q.value.trim().toLowerCase())))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="hb">
      <SheetHead :title="HS.title" :hook="HS.hook" :info="INFO">
        <template #before>
          <div class="vt">
            <figure class="vt__ring">
              <img :src="PICS.circle.src" :width="PICS.circle.w" :height="PICS.circle.h" :alt="PICS.circle.alt" decoding="async">
              <figcaption>Fig. 1 &nbsp;Landing page ring</figcaption>
            </figure>
            <div class="vt__side">
              <figure class="vt__clip">
                <video
                  :src="CLIPS.object.src"
                  :poster="CLIPS.object.poster"
                  width="960"
                  height="540"
                  muted
                  loop
                  playsinline
                  preload="none"
                  data-play
                  :aria-label="CLIPS.object.alt"
                />
                <figcaption>Fig. 2 &nbsp;Object page</figcaption>
              </figure>
              <figure class="vt__pic">
                <img :src="PICS.row.src" :width="PICS.row.w" :height="PICS.row.h" :alt="PICS.row.alt" decoding="async">
                <figcaption>Fig. 3</figcaption>
              </figure>
              <figure class="vt__pic">
                <img :src="PICS.sketchfab.src" :width="PICS.sketchfab.w" :height="PICS.sketchfab.h" :alt="PICS.sketchfab.alt" decoding="async">
                <figcaption>Fig. 4</figcaption>
              </figure>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The subject: a wall label beside the brief -->
      <section class="lb" v-bind="sec('label')" data-sheet-block="label">
        <div class="lb__words">
          <SheetSectionNo id="label" />
          <p class="hb__text">
            {{ HS.brief }}
          </p>
          <p class="hb__text">
            {{ HS.spark }}
          </p>
        </div>
        <div class="lb__wall">
          <div class="lb__card">
            <p class="lb__t">
              Netsuke
            </p>
            <p class="lb__s">
              Japan, Edo period, 1603–1868
            </p>
            <p class="lb__b">
              {{ HS.subject }}
            </p>
            <p class="lb__n">
              Coiled Snake, Goldfish, Sleeping Rat, Meditating Skeleton…
            </p>
          </div>
        </div>
      </section>

      <!-- 02 Drafts: a version slider -->
      <section class="df" v-bind="sec('drafts')" data-sheet-block="drafts">
        <div class="df__stage">
          <img
            v-for="(d, i) in DRAFTS"
            :key="d.k"
            :class="{ 'is-on': step === i }"
            :src="d.pic.src"
            :srcset="d.pic.srcset"
            sizes="(max-width: 720px) 100vw, 680px"
            :alt="step === i ? d.pic.alt : ''"
            :aria-hidden="step !== i"
            :width="d.pic.w"
            :height="d.pic.h"
            loading="lazy"
            decoding="async"
          >
        </div>
        <div class="df__side">
          <SheetSectionNo id="drafts" />
          <p class="hb__text">
            {{ HS.drafts }}
          </p>
          <p class="df__k" aria-live="polite">
            <b>{{ String(step + 1).padStart(2, '0') }}</b> {{ DRAFTS[step]!.k }}
          </p>
          <p class="hb__text">
            {{ DRAFTS[step]!.note }}
          </p>
          <label class="df__range">
            <span class="sr-only">Draft</span>
            <input v-model.number="step" type="range" min="0" :max="DRAFTS.length - 1" step="1" :aria-valuetext="DRAFTS[step]!.k">
          </label>
          <ol class="df__ticks" aria-hidden="true">
            <li v-for="(d, i) in DRAFTS" :key="d.k" :class="{ 'is-on': step === i }">
              {{ i + 1 }}
            </li>
          </ol>
        </div>
      </section>

      <!-- 03 Catalogue: two rows, opposite ways, with the scroll -->
      <section ref="band" class="rw" v-bind="sec('rows')" data-sheet-block="rows">
        <div class="rw__head">
          <SheetSectionNo id="rows" />
          <p class="hb__text">
            {{ HS.rows }}
          </p>
        </div>
        <div class="rw__band" aria-hidden="true">
          <img class="rw__row" :src="PICS.rowTop.src" :width="PICS.rowTop.w" :height="PICS.rowTop.h" alt="" loading="lazy" decoding="async" :style="{ transform: `translate3d(${-shift * 34}%, 0, 0)` }">
          <img class="rw__row rw__row--b" :src="PICS.rowBot.src" :width="PICS.rowBot.w" :height="PICS.rowBot.h" alt="" loading="lazy" decoding="async" :style="{ transform: `translate3d(${-34 + shift * 34}%, 0, 0)` }">
        </div>
      </section>

      <!-- 04 Database: his index page, working -->
      <section class="ix" v-bind="sec('index')" data-sheet-block="index">
        <div class="ix__list">
          <SheetSectionNo id="index" />
          <label class="ix__q">
            <span class="sr-only">Search the netsuke</span>
            <input v-model="q" type="search" placeholder="Enter a keyword" autocomplete="off">
          </label>
          <ul class="ix__names" aria-label="Netsuke in the database page" aria-live="polite">
            <li v-for="n in found" :key="n">
              {{ n }}
            </li>
            <li v-if="!found.length" class="ix__none">
              No match
            </li>
          </ul>
        </div>
        <figure class="ix__clip">
          <video
            :src="CLIPS.database.src"
            :poster="CLIPS.database.poster"
            width="960"
            height="540"
            muted
            loop
            playsinline
            preload="none"
            data-play
            :aria-label="CLIPS.database.alt"
          />
          <figcaption>The database page, as animated</figcaption>
        </figure>
      </section>

      <SheetCredits :items="HS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.hb__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
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

figure {
  margin: 0;
}

figcaption {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* The vitrine: the ring on white, three exhibits beside it */
.vt {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  background: #f4f4f2;
  color: #111;
}

.vt__ring {
  position: relative;
  display: grid;
  place-items: center;
  padding: 32px;
  overflow: hidden;
}

.vt__ring img {
  display: block;
  width: min(100%, 560px);
  height: auto;
  animation: vt-turn 60s linear infinite paused;
}

/* the ring turns only once the Sheet has finished opening */
:global(html[data-sheet='open']) .vt__ring img {
  animation-play-state: running;
}

@keyframes vt-turn {
  to { transform: rotate(360deg); }
}

.vt figcaption {
  position: absolute;
  left: 14px;
  bottom: 12px;
  color: #555;
}

.vt__side {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) minmax(0, 1fr);
  border-left: 1px solid #d8d8d4;
}

.vt__clip,
.vt__pic {
  position: relative;
  overflow: hidden;
}

.vt__pic {
  border-top: 1px solid #d8d8d4;
}

.vt__clip video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #fff;
}

.vt__pic img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vt__clip figcaption,
.vt__pic figcaption {
  padding: 4px 6px;
  background: rgb(255 255 255 / 0.85);
  color: #111;
}

/* 01 The wall label */
.lb {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  border-top: 1px solid var(--rule);
}

.lb__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.lb__wall {
  display: grid;
  place-items: center;
  padding: 40px 24px;
  border-left: 1px solid var(--rule);
  background: var(--fill);
}

.lb__card {
  width: min(100%, 360px);
  padding: 22px 22px 18px;
  background: #f4f4f2;
  color: #111;
  box-shadow: 0 1px 0 rgb(0 0 0 / 0.4);
}

.lb__card p {
  margin: 0;
}

.lb__t {
  font: 700 22px/1.1 var(--font-ui);
  letter-spacing: -0.02em;
}

.lb__s {
  margin-top: 4px !important;
  font: 500 13px/1.3 var(--font-ui);
  color: #444;
}

.lb__b {
  margin-top: 14px !important;
  font: 400 14px/1.5 var(--font-ui);
}

.lb__n {
  margin-top: 14px !important;
  padding-top: 10px;
  border-top: 1px solid #ccc;
  font: 500 11px/1.4 var(--font-ui);
  letter-spacing: 0.04em;
  color: #555;
}

/* 02 Drafts */
.df {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}

.df__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.df__stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 220ms ease-out;
}

.df__stage img.is-on {
  opacity: 1;
}

.df__side {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}

.df__k {
  margin: 12px 0 0;
  font: 600 28px/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.df__k b {
  margin-right: 8px;
  font-weight: 500;
  color: var(--c-accent);
}

.df__range input {
  width: 100%;
  accent-color: var(--c-accent);
  cursor: pointer;
}

.df__ticks {
  display: flex;
  justify-content: space-between;
  margin: -6px 0 0;
  padding: 0;
  list-style: none;
  font: 500 11px/1 var(--font-ui);
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.df__ticks .is-on {
  color: var(--c-fg);
}

/* 03 Catalogue rows */
.rw {
  border-top: 1px solid var(--rule);
  background: #fff;
  color: #111;
  overflow: hidden;
}

.rw__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 24px;
  padding: 24px 24px 8px;
}

.rw__head .hb__text {
  color: #555;
}

.rw__band {
  display: grid;
  gap: 8px;
  padding: 16px 0 32px;
}

.rw__row {
  display: block;
  width: 150%;
  max-width: none;
  height: auto;
}

.rw__row--b {
  transform: translate3d(-34%, 0, 0);
}

/* 04 Database */
.ix {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.ix__list {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.ix__q input {
  width: 100%;
  padding: 10px 12px;
  font: 400 14px/1.2 var(--font-ui);
  color: var(--c-fg);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 0;
}

.ix__q input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 0;
}

.ix__names {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ix__names li:not(.ix__none) {
  padding: 10px 12px;
  font: 500 14px/1.25 var(--font-ui);
  border: 1px solid var(--rule);
}

.ix__none {
  font: 400 14px/1.4 var(--font-ui);
  color: var(--muted);
}

.ix__clip {
  position: relative;
  border-left: 1px solid var(--rule);
  background: #fff;
}

.ix__clip video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

.ix__clip figcaption {
  padding: 12px 16px;
  border-top: 1px solid var(--rule);
  color: var(--c-fg);
  background: var(--c-bg);
}

@media (prefers-reduced-motion: reduce) {
  .vt__ring img { animation: none; }
  .df__stage img { transition: none; }
}

@media (max-width: 720px) {
  .vt,
  .lb,
  .df,
  .ix {
    grid-template-columns: minmax(0, 1fr);
  }

  .vt__side {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-rows: auto auto;
    border-left: 0;
    border-top: 1px solid #d8d8d4;
  }

  .vt__clip {
    grid-column: 1 / -1;
  }

  .vt__pic + .vt__pic {
    border-left: 1px solid #d8d8d4;
  }

  .vt__pic img {
    aspect-ratio: 4 / 3;
  }

  .vt__ring {
    padding: 20px;
  }

  .lb__wall,
  .df__side,
  .ix__clip {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .lb__words,
  .df__side,
  .ix__list {
    padding: 22px 52px 22px 16px;
  }

  .rw__head {
    padding: 22px 52px 8px 16px;
  }

  .rw__row {
    width: 260%;
  }
}
</style>
