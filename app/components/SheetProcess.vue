<script setup lang="ts">
import type { SheetView } from '~/composables/useSheetProto'

// PROTOTYPE (Project Sheet rework, round 2): the process as one continuous band (R, S, T): the phases side by side,
// their lead images meeting edge to edge in one strip, the rest as a thumbnail strip, the words under each.
// PLACEHOLDER: the "Process" label, the strip heights.
defineProps<{ phases: SheetView['phases'] }>()
</script>

<template>
  <section class="pr" data-sheet-block="process" data-build aria-label="Process">
    <p class="pr__label">
      Process
    </p>
    <div class="pr__band" :style="{ '--cols': phases.length }">
      <h3 v-for="(p, i) in phases" :key="`h${p.id}`" class="pr__head">
        <span class="pr__num">{{ pad(i) }}</span> {{ p.title }}
      </h3>
      <SheetPic v-for="p in phases" :key="`m${p.id}`" class="pr__lead" :m="p.media[0]!" cap />
      <div v-for="p in phases" :key="`t${p.id}`" class="pr__thumbs">
        <SheetPic v-for="m in p.media.slice(1, 4)" :key="m.src" :m="m" />
      </div>
      <p v-for="p in phases" :key="`p${p.id}`" class="pr__text">
        {{ p.text }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.pr {
  border-top: 1px solid var(--rule);
}

.pr__label {
  margin: 0;
  padding: 20px 24px 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pr__band {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
}

.pr__head {
  margin: 0;
  padding: 16px 24px 20px;
  font: 600 20px/1.2 var(--font-ui);
}

/* Race red as the accent, as the Sections' numbers */
.pr__num {
  margin-right: 6px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  vertical-align: 0.3em;
  color: var(--c-accent);
}

.pr__lead {
  height: 300px;
}

.pr__thumbs {
  display: flex;
  height: 84px;
}

.pr__thumbs > * {
  flex: 1;
}

.pr__text {
  margin: 0;
  padding: 20px 24px 32px;
  font: 400 14px/1.6 var(--font-ui);
  color: var(--muted);
}

.pr__text + .pr__text,
.pr__head + .pr__head {
  border-left: 1px solid var(--rule);
}

@media (max-width: 720px) {
  .pr__band {
    grid-template-columns: 1fr 1fr;
  }

  .pr__lead {
    height: 180px;
  }
}
</style>
