<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO, SO2, SO_PLACE, SO_TRIES } from './story'

// PROTOTYPE SD "X-ray" (overnight run, Smuggler's Outpost r2 challenger).
// Refs: VFX breakdown reveals, where a lens shows the wireframe under the final frame (BlenderNation environment
// breakdowns; Lusion's interactive project heroes); MOUNT inc's "Perfect Days" and Elementis (Awwwards) for the
// vertical scroll that drives a horizontal chapter; editors' proof marks for the problems crossed off.
// Beats, each its own device: an X-ray lens over the render (pointer, touch or arrow keys; wireframe or solid) →
// the prompt, its phrases numbered and matched to crops of the concept and the render (what the AI gave, what was
// built) → the Blender build as a reel that the page scroll slides sideways → the problems crossed off → a bento of
// the outcome with the viewport film. PLACEHOLDER: every size, the crops, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

// The lens: its centre in % of the frame, moved by pointer, touch (drag sideways) or the arrow keys
const lens = ref<HTMLElement>()
const pos = reactive({ x: 60, y: 50 })
const pass = ref<'wire' | 'solid'>('wire')
let raf = 0
function move(e: PointerEvent) {
  const el = lens.value
  if (!el || (e.pointerType !== 'mouse' && !e.buttons && e.type === 'pointermove')) return
  const r = el.getBoundingClientRect()
  const x = ((e.clientX - r.left) / r.width) * 100
  const y = ((e.clientY - r.top) / r.height) * 100
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    pos.x = Math.min(100, Math.max(0, x))
    pos.y = Math.min(100, Math.max(0, y))
  })
}
function key(e: KeyboardEvent) {
  const d = e.shiftKey ? 10 : 4
  const m: Record<string, [number, number]> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }
  const v = m[e.key]
  if (!v) return
  e.preventDefault()
  pos.x = Math.min(100, Math.max(0, pos.x + v[0]))
  pos.y = Math.min(100, Math.max(0, pos.y + v[1]))
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

// The final prompt split around the four phrases that became places
const parts = computed(() => {
  const out: { t: string, n?: number }[] = []
  let rest = SO.prompt
  SO_PLACE.forEach((p, i) => {
    const at = rest.indexOf(p.phrase)
    if (at < 0) return
    if (at) out.push({ t: rest.slice(0, at) })
    out.push({ t: p.phrase, n: i + 1 })
    rest = rest.slice(at + p.phrase.length)
  })
  if (rest) out.push({ t: rest })
  return out
})

const reel = [
  { k: 'Shortlist', v: 'Four concepts; one became the base.', m: SO2.pages.shortlist },
  { k: 'Measure', v: SO.build[2]!.v, m: SO2.pages.measure },
  { k: 'Terrain', v: SO.build[0]!.v, m: SO2.pages.terrain },
  { k: 'Cliffs', v: SO.build[1]!.v, m: SO2.pages.cliffs },
  { k: 'Building', v: 'Arch, windows, roof.', m: SO2.pages.arch },
  { k: 'Assembly', v: SO.build[4]!.v, m: SO2.pages.assembly },
  { k: 'Sandstorm', v: SO.air[1]!.v, m: SO2.pages.sandstorm },
  { k: 'Dust', v: SO.air[3]!.v, m: SO2.pages.dust },
  { k: 'Camera', v: 'Depth of field, to hide modelling flaws.', m: SO2.pages.camera },
]
const [r1, r2, r3, r4] = SO2.renders as [typeof SO2.render, typeof SO2.render, typeof SO2.render, typeof SO2.render]
void r1
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the X-ray lens over the render, then the intro -->
    <section class="xr" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div
          ref="lens"
          class="xr__frame"
          :style="{ '--x': `${pos.x}%`, '--y': `${pos.y}%` }"
          tabindex="0"
          role="group"
          aria-roledescription="X-ray"
          :aria-label="`The render, with an X-ray lens showing the ${pass === 'wire' ? 'wireframe' : 'solid shading'} under it. Arrow keys move the lens.`"
          @pointermove="move"
          @pointerdown="move"
          @keydown="key"
        >
          <img class="xr__img" :src="SO2.render.src" :alt="SO2.render.alt" :width="SO2.render.w" :height="SO2.render.h" decoding="async">
          <img
            class="xr__img xr__in"
            :src="pass === 'wire' ? SO2.wire.src : SO2.solid.src"
            alt=""
            :width="SO2.wire.w"
            :height="SO2.wire.h"
            decoding="async"
          >
          <span class="xr__ring" aria-hidden="true" />
        </div>
        <div class="xr__bar">
          <p class="xr__hint">
            Move over the render to see under it
          </p>
          <div class="xr__pass" role="group" aria-label="What the lens shows">
            <button type="button" :aria-pressed="pass === 'wire'" @click="pass = 'wire'">
              Wireframe
            </button>
            <button type="button" :aria-pressed="pass === 'solid'" @click="pass = 'solid'">
              Solid
            </button>
          </div>
        </div>
        <div class="xr__intro">
          <div class="txt">
            <h2 class="sd__k">
              {{ SO.title }}
            </h2>
            <p class="xr__hook">
              {{ SO.hook }}
            </p>
            <p class="sd__text">
              {{ SO.intro }}
            </p>
          </div>
          <dl class="xr__meta">
            <div v-for="c in SO.meta" :key="c.k">
              <dt>{{ c.k }}</dt>
              <dd>{{ c.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- 01 Prompt to place: the phrases, numbered, each matched to what the AI gave and what was built -->
    <section class="pl" data-sheet-block="prompt" aria-label="From prompt to place">
      <div class="sd__head txt">
        <p class="sd__count">
          <b>01</b> Prompt to place
        </p>
        <p class="sd__text">
          {{ SO.promptText }} Three base models and six checkpoints gave similar results, so the wording mattered most.
        </p>
      </div>
      <p class="pl__prompt txt">
        <template v-for="(p, i) in parts" :key="i">
          <mark v-if="p.n" class="pl__mark">{{ p.t }}<sup>{{ p.n }}</sup></mark>
          <span v-else>{{ p.t }}</span>
        </template>
      </p>
      <ol class="pl__grid">
        <li v-for="(p, i) in SO_PLACE" :key="p.phrase" class="pl__col">
          <p class="pl__n">
            <b>{{ i + 1 }}</b> {{ p.phrase }}
          </p>
          <figure class="pl__pair">
            <div class="pl__c" :class="{ 'pl__c--none': !p.c }">
              <img v-if="p.c" :src="p.c.src" :alt="p.c.alt" :width="p.c.w" :height="p.c.h" loading="lazy" decoding="async">
              <span>{{ p.c ? 'Concept' : 'Concept: —' }}</span>
            </div>
            <div class="pl__r">
              <img :src="p.r.src" :alt="p.r.alt" :width="p.r.w" :height="p.r.h" loading="lazy" decoding="async">
              <span>Render</span>
            </div>
            <figcaption>{{ p.note }}</figcaption>
          </figure>
        </li>
      </ol>
    </section>

    <!-- 02 The build: a reel the scroll slides sideways (a plain sideways rail without scroll timelines) -->
    <section class="rv" data-sheet-block="build" aria-label="The Blender build">
      <div class="rv__run">
        <div class="rv__stage">
          <div class="sd__head rv__head txt">
            <p class="sd__count">
              <b>02</b> The build
            </p>
            <p class="sd__text">
              Blender from scratch, over the concept: land, rock, building, then the air.
            </p>
          </div>
          <div class="rv__view">
            <ol class="rv__track" tabindex="0" aria-label="Build steps">
              <li v-for="(b, i) in reel" :key="b.k" class="rv__card">
                <figure class="rv__pic">
                  <img :src="b.m.src" :alt="b.m.alt" :width="b.m.w" :height="b.m.h" loading="lazy" decoding="async">
                </figure>
                <p><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ b.k }} <span>{{ b.v }}</span><small>{{ b.m.cap }}</small></p>
              </li>
            </ol>
          </div>
          <div class="rv__prog" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </section>

    <!-- 03 Problems, crossed off -->
    <section class="tr" data-sheet-block="problems" aria-label="Problems met">
      <div class="sd__head txt">
        <p class="sd__count">
          <b>03</b> Problems met
        </p>
        <p class="sd__text">
          Crossed off where something fixed it.
        </p>
      </div>
      <ul class="tr__list">
        <li v-for="t in SO_TRIES" :key="t.a" :class="{ 'is-open': t.open }">
          <s v-if="!t.open">{{ t.a }}</s>
          <span v-else class="tr__a">{{ t.a }}</span>
          <span class="tr__b">{{ t.open ? (t.b ? `Open · ${t.b}` : 'Open') : t.b }}</span>
        </li>
      </ul>
    </section>

    <!-- 04 Outcome: a bento of the renders, the viewport film and the slate -->
    <section class="bt" data-sheet-block="outcome" aria-label="Outcome">
      <figure class="bt__a">
        <img :src="r2.src" :alt="r2.alt" :width="r2.w" :height="r2.h" loading="lazy" decoding="async">
        <figcaption>{{ r2.cap }}</figcaption>
      </figure>
      <figure class="bt__b">
        <img :src="r3.src" :alt="r3.alt" :width="r3.w" :height="r3.h" loading="lazy" decoding="async">
        <figcaption>{{ r3.cap }}</figcaption>
      </figure>
      <SheetPic class="bt__c" :m="SO.viewport" cap />
      <figure class="bt__d">
        <img :src="r4.src" :alt="r4.alt" :width="r4.w" :height="r4.h" loading="lazy" decoding="async">
        <figcaption>{{ r4.cap }}</figcaption>
      </figure>
      <div class="bt__e txt">
        <p class="sd__count">
          <b>04</b> Outcome
        </p>
        <p class="bt__big">
          4 renders. A 10s film, rendered over 6 hours.
        </p>
        <p class="sd__text">
          {{ SO.outcome.text }}
        </p>
        <p class="sd__text bt__after">
          {{ SO.outcome.after }}
        </p>
      </div>
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.sd__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sd__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.sd__k {
  margin: 0 0 16px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sd__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.sd__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 16px 24px;
  align-items: start;
  padding: 28px 24px;
}

img {
  display: block;
  width: 100%;
  height: auto;
}

/* Lead: fades in a beat after the shell's build */
.xr {
  animation: sd-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sd-in {
  from { opacity: 0; }
}

/* The X-ray: the pass under the render shows through a circle that follows the pointer */
.xr__frame {
  --r: clamp(70px, 14vw, 150px);

  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
  cursor: crosshair;
  touch-action: pan-y;
  outline-offset: -3px;
}

.xr__img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}

.xr__in {
  clip-path: circle(var(--r) at var(--x) var(--y));
}

.xr__ring {
  position: absolute;
  top: var(--y);
  left: var(--x);
  width: calc(var(--r) * 2);
  height: calc(var(--r) * 2);
  border: 2px solid var(--c-accent);
  border-radius: 50%;
  translate: -50% -50%;
  pointer-events: none;
}

.xr__bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  border-top: 1px solid var(--rule);
}

.xr__hint {
  margin: 0;
  font: 500 12px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--muted);
}

.xr__pass {
  display: flex;
  gap: 4px;
}

.xr__pass button {
  padding: 6px 12px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--muted);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s var(--ease-out), border-color 0.2s var(--ease-out);
}

.xr__pass button[aria-pressed='true'] {
  color: var(--c-fg);
  border-color: var(--c-accent);
}

.xr__intro {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.xr__hook {
  margin: 0 0 16px;
  font: 600 34px/1.15 var(--font-ui);
  letter-spacing: -0.015em;
}

.xr__meta {
  margin: 0;
  border-left: 1px solid var(--rule);
}

.xr__meta div {
  padding: 8px 0 10px 20px;
}

.xr__meta div + div {
  border-top: 1px solid var(--rule);
}

.xr__meta dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.xr__meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* 01 Prompt to place */
.pl {
  border-top: 1px solid var(--rule);
}

.pl__prompt {
  margin: 0;
  padding: 8px 24px 36px;
  font: 600 clamp(22px, 3.2vw, 40px)/1.22 var(--font-ui);
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--c-fg) 45%, transparent);
}

.pl__mark {
  color: var(--c-fg);
  background: none;
  text-decoration: underline 2px var(--c-accent);
  text-underline-offset: 0.18em;
}

.pl__mark sup {
  margin-left: 2px;
  font-size: 0.42em;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.pl__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.pl__col {
  display: grid;
  grid-template-rows: auto 1fr;
  background: var(--c-bg);
}

.pl__n {
  margin: 0;
  padding: 14px 16px;
  font: 600 14px/1.35 var(--font-ui);
}

.pl__n b {
  margin-right: 6px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.pl__pair {
  display: grid;
  grid-template-rows: auto auto 1fr;
  margin: 0;
}

.pl__c,
.pl__r {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--fill);
}

.pl__c {
  width: 50%;
  margin: 0 0 1px;
}

.pl__c img,
.pl__r img {
  height: 100%;
  object-fit: cover;
}

.pl__c span,
.pl__r span {
  position: absolute;
  left: 8px;
  bottom: 8px;
  padding: 3px 7px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.pl__c--none span {
  top: 8px;
  bottom: auto;
}

.pl__pair figcaption {
  padding: 12px 16px 18px;
  font: 400 14px/1.45 var(--font-ui);
  color: var(--muted);
}

/* 02 The reel: pinned under the header while its run scrolls past; the track slides left (transform only) */
.rv {
  --sw: min(1040px, 100vw - 32px); /* the Sheet's width (the shell's --panel-w, resolved against the viewport) */

  border-top: 1px solid var(--rule);
}

.rv__view {
  overflow-x: auto;
  scrollbar-width: none;
  border-top: 1px solid var(--rule);
}

.rv__view::-webkit-scrollbar {
  display: none;
}

.rv__track {
  display: flex;
  gap: 1px;
  width: max-content;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  outline-offset: -3px;
}

.rv__card {
  width: min(560px, 72vw);
  background: var(--c-bg);
}

.rv__pic {
  margin: 0;
  aspect-ratio: 16 / 10;
  padding: 12px;
  background: #000;
}

.rv__pic img {
  height: 100%;
  object-fit: contain;
}

.rv__card p {
  margin: 0;
  padding: 14px 16px 18px;
  font: 600 16px/1.35 var(--font-ui);
}

.rv__card b {
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.rv__card span {
  font-weight: 400;
  color: var(--muted);
}

.rv__card small {
  display: block;
  margin-top: 6px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.rv__prog {
  display: none;
}

@supports (animation-timeline: view()) {
  .rv__run {
    height: calc(var(--view-h) + 160svh);
    view-timeline: --rv block;
    view-timeline-inset: var(--header-h) 0;
  }

  .rv__stage {
    position: sticky;
    top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    grid-template-columns: minmax(0, 1fr);
    height: var(--view-h);
    overflow: clip;
  }

  .rv__view {
    display: flex;
    align-items: center;
    overflow: visible;
  }

  .rv__card {
    width: min(720px, calc(var(--sw) * 0.62));
  }

  .rv__prog {
    display: block;
    height: 2px;
    background: var(--rule);
  }

  .rv__prog i {
    display: block;
    height: 100%;
    background: var(--c-accent);
    transform-origin: 0 50%;
    transform: scaleX(0);
  }

  /* Scroll timelines run only once the Sheet is open: attached during the grow or the fold they cost ~80 slow
     frames (they re-resolve every frame while the layer moves) */
  html[data-sheet='open'] .rv__track,
  html[data-sheet='open'] .rv__prog i {
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: --rv;
    animation-range: contain 8% contain 92%;
  }

  html[data-sheet='open'] .rv__track { animation-name: sd-reel; }
  html[data-sheet='open'] .rv__prog i { animation-name: sd-prog; }
}

@keyframes sd-reel {
  to { transform: translateX(calc(-100% + var(--sw) - 2px)); }
}

@keyframes sd-prog {
  from { transform: scaleX(0); }
}

/* 03 Problems, crossed off */
.tr {
  border-top: 1px solid var(--rule);
}

.tr__list {
  margin: 0;
  padding: 0 24px 24px;
  list-style: none;
}

.tr__list li {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 6px 24px;
  align-items: baseline;
  padding: 14px 0 16px;
  border-top: 1px solid var(--rule);
}

.tr__list s,
.tr__a {
  font: 600 clamp(18px, 2.2vw, 26px)/1.25 var(--font-ui);
  letter-spacing: -0.01em;
}

.tr__list s {
  color: var(--muted);
  text-decoration: line-through 2px var(--c-accent);
}

.tr__b {
  font: 400 15px/1.5 var(--font-ui);
  color: var(--c-fg);
}

.is-open .tr__b {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

/* 04 Outcome: the bento */
.bt {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.bt figure {
  position: relative;
  margin: 0;
  background: #000;
}

.bt figure img {
  height: 100%;
  object-fit: cover;
}

.bt figcaption {
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

.bt__a {
  grid-column: span 2;
  grid-row: span 2;
}

.bt__b,
.bt__c,
.bt__d {
  aspect-ratio: 16 / 9;
}

.bt__e {
  grid-column: span 2;
  padding: 24px;
  background: var(--c-bg);
}

.bt__big {
  margin: 14px 0 12px;
  font: 600 clamp(22px, 2.6vw, 32px)/1.2 var(--font-ui);
  letter-spacing: -0.015em;
}

.bt__after {
  margin-top: 10px;
}

@media (prefers-reduced-motion: reduce) {
  .xr { animation-duration: 1ms; }
}

@media (max-width: 720px) {
  .sd__head,
  .xr__intro,
  .tr__list li {
    grid-template-columns: minmax(0, 1fr);
  }

  /* The right padding keeps body copy clear of the shell's floating close button on phones */
  .sd__head,
  .xr__intro {
    padding: 22px 52px 22px 16px;
  }

  .pl__prompt {
    padding: 4px 52px 28px 16px;
  }

  .tr__list {
    padding: 0 52px 16px 16px;
  }

  .xr__bar {
    padding: 10px 16px;
  }

  .xr__hook {
    font-size: 26px;
  }

  .xr__meta {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .xr__meta div {
    padding-left: 0;
  }

  .pl__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .bt {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .bt__a,
  .bt__e {
    grid-column: span 2;
    grid-row: auto;
  }

  .bt__a {
    aspect-ratio: 16 / 9;
  }

  .bt__d {
    grid-column: span 2;
  }

  .bt__e {
    padding: 22px 52px 22px 16px;
  }
}

@media (max-width: 720px) and (min-width: 0) {
  @supports (animation-timeline: view()) {
    .rv__card {
      width: calc(var(--sw) * 0.78);
    }
  }
}
</style>
