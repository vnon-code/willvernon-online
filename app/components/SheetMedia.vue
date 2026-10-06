<script setup lang="ts">
import type { ProjectCard, SheetMediaItem } from '~/types/project'

// PROTOTYPE (Project Sheet rework, round 1): the teaser's box in the Sheets A, B and C. One element, laid out where
// the variant puts it; useSheetMotion draws it out of the card and back. The teaser carries on from the card's
// frame: a snapshot of that frame sits under a new video started at the card's time, until the video is playing.
// `swap` lays another piece of media over the teaser (a step, a render), crossfaded.
const props = defineProps<{ card: ProjectCard, source?: HTMLElement, swap?: SheetMediaItem | null }>()

const root = ref<HTMLElement>()
const fit = ref<HTMLElement>()
const video = ref<HTMLVideoElement>()
const canvas = ref<HTMLCanvasElement>()
const ready = ref(false) // the Sheet's own teaser is playing; the snapshot and poster go
const reduced = import.meta.client && matchMedia('(prefers-reduced-motion: reduce)').matches
const gif = computed(() => props.card.teaser?.endsWith('.gif') ? props.card.teaser : null)
const teaser = computed(() => props.card.teaser && !gif.value && !reduced ? props.card.teaser : null)
// The card's aspect: the box's content keeps it while the box changes shape
const aspect = computed(() => props.source ? props.source.offsetWidth / Math.max(1, props.source.offsetHeight) : 16 / 9)

onMounted(() => {
  const sv = props.source?.querySelector('video')
  const c = canvas.value
  if (sv && c && sv.readyState >= 2) {
    c.width = sv.videoWidth
    c.height = sv.videoHeight
    c.getContext('2d')?.drawImage(sv, 0, 0)
  }
  const v = video.value
  if (v && sv) v.currentTime = sv.currentTime
  v?.play().catch(() => {})
})

defineExpose({ root, fit, video })
</script>

<template>
  <div ref="root" class="sm" data-sheet-media :style="{ '--fit-a': aspect }">
    <div ref="fit" class="sm__fit">
      <img v-if="!ready" class="sm__layer" :src="card.poster" alt="">
      <canvas v-if="!ready" ref="canvas" class="sm__layer" />
      <video
        v-if="teaser"
        ref="video"
        class="sm__layer"
        :src="teaser"
        muted
        loop
        playsinline
        preload="auto"
        @playing="ready = true"
      />
      <img v-else-if="gif" class="sm__layer" :src="gif" alt="" @load="ready = true">
    </div>
    <Transition name="sm-swap">
      <video v-if="swap?.type === 'video'" :key="swap.src" class="sm__swap" :src="swap.src" :poster="swap.poster" muted loop playsinline autoplay />
      <img v-else-if="swap" :key="swap.src" class="sm__swap" :src="swap.src" :alt="swap.alt ?? ''">
    </Transition>
  </div>
</template>

<style scoped>
/* The lit plate edge and a dark ground. Its corner is set by the flight while it moves */
.sm {
  position: relative;
  overflow: hidden;
  background: #000;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 12px; /* PLACEHOLDER */
  transform-origin: 0 0;
  container-type: size;
  will-change: transform;
}

/* A box of the card's aspect covering the media box; the flight counter-scales it so the video never stretches */
.sm__fit {
  position: absolute;
  left: 50%;
  top: 50%;
  width: max(100cqw, 100cqh * var(--fit-a));
  height: max(100cqh, 100cqw / var(--fit-a));
  translate: -50% -50%;
}

/* At rest: the box itself (a teaser of another aspect re-crops here; PLACEHOLDER) */
.sm__fit[data-rest] {
  width: 100%;
  height: 100%;
}

.sm__layer,
.sm__swap {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sm-swap-enter-active,
.sm-swap-leave-active {
  transition: opacity 200ms ease;
}

.sm-swap-enter-from,
.sm-swap-leave-to {
  opacity: 0;
}
</style>
