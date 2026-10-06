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
// The open project (the Sheet), grown out of the card it was opened from
const expanded = shallowRef<{ card: ProjectCard, from: DOMRect } | null>(null)

// One scrolling page (docs/adr/0002-one-scrolling-page.md): the Landing on top, the Sections below
const { mode, current, settled, goTo } = useScrollPage()
const { sfx } = useSound()
let target: ReturnType<typeof initScrollPage> = {}
const { data: cards } = useNuxtData<ProjectCard[]>('strip-cards')

onMounted(() => (target = initScrollPage()))

// Learn More (Will, 2026-10-05): straight down to the first Section, no menu
function learnMore() {
  sfx('menu')
  goTo(SECTIONS[0].id)
}

// `/work/<slug>` gets a URL while its Sheet is open; closing it returns the URL to where you were
function openSheet(e: { card: ProjectCard, from: DOMRect }) {
  expanded.value = e
  history.pushState(history.state, '', `/work/${e.card.id}${location.search}`)
}
function closeSheet() {
  expanded.value = null
  history.replaceState(history.state, '', `/${current.value ?? ''}${location.search}`)
}

// Step 2 of the Gate transition: the Landing fades up from black. The music fades in later, with the Sound HUD's entrance.
function onEnter(withSound: boolean) {
  gateOpen.value = false
  landingVisible.value = true
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  enteredWithSound.value = withSound
  // The Sound HUD enters once the Landing has faded up
  setTimeout(() => (hudVisible.value = true), reduced ? 300 : 1000)
  // Deep links: after the Gate, go where the link pointed
  setTimeout(() => {
    if (target.section) goTo(target.section)
    const card = target.work && cards.value?.find(c => c.id === target.work)
    if (card) {
      const w = Math.min(innerWidth * 0.5, 640), h = w * 9 / 16
      expanded.value = { card, from: new DOMRect((innerWidth - w) / 2, (innerHeight - h) / 2, w, h) }
    }
  }, reduced ? 300 : 1000)
}
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <main class="landing" :class="{ 'landing--visible': landingVisible }" :inert="gateOpen || !!expanded || mode !== 'landing'">
      <!-- Mounted with the fade-up, so it costs nothing behind the Gate -->
      <TheDotField v-if="landingVisible" :project="centreCard" :pulse="pulse" />
      <div class="landing__stage">
        <!-- PLACEHOLDER entrance: the strip fades up with the Landing -->
        <TheProjectStrip
          :active="!gateOpen && !expanded && mode === 'landing' && settled"
          @centre="centreCard = $event"
          @step="onStep"
          @expand="expanded = $event"
        />
        <!-- PLACEHOLDER look: the drawers' tab, centred -->
        <button
          v-if="hudVisible"
          class="learn-more"
          :class="{ 'learn-more--away': !settled }"
          type="button"
          :data-dot-clear="settled ? '' : undefined"
          :inert="!settled"
          @click="learnMore"
        >
          Learn More
          <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M2 3.5L5 6.5L8 3.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        </button>
      </div>
    </main>
    <TheSections v-if="landingVisible" :inert="!!expanded" @expand="openSheet" />
    <div class="landing landing--header" :class="{ 'landing--visible': landingVisible }" :inert="gateOpen || !!expanded">
      <TheHeader />
    </div>
    <TheVisualHud v-if="hudVisible" :inert="!!expanded" />
    <TheSoundHud v-if="hudVisible" :with-sound="enteredWithSound" :inert="!!expanded" />
    <ProjectSheet v-if="expanded" :card="expanded.card" :from="expanded.from" @close="closeSheet" />
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

/* The header sits over the Sections panel; only its own buttons take clicks */
.landing--header {
  z-index: 3000;
  pointer-events: none;
}

/* Depth (Will, 2026-10-06: "part + recede"): the Landing falls behind the rising panel, scrolling at 0.6× and shrinking
   up to 8% toward its top edge (--land: 0 home → 1 docked). Its fixed parts (the info row) ride along, since the
   transform makes them fixed to the stage. Nothing is clipped: the panel covers the centre and the side cards part
   out of the margins (TheProjectStrip.vue). The dot field stays put and scrolls its dots in the shader.
   PLACEHOLDER: the 0.6 and the 8% */
.landing__stage {
  height: 100%;
  translate: 0 calc(-0.6 * var(--sy, 0px));
  transform-origin: 50% 0;
  scale: calc(1 - 0.08 * var(--land, 0));
}

.learn-more {
  position: fixed;
  left: 50%;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 14px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: var(--c-bg); /* dark (Will, 2026-10-06) */
  border: 1px solid;
  border-color: var(--edges);
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  translate: -50% 0;
  cursor: pointer;
  animation: learn-rise 0.6s var(--ease-out-expo) backwards; /* backwards only, so the transitions below still run */
  /* Back home: rises in on the drawers' curve once the Landing has settled (Will, 2026-10-06) */
  transition: opacity 240ms var(--ease-out), translate 420ms var(--ease-drawer), background-color 0.16s ease;
}

/* Away (leaving, or on the way back): sunk below the screen's edge */
.learn-more--away {
  opacity: 0;
  translate: -50% 100%;
  transition-duration: 160ms, 160ms, 0.16s;
}

.learn-more:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

@media (hover: hover) and (pointer: fine) {
  .learn-more:hover {
    background: color-mix(in srgb, var(--c-fg) 14%, var(--c-bg));
  }
}

@keyframes learn-rise {
  from { opacity: 0; translate: -50% 10px; }
}

@media (prefers-reduced-motion: reduce) {
  .landing {
    transition-duration: 0.3s;
  }

  .learn-more {
    animation: none;
  }

  .learn-more--away {
    translate: -50% 0;
  }
}
</style>
