<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { byKey, GLYPHS, INFO, RM, SEEDS, STAGES, TESTS } from './story'

// PROTOTYPE RA "Specimen" (overnight run, Remnants r1). The Sheet as a type foundry's specimen page, each beat its own
// device: the glyph set as nine stone slices (hover shows the glyph) → a type tester (type Q to O, size slider) → the
// lineage as a five-stage table, object to stone → a seed log you step through, with the twelve first tests as the snag
// → the title decrypting live, glyphs swapping into "remnants".
// Refs: Klim Type Foundry and Grilli Type specimen pages (type tester, glyph set); Pentagram's type case studies; the
// AE title in the film itself. PLACEHOLDER: sizes, copy, timings.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('ra', [
  { id: 'type', label: 'Type it' },
  { id: 'lineage', label: 'Object to stone' },
  { id: 'seed', label: 'One seed' },
  { id: 'title', label: 'The title' },
])

// Type tester
const text = ref('QWERTYUIO')
const size = ref(96)
const chars = computed(() => [...text.value.slice(0, 32)].map(c => ({ c, g: byKey(c) })))

// Seed log
const pick = ref(SEEDS.length - 1)

// Decrypt: each of the eight letters swaps through glyphs, then lands, left to right
const WORD = 'remnants'
const slots = ref(WORD.split('').map(() => ({ g: GLYPHS[0]!.glyph as string | null, done: false })))
const title = ref<HTMLElement>()
let io: IntersectionObserver | undefined
let tick = 0
function decrypt() {
  clearInterval(tick)
  const t0 = performance.now()
  slots.value = WORD.split('').map((_, i) => ({ g: GLYPHS[i % 9]!.glyph, done: false }))
  tick = window.setInterval(() => {
    const t = performance.now() - t0
    let all = true
    slots.value = slots.value.map((s, i) => {
      if (t > 500 + i * 220) return { g: null, done: true }
      all = false
      return { g: GLYPHS[Math.floor(Math.random() * 9)]!.glyph, done: false }
    })
    if (all) clearInterval(tick)
  }, 90)
}
onMounted(() => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slots.value = WORD.split('').map(() => ({ g: null, done: true }))
    return
  }
  io = new IntersectionObserver(([e]) => {
    if (e?.isIntersecting) decrypt()
  }, { root: title.value?.closest('[data-sheet-layer]'), threshold: 0.6 })
  if (title.value) io.observe(title.value)
})
onBeforeUnmount(() => {
  io?.disconnect()
  clearInterval(tick)
})
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="ra">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ol class="set" aria-label="The nine glyphs">
            <li v-for="g in GLYPHS" :key="g.n" class="set__cell">
              <img :src="g.stoneXs" :alt="`${g.name} in stone, from the film`" width="480" height="270" loading="lazy" decoding="async">
              <span class="set__glyph" :style="{ '--m': `url(${g.glyph})` }" aria-hidden="true" />
              <span class="set__k" aria-hidden="true">{{ g.key }}</span>
              <span class="set__name">{{ g.name }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 Type tester -->
      <section class="tt" v-bind="sec('type')" data-sheet-block="type">
        <div class="tt__side">
          <SheetSectionNo id="type" />
          <p class="ra__text">
            {{ RM.keys }}
          </p>
          <label class="tt__field">
            <span>Text</span>
            <input v-model="text" type="text" maxlength="32" spellcheck="false" autocomplete="off">
          </label>
          <label class="tt__field">
            <span>Size {{ size }}</span>
            <input v-model.number="size" type="range" min="40" max="160" step="4">
          </label>
        </div>
        <p class="tt__out" :style="{ '--s': `${size}px` }" aria-hidden="true">
          <template v-for="(ch, i) in chars" :key="i">
            <span v-if="ch.g" class="tt__g" :style="{ '--m': `url(${ch.g.glyph})` }" :title="ch.g.name" />
            <span v-else class="tt__c">{{ ch.c === ' ' ? ' ' : ch.c }}</span>
          </template>
        </p>
      </section>

      <!-- 02 Lineage: one row per glyph, object to stone -->
      <section class="ln" v-bind="sec('lineage')" data-sheet-block="lineage">
        <div class="ln__head">
          <SheetSectionNo id="lineage" />
          <p class="ra__text">
            {{ RM.museum }} {{ RM.lines }}
          </p>
        </div>
        <div class="ln__scroll">
          <table class="ln__t">
            <thead>
              <tr>
                <th scope="col">
                  Glyph
                </th>
                <th v-for="s in STAGES" :key="s" scope="col">
                  {{ s }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in GLYPHS" :key="g.n">
                <th scope="row">
                  <b>{{ g.name }}</b>
                  <span>{{ g.from }}</span>
                </th>
                <td class="ln__obj">
                  <img :src="g.obj" :alt="g.from" width="200" height="260" loading="lazy" decoding="async">
                </td>
                <td class="ln__m">
                  <span class="ln__line" :style="{ '--m': `url(${g.line})` }" role="img" :aria-label="`${g.name}, traced lines`" />
                </td>
                <td class="ln__grid">
                  <img :src="g.grid" :alt="`${g.name} on the grid`" width="480" height="480" loading="lazy" decoding="async">
                </td>
                <td class="ln__m">
                  <span class="ln__glyph" :style="{ '--m': `url(${g.glyph})` }" role="img" :aria-label="`${g.name}, final glyph`" />
                </td>
                <td class="ln__stone">
                  <img :src="g.stoneXs" :alt="`${g.name} in stone`" width="480" height="270" loading="lazy" decoding="async">
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 03 The seed log -->
      <section class="sd" v-bind="sec('seed')" data-sheet-block="seed">
        <div class="sd__side">
          <SheetSectionNo id="seed" />
          <p class="ra__text">
            {{ RM.cn }} {{ RM.seed }}
          </p>
          <ol class="sd__log" aria-label="Seeds and prompts">
            <li v-for="(s, i) in SEEDS" :key="s.seed">
              <button type="button" :aria-pressed="pick === i" :class="{ 'is-pick': s.pick }" @click="pick = i">
                <code>{{ s.seed }}</code>
                <span>{{ s.prompt }}</span>
              </button>
            </li>
          </ol>
        </div>
        <div class="sd__view">
          <img
            v-for="(s, i) in SEEDS"
            :key="s.seed"
            :class="{ 'is-on': pick === i }"
            :src="s.img"
            :alt="pick === i ? `Seed ${s.seed}: ${s.prompt}` : ''"
            :aria-hidden="pick !== i"
            width="934"
            height="526"
            loading="lazy"
            decoding="async"
          >
          <p class="sd__tag" aria-hidden="true">
            Seed {{ SEEDS[pick]!.seed }}{{ SEEDS[pick]!.pick ? ' · kept' : '' }}
          </p>
        </div>
        <div class="sd__snag">
          <p class="sd__k">
            {{ RM.snag }}
          </p>
          <ul class="sd__tests" aria-label="ControlNet's first tests">
            <li v-for="(t, i) in TESTS" :key="t">
              <img :src="t" :alt="`First test ${i + 1}`" width="540" height="540" loading="lazy" decoding="async">
            </li>
          </ul>
        </div>
      </section>

      <!-- 04 The title decrypting -->
      <section ref="title" class="dc" v-bind="sec('title')" data-sheet-block="title">
        <SheetSectionNo id="title" />
        <p class="dc__word" aria-label="remnants">
          <span v-for="(s, i) in slots" :key="i" class="dc__slot" aria-hidden="true">
            <span v-if="!s.done" class="dc__g" :style="{ '--m': `url(${s.g})` }" />
            <span v-else class="dc__l">{{ WORD[i] }}</span>
          </span>
        </p>
        <div class="dc__notes">
          <p class="ra__text">
            {{ RM.decrypt }}
          </p>
          <p class="ra__text">
            {{ RM.slow }} {{ RM.music }}
          </p>
          <button type="button" class="dc__btn" @click="decrypt">
            Decrypt again
          </button>
        </div>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ra__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
/* Glyph masks: the glyph art is a luminance-free alpha mask, filled with the text colour */
.set__glyph, .tt__g, .ln__line, .ln__glyph, .dc__g {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}

/* The set: nine stone slices meeting the hero */
.set {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #0b0d0e;
}
.set__cell {
  position: relative;
  overflow: hidden;
  color: #fff;
}
.set__cell + .set__cell {
  border-left: 1px solid rgb(255 255 255 / 0.08);
}
.set__cell img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 5 / 8;
  object-fit: cover;
  transition: opacity 240ms ease-out, scale 400ms cubic-bezier(0.23, 1, 0.32, 1);
}
.set__glyph {
  position: absolute;
  inset: 22% 18% 30%;
  opacity: 0;
  transition: opacity 240ms ease-out;
}
.set__k, .set__name {
  position: absolute;
  left: 10px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.set__k {
  top: 10px;
  color: rgb(255 255 255 / 0.55);
}
.set__name {
  bottom: 10px;
  white-space: nowrap;
}
@media (hover: hover) {
  .set__cell:hover img { opacity: 0.25; scale: 1.04; }
  .set__cell:hover .set__glyph { opacity: 1; }
}

/* 01 Type tester */
.tt {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.tt__side {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 28px 24px;
  border-right: 1px solid var(--rule);
}
.tt__field {
  display: grid;
  gap: 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.tt__field input[type=text] {
  min-width: 0;
  padding: 10px 12px;
  font: 500 16px/1.2 var(--font-ui);
  letter-spacing: 0.12em;
  color: var(--c-fg);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 0;
}
.tt__field input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
.tt__field input[type=range] {
  width: 100%;
  accent-color: var(--c-fg);
}
.tt__out {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  gap: calc(var(--s) * 0.12);
  min-height: 360px;
  margin: 0;
  padding: 32px 24px;
  overflow: hidden;
}
.tt__g {
  width: var(--s);
  height: var(--s);
}
.tt__c {
  font: 500 var(--s)/1 var(--font-ui);
  color: var(--muted);
  opacity: 0.4;
}

/* 02 Lineage table */
.ln {
  border-top: 1px solid var(--rule);
}
.ln__head {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  gap: 16px 24px;
  align-items: start;
  padding: 28px 24px;
}
.ln__scroll {
  overflow-x: auto;
  overscroll-behavior-x: contain;
}
.ln__t {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  table-layout: fixed;
}
.ln__t th, .ln__t td {
  padding: 0;
  border-top: 1px solid var(--rule);
  vertical-align: middle;
}
.ln__t td + td, .ln__t th + td, .ln__t th + th {
  border-left: 1px solid var(--rule);
}
.ln__t thead th {
  padding: 10px 12px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  color: var(--muted);
}
.ln__t thead th:first-child { width: 17%; }
.ln__t thead th:last-child { width: 26%; }
.ln__t tbody th {
  padding: 12px;
  text-align: left;
  font-weight: 400;
}
.ln__t tbody th b {
  display: block;
  font: 600 16px/1.2 var(--font-ui);
}
.ln__t tbody th span {
  font: 400 12px/1.4 var(--font-ui);
  color: var(--muted);
}
.ln__t img {
  display: block;
  width: 100%;
  height: 112px;
  object-fit: cover;
}
.ln__grid img { object-fit: cover; }
.ln__m { padding: 14px !important; }
.ln__line, .ln__glyph {
  height: 84px;
}
.ln__line { color: #e03a2f; }
.ln__t tbody tr {
  transition: background-color 160ms ease-out;
}
.ln__t tbody tr:hover {
  background: color-mix(in srgb, var(--c-fg) 5%, transparent);
}

/* 03 Seed log */
.sd {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  border-top: 1px solid var(--rule);
}
.sd__side {
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 28px 24px;
}
.sd__log {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}
.sd__log button {
  display: grid;
  grid-template-columns: 11ch minmax(0, 1fr);
  gap: 12px;
  width: 100%;
  padding: 9px 0;
  text-align: left;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
}
.sd__log code {
  font: 400 12px/1.45 ui-monospace, 'SF Mono', Menlo, monospace;
}
.sd__log button[aria-pressed=true] {
  color: var(--c-fg);
}
.sd__log button.is-pick code {
  color: #e03a2f;
}
.sd__log button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
.sd__view {
  position: relative;
  min-height: 320px;
  overflow: hidden;
  background: #0b0d0e;
  border-left: 1px solid var(--rule);
}
.sd__view img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 240ms ease-out;
}
.sd__view img.is-on { opacity: 1; }
.sd__tag {
  position: absolute;
  left: 16px;
  bottom: 14px;
  margin: 0;
  padding: 6px 10px;
  font: 500 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}
.sd__snag {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.sd__k {
  margin: 0;
  padding: 24px;
  font: 500 15px/1.5 var(--font-ui);
}
.sd__tests {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}
.sd__tests img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
}

/* 04 Decrypt */
.dc {
  display: grid;
  gap: 24px;
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}
.dc__word {
  display: flex;
  justify-content: space-between;
  margin: 8px 0;
  font: 300 clamp(48px, 9vw, 128px)/1 var(--font-ui);
  letter-spacing: -0.02em;
}
.dc__slot {
  display: grid;
  place-items: center;
  width: 1ch;
  height: 1.1em;
}
.dc__g {
  width: 0.9em;
  height: 0.9em;
}
.dc__notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  gap: 16px 32px;
  align-items: start;
}
.dc__btn {
  padding: 10px 16px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 999px;
  cursor: pointer;
}
.dc__btn:hover { border-color: var(--c-fg); }
.dc__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .set__cell img, .set__glyph, .sd__view img, .ln__t tbody tr { transition: none; }
}
@media (max-width: 720px) {
  .set { grid-template-columns: repeat(9, minmax(0, 1fr)); }
  .set__cell img { aspect-ratio: 1 / 2.4; }
  .set__k { left: 4px; top: 6px; font-size: 10px; }
  .set__name { display: none; }
  .tt, .sd, .sd__snag, .ln__head {
    grid-template-columns: minmax(0, 1fr);
  }
  .tt__side, .sd__side, .ln__head {
    padding: 22px 52px 22px 16px;
    border-right: 0;
  }
  .tt__out {
    min-height: 200px;
    padding: 20px 16px;
    border-top: 1px solid var(--rule);
  }
  .sd__view {
    aspect-ratio: 16 / 9;
    min-height: 0;
    border-left: 0;
    border-top: 1px solid var(--rule);
  }
  .sd__k { padding: 18px 16px; }
  .sd__tests {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    border-left: 0;
  }
  .dc { padding: 22px 16px 32px; }
  .dc__notes { grid-template-columns: minmax(0, 1fr); }
  .dc__btn { justify-self: start; }
}
</style>
