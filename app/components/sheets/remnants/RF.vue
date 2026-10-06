<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { FILM, FILM_ORDER, GLYPHS, INFO, lineMask, mask, RM, RM2, SEEDS, tc, TESTS } from './story'

// PROTOTYPE RF "Lexicon" (overnight run, Remnants r2, challenger). The Sheet as the invented script's dictionary,
// each beat its own device: three stones as numbered plates → the lexicon, nine entries set in columns like a
// dictionary page (headword, glyph, key, source object, where it appears in the film) → the derivation of the picked
// entry as a chain diagram, the method written on each link → the prompt's variant forms, the kept one marked →
// the film over a 61-second ruler, each glyph a tick where it first appears, a playhead following playback.
// Refs: OED and Merriam-Webster entry typography; Omniglot's script pages; etymology/stemma diagrams; film edit
// rulers. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('rf', [
  { id: 'lexicon', label: 'Lexicon' },
  { id: 'derive', label: 'Derivation' },
  { id: 'forms', label: 'Variant forms' },
  { id: 'film', label: 'In the film' },
])

const PLATES = [GLYPHS[1]!, GLYPHS[4]!, GLYPHS[8]!]
const art = (from: string) => /^[aeiou]/i.test(from) ? 'an' : 'a'

// The picked entry drives the derivation
const on = ref(1)
const g = computed(() => GLYPHS[on.value]!)
const live = ref(false)
function pick(i: number) {
  on.value = i
  live.value = true
}

// Film ruler
const film = ref<HTMLVideoElement>()
const now = ref(0)
const current = computed(() => {
  let c: typeof GLYPHS[number] | null = null
  for (const x of FILM_ORDER) if (now.value >= x.t - 0.5) c = x
  return c
})
function onTime() {
  if (film.value) now.value = film.value.currentTime
}
function seek(t: number) {
  const v = film.value
  if (!v) return
  if (v.preload !== 'auto') v.preload = 'auto'
  v.currentTime = t
  now.value = t
}
const pct = (t: number) => `${(t / FILM.dur) * 100}%`
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="rf">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ol class="plates" aria-label="Plates">
            <li v-for="(p, i) in PLATES" :key="p.n">
              <img :src="p.stoneSm" :alt="`${p.name} in stone, from the film`" width="800" height="450" loading="lazy" decoding="async">
              <span class="plates__cap" aria-hidden="true">Pl. {{ i + 1 }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 Lexicon -->
      <section class="lx" v-bind="sec('lexicon')" data-sheet-block="lexicon">
        <div class="lx__head">
          <SheetSectionNo id="lexicon" />
          <p class="rf__text">
            {{ RM.museum }} {{ RM.keys }}
          </p>
        </div>
        <ol class="lx__cols">
          <li v-for="(x, i) in GLYPHS" :key="x.n" class="lx__e">
            <button type="button" :aria-pressed="on === i" :aria-label="`${x.name}: show its derivation`" @click="pick(i)">
              <span class="lx__g m" :style="{ '--m': `url(${mask(x)})` }" aria-hidden="true" />
              <span class="lx__hw">{{ x.name }}</span>
              <kbd class="lx__key">{{ x.key }}</kbd>
              <span class="lx__def">From {{ art(x.from) }} {{ x.from.toLowerCase() }}, Pitt Rivers Museum. In the film at {{ tc(x.t) }}.</span>
            </button>
          </li>
        </ol>
      </section>

      <!-- 02 Derivation of the picked entry -->
      <section class="dv" v-bind="sec('derive')" data-sheet-block="derive">
        <div class="dv__head">
          <SheetSectionNo id="derive" />
          <p class="rf__text">
            {{ RM.lines }}
          </p>
          <p class="dv__hw" :aria-live="live ? 'polite' : 'off'">
            <b>{{ g.name }}</b> &larr; {{ g.from }}
          </p>
        </div>
        <ol class="dv__chain">
          <li class="dv__n dv__n--obj">
            <img :key="g.obj" :src="g.obj" :alt="g.from" width="200" height="260" loading="lazy" decoding="async">
          </li>
          <li class="dv__l" aria-hidden="true">
            <span>traced</span>
          </li>
          <li class="dv__n dv__n--mk">
            <span :key="g.line" class="m dv__line" :style="{ '--m': `url(${lineMask(g)})` }" role="img" :aria-label="`${g.name}, traced lines`" />
          </li>
          <li class="dv__l" aria-hidden="true">
            <span>gridded</span>
          </li>
          <li class="dv__n">
            <img :key="g.grid" :src="g.grid" :alt="`${g.name} on the grid`" width="480" height="480" loading="lazy" decoding="async">
          </li>
          <li class="dv__l" aria-hidden="true">
            <span>set in Glyphs</span>
          </li>
          <li class="dv__n dv__n--mk">
            <span :key="g.glyph" class="m" :style="{ '--m': `url(${mask(g)})` }" role="img" :aria-label="`${g.name}, final glyph, key ${g.key}`" />
          </li>
          <li class="dv__l" aria-hidden="true">
            <span>ControlNet</span>
          </li>
          <li class="dv__n dv__n--stone">
            <img :key="g.stone" :src="g.stoneSm" :alt="`${g.name} in stone`" width="800" height="450" loading="lazy" decoding="async">
          </li>
        </ol>
      </section>

      <!-- 03 Variant forms: one guide, many prompts -->
      <section class="vf" v-bind="sec('forms')" data-sheet-block="forms">
        <div class="vf__head">
          <SheetSectionNo id="forms" />
          <p class="rf__text">
            {{ RM2.guide }} {{ RM.snag }}
          </p>
        </div>
        <ol class="vf__grid">
          <li v-for="s in SEEDS" :key="s.seed" :class="{ 'is-kept': s.pick }">
            <img :src="s.img" :alt="`Haa'sk, seed ${s.seed}: ${s.prompt}`" width="934" height="526" loading="lazy" decoding="async">
            <span class="vf__cap"><code>{{ s.pick ? 'kept' : 'var.' }} {{ s.seed }}</code> {{ s.prompt }}</span>
          </li>
          <li class="vf__tests">
            <ul aria-label="ControlNet's first tests">
              <li v-for="(t, i) in TESTS.slice(0, 8)" :key="t">
                <img :src="t" :alt="`First test ${i + 1}`" width="540" height="540" loading="lazy" decoding="async">
              </li>
            </ul>
            <span class="vf__cap"><code>first tests</code> the prompt built the background too</span>
          </li>
        </ol>
        <p class="vf__kept">
          {{ RM2.kept }}
        </p>
      </section>

      <!-- 04 The film over its ruler -->
      <section class="fr" v-bind="sec('film')" data-sheet-block="film">
        <div class="fr__head">
          <SheetSectionNo id="film" />
          <p class="rf__text">
            {{ RM.decrypt }} {{ RM.slow }}
          </p>
        </div>
        <div class="fr__frame">
          <video
            ref="film"
            :src="FILM.src"
            :poster="FILM.poster"
            :width="FILM.w"
            :height="FILM.h"
            muted
            loop
            playsinline
            preload="none"
            data-in-view
            aria-label="Remnants, the film, muted"
            @timeupdate="onTime"
          />
        </div>
        <div class="fr__ruler">
          <span class="fr__title" :style="{ width: pct(9) }" aria-hidden="true">Title</span>
          <ol class="fr__marks" aria-label="Where each glyph first appears">
            <li v-for="x in FILM_ORDER" :key="x.n" :style="{ left: pct(x.t) }">
              <button type="button" :class="{ 'is-on': current === x }" :aria-label="`${x.name}, ${tc(x.t)}`" @click="seek(x.t)">
                <span class="m" :style="{ '--m': `url(${mask(x)})` }" aria-hidden="true" />
              </button>
            </li>
          </ol>
          <span class="fr__head-line" :style="{ '--p': now / FILM.dur }" aria-hidden="true" />
        </div>
        <p class="fr__now" aria-hidden="true">
          <span>{{ tc(now) }} / 1:01</span>
          <b>{{ current ? `${current.name} · ${current.from}` : 'Title' }}</b>
          <span>{{ RM.music }}</span>
        </p>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.rf__text {
  margin: 0;
  max-width: 48ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
.m {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}
.rf button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
.lx__head, .dv__head, .vf__head, .fr__head {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  gap: 12px 24px;
  align-items: start;
  padding: 28px 24px;
}

/* Plates */
.plates {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}
.plates li { position: relative; background: #0b0d0e; }
.plates img { display: block; width: 100%; height: auto; aspect-ratio: 4 / 5; object-fit: cover; }
.plates__cap {
  position: absolute;
  right: 10px;
  bottom: 10px;
  font: italic 400 14px/1 Georgia, 'Times New Roman', serif;
  color: #fff;
}

/* 01 Lexicon: a dictionary page */
.lx { border-top: 1px solid var(--rule); }
.lx__cols {
  columns: 3;
  column-gap: 0;
  column-rule: 1px solid var(--rule);
  margin: 0;
  padding: 0 0 8px;
  list-style: none;
  border-top: 1px solid var(--rule);
}
.lx__e { break-inside: avoid; }
.lx__e button {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 4px 14px;
  align-items: center;
  width: 100%;
  padding: 18px 24px;
  text-align: left;
  color: var(--c-fg);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
  transition: background-color 160ms ease-out;
}
.lx__e button:hover { background: color-mix(in srgb, var(--c-fg) 5%, transparent); }
.lx__e button[aria-pressed=true] .lx__g { color: #e03a2f; }
.lx__g { grid-row: span 2; width: 44px; height: 44px; }
.lx__hw { font: 600 24px/1.1 Georgia, 'Times New Roman', serif; }
.lx__key {
  padding: 3px 7px;
  font: 500 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--muted);
  border: 1px solid var(--rule);
  border-radius: 4px;
}
.lx__def {
  grid-column: 2 / -1;
  font: italic 400 14px/1.45 Georgia, 'Times New Roman', serif;
  color: var(--muted);
}

/* 02 Derivation chain */
.dv { border-top: 1px solid var(--rule); }
.dv__hw {
  grid-column: 2;
  margin: 0;
  font: 400 18px/1.3 Georgia, 'Times New Roman', serif;
  color: var(--muted);
}
.dv__hw b { font-weight: 600; font-size: 28px; color: var(--c-fg); }
.dv__chain {
  display: grid;
  grid-template-columns: 1fr 76px 1fr 76px 1fr 76px 1fr 76px 1.8fr;
  align-items: center;
  margin: 0;
  padding: 8px 24px 32px;
  list-style: none;
}
.dv__n {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  overflow: hidden;
  background: #0b0d0e;
  border: 1px solid var(--rule);
}
.dv__n img { width: 100%; height: 100%; object-fit: cover; animation: rf-in 280ms ease-out; }
.dv__n--obj img { object-fit: contain; }
.dv__n--mk .m { width: 72%; height: 72%; animation: rf-in 280ms ease-out; }
.dv__line { color: #e03a2f; }
.dv__n--stone { aspect-ratio: 16 / 9; }
/* A link: a rule with an arrowhead, the method written on it */
.dv__l {
  position: relative;
  height: 1px;
  background: var(--c-fg);
}
.dv__l::after {
  content: '';
  position: absolute;
  right: 0;
  top: -4px;
  border: 4.5px solid transparent;
  border-left: 7px solid var(--c-fg);
  border-right: 0;
}
.dv__l span {
  position: absolute;
  left: 50%;
  bottom: 8px;
  translate: -50% 0;
  font: 500 10px/1.1 ui-monospace, 'SF Mono', Menlo, monospace;
  text-align: center;
  color: var(--muted);
  width: 68px;
}
@keyframes rf-in { from { opacity: 0; } }

/* 03 Variant forms */
.vf { border-top: 1px solid var(--rule); }
.vf__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}
.vf__grid > li { position: relative; display: grid; align-content: start; background: var(--c-bg); }
.vf__grid img { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; }
.vf__grid > li.is-kept { outline: 2px solid #e03a2f; outline-offset: -2px; z-index: 1; }
.vf__cap {
  padding: 8px 10px 12px;
  font: 400 12px/1.4 var(--font-ui);
  color: var(--muted);
}
.vf__cap code { display: block; font: 500 11px/1.4 ui-monospace, 'SF Mono', Menlo, monospace; color: var(--c-fg); }
.is-kept .vf__cap code { color: #e03a2f; }
.vf__tests ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  aspect-ratio: 16 / 9;
  margin: 0;
  padding: 0;
  list-style: none;
}
.vf__tests ul img { aspect-ratio: auto; height: 100%; opacity: 0.6; }
.vf__kept { margin: 0; padding: 18px 24px 28px; font: 500 14px/1.5 var(--font-ui); color: #e03a2f; }

/* 04 Film over a ruler */
.fr { border-top: 1px solid var(--rule); }
.fr__frame { background: #000; border-top: 1px solid var(--rule); }
.fr__frame video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; }
.fr__ruler {
  position: relative;
  height: 64px;
  margin: 0 24px;
  background:
    repeating-linear-gradient(to right, var(--rule) 0 1px, transparent 1px calc(100% / 61)) bottom / 100% 10px no-repeat;
  border-bottom: 1px solid var(--c-fg);
}
.fr__title {
  position: absolute;
  left: 0;
  top: 4px;
  padding: 4px 6px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: color-mix(in srgb, var(--c-fg) 8%, transparent);
}
.fr__marks { margin: 0; padding: 0; list-style: none; }
.fr__marks li {
  position: absolute;
  bottom: 0;
  translate: -50% 0;
}
.fr__marks button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 44px;
  padding: 4px 4px 14px;
  color: var(--muted);
  background: none;
  border: 0;
  border-bottom: 10px solid transparent;
  cursor: pointer;
  position: relative;
}
.fr__marks button::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  width: 1px;
  height: 18px;
  background: currentColor;
}
.fr__marks .m { width: 24px; height: 24px; }
.fr__marks button:hover, .fr__marks button.is-on { color: #e03a2f; }
.fr__head-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: -1px;
  width: 2px;
  background: #e03a2f;
  translate: calc(var(--p) * (100cqw - 2px)) 0;
  transition: translate 260ms linear;
  pointer-events: none;
}
.fr__ruler { container-type: inline-size; }
.fr__now {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px 24px;
  align-items: baseline;
  margin: 0;
  padding: 16px 24px 32px;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}
.fr__now span:first-child { font-family: ui-monospace, 'SF Mono', Menlo, monospace; color: var(--c-fg); }
.fr__now b { font: 600 20px/1.2 Georgia, 'Times New Roman', serif; color: var(--c-fg); }
@media (prefers-reduced-motion: reduce) {
  .lx__e button { transition: none; }
  .dv__n img, .dv__n--mk .m { animation: none; }
  .fr__head-line { transition: none; }
}
@media (max-width: 960px) {
  .lx__cols { columns: 2; }
  .vf__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .lx__head, .dv__head, .vf__head, .fr__head { grid-template-columns: minmax(0, 1fr); padding: 22px 52px 22px 16px; }
  .dv__hw { grid-column: 1; }
  .lx__cols { columns: 1; }
  .lx__e button { padding: 14px 16px; }
  .plates img { aspect-ratio: 3 / 5; }
  /* Phones: the chain runs down the page */
  .dv__chain {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 0 12px;
    padding: 0 16px 24px;
  }
  .dv__l {
    grid-column: 1 / -1;
    justify-self: center;
    width: 1px;
    height: 36px;
  }
  .dv__l::after { right: -4px; top: auto; bottom: 0; border: 4.5px solid transparent; border-top: 7px solid var(--c-fg); border-bottom: 0; }
  .dv__l span { left: 12px; bottom: 50%; translate: 0 50%; width: max-content; text-align: left; }
  .dv__n { grid-column: 1 / -1; justify-self: center; width: 46%; }
  .dv__n--stone { width: 100%; }
  .fr__ruler { margin: 0 16px; }
  .fr__marks button { width: 24px; padding: 4px 2px 14px; }
  .fr__marks .m { width: 18px; height: 18px; }
  .fr__now { grid-template-columns: auto 1fr; padding: 16px; }
  .fr__now span:last-child { grid-column: 1 / -1; }
}
</style>
