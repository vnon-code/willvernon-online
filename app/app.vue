<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- PLACEHOLDER: scaffold check only; the gate and landing replace this -->
    <main class="scaffold">
      <h1 class="scaffold__name">WILL VERNON</h1>
      <p class="scaffold__line">v3 scaffold — tokens and fonts loaded</p>
    </main>
  </div>
</template>

<style scoped>
.scaffold {
  min-height: 100svh;
  display: grid;
  place-content: center;
  text-align: center;
  padding: 16px;
}

.scaffold__name {
  margin: 0;
  font-family: var(--font-hero);
  font-weight: var(--hero-weight);
  font-stretch: var(--hero-stretch);
  font-size: clamp(2.5rem, 10vw, 8rem);
  line-height: 0.9;
}

.scaffold__line {
  color: var(--c-accent);
  font-size: 1.25rem;
}
</style>
