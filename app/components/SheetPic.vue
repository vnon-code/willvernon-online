<script setup lang="ts">
import type { SheetMediaItem } from '~/types/project'

// PROTOTYPE (Project Sheet rework, round 2): one piece of media in a Sheet, sized by its parent. Stills load lazily;
// videos load nothing until they scroll into view (usePlayInView plays them there and pauses them off it). `cap`
// overlays the caption on a small solid plate (no glass). PLACEHOLDER: the caption plate.
defineProps<{ m: SheetMediaItem, cap?: boolean }>()
</script>

<template>
  <figure class="pic">
    <video v-if="m.type === 'video'" :src="m.src" :poster="m.poster" muted loop playsinline preload="none" data-in-view :aria-label="m.caption" />
    <img v-else :src="m.src" :alt="m.alt ?? ''" loading="lazy" decoding="async">
    <figcaption v-if="cap && m.caption" class="pic__cap">
      {{ m.caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.pic {
  position: relative;
  margin: 0;
  overflow: hidden;
  background: #000;
}

.pic > video,
.pic > img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: var(--pic-fit, cover);
}

.pic__cap {
  position: absolute;
  left: 12px;
  bottom: 12px;
  max-width: calc(100% - 24px);
  padding: 5px 9px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}
</style>
