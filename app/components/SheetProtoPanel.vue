<script setup lang="ts">
// PROTOTYPE (Project Sheet rework): the options panel. One control, "Sheet": the variants of the open project (or the
// centre card's), from sheetRegistry.ts; each shows its matrix score and the top scorer is marked recommended. A pick
// applies from the next open. Dev and `?proto` only.
const props = defineProps<{ slug?: string }>()
const { variant, setVariant } = useSheetVariant()
const opts = computed(() => (props.slug ? sheetOptions(props.slug) : []))
const current = computed(() => (props.slug ? resolveSheet(props.slug, variant.value) : null))
const top = computed(() => {
  const scored = opts.value.filter(o => o.score != null)
  return scored.length ? scored.reduce((a, b) => (b.score! > a.score! ? b : a)).id : null
})
</script>

<template>
  <div class="proto" role="group" aria-label="Prototype options">
    <p class="proto__head">
      Prototype · Sheet · {{ slug ?? '–' }}
    </p>
    <div class="proto__opts">
      <button
        v-for="o in opts"
        :key="o.id"
        type="button"
        class="proto__opt"
        :aria-pressed="o.id === current"
        :title="o.name"
        @click="setVariant(o.id)"
      >
        <b>{{ o.id }}</b>
        <span class="proto__score">{{ o.score ?? '–' }}</span>
        <span v-if="o.id === top" class="proto__rec">rec</span>
      </button>
    </div>
    <p class="proto__name">
      {{ opts.find(o => o.id === current)?.name }}
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
