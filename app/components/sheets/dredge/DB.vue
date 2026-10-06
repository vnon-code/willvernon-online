<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, DAY, DR, FILM, INFO, WORLD } from './story'

// PROTOTYPE DB "Descent" (overnight run, Dredge r1). Beats, each its own device: the film in a row of four tall
// screens with three of its clips (each clip plays while you point at it) → the world as a deck of cards that stack
// as you scroll, each plate a shade darker, from white sky down to black water and the whale → the day it was made
// as a bar chart of hours, from the file times.
// Refs: Arc'teryx's 2016 lookbook (vertical scroll revealing layers); the sticky stacked-card chapters common on
// Awwwards and Your Majesty's FILA Explore stories (one plate per chapter); a Gantt bar for the day. Plain CSS
// sticky, no scroll handlers. Videos play only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes,
// copy, the plate shades.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('db', [
  { id: 'world', label: 'Sky to whale' },
  { id: 'day', label: 'One day' },
])

// The clips play while pointed at, but only once the Sheet has settled open (the pointer rests over the wall
// during the open, and a clip decoding in the flight drops frames), as useOpenPlay does
const WALL = [CLIPS.orbit, CLIPS.whirl, CLIPS.fabric]
let ready = false
let readyT = 0
onMounted(() => (readyT = window.setTimeout(() => (ready = true), 1500)))
onBeforeUnmount(() => clearTimeout(readyT))
function hover(e: Event, on: boolean) {
  const v = (e.currentTarget as HTMLElement).querySelector('video')
  if (!v) return
  const open = document.documentElement.dataset.sheet === 'open'
  if (on && ready && open && !matchMedia('(prefers-reduced-motion: reduce)').matches) v.play().catch(() => {})
  else v.pause()
}

// The deck: each plate darker than the last (PLACEHOLDER shades, picked to sit under each still)
const DECK = [
  { k: 'Sky', pic: WORLD.concrete, bg: '#e8eaeb', fg: '#111' },
  { k: 'Fog', pic: WORLD.fog, bg: '#c3c8cb', fg: '#111' },
  { k: 'Slab', pic: WORLD.block, bg: '#8b9399', fg: '#0b0d0e' },
  { k: 'Swell', pic: WORLD.aerial, bg: '#3d454b', fg: '#f2f2ef' },
  { k: 'Break', pic: WORLD.wave, bg: '#1b2024', fg: '#f2f2ef' },
  { k: 'Whale', pic: WORLD.whaleTop, bg: '#060708', fg: '#f2f2ef' },
]

// The day's chart runs 14:00 to 22:00
const H0 = 14
const H1 = 22
const pct = (h: number) => `${((h - H0) / (H1 - H0)) * 100}%`
const TICKS = [14, 16, 18, 20, 22]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="db">
      <SheetHead :title="DR.title" :hook="DR.hook" :info="INFO">
        <template #before>
          <ul class="wall" aria-label="The film and three of its clips">
            <li class="wall__film">
              <video
                :src="FILM.src"
                :poster="FILM.poster"
                :width="FILM.w"
                :height="FILM.h"
                muted
                loop
                playsinline
                preload="none"
                data-play
                aria-label="Dredge, the 44.7 second film"
              />
              <span>{{ FILM.label }}</span>
            </li>
            <li v-for="c in WALL" :key="c.src" tabindex="0" @pointerenter="hover($event, true)" @pointerleave="hover($event, false)" @focus="hover($event, true)" @blur="hover($event, false)">
              <video :src="c.src" :poster="c.poster" width="1080" height="1872" muted loop playsinline preload="none" :aria-label="`Five-second Midjourney clip: ${c.alt}`" />
              <span>{{ c.k }}, 5 s</span>
            </li>
          </ul>
        </template>
      </SheetHead>

      <!-- 01 The deck -->
      <section class="dk" v-bind="sec('world')" data-sheet-block="world">
        <div class="db__head">
          <SheetSectionNo id="world" />
          <p class="db__text">
            {{ DR.world }}
          </p>
        </div>
        <ol class="dk__deck">
          <li v-for="(c, i) in DECK" :key="c.k" class="dk__card" :style="{ background: c.bg, color: c.fg }">
            <img :src="c.pic.src" :srcset="c.pic.srcset" sizes="(max-width: 720px) 58vw, 480px" :alt="c.pic.alt" :width="c.pic.w" :height="c.pic.h" loading="lazy" decoding="async">
            <p class="dk__k">
              <span aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>{{ c.k }}
            </p>
          </li>
        </ol>
      </section>

      <!-- 02 The day, in hours -->
      <section class="dy" v-bind="sec('day')" data-sheet-block="day">
        <div class="db__head">
          <SheetSectionNo id="day" />
          <p class="db__text">
            {{ DR.day }}
          </p>
        </div>
        <div class="dy__chart">
          <ol class="dy__ticks" aria-hidden="true">
            <li v-for="t in TICKS" :key="t" :style="{ left: pct(t) }">
              {{ t }}:00
            </li>
          </ol>
          <dl class="dy__rows">
            <div v-for="r in DAY" :key="r.k" class="dy__row">
              <dt>{{ r.k }}</dt>
              <dd>
                <span class="dy__bar" :style="{ left: pct(r.a), width: `calc(${pct(r.b)} - ${pct(r.a)})` }" />
                <span class="dy__v" :style="{ '--a': pct(r.a) }">{{ r.from }} to {{ r.to }} · {{ r.v }}</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <SheetCredits :items="DR.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.db__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.db__text {
  margin: 0;
  max-width: 50ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The wall: four tall screens, the film first and a little wider */
.wall {
  display: grid;
  grid-template-columns: 1.3fr 1fr 1fr 1fr;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}

.wall li {
  position: relative;
  background: #000;
  outline: none;
}

.wall li:focus-visible {
  box-shadow: inset 0 0 0 2px var(--c-accent);
}

.wall video {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
}

.wall li:not(.wall__film) video {
  opacity: 0.82;
  transition: opacity 200ms ease-out;
}

.wall li:hover video,
.wall li:focus-visible video {
  opacity: 1;
}

.wall span {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

/* 01 The deck: each card pins under the header and the next slides over it */
.dk {
  border-top: 1px solid var(--rule);
}

.dk__deck {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dk__card {
  position: sticky;
  top: -16px; /* the layer's padding: pins it just under the header, as MB and SF */
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  height: min(var(--view-h), 840px);
  overflow: hidden;
}

.dk__card img {
  grid-column: 2;
  grid-row: 1;
  display: block;
  height: 100%;
  width: auto;
  aspect-ratio: 768 / 1344;
  object-fit: cover;
}

.dk__k {
  grid-column: 1;
  grid-row: 1;
  align-self: start;
  margin: 0;
  padding: 28px 24px;
  font: 600 clamp(56px, 10vw, 140px)/0.85 var(--font-ui);
  letter-spacing: -0.05em;
  text-transform: uppercase;
}

.dk__k span {
  display: block;
  margin-bottom: 12px;
  font: 500 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  opacity: 0.6;
}

/* 02 The day */
.dy {
  border-top: 1px solid var(--rule);
}

.dy__chart {
  position: relative;
  padding: 36px 24px 28px 124px;
}

.dy__ticks {
  position: absolute;
  inset: 12px 24px 0 124px;
  margin: 0;
  padding: 0;
  list-style: none;
  pointer-events: none;
}

.dy__ticks li {
  position: absolute;
  top: 0;
  bottom: 0;
  translate: -50% 0;
  font: 500 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.dy__ticks li::after {
  content: '';
  position: absolute;
  top: 16px;
  bottom: 0;
  left: 50%;
  border-left: 1px dashed var(--rule);
}

.dy__rows {
  display: grid;
  gap: 14px;
  margin: 0;
}

.dy__row {
  position: relative;
}

.dy__row dt {
  position: absolute;
  right: calc(100% + 16px);
  top: 4px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dy__row dd {
  position: relative;
  height: 44px;
  margin: 0;
}

.dy__bar {
  position: absolute;
  top: 0;
  height: 20px;
  background: #e03a2f;
}

.dy__v {
  position: absolute;
  top: 26px;
  left: var(--a, 0);
  font: 400 13px/1.3 var(--font-ui);
  color: var(--muted);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .wall li:not(.wall__film) video { transition: none; }
}

@media (max-width: 720px) {
  .db__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 52px 16px 16px;
  }

  .wall {
    grid-template-columns: 1fr 1fr;
  }

  .dk__card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
  }

  .dk__card img {
    grid-column: 1;
    width: 100%;
    height: 100%;
    min-height: 0;
    aspect-ratio: auto;
  }

  .dk__k {
    grid-row: 2;
    padding: 14px 16px 18px;
    font-size: 48px;
  }

  .dy__chart {
    padding: 32px 16px 24px 76px;
  }

  .dy__ticks {
    inset: 10px 16px 0 76px;
  }

  .dy__v {
    left: 0;
    white-space: normal;
    width: 100%;
  }

  .dy__row dd {
    height: 64px;
  }
}
</style>
