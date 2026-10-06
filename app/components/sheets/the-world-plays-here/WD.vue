<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { B, CHANNELS, INFO, M, POLISH, SLOGANS, TW } from './story'
import { useSeen } from './useSeen'

// PROTOTYPE WD "Transit" (overnight run, The World Plays Here r2). The campaign ran in the subway, so the page reads
// like the network it ran on. Beats, each its own device: the five slogans on a split-flap departures board (four
// cut, one runs) → the 10 s film as its own edit, five tracks under a playhead that follows the film (drag to scrub)
// → the four channels as stations on a line diagram, photos above and below the line.
// Refs: split-flap boards (Solari, as on Vestaboard's site), NLE timelines (Premiere / After Effects) as used in VFX
// breakdown pages, Vignelli's and Beck's line diagrams (TfL in-car line maps). PLACEHOLDER: sizes, copy, clip times.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
const boardEl = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
const flipped = useSeen(boardEl)
void props

const { sec } = useSheetSections('wd', [
  { id: 'slogans', label: 'Five lines' },
  { id: 'edit', label: 'The edit' },
  { id: 'line', label: 'Where it ran' },
])

// The board: one cell per letter, kept whole per word so lines wrap between words; n staggers the flaps
let n = 0
const rows = SLOGANS.map((s, r) => ({
  ...s,
  words: s.t.toUpperCase().split(' ').map(w => [...w].map(c => ({ c, d: r * 80 + (n++ % 32) * 9 }))),
}))

// The film's edit, read off the final cut (frames at 1 s, audio by silence detection: sound 0–6.2 s). Times ±0.5 s.
const DUR = 10.4
const FILM = { src: `${B}outcome.mp4`, poster: '/img/posters/assets-theworldplayshere2-1.webp' }
const TRACKS = [
  { k: 'Type', tool: 'After Effects', clips: [{ a: 0, b: 3.5, t: 'THE WORLD / PLAYS / HERE rise in' }, { a: 3.5, b: DUR, t: 'Hold' }] },
  { k: 'Logo', tool: 'After Effects', clips: [{ a: 0, b: DUR, t: 'Official logo, white, bottom left' }] },
  { k: 'Render', tool: 'Blender', clips: [{ a: 0, b: 2, t: 'Earth turns' }, { a: 2, b: 5, t: 'Quarters wrap' }, { a: 5, b: DUR, t: 'Freeze frames' }] },
  { k: 'Overlay', tool: 'After Effects', clips: [{ a: 0, b: DUR, t: 'Dust' }] },
  { k: 'Audio', tool: 'Premiere Pro', clips: [{ a: 0, b: 6.2, t: 'Xbox startup sound, AI voiceover' }] },
]
const ticks = Array.from({ length: 11 }, (_, i) => i)
const pct = (s: number) => `${(s / DUR) * 100}%`

const film = ref<HTMLVideoElement>()
const t = ref(0)
const playing = ref(false)
let raf = 0
function follow() {
  if (film.value) t.value = film.value.currentTime
  raf = requestAnimationFrame(follow)
}
function onPlay() {
  playing.value = true
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(follow)
}
function onPause() {
  playing.value = false
  cancelAnimationFrame(raf)
}
function scrub() {
  const v = film.value
  if (!v) return
  v.pause()
  v.currentTime = t.value
}
function toggle() {
  const v = film.value
  if (!v) return
  if (v.paused) v.play().catch(() => {})
  else v.pause()
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

// The line: one station per channel, its first photo big, the rest as thumbs
const MAIN: Record<string, number> = { YouTube: 1, Instagram: 1 }
const stations = CHANNELS.map((c, i) => {
  const m = MAIN[c.k] ?? 0
  return { ...c, main: c.pics[m]!, rest: c.pics.filter((_, j) => j !== m), up: i % 2 === 0 }
})
const ARRIVAL = M.subway[1]!
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <SheetHead :title="TW.title" :hook="TW.brief" :info="INFO">
      <template #before>
        <figure class="ar">
          <img :src="ARRIVAL.src" :alt="ARRIVAL.alt" :width="ARRIVAL.w" :height="ARRIVAL.h" decoding="async">
        </figure>
      </template>
    </SheetHead>
    <div ref="root" class="wd">
      <!-- 01 The board -->
      <section class="bd" v-bind="sec('slogans')" data-sheet-block="slogans">
        <div class="wd__head">
          <SheetSectionNo id="slogans" />
          <p class="wd__text">
            {{ TW.idea }}
          </p>
        </div>
        <div ref="boardEl" class="bd__board" :class="{ 'is-in': flipped }">
          <p class="bd__cols" aria-hidden="true">
            <span>Line</span><span>Status</span><span>Why</span>
          </p>
          <ol class="bd__rows">
            <li v-for="r in rows" :key="r.t" :class="{ 'is-pick': r.pick }">
              <p class="bd__line" :aria-label="r.t">
                <template v-for="(w, wi) in r.words" :key="wi">
                  <span class="bd__w" aria-hidden="true"><span v-for="(ch, ci) in w" :key="ci" class="bd__c" :style="{ '--d': `${ch.d}ms` }">{{ ch.c }}</span></span>{{ ' ' }}
                </template>
              </p>
              <p class="bd__st">
                {{ r.pick ? 'Runs' : 'Cut' }}
              </p>
              <p class="bd__why">
                {{ r.why }}
              </p>
            </li>
          </ol>
        </div>
      </section>

      <!-- 02 The edit -->
      <section class="ed" v-bind="sec('edit')" data-sheet-block="edit">
        <div class="wd__head">
          <SheetSectionNo id="edit" />
          <p class="wd__text">
            The 10 s film, track by track.
          </p>
        </div>
        <div class="ed__top">
          <div class="ed__view">
          <video
            ref="film"
            :src="FILM.src"
            :poster="FILM.poster"
            width="1920"
            height="1080"
            muted
            loop
            playsinline
            preload="none"
            data-play
            aria-label="The finished film: the Earth, the Xbox logo wrapping it, THE WORLD PLAYS HERE rising in"
            @play="onPlay"
            @pause="onPause"
          />
          </div>
          <div class="ed__bar">
            <span class="ed__tc" aria-hidden="true">{{ t.toFixed(1) }} / {{ DUR }} s</span>
            <button type="button" class="ed__btn" :aria-label="playing ? 'Pause the film' : 'Play the film'" @click="toggle">
              {{ playing ? 'Pause' : 'Play' }}
            </button>
            <p class="wd__text">
              {{ POLISH }}
            </p>
          </div>
        </div>
        <div class="ed__tl" :style="{ '--t': pct(t) }">
          <div class="ed__ruler" aria-hidden="true">
            <span v-for="s in ticks" :key="s" :style="{ left: pct(s) }">{{ s }}</span>
          </div>
          <ul class="ed__tracks">
            <li v-for="tr in TRACKS" :key="tr.k">
              <p class="ed__lab">
                <b>{{ tr.k }}</b> <span>{{ tr.tool }}</span>
              </p>
              <div class="ed__lane">
                <span
                  v-for="c in tr.clips"
                  :key="c.t"
                  class="ed__clip"
                  :class="{ 'is-on': t >= c.a && t < c.b }"
                  :style="{ left: pct(c.a), width: pct(c.b - c.a) }"
                >{{ c.t }}</span>
              </div>
            </li>
          </ul>
          <div class="ed__lanes-over">
            <span class="ed__head" aria-hidden="true" />
            <input v-model.number="t" type="range" min="0" :max="DUR" step="0.1" aria-label="Scrub the film" @input="scrub">
          </div>
        </div>
      </section>

      <!-- 03 The line -->
      <section class="ln" v-bind="sec('line')" data-sheet-block="line">
        <div class="wd__head">
          <SheetSectionNo id="line" />
          <p class="wd__text">
            Four channels, one change each.
          </p>
        </div>
        <ol class="ln__map">
          <li v-for="(s, i) in stations" :key="s.k" :class="{ 'is-up': s.up }">
            <figure class="ln__pic">
              <img :src="s.main.src" :alt="s.main.alt" :width="s.main.w" :height="s.main.h" loading="lazy" decoding="async">
              <span v-for="r in s.rest" :key="r.src" class="ln__thumb">
                <img :src="r.src" :alt="r.alt" :width="r.w" :height="r.h" loading="lazy" decoding="async">
              </span>
            </figure>
            <span class="ln__dot" aria-hidden="true">{{ i + 1 }}</span>
            <div class="ln__txt">
              <p class="ln__k">
                {{ s.k }} <span>{{ s.n }} {{ s.n === 1 ? 'frame' : 'frames' }}</span>
              </p>
              <p class="wd__text">
                {{ s.note }}
              </p>
            </div>
          </li>
        </ol>
      </section>

      <SheetCredits :items="TW.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.wd__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.wd__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

.bd,
.ed,
.ln {
  border-top: 1px solid var(--rule);
}

/* 01 The board */
.bd {
  padding-bottom: 32px;
}

.bd__board {
  margin: 0 24px;
  padding: 18px 20px 8px;
  background: #050505;
  border: 1px solid var(--rule);
}

.bd__cols,
.bd__rows li {
  display: grid;
  grid-template-columns: minmax(0, 3.4fr) 72px minmax(0, 1.2fr);
  gap: 20px;
  align-items: center;
}

.bd__cols {
  margin: 0 0 10px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
}

.bd__rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.bd__rows li {
  padding: 10px 0;
  border-top: 1px solid rgb(255 255 255 / 0.08);
}

.bd__rows p {
  margin: 0;
}

.bd__line {
  font: 600 22px/1 var(--font-ui);
  color: rgb(255 255 255 / 0.62);
  perspective: 400px;
}

.bd__w {
  display: inline-flex;
  gap: 2px;
  margin-block: 2px;
  white-space: nowrap;
}

/* One flap per letter: a dark cell with the hinge line across its middle */
.bd__c {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 0.92em;
  height: 1.3em;
  background: #151515;
  border-radius: 2px;
  transform-origin: 50% 0;
}

.bd__c::after {
  content: '';
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: rgb(0 0 0 / 0.7);
}

.bd__board:not(.is-in) .bd__c {
  opacity: 0;
}

.bd__board.is-in .bd__c {
  animation: wd-flap 420ms cubic-bezier(0.3, 1.4, 0.5, 1) var(--d) both;
}

@keyframes wd-flap {
  from { opacity: 0; transform: rotateX(-88deg); }
  30% { opacity: 1; }
}

.is-pick .bd__line {
  color: #000;
}

.is-pick .bd__c {
  background: #fff;
}

.bd__st {
  font: 600 12px/1 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.is-pick .bd__st {
  color: #fff;
}

.bd__why {
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

.is-pick .bd__why {
  color: var(--c-fg);
}

/* 02 The edit */
.ed__top {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 24px;
  margin: 0 24px 24px;
}

.ed__view {
  aspect-ratio: 16 / 9;
  background: #000;
}

/* The first view: the billboard from the stairs, letterboxed */
.ar {
  margin: 0;
  border-top: 1px solid var(--rule);
}

.ar img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 21 / 9;
  object-fit: cover;
  object-position: 50% 45%;
}

.ed__view video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ed__bar {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-content: start;
  align-items: center;
}

.ed__bar .wd__text {
  flex-basis: 100%;
  padding-top: 14px;
  border-top: 1px solid var(--rule);
  font-size: 13px;
}


.ed__btn {
  min-width: 72px;
  padding: 7px 12px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: none;
  border: 1px solid var(--rule);
  border-radius: 999px;
  cursor: pointer;
}

.ed__btn:hover {
  border-color: var(--c-fg);
}

.ed__tc {
  flex-basis: 100%;
  font: 600 28px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

.ed {
  padding-bottom: 36px;
}

.ed__tl {
  --lab: 150px;

  position: relative;
  margin: 0 24px;
}

.ed__ruler {
  position: relative;
  height: 20px;
  margin-left: var(--lab);
  border-bottom: 1px solid var(--rule);
  font: 500 10px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.ed__ruler span {
  position: absolute;
  bottom: 4px;
  translate: -50% 0;
}

.ed__ruler span:first-child { translate: 0 0; }

.ed__tracks {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ed__tracks li {
  display: grid;
  grid-template-columns: var(--lab) minmax(0, 1fr);
  align-items: stretch;
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
}

.ed__lab {
  margin: 0;
  padding: 9px 12px 9px 0;
  font: 400 12px/1.3 var(--font-ui);
  color: var(--muted);
}

.ed__lab b {
  display: block;
  font-weight: 500;
  color: var(--c-fg);
}

.ed__lane {
  position: relative;
  min-height: 46px;
}

.ed__clip {
  position: absolute;
  top: 6px;
  bottom: 6px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: hidden;
  font: 500 11px/1.2 var(--font-ui);
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-fg) 9%, var(--c-bg));
  border-left: 2px solid rgb(255 255 255 / 0.5);
  box-shadow: inset -1px 0 0 var(--c-bg);
  transition: background-color 160ms ease-out, color 160ms ease-out;
}

.ed__clip.is-on {
  color: #000;
  background: #fff;
}

/* The playhead and the scrub area sit over the lanes only */
.ed__lanes-over {
  position: absolute;
  inset: 0 0 0 var(--lab);
}

.ed__head {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--t);
  width: 2px;
  margin-left: -1px;
  background: var(--c-accent);
  pointer-events: none;
}

.ed__head::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50% 0;
  border: 6px solid transparent;
  border-top: 8px solid var(--c-accent);
}

.ed__lanes-over input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.ed__tl:has(input:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: 4px;
}

/* 03 The line */
.ln {
  padding-bottom: 40px;
}

.ln__map {
  --pic: 230px;

  position: relative;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 18px;
  margin: 8px 24px 0;
  padding: 0;
  list-style: none;
}

/* The line itself, through every station */
.ln__map::before {
  content: '';
  position: absolute;
  top: calc(var(--pic) + 23px);
  right: 0;
  left: 0;
  height: 4px;
  background: #fff;
}

.ln__map li {
  display: grid;
  grid-template-rows: var(--pic) 50px var(--pic);
  justify-items: start;
}

.ln__pic {
  position: relative;
  grid-row: 3;
  align-self: start;
  width: 100%;
  margin: 0;
}

.ln__txt {
  grid-row: 1;
  align-self: end;
  display: grid;
  gap: 6px;
  padding-bottom: 6px;
}

.is-up .ln__pic {
  grid-row: 1;
  align-self: end;
}

.is-up .ln__txt {
  grid-row: 3;
  align-self: start;
  padding: 6px 0 0;
}

.ln__pic > img {
  display: block;
  width: 100%;
  height: calc(var(--pic) - 46px);
  object-fit: cover;
  background: #e9e9e9;
}

.ln__thumb {
  display: inline-block;
  width: 56px;
  height: 40px;
  margin: 6px 6px 0 0;
  overflow: hidden;
  background: #e9e9e9;
}

.ln__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ln__dot {
  grid-row: 2;
  align-self: center;
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  font: 600 11px/1 var(--font-ui);
  color: #fff;
  background: #000;
  border: 4px solid #fff;
  border-radius: 50%;
}

.ln__k {
  margin: 0;
  font: 600 20px/1.1 var(--font-ui);
  letter-spacing: -0.01em;
}

.ln__k span {
  margin-left: 6px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}

.ln__txt .wd__text {
  font-size: 13px;
}

@media (prefers-reduced-motion: reduce) {
  .bd__board.is-in .bd__c { animation: none; }
  .ed__clip { transition: none; }
}

@media (max-width: 720px) {
  .wd__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 16px 16px;
  }

  .bd {
    padding-bottom: 24px;
  }

  .bd__board {
    margin: 0 16px;
    padding: 12px 12px 4px;
  }

  .bd__cols {
    display: none;
  }

  .bd__rows li {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px 12px;
  }

  .bd__line {
    grid-column: 1 / -1;
    font-size: 15px;
  }

  .ed__top {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    margin: 0 16px 18px;
  }

  .ed__tc {
    flex-basis: auto;
    font-size: 18px;
  }

  .ed {
    padding-bottom: 28px;
  }

  .ed__tl {
    --lab: 64px;

    margin: 0 16px;
  }

  .ed__lab span {
    display: none;
  }

  .ed__clip {
    padding: 0 4px;
    font-size: 10px;
  }

  .ed__ruler span:nth-child(even) {
    display: none;
  }

  .ln__map {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    margin: 8px 16px 0;
    padding-left: 40px;
  }

  .ln__map::before {
    top: 0;
    bottom: 0;
    left: 11px;
    width: 4px;
    height: auto;
  }

  .ln__map li,
  .ln__map li.is-up {
    position: relative;
    grid-template-rows: auto auto;
  }

  .ln__txt,
  .is-up .ln__txt {
    grid-row: 1;
    padding: 0 0 10px;
  }

  .ln__pic,
  .is-up .ln__pic {
    grid-row: 2;
  }

  .ln__pic > img {
    height: auto;
    aspect-ratio: 4 / 3;
  }

  .ln__dot {
    position: absolute;
    top: -2px;
    left: -42px;
  }
}
</style>
