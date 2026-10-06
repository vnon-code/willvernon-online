<script setup lang="ts">
import { PANEL_VARIANTS, SCORES } from '~/composables/useSheetProto'

// PROTOTYPE (Project Sheet rework): the options panel. One control, "Sheet"; each option shows its matrix score
// (SCORES in useSheetProto.ts) and the top scorer is marked recommended. Round 2 shows A, R, S, T, U (B, C and 0 stay
// reachable by `?sheet=`). Dev and `?proto` only.
const { variant, setVariant } = useSheetVariant()
const top = computed(() => {
  const scored = PANEL_VARIANTS.filter(v => SCORES[v] != null)
  return scored.length ? scored.reduce((a, b) => (SCORES[b]! > SCORES[a]! ? b : a)) : null
})
</script>

<template>
  <div class="proto" role="group" aria-label="Prototype options">
    <p class="proto__head">
      Prototype · Sheet
    </p>
    <div class="proto__opts">
      <button
        v-for="v in PANEL_VARIANTS"
        :key="v"
        type="button"
        class="proto__opt"
        :aria-pressed="v === variant"
        :title="SHEET_NAMES[v]"
        @click="setVariant(v)"
      >
        <b>{{ v }}</b>
        <span class="proto__score">{{ SCORES[v] ?? '–' }}</span>
        <span v-if="v === top" class="proto__rec">rec</span>
      </button>
    </div>
    <p class="proto__name">
      {{ SHEET_NAMES[variant] }}
    </p>
  </div>
</template>

<style scoped>
/* Small, bottom left above the Visuals drawer's tab, over everything */
.proto {
  position: fixed;
  left: 16px;
  bottom: 56px;
  z-index: 10000;
  display: grid;
  gap: 6px;
  padding: 8px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.proto__head,
.proto__name {
  margin: 0;
  color: color-mix(in srgb, var(--c-fg) 60%, transparent);
}

.proto__opts {
  display: flex;
  gap: 4px;
}

.proto__opt {
  display: grid;
  justify-items: center;
  gap: 3px;
  min-width: 34px;
  padding: 5px 6px;
  font: inherit;
  color: inherit;
  background: var(--fill);
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
}

.proto__opt b {
  font-size: 12px;
}

.proto__opt[aria-pressed='true'] {
  color: var(--c-bg);
  background: var(--c-fg);
}

.proto__score {
  opacity: 0.7;
}

.proto__rec {
  color: var(--c-accent);
}

.proto__opt:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}
</style>
