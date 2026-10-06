<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO, SO2 } from './story'

// PROTOTYPE SE "One frame" (overnight run, Smuggler's Outpost r2 challenger).
// Refs: Apple's scroll-scrubbed product pages (one pinned frame that changes as you scroll); Figure Film and Archi
// Malin (Awwwards Creative Pass, scroll-driven video stages); Rejouice for the quiet type around it.
// Beats, each its own device: a type-only spec sheet → one pinned frame that morphs from prompt grid to concept to
// measurements to solid, wireframe, dust and the render, with a stage rail and a caption whose red "Snag" line holds
// the problem met at that stage → the prompt as a pull quote, the first idea struck through → the four shots as one
// big frame and a row of three, with the slate. PLACEHOLDER: every size, the stage order, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const stages = [
  { k: 'Prompt', v: 'Prompts tried across three base models and six checkpoints. Wording mattered most.', m: SO2.pages.generations, fit: 'contain' },
  { k: 'Concept', v: 'One of four became the base. It was missing a landing pad and deeper dunes.', s: 'Inpainting them in looked disconnected.', m: SO2.concept },
  { k: 'Measure', v: 'Measurements taken over the concept in Photoshop.', s: 'Object scaling.', m: SO2.pages.measure, fit: 'contain' },
  { k: 'Solid', v: 'Terrain from displacement and colour ramps. Cliffs sculpted, twice.', m: SO2.solid },
  { k: 'Wireframe', v: 'The building: arch, windows, roof.', s: 'The arch failed first. Inset plus bevel worked.', m: SO2.wire },
  { k: 'Air', v: 'An HDRI, a procedural sandstorm, volumetric dust.', s: 'Good desert HDRIs were hard to find.', m: SO2.pages.dust, fit: 'contain' },
  { k: 'Render', v: 'Depth of field, to hide modelling flaws.', s: 'Stretched materials and UVs, slow renders.', m: SO2.render },
] as { k: string, v: string, s?: string, m: typeof SO2.render, fit?: string }[]
const [r1, r2, r3, r4] = SO2.renders as [typeof SO2.render, typeof SO2.render, typeof SO2.render, typeof SO2.render]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: a type-only spec sheet -->
    <section class="sp" data-sheet-body data-sheet-block="lead">
      <div data-build class="sp__in">
        <div class="sp__top txt">
          <h2 class="se__k">
            {{ SO.title }}
          </h2>
          <p class="sp__hook">
            {{ SO.hook }}
          </p>
          <p class="se__text sp__intro">
            {{ SO.intro }}
          </p>
        </div>
        <figure class="sp__fig">
          <img :src="SO2.concept.src" :alt="SO2.concept.alt" :width="SO2.concept.w" :height="SO2.concept.h" decoding="async">
          <figcaption>Where it started: the AI concept</figcaption>
        </figure>
        <dl class="sp__meta">
          <div v-for="c in SO.meta" :key="c.k">
            <dt>{{ c.k }}</dt>
            <dd>{{ c.v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 01 One frame: pinned while its run scrolls past; the stages fade in on top of each other -->
    <section class="st" data-sheet-block="frame" aria-label="From prompt to render, one frame">
      <div class="st__run">
        <div class="st__stage">
          <ol class="st__rail" aria-hidden="true">
            <li v-for="(s, i) in stages" :key="s.k" :class="`st__r--${i}`">
              <b>{{ String(i + 1).padStart(2, '0') }}</b> {{ s.k }}
            </li>
          </ol>
          <div class="st__frame">
            <img
              v-for="(s, i) in stages"
              :key="s.k"
              class="st__img"
              :class="[`st__img--${i}`, { 'is-contain': s.fit === 'contain' }]"
              :src="s.m.src"
              :alt="s.m.alt"
              :width="s.m.w"
              :height="s.m.h"
              loading="lazy"
              decoding="async"
            >
          </div>
          <div class="st__caps">
            <div v-for="(s, i) in stages" :key="s.k" class="st__cap" :class="`st__cap--${i}`">
              <p class="st__name">
                <b>{{ String(i + 1).padStart(2, '0') }}</b> {{ s.k }}
              </p>
              <p class="se__text">
                {{ s.v }}
              </p>
              <p v-if="s.s" class="st__snag">
                <strong>Snag</strong> {{ s.s }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 The prompt, as a pull quote -->
    <section class="pq" data-sheet-block="prompt" aria-label="The prompt">
      <p class="pq__pivot txt">
        <s>Lore Keeper's Vault</s> <span>Smuggler's Outpost</span>
      </p>
      <blockquote class="pq__q txt">
        <p>“{{ SO.prompt }}”</p>
      </blockquote>
      <p class="se__text pq__foot txt">
        After re-watching the Dune films. Tried on {{ SO.models.join(', ') }} and {{ SO.checkpoints.join(', ') }}.
        “Monolithic” pushed the results abstract.
      </p>
    </section>

    <!-- 03 Outcome: the four shots and the slate -->
    <section class="ot" data-sheet-block="outcome" aria-label="Outcome">
      <figure class="ot__big">
        <img :src="r1.src" :alt="r1.alt" :width="r1.w" :height="r1.h" loading="lazy" decoding="async">
        <figcaption><b>01</b> {{ r1.cap }}</figcaption>
      </figure>
      <div class="ot__row">
        <figure v-for="(m, i) in [r2, r3, r4]" :key="m.src">
          <img :src="m.src" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          <figcaption><b>{{ String(i + 2).padStart(2, '0') }}</b> {{ m.cap }}</figcaption>
        </figure>
      </div>
      <div class="ot__slate">
        <p class="se__count">
          Outcome
        </p>
        <dl class="ot__specs">
          <div v-for="s in SO.outcome.specs" :key="s.k">
            <dt>{{ s.k }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
        <div class="txt">
          <p class="se__text">
            {{ SO.outcome.text }}
          </p>
          <p class="st__snag ot__next">
            <strong>Snag</strong> {{ SO2.roadmap }}
          </p>
        </div>
      </div>
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.se__k,
.se__count {
  margin: 0 0 16px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.se__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

img {
  display: block;
  width: 100%;
  height: auto;
}

/* Lead: the spec sheet, fading in a beat after the shell's build */
.sp {
  animation: se-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes se-in {
  from { opacity: 0; }
}

.sp__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.sp__top {
  align-self: center;
  padding: 32px 24px;
}

.sp__fig {
  position: relative;
  margin: 0;
  background: #000;
  border-left: 1px solid var(--rule);
}

.sp__fig img {
  height: 100%;
  aspect-ratio: 16 / 11;
  object-fit: cover;
}

.sp__fig figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 5px 9px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.sp__hook {
  max-width: 18ch;
  margin: 0 0 20px;
  font: 600 clamp(30px, 3.6vw, 46px)/1.06 var(--font-ui);
  letter-spacing: -0.025em;
}

.sp__intro {
  max-width: 56ch;
}

.sp__meta {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
}

.sp__meta div {
  padding: 14px 24px 18px;
}

.sp__meta div + div {
  border-left: 1px solid var(--rule);
}

.sp__meta dt,
.ot__specs dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sp__meta dd {
  margin: 8px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* 01 One frame. Without scroll timelines, every stage is listed in turn: image, then caption. */
.st {
  border-top: 1px solid var(--rule);
}

.st__rail {
  display: none;
}

.st__frame {
  display: grid;
  gap: 1px;
  background: var(--rule);
}

.st__img {
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #000;
}

.st__img.is-contain {
  object-fit: contain;
}

.st__caps {
  border-top: 1px solid var(--rule);
}

.st__cap {
  padding: 16px 24px 20px;
}

.st__cap + .st__cap {
  border-top: 1px solid var(--rule);
}

.st__name {
  margin: 0 0 6px;
  font: 600 18px/1.25 var(--font-ui);
}

.st__name b,
.st__rail b,
.ot figcaption b {
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.st__snag {
  margin: 10px 0 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--c-fg);
}

.st__snag strong {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

@supports (animation-timeline: view()) {
  .st__run {
    height: calc(var(--view-h) + 300svh);
    view-timeline: --st block;
    view-timeline-inset: var(--header-h) 0;
  }

  .st__stage {
    position: sticky;
    top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    height: var(--view-h);
    overflow: clip;
  }

  .st__rail {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 14px;
    grid-row: span 2;
    margin: 0;
    padding: 24px;
    list-style: none;
    border-right: 1px solid var(--rule);
  }

  .st__rail li {
    font: 600 14px/1.2 var(--font-ui);
    opacity: 0.3;
  }

  .st__frame {
    position: relative;
    display: block;
    background: #000;
  }

  .st__img {
    position: absolute;
    inset: 0;
    height: 100%;
    aspect-ratio: auto;
  }

  .st__img:not(.st__img--0) {
    opacity: 0;
  }

  .st__caps {
    display: grid;
    min-height: 128px;
  }

  .st__cap {
    grid-area: 1 / 1;
    opacity: 0;
  }

  .st__cap + .st__cap {
    border-top: 0;
  }

  /* Seven stages over the run: each image fades in over its slot's first part and stays (stacked) */
  .st__stage .st__img--1 { animation-range: contain 10% contain 16%; }
  .st__stage .st__img--2 { animation-range: contain 24% contain 30%; }
  .st__stage .st__img--3 { animation-range: contain 38% contain 44%; }
  .st__stage .st__img--4 { animation-range: contain 52% contain 58%; }
  .st__stage .st__img--5 { animation-range: contain 66% contain 72%; }
  .st__stage .st__img--6 { animation-range: contain 80% contain 86%; }

  .st__stage .st__cap--0, .st__stage .st__r--0 { animation-range: contain 0% contain 14%; }
  .st__stage .st__cap--1, .st__stage .st__r--1 { animation-range: contain 13% contain 28%; }
  .st__stage .st__cap--2, .st__stage .st__r--2 { animation-range: contain 27% contain 42%; }
  .st__stage .st__cap--3, .st__stage .st__r--3 { animation-range: contain 41% contain 56%; }
  .st__stage .st__cap--4, .st__stage .st__r--4 { animation-range: contain 55% contain 70%; }
  .st__stage .st__cap--5, .st__stage .st__r--5 { animation-range: contain 69% contain 84%; }
  .st__stage .st__cap--6, .st__stage .st__r--6 { animation-range: contain 83% contain 100%; }

  /* Scroll timelines run only once the Sheet is open: attached during the grow or the fold they cost ~80 slow
     frames (they re-resolve every frame while the layer moves) */
  html[data-sheet='open'] .st__rail li,
  html[data-sheet='open'] .st__img:not(.st__img--0),
  html[data-sheet='open'] .st__cap {
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: --st;
  }

  html[data-sheet='open'] .st__rail li { animation-name: se-on; }
  html[data-sheet='open'] .st__img:not(.st__img--0) { animation-name: se-in-img; }
  html[data-sheet='open'] .st__cap { animation-name: se-cap; }
  html[data-sheet='open'] .st__stage .st__cap--6 { animation-name: se-last; }
  html[data-sheet='open'] .st__stage .st__r--6 { animation-name: se-last-r; }

  /* Before the open (and during the fold) the first caption shows */
  html:not([data-sheet='open']) .st__cap--0 {
    opacity: 1;
  }
}

@keyframes se-in-img {
  to { opacity: 1; }
}

/* A caption (or rail item) is on through the middle of its slot, off either side */
@keyframes se-cap {
  0% { opacity: 0; }
  15%, 85% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes se-on {
  0% { opacity: 0.3; }
  15%, 85% { opacity: 1; }
  100% { opacity: 0.3; }
}

@keyframes se-last {
  0% { opacity: 0; }
  20%, 100% { opacity: 1; }
}

@keyframes se-last-r {
  0% { opacity: 0.3; }
  20%, 100% { opacity: 1; }
}

/* 02 The prompt, a pull quote */
.pq {
  padding: 48px 24px 44px;
  border-top: 1px solid var(--rule);
}

.pq__pivot {
  margin: 0 0 22px;
  font: 600 14px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.pq__pivot s {
  margin-right: 10px;
  color: var(--muted);
  text-decoration: line-through 2px var(--c-accent);
}

.pq__q {
  margin: 0;
}

.pq__q p {
  margin: 0;
  font: 500 clamp(24px, 3.4vw, 42px)/1.2 var(--font-ui);
  letter-spacing: -0.02em;
}

.pq__foot {
  max-width: 64ch;
  margin-top: 24px;
  font-size: 14px;
}

/* 03 Outcome */
.ot {
  border-top: 1px solid var(--rule);
}

.ot figure {
  position: relative;
  margin: 0;
  background: #000;
}

.ot figure img {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.ot figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 5px 9px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.ot__row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.ot__slate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 20px 32px;
  align-items: start;
  padding: 28px 24px;
  border-top: 1px solid var(--rule);
}

.ot__specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
}

.ot__specs div {
  padding: 10px 14px 12px;
}

.ot__specs div:nth-child(even) {
  border-left: 1px solid var(--rule);
}

.ot__specs div:nth-child(n + 3) {
  border-top: 1px solid var(--rule);
}

.ot__specs dd {
  margin: 6px 0 0;
  font: 600 18px/1.2 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

.ot__next {
  margin-top: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .sp { animation-duration: 1ms; }
}

@media (max-width: 720px) {
  /* The right padding keeps body copy clear of the shell's floating close button on phones */
  .sp__top,
  .pq {
    padding: 28px 52px 26px 16px;
  }

  .sp__hook {
    font-size: 32px;
  }

  .sp__in {
    grid-template-columns: minmax(0, 1fr);
  }

  .sp__fig {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .sp__meta {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .sp__meta div {
    padding: 12px 16px 14px;
  }

  .sp__meta div:nth-child(3) {
    border-left: 0;
  }

  .sp__meta div:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }

  .st__cap {
    padding: 14px 52px 16px 16px;
  }

  .ot__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .ot__slate {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 52px 22px 16px;
  }

  .ot__slate .se__count {
    margin: 0;
  }
}

@media (max-width: 720px) {
  @supports (animation-timeline: view()) {
    .st__stage {
      grid-template-columns: minmax(0, 1fr);
      grid-template-rows: auto auto auto;
      align-content: center;
    }

    /* The rail becomes a row of numbers above the frame */
    .st__rail {
      flex-direction: row;
      justify-content: space-between;
      grid-row: auto;
      padding: 12px 16px;
      border-right: 0;
      border-bottom: 1px solid var(--rule);
    }

    .st__rail li {
      font-size: 0;
    }

    .st__rail b {
      margin: 0;
      font-size: 13px;
    }

    .st__frame {
      aspect-ratio: 16 / 9;
    }

    .st__caps {
      min-height: 190px;
    }
  }
}
</style>
