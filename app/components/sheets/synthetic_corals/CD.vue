<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, CO, INFO, NODES, PREVIEW, PROMPT, RUNS, SPIN } from './story'

// PROTOTYPE CD "Plate, refined" (overnight run, Synthetic Corals r2): CA with the r1 judges' fixes. The plate's
// centre is now the preview still (the hero already shows the clip), the plate square-centred (1fr 2fr 1fr); node
// wires and ports white at 40%, only the hovered node's wire race red; FIG labels on solid black chips; Turning shows
// the 5 s clip once, top-aligned with its heading, beside six frames of the 10 s clip. Copy cut to facts.
// From CA: the outcome as a natural-history plate, the four runs round the preview on one black ground, numbered figures keyed to a
// legend where run 3 stays an empty line (point at a figure or a line to pair them) → the settings as a node canvas,
// each setting a node wired to the next → the long clip on white with museum label cards.
// Refs: Ernst Haeckel's Kunstformen der Natur plates (figure numbers, a legend under the plate); the Natural History
// Museum's specimen labels; ComfyUI's own canvas (dot grid, titled nodes, wires). Videos play only in view, once
// the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy, the node order (as listed, not the real graph).
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('cd', [
  { id: 'nodes', label: 'The pipeline' },
  { id: 'turn', label: 'Turning' },
])

// Legend lines 1–5; run 3 has no figure
const LEGEND = [1, 2, 3, 4, 5].map(n => ({ n, run: RUNS.find(r => r.n === n) }))
const on = ref<number | null>(null)
const [left, right] = [RUNS.slice(0, 2), RUNS.slice(2)]
// PLACEHOLDER copy (not approved by Will), checked with no-ai-slop
const T = { runs: 'Five runs, one pipeline. Run 3 not shown.', missing: 'Not shown', turn: 'One coral, turning.' }
// Six of the 24 frames of the 10 s clip, evenly spaced (frame i sits at i × 10/24 s)
const FRAMES = [0, 4, 8, 12, 16, 20].map(i => ({ src: SPIN[i]!, t: (i * 10 / 24).toFixed(1) }))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ca">
      <SheetHead :title="CO.title" :hook="CO.hook" :info="INFO">
        <template #before>
          <div class="pl">
            <div class="pl__plate">
              <div v-for="(col, c) in [left, right]" :key="c" class="pl__col" :class="`pl__col--${c}`">
                <figure
                  v-for="r in col"
                  :key="r.n"
                  class="pl__fig"
                  :class="{ 'is-on': on === r.n, 'is-off': on !== null && on !== r.n }"
                  tabindex="0"
                  @pointerenter="on = r.n"
                  @pointerleave="on = null"
                  @focus="on = r.n"
                  @blur="on = null"
                >
                  <img :src="r.src" :srcset="r.srcset" sizes="(max-width: 720px) 50vw, 340px" :alt="r.alt" :width="r.w" :height="r.h" loading="lazy" decoding="async">
                  <figcaption>Fig. {{ r.n }}</figcaption>
                </figure>
              </div>
              <figure class="pl__mid">
                <img :src="PREVIEW.src" :srcset="PREVIEW.srcset" sizes="(max-width: 720px) 100vw, 520px" :alt="PREVIEW.alt" :width="PREVIEW.w" :height="PREVIEW.h" loading="lazy" decoding="async">
                <figcaption>Preview</figcaption>
              </figure>
            </div>
            <div class="pl__foot">
              <p class="pl__runs">
                {{ T.runs }}
              </p>
              <ol class="pl__legend">
                <li
                  v-for="l in LEGEND"
                  :key="l.n"
                  :class="{ 'is-on': on === l.n, 'is-gap': !l.run }"
                  @pointerenter="l.run && (on = l.n)"
                  @pointerleave="on = null"
                >
                  <b>{{ l.n }}</b> {{ l.run ? l.run.name : T.missing }}
                </li>
              </ol>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The pipeline: a node canvas -->
      <section class="nd" v-bind="sec('nodes')" data-sheet-block="nodes">
        <div class="nd__top">
          <SheetSectionNo id="nodes" />
        </div>
        <div class="nd__canvas">
          <div class="nd__node nd__node--prompt">
            <p class="nd__k">
              Prompt
            </p>
            <p class="nd__v nd__v--prompt">
              {{ PROMPT }}
            </p>
          </div>
          <ol class="nd__chain">
            <li v-for="n in NODES" :key="n.k" class="nd__node">
              <p class="nd__k">
                {{ n.k }}
              </p>
              <p class="nd__v">
                {{ n.v }}
              </p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 02 Turning: the long clip on white, with label cards -->
      <section class="tn" v-bind="sec('turn')" data-sheet-block="turn">
        <div class="tn__clip">
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
          <p class="tn__label">
            <b>Clip</b> {{ CLIPS.cut.label }} · {{ CLIPS.cut.w }} × {{ CLIPS.cut.h }}
          </p>
        </div>
        <div class="tn__side">
          <div class="tn__top">
            <SheetSectionNo id="turn" />
            <p class="ca__text">
              {{ T.turn }}
            </p>
          </div>
          <div class="tn__frames">
            <ol aria-label="Six frames of the 10 s clip">
              <li v-for="f in FRAMES" :key="f.t">
                <img :src="f.src" alt="" width="480" height="860" loading="lazy" decoding="async">
                <span>{{ f.t }} s</span>
              </li>
            </ol>
            <p class="tn__label">
              <b>Frames</b> {{ CLIPS.turn.label }} clip · {{ CLIPS.turn.w }} × {{ CLIPS.turn.h }}
            </p>
          </div>
        </div>
      </section>

      <SheetCredits :items="CO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ca__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The plate: one black ground, runs left and right of the clip */
.pl {
  background: #000;
  color: #e9ecef;
}

.pl__plate {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
}

.pl__col {
  display: grid;
  grid-template-rows: 1fr 1fr;
}

.pl__col--1 {
  grid-column: 3;
  grid-row: 1;
}

.pl__mid {
  grid-column: 2;
  grid-row: 1;
}

.pl__mid {
  position: relative;
  margin: 0;
}

.pl__mid img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pl__fig {
  position: relative;
  margin: 0;
  overflow: hidden;
  outline: none;
  transition: opacity 220ms ease-out;
}

.pl__fig img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: scale 400ms cubic-bezier(0.23, 1, 0.32, 1);
}

.pl__fig.is-on img {
  scale: 1.04;
}

.pl__fig.is-off {
  opacity: 0.35;
}

.pl__fig:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.pl__fig figcaption,
.pl__mid figcaption {
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 6px 10px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: #000;
}

.pl__foot {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 16px 32px;
  padding: 20px 24px 24px;
  border-top: 1px solid rgb(255 255 255 / 0.1);
}

.pl__runs {
  margin: 0;
  max-width: 34ch;
  font: 400 14px/1.5 var(--font-ui);
  color: rgb(255 255 255 / 0.7);
}

.pl__legend {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pl__legend li {
  padding-top: 8px;
  border-top: 1px solid rgb(255 255 255 / 0.25);
  font: 400 13px/1.35 var(--font-ui);
  color: rgb(255 255 255 / 0.75);
  transition: color 160ms ease-out, border-color 160ms ease-out;
}

.pl__legend b {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.pl__legend li.is-on {
  color: #fff;
  border-top-color: #fff;
}

.pl__legend li.is-gap {
  color: rgb(255 255 255 / 0.4);
  border-top-style: dashed;
}

/* 01 The node canvas */
.nd {
  border-top: 1px solid var(--rule);
}

.nd__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 20px;
}

.nd__canvas {
  display: grid;
  gap: 28px;
  padding: 28px 24px 32px;
  background-color: #121315;
  background-image: radial-gradient(rgb(255 255 255 / 0.12) 1px, transparent 1.2px);
  background-size: 18px 18px;
  color: #e9ecef;
}

.nd__chain {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px 40px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nd__node {
  position: relative;
  min-width: 0;
  background: #1d1f22;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 8px;
}

/* The wire into each node from the one before it */
.nd__chain .nd__node + .nd__node::before {
  content: '';
  position: absolute;
  top: 17px;
  left: -41px;
  width: 40px;
  height: 2px;
  background: rgb(255 255 255 / 0.4);
  transition: background-color 160ms ease-out;
}

.nd__chain .nd__node:nth-child(4n + 1)::before {
  display: none;
}

.nd__node::after {
  content: '';
  position: absolute;
  top: 13px;
  right: -5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.4);
  transition: background-color 160ms ease-out;
}

/* Only the hovered node's wire and port race red */
.nd__node:hover::before,
.nd__node:hover::after {
  background: var(--c-accent);
}

.nd__k {
  margin: 0;
  padding: 9px 12px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  font: 600 12px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  color: #fff;
}

.nd__v {
  margin: 0;
  padding: 10px 12px 12px;
  overflow-wrap: anywhere;
  font: 400 12.5px/1.5 ui-monospace, 'SF Mono', Menlo, monospace;
  color: rgb(255 255 255 / 0.75);
}

.nd__v--prompt {
  font-size: 14px;
  color: #fff;
}

/* 02 Turning */
.tn {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: start;
  border-top: 1px solid var(--rule);
  background: #fff;
  color: #111;
}

.tn__clip {
  position: relative;
}

.tn__clip video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1072 / 1920;
  object-fit: cover;
}

.tn__side {
  display: grid;
  align-content: start;
  border-left: 1px solid rgb(0 0 0 / 0.1);
}

.tn__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px;
  --c-fg: #111;
  --muted: rgb(0 0 0 / 0.65);
}

.tn__clip {
  align-self: start;
}

.tn__frames {
  position: relative;
  padding: 0 24px 76px;
}

.tn__frames ol {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: rgb(0 0 0 / 0.1);
}

.tn__frames li {
  position: relative;
  background: #fff;
}

.tn__frames img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 480 / 860;
  object-fit: cover;
}

.tn__frames span {
  position: absolute;
  top: 8px;
  left: 8px;
  font: 400 11px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: rgb(0 0 0 / 0.6);
}

.tn__frames .tn__label {
  left: 24px;
  bottom: 20px;
}

.tn__label {
  position: absolute;
  left: 16px;
  bottom: 16px;
  margin: 0;
  padding: 8px 10px;
  font: 400 12px/1.3 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #111;
  background: #f4f1ea;
  border: 1px solid rgb(0 0 0 / 0.25);
}

.tn__label b {
  margin-right: 6px;
  font-family: var(--font-ui);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

@media (prefers-reduced-motion: reduce) {
  .pl__fig, .pl__fig img, .pl__legend li, .nd__node::before, .nd__node::after { transition: none; }
}

@media (max-width: 720px) {
  .pl__plate {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .pl__mid {
    grid-column: 1 / -1;
    grid-row: auto;
  }

  .pl__mid img {
    aspect-ratio: 1;
    height: auto;
  }

  .pl__col,
  .pl__col--1 {
    grid-column: auto;
    grid-row: auto;
  }

  .pl__fig img {
    aspect-ratio: 1;
    height: auto;
  }

  .pl__foot {
    grid-template-columns: minmax(0, 1fr);
    padding: 18px 16px 20px;
  }

  .pl__legend {
    grid-template-columns: minmax(0, 1fr);
  }

  .pl__legend li {
    display: flex;
    gap: 10px;
    padding: 6px 0;
  }

  .pl__legend b {
    margin: 0;
  }

  .nd__top,
  .tn__top {
    padding: 22px 52px 18px 16px;
  }

  .nd__canvas {
    padding: 20px 16px 24px;
  }

  .nd__chain {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .nd__chain .nd__node + .nd__node::before,
  .nd__chain .nd__node:nth-child(4n + 1)::before {
    display: block;
    top: -25px;
    left: 24px;
    width: 2px;
    height: 24px;
  }

  .nd__node::after {
    display: none;
  }

  .tn {
    grid-template-columns: minmax(0, 1fr);
  }

  .tn__side {
    order: -1;
    border-left: 0;
  }

  .tn__clip video {
    aspect-ratio: 4 / 5;
  }

  .tn__frames {
    padding: 0 16px 68px;
  }

  .tn__frames .tn__label {
    left: 16px;
  }
}
</style>
