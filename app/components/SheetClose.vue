<script setup lang="ts">
// PROTOTYPE (Project Sheet rework, round 1): the Sheets' ✕, a round solid plate with lit edges (as today's Sheet)
defineEmits<{ close: [] }>()
</script>

<template>
  <button class="x" type="button" data-sheet-close aria-label="Close project" @click="$emit('close')">
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </button>
</template>

<style scoped>
.x {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--c-fg);
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.16s ease;
}

.x:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .x:hover {
    background: color-mix(in srgb, var(--c-fg) 14%, var(--c-bg));
  }
}
</style>
