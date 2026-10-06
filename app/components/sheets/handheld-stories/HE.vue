<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, DRAFTS, HS, INFO, NAMES, OXFORD, PICS, SB } from './story'

// PROTOTYPE HE "Audio guide" (overnight run, Handheld Stories r2). A museum project told the way a museum tells it:
// a handheld guide. Beats, each its own device: a handset keypad (1–6, arrows, or the number keys) steps a display
// through six stops of the making, from the Oxford visit to the film → the brief beside the landing's netsuke ring → the catalogue's
// two rows sliding opposite ways with the scroll on a white band → the database page as a collection index in big type
// beside its cut. Refs: British Museum and Tate audio-guide handsets; Teenage Engineering's product pages (the keypad);
// the opposite-running rows in Obys's and Rejouice's case studies; Cooper Hewitt's collection index.
// Videos play only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('ag', [
  { id: 'brief', label: 'The brief' },
  { id: 'catalogue', label: 'Catalogue' },
  { id: 'database', label: 'Database' },
])

// The guide: six stops, one on the display
const stop = ref(0)
const N = HS.stops.length
const go = (i: number) => { stop.value = (i + N) % N }
function key(e: KeyboardEvent) {
  const n = Number(e.key)
  if (n >= 1 && n <= N) go(n - 1)
  else if (e.key === 'ArrowRight') go(stop.value + 1)
  else if (e.key === 'ArrowLeft') go(stop.value - 1)
  else return
  e.preventDefault()
}
const filmEl = ref<HTMLVideoElement>()
watch(stop, async (s) => {
  if (s !== N - 1) return
  await nextTick()
  if (document.documentElement.dataset.sheet === 'open') filmEl.value?.play().catch(() => {})
})

// Catalogue rows: the band's place in the layer slides them opposite ways (transform only, while in view)
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
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ag">
      <SheetHead :title="HS.title" :hook="HS.hook" :info="INFO">
        <template #before>
          <div class="gd">
            <div class="gd__screen">
              <div class="gd__view">
                <ul v-if="stop === 0" class="gd__oxf">
                  <li v-for="o in OXFORD.slice(0, 6)" :key="o.src">
                    <img :src="o.src" :width="o.w" :height="o.h" alt="" decoding="async">
                  </li>
                </ul>
                <img v-else-if="stop === 1" :src="PICS.sketchfab.src" :width="PICS.sketchfab.w" :height="PICS.sketchfab.h" :alt="PICS.sketchfab.alt" decoding="async">
                <img v-else-if="stop === 2" :src="DRAFTS[0]!.pic.src" :width="DRAFTS[0]!.pic.w" :height="DRAFTS[0]!.pic.h" :alt="DRAFTS[0]!.pic.alt" decoding="async">
                <img v-else-if="stop === 3" class="gd__dark" :src="PICS.rotoK.src" :width="PICS.rotoK.w" :height="PICS.rotoK.h" :alt="PICS.rotoK.alt" decoding="async">
                <img v-else-if="stop === 4" :src="SB.buttons.src" :width="SB.buttons.w" :height="SB.buttons.h" :alt="SB.buttons.alt" decoding="async">
                <video
                  v-else
                  ref="filmEl"
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
              </div>
              <p class="gd__line" aria-live="polite">
                <b>{{ String(stop + 1).padStart(2, '0') }}</b> {{ HS.stops[stop]!.line }}
              </p>
            </div>
            <div class="gd__pad" role="group" aria-label="Audio guide keypad: choose a stop, or press 1 to 6" @keydown="key">
              <p class="gd__lcd" aria-hidden="true">
                <span>Stop {{ String(stop + 1).padStart(2, '0') }} / {{ String(N).padStart(2, '0') }}</span>
                <span>{{ HS.stops[stop]!.k }}</span>
              </p>
              <div class="gd__keys">
                <button
                  v-for="(s, i) in HS.stops"
                  :key="s.k"
                  type="button"
                  class="gd__key"
                  :aria-pressed="stop === i"
                  :aria-label="`Stop ${i + 1}, ${s.k}`"
                  @click="go(i)"
                >
                  <b>{{ i + 1 }}</b><span>{{ s.k }}</span>
                </button>
                <button type="button" class="gd__key gd__key--nav" aria-label="Previous stop" @click="go(stop - 1)">
                  <b>←</b>
                </button>
                <span class="gd__key gd__key--blank" aria-hidden="true" />
                <button type="button" class="gd__key gd__key--nav" aria-label="Next stop" @click="go(stop + 1)">
                  <b>→</b>
                </button>
              </div>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The brief, beside the landing's ring of netsuke, turning -->
      <section class="bz" v-bind="sec('brief')" data-sheet-block="brief">
        <div class="bz__words">
          <SheetSectionNo id="brief" />
          <p class="ag__text">
            {{ HS.brief2 }}
          </p>
          <p class="ag__text">
            {{ HS.subject }}
          </p>
        </div>
        <div class="bz__row">
          <img class="bz__ring" :src="PICS.circle.src" :width="PICS.circle.w" :height="PICS.circle.h" :alt="PICS.circle.alt" loading="lazy" decoding="async">
        </div>
      </section>

      <!-- 02 Catalogue: two rows, opposite ways, with the scroll -->
      <section class="cr" v-bind="sec('catalogue')" data-sheet-block="catalogue">
        <div class="cr__head">
          <SheetSectionNo id="catalogue" />
          <p class="ag__text">
            {{ HS.rows2 }}
          </p>
        </div>
        <div ref="band" class="cr__band" aria-hidden="true">
          <img class="cr__row" :src="PICS.rowTopC.src" :width="PICS.rowTopC.w" :height="PICS.rowTopC.h" alt="" loading="lazy" decoding="async" :style="{ transform: `translate3d(${-shift * 30}%, 0, 0)` }">
          <img class="cr__row" :src="PICS.rowBotC.src" :width="PICS.rowBotC.w" :height="PICS.rowBotC.h" alt="" loading="lazy" decoding="async" :style="{ transform: `translate3d(${-30 + shift * 30}%, 0, 0)` }">
        </div>
      </section>

      <!-- 03 Database: the collection index -->
      <section class="db" v-bind="sec('database')" data-sheet-block="database">
        <div class="db__words">
          <SheetSectionNo id="database" />
          <p class="ag__text">
            {{ HS.index }}
          </p>
          <ol class="db__names">
            <li v-for="(n, i) in NAMES" :key="n" :class="{ 'is-on': n === 'Meditating Skeleton' }">
              <span>{{ String(i + 1).padStart(2, '0') }}</span>{{ n }}
            </li>
          </ol>
        </div>
        <video
          class="db__film"
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
      </section>

      <SheetCredits :items="HS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ag__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The guide: a display and a keypad */
.gd {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  border-bottom: 1px solid var(--rule);
}

.gd__screen {
  display: grid;
  grid-template-rows: auto auto;
  background: #f4f4f2;
  color: #111;
}

.gd__view {
  display: grid;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #fff;
}

.gd__view > img,
.gd__view > video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gd__view > .gd__dark {
  object-fit: contain;
  background: #0a0a0a;
}

.gd__oxf {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #d8d8d4;
}

.gd__oxf img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
}

.gd__line {
  margin: 0;
  padding: 12px 16px;
  border-top: 1px solid #d8d8d4;
  font: 400 14px/1.45 var(--font-ui);
  color: #333;
}

.gd__line b {
  margin-right: 8px;
  color: var(--c-red, #e03a2f);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.gd__pad {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
  background: #0a0a0a;
  border-left: 1px solid var(--rule);
}

.gd__lcd {
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 12px 14px;
  background: #1a1a1a;
  border: 1px solid var(--rule);
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: var(--c-fg);
}

.gd__keys {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(64px, 1fr);
  gap: 8px;
}

.gd__key {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 6px;
  padding: 8px 4px;
  border: 1px solid var(--rule);
  background: #141414;
  color: var(--c-fg);
  cursor: pointer;
  transition: background-color 140ms ease-out, transform 100ms ease-out;
}

.gd__key b {
  font: 500 24px/1 var(--font-ui);
}

.gd__key span {
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.gd__key:hover {
  background: #202020;
}

.gd__key:active {
  transform: translateY(1px);
}

.gd__key[aria-pressed='true'] {
  background: var(--c-fg);
  color: var(--c-bg);
}

.gd__key[aria-pressed='true'] span {
  color: var(--c-bg);
}

.gd__key:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.gd__key--nav b {
  font-size: 18px;
}

.gd__key--blank {
  border: 0;
  background: none;
  cursor: default;
}

/* 01 The brief */
.bz {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  border-top: 1px solid var(--rule);
}

.bz__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.bz__row {
  display: grid;
  place-items: center;
  overflow: hidden; /* the turning ring's corners stay inside */
  padding: 24px;
  background: #fff;
  border-left: 1px solid var(--rule);
}

.bz__ring {
  display: block;
  width: min(100%, 380px);
  height: auto;
}

/* The ring turns only once the Sheet is open (the whole selector is global: `:global(x) .y` drops the .y) */
.bz__ring {
  animation: ag-turn 90s linear infinite paused;
}

:global(html[data-sheet='open'] .ag .bz__ring) {
  animation-play-state: running;
}

@keyframes ag-turn {
  to { transform: rotate(360deg); }
}

/* 02 Catalogue rows: section number on the dark, the rows on white */
.cr {
  border-top: 1px solid var(--rule);
  overflow: hidden;
}

.cr__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 32px;
  padding: 28px 24px;
}

.cr__band {
  display: grid;
  gap: 12px;
  padding: 28px 0 36px;
  background: #fff;
  overflow: hidden;
}

.cr__row {
  display: block;
  width: 150%;
  max-width: none;
  height: auto;
  will-change: transform;
}

/* 03 Database */
.db {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  border-top: 1px solid var(--rule);
}

.db__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.db__names {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.db__names li {
  display: grid;
  grid-template-columns: 2.4em minmax(0, 1fr);
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
  font: 500 clamp(18px, 2vw, 26px)/1.15 var(--font-ui);
  letter-spacing: -0.01em;
  color: var(--muted);
}

.db__names li span {
  font-size: 12px;
  line-height: 2;
  font-variant-numeric: tabular-nums;
}

.db__names .is-on {
  color: var(--c-fg);
}

.db__names .is-on span {
  color: var(--c-red, #e03a2f);
}

.db__film {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #fff;
  border-left: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .gd__key { transition: none; }
  .bz__ring { animation: none; }
}

@media (max-width: 720px) {
  .gd {
    grid-template-columns: minmax(0, 1fr);
  }

  .gd__pad {
    border-left: 0;
    border-top: 1px solid var(--rule);
    padding: 14px 16px;
  }

  .gd__keys {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: 56px;
  }

  .gd__key--blank {
    display: none;
  }

  .gd__oxf {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .gd__oxf li:nth-child(n + 4) {
    display: none;
  }

  .bz,
  .db {
    grid-template-columns: minmax(0, 1fr);
  }

  .bz__row,
  .db__film {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .db__film {
    height: auto;
    aspect-ratio: 16 / 9;
  }

  .bz__words,
  .db__words,
  .cr__head {
    padding: 22px 52px 22px 16px;
  }
}
</style>
