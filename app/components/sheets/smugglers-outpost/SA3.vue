<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO, SO2 } from './story'

// PROTOTYPE SA3 (overnight run, Smuggler's Outpost r3): SA2 with the r2 judges' fixes. The final prompt's four
// phrases are underlined and numbered to their pins (prompt ↔ pin ↔ legend); filmstrip and prompt crops fill their
// cells; the wipe is a cinemascope band so it shows on the first scroll (the shell owns the hero's height); copy cut;
// the closing build-up uses the viewport's own solid / wireframe / render, cropped to the subject, so the render
// lands in the same frame. No second video, no extra pinned section. Below: SA2's notes.
// PROTOTYPE SA2 "Concept to canyon, refined" (overnight run, Smuggler's Outpost r2): SA with the r1 judges' fixes.
// Refs: VFX before/after breakdown sliders (BlenderNation environment breakdowns), copy lit word by word (OKTO /
// NIKI Studio, Awwwards), Apple's scroll-scrubbed product sequences for the closing solid → wireframe → render.
// Changes from SA: a keyboard-operable wipe between the AI concept and the render replaces the static diptych (the
// inpainting problem hangs off it); Host Grotesk with tabular figures replaces the system monospace; clean Blender
// renders and the clean concept replace the poster copies with the burned-in title; the build filmstrip shows the
// image cropped out of each process-book page, on black, page number as caption; pins are buttons linked both ways
// with the legend and carry their own problem (red), so the separate problems table is gone; the outcome ends on a
// pinned, scroll-scrubbed solid → wireframe → render of the same shot (stills, no second video). PLACEHOLDER: every
// size, the pin spots, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

// The prompt as runs of words; four phrases point at their pin (index into SO2.pins)
const links = [
  { t: 'carved directly into the rock face', pin: 3 },
  { t: 'Crates of contraband', pin: 4 },
  { t: 'rust-covered landing pad', pin: 2 },
  { t: 'shifting dunes', pin: 1 },
]
const segs: { w: string[], pin?: number, sp?: boolean }[] = []
let rest = SO.prompt
for (const l of links) {
  const at = rest.indexOf(l.t)
  if (at < 0) continue
  if (at) segs.push({ w: rest.slice(0, at).trim().split(' ') })
  rest = rest.slice(at + l.t.length)
  segs.push({ w: l.t.split(' '), pin: l.pin, sp: rest.startsWith(' ') })
}
if (rest.trim()) segs.push({ w: rest.trim().split(' ') })
const phraseOf = (i: number) => links.find(l => l.pin === i)?.t
const pinEls = ref<HTMLElement[]>([])
function goPin(i: number) {
  const el = pinEls.value[i]
  if (!el) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  el.focus({ preventScroll: true })
}
const outro = 'The sound is an ornithopter start-up and Tibetan horns, after Mark Mangini\'s Dune interview. Noise drives the camera shake.'
const B = '/proto-media/smugglers-outpost/'
const cut = ref(50)
const rail = ref<HTMLElement>()
function step(d: number) {
  const r = rail.value
  if (!r) return
  const card = r.querySelector<HTMLElement>('.rl__card')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  r.scrollBy({ left: d * ((card?.offsetWidth ?? 300) + 1), behavior: reduce ? 'auto' : 'smooth' })
}
const hot = ref(-1)
const build = [
  { k: 'Concept', v: SO.pick.text, m: SO2.pages.pick },
  { k: 'Terrain', v: SO.build[0]!.v, m: SO2.pages.terrain },
  { k: 'Cliffs', v: SO.build[1]!.v, m: SO2.pages.cliffs },
  { k: 'Measure', v: SO.build[2]!.v, m: SO2.pages.measure },
  { k: 'Building', v: 'Arch, windows, roof.', m: SO2.pages.arch },
  { k: 'Assembly', v: SO.build[4]!.v, m: SO2.pages.assembly },
]
// The viewport's three passes of one camera, cropped to the outpost and the ornithopter
const seq = [
  { src: `${B}vp-solid.webp`, w: 1504, h: 666, alt: 'The shot in Blender, solid shading', cap: 'Solid' },
  { src: `${B}vp-wire.webp`, w: 1504, h: 666, alt: 'The same shot, wireframe', cap: 'Wireframe' },
  { src: `${B}vp-render.webp`, w: 1204, h: 533, alt: 'The same shot, rendered: the outpost and the ornithopter in sand haze', cap: 'Render' },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the concept/render wipe, then the intro -->
    <section class="ld" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div class="wp" :style="{ '--cut': cut }">
          <img class="wp__base" :src="SO2.render.src" :alt="SO2.render.alt" :width="SO2.render.w" :height="SO2.render.h" decoding="async">
          <div class="wp__top">
            <img :src="SO2.concept.src" :alt="SO2.concept.alt" :width="SO2.concept.w" :height="SO2.concept.h" decoding="async">
          </div>
          <span class="wp__line" aria-hidden="true"><i /></span>
          <span class="wp__tag wp__tag--l" aria-hidden="true">01 · Stable Diffusion</span>
          <span class="wp__tag wp__tag--r" aria-hidden="true">02 · Blender</span>
          <input
            v-model.number="cut"
            class="wp__range"
            type="range"
            min="0"
            max="100"
            step="1"
            aria-label="Wipe between the AI concept (left) and the Blender render (right)"
            :aria-valuetext="`${cut}% concept`"
          >
        </div>
        <p class="wp__note">
          <b>Problem</b> {{ SO2.inpaint }}
        </p>
        <div class="ld__intro">
          <div class="txt">
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
      <div class="pr__head txt">
        <p class="sa__count">
          <b>01</b> The prompt
        </p>
        <p class="sa__text">
          {{ SO.promptText }}
        </p>
      </div>
      <ol class="pr__ladder">
        <li v-for="(l, i) in SO.ladder" :key="l.add">
          <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
          <span class="pr__add"><span class="pr__n">{{ pad(i) }}</span>“<template v-for="(w, j) in l.add.split(' ')" :key="j">{{ j ? ' ' : '' }}<span class="nw">{{ w }}</span></template>”</span>
          <span class="pr__note">{{ l.note }}</span>
        </li>
      </ol>
      <p class="pr__final txt">
        <span class="pr__label">Final prompt <span>· numbered parts are pinned below</span></span>
        <template v-for="(g, i) in segs" :key="i">
          <template v-if="g.pin === undefined">
            <template v-for="(w, j) in g.w" :key="j"><span class="pr__w">{{ w }}</span>{{ ' ' }}</template>
          </template>
          <template v-else>
            <a
              class="pr__ph"
              :class="{ 'is-on': hot === g.pin }"
              :href="`#sa3-pin-${g.pin}`"
              @click.prevent="goPin(g.pin)"
              @mouseenter="hot = g.pin"
              @mouseleave="hot = -1"
            >
              <template v-for="(w, j) in g.w" :key="j"><span class="pr__w">{{ w }}</span>{{ j < g.w.length - 1 ? ' ' : '' }}</template><sup>{{ g.pin + 1 }}</sup>
            </a>{{ g.sp ? ' ' : '' }}
          </template>
        </template>
      </p>
      <div class="pr__models">
        <p class="sa__text txt">
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
        <figure v-for="m in [SO2.pages.structure, SO2.pages.generations, SO2.pages.shortlist]" :key="m.src" class="sc">
          <img :src="m.src" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          <figcaption>{{ m.cap }}</figcaption>
        </figure>
      </div>
    </section>

    <!-- 02 The build: a filmstrip of the images inside the process book -->
    <section class="rl" data-sheet-block="build" aria-label="The Blender build">
      <div class="rl__head">
        <p class="sa__count">
          <b>02</b> The build
        </p>
        <p class="sa__text txt">
          One of four concepts became the base. Then Blender, from scratch.
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
        <li v-for="(b, i) in build" :key="b.k" class="rl__card">
          <figure class="sc">
            <img :src="b.m.src" :alt="b.m.alt" :width="b.m.w" :height="b.m.h" loading="lazy" decoding="async">
            <figcaption>{{ b.m.cap }}</figcaption>
          </figure>
          <p><b>{{ String(i).padStart(2, '0') }}</b> {{ b.k }}<span>{{ b.v }}</span></p>
        </li>
      </ol>
    </section>

    <!-- 03 The scene: the render, pinned; each pin carries the problem met there -->
    <section class="pn" data-sheet-block="scene" aria-label="The scene, part by part">
      <div class="pn__head">
        <p class="sa__count">
          <b>03</b> The scene
        </p>
        <p class="sa__text txt">
          Then the air: an HDRI, a procedural sandstorm, volumetric dust, and depth of field. Problems met are marked in red.
        </p>
      </div>
      <div class="pn__img">
        <img :src="SO2.render.src" :alt="SO2.render.alt" :width="SO2.render.w" :height="SO2.render.h" loading="lazy" decoding="async">
        <button
          v-for="(p, i) in SO2.pins"
          :id="`sa3-pin-${i}`"
          :key="p.k"
          :ref="(el) => { if (el) pinEls[i] = el as HTMLElement }"
          type="button"
          class="pn__pin"
          :class="{ 'is-on': hot === i, 'has-p': p.p }"
          :style="{ left: `${p.x}%`, top: `${p.y}%` }"
          :aria-label="`${i + 1}: ${p.k}`"
          :aria-describedby="`sa3-leg-${i}`"
          @mouseenter="hot = i"
          @mouseleave="hot = -1"
          @focus="hot = i"
          @blur="hot = -1"
          @click="hot = hot === i ? -1 : i"
        >
          {{ i + 1 }}
        </button>
      </div>
      <ol class="pn__legend">
        <li
          v-for="(p, i) in SO2.pins"
          :id="`sa3-leg-${i}`"
          :key="p.k"
          :class="{ 'is-on': hot === i }"
          @mouseenter="hot = i"
          @mouseleave="hot = -1"
        >
          <b>{{ i + 1 }}</b>
          <span>
            <em>{{ p.k }}</em> {{ p.v }}
            <q v-if="phraseOf(i)">{{ phraseOf(i) }}</q>
            <small v-if="p.p"><strong>Problem</strong> {{ p.p }}</small>
          </span>
        </li>
      </ol>
    </section>

    <!-- 04 Outcome: the slate, the four renders, then the shot built back up as you scroll -->
    <section class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <div class="oc__slate">
        <p class="sa__count">
          <b>04</b> Outcome
        </p>
        <dl class="oc__specs">
          <div v-for="s in SO.outcome.specs" :key="s.k">
            <dt>{{ s.k }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
        <div class="oc__text txt">
          <p class="sa__text">
            {{ outro }}
          </p>
          <p class="sa__text oc__after">
            <b>Problem</b> No clear roadmap. Next time I would move to 3D sooner.
          </p>
        </div>
      </div>
      <div class="oc__row">
        <figure v-for="m in SO2.renders" :key="m.src" class="oc__shot">
          <img :src="m.src" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          <figcaption>{{ m.cap }}</figcaption>
        </figure>
      </div>
      <div class="sq">
        <div class="sq__stage">
          <div class="sq__frame">
            <img
              v-for="(m, i) in seq"
              :key="m.src"
              class="sq__img"
              :class="`sq__img--${i}`"
              :src="m.src"
              :alt="m.alt"
              :width="m.w"
              :height="m.h"
              loading="lazy"
              decoding="async"
            >
          </div>
          <ol class="sq__steps" aria-label="The same shot: solid, wireframe, render">
            <li v-for="(m, i) in seq" :key="m.src" :class="`sq__step--${i}`">
              <b>{{ pad(i) }}</b> {{ m.cap }}
            </li>
          </ol>
        </div>
      </div>
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
  font-variant-numeric: tabular-nums;
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

img {
  display: block;
  width: 100%;
  height: auto;
}

/* Lead: fades in a beat after the shell's build, so the words arrive once the hero has landed */
.ld {
  animation: sa-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sa-in {
  from { opacity: 0; }
}

/* The wipe: the concept sits on the render and is cut at --cut%. Only transforms move (the top layer slides one
   way, its image the other), so dragging repaints nothing. */
.wp {
  position: relative;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  background: #000;
}

.wp img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
  object-position: 50% 45%;
}

/* The concept's outpost sits low in its frame */
.wp__top img {
  object-position: 50% 72%;
}

.wp__top,
.wp__line {
  position: absolute;
  inset: 0;
  overflow: hidden;
  transform: translateX(calc((var(--cut) - 100) * 1%));
}

.wp__top img {
  transform: translateX(calc((100 - var(--cut)) * 1%));
}

.wp__line {
  overflow: visible;
  transform: translateX(calc(var(--cut) * 1%));
  pointer-events: none;
}

.wp__line::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: -1px;
  width: 2px;
  background: var(--c-accent);
}

.wp__line i {
  position: absolute;
  top: 50%;
  left: 0;
  width: 36px;
  height: 36px;
  translate: -50% -50%;
  background: var(--c-accent);
  border-radius: 50%;
}

.wp__line i::before,
.wp__line i::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  translate: 0 -50%;
}

.wp__line i::before { left: 7px; border-right-color: var(--c-white); }
.wp__line i::after { right: 7px; border-left-color: var(--c-white); }

.wp__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: pan-y;
}

.wp:has(.wp__range:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.wp__tag {
  position: absolute;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
  pointer-events: none;
}

.wp__tag--l { left: 10px; }
.wp__tag--r { right: 10px; }

.wp__note,
.oc__after {
  margin: 0;
  padding: 12px 24px;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
  border-top: 1px solid var(--rule);
}

.wp__note b,
.oc__after b,
.pn__legend strong {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.oc__after {
  padding: 14px 0 0;
  border-top: 0;
}

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

/* A cropped process-book image on black, its page as the caption */
.sc {
  position: relative;
  margin: 0;
  aspect-ratio: 16 / 9;
  background: #000;
}

.sc img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}

.sc figcaption {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
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

/* Host Grotesk, set tight and technical: medium weight, tabular figures, a touch of tracking */
.pr__add {
  font: 500 clamp(18px, 2.4vw, 28px)/1.2 var(--font-ui);
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  color: var(--c-fg);
}

.pr__n {
  margin-right: 14px;
  font-size: 13px;
  letter-spacing: 0.08em;
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
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.pr__label span {
  color: var(--muted);
}

/* "mega-structure" stays on one line */
.nw {
  white-space: nowrap;
}

/* The four phrases: underlined in red, numbered as their pins; hover lights the pin, a click goes to it */
.pr__ph {
  color: inherit;
  text-decoration: underline 2px var(--c-accent);
  text-underline-offset: 0.14em;
  transition: color 0.2s var(--ease-out);
}

/* Inline (not inline-block) so the link's underline runs under the words */
.pr__ph .pr__w {
  display: inline;
}

.pr__ph sup {
  margin-left: 3px;
  font-size: 0.4em;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.pr__ph.is-on,
.pr__ph:focus-visible {
  color: var(--c-accent);
}

.pr__ph:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

/* Each word lights up as the prompt crosses the view: opacity only, on the compositor (no colour, no reflow) */
@supports (animation-timeline: view()) {
  .pr__w {
    display: inline-block;
  }

  /* Scroll timelines run only once the Sheet is open: attached during the grow or the fold they cost ~80 slow
     frames (they re-resolve every frame while the layer moves) */
  html[data-sheet='open'] .pr__w {
    animation-name: sa-word;
    animation-timing-function: linear;
    animation-fill-mode: both;
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
  font: 500 12px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  border: 1px solid var(--rule);
  border-radius: 999px;
}

.pr__chip--base {
  color: var(--c-accent);
  border-color: currentColor;
}

.pr__pages {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
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

.rl__card p {
  margin: 0;
  padding: 14px 16px 20px;
  font: 600 16px/1.3 var(--font-ui);
}

.rl__card b {
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.rl__card p span {
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
  aspect-ratio: 16 / 9;
  background: #000;
  border-top: 1px solid var(--rule);
}

.pn__img img {
  height: 100%;
  object-fit: cover;
}

.pn__pin {
  position: absolute;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  translate: -50% -50%;
  font: 600 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 50%;
  cursor: pointer;
  transition: scale 0.2s var(--ease-out), background-color 0.2s var(--ease-out), color 0.2s var(--ease-out);
}

.pn__pin.has-p {
  border-color: var(--c-accent);
}

.pn__pin.is-on {
  scale: 1.25;
  color: var(--c-white);
  background: var(--c-accent);
}

.pn__pin:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.pn__legend {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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
  box-shadow: inset 0 2px 0 transparent;
  transition: color 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
}

.pn__legend li.is-on {
  color: var(--c-fg);
  box-shadow: inset 0 2px 0 var(--c-accent);
}

.pn__legend li.is-on b,
.pn__legend li.is-on em {
  color: var(--c-accent);
}

.pn__legend b {
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.pn__legend em {
  display: block;
  font-style: normal;
  font-weight: 600;
  color: var(--c-fg);
  transition: color 0.2s var(--ease-out);
}

.pn__legend li:last-child {
  grid-column: span 2;
}

.pn__legend q {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--c-fg);
  text-decoration: underline 1px var(--c-accent);
  text-underline-offset: 0.18em;
}

.pn__key i {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  vertical-align: -1px;
  border: 1px solid var(--c-accent);
  border-radius: 50%;
}

.pn__legend small {
  display: block;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.45;
}

/* 04 Outcome */
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
  font: 600 18px/1.2 var(--font-ui);
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
}

.oc__text {
  grid-column: 2;
}

.oc__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.oc__shot {
  margin: 0;
  background: var(--c-bg);
}

.oc__shot img {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.oc__shot figcaption {
  padding: 8px 12px 12px;
  font: 500 12px/1.3 var(--font-ui);
  color: var(--muted);
}

/* The shot built back up: pinned under the header while its run scrolls past; solid, then wireframe, then render
   fade in on top (opacity only). Without scroll timelines it is a still of the render with the three steps listed. */
.sq {
  border-top: 1px solid var(--rule);
}

.sq__stage {
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
}

.sq__frame {
  position: relative;
  aspect-ratio: 1504 / 666;
  overflow: hidden;
  background: #000;
}

.sq__img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}

.sq__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--c-bg);
  border-top: 1px solid var(--rule);
}

.sq__steps li {
  padding: 16px 24px 18px;
  font: 600 clamp(15px, 1.8vw, 22px)/1.3 var(--font-ui);
}

.sq__steps li + li {
  border-left: 1px solid var(--rule);
}

.sq__steps b {
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

@supports (animation-timeline: view()) {
  .sq {
    height: calc(var(--view-h) + 120svh);
    view-timeline: --sq block;
    view-timeline-inset: var(--header-h) 0;
  }

  .sq__stage {
    position: sticky;
    top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
    height: var(--view-h);
  }

  .sq__img--1,
  .sq__img--2 {
    opacity: 0;
  }

  .sq__steps li {
    opacity: 0.35;
  }

  html[data-sheet='open'] .sq__img--1,
  html[data-sheet='open'] .sq__img--2,
  html[data-sheet='open'] .sq__steps li {
    animation-name: sq-in;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: --sq;
  }

  .sq__img--1 { animation-range: contain 15% contain 40%; }
  .sq__img--2 { animation-range: contain 55% contain 80%; }

  .sq__steps .sq__step--0 { animation-range: contain 0% contain 15%; }
  .sq__steps .sq__step--1 { animation-range: contain 15% contain 40%; }
  .sq__steps .sq__step--2 { animation-range: contain 55% contain 80%; }
}

@keyframes sq-in {
  to { opacity: 1; }
}


@media (prefers-reduced-motion: reduce) {
  .ld { animation-duration: 1ms; }
  html[data-sheet='open'] .pr__w { animation-name: none; }
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

  /* The right padding keeps body copy clear of the shell's floating close button on phones */
  .ld__intro,
  .pr__head,
  .rl__head,
  .pn__head,
  .pr__models,
  .oc__slate {
    padding: 22px 52px 22px 16px;
  }

  .pr__ladder {
    padding: 0 52px 0 16px;
  }

  .pr__final {
    padding: 28px 52px 32px 16px;
  }

  .wp__note {
    padding: 12px 52px 12px 16px;
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

  .wp__tag {
    bottom: 6px;
    padding: 3px 6px;
  }

  .wp__tag--l { left: 6px; }
  .wp__tag--r { right: 6px; }

  .wp__line i {
    width: 28px;
    height: 28px;
  }

  .pr__pages {
    grid-template-columns: minmax(0, 1fr);
  }

  .oc__specs,
  .oc__row {
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

  .pn__legend li:last-child {
    grid-column: auto;
  }

  .pn__key {
    display: none !important;
  }

  .sq__steps li {
    padding: 12px 10px 14px;
    font-size: 13px;
  }

  .sq__stage {
    grid-template-rows: auto auto;
    align-content: center;
  }

  .wp {
    aspect-ratio: 16 / 10;
  }
}
</style>
