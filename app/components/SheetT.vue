<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from './SheetShell.vue'

// PROTOTYPE T "Type stage" (Project Sheet rework, round 2; ref: kentatoshikura.com/project/drift).
// Axes: oversized type; counted beats; a metadata rail.
// After the hero, the intro: the hook large beside a metadata rail with the credits. Then each track is a beat: a
// pinned stage where its name, huge, slides behind the centred visual as you scroll (a CSS scroll-driven animation,
// JS fallback --p), a counter 01 / 03, its sound / visual / room along the foot; and under the stage its splash and
// renders, fanning out as they scroll in. Then the process band and the outcome. Without a story the process steps
// are the beats; with none, the intro stands alone. PLACEHOLDER: the type size and travel, the fan's angles, the
// beat length (60svh), type sizes.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

const view = computed(() => storyView(props.sheet.card))
const beats = computed(() => view.value.chapters
  .map(c => ({ ...c, stage: c.screen ?? c.slides[0], fan: c.screen ? c.slides.slice(0, 5) : c.slides.slice(1, 6) }))
  .filter(c => c.stage))
const story = computed(() => view.value.kind === 'story')
// The fan: each card's angle and offset from the middle one. PLACEHOLDER
const fanAt = (i: number, n: number) => {
  const d = i - (n - 1) / 2
  return { '--r': `${d * 4.5}deg`, '--x': `${d * 19}%`, '--y': `${Math.abs(d) * 14}px`, 'zIndex': 10 - Math.round(Math.abs(d) * 2) }
}
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <section class="st__intro" :class="{ 'st__intro--thin': !beats.length }" data-sheet-body data-sheet-block="intro" data-build>
      <div class="st__words">
        <h2 class="st__title">
          {{ view.title }}
        </h2>
        <p class="st__hook">
          {{ view.hook }}
        </p>
        <p v-if="view.intro" class="st__muted">
          {{ view.intro }}
        </p>
      </div>
      <dl class="st__meta">
        <div v-if="beats.length">
          <dt>{{ story ? 'Tracks' : 'Steps' }}</dt>
          <dd>{{ pad(beats.length - 1) }}</dd>
        </div>
        <div v-for="c in view.credits" :key="c.k">
          <dt>{{ c.k }}</dt>
          <dd>{{ c.v }}</dd>
        </div>
      </dl>
    </section>

    <section v-for="(b, i) in beats" :key="b.id" class="st__beat" :data-sheet-block="`beat-${b.id}`" data-build :aria-label="b.title">
      <div class="st__run" data-progress>
        <div class="st__stage">
          <p class="st__type" aria-hidden="true">
            {{ b.title }}
          </p>
          <p class="st__count">
            <b>{{ pad(i) }}</b> / {{ pad(beats.length - 1) }}
          </p>
          <SheetPic class="st__screen" :m="b.stage!" cap :style="{ '--a': b.stage!.aspect ?? 16 / 9 }" />
          <dl class="st__facts" :class="{ 'st__facts--one': b.facts.length < 2 }">
            <div v-for="f in b.facts" :key="f.k">
              <dt v-if="f.k">
                {{ f.k }}
              </dt>
              <dd>{{ f.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div v-if="b.fan.length" class="st__fan">
        <SheetPic v-for="(m, j) in b.fan" :key="m.src" class="st__card" :m="m" :style="fanAt(j, b.fan.length)" />
      </div>
    </section>

    <SheetProcess v-if="story && view.phases.length" :phases="view.phases" />
    <SheetOutcome v-if="view.outcome" :outcome="view.outcome" />
  </SheetShell>
</template>

<style scoped>
.st__intro {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 40px;
}

.st__intro--thin {
  padding-bottom: 56px;
}

.st__words p {
  margin: 0;
}

.st__title {
  margin: 0 0 18px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.st__hook {
  font: 600 34px/1.15 var(--font-ui);
  letter-spacing: -0.015em;
}

.st__muted {
  margin-top: 16px !important;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The metadata rail: label over value, hairlines between */
.st__meta {
  display: grid;
  align-content: start;
  margin: 0;
  border-left: 1px solid var(--rule);
}

.st__meta div {
  padding: 8px 0 10px 20px;
}

.st__meta div + div {
  border-top: 1px solid var(--rule);
}

.st__meta dt,
.st__facts dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.st__meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

.st__beat {
  border-top: 1px solid var(--rule);
}

/* The stage pins for one view plus 60svh of scroll, while the name crosses behind it */
.st__run {
  height: calc(var(--view-h) + 60svh);
}

.st__stage {
  position: sticky;
  top: var(--header-h);
  height: var(--view-h);
  overflow: hidden;
}

.st__type {
  position: absolute;
  top: 44%;
  left: 0;
  margin: 0;
  font: 700 clamp(120px, 17vw, 250px)/0.9 var(--font-ui);
  letter-spacing: -0.04em;
  white-space: nowrap;
  translate: calc(24% - var(--p, 0) * 88%) -50%;
  will-change: translate;
  pointer-events: none;
}

@supports (animation-timeline: view()) {
  .st__run {
    view-timeline: --beat block;
    view-timeline-inset: var(--header-h) 0;
  }

  .st__type {
    animation: st-type linear both;
    animation-timeline: --beat;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes st-type {
  from { translate: 24% -50%; }
  to { translate: -64% -50%; }
}

.st__count {
  position: absolute;
  top: 24px;
  left: 24px;
  margin: 0;
  font: 500 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
}

.st__count b {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-accent);
}

/* The centred stage: the visual, with a lit edge */
.st__screen {
  position: absolute;
  top: 44%;
  left: 50%;
  width: min(56%, calc(var(--view-h) * 0.56 * var(--a)));
  aspect-ratio: var(--a);
  translate: -50% -50%;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

/* Sound / visual / room along the stage's foot */
.st__facts {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 0;
  background: var(--c-bg);
  border-top: 1px solid var(--rule);
}

.st__facts--one {
  grid-template-columns: minmax(0, 640px);
}

.st__facts div {
  padding: 14px 24px 18px;
}

.st__facts div + div {
  border-left: 1px solid var(--rule);
}

.st__facts dd {
  margin: 6px 0 0;
  font: 400 13.5px/1.45 var(--font-ui);
}

/* The renders, fanned from a stack as they scroll in */
.st__fan {
  position: relative;
  height: clamp(320px, 38vw, 440px);
  overflow: hidden;
  border-top: 1px solid var(--rule);
}

.st__card {
  position: absolute;
  top: 18%;
  left: 50%;
  width: 40%;
  aspect-ratio: 16 / 9;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  translate: calc(-50% + var(--x) * 2.5) var(--y);
  rotate: var(--r);
  transition: translate 0.3s var(--ease-out);
}

@supports (animation-timeline: view()) {
  .st__card {
    animation: st-fan linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 45%;
  }
}

@keyframes st-fan {
  from { translate: -50% 40px; rotate: 0deg; }
  to { translate: calc(-50% + var(--x) * 2.5) var(--y); rotate: var(--r); }
}

@media (max-width: 720px) {
  .st__intro {
    grid-template-columns: 1fr;
  }

  .st__facts {
    grid-template-columns: 1fr;
  }

  .st__facts div + div {
    display: none;
  }
}
</style>
