<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TopoCredits from './TopoCredits.vue'
import { GREY, NODES, SQ, TOPO, TRAILER, VERSIONS, WIDE } from './story'

// PROTOTYPE TB "Survey sheet" (overnight run, 04 Topography r1).
// Refs: printed survey maps (Swisstopo and OS Explorer sheets: the cover's title panel, the lettered border, the
// legend, grid references on every square); print proofs for the crop marks; Kenta Toshikura's quiet tiled project
// grids (one of Will's keepers) for the mosaic. Beats, each its own device: the outcome as a lettered map grid of tiles
// with the cover panel and the legend as two of its squares → the process as a keyed table (A audio, B colour,
// C visual) → the cinematic cut as a proof in crop marks → the versions as contour rings, the crit at the peak.
// Only the videos move. PLACEHOLDER: sizes, copy, the tile order.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// The mosaic: [ref, picture, wide?]. The cover takes A1–A2, the legend A4–B4, the grey terrain C3.
const tiles = [
  { r: 'B1', pic: SQ[0]!, cls: 't-b1' },
  { r: 'C1', pic: WIDE.lines, cls: 't-c1 is-wide' },
  { r: 'B2', pic: SQ[1]!, cls: 't-b2' },
  { r: 'C2', pic: SQ[2]!, cls: 't-c2' },
  { r: 'D2', pic: SQ[3]!, cls: 't-d2' },
  { r: 'A3', pic: WIDE.ring, cls: 't-a3 is-wide' },
  { r: 'D3', pic: SQ[4]!, cls: 't-d3' },
  { r: 'C4', pic: WIDE.river, cls: 't-c4 is-wide' },
]
const legend = [
  { key: 'line', v: 'Contour: the terrain' },
  { key: 'fill', v: TOPO.height },
  { key: 'ramp', v: 'Hue: set by the volume' },
]
const rows = [
  { ref: 'A', k: 'Audio', text: [TOPO.audio, TOPO.chops], pics: [NODES.audio] },
  { ref: 'B', k: 'Colour', text: [TOPO.colour], pics: [NODES.colour] },
  { ref: 'C', k: 'Visual', text: [TOPO.visual], pics: NODES.full },
]
// Outermost ring first: the earliest test at the foot, the crit at the peak
const rings = VERSIONS
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="tb">
      <!-- The sheet: a lettered grid of tiles, the cover and the legend among them -->
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
              <p class="tb__text">
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
              <p class="tb__k">
                Legend
              </p>
              <ul>
                <li v-for="l in legend" :key="l.key">
                  <span class="mp__key" :class="`k-${l.key}`" aria-hidden="true" />{{ l.v }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- The key: the process as a lettered table -->
      <section class="ky" data-sheet-block="process" aria-label="How it works">
        <p class="tb__k ky__k">
          Key
        </p>
        <ol class="ky__rows">
          <li v-for="r in rows" :key="r.ref">
            <span class="ky__ref">{{ r.ref }}</span>
            <div class="ky__copy">
              <p class="tb__k">
                {{ r.k }}
              </p>
              <p v-for="t in r.text" :key="t" class="tb__text">
                {{ t }}
              </p>
            </div>
            <div class="ky__pics" :class="{ 'is-three': r.pics.length > 1 }">
              <img v-for="p in r.pics" :key="p.src" :src="p.src" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
            </div>
          </li>
        </ol>
      </section>

      <!-- The cinematic cut, a proof in crop marks -->
      <section class="pf" data-sheet-block="cut" aria-label="Cinematic cut">
        <figure class="pf__fig">
          <video
            :src="TRAILER.src"
            :poster="TRAILER.poster"
            :width="TRAILER.w"
            :height="TRAILER.h"
            muted
            loop
            playsinline
            preload="none"
            data-play
            aria-label="Topography AV Test, the 22 second cinematic cut"
          />
          <figcaption>
            <span>Fig. 1</span>{{ TRAILER.label }}
          </figcaption>
        </figure>
      </section>

      <!-- Versions as contour rings -->
      <section class="rg" data-sheet-block="versions" aria-label="Versions">
        <div class="rg__head">
          <p class="tb__k">
            Versions
          </p>
          <p class="tb__text">
            {{ TOPO.tests }}
          </p>
        </div>
        <div class="rg__map">
          <ol class="rg__rings">
            <li v-for="(v, i) in rings" :key="v.k" :style="{ '--i': i }" :class="{ 'is-on': v.k === 'Test 2' }">
              <span class="rg__label"><b>{{ v.d }} {{ v.m }}</b> {{ v.k }}</span>
            </li>
          </ol>
        </div>
      </section>

      <TopoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.tb__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tb__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The sheet */
.mp {
  animation: tb-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes tb-in {
  from { opacity: 0; }
}

.mp__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: auto;
  gap: 1px;
  background: var(--rule);
}

.mp__grid > * {
  min-width: 0;
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
  margin: 0;
  aspect-ratio: 1;
}

.mp__tile.is-wide {
  grid-column: span 2;
  aspect-ratio: 2;
}

.t-b1 { grid-area: 1 / 2; }
.t-c1 { grid-area: 1 / 3 / 2 / 5; }
.t-b2 { grid-area: 2 / 2; }
.t-c2 { grid-area: 2 / 3; }
.t-d2 { grid-area: 2 / 4; }
.t-a3 { grid-area: 3 / 1 / 4 / 3; }
.t-c3 { grid-area: 3 / 3; }
.t-d3 { grid-area: 3 / 4; }
.t-c4 { grid-area: 4 / 3 / 5 / 5; }

.mp__tile img,
.mp__tile video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.mp__tile figcaption {
  position: absolute;
  top: 0;
  left: 0;
  padding: 4px 6px;
  font: 500 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
  color: #fff;
  background: #000;
}

.mp__legend {
  grid-area: 4 / 1 / 5 / 3;
  display: grid;
  align-content: center;
  gap: 14px;
  padding: 20px;
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
  gap: 12px;
  font: 400 14px/1.4 var(--font-ui);
}

.mp__key {
  flex: none;
  width: 32px;
  height: 14px;
}

.k-line { border-bottom: 2px solid var(--c-accent); height: 8px; }
.k-fill { background: repeating-linear-gradient(0deg, var(--c-accent) 0 1px, transparent 1px 4px); }
.k-ramp { background: linear-gradient(90deg, #5a0000, #ff2a00, #ff9a3c); }

/* The key */
.ky {
  border-top: 1px solid var(--rule);
}

.ky__k {
  padding: 22px 24px 14px;
}

.ky__rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ky__rows li {
  display: grid;
  grid-template-columns: 64px minmax(0, 5fr) minmax(0, 6fr);
  gap: 24px;
  align-items: start;
  padding: 20px 24px;
  border-top: 1px solid var(--rule);
}

.ky__ref {
  font: 600 48px/0.9 var(--font-ui);
  color: var(--c-accent);
}

.ky__copy {
  display: grid;
  gap: 10px;
}

.ky__pics {
  display: grid;
  gap: 1px;
  background: var(--rule);
}

.ky__pics.is-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.ky__pics img {
  display: block;
  width: 100%;
  height: auto;
  background: #1e1f22;
}

.ky__pics.is-three img {
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

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

/* The rings */
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

.rg__map {
  padding: 0 24px 32px;
}

.rg__rings {
  position: relative;
  aspect-ratio: 2.4;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rg__rings li {
  position: absolute;
  inset: calc(var(--i) * 9.5%) calc(var(--i) * 9.5%);
  border: 1px solid var(--muted);
  border-radius: 50%;
}

.rg__rings li.is-on {
  border-color: var(--c-accent);
}

.rg__rings li:last-child {
  background: color-mix(in srgb, var(--c-accent) 18%, transparent);
  border-color: var(--c-accent);
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

@media (prefers-reduced-motion: reduce) {
  .mp { animation-duration: 1ms; }
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
  .mp__tile.is-wide {
    grid-column: 1 / -1 !important;
  }

  .mp__cover {
    padding: 18px 52px 20px 16px;
  }

  .mp__legend {
    padding: 18px 16px;
  }

  .ky__k {
    padding: 22px 52px 12px 16px;
  }

  .ky__rows li {
    grid-template-columns: 36px minmax(0, 1fr);
    gap: 12px;
    padding: 18px 16px;
  }

  .ky__ref {
    font-size: 32px;
  }

  .ky__pics {
    grid-column: 1 / -1;
  }

  .pf {
    padding: 28px 24px;
  }

  .rg__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 52px 16px 16px;
  }

  .rg__map {
    padding: 0 16px 28px;
  }

  .rg__rings {
    aspect-ratio: 1;
  }

  .rg__label {
    font-size: 11px;
  }
}
</style>
