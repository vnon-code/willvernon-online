<script setup lang="ts">
// PROTOTYPE (overnight run, 2026-10-07; TOOLS.md "Shared head, contents, numbering"): the credits block that closes a
// Sheet, the same on every Sheet (it replaces the per-project *Credits.vue copies, which were identical). Items come
// from the project's story.ts / content JSON. PLACEHOLDER copy lives there, not here.
defineProps<{ items: { k: string, v: string }[] }>()
</script>

<template>
  <section v-if="items.length" class="cr" data-sheet-block="credits" aria-labelledby="sheet-credits-h">
    <h3 id="sheet-credits-h" class="cr__k">
      Credits
    </h3>
    <dl class="cr__list">
      <div v-for="c in items" :key="c.k">
        <dt>{{ c.k }}</dt>
        <dd>{{ c.v }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.cr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
  gap: 16px 24px;
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

.cr__k,
.cr dt {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.cr__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 24px;
  margin: 0;
}

.cr dd {
  margin: 6px 0 0;
  font: 400 14px/1.45 var(--font-ui);
}

@media (max-width: 720px) {
  .cr,
  .cr__list {
    grid-template-columns: 1fr;
  }

  .cr {
    padding: 22px 16px 32px;
  }
}
</style>
