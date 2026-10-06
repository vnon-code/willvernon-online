<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import AsLead from './AsLead.vue'

// PROTOTYPE T2b "Track switcher, polished" (overnight run, Amplified Spaces): T2 plus round 1's six next-round changes
// (matrix.md): a closing beat (T's huge type crossing behind the B17 crit video once), Define's B17 stage at full
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
    'The CRT look for B17 was a struggle.',
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
const lead = computed(() => tracks.value.map(t => ({ m: t.frames[0] ?? t.splash!, label: t.title, short: t.title.split(' ')[0], to: 'as2b-tracks' })))
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

// The contact sheet's spans: the networks two columns wide, the GPU particles two rows tall (dense flow packs the
// 4-column sheet with no holes)
const span = (src: string) => /p16-0|p31-0/.test(src) ? 'cs__cell--wide' : /p23-[12]/.test(src) ? 'cs__cell--tall' : ''

// The closing beat: the crit video, the rooms after it
const crit = computed(() => s.value.outcome?.media.find(m => m.type === 'video'))
const rooms = computed(() => s.value.outcome?.media.filter(m => m.type !== 'video') ?? [])

// The phase marker (left margin) shows the last phase whose top has passed the view's middle (read on scroll, once a
// frame, so a jump lands on the right one); the contact sheet's cells rise in once
const phases = ['Discover', 'Develop', 'Define', 'Deliver', 'Problems']
const active = ref(-1)
let marks: HTMLElement[] = []
let layerEl: HTMLElement | null = null
let raf = 0
function mark() {
  raf = 0
  if (!layerEl) return
  const r = layerEl.getBoundingClientRect()
  const mid = r.top + r.height / 2
  active.value = marks.reduce((a, el) => el.getBoundingClientRect().top < mid ? Number(el.dataset.phase) : a, -1)
}
const onScroll = () => (raf ||= requestAnimationFrame(mark))
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
  layerEl = layer
  marks = [...layer?.querySelectorAll<HTMLElement>('[data-phase]') ?? []]
  layer?.addEventListener('scroll', onScroll, { passive: true })
  mark()
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
  cancelAnimationFrame(raf)
  layerEl?.removeEventListener('scroll', onScroll)
  rio?.disconnect()
})
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <AsLead :story="s" :items="lead" @go="pick" />

    <!-- 01 Discover: the brief's question, Tom and the album art -->
    <section v-if="discover" class="ds" data-sheet-block="discover" data-phase="0" aria-label="Discover">
      <div class="ds__words">
        <p class="t2__count">
          <b>01</b> / 05 <span>Discover</span>
        </p>
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
    <section v-if="develop" class="cs" data-sheet-block="develop" data-phase="1" aria-label="Develop">
      <div class="cs__head">
        <p class="t2__count">
          <b>02</b> / 05 <span>Develop</span>
        </p>
        <p class="t2__text">
          {{ develop.text }}
        </p>
      </div>
      <ol class="cs__grid">
        <li v-for="(m, i) in develop.media" :key="m.src" class="cs__cell" :class="span(m.src)" :style="{ '--d': `${(i % 4) * 70}ms` }">
          <SheetPic :m="m" />
          <p class="cs__cap">
            <b>{{ pad(i) }}</b> {{ m.caption }}
          </p>
        </li>
      </ol>
    </section>

    <!-- 03 Define: B17 wipes from the network to the visual to the room as you scroll -->
    <section v-if="wipe.length" class="rv" data-sheet-block="define" data-phase="2" aria-label="Define">
      <div class="rv__intro">
        <p class="t2__count">
          <b>03</b> / 05 <span>Define</span>
        </p>
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
    <section id="as2b-tracks" class="tw" data-sheet-block="tracks" data-phase="3" aria-label="Deliver">
      <div class="tw__top">
        <p class="t2__count">
          <b>04</b> / 05 <span>Deliver</span>
        </p>
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
    <section v-if="s.problems?.length" class="pg" data-sheet-block="problems" data-phase="4" aria-label="Problems">
      <p class="t2__count pg__count">
        <b>05</b> / 05 <span>Problems</span>
      </p>
      <ol class="pg__grid">
        <li v-for="(p, i) in s.problems" :key="p">
          <b>{{ pad(i) }}</b>{{ p }}
        </li>
      </ol>
    </section>

    <!-- The close: T's huge type crosses behind the B17 crit video once; then the three rooms -->
    <section v-if="s.outcome" class="cb" data-sheet-block="outcome" aria-label="Outcome">
      <div v-if="crit" class="cb__run" data-progress>
        <div class="cb__stage">
          <p class="cb__type" aria-hidden="true">
            Final crit
          </p>
          <SheetPic class="cb__screen" :m="crit" cap />
          <p class="cb__foot">
            <b>Outcome</b> {{ s.outcome.text }}
          </p>
        </div>
      </div>
      <div v-if="rooms.length" class="cb__rooms" :style="{ '--n': rooms.length }">
        <SheetPic v-for="m in rooms" :key="m.src" :m="m" cap />
      </div>
    </section>

    <Teleport to="body">
      <ol class="pm" aria-hidden="true">
        <li v-for="(p, i) in phases" :key="p" :class="{ 'is-on': i === active }">
          <span>{{ p }}</span><b>{{ pad(i) }}</b>
        </li>
      </ol>
    </Teleport>
  </SheetShell>
</template>

<style scoped>
.t2__count {
  margin: 0;
  font: 500 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
}

.t2__count b {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-accent);
}

.t2__count span {
  margin-left: 10px;
  font-size: 11px;
  text-transform: uppercase;
}

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
  opacity: calc(0.3 + 0.7 * clamp(0, 1 - abs(var(--p, 0) * 2.4 - var(--i)), 1));
}

.rv__steps b {
  font: 600 13px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.rv__steps span {
  font: 400 13.5px/1.45 var(--font-ui);
  color: var(--muted);
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
    opacity: 0.3;
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
  0%, 100% { opacity: 0.3; }
  20%, 80% { opacity: 1; }
}

/* The last step stays lit once the room is in */
@keyframes rv-step-last {
  from { opacity: 0.3; }
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

/* The close: T's stage, once */
.cb {
  border-top: 1px solid var(--rule);
}

.cb__run {
  height: calc(var(--view-h) + 70svh);
}

.cb__stage {
  position: sticky;
  top: -16px; /* as .rv__stage */
  height: var(--view-h);
  overflow: hidden;
}

.cb__type {
  position: absolute;
  top: 44%;
  left: 0;
  margin: 0;
  font: 700 clamp(130px, 18vw, 260px)/0.9 var(--font-ui);
  letter-spacing: -0.045em;
  white-space: nowrap;
  translate: calc(30% - var(--p, 0) * 110%) -50%;
  will-change: translate;
  pointer-events: none;
}

@supports (animation-timeline: view()) {
  .cb__run {
    view-timeline: --cb block;
    view-timeline-inset: var(--header-h) 0;
  }

  .cb__type {
    animation: cb-type linear both;
    animation-timeline: --cb;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes cb-type {
  from { translate: 30% -50%; }
  to { translate: -80% -50%; }
}

.cb__screen {
  position: absolute;
  top: 44%;
  left: 50%;
  width: min(62%, calc(var(--view-h) * 0.58 * 16 / 9));
  aspect-ratio: 16 / 9;
  translate: -50% -50%;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.cb__foot {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  padding: 16px 24px 20px;
  font: 400 15px/1.5 var(--font-ui);
  background: var(--c-bg);
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

/* The phase marker: a slim plate in the left margin, level with the view's middle, shown while the Sheet is open */
.pm {
  position: fixed;
  top: 50%;
  right: calc(50% + min(520px, 50% - 16px) + 20px);
  z-index: 5001;
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 8px 10px;
  list-style: none;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  translate: 0 -50%;
  opacity: 0;
  transition: opacity 0.15s var(--ease-out);
  pointer-events: none;
}

:root[data-sheet='open'] .pm {
  opacity: 1;
  transition-duration: 0.3s;
}

.pm li {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: baseline;
  font: 500 11px/1.6 var(--font-ui);
  letter-spacing: 0.06em;
  color: var(--muted);
}

.pm b {
  font-weight: 600;
}

.pm span {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0;
  translate: 4px 0;
  transition: opacity 0.2s var(--ease-out), translate 0.2s var(--ease-out);
}

.pm .is-on {
  color: var(--c-fg);
}

.pm .is-on b {
  color: var(--c-accent);
}

.pm .is-on span {
  opacity: 1;
  translate: none;
}

@media (max-width: 1199px) {
  .pm {
    display: none;
  }
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

  .cb__run {
    height: auto;
  }

  .cb__stage {
    position: static;
    display: grid;
    height: auto;
    overflow: clip;
  }

  .cb__type {
    position: static;
    padding: 18px 16px 10px;
    font-size: 64px;
    white-space: normal;
    translate: none;
    animation: none;
  }

  .cb__screen {
    position: relative;
    top: auto;
    left: auto;
    width: auto;
    margin: 0 16px 16px;
    translate: none;
  }

  .cb__foot {
    position: static;
    padding: 14px 16px 16px;
  }

  .cb__rooms {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
