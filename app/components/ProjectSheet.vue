<script setup lang="ts">
import type { ProjectCard } from '~/types/project'

// The open project, as a Sheet (Will, 2026-10-04; picked on /proto): it grows out of the centre card into a tall
// centred sheet over the dimmed Landing (a clip-path from the card's rect) and closes back into it (Escape, ✕ or
// the backdrop). Focus moves to ✕ and returns to the card on close.
const props = defineProps<{ card: ProjectCard, from: DOMRect }>()
const emit = defineEmits<{ close: [] }>()

const OPEN_MS = 520
const CLOSE_MS = 340
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)' // the drawers' curve (iOS-like)

const layer = ref<HTMLElement>()
const backdrop = ref<HTMLElement>()
const closeBtn = ref<HTMLButtonElement>()
const video = computed(() => props.card.teaser && !props.card.teaser.endsWith('.gif') ? props.card.teaser : null)
const still = computed(() => props.card.teaser?.endsWith('.gif') ? props.card.teaser : props.card.poster)
const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
const { sfx } = useSound()
let closing = false
let opener: HTMLElement | null = null

// The `from` rect as a clip-path inset of the layer's own box
function fromInset() {
  const r = layer.value!.getBoundingClientRect(), f = props.from
  const c = (v: number) => `${Math.max(0, v)}px`
  return `inset(${c(f.top - r.top)} ${c(r.right - f.right)} ${c(r.bottom - f.bottom)} ${c(f.left - r.left)} round 2px)`
}

function animate(open: boolean) {
  const ms = reduced ? 200 : open ? OPEN_MS : CLOSE_MS
  const frames = reduced ? { opacity: [0, 1] } : { clipPath: [fromInset(), 'inset(0px 0px 0px 0px round 0px)'] }
  const opts = { duration: ms, easing: reduced ? 'ease' : EASE, fill: 'forwards' as const, direction: open ? 'normal' as const : 'reverse' as const }
  backdrop.value?.animate({ opacity: [0, 1] }, opts)
  return layer.value!.animate(frames, opts).finished
}

async function close() {
  if (closing) return
  closing = true
  sfx('sheetClose')
  layer.value!.scrollTop = 0 // close from the top, so the media folds back into the card
  await animate(false)
  emit('close')
  await nextTick() // the Landing is inert until the parent drops the Sheet
  opener?.focus({ preventScroll: true })
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  opener = document.activeElement as HTMLElement | null
  animate(true)
  closeBtn.value?.focus({ preventScroll: true })
  addEventListener('keydown', onKey)
})
onBeforeUnmount(() => removeEventListener('keydown', onKey))
</script>

<template>
  <div class="ex">
    <div ref="backdrop" class="ex__backdrop" @click="close" />
    <article ref="layer" class="ex__layer" role="dialog" aria-modal="true" :aria-label="card.title">
      <button ref="closeBtn" class="ex__close" type="button" aria-label="Close project" @click="close">
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
      <div class="ex__media">
        <video v-if="video && !reduced" :src="video" :poster="card.poster" autoplay muted loop playsinline />
        <img v-else :src="still" alt="">
      </div>
      <!-- PLACEHOLDER: AI and experiment entries have no case study yet, so they show the summary and tools only -->
      <div class="ex__body">
        <p class="ex__eyebrow">
          {{ card.discipline }}
        </p>
        <h2 class="ex__title">
          {{ card.title }}
        </h2>
        <p class="ex__lede">
          {{ card.summary }}
        </p>
        <p v-if="card.long" class="ex__text">
          {{ card.long }}
        </p>
        <ul class="ex__tools" aria-label="Tools">
          <li v-for="t in card.tools" :key="t">
            {{ t }}
          </li>
        </ul>
        <section v-for="(s, i) in card.process" :key="s.title" class="ex__step">
          <span class="ex__num">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </section>
      </div>
    </article>
  </div>
</template>

<style scoped>
.ex {
  --line: color-mix(in srgb, var(--c-fg) 14%, transparent);
  --muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  position: fixed;
  inset: 0;
  z-index: 5000;
}

.ex__backdrop {
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* Centred, from under the header to the bottom edge */
.ex__layer {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: min(880px, 100vw - 32px);
  height: calc(100dvh - var(--header-h));
  translate: -50% 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: var(--c-bg);
  color: var(--c-fg);
  border: 1px solid;
  border-color: var(--edges);
  border-bottom: 0;
}

.ex__close {
  position: sticky;
  top: 16px;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  margin: 16px 16px -52px auto;
  padding: 0;
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  cursor: pointer;
}

.ex__close:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.ex__media {
  aspect-ratio: 16 / 9;
  max-height: 48vh;
  width: 100%;
  background: #000;
}

.ex__media video,
.ex__media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ex__body {
  display: grid;
  gap: 16px;
  max-width: 680px;
  margin: 0 auto;
  padding: 40px 24px 96px;
}

.ex__eyebrow,
.ex__num {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ex__title {
  margin: 0;
  font: 600 clamp(32px, 5vw, 56px)/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.ex__lede {
  margin: 0;
  font: 400 19px/1.45 var(--font-ui);
}

.ex__text,
.ex__step p {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.ex__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ex__tools li {
  padding: 5px 8px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--line);
}

.ex__step {
  display: grid;
  gap: 8px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

.ex__step h3 {
  margin: 0;
  font: 600 20px/1.2 var(--font-ui);
}
</style>
