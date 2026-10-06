<script setup lang="ts">
import type { SheetView } from '~/composables/useSheetProto'

// PROTOTYPE (Project Sheet rework, round 2): the outcome (R, S, T): the first piece full width with the words
// overlaid, the rest edge to edge below. PLACEHOLDER: the "Outcome" label.
const props = defineProps<{ outcome: NonNullable<SheetView['outcome']> }>()
const rest = computed(() => props.outcome.media.slice(1))
</script>

<template>
  <section class="oc" data-sheet-block="outcome" data-build aria-label="Outcome">
    <div class="oc__lead">
      <SheetPic :m="outcome.media[0]!" cap />
      <div class="oc__plate">
        <p class="oc__label">
          Outcome
        </p>
        <p v-if="outcome.text" class="oc__text">
          {{ outcome.text }}
        </p>
      </div>
    </div>
    <div v-if="rest.length" class="oc__rest">
      <SheetPic v-for="m in rest" :key="m.src" :m="m" cap />
    </div>
  </section>
</template>

<style scoped>
.oc {
  border-top: 1px solid var(--rule);
}

.oc__lead {
  position: relative;
}

.oc__lead > .pic {
  aspect-ratio: 16 / 9;
}

.oc__plate {
  position: absolute;
  top: 20px;
  left: 20px;
  max-width: 340px;
  padding: 14px 16px;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.oc__label {
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.oc__text {
  margin: 8px 0 0;
  font: 400 15px/1.5 var(--font-ui);
}

.oc__rest {
  display: flex;
  flex-wrap: wrap;
}

.oc__rest > * {
  flex: 1 1 calc(100% / 3);
  aspect-ratio: 16 / 9;
}
</style>
