<script setup lang="ts">
import type { SheetMediaItem } from '~/types/project'

// PROTOTYPE (overnight run, Amplified Spaces T4): T2's visual / room comparison slider as a part (not a variant; not
// in meta.json). The visual on the left of the cut, the room on the right; a native range input drives the cut, so
// keys, touch and screen readers work. Sized by its parent. PLACEHOLDER: the knob, the tags.
const props = defineProps<{ before: SheetMediaItem, after: SheetMediaItem, label: string }>()
const cut = ref(50)
watch(() => props.after.src, () => (cut.value = 50))
</script>

<template>
  <div class="cmp" :style="{ '--cut': `${cut}%` }">
    <SheetPic class="cmp__after" :m="after" />
    <SheetPic class="cmp__before" :m="before" />
    <span class="cmp__line" aria-hidden="true"><span class="cmp__knob" /></span>
    <span class="cmp__tag cmp__tag--l" aria-hidden="true">Visual</span>
    <span class="cmp__tag cmp__tag--r" aria-hidden="true">Room</span>
    <input v-model.number="cut" class="cmp__range" type="range" min="0" max="100" :aria-label="`${label}: slide between the visual and the room`">
  </div>
</template>

<style scoped>
.cmp {
  position: relative;
  overflow: hidden;
  background: #000;
}

.cmp .pic {
  position: absolute;
  inset: 0;
}

.cmp__before {
  clip-path: inset(0 calc(100% - var(--cut)) 0 0);
}

.cmp__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--cut);
  width: 2px;
  margin-left: -1px;
  background: var(--c-fg);
  pointer-events: none;
}

.cmp__knob {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  translate: -50% -50%;
  background: var(--c-bg);
  border: 2px solid var(--c-fg);
  border-radius: 50%;
}

.cmp__knob::before,
.cmp__knob::after {
  position: absolute;
  top: 50%;
  width: 0;
  height: 0;
  margin-top: -5px;
  content: '';
  border: 5px solid transparent;
}

.cmp__knob::before {
  left: 7px;
  border-right-color: var(--c-fg);
}

.cmp__knob::after {
  right: 7px;
  border-left-color: var(--c-fg);
}

.cmp__tag {
  position: absolute;
  top: 10px;
  padding: 3px 7px;
  font: 500 10.5px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border-radius: 5px;
  pointer-events: none;
}

.cmp__tag--l {
  left: 10px;
}

.cmp__tag--r {
  right: 10px;
}

/* Horizontal drags move the cut; vertical swipes still scroll the Sheet */
.cmp__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: pan-y;
}

.cmp:has(.cmp__range:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
</style>
