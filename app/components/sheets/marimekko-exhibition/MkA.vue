<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, INFO, MK, OUT, PB, TYPEWRITER } from './story'

// PROTOTYPE MkA "Colourway" (overnight run, Marimekko Exhibition r1). The first view is the four A3 posters side
// by side, the system in fours → 01 a colourway picker: pick a designer's two-colour swatch and the billboard, the
// floor tape and the ticket all switch to that designer, on that designer's ground → 02 the process as a hover
// index: one line per beat, the book page shows in a side panel (inline on phones) → 03 the mock-ups as a bento.
// Refs: marimekko.com product pages (colourway swatches under each print), Pentagram's identity case studies
// (one system shown across its applications), Obys / Rejouice hover-reveal project lists. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mka', [
  { id: 'way', label: 'Colourways' },
  { id: 'make', label: 'Making it' },
  { id: 'out', label: 'Out in the world' },
])

const pick = ref(0)
const cur = computed(() => ARTISTS[pick.value]!)
function onKey(e: KeyboardEvent) {
  const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
  if (!d) return
  e.preventDefault()
  pick.value = (pick.value + d + ARTISTS.length) % ARTISTS.length
  ;((e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role=radio]')[pick.value])?.focus()
}

// The process index: one line per beat, each with its book page
const STEPS = [
  { k: 'Field trip', t: MK.trip, p: PB.trip },
  { k: 'Redrawing', t: MK.redraw, p: PB.artists },
  { k: 'Type', t: MK.type, p: PB.type },
  { k: 'Logotype', t: MK.logoIdeas, p: PB.logo },
  { k: 'Wayfinding', t: MK.colour, p: PB.wayfinding },
  { k: 'Animation', t: MK.anim, p: PB.anim },
]
const step = ref(0)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="mka" :style="{ '--tw': TYPEWRITER }">
      <SheetHead :title="MK.title" :hook="MK.hook" :info="INFO">
        <template #before>
          <ul class="ps" aria-label="The four A3 posters">
            <li v-for="a in ARTISTS" :key="a.id" :style="{ background: a.light }">
              <img :src="a.poster.src" :srcset="a.poster.srcset" sizes="(max-width: 720px) 50vw, 25vw" :alt="a.poster.alt" :width="a.poster.w" :height="a.poster.h" loading="lazy" decoding="async">
            </li>
          </ul>
        </template>
      </SheetHead>

      <!-- 01 Colourways: pick a designer, the set switches -->
      <section class="cw" v-bind="sec('way')" data-sheet-block="way" :style="{ '--lt': cur.light, '--dp': cur.deep }">
        <div class="cw__side">
          <SheetSectionNo id="way" />
          <p class="mka__text">
            {{ MK.fours }} {{ MK.colour }}
          </p>
          <div class="cw__sw" role="radiogroup" aria-label="Designer" @keydown="onKey">
            <button
              v-for="(a, i) in ARTISTS"
              :key="a.id"
              type="button"
              role="radio"
              :aria-checked="pick === i"
              :tabindex="pick === i ? 0 : -1"
              class="cw__chip"
              @click="pick = i"
            >
              <span class="cw__dot" aria-hidden="true"><i :style="{ background: a.light }" /><i :style="{ background: a.deep }" /></span>
              {{ a.name }}
            </button>
          </div>
        </div>
        <div class="cw__set" aria-live="polite">
          <Transition name="cw" mode="out-in">
            <div :key="cur.id" class="cw__grid">
              <img class="cw__bb" :src="cur.billboard.src" :srcset="cur.billboard.srcset" sizes="(max-width: 720px) 100vw, 60vw" :alt="cur.billboard.alt" :width="cur.billboard.w" :height="cur.billboard.h" loading="lazy" decoding="async">
              <img :src="cur.tape.src" :srcset="cur.tape.srcset" sizes="(max-width: 720px) 50vw, 30vw" :alt="cur.tape.alt" :width="cur.tape.w" :height="cur.tape.h" loading="lazy" decoding="async">
              <img :src="cur.ticket.src" :srcset="cur.ticket.srcset" sizes="(max-width: 720px) 50vw, 30vw" :alt="cur.ticket.alt" :width="cur.ticket.w" :height="cur.ticket.h" loading="lazy" decoding="async">
            </div>
          </Transition>
        </div>
      </section>

      <!-- 02 Making it: a hover index, the page in a side panel -->
      <section class="ix" v-bind="sec('make')" data-sheet-block="make">
        <div class="ix__top">
          <SheetSectionNo id="make" />
        </div>
        <div class="ix__body">
          <ol class="ix__list">
            <li v-for="(s, i) in STEPS" :key="s.k" :class="{ 'is-on': step === i }">
              <button type="button" class="ix__row" :aria-pressed="step === i" @pointerenter="step = i" @focus="step = i" @click="step = i">
                <span class="ix__n">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="ix__k">{{ s.k }}</span>
                <span class="ix__t">{{ s.t }}</span>
              </button>
              <img class="ix__inline" :src="s.p.src" :srcset="s.p.srcset" sizes="100vw" :alt="s.p.alt" :width="s.p.w" :height="s.p.h" loading="lazy" decoding="async">
            </li>
          </ol>
          <div class="ix__view" aria-hidden="true">
            <img v-for="(s, i) in STEPS" :key="s.k" :class="{ 'is-on': step === i }" :src="s.p.src" :srcset="s.p.srcset" sizes="45vw" alt="" :width="s.p.w" :height="s.p.h" loading="lazy" decoding="async">
          </div>
        </div>
      </section>

      <!-- 03 Out in the world: a bento of mock-ups -->
      <section class="bt" v-bind="sec('out')" data-sheet-block="out">
        <div class="bt__top">
          <SheetSectionNo id="out" />
          <p class="mka__text">
            {{ MK.out }}
          </p>
        </div>
        <div class="bt__grid">
          <img class="bt__a" :src="OUT.mural.src" :srcset="OUT.mural.srcset" sizes="(max-width: 720px) 100vw, 66vw" :alt="OUT.mural.alt" :width="OUT.mural.w" :height="OUT.mural.h" loading="lazy" decoding="async">
          <img class="bt__b" :src="OUT.flags.src" :srcset="OUT.flags.srcset" sizes="(max-width: 720px) 100vw, 34vw" :alt="OUT.flags.alt" :width="OUT.flags.w" :height="OUT.flags.h" loading="lazy" decoding="async">
          <img class="bt__c" :src="OUT.wall.src" :srcset="OUT.wall.srcset" sizes="(max-width: 720px) 100vw, 34vw" :alt="OUT.wall.alt" :width="OUT.wall.w" :height="OUT.wall.h" loading="lazy" decoding="async">
          <img class="bt__d" :src="OUT.leaflet1.src" :srcset="OUT.leaflet1.srcset" sizes="(max-width: 720px) 50vw, 50vw" :alt="OUT.leaflet1.alt" :width="OUT.leaflet1.w" :height="OUT.leaflet1.h" loading="lazy" decoding="async">
          <img class="bt__e" :src="OUT.leaflet3.src" :srcset="OUT.leaflet3.srcset" sizes="(max-width: 720px) 50vw, 50vw" :alt="OUT.leaflet3.alt" :width="OUT.leaflet3.w" :height="OUT.leaflet3.h" loading="lazy" decoding="async">
        </div>
      </section>

      <SheetCredits :items="MK.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mka__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* First view: the four posters, edge to edge */
.ps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.ps img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1358 / 1920;
}

/* 01 Colourways */
.cw {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
  background: var(--lt);
  color: #111;
  transition: background-color 360ms cubic-bezier(0.23, 1, 0.32, 1);
}

.cw__side {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 28px 24px;
  --c-fg: #111;
  --muted: rgb(0 0 0 / 0.7);
}

.cw__sw {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.cw__chip {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 6px 12px 6px 6px;
  border: 1px solid rgb(0 0 0 / 0.2);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.5);
  color: #111;
  font: 400 16px/1.2 var(--tw);
  text-align: left;
  cursor: pointer;
  transition: background-color 160ms ease-out, border-color 160ms ease-out;
}

.cw__chip:hover {
  background: rgb(255 255 255 / 0.8);
}

.cw__chip[aria-checked='true'] {
  background: #111;
  border-color: #111;
  color: #fff;
}

.cw__chip:focus-visible {
  outline: 2px solid #111;
  outline-offset: 2px;
}

.cw__dot {
  display: flex;
  flex: none;
  overflow: hidden;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgb(0 0 0 / 0.15);
}

.cw__dot i {
  flex: 1;
}

.cw__set {
  border-left: 4px solid var(--dp);
  transition: border-color 360ms ease-out;
}

.cw__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.cw__grid img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.cw__bb {
  grid-column: 1 / -1;
}

.cw-enter-active,
.cw-leave-active {
  transition: opacity 200ms ease-out;
}

.cw-enter-from,
.cw-leave-to {
  opacity: 0;
}

/* 02 The hover index */
.ix {
  border-top: 1px solid var(--rule);
}

.ix__top {
  padding: 28px 24px 12px;
}

.ix__body {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  align-items: start;
}

.ix__list {
  margin: 0;
  padding: 0 0 24px;
  list-style: none;
}

.ix__row {
  display: grid;
  grid-template-columns: 36px minmax(0, 9ch) minmax(0, 1fr);
  gap: 16px;
  width: 100%;
  padding: 16px 24px;
  border: 0;
  border-top: 1px solid var(--rule);
  background: none;
  color: var(--muted);
  font: 400 15px/1.5 var(--font-ui);
  text-align: left;
  cursor: default;
  transition: color 160ms ease-out, background-color 160ms ease-out;
}

.is-on .ix__row {
  color: var(--c-fg);
  background: rgb(255 255 255 / 0.04);
}

.ix__row:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.ix__n {
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.ix__k {
  font: 400 16px/1.4 var(--tw);
  color: var(--c-fg);
}

.ix__inline {
  display: none;
}

.ix__view {
  position: sticky;
  top: 72px;
  display: grid;
  margin: 0 24px 24px 0;
  background: #fff;
}

.ix__view img {
  grid-area: 1 / 1;
  display: block;
  width: 100%;
  height: auto;
  opacity: 0;
  transition: opacity 220ms ease-out;
}

.ix__view img.is-on {
  opacity: 1;
}

/* 03 Bento */
.bt {
  border-top: 1px solid var(--rule);
}

.bt__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 20px;
}

.bt__grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-template-areas: 'a b' 'a c' 'd e';
}

.bt__grid img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 0;
}

.bt__a { grid-area: a; }
.bt__b { grid-area: b; aspect-ratio: 3 / 2; }
.bt__c { grid-area: c; aspect-ratio: 3 / 2; }
.bt__d { grid-area: d; aspect-ratio: 16 / 9; background: #e9e9e9; }
.bt__e { grid-area: e; aspect-ratio: 16 / 9; background: #e9e9e9; }

@media (prefers-reduced-motion: reduce) {
  .cw, .cw__set, .cw__chip, .cw-enter-active, .cw-leave-active, .ix__row, .ix__view img { transition: none; }
}

@media (max-width: 720px) {
  .ps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cw,
  .ix__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .cw__side,
  .ix__top,
  .bt__top {
    padding: 22px 52px 18px 16px;
  }

  .cw__sw {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .cw__chip {
    font-size: 14px;
  }

  .cw__set {
    border-left: 0;
    border-top: 4px solid var(--dp);
  }

  .ix__row {
    grid-template-columns: 28px minmax(0, 1fr);
    padding: 14px 16px 10px;
  }

  .ix__t {
    grid-column: 2;
  }

  .ix__inline {
    display: block;
    width: calc(100% - 32px);
    height: auto;
    margin: 0 16px 14px;
    background: #fff;
  }

  .ix__view {
    display: none;
  }

  .bt__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas: 'a a' 'b c' 'd e';
  }

  .bt__a {
    aspect-ratio: 3 / 2;
  }
}
</style>
