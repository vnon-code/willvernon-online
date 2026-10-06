<script setup lang="ts">
import { TOPO } from './story'

// PROTOTYPE (overnight run, 04 TA–TC; not a variant): the credits block that closes every variant. PLACEHOLDER copy.
</script>

<template>
  <section class="cr" data-sheet-block="credits" aria-label="Credits">
    <p class="cr__k">
      Credits
    </p>
    <dl class="cr__list">
      <div v-for="c in TOPO.credits" :key="c.k">
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
  overflow-wrap: anywhere;
}

@media (max-width: 720px) {
  .cr,
  .cr__list {
    grid-template-columns: 1fr;
  }

  .cr {
    padding: 22px 52px 32px 16px;
  }
}
</style>
