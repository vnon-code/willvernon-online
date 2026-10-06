<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { BP, INFO, LOOP, M, POLISH, QUARTERS, SLOGANS, SNAGS, TW } from './story'
import { useSeen } from './useSeen'

// PROTOTYPE WC2 "Orbit, refined" (overnight run, The World Plays Here r2): WC with the judges' r1 notes applied.
// The shared head, contents and numbering; the orbit as the first beat (no tile over the loop's XBOX wordmark); the
// hand fans in and the four dead lines are struck in red; the build's four quarters hold the Blender captures; the
// grade compares two frames aligned on the sphere (both shown at most at their own size); it ends on a subway frame.
// No UI green: green stays inside the work. Refs as WC: Lusion's project pages, orbit diagrams, a dealt hand, VFX
// before/after sliders. PLACEHOLDER: sizes, copy, the orbit order.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
const handEl = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
const dealt = useSeen(handEl)
void props

const { sec } = useSheetSections('wc2', [
  { id: 'placements', label: 'Placements' },
  { id: 'slogans', label: 'Five lines' },
  { id: 'build', label: 'Build' },
  { id: 'grade', label: 'Grade' },
])

// Eight placements on an ellipse, offset half a step so none sits straight under the loop (its XBOX wordmark)
const sats = [
  { pic: M.subway[1]!, k: 'Subway' },
  { pic: M.shelter[0]!, k: 'Bus shelter' },
  { pic: M.youtube[1]!, k: 'YouTube' },
  { pic: M.insta[1]!, k: 'Instagram' },
  { pic: M.subway[2]!, k: 'Subway' },
  { pic: M.shelter[1]!, k: 'Bus shelter' },
  { pic: M.youtube[2]!, k: 'YouTube' },
  { pic: M.youtube[0]!, k: 'YouTube' },
].map((s, i) => {
  const a = ((i + 0.5) / 8) * Math.PI * 2 - Math.PI / 2
  return { ...s, x: (50 + 41 * Math.cos(a)).toFixed(2), y: (50 + 43 * Math.sin(a)).toFixed(2) }
})

// The hand: the dead lines first, the pick last (on top)
const tilt = [-6, -3, 0, 3, 6]
const hand = SLOGANS.map((s, i) => ({ ...s, r: tilt[i]! }))

// The four quarters, each with the capture of its step
const qpics = [BP.split, BP.wrap, BP.arc, BP.black]

// Both grade frames hold the sphere at x ≈ 662px; a 1196px window from x 64 puts it at 50% in each
const x = ref(50)
const others = SNAGS.slice(1, 3)
const OUT = M.subway[0]!
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="TW.title" :hook="TW.brief" :info="INFO" />
    <div ref="root" class="wc">
      <!-- 01 The orbit -->
      <section class="ob" v-bind="sec('placements')" data-sheet-block="placements">
        <div class="wc__head">
          <SheetSectionNo id="placements" />
        </div>
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
      </section>

      <!-- 02 The hand -->
      <section class="hd" v-bind="sec('slogans')" data-sheet-block="slogans">
        <div class="wc__head">
          <SheetSectionNo id="slogans" />
          <p class="wc__text">
            {{ TW.idea }}
          </p>
        </div>
        <ol ref="handEl" class="hd__cards" :class="{ 'is-dealt': dealt }">
          <li v-for="(s, i) in hand" :key="s.t" :class="{ 'is-pick': s.pick }" :style="{ '--r': `${s.r}deg`, '--i': i }" tabindex="0">
            <p class="hd__t">
              <span>{{ s.t }}</span>
            </p>
            <p class="hd__why">
              {{ s.pick ? 'Chosen. ' : '' }}{{ s.why }}
            </p>
          </li>
        </ol>
      </section>

      <!-- 03 The build: a circle cut in four, a capture in each quarter -->
      <section class="qt" v-bind="sec('build')" data-sheet-block="build">
        <div class="qt__side">
          <SheetSectionNo id="build" />
          <p class="wc__text">
            {{ TW.concept }}
          </p>
          <p class="wc__text qt__polish">
            {{ POLISH }}
          </p>
        </div>
        <ol class="qt__disc">
          <li v-for="(q, i) in QUARTERS" :key="q">
            <img :src="qpics[i]!.src" :alt="qpics[i]!.alt" :width="qpics[i]!.w" :height="qpics[i]!.h" loading="lazy" decoding="async">
            <b>{{ i + 1 }}</b>
            <span>{{ q }}</span>
          </li>
        </ol>
      </section>

      <!-- 04 The grade: drag to compare -->
      <section class="gr" v-bind="sec('grade')" data-sheet-block="grade">
        <div class="wc__head">
          <SheetSectionNo id="grade" />
          <p class="wc__text">
            Pushed green, then toned down to the brand.
          </p>
        </div>
        <div class="gr__cmp" :style="{ '--x': `${x}%` }">
          <img class="gr__a" :src="BP.toned.src" :alt="BP.toned.alt" :width="BP.toned.w" :height="BP.toned.h" loading="lazy" decoding="async">
          <img class="gr__top gr__b" :src="BP.green.src" :alt="BP.green.alt" :width="BP.green.w" :height="BP.green.h" loading="lazy" decoding="async">
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

      <!-- The outcome, in the world -->
      <figure class="oc" data-sheet-block="outcome">
        <img :src="OUT.src" :alt="OUT.alt" :width="OUT.w" :height="OUT.h" loading="lazy" decoding="async">
        <figcaption>
          <span class="wc__k">Outcome</span>
          <span class="wc__text">A 10 s film, then subway, bus shelter, YouTube and Instagram.</span>
        </figcaption>
      </figure>

      <SheetCredits :items="TW.credits" />
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

/* Section heads: the shared number, then one line */
.wc__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

/* The orbit */
.ob {
  border-top: 1px solid var(--rule);
}

.ob__stage {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #020403;
}

.ob__ring {
  position: absolute;
  inset: 7% 9%;
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

/* A little scale for the sphere, but the XBOX wordmark at the loop's foot stays inside the circle */
.ob__core video {
  scale: 1.1;
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

/* The hand */
.hd {
  border-top: 1px solid var(--rule);
  padding-bottom: 48px;
  overflow-x: clip;
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
  rotate: 0deg;
  translate: 0 36px;
  opacity: 0;
  outline-offset: 3px;
  transition:
    rotate 520ms cubic-bezier(0.23, 1, 0.32, 1) calc(var(--i) * 70ms),
    translate 520ms cubic-bezier(0.23, 1, 0.32, 1) calc(var(--i) * 70ms),
    opacity 300ms ease-out calc(var(--i) * 70ms);
}

.hd__cards.is-dealt li {
  rotate: var(--r);
  translate: 0 0;
  opacity: 1;
}

.hd__cards li:first-child {
  margin-left: 0;
}

.hd__cards.is-dealt li:hover,
.hd__cards.is-dealt li:focus-visible {
  z-index: 2;
  translate: 0 -14px;
  transition-delay: 0ms;
}

.hd__t {
  margin: 0;
  font: 600 24px/1.1 var(--font-ui);
  letter-spacing: -0.01em;
  color: var(--muted);
}

/* The struck line: a red rule drawn across every line of the title, after the deal */
li:not(.is-pick) .hd__t span {
  background: linear-gradient(var(--c-accent), var(--c-accent)) 0 58% / 0% 3px no-repeat;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  transition: background-size 420ms cubic-bezier(0.65, 0, 0.35, 1) calc(520ms + var(--i) * 110ms);
}

.is-dealt li:not(.is-pick) .hd__t span {
  background-size: 100% 3px;
}

.hd__why {
  margin: 0;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

.hd__cards .is-pick {
  z-index: 1;
  border-color: #fff;
  background: #fff;
  box-shadow: inset 0 4px 0 var(--c-accent), 0 10px 28px rgb(0 0 0 / 0.35);
}

.hd__cards.is-dealt .is-pick {
  translate: 0 -28px;
}

.hd__cards.is-dealt .is-pick:hover,
.hd__cards.is-dealt .is-pick:focus-visible {
  translate: 0 -36px;
}

.is-pick .hd__t,
.is-pick .hd__why {
  color: #000;
}

/* The build */
.qt {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 32px;
  align-items: center;
  padding: 0 24px 36px 0;
  border-top: 1px solid var(--rule);
}

.qt__side {
  display: grid;
  gap: 14px;
  align-self: start;
  padding: 22px 0 0 24px;
}

.qt__polish {
  padding-top: 14px;
  border-top: 1px solid var(--rule);
}

.qt__disc {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  aspect-ratio: 1;
  width: 100%;
  max-width: 560px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.qt__disc li {
  position: relative;
  display: grid;
  align-content: end;
  justify-items: end;
  gap: 6px;
  padding: 18px;
  overflow: hidden;
  font: 400 13px/1.4 var(--font-ui);
  text-align: right;
  color: #fff;
  background: #000;
}

.qt__disc img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.72;
}

/* A scrim towards the words, so the line reads over the capture */
.qt__disc li::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0) 70%);
}

.qt__disc b,
.qt__disc span {
  position: relative;
  z-index: 1;
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
}

.qt__disc li:nth-child(3)::after,
.qt__disc li:nth-child(4)::after {
  background: linear-gradient(to bottom, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0) 70%);
}

.qt__disc b {
  font: 600 28px/1 var(--font-ui);
  color: var(--c-accent);
}

.qt__disc span {
  max-width: 17ch;
}

/* The grade */
.gr {
  border-top: 1px solid var(--rule);
  padding-bottom: 28px;
}

.gr__cmp {
  position: relative;
  max-width: 1196px;
  margin: 0 24px;
  aspect-ratio: 1196 / 663;
  overflow: hidden;
  background: #000;
}

/* Each frame at its own aspect, offset 64px of 1196 so the sphere sits on 50% in both */
.gr__cmp img {
  position: absolute;
  top: 0;
  left: -5.351%;
  display: block;
  max-width: none;
  height: 100%;
}

.gr__a { width: 105.351%; }
.gr__b { width: 107.609%; }

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

/* The outcome, in the world */
.oc {
  margin: 0;
  border-top: 1px solid var(--rule);
}

.oc img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.oc figcaption {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 18px 24px 22px;
}

@media (prefers-reduced-motion: reduce) {
  .ob__sats li,
  .hd__cards li,
  .hd__t span { transition: none !important; }
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

  .wc__head,
  .oc figcaption {
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
  }

  .hd__cards.is-dealt li {
    rotate: calc(var(--r) / 4);
  }

  .hd__cards.is-dealt .is-pick {
    translate: none;
  }

  .hd__t {
    font-size: 20px;
  }

  .qt {
    grid-template-columns: minmax(0, 1fr);
    gap: 18px;
    padding: 0 16px 28px;
  }

  .qt__side {
    padding: 22px 0 0;
  }

  .qt__disc {
    aspect-ratio: auto;
    margin: 0;
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
