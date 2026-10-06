<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { FILM, GLYPHS, GUIDE, INFO, mask, RENDERS, RM, RM2, TESTS } from './story'

// PROTOTYPE RE "Decipher" (overnight run, Remnants r2, challenger). The Sheet as a decipherment, each beat its own
// device: three stones as plates under the hero → a matching game, nine glyphs against the nine objects
// (pick a glyph, then the object it came from) → a before/after wipe from the ControlNet guide to the render, across
// six prompts, with the twelve first tests struck out → the film with its 60% / 100% speed switch.
// Refs: The Pudding's and NYT's play-along explainers ("You Draw It"); Alice Kober's Linear B index cards;
// Knight Lab's JuxtaposeJS before/after slider; video players' speed menus. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('re', [
  { id: 'match', label: 'Decipher' },
  { id: 'guide', label: 'One guide' },
  { id: 'film', label: 'At 60%' },
])

const FOUND = [GLYPHS[6]!, GLYPHS[2]!, GLYPHS[5]!]

// Matching game. Objects in a fixed shuffle (no hydration mismatch)
const ORDER = [4, 8, 1, 6, 0, 3, 7, 2, 5]
const sel = ref<number | null>(null)
const solved = ref<number[]>([])
const miss = ref<number | null>(null)
const said = ref('')
let missT = 0
function pickObj(j: number) {
  if (solved.value.includes(j)) return
  if (sel.value === null) {
    said.value = 'Pick a glyph first.'
    return
  }
  if (sel.value === j) {
    solved.value = [...solved.value, j]
    said.value = `${GLYPHS[j]!.name}, from ${GLYPHS[j]!.from}. ${solved.value.length} of 9.`
    sel.value = null
  }
  else {
    miss.value = j
    said.value = 'Not that one.'
    clearTimeout(missT)
    missT = window.setTimeout(() => (miss.value = null), 420)
  }
}
function showKey() {
  solved.value = GLYPHS.map((_, i) => i)
  sel.value = null
  said.value = 'All nine shown.'
}
function reset() {
  solved.value = []
  sel.value = null
  said.value = ''
}

// Wipe: guide (left) to render (right)
const x = ref(50)
const r = ref(0)

// Film speed: final 60% against the 100% it was cut at
const film = ref<HTMLVideoElement>()
const fast = ref(false)
watch(fast, (f) => {
  const v = film.value
  if (!v) return
  v.playbackRate = f ? 1 / 0.6 : 1
  if (v.currentTime < 9) v.currentTime = 9
})
onBeforeUnmount(() => clearTimeout(missT))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="re">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ul class="found" aria-label="Three of the nine stones">
            <li v-for="(f, i) in FOUND" :key="f.n" :class="{ 'is-big': i === 0 }">
              <img :src="i === 0 ? f.stoneSm : f.stoneXs" :alt="`${f.name} in stone, from the film`" width="800" height="450" loading="lazy" decoding="async">
            </li>
          </ul>
        </template>
      </SheetHead>

      <!-- 01 Decipher: the matching game -->
      <section class="mt" v-bind="sec('match')" data-sheet-block="match">
        <div class="mt__side">
          <SheetSectionNo id="match" />
          <p class="re__text">
            {{ RM.museum }} {{ RM2.match }}
          </p>
          <p class="mt__count" aria-hidden="true">
            <b>{{ solved.length }}</b> / 9
          </p>
          <p class="mt__said" role="status">
            {{ said }}
          </p>
          <div class="mt__acts">
            <button v-if="solved.length < 9" type="button" class="re__btn" @click="showKey">
              Show the key
            </button>
            <button v-else type="button" class="re__btn" @click="reset">
              Play again
            </button>
          </div>
        </div>
        <div class="mt__board">
          <ul class="mt__glyphs" aria-label="Glyphs">
            <li v-for="(g, i) in GLYPHS" :key="g.n">
              <button
                type="button"
                :aria-pressed="sel === i"
                :disabled="solved.includes(i)"
                :aria-label="solved.includes(i) ? `${g.name}, solved` : `Glyph ${i + 1}`"
                @click="sel = i"
              >
                <span class="m" :style="{ '--m': `url(${mask(g)})` }" aria-hidden="true" />
                <span v-if="solved.includes(i)" class="mt__name" aria-hidden="true">{{ g.name }}</span>
              </button>
            </li>
          </ul>
          <ul class="mt__objs" aria-label="Objects">
            <li v-for="j in ORDER" :key="j">
              <button
                type="button"
                :class="{ 'is-miss': miss === j, 'is-done': solved.includes(j) }"
                :aria-label="solved.includes(j) ? `${GLYPHS[j]!.from}, ${GLYPHS[j]!.name}` : GLYPHS[j]!.from"
                @click="pickObj(j)"
              >
                <img :src="GLYPHS[j]!.obj" alt="" width="200" height="260" loading="lazy" decoding="async">
                <span class="mt__obj" aria-hidden="true">{{ GLYPHS[j]!.from }}</span>
                <span v-if="solved.includes(j)" class="mt__mark m" :style="{ '--m': `url(${mask(GLYPHS[j]!)})` }" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </div>
      </section>

      <!-- 02 One guide: wipe from the ControlNet guide to the render -->
      <section class="gd" v-bind="sec('guide')" data-sheet-block="guide">
        <div class="gd__side">
          <SheetSectionNo id="guide" />
          <p class="re__text">
            {{ RM2.guide }}
          </p>
          <div class="gd__seeds" role="group" aria-label="Prompt">
            <button v-for="(s, i) in RENDERS" :key="s.seed" type="button" :aria-pressed="r === i" @click="r = i">
              <code>{{ s.seed }}</code>
              <span>{{ s.prompt }}</span>
            </button>
          </div>
          <p class="gd__kept">
            {{ RM2.kept }}
          </p>
        </div>
        <div class="gd__wipe" :style="{ '--x': `${x}%` }">
          <img
            v-for="(s, i) in RENDERS"
            :key="s.seed"
            :class="{ 'is-on': r === i }"
            :src="s.img"
            :alt="r === i ? `Render, seed ${s.seed}: ${s.prompt}` : ''"
            :aria-hidden="r !== i"
            width="934"
            height="526"
            loading="lazy"
            decoding="async"
          >
          <div class="gd__guide" aria-hidden="true">
            <span class="m" :style="{ '--m': `url(${mask(GLYPHS[0]!)})`, '--h': GUIDE.h }" />
          </div>
          <span class="gd__bar" aria-hidden="true" />
          <span class="gd__lab gd__lab--l" aria-hidden="true">Guide</span>
          <span class="gd__lab gd__lab--r" aria-hidden="true">Render</span>
          <input v-model.number="x" class="gd__range" type="range" min="0" max="100" step="1" aria-label="Wipe from the guide to the render">
          <span class="gd__ring" aria-hidden="true" />
        </div>
        <div class="gd__snag">
          <p class="gd__k">
            {{ RM.snag }}
          </p>
          <ul class="gd__tests" aria-label="ControlNet's first tests, not used">
            <li v-for="(t, i) in TESTS" :key="t">
              <img :src="t" :alt="`First test ${i + 1}`" width="540" height="540" loading="lazy" decoding="async">
            </li>
          </ul>
        </div>
      </section>

      <!-- 03 The film at 60% -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="fm__frame">
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
          />
        </div>
        <div class="fm__side">
          <SheetSectionNo id="film" />
          <p class="re__text">
            {{ RM.slow }}
          </p>
          <div class="fm__switch" role="group" aria-label="Playback speed">
            <button type="button" :aria-pressed="!fast" @click="fast = false">
              60% · final
            </button>
            <button type="button" :aria-pressed="fast" @click="fast = true">
              100% · as cut
            </button>
          </div>
          <p class="re__text">
            {{ RM.music }}
          </p>
        </div>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.re__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
.m {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}
.re__btn {
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
.re__btn:hover { border-color: var(--c-fg); }
.re button:focus-visible, .re input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* Found: one big stone, three smaller, as plates */
.found {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}
.found li { background: #0b0d0e; }
.found li.is-big { grid-row: 1 / 3; }
.found img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* 01 Matching game */
.mt {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.mt__side {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 28px 24px;
  border-right: 1px solid var(--rule);
}
.mt__count {
  margin: 8px 0 0;
  font: 300 64px/1 var(--font-ui);
  color: var(--muted);
}
.mt__count b { font-weight: 500; color: var(--c-fg); }
.mt__said { min-height: 1.5em; margin: 0; font: 500 14px/1.5 var(--font-ui); }
.mt__board { display: grid; }
.mt__glyphs, .mt__objs {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}
.mt__objs { border-top: 1px solid var(--rule); }
.mt__glyphs li, .mt__objs li { display: flex; background: var(--c-bg); }
.mt__glyphs button, .mt__objs button {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  padding: 0;
  color: var(--c-fg);
  background: none;
  border: 0;
  cursor: pointer;
}
.mt__glyphs button { aspect-ratio: 1; padding: 14%; transition: color 160ms ease-out, background-color 160ms ease-out; }
.mt__glyphs .m { width: 100%; height: 100%; }
.mt__glyphs button:hover { background: color-mix(in srgb, var(--c-fg) 6%, transparent); }
.mt__glyphs button[aria-pressed=true] { color: var(--c-bg); background: var(--c-fg); }
.mt__glyphs button:disabled { color: #e03a2f; cursor: default; background: none; }
.mt__name {
  position: absolute;
  left: 6px;
  bottom: 5px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.mt__objs button { aspect-ratio: 2 / 3; overflow: hidden; background: #0b0d0e; }
.mt__objs img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: opacity 200ms ease-out;
}
.mt__obj {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 18px 6px 6px;
  font: 500 10px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: left;
  color: #fff;
  background: linear-gradient(transparent, rgb(0 0 0 / 0.8));
}
.mt__objs button.is-done img { opacity: 0.3; }
.mt__mark {
  position: absolute;
  inset: 20% 14% 30%;
  color: #e03a2f;
  animation: re-in 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.mt__objs button.is-miss { animation: re-miss 380ms ease-out; }
@keyframes re-in { from { opacity: 0; scale: 0.8; } }
@keyframes re-miss {
  25% { translate: -4px 0; }
  50% { translate: 4px 0; }
  75% { translate: -2px 0; }
}
.mt__objs button:hover img { opacity: 0.8; }

/* 02 The wipe */
.gd {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.gd__side {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 28px 24px;
}
.gd__seeds { display: grid; border-top: 1px solid var(--rule); }
.gd__seeds button {
  display: grid;
  grid-template-columns: 11ch minmax(0, 1fr);
  gap: 10px;
  padding: 8px 0;
  text-align: left;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
  background: none;
  border: 0;
  border-bottom: 1px solid var(--rule);
  cursor: pointer;
}
.gd__seeds code { font: 400 12px/1.4 ui-monospace, 'SF Mono', Menlo, monospace; }
.gd__seeds button[aria-pressed=true] { color: var(--c-fg); }
.gd__kept { margin: 0; font: 500 13px/1.5 var(--font-ui); color: #e03a2f; }
.gd__wipe {
  position: relative;
  align-self: start;
  aspect-ratio: 934 / 526;
  overflow: hidden;
  background: #000;
  border-left: 1px solid var(--rule);
}
.gd__wipe img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0;
  transition: opacity 240ms ease-out;
}
.gd__wipe img.is-on { opacity: 1; }
/* The guide: what ControlNet was given, a white glyph on black, in the render's own box */
.gd__guide {
  position: absolute;
  inset: 0;
  background: #000;
  clip-path: inset(0 calc(100% - var(--x)) 0 0);
}
.gd__guide .m {
  position: absolute;
  left: 50%;
  top: 50%;
  height: calc(var(--h) * 100%);
  aspect-ratio: 1;
  translate: -50% -50%;
  color: #fff;
}
.gd__bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--x);
  width: 2px;
  margin-left: -1px;
  background: #e03a2f;
  pointer-events: none;
}
.gd__lab {
  position: absolute;
  top: 12px;
  padding: 5px 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.7);
  pointer-events: none;
}
.gd__lab--l { left: 12px; }
.gd__lab--r { right: 12px; }
.gd__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
  touch-action: pan-y;
}
.gd__ring { position: absolute; inset: 0; pointer-events: none; }
.re .gd__range:focus-visible { outline: 0; }
.gd__range:focus-visible + .gd__ring {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}
.gd__snag {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.gd__k { margin: 0; padding: 24px; font: 500 15px/1.5 var(--font-ui); }
.gd__tests {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}
.gd__tests li { position: relative; }
/* Struck out: not used */
.gd__tests li::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, transparent calc(50% - 1px), #e03a2f calc(50% - 1px), #e03a2f calc(50% + 1px), transparent calc(50% + 1px));
}
.gd__tests img { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; opacity: 0.75; }

/* 03 Film */
.fm {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  border-top: 1px solid var(--rule);
}
.fm__frame { background: #000; border-right: 1px solid var(--rule); }
.fm__frame video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; }
.fm__side { display: grid; align-content: start; gap: 18px; padding: 28px 24px; }
.fm__switch { display: grid; grid-template-columns: 1fr 1fr; border: 1px solid var(--rule); }
.fm__switch button {
  padding: 12px 8px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
}
.fm__switch button + button { border-left: 1px solid var(--rule); }
.fm__switch button[aria-pressed=true] { color: var(--c-bg); background: var(--c-fg); }
@media (prefers-reduced-motion: reduce) {
  .mt__glyphs button, .mt__objs img, .gd__wipe img { transition: none; }
  .mt__mark, .mt__objs button.is-miss { animation: none; }
}
@media (max-width: 720px) {
  .mt, .gd, .gd__snag, .fm { grid-template-columns: minmax(0, 1fr); }
  .mt__side, .gd__side, .fm__side { padding: 22px 52px 22px 16px; border-right: 0; }
  .mt__count { font-size: 44px; }
  /* Phones: 3 × 3 boards, so each tile is ~110px, not 37px */
  .mt__glyphs, .mt__objs { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mt__glyphs { border-top: 1px solid var(--rule); }
  .mt__objs button { aspect-ratio: 1; }
  .mt__name, .mt__obj { font-size: 11px; }
  .gd__wipe { border-left: 0; border-top: 1px solid var(--rule); }
  .gd__k { padding: 18px 16px; }
  .gd__tests { grid-template-columns: repeat(4, minmax(0, 1fr)); border-left: 0; }
  .fm__frame { border-right: 0; }
}
</style>
