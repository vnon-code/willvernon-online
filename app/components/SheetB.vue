<script setup lang="ts">
import type { SheetMediaItem, SheetOpen } from '~/types/project'
import SheetMedia from './SheetMedia.vue'
import { SHEET_EASE } from '~/composables/useSheetProto'

// PROTOTYPE B "Stage and plates" (Project Sheet rework, round 1).
// Axes: layout = fixed stage + filmstrip; build = plates deal out from the media; drop = part sideways.
// The teaser grows into a large centred stage that stays put. The info row's plates (tag | name | tools) deal out
// from under it, a caption plate deals out of its left edge, and the process media, outcome and renders deal into a
// filmstrip below, which the wheel scrolls. A tile puts its media on the stage and its words in the caption.
// The Landing's side cards part sideways. PLACEHOLDER: the stage and tile sizes, the caption, the 0.2 dim.
const props = defineProps<{ sheet: SheetOpen }>()
const emit = defineEmits<{ close: [] }>()

const root = ref<HTMLElement>()
const layer = ref<HTMLElement>()
const overlay = ref<HTMLElement>()
const strip = ref<HTMLElement>()
const media = ref<InstanceType<typeof SheetMedia>>()
const card = computed(() => props.sheet.card)

type Item = { label: string, title: string, text: string, media: SheetMediaItem | null, thumb: string }
const items = computed<Item[]>(() => {
  const c = card.value, { steps, outcome, gallery } = sheetContent(c)
  const thumb = (m?: SheetMediaItem) => m ? (m.poster ?? m.src) : c.poster
  return [
    { label: 'Overview', title: c.title, text: [c.summary, c.long].filter(Boolean).join(' '), media: null, thumb: c.poster },
    ...steps.map((s, i) => ({ label: pad(i), title: s.title, text: s.text, media: s.media ?? null, thumb: thumb(s.media) })),
    ...(outcome ? [{ label: 'Outcome', title: 'Outcome', text: '', media: outcome, thumb: thumb(outcome) }] : []),
    ...gallery.map((g, i) => ({ label: 'Render', title: `Render ${pad(i)}`, text: '', media: g, thumb: g.src })),
  ]
})
const sel = ref(0)
const picked = computed(() => items.value[sel.value]!)

// The plates deal out from the stage: the row from under its foot (tag and tools fanning out from the name), the
// caption out of its left edge, the tiles from behind it one after another. Leaving, they fade first.
function build(dir: 'in' | 'out') {
  const l = layer.value!
  const els = [...l.querySelectorAll<HTMLElement>('[data-build]')]
  if (dir === 'out') return els.map(el => el.animate({ opacity: [1, 0] }, { duration: 140, easing: 'ease-out', fill: 'forwards' }))
  const at = SHEET_MS.buildAt, ms = SHEET_MS.build, ease = SHEET_EASE
  const deal = (el: Element | null, from: Keyframe, delay = 0) => el?.animate([{ opacity: 0, ...from }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: ms, delay: at + delay, easing: ease, fill: 'both' })
  return [
    deal(l.querySelector('.sb__caption'), { transform: 'translateX(-24px)', clipPath: 'inset(0 100% 0 0)' }),
    deal(l.querySelector('.sb__plates'), { transform: 'translateY(-56px)' }),
    deal(l.querySelector('[data-plate=tag]'), { transform: 'translateX(120px)' }, 60),
    deal(l.querySelector('[data-plate=tools]'), { transform: 'translateX(-120px)' }, 60),
    ...[...l.querySelectorAll('.sb__tile')].map((t, i) => deal(t, { transform: 'translateY(-72px)' }, 40 + Math.min(i, 4) * 25)),
  ].filter((a): a is Animation => !!a)
}

// The wheel, anywhere, glides the filmstrip sideways
let tx = 0, raf = 0
function glide() {
  const s = strip.value
  if (!s) return void (raf = 0)
  const d = tx - s.scrollLeft
  if (Math.abs(d) < 0.5) {
    s.scrollLeft = tx
    raf = 0
    return
  }
  s.scrollLeft += d * 0.2
  raf = requestAnimationFrame(glide)
}
function onWheel(e: WheelEvent) {
  e.preventDefault()
  const s = strip.value
  if (!s) return
  const max = s.scrollWidth - s.clientWidth
  tx = Math.min(max, Math.max(0, (raf ? tx : s.scrollLeft) + e.deltaY + e.deltaX))
  if (!raf) raf = requestAnimationFrame(glide)
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

const { close } = useSheetMotion({
  sheet: props.sheet, drop: 'part', root, layer, overlay, media, build, onWheel,
  beforeClose: () => (sel.value = 0), // the teaser folds back into the card
  onClosed: () => emit('close'),
})
defineExpose({ close })
</script>

<template>
  <div ref="root" class="sb" role="dialog" aria-modal="true" :aria-label="card.title" data-lenis-prevent>
    <div ref="overlay" class="sb__dim" data-sheet-overlay @click="close" />
    <SheetClose class="sb__x" @close="close" />
    <div ref="layer" class="sb__layer" data-sheet-layer>
      <div class="sb__stage">
        <SheetMedia ref="media" class="sb__media" :card="card" :source="sheet.el" :swap="picked.media" />
        <div class="sb__caption" data-build aria-live="polite">
          <span class="sb__eyebrow">{{ picked.label }}</span>
          <h3>{{ picked.title }}</h3>
          <p v-if="picked.text">
            {{ picked.text }}
          </p>
        </div>
      </div>
      <SheetPlates class="sb__plates" :card="card" data-sheet-body data-build />
      <div v-if="items.length > 1" ref="strip" class="sb__strip" role="group" aria-label="Project media" data-build>
        <button
          v-for="(it, i) in items"
          :key="i"
          type="button"
          class="sb__tile"
          :aria-pressed="i === sel"
          :aria-label="`${it.label}: ${it.title}`"
          @click="sel = i"
        >
          <img :src="it.thumb" alt="" loading="lazy">
          <span class="sb__num">{{ it.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sb {
  /* The stage fits the screen with the row and the filmstrip under it. PLACEHOLDER: 1040px, 150px tiles */
  --tile-h: 150px;
  --stage-w: min(1040px, 100vw - 192px, (100dvh - var(--header-h) - 16px - 12px - 42px - 16px - var(--tile-h) - 8px - 24px) * 16 / 9);
  position: fixed;
  inset: 0;
  z-index: 5000;
}

/* No blur, no glass (Will, 2026-10-06). PLACEHOLDER: 0.2 */
.sb__dim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.2);
}

.sb__layer {
  position: absolute;
  top: calc(var(--header-h) + 16px);
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: var(--stage-w);
  translate: -50% 0;
}

.sb__x {
  position: absolute;
  top: calc(var(--header-h) + 16px);
  right: calc((100vw - var(--stage-w)) / 2 - 52px);
  z-index: 1;
}

/* Over the plates, so they deal out from under it */
.sb__stage {
  position: relative;
  z-index: 1;
}

.sb__media {
  width: 100%;
  aspect-ratio: 16 / 9;
}

/* The caption: a solid plate on the stage's lower left */
.sb__caption {
  position: absolute;
  left: 16px;
  bottom: 16px;
  display: grid;
  gap: 8px;
  max-width: min(380px, 100% - 32px);
  padding: 16px 18px;
  background: var(--plate-solid);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.sb__eyebrow,
.sb__num {
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sb__eyebrow {
  color: var(--c-accent);
}

.sb__caption h3 {
  margin: 0;
  font: 600 18px/1.2 var(--font-ui);
}

.sb__caption p {
  margin: 0;
  font: 400 13px/1.5 var(--font-ui);
  color: color-mix(in srgb, var(--c-fg) 76%, transparent);
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sb__plates {
  margin-top: 4px;
}

.sb__strip {
  display: flex;
  gap: 8px;
  margin: 4px -4px 0;
  padding: 4px;
  overflow-x: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sb__strip::-webkit-scrollbar {
  display: none;
}

.sb__tile {
  position: relative;
  flex: none;
  height: var(--tile-h);
  aspect-ratio: 16 / 9;
  padding: 0;
  overflow: hidden;
  background: #000;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  cursor: pointer;
}

.sb__tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.75;
  transition: opacity 160ms ease;
}

.sb__tile[aria-pressed='true'] {
  outline: 1px solid var(--c-fg);
  outline-offset: 2px;
}

.sb__tile[aria-pressed='true'] img {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .sb__tile:hover img {
    opacity: 1;
  }
}

.sb__tile:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.sb__num {
  position: absolute;
  left: 8px;
  top: 8px;
  padding: 4px 6px;
  color: var(--c-fg);
  background: var(--plate-solid);
  border-radius: 4px;
}

@media (max-width: 720px) {
  .sb {
    --stage-w: calc(100vw - 32px);
    --tile-h: 96px;
  }

  .sb__x {
    right: 24px;
    top: calc(var(--header-h) + 24px);
  }

  .sb__caption {
    position: static;
    max-width: none;
    margin-top: 12px;
  }
}
</style>
