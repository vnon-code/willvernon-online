<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetMedia from './SheetMedia.vue'

// PROTOTYPE (Project Sheet rework, round 2): the shell every round-2 Sheet (A, R, S, T, U) is built in. A's open and
// close exactly (useSheetMotion: the teaser grows from the card, the Landing falls away, the close folds back), with
// Will's round-1 notes: the header docks (useSheetMotion), and the content sits in one frame with the Sections panel's
// edges (`.sections__panel`: the lit `--edges` border, no bottom edge, the 12px top corners that square off with
// --dock, the same width), the hero edge to edge at its top and every block below meeting the next (no gaps).
// The variant's blocks go in the slot; each marks itself [data-sheet-block] (the first one also [data-sheet-body])
// and [data-build] to rise in. PLACEHOLDER: the 16px under the header, the build timings, the 0.2 dim.
const props = defineProps<{ sheet: SheetOpen }>()
const emit = defineEmits<{ close: [] }>()

const root = ref<HTMLElement>()
const layer = ref<HTMLElement>()
const frame = ref<HTMLElement>()
const overlay = ref<HTMLElement>()
const media = ref<InstanceType<typeof SheetMedia>>()
const card = computed(() => props.sheet.card)

// The frame's skin (fill and edges) fades in under the landing hero, and the blocks rise in below it, once the hero
// has mostly landed; leaving, they fade first. Each animation is dropped once done, so the frame's own CSS (the
// harness compares it with the panel's) and the blocks' sticky and scroll-driven parts run unhindered.
function build(dir: 'in' | 'out') {
  const f = frame.value!
  const els = [...layer.value!.querySelectorAll<HTMLElement>('[data-build]')]
  const cs = getComputedStyle(f)
  const solid = { backgroundColor: cs.backgroundColor, borderTopColor: cs.borderTopColor, borderLeftColor: cs.borderLeftColor, borderRightColor: cs.borderRightColor }
  const clear = { backgroundColor: 'transparent', borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }
  if (dir === 'out') {
    return [
      f.animate([solid, clear], { duration: 200, easing: 'ease-out', fill: 'forwards' }),
      ...els.map(el => el.animate({ opacity: [1, 0] }, { duration: 140, easing: 'ease-out', fill: 'forwards' })),
    ]
  }
  const done = (a: Animation) => (a.finished.then(() => a.cancel(), () => {}), a)
  // Only the blocks in the first view rise in; the rest are below it and simply there
  const fold = innerHeight
  return [
    done(f.animate([clear, solid], { duration: SHEET_MS.build, delay: SHEET_MS.buildAt - 60, easing: 'ease-out', fill: 'both' })),
    ...els.filter(el => el.getBoundingClientRect().top < fold).map((el, i) => done(el.animate({ opacity: [0, 1], transform: ['translateY(40px)', 'none'] }, {
      duration: SHEET_MS.build, delay: SHEET_MS.buildAt + Math.min(i, 3) * 30, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'both',
    }))),
  ]
}

const { close } = useSheetMotion({ sheet: props.sheet, drop: 'fall', root, layer, overlay, media, build, onClosed: () => emit('close') })
usePlayInView(layer)
useLayerProgress(layer)
defineExpose({ close })
</script>

<template>
  <div ref="root" class="sh" role="dialog" aria-modal="true" :aria-label="card.title" data-lenis-prevent>
    <div ref="overlay" class="sh__dim" data-sheet-overlay @click="close" />
    <SheetClose class="sh__x" @close="close" />
    <div ref="layer" class="sh__layer" data-sheet-layer>
      <div ref="frame" class="sh__frame" data-sheet-frame>
        <SheetMedia ref="media" class="sh__hero" :card="card" :source="sheet.el" data-sheet-block="hero" />
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.sh {
  /* The Sections panel's width and top corners (TheSections.vue) */
  --panel-w: min(1040px, 100% - 32px);
  --fr: calc(12px * (1 - var(--dock, 0)));
  /* One pinned view: the layer's height under the header (R's slides, S's runs, T's stage) */
  --view-h: calc(100svh - var(--header-h));
  --muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  --rule: color-mix(in srgb, var(--c-fg) 10%, transparent);
  position: fixed;
  inset: 0;
  z-index: 5000;
}

/* No blur, no glass (Will, 2026-10-06): a light dim at most. PLACEHOLDER: 0.2 */
.sh__dim {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.2);
}

/* The column scrolls; the wheel over the margins scrolls it too (useSheetMotion) */
.sh__layer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: var(--panel-w);
  padding-top: calc(var(--header-h) + 16px);
  translate: -50% 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.sh__layer::-webkit-scrollbar {
  display: none;
}

/* The frame: the Sections panel's plate, down to the bottom of the layer */
.sh__frame {
  min-height: 100%;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-bottom: 0;
  border-radius: var(--fr) var(--fr) 0 0;
}

/* In the right margin, level with the frame's top */
.sh__x {
  position: absolute;
  top: calc(var(--header-h) + 16px);
  right: calc((100% - var(--panel-w)) / 2 - 52px);
  z-index: 1;
}

/* The hero sits on the frame's edge (its own lit edge over the frame's), its top corners the frame's */
.sh .sh__hero {
  margin: -1px -1px 0;
  aspect-ratio: 16 / 9;
  border-radius: var(--fr) var(--fr) 0 0;
}

/* Phones: the ✕ sits on the hero's corner */
@media (max-width: 720px) {
  .sh__x {
    top: calc(var(--header-h) + 28px);
    right: 28px;
  }
}
</style>
