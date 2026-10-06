<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO } from './story'

// PROTOTYPE SA "Concept to canyon" (overnight run, Smuggler's Outpost r1).
// Refs: VFX before/after breakdowns (Image Engine's breakdown practice, vfxvoice.com); Son Daven (assets that move
// with the scroll and lead the eye); Rejouice (clean, quiet layout).
// Beats, each with its own device: the AI concept and the render side by side under the hero (a diptych) → the
// prompt as type: the ladder of added words, then the final prompt lighting up word by word as it scrolls past →
// the Blender build as a horizontal filmstrip you drag or step through → the render with numbered pins (what each
// part is and how it was made) → the problems as a two-column fix ledger → the outcome as a slate of specs over the
// four renders and the viewport film. PLACEHOLDER: every size, the pin spots, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const words = SO.prompt.split(' ')
const rail = ref<HTMLElement>()
function step(d: number) {
  const r = rail.value
  if (!r) return
  const card = r.querySelector<HTMLElement>('.rl__card')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  r.scrollBy({ left: d * ((card?.offsetWidth ?? 300) + 1), behavior: reduce ? 'auto' : 'smooth' })
}
const hot = ref(-1)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the diptych, then the intro -->
    <section class="ld" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div class="dp">
          <SheetPic :m="SO.concept" />
          <SheetPic :m="SO.render" />
          <span class="dp__tag dp__tag--l">01 · Stable Diffusion</span>
          <span class="dp__tag dp__tag--r">02 · Blender</span>
        </div>
        <div class="ld__intro">
          <div>
            <h2 class="sa__k">
              {{ SO.title }}
            </h2>
            <p class="ld__hook">
              {{ SO.hook }}
            </p>
            <p class="sa__text">
              {{ SO.intro }}
            </p>
          </div>
          <dl class="ld__meta">
            <div v-for="c in SO.meta" :key="c.k">
              <dt>{{ c.k }}</dt>
              <dd>{{ c.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- 01 The prompt: a ladder, then the final prompt lit word by word -->
    <section class="pr" data-sheet-block="prompt" aria-label="The prompt">
      <div class="pr__head">
        <p class="sa__count">
          <b>01</b> The prompt
        </p>
        <p class="sa__text">
          {{ SO.promptText }}
        </p>
      </div>
      <ol class="pr__ladder">
        <li v-for="(l, i) in SO.ladder" :key="l.add">
          <code><span class="pr__n">{{ pad(i) }}</span>{{ l.add }}</code>
          <span class="pr__note">{{ l.note }}</span>
        </li>
      </ol>
      <p class="pr__final" :aria-label="SO.prompt">
        <span class="pr__label" aria-hidden="true">Final prompt</span>
        <span v-for="(w, i) in words" :key="i" class="pr__w" aria-hidden="true">{{ `${w} ` }}</span>
      </p>
      <div class="pr__models">
        <p class="sa__text">
          {{ SO.modelsText }}
        </p>
        <ul class="pr__chips" aria-label="Models and checkpoints">
          <li v-for="m in SO.models" :key="m" class="pr__chip pr__chip--base">
            {{ m }}
          </li>
          <li v-for="m in SO.checkpoints" :key="m" class="pr__chip">
            {{ m }}
          </li>
        </ul>
      </div>
      <div class="pr__pages">
        <SheetPic v-for="m in SO.aiPages" :key="m.src" :m="m" cap />
      </div>
    </section>

    <!-- 02 The build: a filmstrip -->
    <section class="rl" data-sheet-block="build" aria-label="The Blender build">
      <div class="rl__head">
        <p class="sa__count">
          <b>02</b> The build
        </p>
        <p class="sa__text">
          {{ SO.pick.text }} Then Blender, from scratch.
        </p>
        <div class="rl__btns">
          <button type="button" class="rl__btn" aria-label="Previous step" @click="step(-1)">
            ←
          </button>
          <button type="button" class="rl__btn" aria-label="Next step" @click="step(1)">
            →
          </button>
        </div>
      </div>
      <ol ref="rail" class="rl__rail" tabindex="0" aria-label="Build steps, scrolls sideways">
        <li class="rl__card">
          <SheetPic :m="SO.pick.m" />
          <p><b>00</b> Concept<span>{{ SO.pick.m.caption }}</span></p>
        </li>
        <li v-for="(b, i) in SO.build" :key="b.k" class="rl__card">
          <SheetPic :m="b.m" />
          <p><b>{{ pad(i) }}</b> {{ b.k }}<span>{{ b.v }}</span></p>
        </li>
      </ol>
    </section>

    <!-- 03 The scene: the render, pinned -->
    <section class="pn" data-sheet-block="scene" aria-label="The scene, part by part">
      <div class="pn__head">
        <p class="sa__count">
          <b>03</b> The scene
        </p>
        <p class="sa__text">
          Then the air: an HDRI, a procedural sandstorm, volumetric dust, and depth of field.
        </p>
      </div>
      <div class="pn__img">
        <SheetPic :m="SO.render" />
        <span
          v-for="(p, i) in SO.pins"
          :key="p.k"
          class="pn__pin"
          :class="{ 'is-on': hot === i }"
          :style="{ left: `${p.x}%`, top: `${p.y}%` }"
          aria-hidden="true"
        >{{ i + 1 }}</span>
      </div>
      <ol class="pn__legend">
        <li
          v-for="(p, i) in SO.pins"
          :key="p.k"
          tabindex="0"
          :class="{ 'is-on': hot === i }"
          @mouseenter="hot = i"
          @mouseleave="hot = -1"
          @focus="hot = i"
          @blur="hot = -1"
        >
          <b>{{ i + 1 }}</b><span><em>{{ p.k }}</em> {{ p.v }}</span>
        </li>
      </ol>
    </section>

    <!-- 04 Problems: a fix ledger -->
    <section class="lg" data-sheet-block="problems" aria-label="Problems met">
      <p class="sa__count lg__count">
        <b>04</b> Problems met
      </p>
      <table class="lg__table">
        <thead>
          <tr><th scope="col">Problem</th><th scope="col">What I did</th></tr>
        </thead>
        <tbody>
          <tr v-for="x in SO.problems" :key="x.p">
            <td>{{ x.p }}</td>
            <td>{{ x.f || '—' }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- 05 Outcome: a slate over the renders -->
    <section class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <div class="oc__slate">
        <p class="sa__count">
          <b>05</b> Outcome
        </p>
        <dl class="oc__specs">
          <div v-for="s in SO.outcome.specs" :key="s.k">
            <dt>{{ s.k }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
        <p class="sa__text oc__text">
          {{ SO.outcome.text }}
        </p>
      </div>
      <div class="oc__grid">
        <SheetPic v-for="m in SO.outcome.renders" :key="m.src" :m="m" cap />
      </div>
      <SheetPic class="oc__vp" :m="SO.viewport" cap />
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.sa__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sa__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  color: var(--c-accent);
}

.sa__k {
  margin: 0 0 16px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sa__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* Lead: fades in a beat after the shell's build, so the words arrive once the hero has landed */
.ld {
  animation: sa-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sa-in {
  from { opacity: 0; }
}

.dp {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--rule);
}

.dp .pic {
  aspect-ratio: 16 / 9;
}

.dp__tag {
  position: absolute;
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

.dp__tag--l { left: 10px; }
.dp__tag--r { left: calc(50% + 10px); }

.ld__intro {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.ld__hook {
  margin: 0 0 16px;
  font: 600 34px/1.15 var(--font-ui);
  letter-spacing: -0.015em;
}

.ld__meta {
  margin: 0;
  border-left: 1px solid var(--rule);
}

.ld__meta div {
  padding: 8px 0 10px 20px;
}

.ld__meta div + div {
  border-top: 1px solid var(--rule);
}

.ld__meta dt,
.oc__specs dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ld__meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* 01 The prompt */
.pr {
  border-top: 1px solid var(--rule);
}

.pr__head,
.rl__head,
.pn__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 16px 24px;
  align-items: start;
  padding: 28px 24px;
}

.pr__ladder {
  margin: 0;
  padding: 0 24px;
  list-style: none;
}

.pr__ladder li {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 8px 24px;
  align-items: baseline;
  padding: 14px 0;
  border-top: 1px solid var(--rule);
}

.pr__ladder code {
  font: 500 clamp(18px, 2.4vw, 28px)/1.2 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-fg);
}

.pr__n {
  margin-right: 14px;
  font-size: 13px;
  color: var(--c-accent);
}

.pr__note {
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

.pr__final {
  margin: 0;
  padding: 36px 24px 40px;
  font: 600 clamp(24px, 3.6vw, 44px)/1.18 var(--font-ui);
  letter-spacing: -0.02em;
  border-top: 1px solid var(--rule);
}

.pr__label {
  display: block;
  margin-bottom: 14px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

/* Each word lights up as the prompt crosses the view (compositor-only opacity) */
@supports (animation-timeline: view()) {
  .pr__w {
    animation: sa-word linear both;
    animation-timeline: view();
    animation-range: entry 40% cover 45%;
  }
}

@keyframes sa-word {
  from { opacity: 0.18; }
}

.pr__models {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 16px 24px;
  padding: 24px;
  border-top: 1px solid var(--rule);
}

.pr__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pr__chip {
  padding: 5px 10px;
  font: 500 12px/1.2 ui-monospace, 'SF Mono', Menlo, monospace;
  border: 1px solid var(--rule);
  border-radius: 999px;
}

.pr__chip--base {
  color: var(--c-accent);
  border-color: currentColor;
}

.pr__pages {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.pr__pages .pic {
  aspect-ratio: 16 / 9;
}

/* 02 The build: a horizontal filmstrip */
.rl {
  border-top: 1px solid var(--rule);
}

.rl__head {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr) auto;
}

.rl__btns {
  display: flex;
  gap: 6px;
}

.rl__btn {
  width: 36px;
  height: 36px;
  font: 500 16px/1 var(--font-ui);
  color: var(--c-fg);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 50%;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-out);
}

.rl__btn:hover,
.rl__btn:focus-visible {
  border-color: var(--c-accent);
}

.rl__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 44%;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
  outline-offset: -3px;
}

.rl__rail::-webkit-scrollbar {
  display: none;
}

.rl__card {
  scroll-snap-align: start;
  background: var(--c-bg);
}

.rl__card .pic {
  aspect-ratio: 16 / 9;
}

.rl__card p {
  margin: 0;
  padding: 14px 16px 20px;
  font: 600 16px/1.3 var(--font-ui);
}

.rl__card b {
  margin-right: 8px;
  color: var(--c-accent);
}

.rl__card span {
  display: block;
  margin-top: 6px;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

/* 03 The scene, pinned */
.pn {
  border-top: 1px solid var(--rule);
}

.pn__img {
  position: relative;
  border-top: 1px solid var(--rule);
}

.pn__img .pic {
  aspect-ratio: 16 / 9;
}

.pn__pin {
  position: absolute;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  translate: -50% -50%;
  font: 600 12px/1 var(--font-ui);
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 50%;
  transition: scale 0.2s var(--ease-out), background-color 0.2s var(--ease-out);
}

.pn__pin.is-on {
  scale: 1.25;
  color: var(--c-bg);
  background: var(--c-accent);
}

.pn__legend {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.pn__legend li {
  display: flex;
  gap: 10px;
  padding: 14px 16px 18px;
  font: 400 14px/1.45 var(--font-ui);
  color: var(--muted);
  background: var(--c-bg);
  outline-offset: -3px;
  transition: color 0.2s var(--ease-out);
}

.pn__legend li.is-on {
  color: var(--c-fg);
}

.pn__legend b {
  color: var(--c-accent);
}

.pn__legend em {
  display: block;
  font-style: normal;
  font-weight: 600;
  color: var(--c-fg);
}

/* 04 Problems: the fix ledger */
.lg {
  border-top: 1px solid var(--rule);
}

.lg__count {
  padding: 28px 24px 20px;
}

.lg__table {
  width: 100%;
  border-collapse: collapse;
  font: 400 15px/1.5 var(--font-ui);
}

.lg__table th {
  padding: 10px 24px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  color: var(--muted);
  border-top: 1px solid var(--rule);
}

.lg__table td {
  width: 50%;
  padding: 14px 24px 16px;
  vertical-align: top;
  border-top: 1px solid var(--rule);
}

.lg__table td + td,
.lg__table th + th {
  color: var(--muted);
  border-left: 1px solid var(--rule);
}

/* 05 Outcome */
.oc {
  border-top: 1px solid var(--rule);
}

.oc__slate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 20px 32px;
  align-items: start;
  padding: 28px 24px;
}

.oc__specs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
}

.oc__specs div {
  padding: 10px 14px 12px;
}

.oc__specs div + div {
  border-left: 1px solid var(--rule);
}

.oc__specs dd {
  margin: 6px 0 0;
  font: 600 18px/1.2 ui-monospace, 'SF Mono', Menlo, monospace;
}

.oc__text {
  grid-column: 2;
}

.oc__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.oc__grid .pic,
.oc__vp {
  aspect-ratio: 16 / 9;
}

.oc__vp {
  border-top: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .ld { animation-duration: 1ms; }
  .pr__w { animation: none; }
}

@media (max-width: 720px) {
  .ld__intro,
  .pr__head,
  .rl__head,
  .pn__head,
  .pr__models,
  .pr__ladder li,
  .oc__slate {
    grid-template-columns: 1fr;
  }

  .ld__intro,
  .pr__head,
  .rl__head,
  .pn__head,
  .pr__models,
  .oc__slate {
    padding: 22px 16px;
  }

  .pr__ladder {
    padding: 0 16px;
  }

  .pr__final {
    padding: 28px 16px 32px;
  }

  .ld__hook {
    font-size: 26px;
  }

  .ld__meta {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .ld__meta div {
    padding-left: 0;
  }

  .dp__tag {
    bottom: 6px;
    padding: 3px 6px;
  }

  .dp__tag--l { left: 6px; }
  .dp__tag--r { left: calc(50% + 6px); }

  .pr__pages,
  .oc__specs {
    grid-template-columns: 1fr 1fr;
  }

  .oc__specs div:nth-child(3) {
    border-left: 0;
  }

  .oc__specs div:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }

  .oc__text {
    grid-column: auto;
  }

  .rl__rail {
    grid-auto-columns: 84%;
  }

  .pn__pin {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .pn__legend {
    grid-template-columns: 1fr;
  }

  .lg__count {
    padding: 22px 16px 16px;
  }

  .lg__table th,
  .lg__table td {
    padding-left: 16px;
    padding-right: 16px;
    font-size: 14px;
  }
}
</style>
