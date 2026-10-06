<script setup lang="ts">
import type { ProjectCard, SheetOpen } from '~/types/project'

// The Sections under the Landing (docs/adr/0002-one-scrolling-page.md; Scroll page shell, Will 2026-10-05): one
// solid panel, with the dot background scrolling in the margins. Each Section is a placeholder built from real
// content titles; its design is its own ticket.
const emit = defineEmits<{ expand: [SheetOpen] }>()

const { data: cards } = useNuxtData<ProjectCard[]>('strip-cards')
const aiCards = computed(() => (cards.value ?? []).filter(c => c.discipline === 'AI'))
// Read at prerender only (like the strip), so the content files stay out of the client bundle
const { data: content } = await useAsyncData('sections-content', async () => {
  const [tracks, toolset, about, ai] = await Promise.all([
    import('~~/content/tracks.json'),
    import('~~/content/toolset.json'),
    import('~~/content/about.json'),
    import('~~/content/ai.json'),
  ])
  return {
    tracks: tracks.default.tracks.map(t => ({ title: t.title, desc: t.desc, artwork: t.artwork })),
    tools: Object.values(toolset.default.tools).map(t => t.title),
    about: about.default.headings.filter(h => h.level === 3).map(h => h.text),
    ai: ai.default.page.headings.filter(h => h.level === 2).map(h => h.text),
  }
})
const { sfx } = useSound()

function openCard(c: ProjectCard, e: MouseEvent) {
  sfx('sheetOpen')
  const el = e.currentTarget as HTMLElement
  emit('expand', { card: c, from: el.getBoundingClientRect(), el })
}
</script>

<template>
  <div class="sections">
    <div class="sections__panel">
      <section id="section-about" class="sec" aria-labelledby="h-about">
        <p class="sec__kicker">01</p>
        <h2 id="h-about">About me</h2>
        <ul class="sec__list"><li v-for="h in content?.about" :key="h">{{ h }}</li></ul>
      </section>
      <section id="section-music" class="sec" aria-labelledby="h-music">
        <p class="sec__kicker">02</p>
        <h2 id="h-music">Music</h2>
        <ul class="sec__tracks">
          <li v-for="t in content?.tracks" :key="t.title">
            <img :src="t.artwork" alt="" loading="lazy">
            <div><strong>{{ t.title }}</strong><p>{{ t.desc }}</p></div>
          </li>
        </ul>
      </section>
      <section id="section-ai" class="sec" aria-labelledby="h-ai">
        <p class="sec__kicker">03</p>
        <h2 id="h-ai">AI</h2>
        <ul class="sec__list"><li v-for="h in content?.ai" :key="h">{{ h }}</li></ul>
        <div class="sec__grid">
          <button v-for="c in aiCards" :key="c.id" type="button" class="sec__card" @click="openCard(c, $event)" @pointerenter="(e) => { if (e.pointerType === 'mouse') sfx('hoverCard') }">
            <img :src="c.poster" alt="" loading="lazy">
            <span>{{ c.title }}</span>
          </button>
        </div>
        <ul class="sec__tiles"><li v-for="t in content?.tools" :key="t">{{ t }}</li></ul>
      </section>
      <section id="section-contact" class="sec sec--last" aria-labelledby="h-contact">
        <p class="sec__kicker">04</p>
        <h2 id="h-contact">Contact</h2>
        <p class="sec__note">The form lands with the Contact section ticket.</p>
      </section>
    </div>
  </div>
</template>

<style scoped>
/* One screen of spacer, then the panel. The Landing shows through the spacer and scrolls up with it. */
.sections {
  --panel-w: min(1040px, 100% - 32px);
  position: relative;
  z-index: 5; /* over the Landing, under the drawers */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100svh;
  pointer-events: none; /* the spacer passes clicks to the Landing */
}

.sections > * {
  pointer-events: auto;
}

.sections__panel {
  width: var(--panel-w);
  padding: 0 clamp(20px, 5vw, 64px);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-bottom: 0;
  /* A plate (Will, 2026-10-06): round top corners that square off as the panel docks under the header (--dock), so
     no curve shows once a Section is reached. PLACEHOLDER: 12px */
  border-radius: calc(12px * (1 - var(--dock, 0))) calc(12px * (1 - var(--dock, 0))) 0 0;
}

.sec {
  min-height: 70svh;
  padding: 72px 0 96px;
  border-top: 1px solid color-mix(in srgb, var(--c-fg) 10%, transparent);
}

.sec:first-child {
  border-top: 0;
}

.sec--last {
  min-height: calc(100svh - var(--header-h));
}

.sec__kicker {
  margin: 0 0 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--c-accent);
}

.sec h2 {
  margin: 0 0 32px;
  font: 600 clamp(36px, 6vw, 72px)/1 var(--font-ui);
  letter-spacing: -0.02em;
}

.sec__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.sec__card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  font: 500 14px/1.2 var(--font-ui);
  text-align: left;
  color: var(--c-fg);
  background: none;
  border: 0;
  cursor: pointer;
}

.sec__card img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border: 1px solid;
  border-color: var(--edges);
}

.sec__card:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 4px;
}

.sec__tracks {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sec__tracks li {
  display: flex;
  gap: 16px;
  align-items: center;
}

.sec__tracks img {
  width: 72px;
  height: 72px;
  object-fit: cover;
}

.sec__tracks p {
  margin: 4px 0 0;
  font-size: 14px;
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
}

.sec__list + .sec__grid {
  margin-top: 32px;
}

.sec__list {
  margin: 0;
  padding: 0;
  list-style: none;
  font: 500 clamp(20px, 2.4vw, 28px)/1.6 var(--font-ui);
}

.sec__grid + .sec__tiles {
  margin-top: 32px;
}

.sec__tiles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sec__tiles li {
  padding: 10px 14px;
  background: var(--plate-solid);
}

.sec__note {
  color: color-mix(in srgb, var(--c-fg) 72%, transparent);
}
</style>
