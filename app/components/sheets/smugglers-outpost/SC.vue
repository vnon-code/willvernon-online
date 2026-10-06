<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO } from './story'

// PROTOTYPE SC "Scene breakdown" (overnight run, Smuggler's Outpost r1). The Sheet as a 3D artist's breakdown reel.
// Refs: environment breakdown entries on The Rookies and BlenderNation's "Shooting Hoops" scene breakdown (concept,
// passes, layers, final); Apple-style sticky scrollytelling; Kenta Toshikura's counted UI (without the heavy page).
// Beats, each with its own device: a bento of the AI concept beside the solid and wireframe passes → a stat band (the
// film's numbers) with the intro → the AI phase as a generation log (each line a step, its page beside it) → the build
// as sticky scrollytelling (the step name holds while its pages scroll past) → the atmosphere as expanding panels →
// the problems as an accordion → the outcome as a shot list. PLACEHOLDER: every size, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const stats = [
  { n: '10s', k: 'film, 1080p' },
  { n: '300', k: 'frames' },
  { n: '6h', k: 'to render' },
  { n: '4', k: 'renders' },
]
const log = [
  { cmd: `compare ${SO.models.join(' / ')}`, out: 'Three base models, on CivitAI.', m: SO.basePage },
  { cmd: `checkpoints ×${SO.checkpoints.length}`, out: 'Similar results: the prompt matters most.', m: SO.aiPages[0]! },
  { cmd: `prompt "${SO.ladder[0]!.add}"`, out: SO.ladder[0]!.note, m: SO.aiPages[1]! },
  { cmd: `prompt "${SO.ladder[1]!.add}"`, out: SO.ladder[1]!.note, m: SO.aiPages[2]! },
  { cmd: 'prompt final', out: SO.prompt, m: SO.aiPages[3]! },
  { cmd: 'select 1 of 4', out: SO.pick.text, m: SO.pick.m },
]

// Sticky build: which step is in the middle of the view
const on = ref(0)
const steps = ref<HTMLElement[]>([])
let io: IntersectionObserver | undefined
onMounted(() => {
  const root = steps.value[0]?.closest<HTMLElement>('[data-sheet-layer]') ?? null
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) on.value = steps.value.indexOf(e.target as HTMLElement)
  }, { root, rootMargin: '-45% 0px -45% 0px' })
  steps.value.forEach(s => io!.observe(s))
})
onBeforeUnmount(() => io?.disconnect())

const open = ref(2)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the concept beside the passes, then the stat band -->
    <section class="ld" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div class="bento">
          <figure class="bento__big">
            <SheetPic :m="SO.concept" />
            <figcaption>Concept · Stable Diffusion</figcaption>
          </figure>
          <figure>
            <SheetPic :m="SO.solid" />
            <figcaption>Pass · solid</figcaption>
          </figure>
          <figure>
            <SheetPic :m="SO.wire" />
            <figcaption>Pass · wireframe</figcaption>
          </figure>
        </div>
        <div class="intro">
          <div>
            <h2 class="sc__k">
              {{ SO.title }}
            </h2>
            <p class="intro__hook">
              {{ SO.hook }}
            </p>
            <p class="sc__text">
              {{ SO.intro }}
            </p>
          </div>
          <dl class="stats">
            <div v-for="s in stats" :key="s.k">
              <dt>{{ s.k }}</dt>
              <dd>{{ s.n }}</dd>
            </div>
          </dl>
        </div>
        <dl class="meta">
          <div v-for="c in SO.meta" :key="c.k">
            <dt>{{ c.k }}</dt>
            <dd>{{ c.v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- 01 Concept: a generation log -->
    <section class="lg" data-sheet-block="concept" aria-label="Concept generation">
      <div class="sc__head">
        <p class="sc__count">
          <b>01</b> Concept
        </p>
        <p class="sc__text">
          {{ SO.promptText }}
        </p>
      </div>
      <ol class="lg__list">
        <li v-for="(l, i) in log" :key="l.cmd" class="lg__row">
          <div class="lg__words">
            <code><span>{{ pad(i) }} &gt;</span> {{ l.cmd }}</code>
            <p>{{ l.out }}</p>
          </div>
          <SheetPic :m="l.m" />
        </li>
      </ol>
    </section>

    <!-- 02 Build: sticky scrollytelling -->
    <section class="st" data-sheet-block="build" aria-label="The Blender build">
      <div class="st__side">
        <div class="st__pin">
          <p class="sc__count">
            <b>02</b> Build
          </p>
          <p class="st__big" aria-live="polite">
            <span class="st__n">{{ pad(on) }} / {{ pad(SO.build.length - 1) }}</span>
            {{ SO.build[on]!.k }}
          </p>
          <p class="sc__text">
            {{ SO.build[on]!.v }}
          </p>
          <ol class="st__ticks" aria-hidden="true">
            <li v-for="(b, i) in SO.build" :key="b.k" :class="{ 'is-on': i === on }" />
          </ol>
        </div>
      </div>
      <ol class="st__pages">
        <li v-for="b in SO.build" :key="b.k" ref="steps">
          <SheetPic :m="b.m" />
          <p class="st__cap">
            <b>{{ b.k }}</b> {{ b.v }}
          </p>
        </li>
      </ol>
    </section>

    <!-- 03 Atmosphere: expanding panels -->
    <section class="ex" data-sheet-block="atmosphere" aria-label="Atmosphere">
      <div class="sc__head">
        <p class="sc__count">
          <b>03</b> Atmosphere
        </p>
        <p class="sc__text">
          Five layers of air, added over the built scene.
        </p>
      </div>
      <ul class="ex__row">
        <li v-for="(a, i) in SO.air" :key="a.k" class="ex__panel" :class="{ 'is-open': open === i }">
          <button type="button" class="ex__btn" :aria-expanded="open === i" @click="open = i" @mouseenter="open = i" @focus="open = i">
            <SheetPic :m="a.m" />
            <span class="ex__label"><b>{{ pad(i) }}</b> {{ a.k }}</span>
          </button>
          <p class="ex__text">
            {{ a.v }}
          </p>
        </li>
      </ul>
    </section>

    <!-- 04 Problems: an accordion -->
    <section class="ac" data-sheet-block="problems" aria-label="Problems met">
      <div class="sc__head">
        <p class="sc__count">
          <b>04</b> Problems met
        </p>
        <p class="sc__text">
          What went wrong, and what I did about it.
        </p>
      </div>
      <details v-for="(x, i) in SO.problems" :key="x.p" class="ac__item" :open="i === 0">
        <summary><b>{{ pad(i) }}</b>{{ x.p }}</summary>
        <p v-if="x.f">{{ x.f }}</p>
      </details>
    </section>

    <!-- 05 Outcome: a shot list -->
    <section class="sl" data-sheet-block="outcome" aria-label="Outcome">
      <div class="sc__head">
        <p class="sc__count">
          <b>05</b> Outcome
        </p>
        <p class="sc__text">
          {{ SO.outcome.text }}
        </p>
      </div>
      <ol class="sl__list">
        <li v-for="(m, i) in SO.outcome.renders" :key="m.src" class="sl__shot">
          <SheetPic :m="m" />
          <p><span>Shot {{ pad(i) }}</span>{{ m.caption }}</p>
        </li>
      </ol>
      <figure class="sl__page">
        <SheetPic :m="SO.outcome.page" cap />
      </figure>
      <p class="sc__text sl__after">
        {{ SO.outcome.after }}
      </p>
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.sc__k,
.sc__count,
.meta dt,
.stats dt {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sc__count b {
  margin-right: 8px;
  font-size: 22px;
  font-weight: 600;
  color: var(--c-accent);
}

.sc__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.sc__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 12px 24px;
  padding: 28px 24px;
}

.ld {
  animation: sc-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sc-in {
  from { opacity: 0; }
}

/* The bento: concept large, two passes stacked */
.bento {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 1px;
  background: var(--rule);
}

.bento figure {
  position: relative;
  margin: 0;
}

.bento__big {
  grid-row: span 2;
}

.bento .pic {
  height: 100%;
  aspect-ratio: 16 / 9;
}

.bento figcaption {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

/* Intro and the stat band */
.intro {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 24px 40px;
  padding: 28px 24px;
  border-top: 1px solid var(--rule);
}

.intro .sc__k {
  margin-bottom: 14px;
}

.intro__hook {
  margin: 0 0 14px;
  font: 600 30px/1.15 var(--font-ui);
  letter-spacing: -0.015em;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 0;
  align-self: start;
  background: var(--rule);
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
}

.stats div {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  padding: 14px 16px;
  background: var(--c-bg);
}

.stats dd {
  margin: 0;
  font: 700 40px/1 var(--font-ui);
  letter-spacing: -0.03em;
  color: var(--c-accent);
}

.meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
}

.meta div {
  padding: 12px 24px 16px;
}

.meta div + div {
  border-left: 1px solid var(--rule);
}

.meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* 01 The generation log */
.lg,
.st,
.ex,
.ac,
.sl {
  border-top: 1px solid var(--rule);
}

.lg__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lg__row {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.lg__row .pic {
  aspect-ratio: 16 / 9;
  border-left: 1px solid var(--rule);
}

.lg__words {
  padding: 16px 24px;
}

.lg__words code {
  display: block;
  font: 500 15px/1.4 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-fg);
  overflow-wrap: anywhere;
}

.lg__words code span {
  color: var(--c-accent);
}

.lg__words p {
  margin: 8px 0 0;
  font: 400 14px/1.55 var(--font-ui);
  color: var(--muted);
}

/* 02 Sticky build */
.st {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
}

.st__pin {
  position: sticky;
  top: 24px;
  display: grid;
  gap: 16px;
  padding: 28px 24px;
}

.st__big {
  margin: 0;
  font: 700 clamp(34px, 4.6vw, 60px)/1 var(--font-ui);
  letter-spacing: -0.03em;
}

.st__n {
  display: block;
  margin-bottom: 10px;
  font: 500 13px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  letter-spacing: 0;
  color: var(--c-accent);
}

.st__ticks {
  display: flex;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.st__ticks li {
  flex: 1;
  height: 2px;
  background: var(--rule);
  transition: background-color 0.3s var(--ease-out);
}

.st__ticks li.is-on {
  background: var(--c-accent);
}

.st__pages {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}

.st__pages li + li {
  border-top: 1px solid var(--rule);
}

.st__pages .pic {
  aspect-ratio: 16 / 9;
}

.st__cap {
  display: none;
  margin: 0;
  padding: 12px 16px 16px;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

.st__cap b {
  color: var(--c-fg);
}

/* 03 Expanding panels */
.ex__row {
  display: flex;
  height: 420px;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.ex__panel {
  position: relative;
  flex: 1;
  min-width: 0;
  transition: flex-grow 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.ex__panel + .ex__panel {
  border-left: 1px solid var(--rule);
}

.ex__panel.is-open {
  flex-grow: 4;
}

.ex__btn {
  position: absolute;
  inset: 0;
  padding: 0;
  color: var(--c-fg);
  background: none;
  border: 0;
  cursor: pointer;
  outline-offset: -3px;
}

.ex__btn .pic {
  position: absolute;
  inset: 0;
}

.ex__panel:not(.is-open) .pic {
  opacity: 0.55;
}

.ex__label {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.ex__label b {
  color: var(--c-accent);
}

.ex__text {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  margin: 0;
  padding: 10px 12px;
  font: 400 14px/1.45 var(--font-ui);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.25s var(--ease-out);
}

.ex__panel.is-open .ex__text {
  opacity: 1;
}

/* 04 The accordion */
.ac__item {
  border-top: 1px solid var(--rule);
}

.ac__item summary {
  display: flex;
  gap: 14px;
  padding: 16px 24px;
  font: 500 17px/1.4 var(--font-ui);
  list-style: none;
  cursor: pointer;
  outline-offset: -3px;
}

.ac__item summary::-webkit-details-marker {
  display: none;
}

.ac__item summary::after {
  content: '+';
  margin-left: auto;
  color: var(--muted);
}

.ac__item[open] summary::after {
  content: '−';
}

.ac__item summary b {
  color: var(--c-accent);
}

.ac__item p {
  margin: 0;
  padding: 0 24px 18px 58px;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

/* 05 The shot list */
.sl__list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.sl__shot {
  background: var(--c-bg);
}

.sl__shot .pic,
.sl__page .pic {
  aspect-ratio: 16 / 9;
}

.sl__shot p {
  margin: 0;
  padding: 12px 16px 16px;
  font: 600 16px/1.3 var(--font-ui);
}

.sl__shot span {
  display: block;
  margin-bottom: 4px;
  font: 500 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-accent);
}

.sl__page {
  margin: 0;
  border-top: 1px solid var(--rule);
}

.sl__after {
  padding: 20px 24px 28px;
  border-top: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .ld { animation-duration: 1ms; }
  .ex__panel { transition: none; }
}

@media (max-width: 720px) {
  .sc__head,
  .intro,
  .lg__row,
  .st {
    grid-template-columns: 1fr;
  }

  .sc__head,
  .intro {
    padding: 22px 16px;
  }

  .intro__hook {
    font-size: 24px;
  }

  .meta {
    grid-template-columns: 1fr 1fr;
  }

  .meta div {
    padding: 12px 16px 14px;
  }

  .meta div:nth-child(3) {
    border-left: 0;
  }

  .meta div:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }

  .lg__row .pic {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .lg__words {
    padding: 14px 16px;
  }

  /* Phones: no sticky; each page carries its own caption */
  .st__pin {
    position: static;
    padding: 22px 16px;
  }

  .st__pin .sc__text,
  .st__ticks,
  .st__big {
    display: none;
  }

  .st__pages {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .st__cap {
    display: block;
  }

  .ex__row {
    flex-direction: column;
    height: auto;
  }

  .ex__panel {
    aspect-ratio: 16 / 9;
  }

  .ex__panel + .ex__panel {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .ex__text,
  .ex__panel:not(.is-open) .pic {
    opacity: 1;
  }

  .ac__item summary {
    padding: 14px 16px;
    font-size: 15px;
  }

  .ac__item p {
    padding: 0 16px 16px 16px;
  }

  .sl__list {
    grid-template-columns: 1fr;
  }

  .sl__after {
    padding: 18px 16px 24px;
  }
}
</style>
