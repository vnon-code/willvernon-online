<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import AsLead from './AsLead.vue'

// PROTOTYPE T3 "Double diamond" (overnight run, Amplified Spaces; T polished, its beats varied).
// Refs: the process book's own spine (Discover → Develop → Define → Deliver, a double diamond); Kenta Toshikura's
// drift (T's huge type crossing behind the work, kept for one beat: the outcome); Rejouice / Obys (a sticky chapter
// rail; a swipeable strip; rooms as columns that open).
// Beats, each with its own device, beside a sticky rail (the double diamond, the chapter's number huge):
// the four phases as an index strip under the hero → Discover, the question in big type and what I looked at as a
// type list → Develop, the experiments in a strip you swipe → Define, a split: TouchDesigner's half, Blender's half
// → Deliver, the three rooms as columns, one open at a time → Problems, a counted list → the outcome: B17's crit video
// pinned while "Outcome" crosses behind it, then the three rooms fanned out.
// PLACEHOLDER: every size, the rail, the copy.
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
const deliver = computed(() => phase('deliver'))
const lead = computed(() => s.value.process.filter(p => p.media[0]).map(p => ({ m: p.media[0]!, label: p.title, to: `as3-${p.id}` })))
const question = computed(() => s.value.brief?.find(b => b.k === 'Question')?.v ?? s.value.hook)
const split = computed(() => {
  const vis = define.value?.media.find(m => m.src.includes('p42'))
  const room = tracks.value[0]?.build
  return vis && room ? [{ m: vis, who: 'TouchDesigner', what: 'makes the visual.' }, { m: room, who: 'Blender', what: 'builds the room.' }] : []
})
const video = computed(() => s.value.outcome?.media.find(m => m.type === 'video'))
const fan = computed(() => tracks.value.map(t => t.splash).filter(m => !!m).map(m => m!))
const chapters = computed(() => [
  discover.value && { id: 'discover', title: 'Discover' },
  develop.value && { id: 'develop', title: 'Develop' },
  define.value && { id: 'define', title: 'Define' },
  deliver.value && { id: 'deliver', title: 'Deliver' },
  s.value.problems?.length && { id: 'problems', title: 'Problems' },
].filter(Boolean) as { id: string, title: string }[])
const at = (id: string) => chapters.value.findIndex(c => c.id === id)
const fanAt = (i: number, n: number) => {
  const d = i - (n - 1) / 2
  return { '--r': `${d * 5}deg`, '--x': `${d * 21}%`, '--y': `${Math.abs(d) * 16}px`, 'zIndex': 10 - Math.round(Math.abs(d) * 2) }
}

// The rail follows the chapter in the middle of the view
const active = ref(0)
const body = ref<HTMLElement>()
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) active.value = Number((e.target as HTMLElement).dataset.i)
  }, { root: body.value?.closest<HTMLElement>('[data-sheet-layer]') ?? null, rootMargin: '-45% 0px -45% 0px' })
  body.value?.querySelectorAll('[data-i]').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

// Develop's strip: native horizontal scroll with snap; the buttons step it, the counter follows it
const strip = ref<HTMLElement>()
const shown = ref(0)
let raf = 0
function onStrip() {
  raf ||= requestAnimationFrame(() => {
    raf = 0
    const el = strip.value
    const first = el?.firstElementChild as HTMLElement | null
    if (el && first) shown.value = Math.round(el.scrollLeft / (first.offsetWidth + 12))
  })
}
function step(d: number) {
  const el = strip.value
  const first = el?.firstElementChild as HTMLElement | null
  if (!el || !first) return
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollBy({ left: d * (first.offsetWidth + 12), behavior: reduce ? 'auto' : 'smooth' })
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

// Deliver: one room open at a time
const room = ref(0)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <AsLead :story="s" :items="lead" :count="pad(chapters.length)" />

    <section class="ch" data-sheet-block="chapters" aria-label="Process">
      <aside class="ch__rail" aria-hidden="true">
        <svg class="ch__dd" viewBox="0 0 200 64">
          <path d="M2 32 L50 2 L50 62 Z" :class="{ on: active === at('discover') }" />
          <path d="M50 2 L98 32 L50 62 Z" :class="{ on: active === at('develop') }" />
          <path d="M102 32 L150 2 L150 62 Z" :class="{ on: active === at('define') }" />
          <path d="M150 2 L198 32 L150 62 Z" :class="{ on: active === at('deliver') }" />
        </svg>
        <div class="ch__now">
          <p v-for="(c, i) in chapters" :key="c.id" class="ch__big" :class="{ 'is-on': i === active, 'is-past': i < active }">
            <b>{{ pad(i) }}</b>
            <span>{{ c.title }}</span>
          </p>
        </div>
        <ol class="ch__list">
          <li v-for="(c, i) in chapters" :key="c.id" :class="{ 'is-on': i === active }">
            {{ pad(i) }} {{ c.title }}
          </li>
        </ol>
      </aside>

      <div ref="body" class="ch__body">
        <!-- Discover: the question, and the work looked at first as a type list -->
        <article v-if="discover" id="as3-discover" class="ch__part" :data-i="at('discover')">
          <h3 class="ch__h">
            <b>{{ pad(at('discover')) }}</b> Discover
          </h3>
          <p class="dc__q">
            {{ question }}
          </p>
          <p class="t3__text">
            {{ discover.text }}
          </p>
          <div class="dc__row">
            <SheetPic v-for="m in discover.media.slice(0, 3)" :key="m.src" :m="m" cap />
          </div>
          <ul v-if="s.context?.length" class="dc__ctx">
            <li v-for="c in s.context" :key="c">
              {{ c }}
            </li>
          </ul>
        </article>

        <!-- Develop: the experiments in a strip you swipe -->
        <article v-if="develop" id="as3-develop" class="ch__part" :data-i="at('develop')">
          <h3 class="ch__h">
            <b>{{ pad(at('develop')) }}</b> Develop
          </h3>
          <p class="t3__text">
            {{ develop.text }}
          </p>
          <div class="sp">
            <ol ref="strip" class="sp__track" tabindex="0" aria-label="Experiments" @scroll.passive="onStrip">
              <li v-for="(m, i) in develop.media" :key="m.src" class="sp__cell">
                <SheetPic :m="m" />
                <p class="sp__cap">
                  <b>{{ pad(i) }}</b> {{ m.caption }}
                </p>
              </li>
            </ol>
            <div class="sp__nav">
              <button type="button" class="sp__btn" aria-label="Previous experiment" :disabled="shown <= 0" @click="step(-1)">
                ←
              </button>
              <span class="sp__count"><b>{{ pad(shown) }}</b> / {{ pad(develop.media.length - 1) }}</span>
              <button type="button" class="sp__btn" aria-label="Next experiment" :disabled="shown >= develop.media.length - 1" @click="step(1)">
                →
              </button>
            </div>
          </div>
        </article>

        <!-- Define: the split, one program to a half -->
        <article v-if="define" id="as3-define" class="ch__part" :data-i="at('define')">
          <h3 class="ch__h">
            <b>{{ pad(at('define')) }}</b> Define
          </h3>
          <div v-if="split.length" class="dv">
            <figure v-for="h in split" :key="h.who" class="dv__half">
              <SheetPic :m="h.m" />
              <figcaption><b>{{ h.who }}</b> {{ h.what }}</figcaption>
            </figure>
          </div>
          <p class="t3__text">
            {{ define.text }}
          </p>
        </article>

        <!-- Deliver: the rooms as columns, one open at a time -->
        <article v-if="deliver" id="as3-deliver" class="ch__part" :data-i="at('deliver')">
          <h3 class="ch__h">
            <b>{{ pad(at('deliver')) }}</b> Deliver
          </h3>
          <p class="t3__text">
            {{ deliver.text }}
          </p>
          <div class="rm">
            <div v-for="(t, i) in tracks" :key="t.id" class="rm__col" :class="{ 'is-open': i === room }" @pointerenter="room = i">
              <SheetPic v-if="t.splash" class="rm__pic" :m="t.splash" />
              <button type="button" class="rm__btn" :aria-expanded="i === room" :aria-controls="`as3-room-${t.id}`" @click="room = i" @focus="room = i">
                <b>{{ pad(i) }}</b> {{ t.title }}
              </button>
              <div :id="`as3-room-${t.id}`" class="rm__words">
                <p v-if="t.light" class="rm__light">
                  {{ t.light }} light<template v-if="t.subtitle">
                    · {{ t.subtitle }}
                  </template>
                </p>
                <p>{{ t.room }}</p>
                <p class="rm__muted">
                  {{ t.visual }}
                </p>
              </div>
            </div>
          </div>
        </article>

        <!-- Problems: a counted list -->
        <article v-if="s.problems?.length" id="as3-problems" class="ch__part" :data-i="at('problems')">
          <h3 class="ch__h">
            <b>{{ pad(at('problems')) }}</b> Problems met
          </h3>
          <ol class="pl">
            <li v-for="(p, i) in s.problems" :key="p">
              <b>{{ pad(i) }}</b>{{ p }}
            </li>
          </ol>
        </article>
      </div>
    </section>

    <!-- The outcome: T's stage, once. B17's crit video pinned while "Outcome" crosses behind it; then the rooms fanned -->
    <section v-if="s.outcome" class="ob" data-sheet-block="outcome" aria-label="Outcome">
      <div v-if="video" class="ob__run" data-progress>
        <div class="ob__stage">
          <p class="ob__type" aria-hidden="true">
            Outcome
          </p>
          <SheetPic class="ob__screen" :m="video" cap :style="{ '--a': video.aspect ?? 16 / 9 }" />
          <p class="ob__foot">
            {{ s.outcome.text }}
          </p>
        </div>
      </div>
      <div v-if="fan.length" class="ob__fan">
        <SheetPic v-for="(m, j) in fan" :key="m.src" class="ob__card" :m="m" cap :style="fanAt(j, fan.length)" />
      </div>
    </section>
  </SheetShell>
</template>

<style scoped>
.t3__text {
  max-width: 620px;
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The chapters: a sticky rail beside the parts */
.ch {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.ch__rail {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  height: var(--view-h);
  padding: 28px 24px;
  border-right: 1px solid var(--rule);
}

.ch__dd {
  width: 100%;
  height: auto;
}

.ch__dd path {
  fill: transparent;
  stroke: var(--rule);
  stroke-width: 1.5;
  transition: fill 0.35s var(--ease-out), stroke 0.35s var(--ease-out);
}

.ch__dd path.on {
  fill: var(--c-accent);
  stroke: var(--c-accent);
}

.ch__now {
  position: relative;
  overflow: clip;
}

.ch__big {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  margin: 0;
  opacity: 0;
  translate: 0 30%;
  transition: opacity 0.3s var(--ease-out), translate 0.4s var(--ease-out);
}

.ch__big.is-past {
  translate: 0 -30%;
}

.ch__big.is-on {
  opacity: 1;
  translate: 0 0;
}

.ch__big b {
  font: 700 128px/0.85 var(--font-ui);
  letter-spacing: -0.05em;
  color: var(--c-accent);
}

.ch__big span {
  font: 600 26px/1.2 var(--font-ui);
  letter-spacing: -0.015em;
}

.ch__list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ch__list .is-on {
  color: var(--c-fg);
}

.ch__part {
  display: grid;
  gap: 20px;
  padding: 32px 24px 40px;
  scroll-margin-top: var(--header-h);
}

.ch__part + .ch__part {
  border-top: 1px solid var(--rule);
}

.ch__h {
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ch__h b {
  margin-right: 6px;
  color: var(--c-accent);
}

/* Discover */
.dc__q {
  margin: 0;
  font: 700 clamp(30px, 3.8vw, 48px)/1.04 var(--font-ui);
  letter-spacing: -0.03em;
}

.dc__row {
  display: grid;
  grid-template-columns: 1.35fr 1fr 1fr;
  gap: 1px;
  overflow: hidden;
  border-radius: 8px;
}

.dc__row .pic {
  aspect-ratio: 1;
}

.dc__row .pic:first-child {
  aspect-ratio: auto;
}

.dc__ctx {
  margin: 0;
  padding: 0;
  list-style: none;
}

.dc__ctx li {
  padding: 8px 0 10px;
  font: 600 clamp(20px, 2.4vw, 28px)/1.2 var(--font-ui);
  letter-spacing: -0.015em;
  border-top: 1px solid var(--rule);
}

.dc__ctx li::before {
  content: '→ ';
  color: var(--c-accent);
}

/* Develop: the swipe strip */
.sp {
  display: grid;
  gap: 12px;
  margin: 0 -24px;
}

.sp__track {
  display: grid;
  grid-auto-columns: min(62%, 460px);
  grid-auto-flow: column;
  gap: 12px;
  margin: 0;
  padding: 0 24px 4px;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 24px;
  scrollbar-width: none;
}

.sp__track::-webkit-scrollbar {
  display: none;
}

.sp__track:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.sp__cell {
  scroll-snap-align: start;
}

.sp__cell .pic {
  aspect-ratio: 16 / 10;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.sp__cap {
  margin: 10px 0 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--muted);
}

.sp__cap b,
.sp__count b {
  color: var(--c-accent);
}

.sp__nav {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 24px;
}

.sp__btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  font: 500 16px/1 var(--font-ui);
  color: var(--c-fg);
  cursor: pointer;
  background: none;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 50%;
  transition: opacity 0.2s var(--ease-out);
}

.sp__btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.sp__count {
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
}

/* Define: the split */
.dv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  margin: 0 -24px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.dv__half {
  display: grid;
  grid-template-rows: auto 1fr;
  margin: 0;
  background: var(--c-bg);
}

.dv__half .pic {
  aspect-ratio: 4 / 3;
}

.dv__half figcaption {
  padding: 16px 24px 20px;
  font: 700 clamp(22px, 2.6vw, 34px)/1.08 var(--font-ui);
  letter-spacing: -0.025em;
  color: var(--muted);
}

.dv__half figcaption b {
  display: block;
  color: var(--c-fg);
}

/* Deliver: the rooms as columns */
.rm {
  display: flex;
  height: min(64svh, 520px);
  gap: 1px;
  overflow: hidden;
  background: var(--rule);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.rm__col {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  background: var(--c-bg);
  transition: flex-grow 0.5s var(--ease-out);
}

.rm__col.is-open {
  flex-grow: 3.4;
}

.rm__pic {
  position: absolute;
  inset: 0;
  opacity: 0.55;
  transition: opacity 0.4s var(--ease-out);
}

.rm__col.is-open .rm__pic {
  opacity: 1;
}

.rm__btn {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 5px 10px;
  font: 600 15px/1.2 var(--font-ui);
  max-width: calc(100% - 28px);
  color: var(--c-fg);
  text-align: left;
  cursor: pointer;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.rm__btn b {
  color: var(--c-accent);
}

.rm__words {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  gap: 6px;
  padding: 14px 16px 16px;
  background: var(--c-bg);
  border-top: 1px solid var(--rule);
  opacity: 0;
  translate: 0 12px;
  transition: opacity 0.25s var(--ease-out), translate 0.3s var(--ease-out);
}

.rm__col.is-open .rm__words {
  opacity: 1;
  translate: 0 0;
  transition-delay: 0.15s;
}

.rm__words p {
  margin: 0;
  font: 400 13.5px/1.45 var(--font-ui);
}

.rm__words .rm__light {
  font: 500 10.5px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.rm__words .rm__muted {
  color: var(--muted);
}

/* Problems */
.pl {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pl li {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  padding: 12px 0 14px;
  font: 600 clamp(18px, 2vw, 23px)/1.3 var(--font-ui);
  border-top: 1px solid var(--rule);
}

.pl b {
  font: 600 13px/1.9 var(--font-ui);
  color: var(--c-accent);
}

/* The outcome: T's stage */
.ob {
  border-top: 1px solid var(--rule);
}

.ob__run {
  height: calc(var(--view-h) + 60svh);
}

.ob__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  height: var(--view-h);
  overflow: hidden;
}

.ob__type {
  position: absolute;
  top: 44%;
  left: 0;
  margin: 0;
  font: 700 clamp(120px, 17vw, 250px)/0.9 var(--font-ui);
  letter-spacing: -0.04em;
  white-space: nowrap;
  translate: calc(24% - var(--p, 0) * 88%) -50%;
  will-change: translate;
  pointer-events: none;
}

@supports (animation-timeline: view()) {
  .ob__run {
    view-timeline: --ob block;
    view-timeline-inset: var(--header-h) 0;
  }

  .ob__type {
    animation: ob-type linear both;
    animation-timeline: --ob;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes ob-type {
  from { translate: 24% -50%; }
  to { translate: -64% -50%; }
}

.ob__screen {
  position: absolute;
  top: 44%;
  left: 50%;
  width: min(60%, calc(var(--view-h) * 0.58 * var(--a)));
  aspect-ratio: var(--a);
  translate: -50% -50%;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.ob__foot {
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

.ob__fan {
  position: relative;
  height: clamp(320px, 38vw, 440px);
  overflow: hidden;
  border-top: 1px solid var(--rule);
}

.ob__card {
  position: absolute;
  top: 16%;
  left: 50%;
  width: 42%;
  aspect-ratio: 16 / 9;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  translate: calc(-50% + var(--x) * 2.5) var(--y);
  rotate: var(--r);
}

@supports (animation-timeline: view()) {
  .ob__card {
    animation: ob-fan linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 45%;
  }
}

@keyframes ob-fan {
  from { translate: -50% 40px; rotate: 0deg; }
  to { translate: calc(-50% + var(--x) * 2.5) var(--y); rotate: var(--r); }
}

@media (prefers-reduced-motion: reduce) {
  .ch__big,
  .ch__dd path,
  .rm__col,
  .rm__pic,
  .rm__words {
    transition: none;
  }
}

@media (max-width: 720px) {
  /* Phones: no rail; each part carries its heading; the rooms stack, all open */
  .ch {
    grid-template-columns: minmax(0, 1fr);
  }

  .ch__rail {
    display: none;
  }

  .ch__part {
    padding: 24px 16px 32px;
  }

  .sp,
  .dv {
    margin: 0 -16px;
  }

  .sp__track {
    grid-auto-columns: 78%;
    padding: 0 16px 4px;
    scroll-padding-inline: 16px;
  }

  .sp__nav {
    padding: 0 16px;
  }

  .dv {
    grid-template-columns: minmax(0, 1fr);
  }

  .dv__half figcaption {
    padding: 14px 16px 16px;
  }

  .dc__row {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .dc__row .pic:first-child {
    grid-column: span 2;
    aspect-ratio: 4 / 3;
  }

  .rm {
    flex-direction: column;
    height: auto;
  }

  .rm__col,
  .rm__col.is-open {
    flex: none;
  }

  .rm__pic {
    position: relative;
    aspect-ratio: 16 / 9;
    opacity: 1;
  }

  .rm__words {
    position: static;
    opacity: 1;
    translate: none;
  }

  .ob__screen {
    width: calc(100% - 32px);
  }

  .ob__foot {
    padding: 14px 16px 16px;
  }

  .ob__card {
    width: 62%;
  }
}
</style>
