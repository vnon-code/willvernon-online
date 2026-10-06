<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { goToSection, useSheetSections } from '../_shared/useSheetSections'

// PROTOTYPE T2b "Track switcher, polished" (overnight run, Amplified Spaces): T2 plus round 1's six next-round changes
// (matrix.md): a closing beat (the B17 crit video full-bleed under the problems), Define's B17 stage at full
// view height with the wipe as the event, the question big in Discover's left cell, a contact sheet with varied spans
// and a staggered reveal, a slim sticky 01–05 phase marker in the left margin, and phone fixes (short index chips,
// a 44px slider handle, smaller problem numerals). T2 itself is unchanged.
// --- T2's notes ---
// Refs: Kenta Toshikura (T's oversized type and counted beats); Obys / Rejouice case studies (a contact sheet of
// process work; a scroll-driven wipe from the working file to the finished frame); product pages' before/after.
// Beats, each with its own device: the three visuals as an index strip under the hero (a tile opens its track
// below) → Discover, the brief's question in big type beside Tom and the album art → Develop, the experiments as a
// contact sheet → Define, B17 pinned while it wipes from the TouchDesigner network to its CRT frame to the room →
// the rooms in one track switcher (tabs 01–03: the visual playing, a visual / room comparison slider, the renders,
// sound / visual / room) → the problems as a grid of counted cells → the outcome.
// PLACEHOLDER: every size, the wipe's ranges, the copy.
// 2026-10-07: the title, info, contents, numbering and phase marker are the shared ones (sheets/_shared, TOOLS.md);
// the track strip under the hero stays T2b's own.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

// T2b's copy (Will, 2026-10-07: minimal and brutalist; only what's worth showing, the work carries the page). It
// overrides the story's strings for T2b only; T2 keeps the story's own. Facts from the process book
// (.scratch/v1-launch/amplified-spaces-story.md). PLACEHOLDER copy, not approved by Will.
const COPY = {
  hook: 'Three tracks by Tom Vernon. A visual for each, and a room to show it in.',
  question: 'How can a visual carry a track\'s mood?',
  process: {
    discover: 'Looked at klsr.av, Portable Reef and Odyssey. Picked the tracks with Tom.',
    develop: 'Experiments in Blender, then TouchDesigner.',
    define: 'TouchDesigner makes the visual. Blender builds the room.',
  } as Record<string, string>,
  tracks: {
    'onjuku': { sound: 'Ambient, no kicks. Nothing for a visual to hit on.', visual: 'The album art, displaced. Time turns it, not the audio.', room: 'Wrapped round a sphere above a ring. It ended up looking like a planet.' },
    'fading-away': { sound: 'A steady kick all the way through.', visual: 'The spectrum through a gradient sampled from the album art.', room: 'One long screen for the whole spectrum. Yellow light.' },
    'b17': { sound: 'Lo-fi.', visual: 'Circles that swell with the volume, inside a CRT.', room: 'Narrow room, blue light, brighter screen.' },
  } as Record<string, { sound: string, visual: string, room: string }>,
  problems: [
    'Built-in beat detection missed kicks. I built my own.',
    'The free TouchDesigner licence caps output at 1280×1280.',
    'The CRT build for B17 was the hardest part: RGB split, hexagon pixels, lens distort, bloom.',
    'Cut mirror and text overlays. Too generic.',
  ],
  outcome: 'A splash and four renders per track. B17 got a video for the final crit.',
}
const story = computed(() => props.sheet.card.story!)
const s = computed(() => {
  const o = story.value
  return {
    ...o,
    hook: COPY.hook,
    intro: '',
    brief: [],
    process: o.process.map(p => ({ ...p, text: COPY.process[p.id] ?? p.text })),
    tracks: o.tracks.map(t => ({ ...t, ...COPY.tracks[t.id] })),
    problems: COPY.problems,
    outcome: o.outcome && { ...o.outcome, text: COPY.outcome },
  }
})
const tracks = computed(() => s.value.tracks)
const phase = (id: string) => s.value.process.find(p => p.id === id)
const discover = computed(() => phase('discover'))
const develop = computed(() => phase('develop'))
const define = computed(() => phase('define'))
const lead = computed(() => tracks.value.map(t => ({ m: t.frames[0] ?? t.splash!, label: t.title })))

// The shared head and numbering: the sections in order, and the info from the story's credits (the module's
// trailing year split off as the year)
const S = useSheetSections('as2b', [
  { id: 'discover', label: 'Discover' },
  { id: 'develop', label: 'Develop' },
  { id: 'define', label: 'Define' },
  { id: 'deliver', label: 'Deliver' },
  { id: 'problems', label: 'Problems' },
])
const sec = S.sec
const info = computed(() => {
  const c = (k: string) => story.value.credits.find(x => x.k === k)?.v
  const [module, year] = (c('Module') ?? '').split(/,\s*(?=\d{4}$)/)
  return { year, module: module || undefined, client: c('Client'), role: c('Role'), tools: c('Tools') }
})
function goTrack(i: number) {
  pick(i)
  goToSection('deliver', S)
}
const question = COPY.question
// The wipe: B17's network, then its CRT frame, then the room
const b17 = computed(() => tracks.value.find(t => t.id === 'b17'))
const wipe = computed(() => {
  const t = b17.value
  if (!t) return []
  return [
    t.network[0] && { m: t.network[0], k: 'Network', v: 'Volume in, circles out, then the CRT.' },
    t.frames[0] && { m: t.frames[0], k: 'Visual', v: 'RGB split, hexagon pixels, noise, lens distortion, bloom.' },
    t.splash && { m: t.splash, k: 'Room', v: t.room },
  ].filter(Boolean) as { m: NonNullable<typeof t.splash>, k: string, v: string }[]
})

// The contact sheet: eight tiles, one caption each, in reading order (the sheet's other process-book pictures are cut:
// a second Blender particles and Particles GPU frame, the second topographic colours). Spans: the two networks and the
// topographic render two columns wide (the render only above 720px), the GPU particles two rows tall (dense flow packs
// the 4-column sheet with no holes; on phones the 2-column sheet has no holes either: area 10)
const SHEET = ['p13-2', 'p23-1', 'p16-0', 'p24-0', 'p27-1', 'p33-0', 'p29-0', 'p31-0']
const tiles = computed(() => SHEET.map(k => develop.value?.media.find(m => m.src.includes(`/${k}.`))).filter(Boolean) as NonNullable<typeof develop.value>['media'])
const span = (src: string) => /p16-0|p31-0/.test(src) ? 'cs__cell--wide' : /p29-0/.test(src) ? 'cs__cell--wide cs__cell--wide-d' : /p23-1/.test(src) ? 'cs__cell--tall' : ''

// The closing beat: the crit video, the rooms after it
const crit = computed(() => s.value.outcome?.media.find(m => m.type === 'video'))
const rooms = computed(() => s.value.outcome?.media.filter(m => m.type !== 'video') ?? [])

// The contact sheet's cells rise in once
let rio: IntersectionObserver | undefined

// The switcher: one track at a time; one <video>, its source swapped, playing only while on screen
const on = ref(0)
const cut = ref(50)
const t = computed(() => tracks.value[on.value]!)
const tabs = ref<HTMLButtonElement[]>([])
const stage = ref<HTMLElement>()
const vid = ref<HTMLVideoElement>()
let seen = false
let io: IntersectionObserver | undefined
function play() {
  const v = vid.value
  if (!v) return
  if (seen) v.play().catch(() => {})
  else v.pause()
}
function pick(i: number, focus = false) {
  on.value = (i + tracks.value.length) % tracks.value.length
  cut.value = 50
  if (focus) nextTick(() => tabs.value[on.value]?.focus())
}
function key(e: KeyboardEvent) {
  const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
  if (d) {
    e.preventDefault()
    pick(on.value + d, true)
  }
  else if (e.key === 'Home' || e.key === 'End') {
    e.preventDefault()
    pick(e.key === 'Home' ? 0 : tracks.value.length - 1, true)
  }
}
watch(on, () => nextTick(play))
onMounted(() => {
  const layer = stage.value?.closest<HTMLElement>('[data-sheet-layer]') ?? null
  io = new IntersectionObserver(([e]) => {
    seen = !!e?.isIntersecting
    play()
  }, { root: layer, threshold: 0.25 })
  if (stage.value) io.observe(stage.value)
  rio = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue
      e.target.classList.add('is-in')
      rio!.unobserve(e.target)
    }
  }, { root: layer, rootMargin: '0px 0px -8% 0px' })
  layer?.querySelectorAll('.cs__cell').forEach(el => rio!.observe(el))
})
onBeforeUnmount(() => {
  io?.disconnect()
  rio?.disconnect()
})
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="s.title" :hook="s.hook" :info="info">
      <!-- T2b's own: the three visuals meeting the hero edge to edge; a tile opens its track in Deliver -->
      <template #before>
        <nav class="ld__strip" :style="{ '--n': lead.length }" aria-label="Tracks">
          <a v-for="(it, i) in lead" :key="it.label" class="ld__tile" :href="`#${S.anchor('deliver')}`" @click.prevent="goTrack(i)">
            <SheetPic :m="it.m" />
            <span class="ld__label"><b>{{ pad(i) }}</b> {{ it.label }}</span>
          </a>
        </nav>
      </template>
    </SheetHead>

    <!-- 01 Discover: the brief's question, Tom and the album art -->
    <section v-if="discover" class="ds" v-bind="sec('discover')" data-sheet-block="discover">
      <div class="ds__words">
        <SheetSectionNo id="discover" />
        <p class="ds__q">
          {{ question }}
        </p>
        <p class="t2__text">
          {{ discover.text }}
        </p>
      </div>
      <div class="ds__pics">
        <SheetPic v-for="m in discover.media.slice(0, 3)" :key="m.src" :m="m" cap :style="{ '--a': m.aspect ?? 1 }" />
      </div>
    </section>

    <!-- 02 Develop: a contact sheet of the experiments -->
    <section v-if="develop" class="cs" v-bind="sec('develop')" data-sheet-block="develop">
      <div class="cs__head">
        <SheetSectionNo id="develop" />
        <p class="t2__text">
          {{ develop.text }}
        </p>
      </div>
      <ol class="cs__grid">
        <li v-for="(m, i) in tiles" :key="m.src" class="cs__cell" :class="span(m.src)" :style="{ '--d': `${(i % 4) * 70}ms` }">
          <SheetPic :m="m" />
          <p class="cs__cap">
            <b>{{ pad(i) }}</b> {{ m.caption }}
          </p>
        </li>
      </ol>
    </section>

    <!-- 03 Define: B17 wipes from the network to the visual to the room as you scroll -->
    <section v-if="wipe.length" class="rv" v-bind="sec('define')" data-sheet-block="define">
      <div class="rv__intro">
        <SheetSectionNo id="define" />
        <p v-if="define" class="t2__text">
          {{ define.text }}
        </p>
      </div>
      <div class="rv__run" data-progress>
        <div class="rv__stage">
          <div class="rv__head">
            <p class="rv__big">
              B17
            </p>
            <ol class="rv__steps">
              <li v-for="(w, i) in wipe" :key="w.k" :style="{ '--i': i }">
                <b>{{ w.k }}</b>
                <span>{{ w.v }}</span>
              </li>
            </ol>
          </div>
          <div class="rv__frame">
            <SheetPic v-for="(w, i) in wipe" :key="w.m.src" class="rv__layer" :m="w.m" :style="{ '--i': i }" />
          </div>
        </div>
      </div>
    </section>

    <!-- 04 Deliver: the rooms, one track at a time -->
    <section class="tw" v-bind="sec('deliver')" data-sheet-block="tracks">
      <div class="tw__top">
        <SheetSectionNo id="deliver" />
      </div>
      <div class="tw__tabs" role="tablist" aria-label="Tracks" @keydown="key">
        <button
          v-for="(x, i) in tracks"
          :id="`as2b-tab-${x.id}`"
          :key="x.id"
          ref="tabs"
          class="tw__tab"
          role="tab"
          type="button"
          :aria-selected="i === on"
          :aria-controls="`as2b-panel`"
          :tabindex="i === on ? 0 : -1"
          @click="pick(i)"
        >
          <b>{{ pad(i) }}</b>
          <span>{{ x.title }}</span>
          <em v-if="x.light">{{ x.light }} light</em>
        </button>
      </div>
      <div id="as2b-panel" class="tw__panel" role="tabpanel" :aria-labelledby="`as2b-tab-${t.id}`">
        <div class="tw__names" aria-hidden="true">
          <Transition name="tw">
            <p :key="t.id" class="tw__name">
              {{ t.title }}<small v-if="t.subtitle">{{ t.subtitle }}</small>
            </p>
          </Transition>
        </div>
        <div ref="stage" class="tw__media">
          <figure v-if="t.video" class="tw__vid">
            <video ref="vid" :src="t.video.src" :poster="t.video.poster" muted loop playsinline preload="none" :aria-label="t.video.caption" />
            <figcaption>Visual</figcaption>
          </figure>
          <div v-if="t.frames[0] && t.splash" class="tw__cmp" :style="{ '--cut': `${cut}%` }">
            <SheetPic class="tw__after" :m="t.splash" />
            <SheetPic class="tw__before" :m="t.frames[0]" />
            <span class="tw__line" aria-hidden="true"><span class="tw__knob" /></span>
            <span class="tw__tag tw__tag--l">Visual</span>
            <span class="tw__tag tw__tag--r">Room</span>
            <input v-model.number="cut" class="tw__range" type="range" min="0" max="100" :aria-label="`${t.title}: slide between the visual and the room`">
          </div>
        </div>
        <dl class="tw__facts">
          <div><dt>Sound</dt><dd>{{ t.sound }}</dd></div>
          <div><dt>Visual</dt><dd>{{ t.visual }}</dd></div>
          <div><dt>Room</dt><dd>{{ t.room }}</dd></div>
        </dl>
        <div class="tw__renders" :style="{ '--n': t.renders.length }">
          <SheetPic v-for="m in t.renders" :key="m.src" :m="m" />
        </div>
      </div>
    </section>

    <!-- 05 Problems: a grid of counted cells -->
    <section v-if="s.problems?.length" class="pg" v-bind="sec('problems')" data-sheet-block="problems">
      <div class="pg__count">
        <SheetSectionNo id="problems" />
      </div>
      <ol class="pg__grid">
        <li v-for="(p, i) in s.problems" :key="p">
          <b>{{ pad(i) }}</b>{{ p }}
        </li>
      </ol>
    </section>

    <!-- The close: the B17 crit video full-bleed under the problems; then the outcome line and the three rooms -->
    <section v-if="s.outcome" class="cb" data-sheet-block="outcome" aria-label="Outcome">
      <SheetPic v-if="crit" class="cb__screen" :m="crit" cap />
      <p class="cb__foot">
        <b>Outcome</b> {{ s.outcome.text }}
      </p>
      <div v-if="rooms.length" class="cb__rooms" :style="{ '--n': rooms.length }">
        <SheetPic v-for="m in rooms" :key="m.src" :m="m" cap />
      </div>
    </section>

  </SheetShell>
</template>

<style scoped>
.t2__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* 01 Discover */
.ds {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.ds__words {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 22px;
  padding: 32px 24px 36px;
}

/* The question fills the cell beside the pictures */
.ds__q {
  align-self: center;
  margin: 0;
  font: 700 clamp(36px, 4.6vw, 66px)/0.98 var(--font-ui);
  letter-spacing: -0.035em;
  text-wrap: balance;
}

.ds__pics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-left: 1px solid var(--rule);
}

.ds__pics .pic:first-child {
  grid-column: span 2;
  aspect-ratio: var(--a);
  border-bottom: 1px solid var(--rule);
}

.ds__pics .pic:not(:first-child) {
  aspect-ratio: 1;
}

.ds__pics .pic:nth-child(3) {
  border-left: 1px solid var(--rule);
}

/* 02 Develop: the contact sheet */
.cs {
  container-type: inline-size;
  border-top: 1px solid var(--rule);
}

.cs__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: start;
  padding: 28px 24px;
}

.cs__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-auto-rows: calc((100cqi - 3px) / 4 * 0.75);
  grid-auto-flow: dense;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.cs__cell {
  position: relative;
  overflow: clip;
  background: var(--c-bg);
}

.cs__cell--wide {
  grid-column: span 2;
}

.cs__cell--tall {
  grid-row: span 2;
}

/* Particles on black: the whole frame, centred in the tall cell */
.cs__cell--tall .pic {
  --pic-fit: contain;
}

/* The staggered reveal (transform and opacity only): each cell rises in once, by its column */
.cs__cell > * {
  opacity: 0;
  translate: 0 28px;
  transition: opacity 0.5s var(--ease-out) var(--d, 0ms), translate 0.6s cubic-bezier(0.23, 1, 0.32, 1) var(--d, 0ms);
}

.cs__cell.is-in > * {
  opacity: 1;
  translate: none;
}

.cs__cell .pic {
  position: absolute;
  inset: 0;
}

.cs__cap {
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

.cs__cap b {
  color: var(--c-accent);
}

/* 03 Define: the wipe, scroll-linked */
.rv {
  border-top: 1px solid var(--rule);
}

.rv__intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
  gap: 24px;
  align-items: start;
  padding: 28px 24px;
}

.rv__run {
  height: calc(var(--view-h) + 110svh);
}

/* The stage fills the view under the header: B17 and the three steps on top, the wipe filling the rest */
.rv__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: var(--view-h);
  overflow: clip;
  border-top: 1px solid var(--rule);
}

.rv__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 16px 40px;
  align-items: end;
  padding: 18px 24px 20px;
}

.rv__big {
  margin: 0;
  font: 700 clamp(72px, 8vw, 116px)/0.8 var(--font-ui);
  letter-spacing: -0.05em;
}

.rv__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rv__steps li {
  display: grid;
  gap: 3px;
  padding-left: 12px;
  border-left: 2px solid var(--c-accent);
  opacity: calc(0.62 + 0.38 * clamp(0, 1 - abs(var(--p, 0) * 2.4 - var(--i)), 1));
}

.rv__steps b {
  font: 600 13px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.rv__steps span {
  font: 400 13.5px/1.45 var(--font-ui);
  color: color-mix(in srgb, var(--c-fg) 85%, transparent);
}

.rv__frame {
  position: relative;
  overflow: hidden;
  background: #000;
  border-top: 1px solid var(--rule);
}

.rv__layer {
  position: absolute;
  inset: 0;
  --pic-fit: contain;
}

.rv__layer:last-child {
  --pic-fit: cover;
}

.rv__layer + .rv__layer {
  clip-path: inset(0 0 0 calc(100% * (1 - clamp(0, (var(--p, 0) - (var(--i) - 1) * 0.42 - 0.12) / 0.3, 1))));
}

@supports (animation-timeline: view()) {
  .rv__run {
    view-timeline: --rv block;
    view-timeline-inset: var(--header-h) 0;
  }

  .rv__layer + .rv__layer {
    clip-path: inset(0 0 0 100%);
    animation: rv-wipe linear both;
    animation-timeline: --rv;
  }

  .rv__layer:nth-child(2) { animation-range: contain 12% contain 42%; }
  .rv__layer:nth-child(3) { animation-range: contain 55% contain 85%; }

  .rv__steps li {
    opacity: 0.62;
    animation: rv-step linear both;
    animation-timeline: --rv;
  }

  .rv__steps li:nth-child(1) { animation-range: contain 0% contain 35%; }
  .rv__steps li:nth-child(2) { animation-range: contain 30% contain 70%; }
  .rv__steps li:nth-child(3) { animation-name: rv-step-last; animation-range: contain 60% contain 85%; }
}

@keyframes rv-wipe {
  to { clip-path: inset(0); }
}

@keyframes rv-step {
  0%, 100% { opacity: 0.62; }
  20%, 80% { opacity: 1; }
}

/* The last step stays lit once the room is in */
@keyframes rv-step-last {
  from { opacity: 0.62; }
  to { opacity: 1; }
}

/* 04 Deliver: the switcher */
.tw {
  border-top: 1px solid var(--rule);
}

.tw__top {
  padding: 28px 24px 20px;
}

.tw__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.tw__tab {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 10px;
  align-items: baseline;
  padding: 14px 24px 16px;
  font: 600 18px/1.2 var(--font-ui);
  color: var(--muted);
  text-align: left;
  cursor: pointer;
  background: none;
  border: 0;
  box-shadow: inset 0 -2px 0 transparent;
  transition: color 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
}

.tw__tab + .tw__tab {
  border-left: 1px solid var(--rule);
}

.tw__tab b {
  font-size: 13px;
  color: var(--c-accent);
}

.tw__tab em {
  grid-column: 2;
  font: 500 10.5px/1.2 var(--font-ui);
  font-style: normal;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tw__tab:hover {
  color: var(--c-fg);
}

.tw__tab[aria-selected='true'] {
  color: var(--c-fg);
  box-shadow: inset 0 -2px 0 var(--c-accent);
}

.tw__tab:focus-visible {
  outline-offset: -3px;
}

.tw__names {
  display: grid;
  overflow: clip;
}

.tw__name {
  grid-area: 1 / 1;
  margin: 0;
  padding: 20px 24px 6px;
  font: 700 clamp(72px, 11vw, 150px)/0.9 var(--font-ui);
  letter-spacing: -0.045em;
  white-space: nowrap;
  overflow: clip;
}

.tw__name small {
  margin-left: 0.3em;
  font-size: 0.16em;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tw-enter-active,
.tw-leave-active {
  transition: opacity 0.22s var(--ease-out), translate 0.3s var(--ease-out);
}

.tw-enter-from {
  opacity: 0;
  translate: 0 24px;
}

.tw-leave-to {
  opacity: 0;
  translate: 0 -16px;
}

.tw__media {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
  padding: 16px 24px 24px;
}

.tw__vid,
.tw__cmp {
  position: relative;
  aspect-ratio: 16 / 9;
  margin: 0;
  overflow: hidden;
  background: #000;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.tw__vid video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tw__vid figcaption,
.tw__tag {
  position: absolute;
  top: 10px;
  padding: 3px 7px;
  font: 500 10.5px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border-radius: 5px;
  pointer-events: none;
}

.tw__vid figcaption,
.tw__tag--l {
  left: 10px;
}

.tw__tag--r {
  right: 10px;
}

.tw__cmp .pic {
  position: absolute;
  inset: 0;
}

.tw__before {
  clip-path: inset(0 calc(100% - var(--cut)) 0 0);
}

.tw__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--cut);
  width: 2px;
  margin-left: -1px;
  background: var(--c-fg);
  pointer-events: none;
}

.tw__knob {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  translate: -50% -50%;
  background: var(--c-bg);
  border: 2px solid var(--c-fg);
  border-radius: 50%;
}

.tw__knob::before,
.tw__knob::after {
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  margin-top: -5px;
  content: '';
  border: 5px solid transparent;
}

.tw__knob::before {
  left: 7px;
  border-right-color: var(--c-fg);
}

.tw__knob::after {
  right: 7px;
  border-left-color: var(--c-fg);
}

.tw__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.tw__cmp:has(.tw__range:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.tw__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid var(--rule);
}

.tw__facts div {
  padding: 14px 24px 18px;
}

.tw__facts div + div {
  border-left: 1px solid var(--rule);
}

.tw__facts dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.tw__facts dd {
  margin: 6px 0 0;
  font: 400 13.5px/1.45 var(--font-ui);
}

.tw__renders {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.tw__renders .pic {
  aspect-ratio: 16 / 9;
}

/* 05 Problems */
.pg {
  border-top: 1px solid var(--rule);
}

.pg__count {
  padding: 28px 24px 20px;
}

.pg__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.pg__grid li {
  display: grid;
  align-content: start;
  gap: 14px;
  min-height: 150px;
  padding: 18px 24px 22px;
  font: 600 18px/1.3 var(--font-ui);
  background: var(--c-bg);
}

.pg__grid b {
  font: 700 40px/1 var(--font-ui);
  letter-spacing: -0.03em;
  color: var(--c-accent);
}

/* The close: the crit video edge to edge */
.cb {
  border-top: 1px solid var(--rule);
}

.cb__screen {
  aspect-ratio: 16 / 9;
}

.cb__foot {
  margin: 0;
  padding: 16px 24px 20px;
  font: 400 15px/1.5 var(--font-ui);
  border-top: 1px solid var(--rule);
}

.cb__foot b {
  margin-right: 10px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.cb__rooms {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.cb__rooms .pic {
  aspect-ratio: 16 / 9;
}

/* The track strip under the hero (was AsLead's): each tile jumps to its track */
.ld__strip {
  display: grid;
  grid-template-columns: repeat(var(--n), minmax(0, 1fr));
}

.ld__tile {
  position: relative;
  display: block;
  aspect-ratio: 16 / 9;
  color: var(--c-fg);
  text-decoration: none;
  outline-offset: -3px;
}

.ld__tile + .ld__tile {
  border-left: 1px solid var(--rule);
}

.ld__tile .pic {
  position: absolute;
  inset: 0;
  transition: opacity 0.25s var(--ease-out);
}

.ld__tile:hover .pic,
.ld__tile:focus-visible .pic {
  opacity: 0.7;
}

.ld__label {
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

.ld__label b {
  color: var(--c-accent);
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .tw-enter-active,
  .tw-leave-active {
    transition: none;
  }

  .cs__cell > * {
    opacity: 1;
    translate: none;
    transition: none;
  }
}

@media (max-width: 720px) {
  .ld__label {
    left: 6px;
    bottom: 6px;
    max-width: calc(100% - 12px);
    padding: 3px 6px;
  }

  /* The number on its own line, so a two-word title ("Fading Away") fits the tile */
  .ld__label b {
    display: block;
  }

  .ds,
  .cs__head,
  .tw__media {
    grid-template-columns: minmax(0, 1fr);
  }

  .ds__words {
    padding: 24px 16px 28px;
  }

  .ds__pics {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .cs__head {
    padding: 22px 16px;
  }

  .cs__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-auto-rows: calc((100cqi - 1px) / 2 * 0.75);
  }

  .cs__cell--tall {
    grid-row: auto;
  }

  .cs__cell--wide-d {
    grid-column: auto;
  }

  /* Phones: no pin; the three frames stack with their words */
  .rv__intro {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 16px;
  }

  .rv__run {
    height: auto;
  }

  .rv__stage {
    position: static;
    grid-template-rows: none;
    height: auto;
  }

  .rv__head {
    grid-template-columns: minmax(0, 1fr);
    padding: 18px 16px 22px;
  }

  .rv__steps {
    grid-template-columns: minmax(0, 1fr);
  }

  .rv__steps li {
    opacity: 1;
    animation: none;
  }

  .rv__frame {
    display: grid;
    gap: 1px;
    margin: 0;
    aspect-ratio: auto;
    border: 0;
    border-top: 1px solid var(--rule);
    border-radius: 0;
  }

  .rv__layer {
    position: relative;
    aspect-ratio: 16 / 9;
  }

  .rv__layer + .rv__layer {
    clip-path: none;
    animation: none;
  }

  .tw__top,
  .pg__count {
    padding: 22px 16px 16px;
  }

  .tw__tab {
    grid-template-columns: 1fr;
    padding: 12px 10px 14px;
    font-size: 15px;
  }

  .tw__tab em {
    grid-column: 1;
  }

  .tw__name {
    padding: 16px 16px 4px;
  }

  .tw__media {
    padding: 12px 16px 16px;
  }

  .tw__facts,
  .pg__grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .tw__facts div {
    padding: 12px 16px 14px;
  }

  .tw__facts div + div {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .tw__renders {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pg__grid li {
    grid-template-columns: 34px minmax(0, 1fr);
    gap: 10px;
    min-height: 0;
    padding: 14px 16px 16px;
    font-size: 16px;
  }

  .pg__grid b {
    font-size: 20px;
    line-height: 1.15;
  }

  .cb__foot {
    padding: 14px 16px 16px;
  }

  .cb__rooms {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
