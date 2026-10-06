<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from './SheetShell.vue'

// PROTOTYPE S "Signal chain" (Project Sheet rework, round 2; ref: Obys's split and collage pages).
// Axes: horizontal pinned runs; pipeline order; a signal line.
// After the hero and the intro, each track is one pinned run of edge-to-edge panels that the vertical scroll drives
// sideways, in the order the signal went: the sound (album art) → the visual (the TouchDesigner output and frames) →
// the network (the node graph) → the room (the render). A thin red signal line runs through the panels and lights up
// as the run goes. The drive is a CSS scroll-driven animation (compositor) with a once-a-frame JS fallback (--p).
// Then the process band and the outcome. Without a story the process steps make one run; with none, the intro stands
// alone. PLACEHOLDER: the run length (70svh a panel), the plates, the line's height, type sizes.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

const view = computed(() => storyView(props.sheet.card))
const story = computed(() => view.value.kind === 'story')
const runs = computed(() => {
  const v = view.value
  if (v.kind === 'story') return v.chapters.map(c => ({ id: c.id, title: c.title, subtitle: c.subtitle, panels: c.chain }))
  if (v.kind === 'steps') return [{ id: 'process', title: 'Process', subtitle: undefined, panels: v.chapters.flatMap(c => c.chain) }]
  return []
})
const legend = computed(() => story.value ? ['Sound', 'Visual', 'Network', 'Room'] : view.value.chapters.map(c => c.title))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <section class="ss__intro" data-sheet-body data-sheet-block="intro" data-build>
      <div class="ss__words">
        <h2 class="ss__title">
          {{ view.title }}
        </h2>
        <p class="ss__hook">
          {{ view.hook }}
        </p>
        <p v-if="view.intro" class="ss__muted">
          {{ view.intro }}
        </p>
      </div>
      <ol v-if="legend.length" class="ss__legend" aria-label="The signal chain">
        <li v-for="(l, i) in legend" :key="l">
          <b>{{ pad(i) }}</b> {{ l }}
        </li>
      </ol>
      <dl class="ss__credits">
        <div v-for="c in view.credits" :key="c.k">
          <dt>{{ c.k }}</dt>
          <dd>{{ c.v }}</dd>
        </div>
      </dl>
    </section>

    <section
      v-for="(r, ri) in runs"
      :key="r.id"
      class="ss__run"
      :style="{ '--n': r.panels.length }"
      data-progress
      :data-sheet-block="`run-${r.id}`"
      data-build
      :aria-label="r.title"
    >
      <div class="ss__view">
        <div class="ss__track">
          <div class="ss__line" aria-hidden="true">
            <i class="ss__lit" />
          </div>
          <article v-for="(p, pi) in r.panels" :key="p.k + pi" class="ss__panel" :class="`ss__panel--${p.k.toLowerCase()}`">
            <div v-if="p.media.length" class="ss__media" :class="{ 'ss__media--multi': p.media.length > 1 }">
              <SheetPic v-for="m in p.media.slice(0, 4)" :key="m.src" :m="m" />
            </div>
            <p v-else class="ss__said">
              “{{ p.v }}”
            </p>
            <p class="ss__chip">
              <i class="ss__node" />{{ pad(ri) }} {{ r.title }} <span>· {{ p.k }}</span>
            </p>
            <div v-if="p.v && p.media.length" class="ss__plate">
              <p>{{ p.v }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <SheetProcess v-if="story && view.phases.length" :phases="view.phases" />
    <SheetOutcome v-if="view.outcome" :outcome="view.outcome" />
  </SheetShell>
</template>

<style scoped>
.ss__intro {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 0;
}

.ss__words p {
  margin: 0;
}

.ss__title {
  margin: 0 0 14px;
  font: 600 44px/1.05 var(--font-ui);
  letter-spacing: -0.02em;
}

.ss__hook {
  font: 400 21px/1.4 var(--font-ui);
}

.ss__muted {
  margin-top: 12px !important;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The chain as a line with its stops */
.ss__legend {
  position: relative;
  display: grid;
  align-content: start;
  gap: 14px;
  margin: 6px 0 0;
  padding: 0 0 0 22px;
  list-style: none;
  font: 600 17px/1 var(--font-ui);
}

.ss__legend::before {
  content: '';
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: 4px;
  width: 1.5px;
  background: var(--c-accent);
}

.ss__legend li {
  position: relative;
}

.ss__legend li::before {
  content: '';
  position: absolute;
  top: 1px;
  left: -22px;
  width: 9px;
  height: 9px;
  background: var(--c-bg);
  border: 1.5px solid var(--c-accent);
  border-radius: 999px;
}

.ss__legend b,
.ss__chip {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
}

.ss__legend b {
  margin-right: 6px;
  color: var(--c-accent);
}

/* The credits as one row of cells meeting edge to edge, flush with the frame's sides */
.ss__credits {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  margin: 8px -24px 0;
  border-top: 1px solid var(--rule);
}

.ss__credits div {
  padding: 14px 24px 18px;
}

.ss__credits div + div {
  border-left: 1px solid var(--rule);
}

.ss__credits dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ss__credits dd {
  margin: 8px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* A run: one pinned view, scrolled sideways across its panels */
.ss__run {
  height: calc(var(--view-h) + (var(--n) - 1) * 70svh);
  border-top: 1px solid var(--rule);
}

.ss__view {
  position: sticky;
  top: var(--header-h);
  height: var(--view-h);
  overflow: hidden;
}

.ss__track {
  position: relative;
  display: flex;
  width: calc(var(--n) * 100%);
  height: 100%;
  translate: calc(var(--p, 0) * (1 - 1 / var(--n)) * -100%) 0;
  will-change: translate;
}

@supports (animation-timeline: view()) {
  .ss__run {
    view-timeline: --run block;
    view-timeline-inset: var(--header-h) 0;
  }

  .ss__track {
    animation: ss-run linear both;
    animation-timeline: --run;
    animation-range: contain 0% contain 100%;
  }

  .ss__lit {
    animation: ss-lit linear both;
    animation-timeline: --run;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes ss-run {
  from { translate: 0 0; }
  to { translate: calc((1 - 1 / var(--n)) * -100%) 0; }
}

@keyframes ss-lit {
  from { scale: calc(1 / var(--n)) 1; }
  to { scale: 1 1; }
}

.ss__panel {
  position: relative;
  flex: 0 0 calc(100% / var(--n));
  height: 100%;
  overflow: hidden;
  background: #000;
}

.ss__panel + .ss__panel {
  border-left: 1px solid var(--rule);
}

.ss__media {
  position: absolute;
  inset: 0;
  display: grid;
}

/* The visual: its output large, its frames in a row under it. The network: its graphs stacked, whole */
.ss__media--multi {
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 1fr 26%;
}

.ss__media--multi > :first-child {
  grid-column: 1 / -1;
}

.ss__panel--network .ss__media--multi {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;
}

.ss__panel--network .pic {
  --pic-fit: contain;
  background: #1c1c1c;
}

/* A stage with no picture (B17 has no album art here): the sound, said */
.ss__said {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  margin: 0;
  padding: 0 12%;
  font: 600 clamp(32px, 4.4vw, 56px)/1.1 var(--font-ui);
  letter-spacing: -0.02em;
  text-align: center;
  background: var(--c-bg);
}

/* The signal line, through every panel's chip */
.ss__line {
  position: absolute;
  top: 37px;
  left: calc(32px + 4px);
  right: 0;
  z-index: 2;
  height: 2px;
  background: color-mix(in srgb, var(--c-accent) 35%, transparent);
  pointer-events: none;
}

.ss__lit {
  position: absolute;
  inset: 0;
  background: var(--c-accent);
  transform-origin: 0 50%;
  scale: calc((var(--p, 0) * (var(--n) - 1) + 1) / var(--n)) 1;
}

.ss__chip {
  position: absolute;
  top: 24px;
  left: 24px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 7px 12px 7px 9px;
  text-transform: uppercase;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
}

.ss__chip span {
  color: var(--muted);
}

.ss__node {
  width: 9px;
  height: 9px;
  background: var(--c-accent);
  border-radius: 999px;
}

.ss__plate {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 3;
  max-width: min(400px, calc(100% - 48px));
  padding: 14px 16px;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.ss__plate p {
  margin: 0;
  font: 400 15px/1.5 var(--font-ui);
}

@media (max-width: 720px) {
  .ss__intro {
    grid-template-columns: 1fr;
  }
}
</style>
