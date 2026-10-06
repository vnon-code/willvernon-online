<script setup lang="ts">
import type { ProjectCard } from '~/types/project'

// PROTOTYPE (Project Sheet rework, round 1): the info row's plates (TheProjectStrip.vue) in the Sheet: the tag plate,
// the name plate and the tool tiles, same sizes and fills. `stack` sets the name on its own line (narrow columns).
defineProps<{ card: ProjectCard, stack?: boolean }>()
const TAG: Record<string, string> = { projects: 'Project', experiments: 'Experiment', ai: 'AI' }
</script>

<template>
  <div class="plates" :class="{ 'plates--stack': stack }">
    <span class="plates__tag" data-plate="tag">{{ TAG[card.from] ?? card.discipline }}</span>
    <h2 class="plates__name" data-plate="name">
      {{ card.title }}
    </h2>
    <ProjectTools :card="card" class="plates__tools" data-plate="tools" />
  </div>
</template>

<style scoped>
.plates {
  --side-h: 36px;
  --icon: 18px;
  --side-r: calc(var(--side-h) * 8 / 42);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: 'tag name tools';
  align-items: center;
  gap: 12px;
}

.plates--stack {
  grid-template-columns: auto 1fr;
  grid-template-areas: 'name name' 'tag tools';
  row-gap: 12px;
}

.plates__tag {
  grid-area: tag;
  justify-self: start;
  padding: 0 calc(var(--side-h) * 0.4);
  font: 600 11.5px/calc(var(--side-h) - 2px) var(--font-ui); /* PLACEHOLDER: weight 600, as the Landing's tag */
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
  background: var(--plate-solid);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: var(--side-r);
}

.plates__name {
  grid-area: name;
  justify-self: center;
  min-width: 0;
  margin: 0;
  padding: 0 20px;
  font: 500 18px/40px var(--font-ui);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
}

.plates--stack .plates__name {
  justify-self: start;
  max-width: 100%;
}

.plates__tools {
  grid-area: tools;
  justify-self: end;
}
</style>
