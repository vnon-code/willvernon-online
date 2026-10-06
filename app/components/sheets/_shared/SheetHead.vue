<script setup lang="ts">
import SheetContents from './SheetContents.vue'
import { SHEET_SECTIONS, type SheetInfo } from './useSheetSections'

// PROTOTYPE (overnight run, 2026-10-07; TOOLS.md "Shared head, contents, numbering"): the Sheet's first block under
// the hero, the same on every Sheet: the title, an optional one-line hook, the project info (Year, Module, Client,
// Role, Tools, With; each optional, always in that order) and the contents (when the variant declared its sections
// with useSheetSections). Based on Amplified Spaces T2b's lead, simplified.
// Slots: `before` for the variant's own first-view media (it keeps the first view media-led: criterion 5), the
// default slot for the variant's own content after the contents. The block fades in a beat after the shell's build.
// Data comes from the project's story.ts / content JSON; never retype copy here. PLACEHOLDER: sizes, the delay.
const props = defineProps<{ title: string, hook?: string, info: SheetInfo }>()
const KEYS: [keyof SheetInfo, string][] = [['year', 'Year'], ['module', 'Module'], ['client', 'Client'], ['role', 'Role'], ['tools', 'Tools'], ['with', 'With']]
const rows = computed(() => KEYS.filter(([k]) => props.info[k]).map(([k, label]) => ({ k, label, v: props.info[k]! })))
const hasSections = !!inject(SHEET_SECTIONS, null)
</script>

<template>
  <section class="hd" data-sheet-body data-sheet-block="lead">
    <div data-build>
      <slot name="before" />
      <div class="hd__top">
        <div class="hd__words">
          <h2 class="hd__title">
            {{ title }}
          </h2>
          <p v-if="hook" class="hd__hook">
            {{ hook }}
          </p>
        </div>
        <dl v-if="rows.length" class="hd__info">
          <div v-for="r in rows" :key="r.k">
            <dt>{{ r.label }}</dt>
            <dd>{{ r.v }}</dd>
          </div>
        </dl>
      </div>
      <SheetContents v-if="hasSections" />
      <slot />
    </div>
  </section>
</template>

<style scoped>
.hd {
  animation: hd-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes hd-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .hd { animation-duration: 1ms; }
}

.hd__top {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
  gap: 24px 48px;
  padding: 28px 24px 32px;
  border-top: 1px solid var(--rule);
}

.hd__title {
  margin: 0;
  font: 700 clamp(40px, 5vw, 68px)/0.95 var(--font-ui);
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.hd__hook {
  max-width: 36ch;
  margin: 18px 0 0;
  font: 500 20px/1.35 var(--font-ui);
  letter-spacing: -0.01em;
}

.hd__info {
  display: grid;
  align-content: start;
  margin: 0;
  border-left: 1px solid var(--rule);
}

.hd__info div {
  padding: 8px 0 10px 20px;
}

.hd__info div + div {
  border-top: 1px solid var(--rule);
}

.hd__info dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.hd__info dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* Phones: one column; the right padding keeps the words clear of the shell's floating close button */
@media (max-width: 720px) {
  .hd__top {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 52px 26px 16px;
  }

  .hd__title {
    font-size: 40px;
  }

  .hd__hook {
    font-size: 18px;
  }

  .hd__info {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .hd__info div {
    padding-left: 0;
  }
}
</style>
