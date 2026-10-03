<script setup lang="ts">
const gateOpen = ref(true)
const landingVisible = ref(false)
const hudVisible = ref(false)
const enteredWithSound = ref(false)
const { objectUrls } = useLoader()

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
    <!-- PLACEHOLDER Landing: the first project's still stands in for the point cloud until the Landing is built -->
    <main class="landing" :class="{ 'landing--visible': landingVisible }" :inert="gateOpen">
      <img
        v-if="objectUrls[FIRST_PROJECT.image]"
        class="landing__placeholder"
        :src="objectUrls[FIRST_PROJECT.image]"
        alt=""
      >
    </main>
    <TheSoundHud v-if="hudVisible" :with-sound="enteredWithSound" />
    <TheGate v-if="gateOpen" @enter="onEnter" />
  </div>
</template>

<style scoped>
.landing {
  position: fixed;
  inset: 0;
  opacity: 0;
  transition: opacity 1s ease;
}

.landing--visible {
  opacity: 1;
}

.landing__placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .landing {
    transition-duration: 0.3s;
  }
}
</style>
