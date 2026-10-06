<script setup lang="ts">
import { SHEET_SECTIONS, sheetNo } from './useSheetSections'

// PROTOTYPE (overnight run, 2026-10-07; TOOLS.md "Shared head, contents, numbering"): a numbered section's heading,
// one format on every Sheet: "03 / 05 Define" (T2b's count). Number and total come from useSheetSections; the
// numbers are aria-hidden, so a screen reader hears the heading once, as "Define", and the section bound with
// `sec(id)` takes that name. tabindex -1 lets the contents hand it focus. PLACEHOLDER: sizes.
const props = withDefaults(defineProps<{ id: string, tag?: 'h2' | 'h3' }>(), { tag: 'h3' })
const s = inject(SHEET_SECTIONS)
const i = computed(() => s?.list.findIndex(x => x.id === props.id) ?? -1)
const label = computed(() => s?.list[i.value]?.label ?? props.id)
</script>

<template>
  <component :is="tag" :id="s?.heading(id)" class="sno" tabindex="-1">
    <span v-if="s && i >= 0" class="sno__n" aria-hidden="true"><b>{{ sheetNo(i) }}</b> / {{ sheetNo(s.list.length - 1) }}</span>
    <span class="sno__l">{{ label }}</span>
  </component>
</template>

<style scoped>
.sno {
  margin: 0;
  font: 500 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
  outline-offset: 4px;
}

.sno:focus:not(:focus-visible) {
  outline: 0;
}

.sno__n {
  font-variant-numeric: tabular-nums;
}

.sno__n b {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--c-accent);
}

.sno__l {
  margin-left: 10px;
  font-size: 11px;
  text-transform: uppercase;
}

@media (max-width: 720px) {
  .sno__n b {
    font-size: 24px;
  }
}
</style>
