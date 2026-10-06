<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { B, CLIPS, FIGURE, FILM, MO, NIGHT, TRAILER, WORLD } from './story'
import { useOpenPlay } from './useOpenPlay'

// PROTOTYPE MB "Turnaround" (overnight run, Monolith r1).
// Refs: character turnaround / model sheets from film and games pre-production, played as a flipbook the way Apple's
// product pages scrub a still sequence with the scroll (and Lusion's pinned stages); a film call sheet / edit log for
// the night; Rejouice's running ticker (one of Will's keepers) for the world.
// Beats, each its own device: the two cuts side by side, film and trailer, over a four-column slate → the eight
// portraits as a pinned flipbook that steps one portrait per stretch of scroll, with a counter (a swipe rail on phones
// and without scroll timelines) → the night as a timestamped log from the file dates → the world as a slow ticker.
// Only transforms move, on a scroll timeline that attaches once the Sheet is open. PLACEHOLDER: sizes, copy, speeds.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// 2026-10-07: the title, info, contents, numbering and credits are the shared ones (sheets/_shared, TOOLS.md)
const { sec } = useSheetSections('mb', [
  { id: 'figure', label: 'Turnaround' },
  { id: 'night', label: 'One night' },
  { id: 'world', label: 'The world' },
])
const info = {
  year: MO.year,
  role: MO.credits[0]?.k,
  tools: MO.specs.find(x => x.k === 'Tools')?.v,
}

const cuts = [FILM, TRAILER]
const thumbs = [
  { pic: WORLD.concrete },
  { pic: { src: `${B}frame-outcome-3.webp`, alt: 'A frame from the film: the figure in profile' } },
  { clip: CLIPS[3]! },
  { pic: { src: `${B}frame-outcome-26.webp`, alt: 'A frame from the film: the back of the figure\'s hood' } },
  { pic: { src: TRAILER.poster, alt: 'The trailer\'s first frame: a grey cliff' } },
]
const ticker = [WORLD.spires, WORLD.gateway, WORLD.storm, WORLD.pillar, WORLD.steps, WORLD.cliff, WORLD.canyon, WORLD.monoliths]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="mb">
      <!-- Lead: the film and the trailer side by side, then the shared title, info and contents -->
      <SheetHead :title="MO.title" :hook="MO.line" :info="info">
        <template #before>
          <div class="cu__pair">
            <figure v-for="c in cuts" :key="c.src" class="cu__cut">
              <video
                :src="c.src"
                :poster="c.poster"
                :width="c.w"
                :height="c.h"
                muted
                loop
                playsinline
                preload="none"
                data-play
                :aria-label="`Monolith Survival, ${c.label}`"
              />
              <figcaption>{{ c.label }}</figcaption>
            </figure>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Turnaround: a pinned flipbook, one portrait per stretch of scroll -->
      <section class="ta" v-bind="sec('figure')" data-sheet-block="figure">
        <div class="ta__run">
          <div class="ta__stage">
            <div class="ta__copy">
              <SheetSectionNo id="figure" />
              <div class="ta__num" aria-hidden="true">
                <ol>
                  <li v-for="(f, i) in FIGURE" :key="f.src">
                    {{ String(i + 1).padStart(2, '0') }}
                  </li>
                </ol>
                <span>/ 08</span>
              </div>
              <p class="mb__text">
                {{ MO.figure }} {{ MO.brand }}
              </p>
            </div>
            <div class="ta__frame">
              <ol class="ta__strip" tabindex="0" aria-label="VARKON 1 to 8">
                <li v-for="f in FIGURE" :key="f.src">
                  <img :src="f.src" :srcset="f.srcset" sizes="(max-width: 720px) 62vw, 420px" :alt="f.alt" :width="f.w" :height="f.h" loading="lazy" decoding="async">
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <!-- 02 One night: the file dates as a log -->
      <section class="nt" v-bind="sec('night')" data-sheet-block="night">
        <div class="mb__head">
          <SheetSectionNo id="night" />
          <p class="mb__text">
            {{ MO.clips }}
          </p>
        </div>
        <ol class="nt__log">
          <li v-for="(n, i) in NIGHT" :key="n.t">
            <time class="nt__t">{{ n.t }}</time>
            <span class="nt__d">{{ n.d }}</span>
            <span class="nt__k">{{ n.k }}</span>
            <span class="nt__v">{{ n.v }}</span>
            <video
              v-if="thumbs[i]!.clip"
              class="nt__thumb"
              :src="thumbs[i]!.clip!.src"
              :poster="thumbs[i]!.clip!.poster"
              width="1080"
              height="1872"
              muted
              loop
              playsinline
              preload="none"
              data-play
              aria-label="A five-second Midjourney clip of the landscape"
            />
            <img v-else class="nt__thumb" :src="thumbs[i]!.pic!.src" :alt="thumbs[i]!.pic!.alt" width="720" height="1248" loading="lazy" decoding="async">
          </li>
        </ol>
      </section>

      <!-- 03 The world: a slow ticker (two copies for the loop) -->
      <section class="mq" v-bind="sec('world')" data-sheet-block="world">
        <div class="mb__head">
          <SheetSectionNo id="world" />
          <p class="mb__text">
            {{ MO.look }}
          </p>
        </div>
        <div class="mq__clip">
          <div class="mq__track">
            <img v-for="m in ticker" :key="m.src" :src="m.src" :srcset="m.srcset" sizes="300px" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
            <img v-for="m in ticker" :key="`b${m.src}`" :src="m.src" :srcset="m.srcset" sizes="300px" alt="" aria-hidden="true" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          </div>
        </div>
      </section>

      <SheetCredits :items="MO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mb__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 28px 24px;
}

.mb__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* Lead: two cuts, side by side */
.cu__pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.cu__cut {
  position: relative;
  margin: 0;
}

.cu__cut video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  background: #000;
}

.cu__cut figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 8px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

/* 01 Turnaround. Default (phones, no scroll timelines): a swipe rail */
.ta {
  border-top: 1px solid var(--rule);
}

.ta__stage {
  display: grid;
  gap: 20px;
  padding: 28px 0 0;
}

.ta__copy {
  display: grid;
  gap: 16px;
  padding: 0 24px;
}

.ta__num {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font: 600 64px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

.ta__num ol {
  height: 1em;
  margin: 0;
  padding: 0;
  overflow: clip;
  list-style: none;
}

.ta__num li {
  height: 1em;
}

.ta__num span {
  font-size: 18px;
  font-weight: 400;
  color: var(--muted);
}

.ta__strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 62%;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  background: var(--rule);
}

.ta__strip li {
  scroll-snap-align: start;
}

.ta__strip img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  object-fit: cover;
}

@supports (animation-timeline: view()) {
  @media (min-width: 721px) {
    .ta__run {
      height: calc(var(--view-h) + 240svh);
      view-timeline: --ta block;
      view-timeline-inset: var(--header-h) 0;
    }

    .ta__stage {
      position: sticky;
      top: -16px; /* the layer's padding: pins it just under the header, as SF's track */
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: stretch;
      height: var(--view-h);
      padding: 0;
      overflow: clip;
    }

    .ta__copy {
      align-content: center;
      padding: 32px 24px;
    }

    .ta__num {
      font-size: 120px;
    }

    .ta__frame {
      height: var(--view-h);
      aspect-ratio: 9 / 16;
      overflow: clip;
      border-left: 1px solid var(--rule);
    }

    .ta__strip {
      grid-auto-columns: calc(100% / 8);
      width: 800%;
      height: 100%;
      gap: 0;
      overflow: visible;
      scroll-snap-type: none;
    }

    .ta__strip img {
      height: 100%;
      aspect-ratio: auto;
    }

    .ta__strip,
    .ta__num ol li {
      animation: none steps(8, jump-none) both;
      animation-timeline: --ta;
      animation-range: contain 0% contain 100%;
    }

    .ta__num ol li {
      animation-timing-function: steps(8, jump-none);
    }

    html[data-sheet='open'] .ta__strip { animation-name: mb-flip; }
    html[data-sheet='open'] .ta__num ol li { animation-name: mb-count; }
  }
}

@keyframes mb-flip {
  to { transform: translateX(-87.5%); }
}

@keyframes mb-count {
  to { transform: translateY(-700%); }
}

/* 02 The night log */
.nt {
  border-top: 1px solid var(--rule);
}

.nt__log {
  margin: 0;
  padding: 0;
  list-style: none;
}

.nt__log li {
  display: grid;
  grid-template-columns: 140px 72px 96px minmax(0, 1fr) 72px;
  gap: 16px;
  align-items: center;
  padding: 10px 24px;
  border-top: 1px solid var(--rule);
}

.nt__t {
  font: 600 40px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.nt__d,
.nt__k {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.nt__k {
  color: var(--c-accent);
}

.nt__v {
  font: 400 15px/1.5 var(--font-ui);
}

.nt__thumb {
  display: block;
  width: 72px;
  height: auto;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  background: #000;
}

/* 03 The ticker: one transform, running only while the Sheet is open; hover holds it */
.mq {
  border-top: 1px solid var(--rule);
}

.mq__clip {
  overflow: hidden;
  border-top: 1px solid var(--rule);
}

.mq__track {
  display: flex;
  gap: 1px;
  width: max-content;
}

.mq__track img {
  display: block;
  width: auto;
  height: 300px;
  object-fit: cover;
}

html[data-sheet='open'] .mq__track {
  animation: mb-tick 70s linear infinite;
}

.mq__clip:hover .mq__track {
  animation-play-state: paused;
}

@keyframes mb-tick {
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  html[data-sheet='open'] .mq__track { animation: none; }

  .mq__clip { overflow-x: auto; }
}

@media (max-width: 720px) {
  .mb__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 22px 52px 22px 16px;
  }

  .ta__copy {
    padding: 0 52px 0 16px;
  }

  .nt__log li {
    grid-template-columns: 72px minmax(0, 1fr) 48px;
    grid-template-areas: 't k th' 't v th' 'd v th';
    gap: 2px 12px;
    padding: 12px 16px;
  }

  .nt__t { grid-area: t; font-size: 22px; }
  .nt__d { grid-area: d; }
  .nt__k { grid-area: k; }
  .nt__v { grid-area: v; font-size: 14px; }
  .nt__thumb { grid-area: th; width: 48px; }

  .mq__track img {
    height: 200px;
  }
}
</style>
