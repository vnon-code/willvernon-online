<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'

// PROTOTYPE T5 "Deck and matrix" (overnight run, Amplified Spaces round 2; a challenger keeping T's type-stage
// character, every beat a new device). Refs: Awwwards case studies' stacked sticky cards (a deck that piles up as
// you scroll); signal-flow diagrams (a TouchDesigner network read left to right); Lusion / Rejouice's swipe
// carousels; Kenta Toshikura's oversized type.
// Beats: the three visuals as an index strip under the hero, each crossfading to its room on hover → Discover, the
// question huge over Tom and the album art → Develop, the experiments as a deck of cards that stack while you
// scroll → Define, a signal matrix: each track's input, its TouchDesigner visual and its Blender room in one row →
// Deliver, the rooms in a swipe carousel (native scroll-snap), the visual playing inset → Problems, a counted list
// → the close: B17's final-crit video.
// PLACEHOLDER: every size, the deck's offsets, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

// T5's copy (Will, 2026-10-07: minimal and brutalist). Facts from the process book
// (.scratch/v1-launch/amplified-spaces-story.md); the licence cap and the beat fix appear once, in Problems.
// PLACEHOLDER copy, not approved by Will.
const COPY = {
  _status: 'PLACEHOLDER copy, not approved by Will',
  hook: 'Three of Tom Vernon\'s tracks. A visual for each, and a room to show it in.',
  question: 'How can a visual carry a track\'s mood?',
  discover: 'I looked at klsr.av, Portable Reef and Odyssey first. Tom and I picked three of his tracks.',
  develop: 'Blender particles first. Then TouchDesigner: GPU particles, topography, mycelium.',
  define: ['TouchDesigner makes the visual.', 'Blender builds the room.'],
  defineText: 'A fourth track, Healing Process, was made and dropped.',
  deliver: 'Dark concrete rooms, lit by the screen and one area light. 3D-scanned people stand in for a crowd.',
  tracks: {
    'onjuku': { sound: 'Ambient, no kicks. Nothing for a visual to hit on.', visual: 'The album art, displaced. Time turns it, not the audio.', room: 'Wrapped round a sphere above a ring. It ended up looking like a planet.' },
    'fading-away': { sound: 'A steady kick all the way through.', visual: 'The spectrum through a gradient sampled from the album art.', room: 'One long screen for the whole spectrum. Yellow light.' },
    'b17': { sound: 'Lo-fi.', visual: 'Circles that swell with the volume, inside a CRT.', room: 'Narrow room, blue light, brighter screen.' },
  } as Record<string, { sound: string, visual: string, room: string }>,
  problems: [
    'Built-in beat detection missed kicks. I built my own.',
    'The free TouchDesigner licence caps output at 1280×1280.',
    'The CRT look for B17 was a struggle to build.',
    'Cut mirror and text overlays. Too generic.',
  ],
  outcome: 'A splash and four renders per track. B17 got a video for the final crit.',
}

const story = computed(() => props.sheet.card.story!)
const tracks = computed(() => story.value.tracks.map(t => ({ ...t, ...COPY.tracks[t.id] })))
const phase = (id: string) => story.value.process.find(p => p.id === id)
const discoverPics = computed(() => phase('discover')?.media.slice(0, 3) ?? [])
const develop = computed(() => phase('develop'))
const crit = computed(() => story.value.outcome?.media.find(m => m.type === 'video'))

// The deck: six image-led experiments (the network screenshots stay out)
const DECK = ['p13-2', 'p23-1', 'p24-0', 'p27-1', 'p29-0', 'p33-0']
const deck = computed(() => DECK.map(k => develop.value?.media.find(m => m.src.includes(`/${k}.`))).filter(Boolean) as NonNullable<typeof develop.value>['media'])

// The matrix: per track, what went in (the album art, or the network), the visual, the room
const matrix = computed(() => tracks.value.map(t => ({
  t,
  cells: [
    { k: 'In', m: t.network[0] ?? t.art ?? undefined, fit: true },
    { k: 'Visual', m: t.frames[0], fit: false },
    { k: 'Room', m: t.splash ?? undefined, fit: false },
  ],
})))

const S = useSheetSections('as5', [
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

// The carousel: native horizontal scroll-snap; the buttons and the index strip scroll it; an observer on the
// slides (root: the track) keeps the counter right
const track = ref<HTMLElement>()
const slides = ref<HTMLElement[]>([])
const at = ref(0)
let io: IntersectionObserver | undefined
function show(i: number) {
  const n = tracks.value.length
  const to = Math.max(0, Math.min(n - 1, i))
  const el = slides.value[to]
  if (!track.value || !el) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  track.value.scrollTo({ left: el.offsetLeft - track.value.offsetLeft, behavior: reduce ? 'auto' : 'smooth' })
}
function goRoom(i: number) {
  const sect = document.getElementById(S.anchor('deliver'))
  const layer = sect?.closest<HTMLElement>('[data-sheet-layer]')
  if (sect && layer) {
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    layer.scrollBy({ top: sect.getBoundingClientRect().top - h, behavior: reduce ? 'auto' : 'smooth' })
  }
  show(i)
}
onMounted(() => {
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) at.value = Number((e.target as HTMLElement).dataset.i)
  }, { root: track.value, threshold: 0.6 })
  slides.value.forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="story.title" :hook="COPY.hook" :info="info">
      <!-- The three visuals, edge to edge under the hero; hover crossfades a tile to its room; a tile opens its room -->
      <template #before>
        <nav class="vx" :style="{ '--n': tracks.length }" aria-label="Rooms">
          <a v-for="(t, i) in tracks" :key="t.id" class="vx__tile" :href="`#${S.anchor('deliver')}`" @click.prevent="goRoom(i)">
            <span class="vx__pics">
              <SheetPic v-if="t.frames[0]" class="vx__a" :m="t.frames[0]" />
              <SheetPic v-if="t.splash" class="vx__b" :m="t.splash" />
            </span>
            <span class="vx__label"><b>{{ pad(i) }}</b> {{ t.title }}</span>
          </a>
        </nav>
      </template>
    </SheetHead>

    <!-- 01 Discover: the question huge, over Tom and the album art -->
    <section class="dv" v-bind="sec('discover')" data-sheet-block="discover">
      <div class="dv__head">
        <SheetSectionNo id="discover" />
        <p class="t5__text">
          {{ COPY.discover }}
        </p>
      </div>
      <p class="dv__q">
        {{ COPY.question }}
      </p>
      <div class="dv__pics">
        <SheetPic v-for="m in discoverPics" :key="m.src" :m="m" cap />
      </div>
    </section>

    <!-- 02 Develop: a deck of experiments, stacking as you scroll -->
    <section v-if="develop" class="dk" v-bind="sec('develop')" data-sheet-block="develop">
      <div class="dk__head">
        <SheetSectionNo id="develop" />
        <p class="t5__text">
          {{ COPY.develop }}
        </p>
      </div>
      <ol class="dk__list">
        <li v-for="(m, i) in deck" :key="m.src" class="dk__card" :style="{ '--i': i }">
          <SheetPic class="dk__pic" :m="m" />
          <div class="dk__side">
            <b class="dk__n">{{ pad(i) }}</b>
            <span class="dk__cap">{{ m.caption }}</span>
          </div>
        </li>
      </ol>
    </section>

    <!-- 03 Define: the signal matrix, a row per track, read left to right -->
    <section class="mx" v-bind="sec('define')" data-sheet-block="define">
      <div class="mx__head">
        <SheetSectionNo id="define" />
        <p class="mx__big">
          <span>{{ COPY.define[0] }}</span> {{ COPY.define[1] }}
        </p>
      </div>
      <div class="mx__grid" role="table" aria-label="Each track: what went in, the visual, the room">
        <div class="mx__row mx__row--h" role="row">
          <span role="columnheader">Track</span>
          <span role="columnheader">In</span>
          <span role="columnheader">Visual <em>TouchDesigner</em></span>
          <span role="columnheader">Room <em>Blender</em></span>
        </div>
        <div v-for="(r, i) in matrix" :key="r.t.id" class="mx__row" role="row">
          <span class="mx__name" role="rowheader"><b>{{ pad(i) }}</b> {{ r.t.title }}</span>
          <span v-for="c in r.cells" :key="c.k" class="mx__cell" role="cell">
            <SheetPic v-if="c.m" :class="{ 'mx__fit': c.fit, 'mx__room': c.k === 'Room' }" :m="c.m" />
          </span>
        </div>
      </div>
      <p class="t5__text mx__foot">
        {{ COPY.defineText }}
      </p>
    </section>

    <!-- 04 Deliver: the rooms in a swipe carousel, the visual playing inset -->
    <section class="cr" v-bind="sec('deliver')" data-sheet-block="tracks">
      <div class="cr__head">
        <SheetSectionNo id="deliver" />
        <p class="t5__text">
          {{ COPY.deliver }}
        </p>
        <div class="cr__nav">
          <button type="button" class="cr__btn" aria-label="Previous room" :disabled="at <= 0" @click="show(at - 1)">
            ←
          </button>
          <span class="cr__at" aria-live="polite">{{ pad(at) }} / {{ pad(tracks.length - 1) }}</span>
          <button type="button" class="cr__btn" aria-label="Next room" :disabled="at >= tracks.length - 1" @click="show(at + 1)">
            →
          </button>
        </div>
      </div>
      <div ref="track" class="cr__track" role="region" aria-roledescription="carousel" aria-label="Three rooms" tabindex="0">
        <article v-for="(t, i) in tracks" :key="t.id" ref="slides" class="cr__slide" :data-i="i" role="group" aria-roledescription="slide" :aria-label="`${i + 1} of ${tracks.length}: ${t.title}`">
          <div class="cr__room">
            <SheetPic v-if="t.splash" class="cr__splash" :m="t.splash" />
            <p class="cr__name">
              {{ t.title }}<small v-if="t.subtitle">{{ t.subtitle }}</small>
            </p>
            <SheetPic v-if="t.video" class="cr__vid" :m="t.video" />
          </div>
          <dl class="cr__facts">
            <div><dt>Sound</dt><dd>{{ t.sound }}</dd></div>
            <div><dt>Visual</dt><dd>{{ t.visual }}</dd></div>
            <div><dt>Room</dt><dd>{{ t.room }}</dd></div>
          </dl>
          <div class="cr__renders">
            <SheetPic v-for="m in t.renders.slice(0, 4)" :key="m.src" :m="m" />
          </div>
        </article>
      </div>
    </section>

    <!-- 05 Problems: a counted list -->
    <section class="pb" v-bind="sec('problems')" data-sheet-block="problems">
      <SheetSectionNo id="problems" />
      <ol class="pb__list">
        <li v-for="(p, i) in COPY.problems" :key="p">
          <span class="pb__n">{{ pad(i) }}</span>{{ p }}
        </li>
      </ol>
    </section>

    <!-- The close: the outcome in a line, then B17's final-crit video edge to edge -->
    <section v-if="crit" class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <p class="oc__foot">
        <b>Outcome</b> {{ COPY.outcome }}
      </p>
      <SheetPic class="oc__screen" :m="crit" cap />
    </section>
  </SheetShell>
</template>

<style scoped>
.t5__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The index strip: the visual, crossfading to its room on hover or focus */
.vx {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.vx__tile {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  color: var(--c-fg);
  text-decoration: none;
  outline-offset: -3px;
}

.vx__tile + .vx__tile {
  border-left: 1px solid var(--rule);
}

.vx__pics {
  position: absolute;
  inset: 0;
  display: block;
  overflow: hidden;
}

.vx__pics .pic {
  position: absolute;
  inset: 0;
}

.vx__b {
  opacity: 0;
  transition: opacity 0.35s var(--ease-out);
}

.vx__b :deep(img) {
  scale: 1.9;
  transform-origin: 50% 56%;
}

.vx__tile:hover .vx__b,
.vx__tile:focus-visible .vx__b {
  opacity: 1;
}

.vx__label {
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

.vx__label b {
  color: var(--c-accent);
  font-weight: 600;
}

/* 01 Discover */
.dv {
  border-top: 1px solid var(--rule);
}

.dv__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: start;
  padding: 28px 24px 0;
}

.dv__q {
  margin: 0;
  padding: 20px 24px 28px;
  font: 700 clamp(48px, 7.4vw, 104px)/0.92 var(--font-ui);
  letter-spacing: -0.045em;
  text-wrap: balance;
}

.dv__pics {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.dv__pics .pic {
  aspect-ratio: 1;
}

.dv__pics .pic:first-child {
  aspect-ratio: auto;
}

/* 02 Develop: the deck. Each card sticks a little lower than the last, so they pile up with their tops showing */
.dk {
  border-top: 1px solid var(--rule);
}

.dk__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: start;
  padding: 28px 24px 24px;
}

.dk__list {
  display: grid;
  gap: 8svh;
  margin: 0;
  padding: 0 24px 24px;
  list-style: none;
}

.dk__card {
  position: sticky;
  top: calc(8px + var(--i) * 16px);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  height: min(50svh, 480px);
  overflow: hidden;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
  box-shadow: 0 -12px 24px rgb(0 0 0 / 0.35);
}

.dk__pic {
  height: 100%;
}

.dk__side {
  display: grid;
  align-content: space-between;
  padding: 18px 18px 20px;
  border-left: 1px solid var(--rule);
}

.dk__n {
  font: 700 72px/0.85 var(--font-ui);
  letter-spacing: -0.04em;
  color: var(--c-accent);
}

.dk__cap {
  font: 600 18px/1.25 var(--font-ui);
}

/* 03 Define: the matrix */
.mx {
  border-top: 1px solid var(--rule);
}

.mx__head {
  display: grid;
  gap: 18px;
  padding: 28px 24px 24px;
}

.mx__big {
  margin: 0;
  font: 700 clamp(32px, 4.6vw, 58px)/1.02 var(--font-ui);
  letter-spacing: -0.03em;
  color: var(--muted);
}

.mx__big span {
  color: var(--c-fg);
}

.mx__grid {
  display: grid;
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.mx__row {
  display: grid;
  grid-template-columns: 150px repeat(3, minmax(0, 1fr));
  gap: 1px;
}

.mx__row > * {
  background: var(--c-bg);
}

.mx__row--h span {
  padding: 10px 14px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.mx__row--h em {
  display: block;
  font-style: normal;
  color: var(--c-accent);
}

.mx__name {
  padding: 14px;
  font: 600 18px/1.2 var(--font-ui);
}

.mx__name b {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.mx__cell .pic {
  aspect-ratio: 16 / 9;
}

.mx__fit {
  --pic-fit: contain;
}

/* The rooms sit small in the middle of their black renders: zoom to the lit room */
.mx__room :deep(img) {
  scale: 1.8;
  transform-origin: 50% 56%;
}

.mx__foot {
  padding: 14px 24px 18px;
  border-top: 1px solid var(--rule);
}

/* 04 Deliver: the carousel */
.cr {
  border-top: 1px solid var(--rule);
}

.cr__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) auto;
  gap: 24px;
  align-items: start;
  padding: 28px 24px 22px;
}

.cr__nav {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cr__btn {
  width: 44px;
  height: 44px;
  font: 500 18px/1 var(--font-ui);
  color: var(--c-fg);
  cursor: pointer;
  background: none;
  border: 1px solid var(--rule);
  border-radius: 50%;
  transition: border-color 0.2s var(--ease-out), opacity 0.2s var(--ease-out);
}

.cr__btn:hover:not(:disabled) {
  border-color: var(--c-accent);
}

.cr__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.cr__at {
  font: 600 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
}

.cr__track {
  display: flex;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-top: 1px solid var(--rule);
}

.cr__track:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.cr__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}

.cr__slide + .cr__slide {
  border-left: 1px solid var(--rule);
}

.cr__room {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #000;
}

.cr__splash {
  position: absolute;
  inset: 0;
}

.cr__name {
  position: absolute;
  top: 18px;
  left: 24px;
  margin: 0;
  font: 700 clamp(56px, 8vw, 116px)/0.9 var(--font-ui);
  letter-spacing: -0.045em;
  white-space: nowrap;
}

.cr__name small {
  margin-left: 0.3em;
  font-size: max(11px, 0.16em);
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cr__vid {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 36%;
  aspect-ratio: 16 / 9;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.cr__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
}

.cr__facts div {
  padding: 14px 24px 18px;
}

.cr__facts div + div {
  border-left: 1px solid var(--rule);
}

.cr__facts dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cr__facts dd {
  margin: 6px 0 0;
  font: 400 13.5px/1.45 var(--font-ui);
}

.cr__renders {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.cr__renders .pic {
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

/* The close */
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
  .vx__b {
    transition: none;
  }
}

@media (max-width: 720px) {
  /* Phones: taller tiles, the room shown (no hover), the label under it */
  .vx__tile {
    display: grid;
    grid-template-rows: minmax(0, 1fr) auto;
    aspect-ratio: 3 / 4;
  }

  .vx__pics {
    position: relative;
    inset: auto;
  }

  .vx__b {
    opacity: 1;
  }

  .vx__b :deep(img) {
    scale: 2.6;
  }

  .vx__label {
    position: static;
    padding: 8px 8px 10px;
    font-size: 10.5px;
    border: 0;
    border-top: 1px solid var(--rule);
    border-radius: 0;
  }

  .vx__label b {
    display: block;
  }

  .dv__head,
  .dk__head,
  .cr__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 14px;
    padding: 22px 16px 16px;
  }

  .dv__q {
    padding: 8px 16px 22px;
  }

  .dv__pics {
    grid-template-columns: 1fr 1fr;
  }

  .dv__pics .pic:first-child {
    grid-column: span 2;
    aspect-ratio: 1.35;
  }

  /* Phones: the deck stacks the picture over its caption */
  .dk__list {
    gap: 6svh;
    padding: 0 16px 16px;
  }

  .dk__card {
    top: calc(8px + var(--i) * 10px);
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: minmax(0, 1fr) auto;
    height: min(52svh, 440px);
  }

  .dk__side {
    display: flex;
    gap: 12px;
    align-items: baseline;
    padding: 12px 14px 14px;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .dk__n {
    font-size: 28px;
  }

  .dk__cap {
    font-size: 16px;
  }

  .mx__head {
    padding: 22px 16px 18px;
  }

  .mx__row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .mx__row--h span:first-child {
    display: none;
  }

  .mx__row--h span {
    padding: 8px;
    font-size: 10.5px;
  }

  .mx__name {
    grid-column: 1 / -1;
    padding: 10px 16px;
    font-size: 16px;
  }

  .mx__name b {
    display: inline;
    margin: 0 8px 0 0;
  }

  .mx__cell .pic {
    aspect-ratio: 1;
  }

  .mx__foot {
    padding: 12px 16px 16px;
  }

  .cr__name {
    top: 12px;
    left: 16px;
    font-size: 44px;
  }

  .cr__vid {
    right: 10px;
    bottom: 10px;
    width: 46%;
  }

  .cr__facts {
    grid-template-columns: minmax(0, 1fr);
  }

  .cr__facts div {
    padding: 12px 16px 14px;
  }

  .cr__facts div + div {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .cr__renders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
