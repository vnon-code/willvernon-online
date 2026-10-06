<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import AsLead from './AsLead.vue'

// PROTOTYPE T1 "Stage and swap" (overnight run, Amplified Spaces; T polished, its beats varied).
// Refs: Kenta Toshikura's drift (T's oversized type, counted beats); Apple-style scrollytelling (a pinned stage whose
// captions swap); Lusion / Obys case studies (a horizontal film strip pinned to the scroll).
// Beats, each with its own device: the rooms as an index strip under the hero → Develop, the experiments as a film
// strip that pans sideways while pinned, "Develop" huge behind it → Define, the idea as two lines of big type over
// the hand-off into Blender → the three rooms on one pinned stage (the room, its visual playing inset) while the
// tracks' words scroll past and swap it → the problems as a counted list → the outcome.
// PLACEHOLDER: every size, the pan length (130svh), the swap's fade, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

const s = computed(() => props.sheet.card.story!)
const tracks = computed(() => s.value.tracks)
const develop = computed(() => s.value.process.find(p => p.id === 'develop'))
const define = computed(() => s.value.process.find(p => p.id === 'define'))
const handoff = computed(() => define.value?.media.find(m => m.src.includes('p53')))
const lead = computed(() => tracks.value.filter(t => t.splash).map(t => ({ m: t.splash!, label: t.title, to: `as1-${t.id}` })))

// The swap: which track's words are in the middle of the view; the stage follows. One <video> on the stage, its
// source swapped, playing only while the stage is on screen.
const active = ref(0)
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
    <AsLead :story="s" :items="lead" count="04" />

    <!-- 01 Develop: the experiments, a film strip panning sideways while pinned -->
    <section v-if="develop" class="fm" data-sheet-block="develop" aria-label="Develop">
      <div class="fm__run" data-progress>
        <div class="fm__stage">
          <div class="fm__head">
            <div>
              <p class="t1__count">
                <b>01</b> / 04
              </p>
              <h3 class="fm__type">
                Develop
              </h3>
            </div>
            <p class="fm__text">
              {{ develop.text }}
            </p>
          </div>
          <ol class="fm__track">
            <li v-for="(m, i) in develop.media" :key="m.src" class="fm__cell" :style="{ '--a': m.aspect ?? 16 / 9 }">
              <SheetPic :m="m" />
              <p class="fm__cap">
                <b>{{ pad(i) }}</b> {{ m.caption }}
              </p>
            </li>
          </ol>
        </div>
      </div>
    </section>

    <!-- 02 Define: the idea, in two lines of big type over the hand-off into Blender -->
    <section v-if="define" class="id" data-sheet-block="define" aria-label="Define">
      <p class="t1__count id__count">
        <b>02</b> / 04
      </p>
      <p class="id__line">
        <span>TouchDesigner</span> makes the visual.
      </p>
      <p class="id__line id__line--2">
        <span>Blender</span> builds the room.
      </p>
      <SheetPic v-if="handoff" class="id__pic" :m="handoff" cap :style="{ '--a': handoff.aspect ?? 2.4 }" />
      <p class="id__text">
        {{ define.text }}
      </p>
    </section>

    <!-- 03 The rooms: one pinned stage, swapped by the tracks' words scrolling past -->
    <section class="sw" data-sheet-block="tracks" aria-label="Three tracks, three rooms">
      <div ref="stage" class="sw__stage">
        <p class="t1__count">
          <b>03</b> / 04 <span>Three tracks, three rooms</span>
        </p>
        <div class="sw__room">
          <SheetPic v-for="(t, i) in tracks" :key="t.id" class="sw__layer" :class="{ 'is-on': i === active }" :m="t.splash!" />
          <figure v-if="tracks[active]?.video" class="sw__screen">
            <video ref="vid" :src="tracks[active]!.video!.src" :poster="tracks[active]!.video!.poster" muted loop playsinline preload="none" :aria-label="tracks[active]!.video!.caption" />
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
        <article v-for="(t, i) in tracks" :id="`as1-${t.id}`" :key="t.id" ref="steps" class="sw__step" :data-i="i">
          <p class="sw__num">
            Track {{ pad(i) }}<template v-if="t.subtitle">
              · {{ t.subtitle }}
            </template>
          </p>
          <h3 class="sw__title" :class="{ 'sw__title--hid': tracks[i]?.splash }">
            {{ t.title }}
          </h3>
          <SheetPic v-if="t.splash" class="sw__inline" :m="t.splash" cap />
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

    <!-- 04 Problems: a counted list in big type -->
    <section v-if="s.problems?.length" class="pb" data-sheet-block="problems" aria-label="Problems met">
      <p class="t1__count pb__count">
        <b>04</b> / 04 <span>Problems met</span>
      </p>
      <ol class="pb__list">
        <li v-for="(p, i) in s.problems" :key="p">
          <span class="pb__n">{{ pad(i) }}</span>{{ p }}
        </li>
      </ol>
    </section>

    <SheetOutcome v-if="s.outcome" :outcome="s.outcome" />
  </SheetShell>
</template>

<style scoped>
.t1__count {
  margin: 0;
  font: 500 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
}

.t1__count b {
  font-size: 28px;
  font-weight: 600;
  color: var(--c-accent);
}

.t1__count span {
  margin-left: 10px;
  font-size: 11px;
  text-transform: uppercase;
}

/* 01 Develop: the film strip */
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
  grid-template-rows: auto 1fr;
  grid-template-columns: minmax(0, 1fr);
  height: var(--view-h);
  overflow: clip;
  container-type: inline-size;
}

.fm__type {
  margin: 14px 0 0 -0.05em;
  font: 700 clamp(64px, 13cqw, 168px)/0.9 var(--font-ui);
  letter-spacing: -0.045em;
}

.fm__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 340px);
  gap: 24px;
  align-items: end;
  padding: 24px;
}

.fm__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.fm__track {
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  margin: 0;
  padding: 0 24px;
  list-style: none;
  translate: calc((-100% + 100cqw) * var(--p, 0)) 0;
  will-change: translate;
}

@supports (animation-timeline: view()) {
  .fm__run {
    view-timeline: --film block;
    view-timeline-inset: var(--header-h) 0;
  }

  .fm__track {
    animation: fm-pan linear both;
    animation-timeline: --film;
    animation-range: contain 0% contain 100%;
  }
}

@keyframes fm-pan {
  from { translate: 0 0; }
  to { translate: calc(-100% + 100cqw) 0; }
}

.fm__cell {
  height: min(46svh, 360px);
  aspect-ratio: var(--a);
}

.fm__cell .pic {
  height: calc(100% - 28px);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.fm__cap {
  margin: 10px 0 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--muted);
}

.fm__cap b {
  color: var(--c-accent);
}

/* 02 Define: the idea */
.id {
  display: grid;
  gap: 4px;
  padding: 32px 24px 0;
  border-top: 1px solid var(--rule);
  overflow: clip;
}

.id__count {
  margin-bottom: 20px;
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
  margin: 28px -24px 0;
  aspect-ratio: var(--a);
  border-top: 1px solid var(--rule);
}

.id__text {
  max-width: 620px;
  margin: 0;
  padding: 20px 0 32px;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* 03 The rooms: the pinned stage and the swapping words */
.sw {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.sw__stage {
  position: sticky;
  top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
  display: grid;
  align-content: center;
  gap: 22px;
  height: var(--view-h);
  padding: 24px;
  overflow: clip;
  border-right: 1px solid var(--rule);
}

.sw__room {
  position: relative;
  aspect-ratio: 16 / 9;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
  overflow: hidden;
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

.sw__screen {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 40%;
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
  font: 700 clamp(56px, 7vw, 104px)/1 var(--font-ui);
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
  gap: 18px;
  min-height: var(--view-h);
  padding: 40px 24px;
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

/* The stage already shows the name, huge; the heading stays for screen readers (and shows on phones) */
.sw__title--hid {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
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

.sw__renders .pic:last-child:nth-child(odd) {
  grid-column: span 2;
  aspect-ratio: 32 / 9;
}

/* 04 Problems */
.pb {
  padding: 32px 24px 40px;
  border-top: 1px solid var(--rule);
}

.pb__list {
  margin: 22px 0 0;
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

@media (prefers-reduced-motion: reduce) {
  .sw__layer,
  .sw__name {
    transition: none;
  }
}

@media (max-width: 720px) {
  .fm__run {
    height: calc(var(--view-h) + 160svh);
  }

  .fm__head {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 20px 16px;
  }

  .fm__track {
    padding: 0 16px;
  }

  .fm__cell {
    height: 34svh;
  }

  .id {
    padding: 24px 16px 0;
  }

  .id__pic {
    margin: 22px -16px 0;
  }

  .id__line--2 {
    padding-left: 0;
  }

  /* Phones: no pinned stage; each track shows its own room */
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

  .sw__title--hid {
    position: static;
    width: auto;
    height: auto;
    clip-path: none;
  }

  .sw__step {
    min-height: 0;
    padding: 28px 16px;
  }

  .pb {
    padding: 24px 16px 32px;
  }

  .pb__list li {
    grid-template-columns: 40px minmax(0, 1fr);
  }
}
</style>
