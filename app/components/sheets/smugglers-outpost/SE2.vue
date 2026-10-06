<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO, SO2 } from './story'

// PROTOTYPE SE2 "One frame, refined" (overnight run, Smuggler's Outpost r3): SE with the r2 judges' fixes.
// Refs: Apple's scroll-scrubbed product pages (one pinned frame that changes as you scroll); Figure Film and Archi
// Malin (Awwwards Creative Pass, scroll-driven video stages); Rejouice for the quiet type around it; SD's
// prompt-to-place, folded into the pull quote.
// Changes from SE: a square stage on phones with a per-frame focus (object-position) that keeps the building in;
// the quote's underlined phrases jump the stage to the frame where each was built; the Air frame is a full-bleed
// crop of the volumetric-dust render (no letterboxed collage); the outcome opens on the pull-back, not the hero
// shot; one-clause snags. The morph stays opacity only. PLACEHOLDER: every size, the stage order, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const dust = { src: '/proto-media/smugglers-outpost/x-dust.webp', w: 1092, h: 537, alt: 'Volumetric dust drifting through the canyon, a Blender render' }
// pos: the frame's focus on desktop; posM: on the phone's square stage
const stages = [
  { k: 'Prompt', v: 'Prompt grids in Stable Diffusion. “Monolithic” pushed it abstract.', m: SO2.pages.generations, fit: 'contain' },
  { k: 'Concept', v: 'One of four became the base. No landing pad, no deep dunes.', s: 'Inpainting them in looked disconnected.', m: SO2.concept, posM: '62% 60%' },
  { k: 'Measure', v: 'Measured over the concept in Photoshop.', s: 'Object scaling.', m: SO2.pages.measure, fit: 'contain' },
  { k: 'Solid', v: 'Displaced terrain. Cliffs sculpted, twice.', m: SO2.solid, pos: '64% 45%', posM: '66% 45%' },
  { k: 'Wireframe', v: 'The building: arch, windows, roof.', s: 'The arch failed until inset plus bevel.', m: SO2.wire, pos: '64% 45%', posM: '66% 45%' },
  { k: 'Air', v: 'A procedural sandstorm and volumetric dust.', s: 'Good desert HDRIs were hard to find.', m: dust, pos: '50% 40%', posM: '60% 40%' },
  { k: 'Render', v: 'Depth of field hides the modelling flaws.', s: 'Stretched UVs and slow renders.', m: SO2.render, pos: '70% 50%', posM: '78% 50%' },
] as { k: string, v: string, s?: string, m: typeof SO2.render, fit?: string, pos?: string, posM?: string }[]
const [r1, r2, r3, r4] = SO2.renders as [typeof SO2.render, typeof SO2.render, typeof SO2.render, typeof SO2.render]

const outro = 'The sound is an ornithopter start-up and Tibetan horns, after Mark Mangini\'s Dune interview. Noise drives the camera shake.'
const snag = 'No clear roadmap. Next time I would move to 3D sooner.'

// The prompt, cut into plain runs and the four phrases that jump the stage to where each was built
const links = [
  { t: 'carved directly into the rock face', to: 3 },
  { t: 'Crates of contraband', to: 4 },
  { t: 'rust-covered landing pad', to: 4 },
  { t: 'shifting dunes', to: 5 },
]
const segs: { t: string, to?: number }[] = []
let rest = SO.prompt
for (const l of links) {
  const at = rest.indexOf(l.t)
  if (at < 0) continue
  if (at) segs.push({ t: rest.slice(0, at) })
  segs.push(l)
  rest = rest.slice(at + l.t.length)
}
if (rest) segs.push({ t: rest })

// Scroll the Sheet so the pinned run sits at stage i (the middle of its caption's slot below)
const run = ref<HTMLElement>()
function jump(i: number) {
  const el = run.value
  const sc = el?.closest<HTMLElement>('[data-sheet-layer]')
  if (!el || !sc) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!CSS.supports('animation-timeline: view()')) {
    el.querySelectorAll('.st__img')[i]?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
    return
  }
  const head = Number.parseFloat(getComputedStyle(el).getPropertyValue('--header-h')) || 64
  const rr = el.getBoundingClientRect()
  const sr = sc.getBoundingClientRect()
  const p = i === stages.length - 1 ? 0.92 : (14 * i + 7) / 100
  const top = sr.top + head - p * (rr.height - (sr.height - head))
  sc.scrollBy({ top: rr.top - top, behavior: reduce ? 'auto' : 'smooth' })
}
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
      <div ref="run" class="st__run">
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
              :style="{ '--pos': s.pos ?? '50% 50%', '--pos-m': s.posM ?? s.pos ?? '50% 50%' }"
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
        <!-- One line on purpose: Vue would turn the line breaks into spaces before the commas -->
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
        <p>“<template v-for="(g, i) in segs" :key="i"><button v-if="g.to !== undefined" type="button" class="pq__ph" :aria-label="`${g.t}: show the ${stages[g.to]!.k} frame`" @click="jump(g.to)">{{ g.t }}<sup>{{ String(g.to + 1).padStart(2, '0') }}</sup></button><template v-else>{{ g.t }}</template></template>”</p>
      </blockquote>
      <p class="se__text pq__foot txt">
        Three base models, six checkpoints. The wording mattered most.
      </p>
    </section>

    <!-- 03 Outcome: the pull-back first (not the hero shot), then the other three and the slate -->
    <section class="ot" data-sheet-block="outcome" aria-label="Outcome">
      <figure class="ot__big">
        <img :src="r4.src" :alt="r4.alt" :width="r4.w" :height="r4.h" loading="lazy" decoding="async">
        <figcaption><b>04</b> {{ r4.cap }}</figcaption>
      </figure>
      <div class="ot__row">
        <figure v-for="(m, i) in [r1, r2, r3]" :key="m.src">
          <img :src="m.src" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          <figcaption><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ m.cap }}</figcaption>
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
            {{ outro }}
          </p>
          <p class="st__snag ot__next">
            <strong>Snag</strong> {{ snag }}
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
  object-position: var(--pos);
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

/* Each underlined phrase is a button: it jumps the pinned frame to the stage it was built in (the red number) */
.pq__ph {
  padding: 0;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: inherit;
  text-decoration: underline 2px var(--c-accent);
  text-underline-offset: 0.14em;
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 0.2s var(--ease-out);
}

.pq__ph sup {
  margin-left: 3px;
  font-size: 0.36em;
  font-weight: 600;
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

@media (hover: hover) {
  .pq__ph:hover {
    color: var(--c-accent);
  }
}

.pq__ph:focus-visible {
  color: var(--c-accent);
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
  border-radius: 2px;
}

.pq__pivot {
  margin: 0 0 18px;
  font: 600 clamp(16px, 1.6vw, 20px)/1.2 var(--font-ui);
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

    /* A square frame fills the phone's width; each frame keeps its subject in (object-position per stage) */
    .st__frame {
      aspect-ratio: 1 / 1;
    }

    .st__img {
      object-position: var(--pos-m);
    }

    .st__caps {
      min-height: 168px;
    }
  }
}
</style>
