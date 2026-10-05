<script setup lang="ts">
// A glass plate as wide as its content (Will, 2026-10-05; picked on /proto). When `k` changes the new content
// fades in and the plate fits it: the width snaps and the glass behind scales from the old width ("morph",
// transform only). `pin` boxes (the info row's tag and tools) morph from that edge, quicker, so their pinned text
// never sits off-centre in shrinking glass for long; the centred box (the name) slides its content in from the side
// the strip came from (`dir`: 1 = towards the next card). `bare` drops the glass (the tool tiles carry their own).
const props = defineProps<{ k: string, dir?: number, pin?: 'left' | 'right', bare?: boolean }>()
const MORPH_MS = 320
const PIN_MS = 160

const inner = ref<HTMLElement>()
const bg = ref<HTMLElement>()
const w = ref(0)
const measure = () => inner.value?.offsetWidth ?? 0

// Late font loads and the strip's narrow-card step change the content's width without a new `k`: refit, no morph
let ro: ResizeObserver | undefined
onMounted(() => {
  w.value = measure()
  ro = new ResizeObserver(() => (w.value = measure()))
  ro.observe(inner.value!)
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => props.k, async () => {
  const from = w.value
  await nextTick()
  const to = measure()
  w.value = to
  if (!from || !to || Math.abs(from - to) < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  bg.value?.animate([{ transform: `scaleX(${from / to})` }, { transform: 'none' }], {
    duration: props.pin ? PIN_MS : MORPH_MS,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)', // --ease-out
  })
})
</script>

<template>
  <div
    class="hug"
    :class="[pin ? `hug--${pin}` : 'hug--centre', { 'hug--bare': bare }]"
    :style="{ width: w ? `${w}px` : undefined, '--dir': dir ?? 1 }"
  >
    <span ref="bg" class="hug__bg" aria-hidden="true" />
    <div ref="inner" class="hug__inner">
      <div :key="k" class="hug__in">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hug {
  position: relative;
  display: flex;
  justify-content: center; /* while it fits, the new content overflows evenly on both sides */
  box-sizing: content-box;
  border: 1px solid transparent; /* the glass's border is on .hug__bg, so it can scale */
}

.hug__bg {
  position: absolute;
  inset: -1px;
  background: var(--hug-fill, color-mix(in srgb, var(--c-bg) 72%, transparent));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: var(--hug-r, 8px);
}

.hug--left .hug__bg { transform-origin: 0 50%; }
.hug--right .hug__bg { transform-origin: 100% 50%; }

.hug--bare .hug__bg {
  background: none;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.hug__inner {
  position: relative;
  flex: none;
  width: max-content;
}

.hug__in {
  animation: hug-fade 240ms ease-out both;
}

/* The name arrives from the side the strip came from */
.hug--centre .hug__in {
  animation: hug-slide 260ms var(--ease-out) both;
}

@keyframes hug-fade {
  from { opacity: 0; }
}

@keyframes hug-slide {
  from { opacity: 0; transform: translateX(calc(var(--dir) * 8px)); }
}

@media (prefers-reduced-motion: reduce) {
  .hug--centre .hug__in {
    animation-name: hug-fade;
  }
}
</style>
