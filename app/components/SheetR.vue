<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from './SheetShell.vue'

// PROTOTYPE R "Rooms" (Project Sheet rework, round 2; ref: Lusion's project pages).
// Axes: chapters by track; a pinned info rail; stacked-slide media.
// After the hero and the intro (title, hook, credits, an index of the rooms), one chapter per track: the room's
// render fills the Sheet's width with the track's visual playing as its screen; a slim rail pinned to one side carries
// sound → visual → room; scrolling steps through the room's renders, each sliding up over the last (sticky, no JS).
// Then the process as one continuous band, and the outcome. Without a story the process steps are the chapters; with
// none, the intro stands alone. PLACEHOLDER: the rail's width and place, the screen inset's size and corner, type sizes.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

const view = computed(() => storyView(props.sheet.card))
const rooms = computed(() => view.value.chapters.filter(c => c.slides.length))
const story = computed(() => view.value.kind === 'story')
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <section class="sr__intro" :class="{ 'sr__intro--thin': !rooms.length }" data-sheet-body data-sheet-block="intro" data-build>
      <div class="sr__words">
        <h2 class="sr__title">
          {{ view.title }}
        </h2>
        <p class="sr__hook">
          {{ view.hook }}
        </p>
        <p v-if="view.intro" class="sr__muted">
          {{ view.intro }}
        </p>
      </div>
      <dl class="sr__credits">
        <div v-for="c in view.credits" :key="c.k">
          <dt>{{ c.k }}</dt>
          <dd>{{ c.v }}</dd>
        </div>
      </dl>
      <ol v-if="story" class="sr__index">
        <li v-for="(r, i) in rooms" :key="r.id">
          <SheetPic :m="r.slides[0]!" />
          <span><b>{{ pad(i) }}</b> {{ r.title }}</span>
        </li>
      </ol>
    </section>

    <section v-for="(r, i) in rooms" :key="r.id" class="sr__room" :data-sheet-block="`room-${r.id}`" data-build :aria-label="r.title">
      <div class="sr__pin">
        <aside class="sr__rail">
          <p class="sr__count">
            <b>{{ pad(i) }}</b> / {{ pad(rooms.length - 1) }}
          </p>
          <h3 class="sr__name">
            {{ r.title }}<small v-if="r.subtitle">{{ r.subtitle }}</small>
          </h3>
          <ol class="sr__facts">
            <li v-for="f in r.facts" :key="f.k">
              <span v-if="f.k" class="sr__k">{{ f.k }}</span>
              <p>{{ f.v }}</p>
            </li>
          </ol>
        </aside>
      </div>
      <div class="sr__slides">
        <div v-for="(m, j) in r.slides" :key="m.src" class="sr__slide">
          <SheetPic :m="m" cap />
          <SheetPic v-if="j === 0 && r.screen" class="sr__screen" :m="r.screen" cap :style="{ aspectRatio: r.screen.aspect ?? 16 / 9 }" />
        </div>
      </div>
    </section>

    <SheetProcess v-if="story && view.phases.length" :phases="view.phases" />
    <SheetOutcome v-if="view.outcome" :outcome="view.outcome" />
  </SheetShell>
</template>

<style scoped>
.sr__intro {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px 48px;
  padding: 28px 24px 0;
}

/* No rooms to follow: the intro closes the Sheet, filling down to its foot */
.sr__intro--thin {
  padding-bottom: 48px;
}

.sr__words p,
.sr__credits dd {
  margin: 0;
}

.sr__title {
  margin: 0 0 14px;
  font: 600 44px/1.05 var(--font-ui);
  letter-spacing: -0.02em;
}

.sr__hook {
  font: 400 21px/1.4 var(--font-ui);
}

.sr__muted {
  margin-top: 12px !important;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.sr__credits {
  display: grid;
  align-content: start;
  margin: 6px 0 0;
}

.sr__credits div {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  padding: 9px 0;
  border-top: 1px solid var(--rule);
}

.sr__credits dt,
.sr__k {
  font: 500 11px/18px var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sr__credits dd {
  font: 400 14px/18px var(--font-ui);
}

/* The rooms' index: three splashes edge to edge, flush with the frame's sides and the first room below */
.sr__index {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin: 4px -24px 0;
  padding: 0;
  list-style: none;
}

.sr__index li {
  position: relative;
}

.sr__index .pic {
  aspect-ratio: 16 / 9;
}

.sr__index span {
  position: absolute;
  left: 12px;
  bottom: 10px;
  font: 600 15px/1 var(--font-ui);
}

.sr__index b,
.sr__count b {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.sr__room {
  display: grid;
  border-top: 1px solid var(--rule);
}

/* The rail's pin and the slides share one grid cell: the pin (one slide tall) holds over the slides and leaves with
   the last */
.sr__pin,
.sr__slides {
  grid-area: 1 / 1;
}

.sr__pin {
  position: sticky;
  top: var(--header-h);
  z-index: 50;
  align-self: start;
  aspect-ratio: 16 / 9;
  pointer-events: none;
}

.sr__rail {
  position: absolute;
  top: 16px;
  bottom: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 248px;
  padding: 18px 18px 20px;
  overflow: hidden;
  pointer-events: auto;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 10px;
}

.sr__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
}

.sr__name {
  margin: 0;
  font: 600 26px/1.05 var(--font-ui);
}

.sr__name small {
  display: block;
  margin-top: 4px;
  font: 400 13px/1.2 var(--font-ui);
  color: var(--muted);
}

.sr__facts {
  display: grid;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sr__facts li p {
  margin: 2px 0 0;
  font: 400 13.5px/1.45 var(--font-ui);
}

/* sound → visual → room */
.sr__facts li + li::before {
  content: '↓';
  display: block;
  margin: 2px 0 6px;
  font: 400 12px/1 var(--font-ui);
  color: var(--c-accent);
}

/* Each render pins under the header; the next slides up over it */
.sr__slide {
  position: sticky;
  top: var(--header-h);
  aspect-ratio: 16 / 9;
}

.sr__slide > .pic:first-child {
  position: absolute;
  inset: 0;
}

/* The slide's caption top right, clear of the rail and the screen */
.sr__slide > .pic:first-child :deep(.pic__cap) {
  top: 16px;
  right: 16px;
  bottom: auto;
  left: auto;
}

/* The track's visual, as the room's screen */
.sr__screen {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 34%;
  max-height: 62%;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

@media (max-width: 720px) {
  .sr__intro {
    grid-template-columns: 1fr;
  }

  .sr__rail {
    top: auto;
    width: auto;
    right: 16px;
  }

  .sr__screen {
    display: none;
  }
}
</style>
