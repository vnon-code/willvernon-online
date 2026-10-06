<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { byKey, FILM, FILM_ORDER, GLYPHS, GUIDE, INFO, lineMask, mask, RM, RM2, SEEDS, STAGES, tc, TESTS } from './story'

// PROTOTYPE RD "Specimen, refined" (overnight run, Remnants r2): RA (r1 best) with the judges' notes applied.
// - the nine-row lineage table (680px wide, sideways on phones) is now one lineage you pick by key; phones show the
//   stone and glyph first;
// - the seed log carries the ControlNet guide, laid over each render in the same 16:9 box (measured, see story.ts);
// - the film is in, with one device: a caption band above it that decrypts "remnants" live while the film's title
//   runs, then names each glyph as it appears (borrowed from RA's decrypt, now synced to playback, inside the body);
// - glyph masks with the stray alpha cleared (the faint squares).
// Refs: Klim and Grilli Type specimen pages (tester, glyph set); Pentagram type case studies; closed-caption bands.
// PLACEHOLDER: sizes, copy, timings.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('rd', [
  { id: 'type', label: 'Type it' },
  { id: 'lineage', label: 'Object to stone' },
  { id: 'seed', label: 'One guide' },
  { id: 'film', label: 'The film' },
])

// Type tester
const text = ref('QWERTYUIO')
const size = ref(96)
const chars = computed(() => [...text.value.slice(0, 32)].map(c => ({ c, g: byKey(c) })))

// Lineage: one glyph at a time, picked by its key
const on = ref(6)
const g = computed(() => GLYPHS[on.value]!)
function onKeys(e: KeyboardEvent) {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
  if (!d) return
  e.preventDefault()
  on.value = (on.value + d + 9) % 9
  ;(e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button')[on.value]?.focus()
}

// Seed log with the guide over each render (the kept seed's frame is from the film: no guide)
const pick = ref(0)
const showGuide = ref(true)
const seed = computed(() => SEEDS[pick.value]!)

// Film + caption band: decrypts during the title (0–9 s), then names the glyph on screen
const film = ref<HTMLVideoElement>()
const now = ref(0)
const WORD = 'remnants'
const scramble = ref<string[]>(WORD.split('').map((_, i) => mask(GLYPHS[i]!)))
const reduce = ref(false)
const current = computed(() => {
  let c: typeof GLYPHS[number] | null = null
  for (const x of FILM_ORDER) if (now.value >= x.t - 0.5) c = x
  return c
})
const landed = (i: number) => reduce.value || now.value > 1.2 + i * 0.75
let tick = 0
function onTime() {
  if (film.value) now.value = film.value.currentTime
}
function onPlay() {
  clearInterval(tick)
  if (reduce.value) return
  tick = window.setInterval(() => {
    const v = film.value
    if (!v || v.paused || v.currentTime > 9) return
    now.value = v.currentTime
    scramble.value = scramble.value.map(() => mask(GLYPHS[Math.floor(Math.random() * 9)]!))
  }, 110)
}
const onPause = () => clearInterval(tick)
const sound = ref(false)
watch(sound, s => { if (film.value) film.value.muted = !s })
onMounted(() => { reduce.value = matchMedia('(prefers-reduced-motion: reduce)').matches })
onBeforeUnmount(() => clearInterval(tick))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="rd">
      <SheetHead :title="RM.title" :hook="RM.hook" :info="INFO">
        <template #before>
          <ol class="set" aria-label="The nine glyphs">
            <li v-for="x in GLYPHS" :key="x.n" class="set__cell">
              <img :src="x.stoneXs" :alt="`${x.name} in stone, from the film`" width="480" height="270" loading="lazy" decoding="async">
              <span class="set__glyph m" :style="{ '--m': `url(${mask(x)})` }" aria-hidden="true" />
              <span class="set__k" aria-hidden="true">{{ x.key }}</span>
              <span class="set__name">{{ x.name }}</span>
            </li>
          </ol>
        </template>
      </SheetHead>

      <!-- 01 Type tester -->
      <section class="tt" v-bind="sec('type')" data-sheet-block="type">
        <div class="tt__side">
          <SheetSectionNo id="type" />
          <p class="rd__text">
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
            <span v-if="ch.g" class="tt__g m" :style="{ '--m': `url(${mask(ch.g)})` }" :title="ch.g.name" />
            <span v-else class="tt__c">{{ ch.c === ' ' ? ' ' : ch.c }}</span>
          </template>
        </p>
      </section>

      <!-- 02 Lineage: one glyph, object to stone, picked by key -->
      <section class="ln" v-bind="sec('lineage')" data-sheet-block="lineage">
        <div class="ln__head">
          <SheetSectionNo id="lineage" />
          <p class="rd__text">
            {{ RM.museum }} {{ RM.lines }}
          </p>
          <div class="ln__keys" role="group" aria-label="Pick a glyph" @keydown="onKeys">
            <button v-for="(x, i) in GLYPHS" :key="x.n" type="button" :aria-pressed="on === i" :aria-label="x.name" :tabindex="on === i ? 0 : -1" @click="on = i">
              {{ x.key }}
            </button>
          </div>
        </div>
        <ol class="ln__row" :aria-label="`${g.name}, from ${g.from}`">
          <li class="ln__c ln__c--obj">
            <img :key="g.obj" :src="g.obj" :alt="g.from" width="200" height="260" loading="lazy" decoding="async">
            <span class="ln__k">{{ STAGES[0] }} · {{ g.from }}</span>
          </li>
          <li class="ln__c ln__c--line">
            <span class="ln__mk m" :style="{ '--m': `url(${lineMask(g)})` }" role="img" :aria-label="`${g.name}, traced lines`" />
            <span class="ln__k">{{ STAGES[1] }}</span>
          </li>
          <li class="ln__c ln__c--grid">
            <img :key="g.grid" :src="g.grid" :alt="`${g.name} on the grid`" width="480" height="480" loading="lazy" decoding="async">
            <span class="ln__k">{{ STAGES[2] }}</span>
          </li>
          <li class="ln__c ln__c--glyph">
            <span class="ln__mk m" :style="{ '--m': `url(${mask(g)})` }" role="img" :aria-label="`${g.name}, final glyph`" />
            <span class="ln__k">{{ STAGES[3] }} · {{ g.name }} · {{ g.key }}</span>
          </li>
          <li class="ln__c ln__c--stone">
            <img :key="g.stone" :src="g.stoneSm" :alt="`${g.name} in stone`" width="800" height="450" loading="lazy" decoding="async">
            <span class="ln__k">{{ STAGES[4] }}</span>
          </li>
        </ol>
      </section>

      <!-- 03 One guide, many seeds -->
      <section class="sd" v-bind="sec('seed')" data-sheet-block="seed">
        <div class="sd__side">
          <SheetSectionNo id="seed" />
          <p class="rd__text">
            {{ RM2.guide }} {{ RM2.kept }}
          </p>
          <ol class="sd__log" aria-label="Seeds and prompts">
            <li v-for="(s, i) in SEEDS" :key="s.seed">
              <button type="button" :aria-pressed="pick === i" :class="{ 'is-pick': s.pick }" @click="pick = i">
                <code>{{ s.seed }}</code>
                <span>{{ s.prompt }}</span>
              </button>
            </li>
          </ol>
          <label class="sd__toggle">
            <input v-model="showGuide" type="checkbox">
            <span>Show the guide</span>
          </label>
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
          <span v-if="!seed.pick" class="sd__guide m" :class="{ 'is-on': showGuide }" :style="{ '--m': `url(${mask(GLYPHS[0]!)})`, '--h': GUIDE.h }" aria-hidden="true" />
          <p class="sd__tag" aria-hidden="true">
            Seed {{ seed.seed }}{{ seed.pick ? ' · kept · film frame' : '' }}
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

      <!-- 04 The film, with a caption band that decrypts the title, then names each glyph -->
      <section class="fm" v-bind="sec('film')" data-sheet-block="film">
        <div class="fm__band" aria-live="off">
          <SheetSectionNo id="film" />
          <p v-if="!current" class="fm__word" aria-label="remnants">
            <span v-for="(l, i) in WORD" :key="i" class="fm__slot" aria-hidden="true">
              <span v-if="!landed(i)" class="fm__g m" :style="{ '--m': `url(${scramble[i]})` }" />
              <span v-else>{{ l }}</span>
            </span>
          </p>
          <p v-else class="fm__now">
            <span class="fm__nowg m" :style="{ '--m': `url(${mask(current)})` }" aria-hidden="true" />
            <b>{{ current.name }}</b>
            <span>{{ current.key }} · {{ current.from }} · {{ tc(current.t) }}</span>
          </p>
        </div>
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
            aria-label="Remnants, the film"
            @timeupdate="onTime"
            @play="onPlay"
            @pause="onPause"
          />
          <button type="button" class="fm__sound" :aria-pressed="sound" @click="sound = !sound">
            {{ sound ? 'Sound off' : 'Sound on' }}
          </button>
        </div>
        <div class="fm__notes">
          <p class="rd__text">
            {{ RM.decrypt }}
          </p>
          <p class="rd__text">
            {{ RM.slow }} {{ RM.music }}
          </p>
        </div>
      </section>

      <SheetCredits :items="RM.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.rd__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}
/* Glyph masks, filled with the text colour */
.m {
  display: block;
  background: currentColor;
  -webkit-mask: var(--m) center / contain no-repeat;
  mask: var(--m) center / contain no-repeat;
}
.ln__k, .tt__field, .set__k, .set__name {
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
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
.set__cell + .set__cell { border-left: 1px solid rgb(255 255 255 / 0.08); }
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
.set__k, .set__name { position: absolute; left: 10px; }
.set__k { top: 10px; color: rgb(255 255 255 / 0.55); }
.set__name { bottom: 10px; white-space: nowrap; }
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
.tt__field { display: grid; gap: 8px; color: var(--muted); }
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
.tt__field input[type=range] { width: 100%; accent-color: var(--c-fg); }
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
.tt__g { width: var(--s); height: var(--s); }
.tt__c { font: 500 var(--s)/1 var(--font-ui); color: var(--muted); opacity: 0.4; }

/* 02 Lineage */
.ln { border-top: 1px solid var(--rule); }
.ln__head {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 5fr) auto;
  gap: 16px 24px;
  align-items: start;
  padding: 28px 24px;
}
.ln__keys {
  display: grid;
  grid-template-columns: repeat(9, 36px);
  border: 1px solid var(--rule);
}
.ln__keys button {
  height: 40px;
  font: 500 13px/1 var(--font-ui);
  color: var(--muted);
  background: none;
  border: 0;
  cursor: pointer;
}
.ln__keys button + button { border-left: 1px solid var(--rule); }
.ln__keys button[aria-pressed=true] { color: var(--c-bg); background: var(--c-fg); }
.ln__row {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr);
  margin: 0;
  padding: 0;
  list-style: none;
  gap: 1px;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}
.ln__c {
  position: relative;
  background: var(--c-bg);
  display: grid;
  place-items: center;
  min-height: 240px;
  overflow: hidden;
}
.ln__c img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  animation: rd-in 280ms ease-out;
}
.ln__c--stone { aspect-ratio: 16 / 9; justify-self: stretch; }
.ln__c--obj img { object-fit: contain; padding: 16px 12px 36px; }
.ln__mk { width: 70%; aspect-ratio: 1; animation: rd-in 280ms ease-out; }
.ln__c--line .ln__mk { color: #e03a2f; }
.ln__k {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 6px;
  color: var(--c-fg);
  background: var(--c-bg);
}
@keyframes rd-in { from { opacity: 0; } }

/* 03 One guide, many seeds */
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
.sd__log code { font: 400 12px/1.45 ui-monospace, 'SF Mono', Menlo, monospace; }
.sd__log button[aria-pressed=true] { color: var(--c-fg); }
.sd__log button.is-pick code { color: #e03a2f; }
.sd__toggle {
  display: flex;
  gap: 10px;
  align-items: center;
  font: 500 12px/1 var(--font-ui);
  color: var(--muted);
  cursor: pointer;
}
.sd__toggle input { accent-color: #e03a2f; }
/* Renders and guide share one 16:9 box; the guide is centred at its measured height (story.ts GUIDE) */
.sd__view {
  position: relative;
  align-self: start;
  aspect-ratio: 934 / 526;
  overflow: hidden;
  background: #0b0d0e;
  border-left: 1px solid var(--rule);
}
.sd__view img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  opacity: 0;
  transition: opacity 240ms ease-out;
}
.sd__view img.is-on { opacity: 1; }
.sd__guide {
  position: absolute;
  left: 50%;
  top: 50%;
  height: calc(var(--h) * 100%);
  aspect-ratio: 1;
  translate: -50% -50%;
  color: #e03a2f;
  opacity: 0;
  transition: opacity 200ms ease-out;
}
.sd__guide.is-on { opacity: 0.6; }
.sd__tag {
  position: absolute;
  left: 16px;
  bottom: 14px;
  margin: 0;
  padding: 6px 10px;
  font: 500 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #fff;
  background: rgb(0 0 0 / 0.7);
}
.sd__snag {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}
.sd__k { margin: 0; padding: 24px; font: 500 15px/1.5 var(--font-ui); }
.sd__tests {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}
.sd__tests img { display: block; width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }

/* 04 Film with a caption band */
.fm { border-top: 1px solid var(--rule); }
.fm__band {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  gap: 16px 24px;
  align-items: center;
  min-height: 132px;
  padding: 20px 24px;
}
.fm__word {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  margin: 0;
  font: 300 clamp(36px, 6vw, 80px)/1 var(--font-ui);
}
.fm__slot { display: grid; place-items: center; height: 1.1em; }
.fm__g { width: 0.8em; height: 0.8em; }
.fm__now {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 4px 20px;
  align-items: center;
  margin: 0;
}
.fm__nowg { grid-row: span 2; width: 76px; height: 76px; color: #e03a2f; }
.fm__now b { font: 500 clamp(28px, 4vw, 48px)/1 var(--font-ui); }
.fm__now span:last-child {
  font: 500 12px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.fm__frame { position: relative; background: #000; }
.fm__frame video { display: block; width: 100%; height: auto; aspect-ratio: 16 / 9; }
.fm__sound {
  position: absolute;
  right: 14px;
  bottom: 14px;
  padding: 8px 12px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.7);
  border: 1px solid rgb(255 255 255 / 0.3);
  border-radius: 999px;
  cursor: pointer;
}
.fm__notes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 32px;
  padding: 24px 24px 36px;
  border-top: 1px solid var(--rule);
}
.rd button:focus-visible, .rd input:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) {
  .set__cell img, .set__glyph, .sd__view img, .sd__guide { transition: none; }
  .ln__c img, .ln__mk { animation: none; }
}
@media (max-width: 720px) {
  .set__cell img { aspect-ratio: 1 / 2.4; }
  .set__k { left: 4px; top: 6px; font-size: 10px; }
  .set__name { display: none; }
  .tt, .sd, .sd__snag, .ln__head, .fm__band, .fm__notes { grid-template-columns: minmax(0, 1fr); }
  .tt__side, .sd__side, .ln__head { padding: 22px 52px 22px 16px; border-right: 0; }
  .tt__out { min-height: 200px; padding: 20px 16px; border-top: 1px solid var(--rule); }
  .ln__keys { grid-template-columns: repeat(9, minmax(0, 1fr)); }
  .ln__keys button { height: 44px; }
  /* Phones: stone and glyph first */
  .ln__row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ln__c { min-height: 0; aspect-ratio: 1; }
  .ln__c--stone { order: -2; grid-column: 1 / -1; aspect-ratio: 16 / 9; }
  .ln__c--glyph { order: -1; }
  .sd__view { border-left: 0; border-top: 1px solid var(--rule); }
  .sd__k { padding: 18px 16px; }
  .sd__tests { grid-template-columns: repeat(4, minmax(0, 1fr)); border-left: 0; }
  .fm__band { padding: 18px 16px; min-height: 0; }
  .fm__nowg { width: 52px; height: 52px; }
  .fm__notes { padding: 20px 16px 28px; }
}
</style>
