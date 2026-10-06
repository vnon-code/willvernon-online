<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TwCredits from './TwCredits.vue'
import { BP, LOOP, M, QUARTERS, SLOGANS, SNAGS, TW } from './story'

// PROTOTYPE WC "Orbit" (overnight run, The World Plays Here r1).
// Refs: Lusion's project pages (one object at the centre, the work arranged round it); planetary orbit diagrams
// (the ring seen at a tilt) for the placements; a dealt hand of cards for the slogans; the logo's own four quarters
// as the build diagram; VFX before/after breakdown sliders (Framestore, ILM case pages) for the grade. Beats, each its
// own device: the loop as a planet with the eight placements on its orbit → the slogans as a fanned hand, the pick
// raised → the build as a circle cut in four → the grade as a drag-to-compare. Only the loop moves; the hand and the
// orbit react to hover and focus. PLACEHOLDER: sizes, copy, the orbit order.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

// Eight placements on an ellipse, starting at the top, clockwise
const sats = [
  { pic: M.subway[0]!, k: 'Subway' },
  { pic: M.shelter[0]!, k: 'Bus shelter' },
  { pic: M.youtube[1]!, k: 'YouTube' },
  { pic: M.insta[1]!, k: 'Instagram' },
  { pic: M.subway[1]!, k: 'Subway' },
  { pic: M.shelter[1]!, k: 'Bus shelter' },
  { pic: M.youtube[2]!, k: 'YouTube' },
  { pic: M.subway[2]!, k: 'Subway' },
].map((s, i) => {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2
  return { ...s, x: (50 + 39 * Math.cos(a)).toFixed(2), y: (50 + 39 * Math.sin(a)).toFixed(2) }
})

// The hand: the dead lines first, the pick last (on top)
const tilt = [-6, -3, 0, 3, 6]
const hand = SLOGANS.map((s, i) => ({ ...s, r: tilt[i]! }))

const x = ref(50)
const others = SNAGS.slice(1, 3)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="wc">
      <!-- The orbit -->
      <section class="ob" data-sheet-body data-sheet-block="orbit" aria-label="The campaign, around the world">
        <div data-build>
          <div class="ob__stage">
            <span class="ob__ring" aria-hidden="true" />
            <figure class="ob__core">
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
            </figure>
            <ul class="ob__sats">
              <li v-for="(s, i) in sats" :key="s.pic.src" :style="{ left: `${s.x}%`, top: `${s.y}%` }" tabindex="0">
                <img :src="s.pic.src" :alt="s.pic.alt" :width="s.pic.w" :height="s.pic.h" decoding="async" loading="lazy">
                <span class="ob__lab"><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ s.k }}</span>
              </li>
            </ul>
          </div>
          <div class="ob__bar">
            <h2 class="ob__title">
              {{ TW.title }}
            </h2>
            <p class="wc__text">
              {{ TW.brief }}
            </p>
            <dl class="ob__specs">
              <div>
                <dt>Year</dt>
                <dd>{{ TW.year }}</dd>
              </div>
              <div v-for="s in TW.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- The hand -->
      <section class="hd" data-sheet-block="slogans" aria-label="Five slogans, one chosen">
        <div class="hd__head">
          <p class="wc__k">
            Five lines
          </p>
          <p class="wc__text">
            {{ TW.idea }}
          </p>
        </div>
        <ol class="hd__cards">
          <li v-for="s in hand" :key="s.t" :class="{ 'is-pick': s.pick }" :style="{ '--r': `${s.r}deg` }" tabindex="0">
            <p class="hd__t">
              {{ s.t }}
            </p>
            <p class="hd__why">
              {{ s.pick ? 'Chosen. ' : '' }}{{ s.why }}
            </p>
          </li>
        </ol>
      </section>

      <!-- The build: a circle cut in four -->
      <section class="qt" data-sheet-block="build" aria-label="The build">
        <figure class="qt__pic">
          <img :src="BP.split.src" :alt="BP.split.alt" :width="BP.split.w" :height="BP.split.h" loading="lazy" decoding="async">
          <figcaption>
            <span class="wc__k">Blender</span>
            <span class="wc__text">{{ TW.concept }}</span>
          </figcaption>
        </figure>
        <ol class="qt__disc">
          <li v-for="(q, i) in QUARTERS" :key="q">
            <b>{{ i + 1 }}</b>
            <span>{{ q }}</span>
          </li>
        </ol>
      </section>

      <!-- The grade: drag to compare -->
      <section class="gr" data-sheet-block="grade" aria-label="The green, before and after">
        <div class="gr__head">
          <p class="wc__k">
            Grade
          </p>
          <p class="wc__text">
            Pushed green, then toned down to the brand.
          </p>
        </div>
        <div class="gr__cmp" :style="{ '--x': `${x}%` }">
          <img :src="BP.toned.src" :alt="BP.toned.alt" :width="BP.toned.w" :height="BP.toned.h" loading="lazy" decoding="async">
          <img class="gr__top" :src="BP.green.src" :alt="BP.green.alt" :width="BP.green.w" :height="BP.green.h" loading="lazy" decoding="async">
          <span class="gr__line" aria-hidden="true" />
          <span class="gr__tag is-l" aria-hidden="true">Before</span>
          <span class="gr__tag is-r" aria-hidden="true">After</span>
          <input v-model.number="x" type="range" min="0" max="100" step="1" aria-label="Compare the green before and after">
        </div>
        <ul class="gr__also">
          <li v-for="s in others" :key="s.k">
            {{ s.k }} <span>→ {{ s.fix }}</span>
          </li>
        </ul>
      </section>

      <TwCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.wc__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.wc__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

/* The orbit */
.ob {
  animation: wc-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes wc-in {
  from { opacity: 0; }
}

.ob__stage {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #020403;
}

.ob__ring {
  position: absolute;
  inset: 11%;
  border: 1px dashed rgb(255 255 255 / 0.28);
  border-radius: 50%;
}

.ob__core {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 46%;
  aspect-ratio: 1;
  margin: 0;
  translate: -50% -50%;
}

.ob__core {
  overflow: hidden;
  border-radius: 50%;
}

/* The sphere fills a third of the loop's square: scale it up inside the circle */
.ob__core video {
  scale: 1.45;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: #000;
}

.ob__sats {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ob__sats li {
  position: absolute;
  width: 15%;
  aspect-ratio: 4 / 3;
  translate: -50% -50%;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.35);
  background: #e9e9e9;
  outline-offset: 2px;
  transition: scale 260ms cubic-bezier(0.23, 1, 0.32, 1);
}

.ob__sats li:hover,
.ob__sats li:focus-visible {
  z-index: 1;
  scale: 1.7;
}

.ob__sats img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.25;
}

.ob__lab {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 3px 6px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.04em;
  white-space: nowrap;
  color: #fff;
  background: #000;
}

.ob__lab b {
  font-weight: 500;
  color: var(--c-accent);
}

.ob__bar {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr) minmax(0, 1.5fr);
  gap: 24px;
  align-items: start;
  padding: 22px 24px;
  border-top: 1px solid var(--rule);
}

.ob__title {
  margin: 0;
  font: 600 26px/1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.ob__specs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin: 0;
}

.ob__specs dt {
  font: 500 10px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ob__specs dd {
  margin: 2px 0 0;
  font: 400 13px/1.4 var(--font-ui);
}

/* The hand */
.hd {
  border-top: 1px solid var(--rule);
  padding-bottom: 48px;
  overflow-x: clip;
}

.hd__head,
.gr__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.hd__cards {
  display: flex;
  justify-content: center;
  margin: 24px 24px 0;
  padding: 0;
  list-style: none;
}

.hd__cards li {
  position: relative;
  display: grid;
  align-content: space-between;
  flex: 0 0 188px;
  height: 260px;
  margin-left: -14px;
  padding: 18px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: color-mix(in srgb, var(--c-fg) 6%, var(--c-bg));
  box-shadow: 0 10px 28px rgb(0 0 0 / 0.35);
  transform-origin: 50% 120%;
  rotate: var(--r);
  outline-offset: 3px;
  transition: translate 260ms cubic-bezier(0.23, 1, 0.32, 1);
}

.hd__cards li:first-child {
  margin-left: 0;
}

.hd__cards li:hover,
.hd__cards li:focus-visible {
  z-index: 2;
  translate: 0 -14px;
}

.hd__t {
  margin: 0;
  font: 600 24px/1.1 var(--font-ui);
  letter-spacing: -0.01em;
  color: var(--muted);
}

.hd__why {
  margin: 0;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

.hd__cards .is-pick {
  z-index: 1;
  translate: 0 -28px;
  border-color: #107c10;
  background: #0b3d0b;
}

.hd__cards .is-pick:hover,
.hd__cards .is-pick:focus-visible {
  translate: 0 -36px;
}

.is-pick .hd__t,
.is-pick .hd__why {
  color: #fff;
}

/* The build */
.qt {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
  gap: 32px;
  align-items: center;
  padding: 28px 24px 36px;
  border-top: 1px solid var(--rule);
}

.qt__pic {
  display: grid;
  gap: 14px;
  margin: 0;
}

.qt__pic img {
  display: block;
  width: 100%;
  height: auto;
  background: #000;
}

.qt__pic figcaption {
  display: grid;
  gap: 6px;
}

.qt__disc {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  aspect-ratio: 1;
  max-width: 440px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.qt__disc li {
  display: grid;
  align-content: end;
  justify-items: end;
  gap: 6px;
  padding: 16px;
  font: 400 13px/1.4 var(--font-ui);
  text-align: right;
  background: color-mix(in srgb, var(--c-fg) 7%, var(--c-bg));
}

.qt__disc li:nth-child(1) { border-top-left-radius: 100%; }

.qt__disc li:nth-child(2) {
  border-top-right-radius: 100%;
  justify-items: start;
  text-align: left;
}

.qt__disc li:nth-child(3) {
  border-bottom-left-radius: 100%;
  align-content: start;
}

.qt__disc li:nth-child(4) {
  border-bottom-right-radius: 100%;
  align-content: start;
  justify-items: start;
  text-align: left;
  background: color-mix(in srgb, #107c10 30%, var(--c-bg));
}

.qt__disc b {
  font: 600 28px/1 var(--font-ui);
  color: var(--c-accent);
}

.qt__disc span {
  max-width: 15ch;
}

/* The grade */
.gr {
  border-top: 1px solid var(--rule);
  padding-bottom: 28px;
}

.gr__cmp {
  position: relative;
  margin: 0 24px;
  aspect-ratio: 1260 / 663;
  overflow: hidden;
  background: #000;
}

.gr__cmp img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gr__top {
  clip-path: inset(0 calc(100% - var(--x)) 0 0);
}

.gr__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--x);
  width: 2px;
  margin-left: -1px;
  background: #fff;
  pointer-events: none;
}

.gr__line::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  translate: -50% -50%;
  border: 2px solid #fff;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.5);
}

.gr__tag {
  position: absolute;
  top: 10px;
  padding: 4px 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: #000;
  pointer-events: none;
}

.gr__tag.is-l { left: 10px; }
.gr__tag.is-r { right: 10px; }

.gr__cmp input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.gr__cmp:has(input:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.gr__also {
  display: grid;
  gap: 6px;
  margin: 18px 24px 0;
  padding: 0;
  list-style: none;
  font: 400 14px/1.45 var(--font-ui);
}

.gr__also span {
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .ob { animation-duration: 1ms; }

  .ob__sats li,
  .hd__cards li { transition: none; }
}

@media (max-width: 720px) {
  .ob__stage {
    aspect-ratio: 1;
  }

  .ob__core {
    width: 50%;
  }

  .ob__sats li {
    width: 22%;
  }

  .ob__sats li:hover,
  .ob__sats li:focus-visible {
    scale: 1.3;
  }

  .ob__lab {
    display: none;
  }

  .ob__bar {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 18px 52px 20px 16px;
  }

  .hd__head,
  .gr__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 16px 16px;
  }

  .hd {
    padding-bottom: 24px;
  }

  .hd__cards {
    flex-direction: column;
    gap: 10px;
    margin: 4px 16px 0;
  }

  .hd__cards li {
    flex: none;
    height: auto;
    gap: 10px;
    margin-left: 0;
    rotate: calc(var(--r) / 4);
  }

  .hd__cards .is-pick {
    translate: none;
  }

  .hd__t {
    font-size: 20px;
  }

  .qt {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
    padding: 22px 16px 28px;
  }

  .qt__disc {
    aspect-ratio: auto;
  }

  .qt__disc li {
    min-height: 150px;
    padding: 12px;
    font-size: 13px;
  }

  .qt__disc li:nth-child(1) { border-top-left-radius: 80px; }
  .qt__disc li:nth-child(2) { border-top-right-radius: 80px; }
  .qt__disc li:nth-child(3) { border-bottom-left-radius: 80px; }
  .qt__disc li:nth-child(4) { border-bottom-right-radius: 80px; }

  .qt__disc b {
    font-size: 22px;
  }

  .gr__cmp,
  .gr__also {
    margin-inline: 16px;
  }
}
</style>
