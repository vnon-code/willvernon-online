<script setup lang="ts">
import type { SheetMediaItem, SheetOpen } from '~/types/project'
import SheetMedia from './SheetMedia.vue'
import { SHEET_EASE } from '~/composables/useSheetProto'

// PROTOTYPE C "Split" (Project Sheet rework, round 1).
// Axes: layout = sticky media + scrolling text; build = text wipes in beside; drop = recede.
// The teaser grows into the full-height left half of a centred sheet and stays there (sticky) while the text and
// steps scroll on the right; it swaps to each step's media as that step reaches the middle. The text panel wipes in
// from the media's edge. The Landing recedes (scales down 8%) and its side cards drop away.
// PLACEHOLDER: the 50/50 split, the gap, type sizes and the 0.2 dim.
const props = defineProps<{ sheet: SheetOpen }>()
const emit = defineEmits<{ close: [] }>()

const root = ref<HTMLElement>()
const layer = ref<HTMLElement>()
const overlay = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const media = ref<InstanceType<typeof SheetMedia>>()
const card = computed(() => props.sheet.card)
const content = computed(() => sheetContent(card.value))

// The block crossing the layer's middle picks the media; a render clicked in the gallery overrides it
const active = ref(-1) // -1: the intro (the teaser)
const render = ref<SheetMediaItem | null>(null)
const swap = computed<SheetMediaItem | null>(() => {
  if (render.value) return render.value
  const { steps, outcome } = content.value
  if (active.value < 0) return null
  return active.value < steps.length ? steps[active.value]!.media ?? null : outcome
})

function build(dir: 'in' | 'out') {
  const p = panel.value!
  if (dir === 'out') return [p.animate({ opacity: [1, 0] }, { duration: 140, easing: 'ease-out', fill: 'forwards' })]
  const at = SHEET_MS.buildAt, ms = SHEET_MS.build
  return [
    p.animate([
      { opacity: 0, clipPath: 'inset(0 100% 0 0 round 12px)' },
      { opacity: 1, offset: 0.3 },
      { opacity: 1, clipPath: 'inset(0 0 0 0 round 12px)' },
    ], { duration: ms, delay: at, easing: SHEET_EASE, fill: 'both' }),
    ...[...p.querySelectorAll('.sc__intro > *')].map((el, i) => el.animate({ opacity: [0, 1], transform: ['translateX(-16px)', 'none'] }, {
      duration: ms, delay: at + 40 + Math.min(i, 3) * 30, easing: SHEET_EASE, fill: 'both',
    })),
  ]
}

let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      active.value = Number((e.target as HTMLElement).dataset.step)
      render.value = null
    }
  }, { root: layer.value, rootMargin: '-50% 0px -50% 0px' })
  panel.value?.querySelectorAll('[data-step]').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

const { close } = useSheetMotion({
  sheet: props.sheet, drop: 'recede', root, layer, overlay, media, build,
  beforeClose: () => {
    io?.disconnect()
    active.value = -1 // the teaser folds back into the card
    render.value = null
  },
  onClosed: () => emit('close'),
})
defineExpose({ close })
</script>

<template>
  <div ref="root" class="sc" role="dialog" aria-modal="true" :aria-label="card.title" data-lenis-prevent>
    <div ref="overlay" class="sc__dim" data-sheet-overlay @click="close" />
    <SheetClose class="sc__x" @close="close" />
    <div ref="layer" class="sc__layer" data-sheet-layer>
      <div class="sc__left">
        <SheetMedia ref="media" class="sc__media" :card="card" :source="sheet.el" :swap="swap" />
      </div>
      <div ref="panel" class="sc__panel">
        <section class="sc__block sc__intro" data-sheet-body data-step="-1">
          <SheetPlates :card="card" stack />
          <p class="sc__summary">
            {{ card.summary }}
          </p>
          <p v-if="card.long" class="sc__muted">
            {{ card.long }}
          </p>
        </section>
        <section v-for="(s, i) in content.steps" :key="s.title" class="sc__block sc__step" :data-step="i">
          <span class="sc__num">{{ pad(i) }}</span>
          <h3>{{ s.title }}</h3>
          <p class="sc__muted">
            {{ s.text }}
          </p>
        </section>
        <!-- PLACEHOLDER copy: "Outcome", "Renders" -->
        <section v-if="content.outcome" class="sc__block sc__step" :data-step="content.steps.length">
          <span class="sc__num">→</span>
          <h3>Outcome</h3>
        </section>
        <section v-if="content.gallery.length" class="sc__block">
          <h3>Renders</h3>
          <div class="sc__grid">
            <button v-for="g in content.gallery" :key="g.src" type="button" class="sc__thumb" :aria-pressed="render?.src === g.src" @click="render = g">
              <img :src="g.src" alt="" loading="lazy">
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sc {
  --w: min(1248px, 100vw - 192px); /* PLACEHOLDER: 96px of dots each side */
  --h: calc(100dvh - var(--header-h) - 32px);
  --muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  position: fixed;
  inset: 0;
  z-index: 5000;
}

/* No blur, no glass (Will, 2026-10-06). PLACEHOLDER: 0.2 */
.sc__dim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.2);
}

/* Media and text side by side; the layer scrolls the text while the media sticks */
.sc__layer {
  position: absolute;
  top: calc(var(--header-h) + 16px);
  left: 50%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: var(--w);
  height: var(--h);
  translate: -50% 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sc__layer::-webkit-scrollbar {
  display: none;
}

.sc__x {
  position: absolute;
  top: calc(var(--header-h) + 16px);
  right: calc((100vw - var(--w)) / 2 - 52px);
  z-index: 1;
}

.sc__left {
  position: sticky;
  top: 0;
  align-self: start;
  height: var(--h);
}

.sc__media {
  width: 100%;
  height: 100%;
}

.sc__panel {
  display: grid;
  align-content: start;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 12px;
}

.sc__block {
  display: grid;
  gap: 12px;
  align-content: start;
  padding: 40px clamp(24px, 3vw, 48px);
  border-top: 1px solid color-mix(in srgb, var(--c-fg) 10%, transparent);
}

.sc__intro {
  gap: 20px;
  min-height: calc(var(--h) * 0.6); /* past the middle line, so the teaser holds the first view */
  border-top: 0;
}

/* Each step holds the media long enough to look at it */
.sc__step {
  min-height: calc(var(--h) * 0.6);
}

.sc__block p {
  margin: 0;
}

.sc__summary {
  font: 400 21px/1.4 var(--font-ui);
}

.sc__muted {
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.sc__num {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.sc__block h3 {
  margin: 0;
  font: 600 24px/1.2 var(--font-ui);
}

.sc__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.sc__thumb {
  padding: 0;
  overflow: hidden;
  background: #000;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  cursor: pointer;
}

.sc__thumb[aria-pressed='true'] {
  outline: 1px solid var(--c-fg);
  outline-offset: 2px;
}

.sc__thumb:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.sc__thumb img {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* Phones: the media on top (16:9), the text under it */
@media (max-width: 720px) {
  .sc {
    --w: calc(100vw - 32px);
  }

  .sc__layer {
    grid-template-columns: 1fr;
  }

  .sc__left {
    position: static;
    height: auto;
  }

  .sc__media {
    height: auto;
    aspect-ratio: 16 / 9;
  }

  .sc__x {
    right: 24px;
    top: calc(var(--header-h) + 24px);
  }
}
</style>
