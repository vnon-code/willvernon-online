<script setup lang="ts">
import { SHEET_SECTIONS, goToSection, sheetNo } from './useSheetSections'

// PROTOTYPE (overnight run, 2026-10-07; TOOLS.md "Shared head, contents, numbering"): the Sheet's contents, from
// useSheetSections. Two parts, one look on every Sheet:
// - the index: a nav of numbered links under the title (T2b's index strip, simplified to type); a link scrolls the
//   layer to its section and focuses the section's heading;
// - the rail: T2b's phase marker, a slim plate in the left margin (≥1200px) lighting the section in view. It's
//   decoration (aria-hidden, no pointer events); the index is what keyboards and screen readers use.
// PLACEHOLDER: sizes, the rail's place.
const s = inject(SHEET_SECTIONS)!
const list = computed(() => s.list)

function go(id: string) {
  goToSection(id, s)
}

// The rail names the last section whose top (plus ~80px) has come into view; read on scroll, once a frame
const nav = ref<HTMLElement>()
const active = ref(-1)
let layer: HTMLElement | null = null
let marks: HTMLElement[] = []
let raf = 0
function mark() {
  raf = 0
  if (!layer) return
  const edge = layer.getBoundingClientRect().bottom - 80
  active.value = marks.reduce((a, el) => el.getBoundingClientRect().top < edge ? list.value.findIndex(x => x.id === el.dataset.sheetSection) : a, -1)
}
const onScroll = () => (raf ||= requestAnimationFrame(mark))
onMounted(() => {
  layer = nav.value?.closest<HTMLElement>('[data-sheet-layer]') ?? null
  marks = [...layer?.querySelectorAll<HTMLElement>('[data-sheet-section]') ?? []]
  layer?.addEventListener('scroll', onScroll, { passive: true })
  mark()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  layer?.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <nav ref="nav" class="sc" aria-label="Contents">
    <ol class="sc__list">
      <li v-for="(x, i) in list" :key="x.id">
        <a class="sc__link" :href="`#${s.anchor(x.id)}`" @click.prevent="go(x.id)"><b>{{ sheetNo(i) }}</b> {{ x.label }}</a>
      </li>
    </ol>
    <Teleport to="body">
      <ol class="sc-rail" aria-hidden="true">
        <li v-for="(x, i) in list" :key="x.id" :class="{ 'is-on': i === active }">
          <span>{{ x.label }}</span><b>{{ sheetNo(i) }}</b>
        </li>
      </ol>
    </Teleport>
  </nav>
</template>

<style scoped>
/* The index: one row of equal cells, rules between, the numbers in red */
.sc__list {
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.sc__list li {
  display: flex;
  background: var(--c-bg);
}

.sc__link {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: baseline;
  min-height: 44px;
  padding: 15px 24px 14px;
  font: 500 11.5px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  outline-offset: -3px;
  transition: color 0.2s var(--ease-out), background-color 0.2s var(--ease-out);
}

.sc__link b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.sc__link:hover,
.sc__link:focus-visible {
  color: var(--c-fg);
  background: var(--fill);
}

/* The rail: in the left margin, level with the view's middle, shown while the Sheet is open */
.sc-rail {
  position: fixed;
  top: 50%;
  right: calc(50% + min(520px, 50% - 16px) + 20px);
  z-index: 5001;
  display: grid;
  gap: 2px;
  margin: 0;
  padding: 8px 10px;
  list-style: none;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px;
  translate: 0 -50%;
  opacity: 0;
  transition: opacity 0.15s var(--ease-out);
  pointer-events: none;
}

:root[data-sheet='open'] .sc-rail {
  opacity: 1;
  transition-duration: 0.3s;
}

.sc-rail li {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: baseline;
  font: 500 11px/1.6 var(--font-ui);
  letter-spacing: 0.06em;
  color: var(--muted);
}

.sc-rail b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.sc-rail span {
  font-size: 10px;
  text-transform: uppercase;
  opacity: 0;
  translate: 4px 0;
  transition: opacity 0.2s var(--ease-out), translate 0.2s var(--ease-out);
}

.sc-rail .is-on {
  color: var(--c-fg);
}

.sc-rail .is-on b {
  color: var(--c-accent);
}

.sc-rail .is-on span {
  opacity: 1;
  translate: none;
}

@media (max-width: 1199px) {
  .sc-rail {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sc-rail span {
    transition: none;
  }
}

/* Phones: two columns; an odd last cell spans both, so the grid has no holes */
@media (max-width: 720px) {
  .sc__list {
    grid-auto-flow: row;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sc__list li:last-child:nth-child(odd) {
    grid-column: span 2;
  }

  .sc__link {
    padding: 14px 16px 13px;
  }
}
</style>
