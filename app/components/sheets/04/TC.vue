<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TopoCredits from './TopoCredits.vue'
import { GREY, NODES, SQ, TOPO, TRAILER, VERSIONS, WIDE } from './story'

// PROTOTYPE TC "Arrangement" (overnight run, 04 Topography r1).
// Refs: Ableton Live's arrangement view (track headers, clips on lanes, a ruler and a playhead) for the process; the
// x-ray / loupe reveals on product pages (Apple's "look inside" moments, Lusion's hover lenses) for the output; a
// hardware transport bar for the slate. Beats, each its own device: an output frame with a transport bar over it and
// a lens that shows the network under the terrain → the process as DAW lanes (audio, colour, visual, out) under a
// ruler of the version dates, a playhead crossing them with the scroll → a volume fader that turns the hue of a still,
// the colour circuit as a toy → the cinematic cut beside the grey terrain. Only transforms move (plus the lens' clip
// and the fader's filter, both on input). PLACEHOLDER: sizes, copy, the lens radius, the fader's range.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// The lens: follows the pointer while it's over the frame (or held on touch); the button opens it fully
const lens = ref<HTMLElement>()
const open = ref(false)
const hover = ref(false)
let raf = 0
function aim(e: PointerEvent) {
  const el = lens.value
  if (!el) return
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const r = el.getBoundingClientRect()
    el.style.setProperty('--x', `${e.clientX - r.left}px`)
    el.style.setProperty('--y', `${e.clientY - r.top}px`)
  })
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

// The fader: volume 0–100 turns the still's hue up to 120°
const vol = ref(0)
const hue = computed(() => Math.round(vol.value * 1.2))

const lanes = [
  { k: 'Audio', n: '1', pics: [NODES.audio], text: [TOPO.audio, TOPO.chops] },
  { k: 'Colour', n: '2', pics: [NODES.colour], text: [TOPO.colour] },
  { k: 'Visual', n: '3', pics: NODES.full, text: [TOPO.visual] },
  { k: 'Out', n: '4', pics: SQ.slice(0, 4), text: [TOPO.height] },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="tc">
      <!-- Monitor: an output frame, the transport bar over it, a lens onto the network -->
      <section class="mo" data-sheet-body data-sheet-block="monitor" aria-label="The output, and the network under it">
        <div data-build>
          <div
            ref="lens"
            class="mo__frame"
            :class="{ 'is-open': open, 'is-hover': hover }"
            @pointerenter="hover = true"
            @pointerleave="hover = false"
            @pointermove="aim"
            @pointerdown="aim"
          >
            <img class="mo__out" :src="WIDE.lines.src" :alt="WIDE.lines.alt" :width="WIDE.lines.w" :height="WIDE.lines.h" decoding="async">
            <img class="mo__net" :src="NODES.full[0]!.src" alt="" aria-hidden="true" :width="NODES.full[0]!.w" :height="NODES.full[0]!.h" decoding="async">
            <div class="mo__bar">
              <h2 class="mo__title">
                {{ TOPO.title }}
              </h2>
              <span class="mo__tc"><i aria-hidden="true" />01:57</span>
              <span class="mo__chip">60 fps</span>
              <span class="mo__chip">1:1</span>
              <span class="mo__chip is-year">{{ TOPO.year }}</span>
            </div>
            <button type="button" class="mo__btn" :aria-pressed="open" @click="open = !open">
              {{ open ? 'Hide the network' : 'Show the network' }}
            </button>
          </div>
          <div class="mo__slate">
            <p class="tc__text mo__line">
              {{ TOPO.line }}
            </p>
            <dl class="mo__specs">
              <div v-for="s in TOPO.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- Arrangement: the process as lanes under a ruler of the version dates -->
      <section class="ar" data-sheet-block="process" aria-label="How it works, as lanes">
        <div class="ar__ruler">
          <span class="tc__k">{{ TOPO.tests }}</span>
          <ol aria-label="Versions">
            <li v-for="v in VERSIONS" :key="v.k" :class="{ 'is-on': v.k === 'Test 2' }">
              <b>{{ v.d }} {{ v.m }}</b>{{ v.k }}
            </li>
          </ol>
        </div>
        <ol class="ar__lanes">
          <li v-for="l in lanes" :key="l.k" class="ar__lane">
            <div class="ar__head">
              <span class="ar__n">{{ l.n }}</span>
              <span class="ar__k">{{ l.k }}</span>
            </div>
            <div class="ar__clips">
              <img v-for="p in l.pics" :key="p.src" :src="p.src" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
            </div>
            <div class="ar__notes">
              <p v-for="t in l.text" :key="t" class="tc__text">
                {{ t }}
              </p>
            </div>
          </li>
        </ol>
        <div class="ar__play" aria-hidden="true">
          <span />
        </div>
      </section>

      <!-- The fader: volume turns the hue -->
      <section class="fd" data-sheet-block="colour" aria-label="Colour reactivity, as a demo">
        <figure class="fd__fig">
          <img :src="SQ[3]!.src" :alt="SQ[3]!.alt" :width="SQ[3]!.w" :height="SQ[3]!.h" :style="{ filter: hue ? `hue-rotate(${hue}deg)` : undefined }" loading="lazy" decoding="async">
        </figure>
        <div class="fd__ctl">
          <p class="tc__k">
            Colour
          </p>
          <p class="tc__text">
            {{ TOPO.demo }}
          </p>
          <label class="fd__fader">
            <span class="tc__k">Volume <output>{{ vol }}</output></span>
            <input v-model.number="vol" type="range" min="0" max="100" step="1">
          </label>
          <div class="fd__ramp" aria-hidden="true" :style="{ filter: hue ? `hue-rotate(${hue}deg)` : undefined }" />
        </div>
      </section>

      <!-- The cut beside the grey terrain -->
      <section class="two" data-sheet-block="cuts" aria-label="Cinematic cut and grey terrain">
        <figure>
          <video :src="TRAILER.src" :poster="TRAILER.poster" :width="TRAILER.w" :height="TRAILER.h" muted loop playsinline preload="none" data-play aria-label="Topography AV Test, the 22 second cinematic cut" />
          <figcaption>{{ TRAILER.label }}</figcaption>
        </figure>
        <figure>
          <video :src="GREY.src" :poster="GREY.poster" :width="GREY.w" :height="GREY.h" muted loop playsinline preload="none" data-play aria-label="The terrain in grey, a 9 second loop" />
          <figcaption>{{ GREY.label }}</figcaption>
        </figure>
      </section>

      <TopoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.tc__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tc__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* Monitor */
.mo {
  animation: tc-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes tc-in {
  from { opacity: 0; }
}

.mo__frame {
  --x: 50%;
  --y: 50%;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
  touch-action: pan-y;
}

.mo__out,
.mo__net {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mo__net {
  background: #1e1f22;
  clip-path: circle(0 at var(--x) var(--y));
  transition: clip-path 260ms cubic-bezier(0.23, 1, 0.32, 1);
}

.mo__frame.is-hover .mo__net {
  clip-path: circle(140px at var(--x) var(--y));
  transition: none;
}

.mo__frame.is-open .mo__net {
  clip-path: circle(150% at var(--x) var(--y));
  transition: clip-path 420ms cubic-bezier(0.23, 1, 0.32, 1);
}

.mo__bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #000;
  border-bottom: 1px solid var(--rule);
}

.mo__title {
  flex: 1;
  min-width: 0;
  margin: 0;
  font: 600 clamp(18px, 2.6vw, 30px)/1.1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: #fff;
}

.mo__tc {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  font: 600 18px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: #fff;
  border: 1px solid var(--rule);
}

.mo__tc i {
  width: 0;
  height: 0;
  border-left: 8px solid var(--c-accent);
  border-top: 5px solid transparent;
  border-bottom: 5px solid transparent;
}

.mo__chip {
  padding: 7px 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  border: 1px solid var(--rule);
}

.mo__chip.is-year {
  color: var(--c-accent);
}

.mo__btn {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 8px 12px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.04em;
  color: #fff;
  background: #000;
  border: 1px solid var(--c-accent);
  cursor: pointer;
}

.mo__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.mo__slate {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px 32px;
  padding: 24px;
  border-top: 1px solid var(--rule);
}

.mo__line {
  font-size: 17px;
  color: var(--c-fg);
}

.mo__specs {
  display: grid;
  gap: 8px;
  margin: 0;
}

.mo__specs div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
}

.mo__specs dt {
  font: 500 11px/1.6 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.mo__specs dd {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
}

/* Arrangement: header 112px | clips | notes 300px */
.ar {
  --head: 112px;
  --notes: 300px;
  position: relative;
  border-top: 1px solid var(--rule);
}

.ar__ruler {
  display: grid;
  grid-template-columns: var(--head) minmax(0, 1fr) var(--notes);
  align-items: end;
  border-bottom: 1px solid var(--rule);
}

.ar__ruler > .tc__k {
  grid-column: 3;
  grid-row: 1;
  padding: 14px 24px;
  border-left: 1px solid var(--rule);
}

.ar__ruler ol {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.ar__ruler li {
  display: grid;
  gap: 2px;
  padding: 14px 8px 8px;
  font: 400 12px/1.2 var(--font-ui);
  color: var(--muted);
  border-left: 1px solid var(--rule);
}

.ar__ruler b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-fg);
}

.ar__ruler li.is-on,
.ar__ruler li.is-on b {
  color: var(--c-accent);
}

.ar__lanes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ar__lane {
  display: grid;
  grid-template-columns: var(--head) minmax(0, 1fr) var(--notes);
  border-bottom: 1px solid var(--rule);
}

.ar__head {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 16px 16px 16px 24px;
  background: color-mix(in srgb, var(--c-fg) 4%, transparent);
  border-left: 3px solid var(--c-accent);
}

.ar__n {
  font: 600 22px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

.ar__k {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ar__clips {
  display: flex;
  gap: 1px;
  height: 150px;
  padding: 10px 0 10px 1px;
  overflow: hidden;
  border-left: 1px solid var(--rule);
}

.ar__clips img {
  display: block;
  flex: none;
  width: auto;
  height: 100%;
  object-fit: cover;
  background: #1e1f22;
  border-top: 3px solid var(--c-accent);
}

.ar__notes {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 16px 24px;
  border-left: 1px solid var(--rule);
}

.ar__notes .tc__text {
  font-size: 14px;
  line-height: 1.5;
}

.ar__play {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--head);
  right: var(--notes);
  pointer-events: none;
}

.ar__play span {
  display: block;
  width: 100%;
  height: 100%;
  border-left: 1px solid var(--c-accent);
}

@supports (animation-timeline: view()) {
  html[data-sheet='open'] .ar__play span {
    animation: tc-play linear both;
    animation-timeline: view();
    animation-range: cover 15% cover 85%;
  }
}

@keyframes tc-play {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

/* The fader */
.fd {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--rule);
}

.fd__fig {
  margin: 0;
  border-right: 1px solid var(--rule);
}

.fd__fig img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}

.fd__ctl {
  display: grid;
  align-content: center;
  gap: 18px;
  padding: 32px 24px;
}

.fd__fader {
  display: grid;
  gap: 10px;
}

.fd__fader output {
  margin-left: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.fd__fader input {
  width: 100%;
  accent-color: var(--c-accent);
}

.fd__ramp {
  height: 24px;
  background: linear-gradient(90deg, #2a0000, #a30000 30%, #ff2a00 60%, #ff9a3c);
}

/* The two cuts */
.two {
  display: grid;
  grid-template-columns: minmax(0, 16fr) minmax(0, 9fr);
  gap: 1px;
  background: var(--rule);
}

.two figure {
  position: relative;
  margin: 0;
}

.two video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.two figure:first-child video {
  aspect-ratio: 16 / 9;
}

.two figcaption {
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

@media (prefers-reduced-motion: reduce) {
  .mo { animation-duration: 1ms; }

  .mo__net { transition: none !important; }

  html[data-sheet='open'] .ar__play span { animation: none; }
}

@media (max-width: 720px) {
  .mo__frame {
    aspect-ratio: 4 / 5;
  }

  .mo__bar {
    flex-wrap: wrap;
    padding: 10px 52px 10px 12px;
  }

  .mo__title {
    flex-basis: 100%;
  }

  .mo__slate,
  .fd,
  .two {
    grid-template-columns: minmax(0, 1fr);
  }

  .mo__slate {
    padding: 20px 52px 22px 16px;
  }

  .mo__line {
    font-size: 16px;
  }

  .ar__ruler {
    grid-template-columns: minmax(0, 1fr);
  }

  .ar__ruler > .tc__k {
    grid-column: 1;
    padding: 16px 16px 8px;
    border-left: 0;
  }

  .ar__ruler ol {
    grid-column: 1;
    grid-row: 2;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    padding: 0 0 0 16px;
  }

  .ar__ruler li {
    padding: 8px 4px;
    font-size: 11px;
  }

  .ar__lane {
    grid-template-columns: minmax(0, 1fr);
  }

  .ar__head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 12px 16px;
  }

  .ar__clips {
    height: 120px;
    padding: 8px 0 8px 16px;
    border-left: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .ar__notes {
    padding: 4px 52px 18px 16px;
    border-left: 0;
  }

  .ar__play {
    display: none;
  }

  .fd__fig {
    border-right: 0;
  }

  .fd__ctl {
    padding: 24px 52px 28px 16px;
  }
}
</style>
