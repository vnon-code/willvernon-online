<script setup lang="ts">
import type { SheetMediaItem, SheetOpen } from '~/types/project'
import SheetShell from './SheetShell.vue'

// PROTOTYPE U "Double diamond" (Project Sheet rework, round 2; the process book's own spine).
// Axes: process-led order; mosaics; overlaid captions.
// After the hero, a key-stat line ("3 tracks · 3 rooms · 2 programs") with the hook and credits. Then Discover /
// Develop / Define / Deliver / Outcomes as full-width bands meeting edge to edge, each a mosaic of that phase's images
// (justified rows: every image whole-width in its row, no holes) with the words overlaid on a plate, no separate text
// blocks. The outcome is full-bleed renders. Without a story the process steps are the bands; with none, the stat
// line (the tags) and the hook stand alone. PLACEHOLDER: the row pattern (2, 3, 2…), the aspect clamps, type sizes.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })

const view = computed(() => storyView(props.sheet.card))
const story = computed(() => view.value.kind === 'story')

// Justified rows: 2, 3, 2, 3… pieces a row (a lone last piece joins the row before), each piece as wide as its
// aspect's share, so a row's pieces share one height. A row of one is held to 16:9 or wider.
type Tile = SheetMediaItem & { a: number }
function rows(media: SheetMediaItem[]): Tile[][] {
  const out: Tile[][] = []
  let i = 0
  while (i < media.length) {
    const n = out.length % 2 ? 3 : 2
    out.push(media.slice(i, i + n).map(m => ({ ...m, a: Math.min(2.4, Math.max(0.75, m.aspect ?? 16 / 9)) })))
    i += n
  }
  if (out.length > 1 && out.at(-1)!.length === 1) out.at(-2)!.push(...out.pop()!)
  if (out.length === 1 && out[0]!.length === 1) out[0]![0]!.a = Math.max(out[0]![0]!.a, 16 / 9)
  return out
}
const bands = computed(() => view.value.phases.filter(p => p.media.length).map(p => ({ ...p, rows: rows(p.media) })))
const statLine = computed(() => (view.value.stats.length ? view.value.stats : [view.value.credits[0]!.v]).join(' · '))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <section class="su__key" :class="{ 'su__key--thin': !bands.length }" data-sheet-body data-sheet-block="key" data-build>
      <p class="su__stats">
        {{ statLine }}
      </p>
      <div class="su__under">
        <div>
          <h2 class="su__title">
            {{ view.title }}
          </h2>
          <p class="su__hook">
            {{ view.hook }}
          </p>
          <p v-if="view.intro" class="su__muted">
            {{ view.intro }}
          </p>
        </div>
        <dl class="su__credits">
          <div v-for="c in view.credits" :key="c.k">
            <dt>{{ c.k }}</dt>
            <dd>{{ c.v }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section v-for="(b, i) in bands" :key="b.id" class="su__band" :data-sheet-block="`phase-${b.id}`" data-build :aria-label="b.title">
      <div class="su__plate">
        <h3><b>{{ pad(i) }}</b> {{ b.title }}</h3>
        <p v-if="b.text">
          {{ b.text }}
        </p>
      </div>
      <div v-for="(r, ri) in b.rows" :key="ri" class="su__row">
        <SheetPic v-for="m in r" :key="m.src" :m="m" :cap="story" :style="{ flexGrow: m.a, aspectRatio: m.a }" />
      </div>
    </section>

    <section v-if="view.outcome" class="su__band su__band--out" data-sheet-block="outcomes" data-build aria-label="Outcomes">
      <div class="su__plate">
        <h3><b>{{ pad(bands.length) }}</b> Outcomes</h3>
        <p v-if="view.outcome.text">
          {{ view.outcome.text }}
        </p>
      </div>
      <template v-if="story">
        <SheetPic v-for="m in view.outcome.media" :key="m.src" class="su__bleed" :m="m" cap />
      </template>
      <template v-else>
        <div v-for="(r, ri) in rows(view.outcome.media)" :key="ri" class="su__row">
          <SheetPic v-for="m in r" :key="m.src" :m="m" :style="{ flexGrow: m.a, aspectRatio: m.a }" />
        </div>
      </template>
    </section>
  </SheetShell>
</template>

<style scoped>
.su__key {
  padding: 28px 24px 40px;
}

.su__key--thin {
  padding-bottom: 64px;
}

/* The key-stat line, large */
.su__stats {
  margin: 0 0 28px;
  font: 600 clamp(32px, 4.6vw, 60px)/1.05 var(--font-ui);
  letter-spacing: -0.025em;
}

.su__under {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px 48px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
}

.su__under p,
.su__credits dd {
  margin: 0;
}

.su__title {
  margin: 0 0 10px;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.su__hook {
  font: 400 21px/1.4 var(--font-ui);
}

.su__muted {
  margin-top: 12px !important;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.su__credits {
  display: grid;
  gap: 10px;
  margin: 0;
}

.su__credits div {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 12px;
}

.su__credits dt {
  font: 500 11px/18px var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.su__credits dd {
  font: 400 14px/18px var(--font-ui);
}

/* A band: the phase's mosaic, its words on a plate over it */
.su__band {
  position: relative;
  border-top: 1px solid var(--rule);
}

.su__row {
  display: flex;
}

.su__row > * {
  flex-basis: 0;
  min-width: 0;
}

.su__row + .su__row {
  border-top: 1px solid #000;
}

.su__row > * + * {
  border-left: 1px solid #000;
}

.su__plate {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 2;
  max-width: 360px;
  padding: 14px 16px 16px;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.su__plate h3 {
  margin: 0;
  font: 600 24px/1.1 var(--font-ui);
}

.su__plate b {
  margin-right: 4px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  vertical-align: 0.45em;
  color: var(--c-accent);
}

.su__plate p {
  margin: 8px 0 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

/* Captions bottom right, clear of the plate */
.su__band :deep(.pic__cap) {
  right: 12px;
  left: auto;
}

/* The outcome: each piece full-bleed */
.su__bleed {
  aspect-ratio: 16 / 9;
}

.su__bleed + .su__bleed {
  border-top: 1px solid #000;
}

@media (max-width: 720px) {
  .su__under {
    grid-template-columns: 1fr;
  }

  .su__plate {
    position: relative;
    top: 0;
    left: 0;
    max-width: none;
    border-radius: 0;
    border-width: 0 0 1px;
  }
}
</style>
