<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CUT, DECRYPT, FILM, GLYPHS, INFO, RM } from './story'

// PROTOTYPE RB "Strata" (overnight run, Remnants r1). The work read top-down like an excavation, each beat its own
// device: the title decrypting as four film frames → a pinned dig: scroll down through five strata of one glyph (stone,
// glyph, grid, line, object), a depth gauge beside, nine glyphs to pick which one you dig → the Photoshop cut as an
// exploded parts list over the filled plate → the film with a speed switch, final 60% against the 100% it was cut at.
// Refs: archaeological section drawings (stratigraphy); the pinned scrollytelling of the NYT's "Snow Fall" and The
// Pudding; IKEA's exploded parts diagrams; video players' speed menus. The dig is CSS scroll-driven (compositor); without
// scroll timelines the strata sit side by side. PLACEHOLDER: sizes, copy, the dig's run length.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('rb', [
  { id: 'dig', label: 'Dig down' },
  { id: 'cut', label: 'Cut and fill' },
  { id: 'speed', label: 'Slowed to 60%' },
])

const on = ref(0)
const g = computed(() => GLYPHS[on.value]!)
// Five strata, surface first: what the viewer sees, down to where it started
const STRATA = computed(() => [
  { k: 'Stone', d: 'Stable Diffusion with a ControlNet guide', kind: 'stone' },
  { k: 'Glyph', d: 'Redrawn in Illustrator, set in Glyphs', kind: 'glyph' },
  { k: 'Grid', d: 'Run through a grid to the lines it needs', kind: 'grid' },
  { k: 'Line', d: 'Traced from a tone drawing', kind: 'line' },
  { k: 'Object', d: `${g.value.from}, Pitt Rivers Museum`, kind: 'obj' },
])
const TIMES = ['0:00', '0:02', '0:04', '0:06']

// The dig's scroll timeline attaches once, 1.2s after the Sheet has opened, and stays: attaching or detaching it
// during the open or close flight cost slow frames in the scorer
const live = ref(false)
let mo: MutationObserver | undefined
let liveT = 0
onMounted(() => {
  const html = document.documentElement
  const arm = () => {
    if (html.dataset.sheet === 'open' && !live.value) liveT = window.setTimeout(() => (live.value = true), 1200)
  }
  mo = new MutationObserver(arm)
  mo.observe(html, { attributes: true, attributeFilter: ['data-sheet'] })
  arm()
})
onBeforeUnmount(() => {
  mo?.disconnect()
  clearTimeout(liveT)
})

// Speed switch: the film as cut (100%) against the final (60%, optical flow)
const film = ref<HTMLVideoElement>()
const fast = ref(false)
watch(fast, (f) => {
  if (film.value) film.value.playbackRate = f ? 1 / 0.6 : 1
})
function onMeta() {
  if (film.value && film.value.currentTime < 9) film.value.currentTime = 9
}
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="rb">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ol class="tl" aria-label="The title sequence, four frames">
            <li v-for="(f, i) in DECRYPT" :key="f">
              <img :src="f" :alt="`Title at ${TIMES[i]}`" width="720" height="160" loading="lazy" decoding="async">
              <span aria-hidden="true">{{ TIMES[i] }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 The dig: pinned, CSS scroll-driven -->
      <section class="dg" v-bind="sec('dig')" data-sheet-block="dig">
        <div class="dg__run" :class="{ 'is-live': live }">
          <div class="dg__stage">
            <div class="dg__head">
              <SheetSectionNo id="dig" />
              <div class="dg__pick" role="group" aria-label="Pick a glyph to dig">
                <button
                  v-for="(x, i) in GLYPHS"
                  :key="x.n"
                  type="button"
                  :aria-pressed="on === i"
                  :aria-label="x.name"
                  :title="x.name"
                  @click="on = i"
                >
                  <span class="dg__mini" :style="{ '--m': `url(${x.glyph})` }" />
                </button>
              </div>
            </div>
            <div class="dg__body">
              <ol class="dg__gauge" aria-label="Strata, surface first">
                <li v-for="(s, i) in STRATA" :key="s.k" :style="{ '--i': i }">
                  <b>{{ String(-i).replace('-0', '0') }} m</b>
                  <span class="dg__k">{{ s.k }}</span>
                  <span class="dg__d">{{ s.d }}</span>
                </li>
              </ol>
              <div class="dg__pit">
                <div v-for="(s, i) in STRATA" :key="s.k" class="dg__layer" :class="`is-${s.kind}`" :style="{ '--i': i }">
                  <img v-if="s.kind === 'stone'" :src="g.stone" :alt="`${g.name} in stone`" width="1600" height="900" loading="lazy" decoding="async">
                  <img v-else-if="s.kind === 'grid'" :src="g.grid" :alt="`${g.name} on the grid`" width="480" height="480" loading="lazy" decoding="async">
                  <img v-else-if="s.kind === 'obj'" :src="g.obj" :alt="g.from" width="220" height="290" loading="lazy" decoding="async">
                  <span v-else class="dg__mask" :style="{ '--m': `url(${s.kind === 'line' ? g.line : g.glyph})` }" role="img" :aria-label="`${g.name}, ${s.k.toLowerCase()}`" />
                  <span class="dg__tag" aria-hidden="true">{{ s.k }} · {{ g.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 02 Cut and fill: the plate and its parts -->
      <section class="ct" v-bind="sec('cut')" data-sheet-block="cut">
        <div class="ct__plate">
          <img :src="CUT.plate" alt="The Haa'sk plate with the glyph cut out and the sky filled" width="1920" height="1080" loading="lazy" decoding="async">
        </div>
        <div class="ct__side">
          <SheetSectionNo id="cut" />
          <p class="rb__text">
            {{ RM.cut }}
          </p>
          <p class="rb__text">
            {{ RM.ae }}
          </p>
        </div>
        <ol class="ct__parts" aria-label="Haa'sk, cut into five pieces">
          <li v-for="(p, i) in CUT.pieces" :key="p.k">
            <img :src="p.src" :alt="p.k" :width="p.w" :height="p.h" loading="lazy" decoding="async">
            <span><b>{{ i + 1 }}</b> {{ p.k }}</span>
          </li>
        </ol>
      </section>

      <!-- 03 Speed -->
      <section class="sp" v-bind="sec('speed')" data-sheet-block="speed">
        <div class="sp__frame">
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
            @loadedmetadata="onMeta"
          />
          <span class="sp__rate" aria-hidden="true">{{ fast ? '100%' : '60%' }}</span>
        </div>
        <div class="sp__side">
          <SheetSectionNo id="speed" />
          <p class="rb__text">
            {{ RM.slow }}
          </p>
          <div class="sp__switch" role="group" aria-label="Playback speed">
            <button type="button" :aria-pressed="!fast" @click="fast = false">
              60% final
            </button>
            <button type="button" :aria-pressed="fast" @click="fast = true">
              100% as cut
            </button>
          </div>
          <p class="rb__text">
            {{ RM.music }}
          </p>
        </div>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.rb__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
.dg__mini, .dg__mask {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}

/* The title: four frames, two by two */
.tl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #000;
}
.tl li {
  position: relative;
}
.tl li:nth-child(even) { border-left: 1px solid rgb(255 255 255 / 0.08); }
.tl li:nth-child(n+3) { border-top: 1px solid rgb(255 255 255 / 0.08); }
.tl img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1440 / 320;
  object-fit: cover;
}
.tl span {
  position: absolute;
  left: 12px;
  top: 10px;
  font: 500 11px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: rgb(255 255 255 / 0.5);
}

/* 01 The dig */
.dg {
  border-top: 1px solid var(--rule);
}
.dg__run {
  position: relative;
}
.dg__stage {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.dg__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 24px;
  padding: 18px 24px;
  border-bottom: 1px solid var(--rule);
}
.dg__pick {
  display: flex;
  gap: 4px;
}
.dg__pick button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--muted);
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: color 160ms ease-out, border-color 160ms ease-out;
}
.dg__pick button:hover { color: var(--c-fg); }
.dg__pick button[aria-pressed=true] {
  color: var(--c-fg);
  border-color: var(--rule);
}
.dg__pick button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 1px;
}
.dg__mini {
  width: 24px;
  height: 24px;
}
.dg__body {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  min-height: 0;
}
.dg__gauge {
  display: grid;
  grid-template-rows: repeat(5, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-right: 1px solid var(--rule);
}
.dg__gauge li {
  display: grid;
  grid-template-columns: 4ch minmax(0, 1fr);
  align-content: center;
  gap: 2px 14px;
  padding: 10px 24px;
  color: var(--muted);
}
.dg__gauge li + li { border-top: 1px solid var(--rule); }
.dg__gauge b {
  grid-row: span 2;
  font: 500 12px/1.3 ui-monospace, 'SF Mono', Menlo, monospace;
}
.dg__k {
  font: 600 15px/1.2 var(--font-ui);
}
.dg__d {
  font: 400 12px/1.4 var(--font-ui);
}
.dg__pit {
  position: relative;
  overflow: hidden;
  background: #0b0d0e;
}
.dg__layer {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.dg__layer img, .dg__mask {
  max-width: 100%;
  max-height: 100%;
}
.is-stone { background: #0b0d0e; }
.is-stone img { width: 100%; height: 100%; object-fit: cover; }
.is-glyph { background: #0b0d0e; color: #f2f2ef; }
.is-glyph .dg__mask { width: 62%; height: 62%; }
.is-grid { background: #fff; }
.is-grid img { height: 92%; width: auto; aspect-ratio: 1; }
.is-line { background: #efece4; color: #e03a2f; }
.is-line .dg__mask { width: 66%; height: 66%; }
.is-obj { background: #1a1714; }
.is-obj img { height: 88%; width: auto; object-fit: contain; }
.dg__tag {
  position: absolute;
  left: 14px;
  bottom: 12px;
  padding: 5px 9px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

/* Pinned and scroll-driven where the browser has scroll timelines; each stratum below opens downward as you dig.
   The strata animations attach once the Sheet has settled open (see `live`). */
@supports (animation-timeline: view()) {
  .dg__run {
    height: calc(var(--view-h) + 200svh);
    view-timeline: --dig block;
  }
  .dg__stage {
    position: sticky;
    top: -16px; /* the layer's padding deflates the sticky rect (as T2b) */
    height: var(--view-h);
    overflow: clip;
  }
  .dg__layer:not(:first-child) {
    clip-path: inset(0 0 100% 0);
  }
  .dg__run.is-live .dg__layer {
    animation: dg-open linear both;
    animation-timeline: --dig;
    animation-range: contain calc(var(--i) * 20% - 12%) contain calc(var(--i) * 20% + 4%);
  }
  .dg__run.is-live .dg__layer:first-child {
    animation: none;
  }
  .dg__run.is-live .dg__gauge li {
    animation: dg-lit linear both;
    animation-timeline: --dig;
    animation-range: contain calc(var(--i) * 20% - 12%) contain calc(var(--i) * 20% + 4%);
  }
  .dg__run.is-live .dg__gauge li:first-child {
    animation: none;
    color: var(--c-fg);
  }
}
@keyframes dg-open {
  to { clip-path: inset(0); }
}
@keyframes dg-lit {
  to { color: var(--c-fg); }
}
/* No scroll timelines: the strata side by side */
@supports not (animation-timeline: view()) {
  .dg__pit {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .dg__layer {
    position: relative;
    aspect-ratio: 3 / 4;
  }
}

/* 02 Cut: the plate, the words, the parts on a cutting mat */
.ct {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}
.ct__plate img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.ct__side {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}
.ct__parts {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
  background-color: #0b0d0e;
  background-image: linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
.ct__parts li {
  display: grid;
  grid-template-rows: 200px auto;
  place-items: center;
  gap: 10px;
  padding: 20px 12px 16px;
  color: #f2f2ef;
}
.ct__parts li + li { border-left: 1px solid rgb(255 255 255 / 0.1); }
.ct__parts img {
  max-width: 100%;
  max-height: 200px;
  width: auto;
  height: auto;
  transition: translate 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.ct__parts li:hover img { translate: 0 -6px; }
.ct__parts span {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
}
.ct__parts b { color: #ff6a5e; margin-right: 4px; }

/* 03 Speed */
.sp {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}
.sp__frame {
  position: relative;
  background: #000;
}
.sp__frame video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}
.sp__rate {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  font: 500 12px/1.2 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}
.sp__side {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}
.sp__switch {
  display: inline-flex;
  justify-self: start;
  border: 1px solid var(--rule);
  border-radius: 999px;
  overflow: hidden;
}
.sp__switch button {
  padding: 10px 14px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
}
.sp__switch button[aria-pressed=true] {
  color: var(--c-bg);
  background: var(--c-fg);
}
.sp__switch button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
@media (prefers-reduced-motion: reduce) {
  .dg__layer, .dg__gauge li { animation: none !important; clip-path: none !important; }
  .dg__pick button, .ct__parts img { transition: none; }
}
@media (max-width: 720px) {
  .tl { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .dg__head { padding: 16px 52px 14px 16px; }
  .dg__pick { flex-wrap: wrap; }
  .dg__pick button { width: 32px; height: 32px; }
  .dg__body {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
  }
  .dg__gauge {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    grid-template-rows: none;
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }
  .dg__gauge li {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 6px;
  }
  .dg__gauge li + li { border-top: 0; border-left: 1px solid var(--rule); }
  .dg__gauge b { grid-row: auto; font-size: 10px; }
  .dg__k { font-size: 12px; }
  .dg__d { display: none; }
  .ct, .sp { grid-template-columns: minmax(0, 1fr); }
  .ct__side, .sp__side {
    padding: 22px 52px 22px 16px;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }
  .ct__parts { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .ct__parts li { grid-template-rows: 110px auto; padding: 14px 4px 12px; }
  .ct__parts img { max-height: 110px; }
  .ct__parts span { font-size: 10px; letter-spacing: 0.02em; }
}
</style>
