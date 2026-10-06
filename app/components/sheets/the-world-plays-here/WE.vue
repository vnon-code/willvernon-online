<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { BP, CONCEPT, INFO, LOOP, M, SLOGANS, TW } from './story'
import { useSeen } from './useSeen'

// PROTOTYPE WE "Zoom out" (overnight run, The World Plays Here r2). Beats, each its own device: a pinned zoom out
// from the key visual to the subway platform it hangs in, the other placements cutting in as picture-in-picture →
// the slogans typed and deleted on one line, the pick left standing, a log of what went → the film's comp as an
// exploded stack of five layers, each lifting from the stack as you point at its line → the loop to close.
// Refs: Eames' Powers of Ten and the scroll zooms on Apple's product pages; a copywriter's draft typed live (type-and-
// delete headlines); exploded-layer comp breakdowns on VFX case pages (Framestore, ILM). The zoom runs on a scroll
// timeline (compositor only) that attaches once the Sheet is open; phones and browsers without one get the platform
// still. PLACEHOLDER: sizes, copy, speeds.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
const draftEl = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
const seen = useSeen(draftEl, 0.5)
void props

const { sec } = useSheetSections('we', [
  { id: 'zoom', label: 'Where it ran' },
  { id: 'slogans', label: 'Five lines' },
  { id: 'comp', label: 'The comp' },
])

// The billboard's screen in xboxsubway1 (1920×1440): x 452–1466, y 518–1012 (measured from the frame)
const PLATFORM = M.subway[0]!
const PIPS = [M.shelter[0]!, M.youtube[1]!, M.insta[1]!]

// The draft: type each line, hold, delete; the pick stays. Runs once, in view; reduced motion shows the end state.
const shown = ref('')
const gone = ref(0)
const done = ref(false)
let timer = 0
const wait = (ms: number) => new Promise<void>(r => (timer = window.setTimeout(r, ms)))
async function draft() {
  for (const s of SLOGANS) {
    for (let i = 1; i <= s.t.length; i++) {
      shown.value = s.t.slice(0, i)
      await wait(42)
    }
    if (s.pick) break
    await wait(650)
    for (let i = s.t.length; i >= 0; i--) {
      shown.value = s.t.slice(0, i)
      await wait(14)
    }
    gone.value++
    await wait(260)
  }
  done.value = true
}
watch(seen, (v) => {
  if (!v) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    shown.value = SLOGANS.at(-1)!.t
    gone.value = SLOGANS.length - 1
    done.value = true
  }
  else draft()
}, { immediate: true })
onBeforeUnmount(() => clearTimeout(timer))

// The comp, bottom to top (pp.15–19)
const LAYERS = [
  { pic: BP.toned, k: 'Background', tool: 'Blender', t: 'Space HDRI. Pushed green, then toned to the brand.' },
  { pic: BP.inLogo, k: 'Earth', tool: 'Blender', t: 'Globe and clouds turn on their own.' },
  { pic: BP.wrap, k: 'Logo', tool: 'Blender', t: 'Four quarters, each turned on Y.' },
  { pic: BP.black, k: 'Render', tool: 'After Effects', t: 'Re-exported with transparency. Logo masked back to white.' },
  { pic: CONCEPT, k: 'Type', tool: 'Premiere Pro', t: 'Rises with the AI voiceover, over the Xbox startup sound.' },
]
const lift = ref(-1)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="TW.title" :hook="TW.brief" :info="INFO" />
    <div ref="root" class="we">
      <!-- 01 The zoom -->
      <section class="zm" v-bind="sec('zoom')" data-sheet-block="zoom">
        <div class="zm__run">
          <div class="zm__stage">
            <div class="zm__world">
              <img :src="PLATFORM.src" :alt="PLATFORM.alt" :width="PLATFORM.w" :height="PLATFORM.h" loading="lazy" decoding="async">
              <img class="zm__board" :src="CONCEPT.src" :alt="CONCEPT.alt" :width="CONCEPT.w" :height="CONCEPT.h" loading="lazy" decoding="async">
            </div>
            <div class="zm__top">
              <SheetSectionNo id="zoom" />
              <p class="zm__cap" aria-hidden="true">
                <span class="is-a">Key visual</span>
                <span class="is-b">Subway, front on</span>
              </p>
            </div>
            <ul class="zm__pips">
              <li v-for="p in PIPS" :key="p.src">
                <img :src="p.src" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 02 The draft -->
      <section class="dr" v-bind="sec('slogans')" data-sheet-block="slogans">
        <div class="we__head">
          <SheetSectionNo id="slogans" />
          <p class="we__text">
            {{ TW.idea }}
          </p>
        </div>
        <div ref="draftEl" class="dr__page" :class="{ 'is-done': done }">
          <p class="dr__line" aria-hidden="true">
            {{ shown }}<span class="dr__caret" />
          </p>
          <ol class="dr__log">
            <li v-for="(s, i) in SLOGANS" :key="s.t" :class="{ 'is-on': s.pick ? done : i < gone, 'is-pick': s.pick }">
              <span class="dr__k">{{ s.pick ? 'Kept' : 'Deleted' }}</span>
              <span class="dr__t">{{ s.t }}</span>
              <span class="dr__why">{{ s.why }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- 03 The comp -->
      <section class="cp" v-bind="sec('comp')" data-sheet-block="comp">
        <div class="cp__stack" aria-hidden="true">
          <div class="cp__plane">
            <img
              v-for="(l, i) in LAYERS"
              :key="l.k"
              :src="l.pic.src"
              alt=""
              :width="l.pic.w"
              :height="l.pic.h"
              loading="lazy"
              decoding="async"
              :class="{ 'is-lift': lift === i, 'is-dim': lift >= 0 && lift !== i }"
              :style="{ '--i': i }"
            >
          </div>
        </div>
        <div class="cp__side">
          <SheetSectionNo id="comp" />
          <ol class="cp__list">
            <li
              v-for="(l, i) in [...LAYERS].reverse()"
              :key="l.k"
              tabindex="0"
              :aria-label="`${l.k}, ${l.tool}: ${l.t} ${l.pic.alt}.`"
              @mouseenter="lift = LAYERS.length - 1 - i"
              @mouseleave="lift = -1"
              @focus="lift = LAYERS.length - 1 - i"
              @blur="lift = -1"
            >
              <b>{{ LAYERS.length - i }}</b>
              <span class="cp__k">{{ l.k }} <em>{{ l.tool }}</em></span>
              <span class="cp__t">{{ l.t }}</span>
            </li>
          </ol>
        </div>
      </section>

      <!-- The loop, to close -->
      <figure class="lp" data-sheet-block="loop">
        <span class="lp__disc">
          <video
            :src="LOOP.src"
            :poster="LOOP.poster"
            :width="LOOP.w"
            :height="LOOP.h"
            muted
            loop
            playsinline
            preload="none"
            data-play
            aria-label="The Xbox logo wrapping the Earth, a 13 second loop"
          />
        </span>
        <figcaption class="we__text">
          The logo wrap, cut from the film as a 13 s loop.
        </figcaption>
      </figure>

      <SheetCredits :items="TW.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.we__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.we__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

.zm,
.dr,
.cp,
.lp {
  border-top: 1px solid var(--rule);
}

/* 01 The zoom. Default (phones, no scroll timelines): the platform still, the PiPs on it */
.zm__stage {
  position: relative;
  overflow: clip;
  background: #000;
}

.zm__world {
  position: relative;
  aspect-ratio: 4 / 3;
}

.zm__world img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* The key visual laid on the billboard's screen */
.zm__world .zm__board {
  position: absolute;
  top: 35.97%;
  left: 23.54%;
  width: 52.81%;
  height: 34.31%;
  opacity: 0;
}

.zm__top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 24px 40px;
  background: linear-gradient(rgb(0 0 0 / 0.7), rgb(0 0 0 / 0));
}

.zm__cap {
  display: grid;
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}

.zm__cap span {
  grid-area: 1 / 1;
  text-align: right;
}

.zm__cap .is-a {
  opacity: 0;
}

.zm__pips {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.zm__pips li {
  width: 132px;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border: 2px solid #fff;
  background: #e9e9e9;
  box-shadow: 0 8px 24px rgb(0 0 0 / 0.5);
}

.zm__pips img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.15;
}

@supports (animation-timeline: view()) {
  @media (min-width: 721px) {
    .zm__run {
      height: calc(var(--view-h) + 150svh);
      view-timeline: --zm block;
      view-timeline-inset: var(--header-h) 0;
    }

    .zm__stage {
      position: sticky;
      top: -16px; /* the layer's padding: pins it just under the header, as MB and SF */
      display: grid;
      align-items: center;
      height: var(--view-h);
    }

    /* Zoomed so the board's screen fills the width, then back to the whole platform */
    .zm__world {
      transform-origin: 49.95% 53.13%;
      transform: translate(0.05%, -3.13%) scale(1.894);
    }

    .zm__board { opacity: 1; }
    .zm__cap .is-a { opacity: 1; }
    .zm__cap .is-b { opacity: 0; }

    .zm__pips li {
      opacity: 0;
      translate: 0 24px;
    }

    .zm__world,
    .zm__board,
    .zm__cap span,
    .zm__pips li {
      animation: none linear both;
      animation-timeline: --zm;
      animation-fill-mode: both; /* the shorthand's fill didn't hold past the range end in Chrome; say it again */
    }

    .zm__world { animation-range: contain 0% contain 60%; animation-timing-function: cubic-bezier(0.45, 0, 0.55, 1); }
    .zm__board { animation-range: contain 22% contain 50%; }
    .zm__cap .is-a { animation-range: contain 20% contain 34%; }
    .zm__cap .is-b { animation-range: contain 34% contain 48%; }
    .zm__pips li { animation-range: contain 62% contain 76%; }
    .zm__pips li:nth-child(2) { animation-range: contain 68% contain 82%; }
    .zm__pips li:nth-child(3) { animation-range: contain 74% contain 88%; }

    html[data-sheet='open'] .zm__world { animation-name: we-zoom; }
    html[data-sheet='open'] .zm__board,
    html[data-sheet='open'] .zm__cap .is-a { animation-name: we-out; }
    html[data-sheet='open'] .zm__cap .is-b,
    html[data-sheet='open'] .zm__pips li { animation-name: we-in; }
  }
}

@keyframes we-zoom {
  to { transform: none; }
}

@keyframes we-out {
  to { opacity: 0; }
}

@keyframes we-in {
  to { opacity: 1; translate: 0 0; }
}

/* 02 The draft */
.dr__page {
  padding: 8px 24px 36px;
}

.dr__line {
  min-height: 2.2em;
  margin: 0 0 24px;
  font: 600 clamp(28px, 5.4vw, 72px)/1.05 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.dr__caret {
  display: inline-block;
  width: 0.08em;
  height: 0.9em;
  margin-left: 0.06em;
  vertical-align: -0.06em;
  background: var(--c-accent);
}

.is-done .dr__caret {
  animation: we-blink 1s steps(1) 3 forwards;
}

@keyframes we-blink {
  50% { opacity: 0; }
  to { opacity: 0; }
}

.dr__log {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.dr__log li {
  display: grid;
  grid-template-columns: 90px minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px;
  align-items: baseline;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
  font: 400 14px/1.4 var(--font-ui);
  opacity: 0;
  translate: 0 6px;
  transition: opacity 240ms ease-out, translate 240ms ease-out;
}

.dr__log li:not(.is-on) {
  opacity: 0.28;
  translate: none;
}

.dr__log li.is-on {
  opacity: 1;
  translate: 0 0;
}

.dr__k {
  font: 500 10px/1.4 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.dr__log li:not(.is-pick) .dr__t {
  color: var(--muted);
}

.is-pick .dr__k {
  color: var(--c-accent);
}

.dr__why {
  color: var(--muted);
}

/* 03 The comp: five layers pulled apart in depth */
.cp {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  align-items: center;
}

.cp__stack {
  display: grid;
  place-items: center;
  height: 600px;
  overflow: clip;
  perspective: 1800px;
}

.cp__plane {
  position: relative;
  width: 64%;
  aspect-ratio: 16 / 9;
  transform-style: preserve-3d;
  transform: translateY(14%) rotateX(58deg) rotateZ(-34deg);
}

.cp__plane img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: 1px solid rgb(255 255 255 / 0.4);
  background: #000;
  transform: translateZ(calc(var(--i) * 64px));
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out;
}

.cp__plane img.is-lift {
  border-color: #fff;
  transform: translateZ(calc(var(--i) * 64px + 48px));
}

.cp__plane img.is-dim {
  opacity: 0.35;
}

.cp__side {
  display: grid;
  gap: 18px;
  padding: 28px 24px 28px 0;
}

.cp__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cp__list li {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 2px 10px;
  padding: 12px 8px 12px 0;
  border-top: 1px solid var(--rule);
  cursor: default;
  outline-offset: 2px;
}

.cp__list li:hover,
.cp__list li:focus-visible {
  background: color-mix(in srgb, var(--c-fg) 6%, var(--c-bg));
}

.cp__list b {
  grid-row: span 2;
  font: 600 22px/1 var(--font-ui);
  color: var(--c-accent);
}

.cp__k {
  font: 500 14px/1.3 var(--font-ui);
}

.cp__k em {
  margin-left: 6px;
  font: 500 10px/1 var(--font-ui);
  font-style: normal;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cp__t {
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

/* The loop, to close */
.lp {
  display: grid;
  justify-items: center;
  gap: 18px;
  margin: 0;
  padding: 48px 24px;
  background: #000;
}

.lp__disc {
  width: min(420px, 70%);
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 50%;
  border: 1px dashed rgb(255 255 255 / 0.3);
}

.lp__disc video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lp figcaption {
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .zm__world,
  .zm__board,
  .zm__cap span,
  .zm__pips li { animation: none !important; }

  .zm__world { transform: none !important; }
  .zm__board { opacity: 0 !important; }
  .zm__cap .is-a { opacity: 0 !important; }
  .zm__cap .is-b,
  .zm__pips li { opacity: 1 !important; translate: none !important; }

  .dr__log li,
  .cp__plane img { transition: none; }
}

@media (max-width: 720px) {
  .we__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 16px 16px;
  }

  .zm__top {
    padding: 14px 16px 30px;
  }

  .zm__cap {
    display: none;
  }

  .zm__pips {
    right: 10px;
    bottom: 10px;
    gap: 6px;
  }

  .zm__pips li {
    width: 76px;
  }

  .dr__page {
    padding: 4px 16px 28px;
  }

  .dr__log li {
    grid-template-columns: minmax(0, 1fr);
    gap: 4px;
  }

  .cp {
    grid-template-columns: minmax(0, 1fr);
  }

  .cp__stack {
    height: 340px;
  }

  .cp__plane {
    width: 74%;
  }

  .cp__plane img {
    transform: translateZ(calc(var(--i) * 34px));
  }

  .cp__plane img.is-lift {
    transform: translateZ(calc(var(--i) * 34px + 24px));
  }

  .cp__side {
    padding: 0 16px 28px;
  }

  .lp {
    padding: 36px 16px;
  }
}
</style>
