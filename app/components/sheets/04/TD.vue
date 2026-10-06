<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TopoCredits from './TopoCredits.vue'
import { CAP, GREY, NODES, SQ, TOPO, TRAILER_BRIGHT, WIDE } from './story'

// PROTOTYPE TD "Survey sheet, keyed" (overnight run, 04 Topography r2): TB refined with the r1 judges' notes.
// Refs as TB: printed survey maps (Swisstopo and OS Explorer: cover panel, lettered border, legend, grid references),
// print proofs for the crop marks, Kenta Toshikura's tiled grids; plus elevation-tint maps for the rings.
// Changes from TB: the A/B/C key is gone, each network now sits in the map as a grid square (C2 audio, A3 colour,
// B4 visual) with a 1–2 line caption; six picture tiles, not eight, with no near-duplicates (the two near-black wide
// stills are out); the cut's proof has a bright poster and starts on its bright stretch; the contour rings draw in
// as they scroll into view and each one is a button that shows that version (Test 2 is the piece; the others say
// so). Only transforms and opacity move. PLACEHOLDER: sizes, copy, the tile order.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// Picture tiles, by grid reference (column letter, row number). Cover A1–A2, legend A4, grey terrain C3.
const tiles = [
  { r: 'B1', pic: SQ[0]!, cls: 't-b1' },
  { r: 'C1', pic: WIDE.lines, cls: 't-c1 is-wide' },
  { r: 'B2', pic: SQ[4]!, cls: 't-b2' },
  { r: 'D3', pic: SQ[3]!, cls: 't-d3' },
  { r: 'D4', pic: SQ[2]!, cls: 't-d4' },
]
// The process, as squares on the same map
const keyed = [
  { r: 'C2', k: 'Audio', pic: NODES.audio, cap: CAP.audio, cls: 't-c2' },
  { r: 'A3', k: 'Colour', pic: NODES.colour, cap: CAP.colour, cls: 't-a3' },
  { r: 'B4', k: 'Visual', pic: NODES.full[0]!, cap: CAP.visual, cls: 't-b4' },
]
const legend = [
  { key: 'line', v: 'Contour: the terrain' },
  { key: 'fill', v: TOPO.height },
  { key: 'ramp', v: 'Hue: set by the volume' },
]

// Versions, outermost ring first (the earliest test at the foot, the crit at the peak)
const PIECE = { src: '/img/posters/experiments-topographyav-test2-69s.webp', w: 960, h: 960, alt: 'Test 2 at 1:09: red contour bands on black' }
const rings = [
  { d: '10 Mar', k: 'Test 1', v: 'Not shown here.' },
  { d: '11 Mar', k: 'Test 2', v: 'The piece at the top of this page.', pic: PIECE },
  { d: '12 Mar', k: 'V3', v: 'Not shown here.' },
  { d: '13 Mar', k: 'Static Gens', v: 'A stills spin-off, with its own card.' },
  { d: '25 Apr', k: 'Final crit', v: 'The last export, not shown here.' },
]
const sel = ref(1)
const on = computed(() => rings[sel.value]!)

// The rings draw in once, when the map scrolls into view
const map = ref<HTMLElement>()
const drawn = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!map.value) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawn.value = true
    return
  }
  io = new IntersectionObserver((es) => {
    if (es.some(e => e.isIntersecting)) {
      drawn.value = true
      io?.disconnect()
    }
  }, { root: map.value.closest('[data-sheet-layer]'), threshold: 0.3 })
  io.observe(map.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="td">
      <!-- The sheet: a lettered grid; the cover, the legend and the process are squares on it -->
      <section class="mp" data-sheet-body data-sheet-block="sheet" aria-label="The piece, as a map sheet">
        <div data-build>
          <div class="mp__grid">
            <div class="mp__cover">
              <p class="mp__no">
                Sheet <b>04</b>
              </p>
              <h2 class="mp__title">
                {{ TOPO.title }}
              </h2>
              <p class="mp__year">
                {{ TOPO.year }}
              </p>
              <p class="td__text">
                {{ TOPO.line }}
              </p>
              <dl class="mp__specs">
                <div v-for="s in TOPO.specs" :key="s.k">
                  <dt>{{ s.k }}</dt>
                  <dd>{{ s.v }}</dd>
                </div>
              </dl>
            </div>
            <figure v-for="t in tiles" :key="t.r" class="mp__tile" :class="t.cls">
              <img :src="t.pic.src" :alt="t.pic.alt" :width="t.pic.w" :height="t.pic.h" decoding="async" :loading="t.r.endsWith('1') ? 'eager' : 'lazy'">
              <figcaption>{{ t.r }}</figcaption>
            </figure>
            <figure v-for="k in keyed" :key="k.r" class="mp__key-cell" :class="k.cls">
              <img :src="k.pic.src" :alt="k.pic.alt" :width="k.pic.w" :height="k.pic.h" loading="lazy" decoding="async">
              <figcaption>
                <span class="mp__ref">{{ k.r }} <b>{{ k.k }}</b></span>
                {{ k.cap }}
              </figcaption>
            </figure>
            <figure class="mp__tile t-c3">
              <video
                :src="GREY.src"
                :poster="GREY.poster"
                :width="GREY.w"
                :height="GREY.h"
                muted
                loop
                playsinline
                preload="none"
                data-play
                aria-label="The terrain in grey, a 9 second loop"
              />
              <figcaption>C3</figcaption>
            </figure>
            <div class="mp__legend">
              <p class="td__k">
                Legend
              </p>
              <ul>
                <li v-for="l in legend" :key="l.key">
                  <span class="mp__sw" :class="`k-${l.key}`" aria-hidden="true" />{{ l.v }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- The cinematic cut, a proof in crop marks -->
      <section class="pf" data-sheet-block="cut" aria-label="Cinematic cut">
        <figure class="pf__fig">
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
          />
          <figcaption>
            <span>Fig. 1</span>{{ TRAILER_BRIGHT.label }}
          </figcaption>
        </figure>
      </section>

      <!-- Versions as contour rings: each ring a button; the readout shows the one picked -->
      <section class="rg" data-sheet-block="versions" aria-label="Versions">
        <div class="rg__head">
          <p class="td__k">
            Versions
          </p>
          <p class="td__text">
            {{ TOPO.tests }}
          </p>
        </div>
        <div class="rg__body">
          <div ref="map" class="rg__map">
            <ol class="rg__rings" :class="{ 'is-drawn': drawn }">
              <li v-for="(v, i) in rings" :key="v.k" :style="{ '--i': i }" :class="{ 'is-on': sel === i, 'is-piece': !!v.pic }">
                <button type="button" :aria-pressed="sel === i" @click="sel = i" @pointerenter="sel = i">
                  <span class="rg__label"><b>{{ v.d }}</b> {{ v.k }}</span>
                </button>
              </li>
            </ol>
          </div>
          <div class="rg__out" aria-live="polite">
            <figure class="rg__pic" :class="{ 'is-empty': !on.pic }">
              <img v-if="on.pic" :src="on.pic.src" :alt="on.pic.alt" :width="on.pic.w" :height="on.pic.h" loading="lazy" decoding="async">
              <span v-else aria-hidden="true">{{ on.k }}</span>
            </figure>
            <p class="rg__read">
              <b>{{ on.d }} · {{ on.k }}</b>{{ on.v }}
            </p>
          </div>
        </div>
      </section>

      <TopoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.td__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.td__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The sheet */
.mp {
  animation: td-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes td-in {
  from { opacity: 0; }
}

.mp__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.mp__grid > * {
  min-width: 0;
  margin: 0;
  background: var(--c-bg);
}

.mp__cover {
  grid-area: 1 / 1 / 3 / 2;
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 22px 20px;
  border-top: 3px solid var(--c-accent);
}

.mp__no {
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.mp__no b {
  display: block;
  margin-top: 6px;
  font-size: 56px;
  font-weight: 600;
  letter-spacing: -0.03em;
  color: var(--c-accent);
}

.mp__title {
  margin: 0;
  font: 600 28px/1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.mp__year {
  margin: -6px 0 0;
  font: 400 15px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.mp__specs {
  display: grid;
  gap: 8px;
  margin: 4px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
}

.mp__specs dt {
  font: 500 10px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.mp__specs dd {
  margin: 2px 0 0;
  font: 400 13px/1.4 var(--font-ui);
}

.mp__tile {
  position: relative;
  aspect-ratio: 1;
}

.mp__tile.is-wide {
  aspect-ratio: 2;
}

.t-b1 { grid-area: 1 / 2; }
.t-c1 { grid-area: 1 / 3 / 2 / 5; }
.t-b2 { grid-area: 2 / 2; }
.t-c2 { grid-area: 2 / 3 / 3 / 5; }
.t-a3 { grid-area: 3 / 1 / 4 / 3; }
.t-c3 { grid-area: 3 / 3; }
.t-d3 { grid-area: 3 / 4; }
.mp__legend { grid-area: 4 / 1; }
.t-b4 { grid-area: 4 / 2 / 5 / 4; }
.t-d4 { grid-area: 4 / 4; }

.mp__tile img,
.mp__tile video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.mp__tile figcaption,
.mp__ref {
  font: 500 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
}

.mp__tile figcaption {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 6px;
  color: #fff;
  background: #000;
}

/* A process square: the network over its caption, two columns wide, the height of a picture tile */
.mp__key-cell {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  aspect-ratio: 2;
  border-top: 2px solid var(--c-accent);
}

.mp__key-cell img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
  object-position: center top;
  background: #1e1f22;
}

.mp__key-cell figcaption {
  display: grid;
  gap: 6px;
  padding: 10px 12px 12px;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
  border-top: 1px solid var(--rule);
}

.mp__ref {
  color: var(--c-accent);
  text-transform: uppercase;
}

.mp__ref b {
  margin-left: 6px;
  font-weight: 500;
  color: var(--c-fg);
}

.mp__legend {
  display: grid;
  align-content: center;
  gap: 14px;
  padding: 18px;
}

.mp__legend ul {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mp__legend li {
  display: flex;
  align-items: center;
  gap: 10px;
  font: 400 13px/1.35 var(--font-ui);
}

.mp__sw {
  flex: none;
  width: 28px;
  height: 14px;
}

.k-line { border-bottom: 2px solid var(--c-accent); height: 8px; }
.k-fill { background: repeating-linear-gradient(0deg, var(--c-accent) 0 1px, transparent 1px 4px); }
.k-ramp { background: linear-gradient(90deg, #5a0000, #ff2a00, #ff9a3c); }

/* The proof: the cut inset, crop marks at its corners */
.pf {
  padding: 48px 56px;
  border-top: 1px solid var(--rule);
}

.pf__fig {
  position: relative;
  margin: 0;
}

.pf__fig::before,
.pf__fig::after {
  content: '';
  position: absolute;
  inset: -20px;
  pointer-events: none;
  background:
    linear-gradient(var(--muted), var(--muted)) left 20px top 0 / 1px 12px,
    linear-gradient(var(--muted), var(--muted)) left 0 top 20px / 12px 1px,
    linear-gradient(var(--muted), var(--muted)) right 20px top 0 / 1px 12px,
    linear-gradient(var(--muted), var(--muted)) right 0 top 20px / 12px 1px;
  background-repeat: no-repeat;
}

.pf__fig::after {
  transform: scaleY(-1);
}

.pf__fig video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #000;
}

.pf__fig figcaption {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

.pf__fig figcaption span {
  color: var(--c-accent);
}

/* The rings and their readout */
.rg {
  border-top: 1px solid var(--rule);
}

.rg__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.rg__body {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 32px;
  align-items: center;
  padding: 0 24px 32px;
}

.rg__rings {
  position: relative;
  aspect-ratio: 1.8;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rg__rings li {
  position: absolute;
  inset: calc(var(--i) * 9.5%) calc(var(--i) * 9.5%);
  opacity: 0;
  transform: scale(0.82);
  transition:
    opacity 360ms cubic-bezier(0.23, 1, 0.32, 1) calc(var(--i) * 90ms),
    transform 520ms cubic-bezier(0.23, 1, 0.32, 1) calc(var(--i) * 90ms);
}

.rg__rings.is-drawn li {
  opacity: 1;
  transform: none;
}

.rg__rings button {
  position: absolute;
  inset: 0;
  width: 100%;
  padding: 0;
  font: inherit;
  color: inherit;
  background: transparent;
  border: 1px solid var(--muted);
  border-radius: 50%;
  cursor: pointer;
  transition: border-color 160ms ease, background-color 160ms ease;
}

.rg__rings li.is-piece button {
  border-color: color-mix(in srgb, var(--c-accent) 60%, transparent);
}

.rg__rings li:last-child button {
  background: color-mix(in srgb, var(--c-accent) 14%, transparent);
}

.rg__rings li.is-on button {
  border-color: var(--c-accent);
  border-width: 2px;
}

.rg__rings button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.rg__label {
  position: absolute;
  top: 2px;
  left: 50%;
  translate: -50% 0;
  padding: 2px 6px;
  font: 400 12px/1.2 var(--font-ui);
  white-space: nowrap;
  background: var(--c-bg);
}

.rg__rings li:last-child .rg__label {
  top: 50%;
  translate: -50% -50%;
  background: none;
}

.rg__label b {
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.rg__rings li.is-on .rg__label,
.rg__rings li.is-on .rg__label b {
  color: var(--c-accent);
}

.rg__out {
  display: grid;
  gap: 12px;
}

.rg__pic {
  display: grid;
  place-items: center;
  margin: 0;
  aspect-ratio: 1;
  max-height: 340px;
  background: #000;
  border: 1px solid var(--rule);
}

.rg__pic img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rg__pic.is-empty span {
  font: 600 22px/1 var(--font-ui);
  letter-spacing: -0.01em;
  text-transform: uppercase;
  color: var(--rule);
}

.rg__read {
  display: grid;
  gap: 4px;
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

.rg__read b {
  font-weight: 500;
  color: var(--c-fg);
}

@media (prefers-reduced-motion: reduce) {
  .mp { animation-duration: 1ms; }

  .rg__rings li { transition: none; }
}

@media (max-width: 720px) {
  .mp__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-flow: row dense;
  }

  .mp__grid > * {
    grid-area: auto !important;
  }

  .mp__cover,
  .mp__legend,
  .mp__key-cell,
  .mp__tile.is-wide,
  .mp__tile.t-c3 {
    grid-column: 1 / -1 !important;
  }

  .mp__key-cell {
    aspect-ratio: auto;
  }

  .mp__key-cell img {
    height: auto;
    aspect-ratio: 2;
  }

  .mp__cover {
    padding: 18px 52px 20px 16px;
  }

  .mp__legend {
    padding: 18px 16px;
  }

  .pf {
    padding: 28px 24px;
  }

  .rg__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 52px 16px 16px;
  }

  .rg__body {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    padding: 0 16px 28px;
  }

  .rg__rings {
    aspect-ratio: 1;
  }

  .rg__label {
    font-size: 11px;
  }

  .rg__pic {
    max-height: none;
  }
}
</style>
