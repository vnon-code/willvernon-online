<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import AsLead from './AsLead.vue'

// PROTOTYPE T2 "Track switcher" (overnight run, Amplified Spaces; T polished, its beats varied).
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

const s = computed(() => props.sheet.card.story!)
const tracks = computed(() => s.value.tracks)
const phase = (id: string) => s.value.process.find(p => p.id === id)
const discover = computed(() => phase('discover'))
const develop = computed(() => phase('develop'))
const define = computed(() => phase('define'))
const lead = computed(() => tracks.value.map(t => ({ m: t.frames[0] ?? t.splash!, label: t.title, to: 'as2-tracks' })))
const question = computed(() => s.value.brief?.find(b => b.k === 'Question')?.v ?? s.value.hook)
// The wipe: B17's network, then its CRT frame, then the room
const b17 = computed(() => tracks.value.find(t => t.id === 'b17'))
const wipe = computed(() => {
  const t = b17.value
  if (!t) return []
  return [
    t.network[0] && { m: t.network[0], k: 'The network', v: 'Volume in, circles out, then the CRT chain.' },
    t.frames[0] && { m: t.frames[0], k: 'The visual', v: t.visual },
    t.splash && { m: t.splash, k: 'The room', v: t.room },
  ].filter(Boolean) as { m: NonNullable<typeof t.splash>, k: string, v: string }[]
})

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
  io = new IntersectionObserver(([e]) => {
    seen = !!e?.isIntersecting
    play()
  }, { root: stage.value?.closest<HTMLElement>('[data-sheet-layer]') ?? null, threshold: 0.25 })
  if (stage.value) io.observe(stage.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <AsLead :story="s" :items="lead" count="05" @go="pick" />

    <!-- 01 Discover: the brief's question, Tom and the album art -->
    <section v-if="discover" class="ds" data-sheet-block="discover" aria-label="Discover">
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
    <section v-if="develop" class="cs" data-sheet-block="develop" aria-label="Develop">
      <div class="cs__head">
        <p class="t2__count">
          <b>02</b> / 05 <span>Develop</span>
        </p>
        <p class="t2__text">
          {{ develop.text }}
        </p>
      </div>
      <ol class="cs__grid">
        <li v-for="(m, i) in develop.media" :key="m.src" class="cs__cell" :class="{ 'cs__cell--big': m.src.includes('p31') }">
          <SheetPic :m="m" />
          <p class="cs__cap">
            <b>{{ pad(i) }}</b> {{ m.caption }}
          </p>
        </li>
      </ol>
    </section>

    <!-- 03 Define: B17 wipes from the network to the visual to the room as you scroll -->
    <section v-if="wipe.length" class="rv" data-sheet-block="define" aria-label="Define">
      <div class="rv__run" data-progress>
        <div class="rv__stage">
          <div class="rv__side">
            <p class="t2__count">
              <b>03</b> / 05 <span>Define</span>
            </p>
            <p class="rv__big">
              B17
            </p>
            <ol class="rv__steps">
              <li v-for="(w, i) in wipe" :key="w.k" :style="{ '--i': i }">
                <b>{{ w.k }}</b>
                <span>{{ w.v }}</span>
              </li>
            </ol>
            <p v-if="define" class="t2__text rv__text">
              {{ define.text }}
            </p>
          </div>
          <div class="rv__frame">
            <SheetPic v-for="(w, i) in wipe" :key="w.m.src" class="rv__layer" :m="w.m" :style="{ '--i': i }" />
          </div>
        </div>
      </div>
    </section>

    <!-- 04 Deliver: the rooms, one track at a time -->
    <section id="as2-tracks" class="tw" data-sheet-block="tracks" aria-label="Three tracks, three rooms">
      <div class="tw__top">
        <p class="t2__count">
          <b>04</b> / 05 <span>Three tracks, three rooms</span>
        </p>
      </div>
      <div class="tw__tabs" role="tablist" aria-label="Tracks" @keydown="key">
        <button
          v-for="(x, i) in tracks"
          :id="`as2-tab-${x.id}`"
          :key="x.id"
          ref="tabs"
          class="tw__tab"
          role="tab"
          type="button"
          :aria-selected="i === on"
          :aria-controls="`as2-panel`"
          :tabindex="i === on ? 0 : -1"
          @click="pick(i)"
        >
          <b>{{ pad(i) }}</b>
          <span>{{ x.title }}</span>
          <em v-if="x.light">{{ x.light }} light</em>
        </button>
      </div>
      <div id="as2-panel" class="tw__panel" role="tabpanel" :aria-labelledby="`as2-tab-${t.id}`">
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
            <figcaption>The visual, playing</figcaption>
          </figure>
          <div v-if="t.frames[0] && t.splash" class="tw__cmp" :style="{ '--cut': `${cut}%` }">
            <SheetPic class="tw__after" :m="t.splash" />
            <SheetPic class="tw__before" :m="t.frames[0]" />
            <span class="tw__line" aria-hidden="true" />
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
    <section v-if="s.problems?.length" class="pg" data-sheet-block="problems" aria-label="Problems met">
      <p class="t2__count pg__count">
        <b>05</b> / 05 <span>Problems met</span>
      </p>
      <ol class="pg__grid">
        <li v-for="(p, i) in s.problems" :key="p">
          <b>{{ pad(i) }}</b>{{ p }}
        </li>
      </ol>
    </section>

    <SheetOutcome v-if="s.outcome" :outcome="s.outcome" />
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
  align-content: start;
  gap: 22px;
  padding: 32px 24px 36px;
}

.ds__q {
  margin: 0;
  font: 700 clamp(30px, 4vw, 50px)/1.04 var(--font-ui);
  letter-spacing: -0.03em;
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
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.cs__cell {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--c-bg);
}

.cs__cell--big {
  grid-column: span 2;
  grid-row: span 2;
  aspect-ratio: auto;
}

/* The last cell closes the sheet's last row (two cells wide) */
.cs__cell:last-child:not(.cs__cell--big) {
  grid-column: span 2;
  aspect-ratio: 8 / 3;
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

.rv__run {
  height: calc(var(--view-h) + 110svh);
}

.rv__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.5fr);
  height: var(--view-h);
  overflow: clip;
}

.rv__side {
  display: grid;
  align-content: center;
  gap: 18px;
  padding: 24px;
  border-right: 1px solid var(--rule);
}

.rv__big {
  margin: 0;
  font: 700 clamp(80px, 11vw, 150px)/0.85 var(--font-ui);
  letter-spacing: -0.05em;
}

.rv__steps {
  display: grid;
  gap: 12px;
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

.rv__text {
  font-size: 13.5px;
}

.rv__frame {
  position: relative;
  margin: 24px;
  overflow: hidden;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
  align-self: center;
  aspect-ratio: 16 / 9;
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
  .rv__steps li:nth-child(3) { animation-range: contain 66% contain 100%; }
}

@keyframes rv-wipe {
  to { clip-path: inset(0); }
}

@keyframes rv-step {
  0%, 100% { opacity: 0.3; }
  20%, 80% { opacity: 1; }
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

@media (prefers-reduced-motion: reduce) {
  .tw-enter-active,
  .tw-leave-active {
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
  }

  .cs__cell--big {
    grid-row: auto;
    aspect-ratio: 16 / 9;
  }

  /* Phones: no pin; the three frames stack with their words */
  .rv__run {
    height: auto;
  }

  .rv__stage {
    position: static;
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .rv__side {
    padding: 22px 16px;
    border-right: 0;
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
    min-height: 0;
    padding: 16px;
  }
}
</style>
