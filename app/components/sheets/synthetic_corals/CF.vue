<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, CO, INFO, NODES, PROMPT, RUNS } from './story'

// PROTOTYPE CF "Lots" (overnight run, Synthetic Corals r2). Beats, each its own device: the outcome as a sale index,
// the five runs as numbered lots in a row with lot 3 struck → the lots as an auction catalogue: a sticky viewer on
// the left shows the lot being read on the right (phones: each lot carries its own image) → the prompt as the
// catalogue note, the settings as a ruled "further details" table, the 5 s clip as a detail.
// Refs: Christie's and Phillips online lot pages (lot numbers, a big image held while the details scroll, "further
// details"), Sotheby's catalogue notes. Videos play only in view, once the Sheet is open (useOpenPlay).
// PLACEHOLDER: copy, sizes; "May 2026" is the file date on Will's PC.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('cf', [
  { id: 'lots', label: 'Lots' },
  { id: 'note', label: 'Note' },
])

// PLACEHOLDER copy (not approved by Will), checked with no-ai-slop
const T = { missing: 'Not shown', made: 'May 2026', medium: 'ComfyUI, Flux.1 Dev' }
const pad = (n: number) => String(n).padStart(2, '0')
const LOTS = [1, 2, 3, 4, 5].map(n => ({ n, run: RUNS.find(r => r.n === n) }))

// The lot being read picks the viewer's image (desktop): the entry crossing the layer's middle wins
const on = ref(1)
const lotEls = ref<HTMLElement[]>([])
let io: IntersectionObserver | undefined
onMounted(() => {
  const layer = root.value?.closest('[data-sheet-layer]') ?? null
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) on.value = Number((e.target as HTMLElement).dataset.n)
  }, { root: layer, rootMargin: '-45% 0px -45% 0px' })
  lotEls.value.forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="cf">
      <SheetHead :title="CO.title" :hook="CO.hook" :info="INFO">
        <template #before>
          <ol class="ix" aria-label="Five runs">
            <li v-for="l in LOTS" :key="l.n" :class="{ 'is-gap': !l.run }">
              <img v-if="l.run" :src="l.run.src" :srcset="l.run.srcset" sizes="(max-width: 720px) 50vw, 220px" :alt="l.run.alt" :width="l.run.w" :height="l.run.h" loading="lazy" decoding="async">
              <p class="ix__cap">
                <b>{{ pad(l.n) }}</b> <span>{{ l.run ? l.run.name : T.missing }}</span>
              </p>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 Lots: a sticky viewer beside the lot entries -->
      <section class="lt" v-bind="sec('lots')" data-sheet-block="lots">
        <div class="lt__rail">
          <div class="lt__view">
            <div class="lt__img">
              <img
                v-for="r in RUNS"
                :key="r.n"
                :src="r.src"
                :srcset="r.srcset"
                sizes="560px"
                alt=""
                :width="r.w"
                :height="r.h"
                :class="{ 'is-on': on === r.n }"
                loading="lazy"
                decoding="async"
              >
            </div>
            <p class="lt__count" aria-hidden="true">
              Lot <b>{{ pad(on) }}</b> / 05
            </p>
          </div>
        </div>
        <div class="lt__list">
          <div class="lt__top">
            <SheetSectionNo id="lots" />
          </div>
          <ol>
            <li
              v-for="l in LOTS"
              :key="l.n"
              ref="lotEls"
              :data-n="l.n"
              class="lt__lot"
              :class="{ 'is-gap': !l.run, 'is-on': on === l.n }"
            >
              <p class="lt__no">
                <s v-if="!l.run">Lot {{ pad(l.n) }}</s>
                <template v-else>
                  Lot {{ pad(l.n) }}
                </template>
              </p>
              <template v-if="l.run">
                <img class="lt__inline" :src="l.run.src" :srcset="l.run.srcset" sizes="100vw" :alt="l.run.alt" :width="l.run.w" :height="l.run.h" loading="lazy" decoding="async">
                <h4 class="lt__name">
                  {{ l.run.name }}
                </h4>
                <dl class="lt__dl">
                  <div><dt>Run</dt><dd>{{ l.n }} of 5</dd></div>
                  <div><dt>Medium</dt><dd>{{ T.medium }}</dd></div>
                  <div><dt>Size</dt><dd>{{ l.run.w }} × {{ l.run.h }} px</dd></div>
                  <div><dt>Made</dt><dd>{{ T.made }}</dd></div>
                </dl>
              </template>
              <p v-else class="lt__gap">
                {{ T.missing }}
              </p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 02 Note: the prompt as the catalogue note, the settings ruled, the clip as a detail -->
      <section class="nt" v-bind="sec('note')" data-sheet-block="note">
        <div class="nt__text">
          <SheetSectionNo id="note" />
          <p class="nt__prompt">
            {{ PROMPT }}
          </p>
          <table class="nt__tab">
            <caption>Further details</caption>
            <tbody>
              <tr v-for="n in NODES" :key="n.k">
                <th scope="row">
                  {{ n.k }}
                </th>
                <td>{{ n.v }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <figure class="nt__detail">
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
          <figcaption>Detail · {{ CLIPS.cut.label }} clip</figcaption>
        </figure>
      </section>

      <SheetCredits :items="CO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
/* The sale index: five lots in a row */
.ix {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #000;
}

.ix li {
  display: grid;
  grid-template-rows: auto 1fr;
  min-width: 0;
  border-right: 1px solid rgb(255 255 255 / 0.1);
}

.ix li:last-child {
  border-right: 0;
}

.ix img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}

.ix li.is-gap {
  grid-template-rows: 1fr auto;
  background: repeating-linear-gradient(135deg, transparent 0 10px, rgb(255 255 255 / 0.05) 10px 11px);
  border: 1px dashed rgb(255 255 255 / 0.3);
}

.ix__cap {
  margin: 0;
  padding: 10px 12px 14px;
  font: 400 13px/1.35 var(--font-ui);
  color: rgb(255 255 255 / 0.75);
}

.ix__cap b {
  display: block;
  margin-bottom: 3px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.ix li.is-gap .ix__cap {
  color: rgb(255 255 255 / 0.45);
}

.ix li.is-gap .ix__cap b {
  color: rgb(255 255 255 / 0.45);
  text-decoration: line-through;
}

/* 01 Lots. Off-screen sections skip layout and paint during the open (content-visibility) */
.lt,
.nt {
  content-visibility: auto;
  contain-intrinsic-size: auto 1400px;
}

.lt {
  display: grid;
  grid-template-columns: minmax(0, 11fr) minmax(0, 9fr);
  border-top: 1px solid var(--rule);
}

.lt__rail {
  border-right: 1px solid var(--rule);
}

.lt__view {
  position: sticky;
  top: -16px; /* the layer's padding: pins it just under the header, as T2b and DB */
}

.lt__img {
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  overflow: hidden;
  aspect-ratio: 1;
  background: #000;
}

.lt__img img {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 300ms ease-out;
}

.lt__img img.is-on {
  opacity: 1;
}

.lt__count {
  margin: 0;
  padding: 12px 24px 14px;
  font: 400 13px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.lt__count b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.lt__top {
  padding: 28px 24px 8px;
}

.lt__list ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lt__lot {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 52vh;
  padding: 28px 24px 32px;
  border-top: 1px solid var(--rule);
  transition: opacity 200ms ease-out;
}

.lt__lot:not(.is-on) {
  opacity: 0.45;
}

.lt__lot.is-gap {
  min-height: 0;
  opacity: 1;
}

.lt__no {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.lt__lot.is-gap .lt__no {
  color: var(--muted);
}

.lt__name {
  margin: 0;
  font: 500 clamp(26px, 2.6vw, 38px)/1.1 var(--font-ui);
  color: var(--c-fg, #fff);
}

.lt__inline {
  display: none;
}

.lt__dl {
  display: grid;
  margin: 0;
}

.lt__dl div {
  display: grid;
  grid-template-columns: 9ch minmax(0, 1fr);
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid var(--rule);
}

.lt__dl dt {
  font: 400 12px/1.5 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.lt__dl dd {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--c-fg, #fff);
}

.lt__gap {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

/* 02 Note */
.nt {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}

.nt__text {
  display: grid;
  align-content: start;
  gap: 24px;
  padding: 28px 24px 32px;
}

.nt__prompt {
  margin: 0;
  max-width: 34ch;
  font: 400 clamp(22px, 2.3vw, 32px)/1.3 var(--font-ui);
  color: var(--c-fg, #fff);
  overflow-wrap: anywhere;
}

.nt__tab {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.nt__tab caption {
  padding-bottom: 10px;
  text-align: left;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.nt__tab th,
.nt__tab td {
  padding: 9px 0;
  border-top: 1px solid var(--rule);
  vertical-align: top;
  text-align: left;
}

.nt__tab th {
  width: 30%;
  padding-right: 16px;
  overflow-wrap: anywhere;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

.nt__tab td {
  overflow-wrap: anywhere;
  font: 400 12.5px/1.5 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-fg, #fff);
}

.nt__detail {
  margin: 0;
  border-left: 1px solid var(--rule);
  background: #fff;
}

.nt__detail video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 720 / 1280;
  object-fit: cover;
}

.nt__detail figcaption {
  padding: 10px 16px 14px;
  font: 400 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: rgb(0 0 0 / 0.65);
}

@media (prefers-reduced-motion: reduce) {
  .lt__img img, .lt__lot { transition: none; }
}

@media (max-width: 720px) {
  .ix {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .ix li {
    border-right: 0;
  }

  .ix li.is-gap {
    grid-column: 1 / -1;
    grid-row: 3;
  }

  .lt {
    grid-template-columns: minmax(0, 1fr);
  }

  .lt__rail {
    display: none;
  }

  .lt__top {
    padding: 22px 52px 4px 16px;
  }

  .lt__lot {
    min-height: 0;
    padding: 22px 16px 26px;
  }

  .lt__lot:not(.is-on) {
    opacity: 1;
  }

  .lt__inline {
    display: block;
    width: 100%;
    height: auto;
  }

  .nt {
    grid-template-columns: minmax(0, 1fr);
  }

  .nt__text {
    padding: 22px 16px 26px;
  }

  .nt__detail {
    border-left: 0;
  }
}
</style>
