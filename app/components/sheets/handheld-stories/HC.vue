<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, HS, INFO, PICS, SB, TYPE } from './story'

// PROTOTYPE HC "UI kit" (overnight run, Handheld Stories r1). The Sheet as the design system documentation for a
// website that was only ever a film, each beat its own device: the four pages as a 2 × 2 of screens → the type scale
// as a ladder at its real proportions → the two faked components working for real (the hover is two layers and one
// opacity keyframe; the info box an underbox and an overbox) → the cursor's ease shown against linear → the output.
// Refs: design-system docs pages (Vercel Geist, GOV.UK Design System) and component playgrounds (Storybook); the
// identity case studies on Pentagram and Collins that show type specimens and states side by side; Emil Kowalski's
// easing demos. Videos play only in view, once the Sheet is open (useOpenPlay); the cursor demo runs only in view.
// PLACEHOLDER: sizes, copy, timings.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('hc', [
  { id: 'type', label: 'Type' },
  { id: 'parts', label: 'Components' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'output', label: 'Output' },
])

const SCREENS = [
  { k: 'Landing', pic: SB.landing },
  { k: 'Catalogue', clip: CLIPS.catalogue },
  { k: 'Object', pic: SB.object },
  { k: 'Database', pic: SB.database },
]

// The info box
const info = ref(false)

// The cursor demo runs only while its section is in view
const curEl = ref<HTMLElement>()
const curOn = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!curEl.value) return
  io = new IntersectionObserver((es) => { curOn.value = es.some(e => e.isIntersecting) }, { root: curEl.value.closest('[data-sheet-layer]') })
  io.observe(curEl.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="hc">
      <SheetHead :title="HS.title" :hook="HS.hook" :info="INFO">
        <template #before>
          <ol class="sc" aria-label="The four pages">
            <li v-for="(s, i) in SCREENS" :key="s.k">
              <video
                v-if="s.clip"
                :src="s.clip.src"
                :poster="s.clip.poster"
                width="960"
                height="540"
                muted
                loop
                playsinline
                preload="none"
                data-play
                :aria-label="s.clip.alt"
              />
              <img v-else :src="s.pic!.src" :srcset="s.pic!.srcset" sizes="(max-width: 720px) 50vw, 520px" :alt="s.pic!.alt" :width="s.pic!.w" :height="s.pic!.h" decoding="async">
              <span class="sc__k"><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ s.k }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 Type: the scale as a ladder -->
      <section class="ty" v-bind="sec('type')" data-sheet-block="type">
        <div class="ty__words">
          <SheetSectionNo id="type" />
          <p class="hc__text">
            {{ HS.type }}
          </p>
          <p class="hc__text">
            {{ HS.colour }}
          </p>
          <div class="ty__sw" aria-hidden="true">
            <span class="ty__b">#000</span><span class="ty__w">#FFF</span>
          </div>
          <p class="hc__text">
            {{ HS.canvas }}
          </p>
        </div>
        <ol class="ty__ladder">
          <li v-for="t in TYPE" :key="t.pt" :style="{ '--pt': t.pt }">
            <span class="ty__pt">{{ t.pt }} pt</span>
            <img v-if="t.face === 'Osake'" class="ty__logo" :src="PICS.logo.src" :width="PICS.logo.w" :height="PICS.logo.h" :alt="PICS.logo.alt" loading="lazy" decoding="async">
            <span v-else class="ty__spec">{{ t.pt === 35 ? 'Coiled Snake' : t.pt === 20 ? 'Discover More' : 'Carved from wood or ivory into forms from nature, myth and daily life.' }}</span>
            <span class="ty__k">{{ t.k }} · {{ t.face }}</span>
          </li>
        </ol>
      </section>

      <!-- 02 Components: the two fakes, working -->
      <section class="cp" v-bind="sec('parts')" data-sheet-block="parts">
        <div class="cp__words">
          <SheetSectionNo id="parts" />
          <p class="hc__text">
            {{ HS.hover }}
          </p>
          <p class="hc__text">
            {{ HS.info }}
          </p>
          <img class="cp__psd" :src="SB.buttons.src" :width="SB.buttons.w" :height="SB.buttons.h" :alt="SB.buttons.alt" loading="lazy" decoding="async">
        </div>
        <div class="cp__bench">
          <div class="cp__cell">
            <span class="cp__tag">Hover</span>
            <button type="button" class="cp__btn">
              <span class="cp__idle">Discover More</span>
              <span class="cp__over" aria-hidden="true">Discover More</span>
            </button>
            <div class="cp__track" aria-hidden="true">
              <span>Opacity</span><i class="cp__key" /><i class="cp__key cp__key--b" /><b class="cp__fill" />
            </div>
          </div>
          <div class="cp__cell">
            <span class="cp__tag">Info</span>
            <div class="cp__info" :class="{ 'is-open': info }">
              <button type="button" class="cp__ibtn" :aria-expanded="info" aria-controls="hc-infobox" @click="info = !info">
                Info
              </button>
              <div id="hc-infobox" class="cp__box" :aria-hidden="!info">
                <span class="cp__under" />
                <span class="cp__overbox" />
                <p>Netsuke are more than just objects. They are stories carved in miniature.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 03 Cursor: linear vs eased -->
      <section ref="curEl" class="cu" :class="{ 'is-on': curOn }" v-bind="sec('cursor')" data-sheet-block="cursor">
        <div class="cu__words">
          <SheetSectionNo id="cursor" />
          <p class="hc__text">
            {{ HS.cursor }}
          </p>
        </div>
        <div class="cu__lanes" aria-hidden="true">
          <div class="cu__lane">
            <span class="cu__k">Linear</span>
            <i class="cu__t cu__t--a" /><i class="cu__t cu__t--b" />
            <svg class="cu__ptr cu__ptr--lin" viewBox="0 0 16 22" width="16" height="22"><path d="M1 1v17l4.5-4.2 3 6.7 2.6-1.2-3-6.6H14z" /></svg>
          </div>
          <div class="cu__lane">
            <span class="cu__k">Ease in, ease out</span>
            <i class="cu__t cu__t--a" /><i class="cu__t cu__t--b" />
            <svg class="cu__ptr cu__ptr--ease" viewBox="0 0 16 22" width="16" height="22"><path d="M1 1v17l4.5-4.2 3 6.7 2.6-1.2-3-6.6H14z" /></svg>
          </div>
        </div>
      </section>

      <!-- 04 Output -->
      <section class="op" v-bind="sec('output')" data-sheet-block="output">
        <video
          :src="CLIPS.object.src"
          :poster="CLIPS.object.poster"
          width="960"
          height="540"
          muted
          loop
          playsinline
          preload="none"
          data-play
          :aria-label="CLIPS.object.alt"
        />
        <div class="op__words">
          <SheetSectionNo id="output" />
          <p class="hc__text">
            {{ HS.exports }}
          </p>
          <ol class="op__v" aria-label="Seven exports, the seventh kept">
            <li v-for="n in 7" :key="n" :class="{ 'is-on': n === 7 }">
              v{{ n }}
            </li>
          </ol>
        </div>
      </section>

      <SheetCredits :items="HS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.hc__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The four screens */
.sc {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}

.sc li {
  position: relative;
  background: #fff;
}

.sc img,
.sc video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.sc__k {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 5px 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: #111;
}

.sc__k b {
  margin-right: 4px;
  color: #ff6a5e;
  font-weight: 500;
}

/* 01 Type ladder: sizes keep the 86 / 35 / 20 / 16 proportion */
.ty {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.ty__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.ty__sw {
  display: flex;
  border: 1px solid var(--rule);
  width: max-content;
}

.ty__sw span {
  display: grid;
  place-items: end start;
  width: 72px;
  height: 56px;
  padding: 6px;
  font: 500 11px/1 var(--font-ui);
}

.ty__b { background: #000; color: #fff; }
.ty__w { background: #fff; color: #000; }

.ty__ladder {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}

.ty__ladder li {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  grid-template-rows: auto auto;
  gap: 6px 16px;
  align-items: baseline;
  padding: 18px 24px;
}

.ty__ladder li + li {
  border-top: 1px solid var(--rule);
}

.ty__pt {
  grid-row: 1 / 3;
  font: 500 12px/1 var(--font-ui);
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.ty__spec {
  font-family: 'Noto Sans', var(--font-ui);
  font-weight: 600;
  font-size: calc(var(--pt) * 0.62px);
  line-height: 1.15;
}

.ty__ladder li:last-child .ty__spec {
  max-width: 40ch;
  font-weight: 400;
  line-height: calc(14 / 16 * 1.6);
}

.ty__logo {
  display: block;
  width: min(100%, 420px);
  height: auto;
}

.ty__k {
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

/* 02 Components */
.cp {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.cp__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.cp__psd {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 6px;
  outline: 1px solid var(--rule);
}

.cp__bench {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: #d8d8d4;
  border-left: 1px solid var(--rule);
}

.cp__cell {
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 28px;
  min-height: 320px;
  padding: 48px 20px 28px;
  background: #f4f4f2;
  color: #111;
}

.cp__tag {
  position: absolute;
  top: 14px;
  left: 14px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #666;
}

/* The hover: an idle layer, a hover layer on top, one opacity keyframe */
.cp__btn {
  position: relative;
  display: grid;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.cp__idle,
.cp__over {
  grid-area: 1 / 1;
  padding: 12px 22px;
  font: 600 16px/1 'Noto Sans', var(--font-ui);
  border: 2px solid #111;
}

.cp__idle {
  background: #fff;
  color: #111;
}

.cp__over {
  background: #111;
  color: #fff;
  opacity: 0;
  transition: opacity 180ms ease-out;
}

.cp__btn:hover .cp__over,
.cp__btn:focus-visible .cp__over {
  opacity: 1;
}

.cp__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 4px;
}

.cp__track {
  position: relative;
  width: min(100%, 220px);
  height: 22px;
  border-bottom: 1px solid #bbb;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #888;
}

.cp__fill {
  position: absolute;
  left: 0;
  bottom: -1px;
  height: 2px;
  width: 100%;
  background: #111;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 180ms ease-out;
}

.cp__key {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 9px;
  height: 9px;
  background: #f4f4f2;
  border: 1px solid #111;
  transform: rotate(45deg);
}

.cp__key--b {
  left: auto;
  right: 0;
}

.cp__cell:has(.cp__btn:hover) .cp__fill,
.cp__cell:has(.cp__btn:focus-visible) .cp__fill {
  transform: scaleX(1);
}

.cp__cell:has(.cp__btn:hover) .cp__key--b,
.cp__cell:has(.cp__btn:focus-visible) .cp__key--b {
  background: #111;
}

/* The info box: an underbox grows, an overbox fades in black, the text turns white */
.cp__info {
  position: relative;
  width: min(100%, 260px);
  min-height: 150px;
}

.cp__ibtn {
  position: relative;
  z-index: 2;
  display: block;
  margin-left: auto;
  padding: 8px 14px;
  font: 600 14px/1 'Noto Sans', var(--font-ui);
  color: #111;
  background: #fff;
  border: 2px solid #111;
  cursor: pointer;
  transition: color 200ms ease-out, background-color 200ms ease-out;
}

.cp__ibtn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.is-open .cp__ibtn {
  color: #fff;
  background: #111;
  border-color: #fff;
}

.cp__box {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.cp__under,
.cp__overbox {
  position: absolute;
  inset: 0;
  transform-origin: top right;
}

.cp__under {
  border: 2px solid #111;
  background: #fff;
  transform: scale(0.24, 0.22);
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cp__overbox {
  background: #111;
  opacity: 0;
  transform: scale(0.24, 0.22);
  transition: transform 320ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out 80ms;
}

.cp__box p {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  margin: 0;
  font: 400 13px/1.45 'Noto Sans', var(--font-ui);
  color: #fff;
  opacity: 0;
  transition: opacity 160ms ease-out;
}

.is-open .cp__under,
.is-open .cp__overbox {
  transform: none;
}

.is-open .cp__overbox {
  opacity: 1;
}

.is-open .cp__box p {
  opacity: 1;
  transition-delay: 220ms;
}

/* 03 Cursor: one path, two curves */
.cu {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.cu__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.cu__lanes {
  display: grid;
  border-left: 1px solid var(--rule);
}

.cu__lane {
  position: relative;
  container-type: inline-size;
  height: 120px;
  overflow: hidden;
}

.cu__lane + .cu__lane {
  border-top: 1px solid var(--rule);
}

.cu__k {
  position: absolute;
  top: 12px;
  left: 16px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cu__t {
  position: absolute;
  top: 54px;
  width: 64px;
  height: 26px;
  border: 1px solid var(--rule);
}

.cu__t--a { left: 10%; }
.cu__t--b { right: 10%; }

.cu__ptr {
  position: absolute;
  top: 62px;
  left: calc(10% + 26px);
  fill: var(--c-fg);
  stroke: var(--c-bg);
  stroke-width: 1.2;
  animation: cu-go 2.4s infinite alternate paused;
  will-change: transform;
}

.cu__ptr--lin { animation-timing-function: linear; }
.cu__ptr--ease { animation-timing-function: cubic-bezier(0.65, 0, 0.35, 1); }
.is-on .cu__ptr { animation-play-state: running; }

/* from target A's middle to target B's: 80% of the lane less 58px */
@keyframes cu-go {
  0%, 12% { transform: translate3d(0, 0, 0); }
  88%, 100% { transform: translate3d(calc(80cqw - 58px), 0, 0); }
}

/* 04 Output */
.op {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}

.op video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #fff;
}

.op__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}

.op__v {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.op__v li {
  padding: 6px 8px;
  font: 500 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
  border: 1px solid var(--rule);
  text-decoration: line-through;
}

.op__v li.is-on {
  color: var(--c-bg);
  background: var(--c-fg);
  border-color: var(--c-fg);
  text-decoration: none;
}

@media (prefers-reduced-motion: reduce) {
  .cp__over, .cp__fill, .cp__ibtn, .cp__under, .cp__overbox, .cp__box p { transition: none; }
  .cu__ptr { animation: none; }
}

@media (max-width: 720px) {
  .ty,
  .cp,
  .cu,
  .op {
    grid-template-columns: minmax(0, 1fr);
  }

  .ty__ladder,
  .cp__bench,
  .cu__lanes,
  .op__words {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .cp__bench {
    grid-template-columns: minmax(0, 1fr);
  }

  .ty__words,
  .cp__words,
  .cu__words,
  .op__words {
    padding: 22px 52px 22px 16px;
  }

  .ty__ladder li {
    grid-template-columns: 44px minmax(0, 1fr);
    padding: 16px;
  }
}
</style>
