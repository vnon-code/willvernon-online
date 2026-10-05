<script setup lang="ts">
import type { ProtoCard } from '~/composables/useProto'
const gateOpen = ref(true)
const landingVisible = ref(false)
const hudVisible = ref(false)
const enteredWithSound = ref(false)
const centreCard = ref<{ poster: string, teaser?: string | null }>()

// PROTOTYPE (/proto): skip the Gate (entered without sound; stems still load, so VOL/mute work), show the switcher,
// and open expanded projects. Remove with useProto.
const proto = useProto()
const expanded = ref<{ card: ProtoCard, from: DOMRect } | null>(null)
onMounted(() => {
  if (!proto.on.value) return
  useLoader().startLoading()
  onEnter(false)
})

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
    <main class="landing" :class="{ 'landing--visible': landingVisible }" :inert="gateOpen">
      <!-- Mounted with the fade-up, so it costs nothing behind the Gate -->
      <TheDotField v-if="landingVisible" :project="centreCard" />
      <TheHeader />
      <!-- PLACEHOLDER entrance: the strip fades up with the Landing -->
      <TheProjectStrip :active="!gateOpen && !expanded" @centre="centreCard = $event" @expand="expanded = $event" />
    </main>
    <TheVisualHud v-if="hudVisible" />
    <TheSoundHud v-if="hudVisible" :with-sound="enteredWithSound" />
    <TheGate v-if="gateOpen && !proto.on.value" @enter="onEnter" />
    <template v-if="proto.on.value">
      <ProtoExpand v-if="expanded" :card="expanded.card" :from="expanded.from" @close="expanded = null" />
      <ProtoPanel />
    </template>
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
