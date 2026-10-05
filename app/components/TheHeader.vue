<script setup lang="ts">
// The Landing's header row (Will, 2026-10-04): logo left, menu and mute right. The filter chips stay with the strip.
// PLACEHOLDER: the menu does nothing until the full-screen index exists.

// Mute (Will, 2026-10-04; 2026-10-05: split from VOL): silences the music and the UI sounds. The Sound HUD's VOL is
// the music's level only. Unmuting with VOL at 0 (entered without sound) brings the music in at 100%.
const sound = useSound()
const muted = computed(() => sound.muted.value)
function toggleMute() {
  sound.setMuted(!muted.value)
  if (!muted.value && sound.volume.value === 0) sound.setVolume(1)
  if (fx.on.value) fx.sfx('press')
  else sound.uiSound.grab()
}

// PROTOTYPE (/proto): the Icon nav (Will's pick, 2026-10-04): a round button that slides the links out to its
// left. Link names and targets are PLACEHOLDERS. Remove with useProto.
const proto = useProto()
const fx = useProtoFx() // PROTOTYPE: header press/magnetic and sound options
// Magnetic: within `pullR` px a round button leans up to `pull` px towards the pointer (fine pointers only)
const right = ref<HTMLElement>()
function onPointer(e: PointerEvent) {
  if (!fx.on.value || fx.opt.value.header !== 'magnetic' || e.pointerType !== 'mouse') return
  for (const b of right.value?.querySelectorAll<HTMLElement>('.header__mute') ?? []) {
    const r = b.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy), k = d < fx.params.pullR ? (1 - d / fx.params.pullR) * fx.params.pull / Math.max(d, 1) : 0
    b.style.translate = k ? `${(dx * k).toFixed(2)}px ${(dy * k).toFixed(2)}px` : ''
  }
}
const nav = computed(() => (proto.on.value ? 'icon' : 'now'))
const LINKS = ['Work', 'Design', 'Music', 'AI', 'Contact']
const navOpen = ref(false)
function toggleNav() {
  navOpen.value = !navOpen.value
  if (fx.on.value) fx.sfx('press', 0, 'blipTick') // the menu clicks like a filter chip (Will, 2026-10-05); mute keeps the press
  else sound.uiSound.grab()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') navOpen.value = false
}
onMounted(() => {
  addEventListener('keydown', onKey)
  addEventListener('pointermove', onPointer)
})
onBeforeUnmount(() => {
  removeEventListener('keydown', onKey)
  removeEventListener('pointermove', onPointer)
})
</script>

<template>
  <header class="header">
    <img class="header__logo" src="/img/monogram-white-trans.png" alt="Will Vernon" data-dot-clear>
    <div ref="right" class="header__right">
      <button v-if="nav === 'now'" class="header__menu" type="button" data-dot-clear>
        Menu
      </button>
      <nav
        v-else
        id="proto-nav"
        class="header__links"
        :class="{ 'header__links--folded': !navOpen }"
        :inert="!navOpen"
        :data-dot-clear="navOpen ? '' : undefined"
        aria-label="Site"
      >
        <a v-for="l in LINKS" :key="l" href="#" @click.prevent @pointerenter="(e) => { if (e.pointerType === 'mouse') fx.sfx('hover', 0, 'tick') }">{{ l }}</a>
      </nav>
      <button
        v-if="nav === 'icon'"
        class="header__mute header__burger"
        :class="{ 'header__burger--open': navOpen }"
        type="button"
        data-dot-clear
        aria-controls="proto-nav"
        :aria-expanded="navOpen"
        :aria-label="navOpen ? 'Close menu' : 'Open menu'"
        @click="toggleNav"
      >
        <span /><span />
      </button>
      <button
        class="header__mute"
        type="button"
        data-dot-clear
        :aria-pressed="muted"
        :aria-label="muted ? 'Unmute sound' : 'Mute sound'"
        @click="toggleMute"
      >
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
          <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
          <path v-if="muted" d="M11 6l4 4M15 6l-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path v-else d="M11 5.5a3.5 3.5 0 0 1 0 5M13 3.5a6.5 6.5 0 0 1 0 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-h);
  padding: 0 24px;
  pointer-events: none;
}

.header > * {
  pointer-events: auto;
}

/* In a circle like the round buttons on the right (Will, 2026-10-05). PLACEHOLDER: logo inset */
.header__logo {
  display: block;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 8px;
  object-fit: contain;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--c-fg) 14%, transparent);
  border-radius: 999px;
}

.header__right {
  display: flex;
  gap: 6px;
}

/* Same filled pill as the filter chips */
.header__menu,
.header__mute {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--c-fg) 14%, transparent);
  border-radius: 999px;
  padding: 9px 14px;
  cursor: pointer;
  transition: border-color 0.3s var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .header__menu:hover,
  .header__mute:hover {
    border-color: color-mix(in srgb, var(--c-fg) 40%, transparent);
  }
}

.header__links {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 6px;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--c-fg) 14%, transparent);
  border-radius: 999px;
  clip-path: inset(0 0 0 0 round 999px);
  transition: clip-path 0.3s var(--ease-out), opacity 0.2s ease;
}

/* Folded: clipped back to its right edge, where the icon sits */
.header__links--folded {
  clip-path: inset(0 0 0 100% round 999px);
  opacity: 0;
}

.header__links a {
  padding: 0 9px;
  font: 500 12px/32px var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
  text-decoration: none;
  transition: color 0.16s ease;
}

.header__links a:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: -2px;
  border-radius: 999px;
}

@media (hover: hover) and (pointer: fine) {
  .header__links a:hover {
    color: var(--c-fg);
  }
}

/* Two bars that cross into an X */
.header__burger {
  position: relative;
}

.header__burger span {
  position: absolute;
  top: calc(50% - 0.75px);
  left: calc(50% - 7px);
  width: 14px;
  height: 1.5px;
  background: currentColor;
  border-radius: 1px;
  transition: transform 0.25s var(--ease-out);
}

.header__burger span:first-child {
  transform: translateY(-3px);
}

.header__burger span:last-child {
  transform: translateY(3px);
}

.header__burger--open span:first-child {
  transform: rotate(45deg);
}

.header__burger--open span:last-child {
  transform: rotate(-45deg);
}

/* PROTOTYPE (/proto) header options. press: the button dips while held. magnetic: press, and the round buttons lean
   towards a near pointer (TheHeader onPointer sets translate; the transition smooths it) */
:root[data-fx-header='press'] .header__mute,
:root[data-fx-header='press'] .header__menu,
:root[data-fx-header='magnetic'] .header__mute {
  transition: border-color 0.3s var(--ease-out-expo), transform var(--fx-press-ms, 120ms) var(--ease-out), translate 0.25s var(--ease-out);
}

:root[data-fx-header='press'] .header__mute:active,
:root[data-fx-header='press'] .header__menu:active,
:root[data-fx-header='magnetic'] .header__mute:active {
  transform: scale(0.94);
}

@media (prefers-reduced-motion: reduce) {
  :root[data-fx-header] .header__mute {
    translate: none !important;
  }

  .header__links,
  .header__burger span {
    transition: opacity 0.2s ease;
  }
}

@media (max-width: 640px) {
  .header__links a {
    padding: 0 6px;
    font-size: 11px;
  }
}

.header__mute {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
}

.header__mute[aria-pressed='true'] {
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
}

.header__menu:focus-visible,
.header__mute:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .header {
    padding: 0 16px;
  }
}
</style>
