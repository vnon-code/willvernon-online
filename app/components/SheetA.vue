<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from './SheetShell.vue'

// PROTOTYPE A "Hero column" (Project Sheet rework; round 2 baseline).
// Axes: layout = hero + scrolling column; build = rise in below; drop = fall down.
// Round 1's A with Will's notes 2 and 3 only: the header docks, the column is one frame with the Sections panel's
// edges, and its blocks meet edge to edge (hairline rules between, no gaps). Same content as round 1: the title
// plates and the summary, each process step with its media large, the outcome and the renders.
// PLACEHOLDER: type sizes, the hairlines.
const props = defineProps<{ sheet: SheetOpen }>()
const content = computed(() => sheetContent(props.sheet.card))
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <section class="sa__intro" data-sheet-body data-sheet-block="intro" data-build>
      <SheetPlates :card="sheet.card" />
      <div class="sa__lede">
        <p class="sa__summary">
          {{ sheet.card.summary }}
        </p>
        <p v-if="sheet.card.long" class="sa__muted">
          {{ sheet.card.long }}
        </p>
      </div>
    </section>

    <section v-for="(s, i) in content.steps" :key="s.title" class="sa__step" :data-sheet-block="`step-${i + 1}`" data-build>
      <SheetPic v-if="s.media" class="sa__media" :m="s.media" />
      <div class="sa__text">
        <span class="sa__num">{{ pad(i) }}</span>
        <h3>{{ s.title }}</h3>
        <p class="sa__muted">
          {{ s.text }}
        </p>
      </div>
    </section>

    <!-- PLACEHOLDER copy: "Outcome", "Renders" -->
    <section v-if="content.outcome" class="sa__step" data-sheet-block="outcome" data-build>
      <SheetPic class="sa__media" :m="content.outcome" />
      <div class="sa__text">
        <span class="sa__num">→</span>
        <h3>Outcome</h3>
      </div>
    </section>

    <section v-if="sheet.card.gallery.length" class="sa__gallery" data-sheet-block="renders" data-build>
      <h3>Renders</h3>
      <div class="sa__grid">
        <SheetPic v-for="g in sheet.card.gallery" :key="g.src" :m="g" />
      </div>
    </section>
  </SheetShell>
</template>

<style scoped>
.sa__intro,
.sa__step,
.sa__gallery {
  border-top: 1px solid var(--rule);
}

/* The first block sits right under the hero: no rule */
.sa__intro {
  display: grid;
  gap: 24px;
  padding: 24px 24px 32px;
  border-top: 0;
}

.sa__lede {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 32px;
  padding: 0 8px;
}

.sa__lede p,
.sa__text p {
  margin: 0;
}

.sa__summary {
  font: 400 21px/1.4 var(--font-ui);
}

.sa__muted {
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.sa__media {
  aspect-ratio: 16 / 9;
}

/* Number, title, text on one line */
.sa__text {
  display: grid;
  grid-template-columns: 48px minmax(160px, 0.8fr) 1.6fr;
  gap: 16px;
  align-items: baseline;
  padding: 20px 24px 24px;
}

/* Race red as the accent, as the Sections' numbers */
.sa__num {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.sa__text h3,
.sa__gallery h3 {
  margin: 0;
  font: 600 20px/1.2 var(--font-ui);
}

.sa__gallery h3 {
  padding: 20px 24px;
}

.sa__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
}

.sa__grid > * {
  aspect-ratio: 16 / 9;
}

/* An odd last render takes the row, so the grid has no hole */
.sa__grid > :last-child:nth-child(odd) {
  grid-column: span 2;
  aspect-ratio: 32 / 9;
}

@media (max-width: 720px) {
  .sa__lede,
  .sa__text {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
