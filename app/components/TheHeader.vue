<script setup lang="ts">
// The Landing's header row (Will, 2026-10-04): logo left, menu and mute right. The filter chips stay with the strip.
// Menu (Will, 2026-10-04: "Icon"): a round button that slides the links out to its left. The links scroll to the
// Sections (Will, 2026-10-05: About me, Music, AI, Contact for now).
// Docked (Will, 2026-10-05/06): as the panel enters the last stretch before the header, the burger gives way to the
// links inline on wider screens (phones keep the burger), and the header fades in a solid background with a lit bottom
// edge in step with the scroll (--hdr) while the monogram's circle fades out. It all holds the whole way back up and fades out only
// once the page is fully home.

// Mute (Will, 2026-10-04; 2026-10-05: split from VOL): silences the music and the UI sounds. The Sound HUD's VOL is
// the music's level only. Unmuting with VOL at 0 (entered without sound) brings the music in at 100%.
const sound = useSound()
const { goHome, goTo, docked, current } = useScrollPage()
const wide = ref(false)
const inline = computed(() => docked.value && wide.value)
// Undocking (back home) fades the background out over time; docking follows the scroll instead
const leaving = ref(false)
let leaveTimer = 0
watch(docked, (on) => {
  clearTimeout(leaveTimer)
  leaving.value = !on
  if (!on) leaveTimer = window.setTimeout(() => (leaving.value = false), 450)
})
let mq: MediaQueryList | undefined
const onMq = () => (wide.value = !!mq?.matches)
const muted = computed(() => sound.muted.value)
function toggleMute() {
  sound.setMuted(!muted.value)
  if (!muted.value && sound.volume.value === 0) sound.setVolume(1)
  sound.sfx('mute')
}

const navOpen = ref(false)
function go(id: SectionId) {
  navOpen.value = false
  sound.sfx('chip') // PLACEHOLDER
  goTo(id)
}
function home() {
  sound.sfx('menu') // PLACEHOLDER
  goHome()
}
function toggleNav() {
  navOpen.value = !navOpen.value
  sound.sfx('menu')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') navOpen.value = false
}
onMounted(() => {
  addEventListener('keydown', onKey)
  mq = matchMedia('(min-width: 641px)')
  onMq()
  mq.addEventListener('change', onMq)
})
onBeforeUnmount(() => {
  removeEventListener('keydown', onKey)
  mq?.removeEventListener('change', onMq)
})
</script>

<template>
  <header class="header" :class="{ 'header--leaving': leaving, 'header--inline': inline }">
    <!-- The monogram returns home: back up to the Landing, which re-locks (docs/adr/0002-one-scrolling-page.md) -->
    <a class="header__home" href="/" data-dot-clear @click.prevent="home" @pointerenter="(e) => { if (e.pointerType === 'mouse') sound.sfx('hover') }">
      <img class="header__logo" src="/img/monogram-white-trans.png" alt="Will Vernon, home">
    </a>
    <div class="header__right">
      <nav
        id="site-nav"
        class="header__links"
        :class="{ 'header__links--folded': !navOpen && !inline }"
        :inert="!navOpen && !inline"
        :data-dot-clear="navOpen ? '' : undefined"
        aria-label="Site"
      >
        <a v-for="l in SECTIONS" :key="l.id" :href="`/${l.id}`" @click.prevent="go(l.id)" :aria-current="docked && current === l.id ? 'location' : undefined" @pointerenter="(e) => { if (e.pointerType === 'mouse') sound.sfx('hover') }">{{ l.label }}</a>
      </nav>
      <button
        class="header__round header__burger"
        :class="{ 'header__burger--open': navOpen }"
        type="button"
        data-dot-clear
        aria-controls="site-nav"
        :aria-expanded="navOpen"
        :aria-label="navOpen ? 'Close menu' : 'Open menu'"
        :inert="inline"
        @click="toggleNav"
      >
        <span /><span />
      </button>
      <button
        class="header__round header__mute"
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

/* The background: solid with a lit bottom edge. In with the scroll over the last stretch (--hdr, held at 1 the whole way
   back up), out over 400ms once home */
.header::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--c-bg);
  border-bottom: 1px solid color-mix(in srgb, var(--c-fg) 28%, transparent);
  opacity: var(--hdr, 0);
  pointer-events: none;
}

.header--leaving::before {
  transition: opacity 400ms var(--ease-out);
}

/* The monogram (bigger in its circle, Will, 2026-10-05; PLACEHOLDER: the 5px inset). Its circle lives on the link's
   ::before, so it can fade against the header's background: out with --hdr, back in once home */
.header__logo {
  display: block;
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 5px;
  object-fit: contain;
}

.header__home::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  opacity: calc(1 - var(--hdr, 0));
}

.header--leaving .header__home::before {
  transition: opacity 400ms var(--ease-out);
}

.header__home {
  position: relative;
  z-index: 0;
  display: block;
  border-radius: 999px;
}

.header__home:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.header__right {
  display: flex;
  gap: 6px;
}

/* Round glass buttons. "Press" (Will, 2026-10-05): they dip while held */
.header__round {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--c-fg);
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  cursor: pointer;
  transition: transform 120ms var(--ease-out);
}

.header__round:active {
  transform: scale(0.94);
}

.header__round:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.header__mute[aria-pressed='true'] {
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
}

.header__links {
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 6px;
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  clip-path: inset(0 0 0 0 round 999px);
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

/* Inline (past the Landing, wider screens): plain text links on the header's own background */
.header--inline .header__links {
  background: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-color: transparent;
}

.header__links a[aria-current] {
  color: var(--c-fg);
}

/* Docked: the burger fades out where it stands and the links slide over into its place (transforms only, so the row
   never reflows) */
.header__links,
.header__burger {
  transition: clip-path 0.3s var(--ease-out), opacity 0.2s ease, translate 0.3s var(--ease-out), scale 0.2s var(--ease-out),
    transform 120ms var(--ease-out); /* the round buttons' press dip */
}

.header--inline .header__links {
  translate: 38px 0; /* the burger's 32px + the row's 6px gap */
}

.header--inline .header__burger {
  opacity: 0;
  scale: 0.9;
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

@media (prefers-reduced-motion: reduce) {
  .header__links,
  .header__burger span {
    transition: opacity 0.2s ease;
  }
}

@media (max-width: 640px) {
  .header {
    padding: 0 16px;
  }

  .header__links a {
    padding: 0 6px;
    font-size: 11px;
  }
}
</style>
