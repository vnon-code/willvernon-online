<script setup lang="ts">
// PROTOTYPE (/proto) — throwaway. A glass box as wide as its content (Will, 2026-10-05). When `k` changes the new
// content enters and the box fits it, in the mode on <html data-fx-change> (useProtoFx.ts):
//   glide   — the width transitions (layout work every frame; the baseline)
//   morph   — the width snaps and the glass behind it scales from the old width (transform only)
//   stagger — morph, and the tool logos rise one after another (ProtoInfo.vue)
// `dir` is the strip's travel (1 = to the next card), so sliding content arrives from where the strip came.
const props = defineProps<{ k: string, dir?: number }>()
const inner = ref<HTMLElement>()
const bg = ref<HTMLElement>()
const w = ref(0)
const ready = ref(false) // no transition on the first measure
const snap = ref(false) // morph modes: the width never transitions
const measure = () => inner.value?.offsetWidth ?? 0
const msVar = (name: string, fallback: number) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback

onMounted(() => {
  w.value = measure()
  requestAnimationFrame(() => { ready.value = true })
})
watch(() => props.k, async () => {
  const from = w.value
  await nextTick()
  const to = measure()
  const mode = document.documentElement.dataset.fxChange
  snap.value = mode === 'morph' || mode === 'stagger'
  w.value = to
  if (!snap.value || !from || !to || Math.abs(from - to) < 1 || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  bg.value?.animate([{ transform: `scaleX(${from / to})` }, { transform: 'none' }], {
    // the row's side boxes morph faster, so their pinned text doesn't sit off-centre in the shrinking glass for long
    duration: bg.value.parentElement?.matches('.hug--tag, .hug--tools') ? 160 : msVar('--fx-change', 320),
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)', // --ease-out
  })
})
</script>

<template>
  <div
    class="hug"
    :class="{ 'hug--ready': ready && !snap }"
    :style="{ width: w ? `${w}px` : undefined, '--dir': dir ?? 1 }"
  >
    <span ref="bg" class="hug__bg" aria-hidden="true" />
    <div ref="inner" class="hug__inner">
      <Transition name="hug-x">
        <div :key="k" class="hug__in">
          <slot />
        </div>
      </Transition>
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
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--c-fg) 18%, transparent);
}

.hug--ready {
  overflow: clip;
  overflow-clip-margin: 1px; /* the glass border sits on the box's 1px border ring */
  transition: width var(--fx-change, 320ms) var(--ease-out);
}

.hug__inner {
  position: relative;
  flex: none;
  width: max-content;
}

.hug__in {
  animation: hug-fade var(--fx-enter, 240ms) ease-out both;
}

/* Name: arrives from the side the strip came from */
:root[data-fx-name='slide'] .hug--name .hug__in {
  animation: hug-slide var(--fx-name, 260ms) var(--ease-out) both;
}

:root[data-fx-name='scramble'] .hug--name .hug__in {
  animation: none; /* ProtoScramble animates the letters */
}

/* PROTOTYPE Row motion (the info row: tag | name | tools), round 22. --p is the element's place left to right.
   Every motion but 'hug' (the old baseline) also plays the old content out (.hug-x-leave-active), so the row never
   blinks empty. Slides use easeOutCubic over 16px so the direction still reads at ~120ms (judge: the strong
   --ease-out spent 14px by 29ms). */
.hug--tag { --p: 0; }
.hug--name { --p: 1; }
.hug--tools { --p: 2; }

.hug {
  --ease-row: cubic-bezier(0.33, 1, 0.68, 1); /* easeOutCubic */
  --row-slide: 16px;
}

/* Entries wait --row-in (80ms) until the old content's 70ms exit has cleared, so the two never read as a double
   image (round-3 judge). Side content travels less (--row-side), so it stays centred in its snapped box. */
.hug {
  --row-in: 80ms;
  --row-out: 70ms;
  --row-side: 6px;
}

/* swap: the name slides in, the tag and tools fade up just behind it; starts at 60ms, when the old text is all but
   gone (round-4 judge: 80ms left a near-blank frame) */
:root[data-fx-row-motion='swap'] .hug {
  --row-in: 60ms;
  --row-out: 50ms; /* final judge: 70ms left a dim gap at ~87ms */
}

:root[data-fx-row-motion='swap'] .hug--name .hug__in {
  animation: hug-row-slide 200ms var(--ease-row) var(--row-in) both;
}

:root[data-fx-row-motion='swap'] .hug--tag .hug__in,
:root[data-fx-row-motion='swap'] .hug--tools .hug__in {
  animation: hug-fade 160ms ease-out calc(var(--row-in) + 10ms) both;
}

:root[data-fx-row-motion='cascade'] .hug--tag,
:root[data-fx-row-motion='cascade'] .hug--tools {
  --row-slide: var(--row-side);
}

/* cascade: the name and sides start together; the sides travel less and land first */
:root[data-fx-row-motion='cascade'] .hug--name .hug__in {
  animation: hug-row-slide 220ms var(--ease-row) var(--row-in) both;
}

:root[data-fx-row-motion='cascade'] .hug--tag .hug__in,
:root[data-fx-row-motion='cascade'] .hug--tools .hug__in {
  animation: hug-row-slide 140ms var(--ease-row) var(--row-in) both; /* sides never sit empty (final judge) */
}

/* the old content: out against the travel, laid over the new so the box keeps its new width */
:root:not([data-fx-row-motion='hug']) .hug .hug__in.hug-x-leave-active {
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50% 0;
  width: max-content;
  animation: hug-row-out var(--row-out) ease-out both;
}

:root[data-fx-row-motion='swap'] .hug--tag .hug__in.hug-x-leave-active,
:root[data-fx-row-motion='swap'] .hug--tools .hug__in.hug-x-leave-active {
  animation-name: hug-fade-out;
}

:root[data-fx-row-motion='hug'] .hug .hug__in.hug-x-leave-active {
  display: none; /* the baseline: the old content goes at once */
}

@keyframes hug-row-slide {
  from { opacity: 0; transform: translateX(calc(var(--dir) * var(--row-slide))); }
}

@keyframes hug-row-out {
  to { opacity: 0; transform: translateX(calc(var(--dir) * -6px)); }
}

@keyframes hug-fade-out {
  to { opacity: 0; }
}

@keyframes hug-fade {
  from { opacity: 0; }
}

@keyframes hug-slide {
  from { opacity: 0; transform: translateX(calc(var(--dir) * var(--fx-slide, 14px))); }
}

@media (prefers-reduced-motion: reduce) {
  .hug--ready {
    transition: none;
  }

  :root[data-fx-name='slide'] .hug--name .hug__in,
  :root[data-fx-row-motion] .hug--tag .hug__in,
  :root[data-fx-row-motion] .hug--name .hug__in,
  :root[data-fx-row-motion] .hug--tools .hug__in {
    animation-name: hug-fade;
    animation-delay: 0ms;
  }

  :root:not([data-fx-row-motion='hug']) .hug .hug__in.hug-x-leave-active {
    animation-name: hug-fade-out; /* fade only: no slide out */
  }
}
</style>
