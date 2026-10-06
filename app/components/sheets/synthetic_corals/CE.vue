<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, CO, INFO, NODES, PREVIEW, PROMPT, RUNS } from './story'

// PROTOTYPE CE "Latent map" (overnight run, Synthetic Corals r2). Beats, each its own device: the outcome as a map,
// the four runs plotted on two axes taken from the sources (bleached → glowing, rock → polyp) with a big readout of
// the run you point at, run 3 a dashed line in the readout's list → the prompt as the caption of the preview still,
// the settings as an EXIF bar under it → the 5 s clip alone on a white band.
// Refs: Google Arts & Culture's t-SNE Map experiment and TensorFlow's Embedding Projector (images placed in a field,
// one enlarged on hover); Flickr's photo page EXIF panel. Videos play only in view, once the Sheet is open.
// PLACEHOLDER: the positions on the map are placed by eye from the run names, not measured; copy, sizes.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('ce', [
  { id: 'prompt', label: 'Prompt' },
  { id: 'turn', label: 'Turning' },
])

// PLACEHOLDER copy (not approved by Will), checked with no-ai-slop
const T = {
  map: 'Four runs, one pipeline. Placed by eye.',
  missing: 'Not shown',
  turn: 'One coral, turning.',
}
// x: bleached (0) → glowing (100); y: polyp (0, top) → rock (100). By eye, from the run names (PLACEHOLDER)
const POS: Record<number, [number, number]> = { 1: [22, 26], 2: [80, 38], 4: [54, 18], 5: [62, 76] }
const LIST = [1, 2, 3, 4, 5].map(n => ({ n, run: RUNS.find(r => r.n === n) }))
const on = ref(2)
const active = computed(() => RUNS.find(r => r.n === on.value)!)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ce">
      <SheetHead :title="CO.title" :hook="CO.hook" :info="INFO">
        <template #before>
          <div class="lm">
            <div class="lm__map" role="group" aria-label="The four runs, placed by look">
              <span class="lm__ax lm__ax--x" aria-hidden="true" />
              <span class="lm__ax lm__ax--y" aria-hidden="true" />
              <span class="lm__lab lm__lab--l">Bleached</span>
              <span class="lm__lab lm__lab--r">Glowing</span>
              <span class="lm__lab lm__lab--t">Polyp</span>
              <span class="lm__lab lm__lab--b">Rock</span>
              <button
                v-for="r in RUNS"
                :key="r.n"
                type="button"
                class="lm__pt"
                :class="{ 'is-on': on === r.n }"
                :style="{ left: `${POS[r.n]![0]}%`, top: `${POS[r.n]![1]}%` }"
                :aria-pressed="on === r.n"
                :aria-label="`Run ${r.n}: ${r.name}`"
                @pointerenter="on = r.n"
                @focus="on = r.n"
                @click="on = r.n"
              >
                <img :src="r.src" :srcset="r.srcset" sizes="160px" alt="" :width="r.w" :height="r.h" loading="lazy" decoding="async">
                <span>{{ r.n }}</span>
              </button>
            </div>
            <div class="lm__read">
              <div class="lm__big">
                <img
                  v-for="r in RUNS"
                  :key="r.n"
                  :src="r.src"
                  :srcset="r.srcset"
                  sizes="(max-width: 720px) 100vw, 520px"
                  :alt="r.alt"
                  :width="r.w"
                  :height="r.h"
                  :class="{ 'is-on': on === r.n }"
                  :aria-hidden="on !== r.n"
                  loading="lazy"
                  decoding="async"
                >
              </div>
              <p class="lm__now" aria-live="polite">
                <b>{{ active.n }}</b> {{ active.name }}
              </p>
              <ol class="lm__list">
                <li v-for="l in LIST" :key="l.n" :class="{ 'is-on': on === l.n, 'is-gap': !l.run }">
                  <b>{{ l.n }}</b> {{ l.run ? l.run.name : T.missing }}
                </li>
              </ol>
              <p class="lm__note">
                {{ T.map }}
              </p>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Prompt: the preview still captioned by the prompt, the settings as an EXIF bar -->
      <section class="ex" v-bind="sec('prompt')" data-sheet-block="prompt">
        <figure class="ex__photo">
          <img :src="PREVIEW.src" :srcset="PREVIEW.srcset" sizes="(max-width: 720px) 100vw, 560px" :alt="PREVIEW.alt" :width="PREVIEW.w" :height="PREVIEW.h" loading="lazy" decoding="async">
        </figure>
        <div class="ex__cap">
          <SheetSectionNo id="prompt" />
          <p class="ex__prompt">
            {{ PROMPT }}
          </p>
        </div>
        <dl class="ex__bar">
          <div v-for="n in NODES" :key="n.k">
            <dt>{{ n.k }}</dt>
            <dd>{{ n.v }}</dd>
          </div>
        </dl>
      </section>

      <!-- 02 Turning: the 5 s clip alone on white -->
      <section class="bd" v-bind="sec('turn')" data-sheet-block="turn">
        <div class="bd__top">
          <SheetSectionNo id="turn" />
          <p class="ce__text">
            {{ T.turn }}
          </p>
        </div>
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
        <p class="bd__meta">
          {{ CLIPS.cut.label }} · {{ CLIPS.cut.w }} × {{ CLIPS.cut.h }}
        </p>
      </section>

      <SheetCredits :items="CO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ce__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The map and its readout, on one black ground */
.lm {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  background: #000;
  color: #e9ecef;
}

.lm__map {
  position: relative;
  aspect-ratio: 1;
  background-color: #070708;
  background-image: radial-gradient(rgb(255 255 255 / 0.14) 1px, transparent 1.2px);
  background-size: 24px 24px;
  border-right: 1px solid rgb(255 255 255 / 0.1);
  overflow: hidden;
}

.lm__ax {
  position: absolute;
  background: rgb(255 255 255 / 0.25);
}

.lm__ax--x {
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
}

.lm__ax--y {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
}

.lm__lab {
  position: absolute;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.6);
}

.lm__lab--l { left: 14px; top: calc(50% + 10px); }
.lm__lab--r { right: 14px; top: calc(50% + 10px); }
.lm__lab--t { left: calc(50% + 10px); top: 14px; }
.lm__lab--b { left: calc(50% + 10px); bottom: 14px; }

.lm__pt {
  position: absolute;
  width: 24%;
  aspect-ratio: 1;
  padding: 0;
  translate: -50% -50%;
  border: 1px solid rgb(255 255 255 / 0.25);
  background: #000;
  cursor: pointer;
  transition: border-color 160ms ease-out, scale 300ms cubic-bezier(0.23, 1, 0.32, 1);
}

.lm__pt img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lm__pt span {
  position: absolute;
  left: 0;
  top: 0;
  padding: 4px 7px;
  font: 600 11px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: #fff;
  background: #000;
}

.lm__pt.is-on {
  z-index: 1;
  border-color: #fff;
  scale: 1.06;
}

.lm__pt.is-on span {
  background: var(--c-accent);
}

.lm__pt:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.lm__read {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  min-width: 0;
}

.lm__big {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  overflow: hidden;
  aspect-ratio: 5 / 4;
  background: #000;
}

.lm__big img {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 240ms ease-out;
}

.lm__big img.is-on {
  opacity: 1;
}

.lm__now {
  margin: 0;
  padding: 14px 20px 0;
  font: 500 20px/1.2 var(--font-ui);
  color: #fff;
}

.lm__now b {
  margin-right: 8px;
  color: var(--c-accent);
  font-variant-numeric: tabular-nums;
}

.lm__list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0 10px;
  margin: 0;
  padding: 14px 20px 0;
  list-style: none;
}

.lm__list li {
  padding-top: 6px;
  border-top: 1px solid rgb(255 255 255 / 0.25);
  font: 400 12px/1.3 var(--font-ui);
  color: rgb(255 255 255 / 0.6);
}

.lm__list b {
  display: block;
  margin-bottom: 3px;
  font-weight: 600;
}

.lm__list li.is-on {
  color: #fff;
  border-top-color: var(--c-accent);
}

.lm__list li.is-gap {
  color: rgb(255 255 255 / 0.4);
  border-top-style: dashed;
}

.lm__note {
  margin: 0;
  padding: 14px 20px 20px;
  font: 400 13px/1.5 var(--font-ui);
  color: rgb(255 255 255 / 0.6);
}

/* 01 Prompt: photo, caption, EXIF bar */
.ex {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.ex__photo {
  margin: 0;
}

.ex__photo img {
  display: block;
  width: 100%;
  height: auto;
}

.ex__cap {
  display: grid;
  align-content: start;
  gap: 20px;
  padding: 28px 24px;
  border-left: 1px solid var(--rule);
}

.ex__prompt {
  margin: 0;
  font: 400 clamp(20px, 2.1vw, 28px)/1.35 var(--font-ui);
  color: var(--c-fg, #fff);
  overflow-wrap: anywhere;
}

.ex__prompt::before { content: '“'; }
.ex__prompt::after { content: '”'; }

.ex__bar {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
  background: #0b0b0c;
}

.ex__bar div {
  min-width: 0;
  padding: 12px 16px 14px;
  border-right: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.ex__bar dt {
  margin-bottom: 6px;
  overflow-wrap: anywhere;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ex__bar dd {
  margin: 0;
  overflow-wrap: anywhere;
  font: 400 12.5px/1.45 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #e9ecef;
}

/* 02 The clip alone on white */
.bd {
  display: grid;
  justify-items: center;
  gap: 20px;
  padding: 0 24px 28px;
  border-top: 1px solid var(--rule);
  background: #fff;
  color: #111;
}

.bd__top {
  justify-self: stretch;
  display: grid;
  gap: 12px;
  padding-top: 28px;
  --c-fg: #111;
  --muted: rgb(0 0 0 / 0.65);
}

.bd video {
  display: block;
  width: min(100%, 420px);
  height: auto;
  aspect-ratio: 720 / 1280;
  object-fit: cover;
}

.bd__meta {
  margin: 0;
  font: 400 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: rgb(0 0 0 / 0.6);
}

@media (prefers-reduced-motion: reduce) {
  .lm__pt, .lm__big img { transition: none; }
}

@media (max-width: 720px) {
  .lm {
    grid-template-columns: minmax(0, 1fr);
  }

  .lm__map {
    border-right: 0;
  }

  .lm__big {
    aspect-ratio: 1;
  }

  .lm__now,
  .lm__list,
  .lm__note {
    padding-left: 16px;
    padding-right: 16px;
  }

  .lm__list {
    grid-template-columns: minmax(0, 1fr);
  }

  .lm__list li {
    display: flex;
    gap: 10px;
    padding: 6px 0;
  }

  .lm__list b {
    margin: 0;
  }

  .ex {
    grid-template-columns: minmax(0, 1fr);
  }

  .ex__cap {
    order: -1;
    padding: 22px 52px 22px 16px;
    border-left: 0;
  }

  .ex__bar {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .bd {
    padding: 0 16px 22px;
  }

  .bd__top {
    padding: 22px 36px 0 0;
  }
}
</style>
