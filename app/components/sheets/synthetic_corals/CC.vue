<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, CO, INFO, NODES, PREVIEW, PROMPT, RUNS, SPIN } from './story'

// PROTOTYPE CC "Spectrum" (overnight run, Synthetic Corals r1). Beats, each its own device: the outcome as a bento
// of the runs, the glowing run biggest → each run as a bar of its colours by share, drawn in as it scrolls into
// view → a turntable: 24 frames of the long clip you drag or slide round, beside the short clip → the prompt as
// tagged tokens, one chip a phrase, with the settings under it.
// Refs: Google Arts & Culture's Art Palette and Cooper Hewitt's colour search (works read as colour shares);
// 360° product viewers (Apple, Nike, Sketchfab's turntable); OpenAI's tokenizer page (coloured chips). Videos play
// only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy, the chip colours.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('cc', [
  { id: 'colour', label: 'Colour' },
  { id: 'spin', label: 'Turntable' },
  { id: 'prompt', label: 'The prompt' },
])

// The bento: run 2 big, the rest round it
const BIG = RUNS[1]!
const SMALL = [RUNS[0]!, RUNS[2]!, RUNS[3]!]
const BARS = [...RUNS.map(r => ({ k: `Run ${r.n}`, name: r.name, r })), { k: 'Preview', name: 'Run 5 over a white floor', r: PREVIEW }]

// The turntable: drag across it (or use the slider) to step the frames
const f = ref(0)
let x0 = 0
let f0 = 0
let drag = false
function down(e: PointerEvent) {
  drag = true
  x0 = e.clientX
  f0 = f.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!drag) return
  const w = (e.currentTarget as HTMLElement).offsetWidth
  const n = SPIN.length
  f.value = (((f0 + Math.round((e.clientX - x0) / w * n * 1.5)) % n) + n) % n
}
const up = () => (drag = false)

// The prompt as phrases
const PHRASES = PROMPT.split(', ')
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="cc">
      <SheetHead :title="CO.title" :hook="CO.hook" :info="INFO">
        <template #before>
          <div class="bt">
            <figure class="bt__cell bt__cell--big">
              <img :src="BIG.src" :srcset="BIG.srcset" sizes="(max-width: 720px) 100vw, 620px" :alt="BIG.alt" :width="BIG.w" :height="BIG.h" loading="lazy" decoding="async">
              <figcaption>Run {{ String(BIG.n).padStart(2, '0') }}</figcaption>
            </figure>
            <figure v-for="r in SMALL" :key="r.n" class="bt__cell">
              <img :src="r.src" :srcset="r.srcset" sizes="(max-width: 720px) 50vw, 310px" :alt="r.alt" :width="r.w" :height="r.h" loading="lazy" decoding="async">
              <figcaption>Run {{ String(r.n).padStart(2, '0') }}</figcaption>
            </figure>
            <p class="bt__note">
              {{ CO.runs }}
            </p>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Colour: each run as a bar of colour shares -->
      <section class="cl" v-bind="sec('colour')" data-sheet-block="colour">
        <div class="cl__top">
          <SheetSectionNo id="colour" />
          <p class="cc__text">
            {{ CO.colour }}
          </p>
        </div>
        <ol class="cl__rows">
          <li v-for="b in BARS" :key="b.k" class="cl__row">
            <img :src="b.r.srcset.split(' ')[0]" alt="" width="56" height="56" loading="lazy" decoding="async">
            <p class="cl__k">
              <b>{{ b.k }}</b> {{ b.name }}
            </p>
            <div class="cl__bar" role="img" :aria-label="`${b.k} colours: ${b.r.pal.map(([c, p]) => `${c} ${p}%`).join(', ')}`">
              <span v-for="[c, p] in b.r.pal" :key="c" :style="{ flexGrow: p, background: c }"><i>{{ c }}</i></span>
            </div>
          </li>
        </ol>
      </section>

      <!-- 02 Turntable -->
      <section class="sp" v-bind="sec('spin')" data-sheet-block="spin">
        <div
          class="sp__stage"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
        >
          <img
            v-for="(s, i) in SPIN"
            :key="s"
            :class="{ 'is-on': f === i }"
            :src="s"
            :alt="f === i ? `${CLIPS.turn.alt}, frame ${i + 1} of ${SPIN.length}` : ''"
            :aria-hidden="f !== i"
            width="480"
            height="860"
            loading="lazy"
            decoding="async"
            draggable="false"
          >
          <p class="sp__read" aria-hidden="true">
            {{ String(f + 1).padStart(2, '0') }}<span> / {{ SPIN.length }}</span>
          </p>
        </div>
        <div class="sp__side">
          <div class="sp__top">
            <SheetSectionNo id="spin" />
            <p class="cc__text">
              {{ CO.turn }} {{ CO.spin }}
            </p>
            <label class="sp__range">
              <span class="sp__lab">Frame</span>
              <input v-model.number="f" type="range" min="0" :max="SPIN.length - 1" step="1">
            </label>
          </div>
          <div class="sp__clip">
            <video
              :src="CLIPS.cut.src"
              :poster="CLIPS.cut.poster"
              :width="CLIPS.cut.w"
              :height="CLIPS.cut.h"
              muted
              loop
              playsinline
              preload="none"
              data-play
              :aria-label="`${CLIPS.cut.label} clip: ${CLIPS.cut.alt}`"
            />
          </div>
        </div>
      </section>

      <!-- 03 The prompt as tokens -->
      <section class="tkn" v-bind="sec('prompt')" data-sheet-block="prompt">
        <SheetSectionNo id="prompt" />
        <p class="tkn__chips">
          <span v-for="(p, i) in PHRASES" :key="i" :class="`tkn__c tkn__c--${i % 4}`">{{ p }}</span>
        </p>
        <dl class="tkn__nodes">
          <div v-for="n in NODES" :key="n.k">
            <dt>{{ n.k }}</dt>
            <dd>{{ n.v }}</dd>
          </div>
        </dl>
      </section>

      <SheetCredits :items="CO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.cc__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The bento */
.bt {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: auto auto;
  background: #000;
}

.bt__cell {
  position: relative;
  margin: 0;
  overflow: hidden;
}

.bt__cell--big {
  grid-row: span 2;
}

.bt__cell img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.bt__cell figcaption {
  position: absolute;
  left: 12px;
  top: 10px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.75);
}

.bt__note {
  display: flex;
  align-items: end;
  margin: 0;
  padding: 16px;
  font: 400 14px/1.5 var(--font-ui);
  color: rgb(255 255 255 / 0.7);
  border-left: 1px solid rgb(255 255 255 / 0.1);
}

/* 01 Colour bars */
.cl {
  border-top: 1px solid var(--rule);
}

.cl__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 20px;
}

.cl__rows {
  margin: 0;
  padding: 0 24px 28px;
  list-style: none;
}

.cl__row {
  display: grid;
  grid-template-columns: 56px minmax(0, 200px) minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid var(--rule);
}

.cl__row img {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  background: #000;
}

.cl__k {
  margin: 0;
  font: 400 13px/1.35 var(--font-ui);
  color: var(--muted);
}

.cl__k b {
  display: block;
  font-weight: 600;
  color: var(--c-fg);
}

.cl__bar {
  display: flex;
  height: 56px;
  overflow: hidden;
  transform-origin: left;
  animation: cl-grow linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 100%;
}

@keyframes cl-grow {
  from { scale: 0 1; }
}

.cl__bar span {
  display: flex;
  align-items: end;
  min-width: 0;
  padding: 6px;
}

.cl__bar i {
  overflow: hidden;
  font: 400 10.5px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  font-style: normal;
  color: rgb(255 255 255 / 0.85);
  mix-blend-mode: difference;
  white-space: nowrap;
}

/* 02 Turntable */
.sp {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  border-top: 1px solid var(--rule);
}

.sp__stage {
  position: relative;
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background: #fff;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.sp__stage:active {
  cursor: grabbing;
}

.sp__stage img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  visibility: hidden;
}

.sp__stage img.is-on {
  visibility: visible;
}

.sp__read {
  position: absolute;
  left: 20px;
  bottom: 16px;
  margin: 0;
  font: 500 clamp(36px, 4.4vw, 64px)/1 var(--font-ui);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
  color: #111;
}

.sp__read span {
  font-size: 0.4em;
  letter-spacing: 0;
  color: rgb(0 0 0 / 0.45);
}

.sp__side {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-left: 1px solid var(--rule);
}

.sp__top {
  display: grid;
  gap: 16px;
  padding: 28px 24px;
}

.sp__range {
  display: grid;
  gap: 8px;
}

.sp__lab {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sp__range input {
  width: 100%;
  accent-color: #e03a2f;
}

.sp__clip {
  overflow: hidden;
  border-top: 1px solid var(--rule);
  background: #fff;
}

.sp__clip video {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
}

/* 03 Tokens */
.tkn {
  display: grid;
  gap: 24px;
  padding: 28px 24px 32px;
  border-top: 1px solid var(--rule);
}

.tkn__chips {
  margin: 0;
  font: 400 clamp(18px, 2vw, 24px)/1.9 ui-monospace, 'SF Mono', Menlo, monospace;
  overflow-wrap: anywhere;
}

.tkn__c {
  padding: 3px 6px;
  margin-right: 6px;
  border-radius: 4px;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.tkn__c--0 { background: rgb(57 106 199 / 0.32); }
.tkn__c--1 { background: rgb(180 206 80 / 0.28); }
.tkn__c--2 { background: rgb(161 28 30 / 0.34); }
.tkn__c--3 { background: rgb(188 191 188 / 0.24); }

.tkn__nodes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0 24px;
  margin: 0;
}

.tkn__nodes div {
  padding: 10px 0;
  border-top: 1px solid var(--rule);
}

.tkn__nodes dt {
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tkn__nodes dd {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  font: 400 13px/1.45 ui-monospace, 'SF Mono', Menlo, monospace;
}

@media (prefers-reduced-motion: reduce) {
  .cl__bar { animation: none; }
}

@media (max-width: 720px) {
  .bt {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .bt__cell--big {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .bt__note {
    border-left: 0;
  }

  .cl__top,
  .sp__top {
    padding: 22px 52px 18px 16px;
  }

  .cl__rows {
    padding: 0 16px 22px;
  }

  .cl__row {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 8px 12px;
  }

  .cl__row img {
    width: 44px;
    height: 44px;
  }

  .cl__bar {
    grid-column: 1 / -1;
    height: 40px;
  }

  .cl__bar i {
    display: none;
  }

  .sp {
    grid-template-columns: minmax(0, 1fr);
  }

  .sp__side {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .sp__clip {
    display: none;
  }

  .tkn {
    padding: 22px 16px 26px;
  }
}
</style>
