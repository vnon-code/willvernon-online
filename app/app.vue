<script setup lang="ts">
import type { ProjectCard } from '~/types/project'

const gateOpen = ref(true)
const landingVisible = ref(false)
const hudVisible = ref(false)
const enteredWithSound = ref(false)
const centreCard = ref<{ poster: string, teaser?: string | null }>()
// The dot field's pulse starts at the new centre card's border on each step
const pulse = shallowRef<{ el: Element, at: number }>()
const onStep = (el: Element) => (pulse.value = { el, at: performance.now() })
// The open project (the Sheet), grown out of the centre card's rect
const expanded = shallowRef<{ card: ProjectCard, from: DOMRect } | null>(null)

// Step 2 of the Gate transition: the Landing fades up from black. The music fades in later, with the Sound HUD's entrance.
function onEnter(withSound: boolean) {
  gateOpen.value = false
  landingVisible.value = true
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  enteredWithSound.value = withSound
  // The Sound HUD enters once the Landing has faded up
  setTimeout(() => (hudVisible.value = true), reduced ? 300 : 1000)
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <main class="landing" :class="{ 'landing--visible': landingVisible }" :inert="gateOpen || !!expanded">
      <!-- Mounted with the fade-up, so it costs nothing behind the Gate -->
      <TheDotField v-if="landingVisible" :project="centreCard" :pulse="pulse" />
      <TheHeader />
      <!-- PLACEHOLDER entrance: the strip fades up with the Landing -->
      <TheProjectStrip
        :active="!gateOpen && !expanded"
        @centre="centreCard = $event"
        @step="onStep"
        @expand="expanded = $event"
      />
    </main>
    <TheVisualHud v-if="hudVisible" :inert="!!expanded" />
    <TheSoundHud v-if="hudVisible" :with-sound="enteredWithSound" :inert="!!expanded" />
    <ProjectSheet v-if="expanded" :card="expanded.card" :from="expanded.from" @close="expanded = null" />
    <TheGate v-if="gateOpen" @enter="onEnter" />
  </div>
</template>

<style scoped>
.landing {
  position: fixed;
  inset: 0;
  isolation: isolate; /* keeps the dot field's z-index: -1 inside the Landing */
  opacity: 0;
  transition: opacity 1s ease;
}

.landing--visible {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .landing {
    transition-duration: 0.3s;
  }
}
</style>
