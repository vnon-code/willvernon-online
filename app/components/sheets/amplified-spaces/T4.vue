<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import AsCompare from './AsCompare.vue'

// PROTOTYPE T4 "Stage and swap, refined" (overnight run, Amplified Spaces round 2): T1 with the round-1 judges' seven
// changes (matrix.md): the shared head (the rooms strip in its `before` slot, cropped to fill the tiles), contents
// and 01–05 numbering; a short Discover beat (Tom and the brief's question); Develop cut to two lines, its film strip
// filling the pinned view (no dead band); the rooms' stage filling the view (no void above it), with Fading Away's
// visual / room slider inside it; the close is the B17 final-crit video, after the problems.
// Refs: Kenta Toshikura (T's oversized type, counted beats); Apple-style scrollytelling (a pinned stage whose
// captions swap); Lusion / Obys case studies (a film strip pinned to the scroll); product pages' before/after.
// PLACEHOLDER: every size, the pan length, the crop, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

// T4's copy (Will, 2026-10-07: minimal and brutalist). Overrides the story's strings for T4 only. Facts from the
// process book (.scratch/v1-launch/amplified-spaces-story.md). The licence cap and the beat-detection fix appear
// once, in Problems. PLACEHOLDER copy, not approved by Will.
const COPY = {
  _status: 'PLACEHOLDER copy, not approved by Will',
  hook: 'Three of Tom Vernon\'s tracks. A visual for each, and a room to show it in.',
  question: 'How can a visual carry a track\'s mood?',
  discover: 'Tom and I picked three of his tracks.',
  develop: 'Blender particles first, split into low, mid and high. Then TouchDesigner: GPU particles, topography, mycelium.',
  define: ['TouchDesigner', 'makes the visual.', 'Blender', 'builds the room.'],
  defineText: 'A fourth track, Healing Process, was made and dropped.',
  tracks: {
    'onjuku': { sound: 'Ambient, no kicks. Nothing for a visual to hit on.', visual: 'The album art, displaced. Time turns it, not the audio.', room: 'Wrapped round a sphere above a ring. It ended up looking like a planet.' },
    'fading-away': { sound: 'A steady kick all the way through.', visual: 'The spectrum through a gradient sampled from the album art.', room: 'One long screen for the whole spectrum. Yellow light.' },
    'b17': { sound: 'Lo-fi.', visual: 'Circles that swell with the volume, inside a CRT.', room: 'Narrow room, blue light, brighter screen.' },
  } as Record<string, { sound: string, visual: string, room: string }>,
  problems: [
    'Built-in beat detection missed kicks. I built my own.',
    'The free TouchDesigner licence caps output at 1280×1280.',
    'The CRT look for B17 was a struggle: RGB split, hexagon pixels, lens distortion, bloom.',
    'Cut mirror and text overlays. Too generic.',
  ],
  outcome: 'A splash and four renders per track. B17 got a video for the final crit.',
}

const story = computed(() => props.sheet.card.story!)
const tracks = computed(() => story.value.tracks.map(t => ({ ...t, ...COPY.tracks[t.id] })))
const phase = (id: string) => story.value.process.find(p => p.id === id)
const tom = computed(() => phase('discover')?.media[0])
const develop = computed(() => phase('develop'))
// The film strip runs in two rows that fill the pinned view under the head: odd frames on top, even below
const film = computed(() => {
  const m = (develop.value?.media ?? []).map((x, i) => ({ m: x, i }))
  return [m.filter(x => x.i % 2 === 0), m.filter(x => x.i % 2 === 1)]
})
const handoff = computed(() => phase('define')?.media.find(m => m.src.includes('p53')))
const crit = computed(() => story.value.outcome?.media.find(m => m.type === 'video'))

// The shared head and numbering: the sections in order; the info from the story's credits (the module's trailing
// year split off as the year)
const S = useSheetSections('as4', [
  { id: 'discover', label: 'Discover' },
  { id: 'develop', label: 'Develop' },
  { id: 'define', label: 'Define' },
  { id: 'deliver', label: 'Three rooms' },
  { id: 'problems', label: 'Problems' },
])
const sec = S.sec
const info = computed(() => {
  const c = (k: string) => story.value.credits.find(x => x.k === k)?.v
  const [module, year] = (c('Module') ?? '').split(/,\s*(?=\d{4}$)/)
  return { year, module: module || undefined, client: c('Client'), role: c('Role'), tools: c('Tools') }
})

// The rooms strip under the hero: a tile jumps to its track on the stage
const stepId = (id: string) => `as4-${id}`
function goStep(id: string) {
  const el = document.getElementById(stepId(id))
  if (!el) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

// The swap: which track's words are in the middle of the view; the stage follows. One <video> inset on the stage, its
// source swapped, playing only while the stage is on screen. Fading Away's turn swaps the inset for the slider.
const CMP = 'fading-away'
const active = ref(0)
const now = computed(() => tracks.value[active.value]!)
const stage = ref<HTMLElement>()
const vid = ref<HTMLVideoElement>()
const steps = ref<HTMLElement[]>([])
let seen = false
const ios: IntersectionObserver[] = []
function play() {
  const v = vid.value
  if (!v) return
  if (seen) v.play().catch(() => {})
  else v.pause()
}
watch(active, () => nextTick(play))
onMounted(() => {
  const root = stage.value?.closest<HTMLElement>('[data-sheet-layer]') ?? null
  const pick = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i)
  }, { root, rootMargin: '-45% 0px -45% 0px' })
  steps.value.forEach(el => pick.observe(el))
  const view = new IntersectionObserver(([e]) => {
    seen = !!e?.isIntersecting
    play()
  }, { root, threshold: 0.2 })
  if (stage.value) view.observe(stage.value)
  ios.push(pick, view)
})
onBeforeUnmount(() => ios.forEach(io => io.disconnect()))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="story.title" :hook="COPY.hook" :info="info">
      <!-- The three rooms meeting the hero edge to edge, cropped to the lit room; a tile jumps to its track -->
      <template #before>
        <nav class="rs" :style="{ '--n': tracks.length }" aria-label="Rooms">
          <a v-for="(t, i) in tracks" :key="t.id" class="rs__tile" :href="`#${stepId(t.id)}`" @click.prevent="goStep(t.id)">
            <SheetPic v-if="t.splash" :m="t.splash" />
            <span class="rs__label"><b>{{ pad(i) }}</b> {{ t.title }}</span>
          </a>
        </nav>
      </template>
    </SheetHead>

    <!-- 01 Discover: Tom, and the brief's question -->
    <section class="dq" v-bind="sec('discover')" data-sheet-block="discover">
      <SheetPic v-if="tom" class="dq__pic" :m="tom" cap />
      <div class="dq__words">
        <SheetSectionNo id="discover" />
        <p class="dq__q">
          {{ COPY.question }}
        </p>
        <p class="t4__text">
          {{ COPY.discover }}
        </p>
      </div>
    </section>

    <!-- 02 Develop: the experiments, a film strip panning sideways while pinned -->
    <section v-if="develop" class="fm" v-bind="sec('develop')" data-sheet-block="develop">
      <div class="fm__run" data-progress>
        <div class="fm__stage">
          <div class="fm__head">
            <div>
              <SheetSectionNo id="develop" />
              <p class="fm__type" aria-hidden="true">
                Develop
              </p>
            </div>
            <p class="t4__text fm__text">
              {{ COPY.develop }}
            </p>
          </div>
          <div class="fm__track">
            <ol v-for="(row, r) in film" :key="r" class="fm__row">
              <li v-for="x in row" :key="x.m.src" class="fm__cell" :style="{ '--a': x.m.aspect ?? 16 / 9 }">
                <SheetPic :m="x.m" />
                <p class="fm__cap">
                  <b>{{ pad(x.i) }}</b> {{ x.m.caption }}
                </p>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 Define: the idea, in two lines of big type over the hand-off into Blender -->
    <section class="id" v-bind="sec('define')" data-sheet-block="define">
      <SheetSectionNo id="define" />
      <p class="id__line">
        <span>{{ COPY.define[0] }}</span> {{ COPY.define[1] }}
      </p>
      <p class="id__line id__line--2">
        <span>{{ COPY.define[2] }}</span> {{ COPY.define[3] }}
      </p>
      <SheetPic v-if="handoff" class="id__pic" :m="handoff" cap :style="{ '--a': handoff.aspect ?? 2.4 }" />
      <p class="t4__text id__text">
        {{ COPY.defineText }}
      </p>
    </section>

    <!-- 04 The rooms: one pinned stage, swapped by the tracks' words scrolling past -->
    <section class="sw" v-bind="sec('deliver')" data-sheet-block="tracks">
      <div ref="stage" class="sw__stage">
        <SheetSectionNo id="deliver" />
        <div class="sw__room">
          <SheetPic v-for="(t, i) in tracks" :key="t.id" class="sw__layer" :class="{ 'is-on': i === active }" :m="t.splash!" />
          <AsCompare v-if="now.id === CMP && now.frames[0] && now.splash" class="sw__cmp" :before="now.frames[0]" :after="now.splash" :label="now.title" />
          <figure v-else-if="now.video" class="sw__screen">
            <video ref="vid" :src="now.video.src" :poster="now.video.poster" muted loop playsinline preload="none" :aria-label="now.video.caption" />
            <figcaption>The visual</figcaption>
          </figure>
        </div>
        <div class="sw__names" aria-hidden="true">
          <p v-for="(t, i) in tracks" :key="t.id" class="sw__name" :class="{ 'is-on': i === active, 'is-past': i < active }">
            {{ t.title }}
          </p>
        </div>
      </div>
      <div class="sw__steps">
        <article v-for="(t, i) in tracks" :id="stepId(t.id)" :key="t.id" ref="steps" class="sw__step" :data-i="i">
          <p class="sw__num">
            Track {{ pad(i) }}<template v-if="t.subtitle">
              · {{ t.subtitle }}
            </template>
          </p>
          <h4 class="sw__title">
            {{ t.title }}
          </h4>
          <AsCompare v-if="t.id === CMP && t.frames[0] && t.splash" class="sw__inline" :before="t.frames[0]" :after="t.splash" :label="t.title" />
          <SheetPic v-else-if="t.splash" class="sw__inline" :m="t.splash" cap />
          <dl class="sw__facts">
            <div><dt>Sound</dt><dd>{{ t.sound }}</dd></div>
            <div><dt>Visual</dt><dd>{{ t.visual }}</dd></div>
            <div><dt>Room</dt><dd>{{ t.room }}</dd></div>
          </dl>
          <div class="sw__renders">
            <SheetPic v-for="m in t.renders.slice(0, 4)" :key="m.src" :m="m" />
          </div>
        </article>
      </div>
    </section>

    <!-- 05 Problems: a counted list in big type -->
    <section class="pb" v-bind="sec('problems')" data-sheet-block="problems">
      <SheetSectionNo id="problems" />
      <ol class="pb__list">
        <li v-for="(p, i) in COPY.problems" :key="p">
          <span class="pb__n">{{ pad(i) }}</span>{{ p }}
        </li>
      </ol>
    </section>

    <!-- The close: the outcome in a line, then the B17 final-crit video, edge to edge -->
    <section v-if="crit" class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <p class="oc__foot">
        <b>Outcome</b> {{ COPY.outcome }}
      </p>
      <SheetPic class="oc__screen" :m="crit" cap />
    </section>
  </SheetShell>
</template>

<style scoped>
.t4__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The rooms strip: the rooms sit small in the middle of their black renders, so each is zoomed to fill its tile */
.rs {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.rs__tile {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  color: var(--c-fg);
  text-decoration: none;
  outline-offset: -3px;
}

.rs__tile + .rs__tile {
  border-left: 1px solid var(--rule);
}

.rs__tile .pic {
  position: absolute;
  inset: 0;
  transition: opacity 0.25s var(--ease-out);
}

.rs__tile :deep(img) {
  scale: 1.9;
  transform-origin: 50% 56%;
}

.rs__tile:hover .pic,
.rs__tile:focus-visible .pic {
  opacity: 0.7;
}

.rs__label {
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

.rs__label b {
  color: var(--c-accent);
  font-weight: 600;
}

/* 01 Discover: Tom beside the question */
.dq {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr);
  border-top: 1px solid var(--rule);
}

.dq__pic {
  aspect-ratio: 1.1;
  border-right: 1px solid var(--rule);
}

.dq__words {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 18px;
  padding: 28px 24px 30px;
}

.dq__q {
  align-self: center;
  margin: 0;
  font: 700 clamp(34px, 4.4vw, 60px)/0.98 var(--font-ui);
  letter-spacing: -0.035em;
  text-wrap: balance;
}

/* 02 Develop: the film strip fills the pinned view under its head */
.fm {
  border-top: 1px solid var(--rule);
}

.fm__run {
  height: calc(var(--view-h) + 130svh);
}

.fm__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr);
  height: var(--view-h);
  overflow: clip;
  container-type: inline-size;
}

.fm__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 420px);
  gap: 24px;
  align-items: end;
  padding: 24px 24px 20px;
}

.fm__type {
  margin: 10px 0 0 -0.05em;
  font: 700 clamp(64px, 12cqw, 150px)/0.85 var(--font-ui);
  letter-spacing: -0.045em;
}

.fm__track {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: max-content;
  height: 100%;
  padding: 0 24px 24px;
  translate: calc((-100% + 100cqw) * var(--p, 0)) 0;
  will-change: translate;
}

@supports (animation-timeline: view()) {
  .fm__run {
    view-timeline: --film4 block;
    view-timeline-inset: var(--header-h) 0;
  }

  .fm__track {
    animation: fm4-pan linear both;
    animation-timeline: --film4;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes fm4-pan {
  from { translate: 0 0; }
  to { translate: calc(-100% + 100cqw) 0; }
}

.fm__row {
  display: flex;
  gap: 12px;
  height: calc(50% - 6px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.fm__cell {
  position: relative;
  flex: none;
  height: 100%;
  aspect-ratio: var(--a);
  overflow: hidden;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.fm__cell .pic {
  position: absolute;
  inset: 0;
}

.fm__cap {
  position: absolute;
  left: 8px;
  bottom: 8px;
  max-width: calc(100% - 16px);
  margin: 0;
  padding: 3px 7px;
  font: 500 10.5px/1.3 var(--font-ui);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: var(--c-bg);
  border-radius: 5px;
}

.fm__cap b {
  color: var(--c-accent);
}

/* 03 Define: the idea */
.id {
  display: grid;
  gap: 4px;
  padding: 28px 24px 0;
  border-top: 1px solid var(--rule);
  overflow: clip;
}

.id .sno {
  margin-bottom: 18px;
}

.id__line {
  margin: 0;
  font: 700 clamp(34px, 5.4vw, 64px)/1.02 var(--font-ui);
  letter-spacing: -0.03em;
  color: var(--muted);
}

.id__line span {
  color: var(--c-fg);
}

.id__line--2 {
  padding-left: 12%;
}

.id__pic {
  margin: 26px -24px 0;
  aspect-ratio: var(--a);
  border-top: 1px solid var(--rule);
}

.id__text {
  padding: 16px 0 24px;
}

/* 04 The rooms: the pinned stage fills the view (count, room, name), the words scroll past beside it */
.sw {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.sw__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 18px;
  height: var(--view-h);
  padding: 24px;
  overflow: clip;
  border-right: 1px solid var(--rule);
}

.sw__room {
  position: relative;
  overflow: hidden;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.sw__layer {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.5s var(--ease-out);
}

.sw__layer.is-on {
  opacity: 1;
}

.sw__cmp {
  position: absolute;
  inset: 0;
}

.sw__screen {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 52%;
  aspect-ratio: 16 / 9;
  margin: 0;
  overflow: hidden;
  background: #000;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.sw__screen video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sw__screen figcaption {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 3px 7px;
  font: 500 10.5px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border-radius: 5px;
}

.sw__names {
  position: relative;
  height: 1em;
  font: 700 clamp(56px, 6.4vw, 96px)/1 var(--font-ui);
  letter-spacing: -0.04em;
}

.sw__name {
  position: absolute;
  inset: 0 auto auto 0;
  margin: 0;
  white-space: nowrap;
  opacity: 0;
  translate: 0 40%;
  transition: opacity 0.35s var(--ease-out), translate 0.45s var(--ease-out);
}

.sw__name.is-past {
  translate: 0 -40%;
}

.sw__name.is-on {
  opacity: 1;
  translate: 0 0;
}

.sw__step {
  display: grid;
  align-content: center;
  gap: 16px;
  min-height: var(--view-h);
  padding: 32px 24px;
  scroll-margin-top: var(--header-h);
}

.sw__step + .sw__step {
  border-top: 1px solid var(--rule);
}

.sw__num {
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.sw__title {
  margin: -6px 0 0;
  font: 600 30px/1.1 var(--font-ui);
  letter-spacing: -0.015em;
}

.sw__inline {
  display: none;
}

.sw__facts {
  display: grid;
  margin: 0;
}

.sw__facts div {
  padding: 10px 0 12px;
  border-top: 1px solid var(--rule);
}

.sw__facts dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sw__facts dd {
  margin: 6px 0 0;
  font: 400 14px/1.5 var(--font-ui);
}

.sw__renders {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  overflow: hidden;
  border-radius: 8px;
}

.sw__renders .pic {
  aspect-ratio: 16 / 9;
}

/* 05 Problems */
.pb {
  padding: 28px 24px 36px;
  border-top: 1px solid var(--rule);
}

.pb__list {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.pb__list li {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  padding: 14px 0 16px;
  font: 600 clamp(19px, 2.3vw, 26px)/1.25 var(--font-ui);
  letter-spacing: -0.01em;
  border-top: 1px solid var(--rule);
}

.pb__n {
  font: 600 13px/2 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

/* The close: the crit video, edge to edge, last */
.oc {
  border-top: 1px solid var(--rule);
}

.oc__foot {
  margin: 0;
  padding: 16px 24px 18px;
  font: 400 15px/1.5 var(--font-ui);
}

.oc__foot b {
  margin-right: 10px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.oc__screen {
  aspect-ratio: 16 / 9;
  border-top: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .sw__layer,
  .sw__name {
    transition: none;
  }
}

@media (max-width: 720px) {
  /* Phones: taller tiles, the label under the room, so the room shows */
  .rs__tile {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    aspect-ratio: 3 / 4;
  }

  .rs__tile .pic {
    position: relative;
    inset: auto;
  }

  .rs__tile :deep(img) {
    scale: 2.6;
  }

  .rs__label {
    position: static;
    padding: 8px 8px 10px;
    font-size: 10.5px;
    border: 0;
    border-top: 1px solid var(--rule);
    border-radius: 0;
  }

  .rs__label b {
    display: block;
  }

  .dq {
    grid-template-columns: minmax(0, 1fr);
  }

  .dq__pic {
    border-right: 0;
    border-bottom: 1px solid var(--rule);
  }

  .dq__words {
    padding: 22px 16px 26px;
  }

  .fm__run {
    height: calc(var(--view-h) + 160svh);
  }

  .fm__head {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 20px 16px 16px;
  }

  .fm__track {
    padding: 0 16px 20px;
  }

  .id {
    padding: 22px 16px 0;
  }

  .id__pic {
    margin: 22px -16px 0;
  }

  .id__line--2 {
    padding-left: 0;
  }

  /* Phones: no pinned stage; each track shows its own room (Fading Away's as the slider) */
  .sw {
    grid-template-columns: minmax(0, 1fr);
  }

  .sw__stage {
    display: none;
  }

  .sw__inline {
    display: block;
    aspect-ratio: 16 / 9;
    margin: 0 -16px;
  }

  .sw__step {
    min-height: 0;
    padding: 26px 16px;
  }

  .pb {
    padding: 22px 16px 28px;
  }

  .pb__list li {
    grid-template-columns: 40px minmax(0, 1fr);
  }

  .oc__foot {
    padding: 14px 16px 16px;
  }
}
</style>
