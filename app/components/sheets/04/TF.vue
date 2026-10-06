<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TopoCredits from './TopoCredits.vue'
import { B, CAP, GREY, NODES, SQ, TOPO, TRAILER_BRIGHT } from './story'

// PROTOTYPE TF "Waveform" (overnight run, 04 Topography r2, a new challenger).
// Refs: SoundCloud's waveform player (the track drawn as bars you read left to right) for the slate; Apple's exploded
// product views and Stripe's layered diagrams for the process as a stack of layers; a cinema letterbox with a running
// timecode for the cut; date-stamp type (Swiss poster numerals) for the versions. Beats, each its own device:
// the piece as a waveform of its own frames (16 slices of the 1:57: each bar's height is that slice's loudness,
// scaled 28–100%, and its picture the brightest frame in it) → the network as an exploded stack, audio on top, the
// output at the foot → the cut in a letterbox, its timecode running → three tests in three days as date numerals
// beside the grey terrain. Only transforms and opacity move. PLACEHOLDER: sizes, copy, the stack's angle.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// The waveform: measured from the piece's audio (outcome-av-720.mp4), 16 slices
const HEIGHTS = [28, 92, 92, 93, 100, 92, 90, 91, 76, 87, 80, 88, 92, 82, 86, 75]
const bars = HEIGHTS.map((h, i) => ({ h, src: `${B}wave/w${String(i).padStart(2, '0')}.webp` }))
const ticks = ['0:00', '0:30', '1:00', '1:30', '1:57']

// The stack, top to bottom: the signal flows down
const layers = [
  { n: '01', k: 'Audio', pic: NODES.audio, cap: CAP.audio },
  { n: '02', k: 'Colour', pic: NODES.colour, cap: CAP.colour },
  { n: '03', k: 'Visual', pic: NODES.full[1]!, cap: CAP.visual },
  { n: '04', k: 'Out', pic: SQ[3]!, cap: TOPO.height },
]
const lit = ref(-1)

// The letterbox timecode: timeupdate only (a few times a second), the bar scaled by transform
const t = ref(0)
const DUR = 22
const tc = (s: number) => `00:${String(Math.floor(s)).padStart(2, '0')}`
function tick(e: Event) {
  t.value = (e.target as HTMLVideoElement).currentTime % DUR
}

const dates = [
  { d: '10', k: 'Test 1' },
  { d: '11', k: 'Test 2', v: 'the piece', on: true },
  { d: '12', k: 'V3' },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="tf">
      <!-- The piece as a waveform of its own frames -->
      <section class="wv" data-sheet-body data-sheet-block="waveform" aria-label="The piece, as a waveform of its frames">
        <div data-build>
          <div class="wv__bars" role="img" aria-label="Sixteen frames from the 1:57 piece, each bar as tall as the track is loud at that point">
            <span v-for="(b, i) in bars" :key="b.src" class="wv__bar" :style="{ '--h': b.h / 100, '--i': i }">
              <img :src="b.src" alt="" width="180" height="360" decoding="async">
            </span>
          </div>
          <ol class="wv__axis" aria-hidden="true">
            <li v-for="x in ticks" :key="x">
              {{ x }}
            </li>
          </ol>
          <div class="wv__slate">
            <h2 class="wv__title">
              {{ TOPO.title }} <span>{{ TOPO.year }}</span>
            </h2>
            <p class="tf__text wv__line">
              {{ TOPO.line }}
            </p>
            <dl class="wv__specs">
              <div v-for="s in TOPO.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- The network as an exploded stack -->
      <section class="st" data-sheet-block="process" aria-label="How it works, layer by layer">
        <div class="st__stage" aria-hidden="true">
          <figure v-for="(l, i) in layers" :key="l.n" class="st__layer" :class="{ 'is-lit': lit === i }" :style="{ '--i': i }">
            <img :src="l.pic.src" alt="" :width="l.pic.w" :height="l.pic.h" loading="lazy" decoding="async">
          </figure>
        </div>
        <ol class="st__list">
          <li v-for="(l, i) in layers" :key="l.n" @pointerenter="lit = i" @pointerleave="lit = -1">
            <p class="st__k">
              <b>{{ l.n }}</b> {{ l.k }}
            </p>
            <p class="tf__text">
              {{ l.cap }}
            </p>
            <img class="st__flat" :src="l.pic.src" :alt="l.pic.alt" :width="l.pic.w" :height="l.pic.h" loading="lazy" decoding="async">
          </li>
        </ol>
      </section>

      <!-- The cut in a letterbox, its timecode running -->
      <section class="lb" data-sheet-block="cut" aria-label="Cinematic cut">
        <div class="lb__bar">
          <span>Cinematic cut</span>
          <span class="lb__tc">{{ tc(t) }} / 00:{{ DUR }}</span>
        </div>
        <video
          :src="TRAILER_BRIGHT.src"
          :poster="TRAILER_BRIGHT.poster"
          :width="TRAILER_BRIGHT.w"
          :height="TRAILER_BRIGHT.h"
          muted
          loop
          playsinline
          preload="none"
          data-play
          aria-label="Topography AV Test, the 22 second cinematic cut"
          @timeupdate="tick"
        />
        <div class="lb__bar is-foot" aria-hidden="true">
          <span class="lb__run" :style="{ transform: `scaleX(${t / DUR})` }" />
        </div>
      </section>

      <!-- Three tests in three days: date numerals beside the grey terrain -->
      <section class="dt" data-sheet-block="versions" aria-label="Versions">
        <figure class="dt__fig">
          <video :src="GREY.src" :poster="GREY.poster" :width="GREY.w" :height="GREY.h" muted loop playsinline preload="none" data-play aria-label="The terrain in grey, a 9 second loop" />
          <figcaption>{{ GREY.label }}</figcaption>
        </figure>
        <div class="dt__copy">
          <p class="tf__k">
            {{ TOPO.tests }}
          </p>
          <ol class="dt__days">
            <li v-for="d in dates" :key="d.d" :class="{ 'is-on': d.on }">
              <b>{{ d.d }}</b><span>Mar · {{ d.k }}<template v-if="d.v">, {{ d.v }}</template></span>
            </li>
          </ol>
          <p class="tf__text dt__after">
            13 Mar: Static Gens, a stills spin-off (its own card). 25 Apr: the final crit export.
          </p>
        </div>
      </section>

      <TopoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.tf__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tf__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The waveform */
.wv {
  animation: tf-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes tf-in {
  from { opacity: 0; }
}

.wv__bars {
  display: flex;
  align-items: center;
  gap: 3px;
  height: clamp(240px, 30vw, 380px);
  padding: 20px 24px 0;
}

.wv__bar {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  transform: scaleY(var(--h));
  animation: tf-bar 620ms cubic-bezier(0.23, 1, 0.32, 1) calc(700ms + var(--i) * 24ms) both;
}

@keyframes tf-bar {
  from { transform: scaleY(0.04); }
}

.wv__bar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.wv__axis {
  display: flex;
  justify-content: space-between;
  margin: 0 24px;
  padding: 8px 0 0;
  list-style: none;
  font: 500 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  border-top: 1px solid var(--c-accent);
}

.wv__slate {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 4fr) minmax(0, 3fr);
  gap: 24px;
  align-items: start;
  padding: 28px 24px 32px;
}

.wv__title {
  margin: 0;
  font: 600 clamp(26px, 3.2vw, 44px)/1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.wv__title span {
  display: block;
  margin-top: 8px;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
  color: var(--c-accent);
}

.wv__line {
  color: var(--c-fg);
}

.wv__specs {
  display: grid;
  gap: 8px;
  margin: 0;
}

.wv__specs dt {
  font: 500 10px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.wv__specs dd {
  margin: 2px 0 0;
  font: 400 13px/1.4 var(--font-ui);
}

/* The exploded stack: four layers tilted into one isometric view, the list beside it */
.st {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  border-top: 1px solid var(--rule);
  overflow: hidden;
}

.st__stage {
  position: relative;
  height: 580px;
}

.st__layer {
  position: absolute;
  top: calc(var(--i) * 100px - 10px);
  z-index: calc(10 - var(--i));
  left: 14%;
  width: 72%;
  margin: 0;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--rule);
  background: #1e1f22;
  transform: rotateX(58deg) rotateZ(-38deg);
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease;
}

.st__layer.is-lit {
  border-color: var(--c-accent);
  transform: translateY(-18px) rotateX(58deg) rotateZ(-38deg);
}

.st__layer:last-child {
  border-color: var(--c-accent);
}

.st__layer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.st__list {
  display: grid;
  align-content: center;
  margin: 0;
  padding: 24px 24px 24px 0;
  list-style: none;
}

.st__list li {
  display: grid;
  gap: 6px;
  padding: 16px 0;
  border-top: 1px solid var(--rule);
}

.st__list li:first-child {
  border-top: 0;
}

.st__k {
  margin: 0;
  font: 500 12px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.st__k b {
  margin-right: 8px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.st__list .tf__text {
  font-size: 14px;
  line-height: 1.5;
}

.st__flat {
  display: none;
}

/* The letterbox */
.lb {
  background: #000;
  border-top: 1px solid var(--rule);
}

.lb__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 52px;
  padding: 0 24px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}

.lb__tc {
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.lb video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 2.39;
  object-fit: cover;
  background: #000;
}

.lb__bar.is-foot {
  position: relative;
  height: 40px;
}

.lb__run {
  position: absolute;
  left: 24px;
  right: 24px;
  top: 50%;
  height: 2px;
  background: var(--c-accent);
  transform-origin: left center;
  transition: transform 260ms linear;
}

/* Date numerals beside the grey terrain */
.dt {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  border-top: 1px solid var(--rule);
}

.dt__fig {
  position: relative;
  margin: 0;
  border-right: 1px solid var(--rule);
}

.dt__fig video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  background: #000;
}

.dt__fig figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 8px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.6);
}

.dt__copy {
  display: grid;
  align-content: center;
  gap: 20px;
  padding: 32px;
}

.dt__days {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dt__days li {
  display: flex;
  align-items: baseline;
  gap: 18px;
  border-top: 1px solid var(--rule);
}

.dt__days b {
  font: 600 clamp(64px, 9vw, 128px)/0.95 var(--font-ui);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--rule);
}

.dt__days span {
  font: 400 14px/1.4 var(--font-ui);
  color: var(--muted);
}

.dt__days li.is-on b,
.dt__days li.is-on span {
  color: var(--c-accent);
}

.dt__after {
  font-size: 13px;
}

@media (prefers-reduced-motion: reduce) {
  .wv { animation-duration: 1ms; }

  .wv__bar { animation: none; }

  .st__layer,
  .lb__run { transition: none; }
}

@media (max-width: 720px) {
  .wv__bars {
    height: 220px;
    gap: 2px;
    padding: 16px 16px 0;
  }

  .wv__bar:nth-child(even) {
    display: none;
  }

  .wv__axis {
    margin: 0 16px;
  }

  .wv__slate,
  .st,
  .dt {
    grid-template-columns: minmax(0, 1fr);
  }

  .wv__slate {
    gap: 16px;
    padding: 20px 52px 24px 16px;
  }

  .st__stage {
    display: none;
  }

  .st__list {
    padding: 8px 16px 16px;
  }

  .st__list .st__k,
  .st__list .tf__text {
    padding-right: 36px;
  }

  .st__flat {
    display: block;
    width: 100%;
    height: auto;
    margin-top: 6px;
    background: #1e1f22;
  }

  .lb__bar {
    height: 44px;
    padding: 0 16px;
  }

  .lb video {
    aspect-ratio: 16 / 9;
  }

  .dt__fig {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }

  .dt__copy {
    padding: 24px 52px 28px 16px;
  }
}
</style>
