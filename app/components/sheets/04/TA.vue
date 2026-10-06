<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TopoCredits from './TopoCredits.vue'
import { NODES, SQ, TOPO, TRAILER, VERSIONS } from './story'

// PROTOTYPE TA "Signal chain" (overnight run, 04 Topography r1).
// Refs: TouchDesigner's own network editor (operators joined left to right by wires) and Ableton's device chain for
// the slate; Teenage Engineering's product pages (spec rows, small caps, one accent) for the type; a tape ruler for the
// versions. Beats, each its own device: the slate with the chain drawn as modules and one pulse running along the wire
// → the audio network full width with its two notes beside → the colour circuit over a five-up row of the stills,
// like swatches off the ramp → the cinematic cut full bleed → the versions on a ruler with a break for the six weeks
// to the crit. Only transforms move. PLACEHOLDER: sizes, copy, the pulse speed.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const chain = [
  { k: 'In', v: 'Track' },
  { k: 'In', v: 'Filtered copy' },
  { k: 'CHOP', v: 'Beat' },
  { k: 'CHOP', v: 'Count + lag' },
  { k: 'TOP', v: 'Colour ramp' },
]
// The colour row skips the still the slate shows as the output
const row = SQ.slice(0, 4)
const march = VERSIONS.slice(0, 4)
const crit = VERSIONS[4]!
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ta">
      <!-- Slate: title, specs and the chain -->
      <section class="sl" data-sheet-body data-sheet-block="slate" aria-label="About the piece">
        <div class="sl__grid" data-build>
          <div class="sl__left">
            <div class="sl__top">
              <h2 class="sl__title">
                {{ TOPO.title }}<span>{{ TOPO.year }}</span>
              </h2>
              <p class="ta__text sl__line">
                {{ TOPO.line }}
              </p>
            </div>
            <dl class="sl__specs">
              <div v-for="s in TOPO.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
            <div class="ch" role="img" aria-label="The signal chain: track and filtered copy into beat detection, count and lag, colour ramp, out to the terrain">
              <div class="ch__wire" aria-hidden="true">
                <span class="ch__run"><i /></span>
              </div>
              <ol class="ch__mods" aria-hidden="true">
                <li v-for="c in chain" :key="c.v">
                  <b>{{ c.k }}</b>{{ c.v }}
                </li>
              </ol>
            </div>
          </div>
          <figure class="sl__out">
            <img :src="SQ[4]!.src" :alt="SQ[4]!.alt" :width="SQ[4]!.w" :height="SQ[4]!.h" decoding="async">
            <figcaption><b>Out</b> Terrain</figcaption>
          </figure>
        </div>
      </section>

      <!-- 01 Audio: the network full width, the notes beside -->
      <section class="au" data-sheet-block="audio" aria-label="Audio set up">
        <figure class="au__fig">
          <img :src="NODES.audio.src" :alt="NODES.audio.alt" :width="NODES.audio.w" :height="NODES.audio.h" loading="lazy" decoding="async">
        </figure>
        <div class="au__notes">
          <p class="ta__count">
            <b>01</b> Audio
          </p>
          <p class="ta__text">
            {{ TOPO.audio }}
          </p>
          <p class="ta__text">
            {{ TOPO.chops }}
          </p>
        </div>
      </section>

      <!-- 02 Colour: the circuit, then the stills as swatches -->
      <section class="co" data-sheet-block="colour" aria-label="Colour reactivity">
        <div class="co__head">
          <div>
            <p class="ta__count">
              <b>02</b> Colour
            </p>
            <p class="ta__text">
              {{ TOPO.colour }}
            </p>
          </div>
          <img :src="NODES.colour.src" :alt="NODES.colour.alt" :width="NODES.colour.w" :height="NODES.colour.h" loading="lazy" decoding="async">
        </div>
        <ul class="co__row">
          <li v-for="s in row" :key="s.src">
            <img :src="s.src" :alt="s.alt" :width="s.w" :height="s.h" loading="lazy" decoding="async">
          </li>
        </ul>
      </section>

      <!-- 03 The cinematic cut, full bleed -->
      <section class="cut" data-sheet-block="cut" aria-label="Cinematic cut">
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
        <p class="cut__label">
          <b>03</b> {{ TRAILER.label }}
        </p>
      </section>

      <!-- 04 Versions on a ruler, broken for the weeks before the crit -->
      <section class="ru" data-sheet-block="versions" aria-label="Versions">
        <div class="ru__head">
          <p class="ta__count">
            <b>04</b> Versions
          </p>
          <p class="ta__text">
            {{ TOPO.tests }}
          </p>
        </div>
        <ol class="ru__line">
          <li v-for="v in march" :key="v.k" :class="{ 'is-on': v.k === 'Test 2' }">
            <span class="ru__d">{{ v.d }}<small>{{ v.m }}</small></span>
            <span class="ru__k">{{ v.k }}</span>
            <span v-if="v.v" class="ru__v">{{ v.v }}</span>
          </li>
          <li class="ru__gap" aria-hidden="true">
            <span class="ru__k">6 weeks</span>
          </li>
          <li>
            <span class="ru__d">{{ crit.d }}<small>{{ crit.m }}</small></span>
            <span class="ru__k">{{ crit.k }}</span>
            <span class="ru__v">{{ crit.v }}</span>
          </li>
        </ol>
      </section>

      <TopoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.ta__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ta__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.ta__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* Slate */
.sl {
  animation: ta-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes ta-in {
  from { opacity: 0; }
}

.sl__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.sl__left {
  display: grid;
  align-content: space-between;
  border-right: 1px solid var(--rule);
}

.sl__top {
  display: grid;
  gap: 14px;
  padding: 24px 24px 20px;
}

.sl__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 16px;
  margin: 0;
  font: 600 clamp(30px, 4.4vw, 52px)/1 var(--font-ui);
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.sl__title span {
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.sl__line {
  color: var(--c-fg);
}

.sl__specs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
}

.sl__specs div {
  padding: 14px 24px;
}

.sl__specs div + div {
  border-left: 1px solid var(--rule);
  padding-left: 16px;
}

.sl__specs dt {
  font: 500 11px/1.4 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sl__specs dd {
  margin: 4px 0 0;
  font: 400 14px/1.45 var(--font-ui);
}

.sl__out {
  position: relative;
  margin: 0;
}

.sl__out img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.sl__out figcaption {
  position: absolute;
  left: 0;
  bottom: 16px;
  padding: 6px 10px;
  font: 400 13px/1.2 var(--font-ui);
  color: #fff;
  background: #000;
  border: 1px solid var(--c-accent);
  border-left: 0;
}

.sl__out b {
  margin-right: 6px;
  font: 500 10px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

/* The chain: modules on one wire into the output, a pulse running along it while the Sheet is open */
.ch {
  position: relative;
  padding: 22px 0 26px 24px;
  border-top: 1px solid var(--rule);
}

.ch__wire {
  position: absolute;
  left: 24px;
  right: 0;
  top: 50%;
  height: 1px;
  background: var(--rule);
  overflow: hidden;
}

.ch__run {
  display: block;
  width: 100%;
  height: 1px;
  transform: translateX(-12%);
}

.ch__run i {
  display: block;
  width: 12%;
  height: 1px;
  background: var(--c-accent);
}

html[data-sheet='open'] .ch__run {
  animation: ta-run 2.4s linear infinite;
}

@keyframes ta-run {
  to { transform: translateX(100%); }
}

.ch__mods {
  position: relative;
  display: flex;
  justify-content: space-between;
  gap: 6px;
  margin: 0;
  padding: 0 24px 0 0;
  list-style: none;
}

.ch__mods li {
  display: grid;
  gap: 2px;
  padding: 6px 10px;
  font: 400 13px/1.2 var(--font-ui);
  white-space: nowrap;
  background: var(--c-bg);
  border: 1px solid var(--rule);
}

.ch__mods b {
  font: 500 10px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* 01 Audio */
.au {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.au__fig {
  margin: 0;
  background: #1e1f22;
  border-right: 1px solid var(--rule);
}

.au__fig img {
  display: block;
  width: 100%;
  height: auto;
}

.au__notes {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 28px 24px;
}

/* 02 Colour */
.co {
  border-top: 1px solid var(--rule);
}

.co__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 28px 24px;
}

.co__head > div {
  display: grid;
  gap: 16px;
}

.co__head img {
  display: block;
  width: 100%;
  height: auto;
  background: #1e1f22;
}

.co__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.co__row img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}

/* 03 The cut */
.cut {
  position: relative;
  border-top: 1px solid var(--rule);
}

.cut video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #000;
}

.cut__label {
  position: absolute;
  left: 24px;
  top: 20px;
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
}

.cut__label b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--c-accent);
}

/* 04 The ruler */
.ru {
  border-top: 1px solid var(--rule);
}

.ru__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 28px 24px 8px;
}

.ru__line {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) 72px minmax(0, 1fr);
  margin: 0;
  padding: 0 24px 32px;
  list-style: none;
}

.ru__line li {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 18px 12px 0 0;
  border-top: 1px solid var(--muted);
  background: linear-gradient(var(--muted), var(--muted)) left top / 1px 12px no-repeat;
}

.ru__line li.ru__gap {
  border-top-style: dashed;
  border-top-color: var(--rule);
  background: none;
}

.ru__d {
  font: 600 48px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.ru__d small {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.ru__k {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ru__v {
  font: 400 14px/1.45 var(--font-ui);
}

.ru__line li.is-on .ru__d,
.ru__line li.is-on .ru__k {
  color: var(--c-accent);
}

@media (prefers-reduced-motion: reduce) {
  .sl { animation-duration: 1ms; }

  html[data-sheet='open'] .ch__run { animation: none; }
}

@media (max-width: 720px) {
  .sl__grid,
  .au,
  .co__head,
  .ru__head {
    grid-template-columns: minmax(0, 1fr);
  }

  .sl__top,
  .au__notes,
  .co__head,
  .ru__head {
    padding-right: 52px;
    padding-left: 16px;
  }

  .sl__specs {
    grid-template-columns: minmax(0, 1fr);
  }

  .sl__specs div {
    padding: 10px 16px;
  }

  .sl__specs div + div {
    border-left: 0;
    border-top: 1px solid var(--rule);
    padding-left: 16px;
  }

  .sl__left {
    border-right: 0;
  }

  .sl__out img {
    aspect-ratio: 4 / 3;
  }

  .ch {
    padding: 18px 16px;
  }

  .ch__wire {
    left: 33px;
    right: auto;
    top: 18px;
    bottom: 18px;
    width: 1px;
    height: auto;
  }

  .ch__run {
    display: none;
  }

  .ch__mods {
    flex-direction: column;
    align-items: flex-start;
  }

  .au__fig {
    border-right: 0;
  }

  .co__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cut__label {
    left: 16px;
    top: 12px;
  }

  .ru__line {
    grid-template-columns: minmax(0, 1fr);
    padding: 8px 52px 28px 16px;
  }

  .ru__line li {
    grid-template-columns: 96px minmax(0, 1fr);
    align-items: baseline;
    gap: 2px 12px;
    padding: 12px 0;
    border-top: 0;
    border-left: 1px solid var(--muted);
    padding-left: 12px;
    background: none;
  }

  .ru__line li.ru__gap {
    min-height: 32px;
    border-left-style: dashed;
    border-left-color: var(--rule);
  }

  .ru__d {
    grid-row: span 2;
    font-size: 32px;
  }
}
</style>
