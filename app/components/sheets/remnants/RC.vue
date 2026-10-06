<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { FILM, GLYPHS, INFO, RM, SEEDS, TESTS } from './story'

// PROTOTYPE RC "Collection" (overnight run, Remnants r1). The Sheet as a museum's online collection, each beat its own
// device: the nine source objects in a vitrine row → a catalogue: nine glyph cards, one open as a full object record
// (stone, fields, object/grid/glyph) → a light table: the ControlNet guide laid over the stone with an opacity slider,
// then the first tests on a swipe rail → the film as chapters, one glyph a chapter, the active one following playback.
// Refs: the Pitt Rivers Museum's object records and accession catalogues; the British Museum's and Cooper Hewitt's
// collection pages; a light table's onion skin; chaptered video players (YouTube chapters). PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('rc', [
  { id: 'catalogue', label: 'The catalogue' },
  { id: 'guide', label: 'The guide' },
  { id: 'film', label: 'In the film' },
])

const tc = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const on = ref(0)
const g = computed(() => GLYPHS[on.value]!)
const guide = ref(60)
const KEPT = SEEDS.find(s => s.pick)!

// Chapters: a click seeks the film; the active chapter follows playback
const film = ref<HTMLVideoElement>()
const now = ref(0)
// The film shows Griin before Saa'sk: chapters run in film order
const CHAPTERS = GLYPHS.slice().sort((a, b) => a.t - b.t)
const chapter = computed(() => {
  let c = -1
  GLYPHS.forEach((x, i) => { if (now.value >= x.t) c = i })
  return c
})
function seek(t: number) {
  const v = film.value
  if (!v) return
  if (v.preload !== 'auto') v.preload = 'auto'
  v.currentTime = t
  now.value = t
}
function onTime() {
  if (film.value) now.value = film.value.currentTime
}
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="rc">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ol class="vt" aria-label="The nine objects, Pitt Rivers Museum">
            <li v-for="x in GLYPHS" :key="x.n">
              <img :src="x.obj" :alt="x.from" width="220" height="290" loading="lazy" decoding="async">
              <span>{{ x.from }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 The catalogue: cards and one open record -->
      <section class="cg" v-bind="sec('catalogue')" data-sheet-block="catalogue">
        <div class="cg__side">
          <SheetSectionNo id="catalogue" />
          <p class="rc__text">
            {{ RM.museum }} {{ RM.lines }}
          </p>
          <ul class="cg__cards" aria-label="Glyphs">
            <li v-for="(x, i) in GLYPHS" :key="x.n">
              <button type="button" :aria-pressed="on === i" @click="on = i">
                <span class="cg__g" :style="{ '--m': `url(${x.glyph})` }" aria-hidden="true" />
                <span class="cg__n">{{ x.name }}</span>
              </button>
            </li>
          </ul>
        </div>
        <article class="rec" aria-live="polite">
          <div class="rec__img">
            <img v-for="(x, i) in GLYPHS" v-show="on === i" :key="x.n" :src="x.stoneSm" :alt="`${x.name} in stone, from the film`" width="800" height="450" loading="lazy" decoding="async">
          </div>
          <dl class="rec__f">
            <div><dt>Name</dt><dd>{{ g.name }}</dd></div>
            <div><dt>From</dt><dd>{{ g.from }}</dd></div>
            <div><dt>Key</dt><dd>{{ g.key }}</dd></div>
            <div><dt>In the film</dt><dd>{{ tc(g.t) }}</dd></div>
          </dl>
          <ol class="rec__trail" aria-label="Object, grid, glyph">
            <li class="rec__obj">
              <img :src="g.obj" :alt="g.from" width="220" height="290" loading="lazy" decoding="async">
            </li>
            <li class="rec__grid">
              <img :src="g.grid" :alt="`${g.name} on the grid`" width="480" height="480" loading="lazy" decoding="async">
            </li>
            <li class="rec__glyph">
              <span class="cg__g" :style="{ '--m': `url(${g.glyph})` }" role="img" :aria-label="`${g.name}, final glyph`" />
            </li>
          </ol>
        </article>
      </section>

      <!-- 02 The guide over the stone -->
      <section class="lt" v-bind="sec('guide')" data-sheet-block="guide">
        <div class="lt__table">
          <img :src="g.stone" :alt="`${g.name} in stone`" width="1600" height="900" loading="lazy" decoding="async">
          <span class="lt__guide" :style="{ '--m': `url(${g.glyph})`, 'opacity': guide / 100 }" aria-hidden="true" />
        </div>
        <div class="lt__side">
          <SheetSectionNo id="guide" />
          <p class="rc__text">
            {{ RM.cn }}
          </p>
          <label class="lt__range">
            <span>Guide {{ guide }}%</span>
            <input v-model.number="guide" type="range" min="0" max="100" step="1">
          </label>
          <p class="lt__prompt">
            <code>seed {{ KEPT.seed }}</code> {{ KEPT.prompt }}
          </p>
          <p class="rc__text">
            {{ RM.seed }}
          </p>
        </div>
        <div class="lt__snag">
          <p class="lt__k">
            {{ RM.snag }}
          </p>
          <ul class="lt__rail" aria-label="ControlNet's first tests">
            <li v-for="(t, i) in TESTS" :key="t">
              <img :src="t" :alt="`First test ${i + 1}`" width="540" height="540" loading="lazy" decoding="async">
            </li>
          </ul>
        </div>
      </section>

      <!-- 03 The film, a chapter per glyph -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="fm__frame">
          <video
            ref="film"
            :src="FILM.src"
            :poster="FILM.poster"
            :width="FILM.w"
            :height="FILM.h"
            muted
            loop
            playsinline
            preload="none"
            data-play
            aria-label="Remnants, the film, muted"
            @timeupdate="onTime"
          />
        </div>
        <ol class="fm__ch" aria-label="Chapters">
          <li>
            <button type="button" :aria-current="chapter === -1" @click="seek(0)">
              <span class="fm__t">0:00</span>
              <span class="fm__n">Title</span>
            </button>
          </li>
          <li v-for="x in CHAPTERS" :key="x.n">
            <button type="button" :aria-current="chapter === GLYPHS.indexOf(x)" :aria-label="`${x.name}, ${tc(x.t)}`" @click="seek(x.t)">
              <span class="fm__t" aria-hidden="true">{{ tc(x.t) }}</span>
              <span class="cg__g fm__g" :style="{ '--m': `url(${x.glyph})` }" aria-hidden="true" />
              <span class="fm__n" aria-hidden="true">{{ x.name }}</span>
            </button>
          </li>
        </ol>
        <div class="fm__notes">
          <p class="rc__text">
            {{ RM.decrypt }}
          </p>
          <p class="rc__text">
            {{ RM.slow }} {{ RM.music }}
          </p>
        </div>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.rc__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
.cg__g, .lt__guide {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}

/* The vitrine: nine objects under glass */
.vt {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #14110e;
}
.vt li {
  position: relative;
  overflow: hidden;
}
.vt li + li { border-left: 1px solid rgb(255 255 255 / 0.08); }
.vt img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  transition: scale 400ms cubic-bezier(0.23, 1, 0.32, 1);
}
.vt span {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18px 8px 8px;
  font: 500 10px/1.25 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: linear-gradient(transparent, rgb(0 0 0 / 0.7));
}
@media (hover: hover) {
  .vt li:hover img { scale: 1.05; }
}

/* 01 Catalogue */
.cg {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  border-top: 1px solid var(--rule);
}
.cg__side {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 28px 24px;
}
.cg__cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}
.cg__cards li {
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.cg__cards button {
  display: grid;
  justify-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 6px 10px;
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 160ms ease-out, background-color 160ms ease-out;
}
.cg__cards button:hover { color: var(--c-fg); }
.cg__cards button[aria-pressed=true] {
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-fg) 7%, transparent);
}
.cg__cards button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
.cg__cards .cg__g {
  width: 44px;
  height: 44px;
}
.cg__n {
  font: 500 12px/1 var(--font-ui);
}
.rec {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-left: 1px solid var(--rule);
}
.rec__img {
  grid-column: 1 / -1;
  background: #0b0d0e;
}
.rec__img img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.rec__f {
  margin: 0;
  border-top: 1px solid var(--rule);
}
.rec__f div {
  display: grid;
  grid-template-columns: 11ch minmax(0, 1fr);
  padding: 9px 16px;
}
.rec__f div + div { border-top: 1px solid var(--rule); }
.rec__f dt {
  font: 500 11px/1.5 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.rec__f dd {
  margin: 0;
  font: 500 14px/1.4 var(--font-ui);
}
.rec__trail {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
  border-left: 1px solid var(--rule);
}
.rec__trail li + li { border-left: 1px solid var(--rule); }
.rec__trail img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}
.rec__glyph {
  display: grid;
  place-items: center;
}
.rec__glyph .cg__g {
  width: 70%;
  aspect-ratio: 1;
}

/* 02 The light table */
.lt {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}
.lt__table {
  position: relative;
  background: #0b0d0e;
}
.lt__table img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
/* The guide sits over the glyph's place in the frame (by eye; PLACEHOLDER) */
.lt__guide {
  position: absolute;
  left: 30%;
  right: 30%;
  top: 16%;
  bottom: 18%;
  color: #ff4b3e;
  pointer-events: none;
}
.lt__side {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}
.lt__range {
  display: grid;
  gap: 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.lt__range input {
  width: 100%;
  accent-color: #e03a2f;
}
.lt__prompt {
  margin: 0;
  padding: 12px 14px;
  font: 400 13px/1.55 var(--font-ui);
  border-left: 2px solid #e03a2f;
  background: color-mix(in srgb, var(--c-fg) 6%, transparent);
}
.lt__prompt code {
  display: block;
  margin-bottom: 4px;
  font: 500 12px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #e03a2f;
}
.lt__snag {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.lt__k {
  margin: 0;
  padding: 24px;
  font: 500 15px/1.5 var(--font-ui);
}
.lt__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 34%;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  border-left: 1px solid var(--rule);
}
.lt__rail li {
  scroll-snap-align: start;
}
.lt__rail li + li { border-left: 1px solid var(--rule); }
.lt__rail img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}

/* 03 The film in chapters */
.fm {
  border-top: 1px solid var(--rule);
}
.fm__frame {
  background: #000;
}
.fm__frame video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
.fm__ch {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}
.fm__ch li + li { border-left: 1px solid var(--rule); }
.fm__ch button {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 8px;
  width: 100%;
  height: 100%;
  padding: 12px 4px;
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 160ms ease-out;
}
.fm__ch button::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -1px;
  height: 2px;
  background: #e03a2f;
  scale: 0 1;
  transition: scale 240ms cubic-bezier(0.23, 1, 0.32, 1);
}
.fm__ch button[aria-current=true] { color: var(--c-fg); }
.fm__ch button[aria-current=true]::after { scale: 1 1; }
.fm__ch button:hover { color: var(--c-fg); }
.fm__ch button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
.fm__t {
  font: 500 11px/1 ui-monospace, 'SF Mono', Menlo, monospace;
}
.fm__g {
  width: 28px;
  height: 28px;
}
.fm__n {
  font: 500 12px/1 var(--font-ui);
}
.fm__notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 32px;
  padding: 24px 24px 32px;
  border-top: 1px solid var(--rule);
}
@media (prefers-reduced-motion: reduce) {
  .vt img, .cg__cards button, .fm__ch button, .fm__ch button::after { transition: none; }
}
@media (max-width: 720px) {
  .vt { grid-template-columns: repeat(9, minmax(0, 1fr)); }
  .vt img { aspect-ratio: 1 / 2.2; }
  .vt span { display: none; }
  .cg, .lt, .lt__snag, .rec { grid-template-columns: minmax(0, 1fr); }
  .cg__side, .lt__side {
    padding: 22px 52px 22px 16px;
  }
  .rec, .lt__side, .lt__rail { border-left: 0; }
  .rec { border-top: 1px solid var(--rule); }
  .rec__trail { border-left: 0; }
  .lt__k { padding: 18px 16px; }
  .lt__rail { grid-auto-columns: 62%; }
  .fm__ch { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .fm__ch li:nth-child(n+6) { border-top: 1px solid var(--rule); }
  .fm__ch li:nth-child(6) { border-left: 0; }
  .fm__n { font-size: 11px; }
  .fm__notes { grid-template-columns: minmax(0, 1fr); padding: 20px 16px 28px; }
}
</style>
