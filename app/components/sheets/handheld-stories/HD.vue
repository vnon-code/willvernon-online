<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CHAPTERS, CLIPS, DRAFTS, HS, INFO, OXFORD, SB, TURN } from './story'

// HD "Still / Moving" (Handheld Stories r2; the overnight run's top scorer). The project is static pages made to move, so the
// Sheet keeps asking still or moving. Beats, each its own device: drag a divider between a page's Photoshop still and
// its animated cut (Catalogue, Object, Database; the shell's hero above is the landing) → the brief as struck-out
// ideas beside the museum visit as a deck you deal through → six catalogue drafts cascaded on a light table, pick one to
// lift it → the object viewer as onion skin: the current frame over its four ghosts, scrub or switch the ghosts off.
// Refs: Juxtapose.js and the NYT's before/after sliders; Pentagram's light-table process shots; onion skinning in Toon
// Boom and Procreate Dreams. Videos play only in view, once the Sheet is open (useOpenPlay); the sprite loads near view.
// PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('sm', [
  { id: 'brief', label: 'The brief' },
  { id: 'drafts', label: 'Drafts' },
  { id: 'onion', label: 'Frame by frame' },
])

// Still / moving: one page at a time, a divider between the still and the cut
const PAGES = CHAPTERS.slice(1)
const pg = ref(0)
const x = ref(50)
const page = computed(() => PAGES[pg.value]!)
const cut = ref<HTMLVideoElement>()
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
async function pick(i: number) {
  pg.value = i
  await nextTick()
  if (document.documentElement.dataset.sheet === 'open') cut.value?.play().catch(() => {})
}

// The deck: deal the top photo to the back
const order = ref(OXFORD.map((_, i) => i))
const deal = () => { order.value = [...order.value.slice(1), order.value[0]!] }
const top = computed(() => order.value[0]!)

// The light table: the picked draft sits on top
const lifted = ref(DRAFTS.length - 1)

// Onion skin: the frame, and four ghosts behind it
const f = ref(0)
const ghosts = ref(true)
const OP = [0.1, 0.16, 0.26, 0.42]
const pos = (n: number) => {
  const k = ((n % TURN.n) + TURN.n) % TURN.n
  return `${((k % TURN.cols) / (TURN.cols - 1)) * 100}% ${(Math.floor(k / TURN.cols) / (TURN.rows - 1)) * 100}%`
}
const onionEl = ref<HTMLElement>()
const near = ref(false)
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!onionEl.value) return
  io = new IntersectionObserver((es) => {
    if (es.some(e => e.isIntersecting)) {
      near.value = true
      io?.disconnect()
    }
  }, { root: onionEl.value.closest('[data-sheet-layer]'), rootMargin: '600px 0px' })
  io.observe(onionEl.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="sm">
      <SheetHead :title="HS.title" :hook="HS.hook" :info="INFO">
        <template #before>
          <div class="cm">
            <div class="cm__stage" :style="{ '--x': `${x}%` }">
              <img class="cm__still" :src="SB[page.sb].src" :width="SB[page.sb].w" :height="SB[page.sb].h" :alt="SB[page.sb].alt" decoding="async">
              <video
                ref="cut"
                class="cm__move"
                :src="CLIPS[page.sb].src"
                :poster="CLIPS[page.sb].poster"
                width="960"
                height="540"
                muted
                loop
                playsinline
                preload="none"
                data-play
                :aria-label="`The animated page. ${CLIPS[page.sb].alt}`"
              />
              <span class="cm__line" aria-hidden="true"><i>⟷</i></span>
              <span class="cm__lab" aria-hidden="true">Still · Photoshop</span>
              <span class="cm__lab cm__lab--r" aria-hidden="true">Moving · After Effects</span>
              <input
                v-model.number="x"
                class="cm__range"
                type="range"
                min="0"
                max="100"
                step="1"
                aria-label="Divider between the Photoshop still and the animated page"
                :aria-valuetext="`${x}% still`"
              >
            </div>
            <p class="cm__cap">
              {{ HS.still }}
            </p>
            <ol class="cm__tabs" aria-label="Pages">
              <li v-for="(c, i) in PAGES" :key="c.k">
                <button type="button" :class="{ 'is-on': pg === i }" :aria-pressed="pg === i" @click="pick(i)">
                  <img :src="SB[c.sb].src.replace('.webp', '-sm.webp')" alt="" width="800" height="450" loading="lazy" decoding="async">
                  <span><b>{{ String(i + 2).padStart(2, '0') }}</b> {{ c.k }}</span>
                  <em>{{ fmt(c.t) }}</em>
                </button>
              </li>
            </ol>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The brief: struck-out ideas, then the visit as a deck -->
      <section class="bf" v-bind="sec('brief')" data-sheet-block="brief">
        <div class="bf__words">
          <SheetSectionNo id="brief" />
          <ul class="bf__ideas" aria-label="First ideas, dropped">
            <li v-for="w in HS.ideas" :key="w">
              <s>{{ w }}</s>
            </li>
            <li class="is-kept">
              Netsuke
            </li>
          </ul>
          <p class="sm__text">
            {{ HS.brief2 }}
          </p>
          <p class="sm__text">
            {{ HS.spark2 }}
          </p>
        </div>
        <div class="dk">
          <ul class="dk__pile" aria-live="polite">
            <li
              v-for="(n, d) in order.slice(0, 5)"
              :key="n"
              class="dk__card"
              :style="{ zIndex: 10 - d, transform: `translate(${d * 10}px, ${d * -8}px) rotate(${[-2, 3, -5, 6, -8][d]}deg)` }"
              :aria-hidden="d > 0"
            >
              <img :src="OXFORD[n]!.src" :width="OXFORD[n]!.w" :height="OXFORD[n]!.h" :alt="d === 0 ? `Museum display, photo ${n + 1} of ${OXFORD.length}` : ''" loading="lazy" decoding="async">
            </li>
          </ul>
          <button type="button" class="dk__deal" @click="deal">
            Next photo <span>{{ String(top + 1).padStart(2, '0') }} / {{ OXFORD.length }}</span>
          </button>
        </div>
      </section>

      <!-- 02 Drafts: a light table, pick one to lift it -->
      <section class="lt" v-bind="sec('drafts')" data-sheet-block="drafts">
        <div class="lt__words">
          <SheetSectionNo id="drafts" />
          <p class="sm__text">
            {{ HS.drafts }}
          </p>
          <ol class="lt__keys">
            <li v-for="(d, i) in DRAFTS" :key="d.k">
              <button type="button" :aria-pressed="lifted === i" @click="lifted = i">
                <b>{{ i + 1 }}</b> {{ d.k }}
              </button>
            </li>
          </ol>
          <p class="lt__note" aria-live="polite">
            {{ DRAFTS[lifted]!.note }}
          </p>
        </div>
        <div class="lt__table">
          <div class="lt__stack">
            <img
              v-for="(d, i) in DRAFTS"
              :key="d.k"
              class="lt__sheet"
              :class="{ 'is-up': lifted === i }"
              :src="d.pic.src"
              :srcset="d.pic.srcset"
              sizes="(max-width: 720px) 80vw, 45vw"
              :width="d.pic.w"
              :height="d.pic.h"
              :alt="d.pic.alt"
              :style="{ '--i': i }"
              loading="lazy"
              decoding="async"
              @click="lifted = i"
            >
          </div>
        </div>
      </section>

      <!-- 03 Frame by frame: onion skin -->
      <section class="on" v-bind="sec('onion')" data-sheet-block="onion">
        <div class="on__words">
          <SheetSectionNo id="onion" />
          <p class="sm__text">
            {{ HS.onion }}
          </p>
          <p class="sm__text">
            {{ HS.roto }}
          </p>
          <label class="on__ctl">
            <span>Frame {{ String(f + 1).padStart(2, '0') }} / {{ TURN.n }}</span>
            <input v-model.number="f" type="range" min="0" :max="TURN.n - 1" step="1" aria-label="Scrub through the frames">
          </label>
          <button type="button" class="on__tog" :aria-pressed="ghosts" @click="ghosts = !ghosts">
            Onion skin {{ ghosts ? 'on' : 'off' }}
          </button>
        </div>
        <div ref="onionEl" class="on__stage" role="img" :aria-label="`The Coiled Snake, frame ${f + 1} of ${TURN.n}${ghosts ? ', with the four frames before it as ghosts' : ''}`">
          <template v-if="near">
            <template v-if="ghosts">
              <div
                v-for="(o, g) in OP"
                :key="g"
                class="on__frame"
                :style="{ backgroundImage: `url(${TURN.src})`, backgroundPosition: pos(f - (4 - g) * 2), opacity: o }"
              />
            </template>
            <div class="on__frame" :style="{ backgroundImage: `url(${TURN.src})`, backgroundPosition: pos(f) }" />
          </template>
        </div>
      </section>

      <SheetCredits :items="HS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.sm__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.cm__cap {
  margin: 0;
  padding: 10px 12px;
  border-top: 1px solid #d8d8d4;
  font: 400 13px/1.4 var(--font-ui);
  color: #444;
}

/* Still / moving */
.cm {
  background: #f4f4f2;
  color: #111;
}

.cm__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #fff;
}

.cm__still,
.cm__move {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cm__move {
  clip-path: inset(0 0 0 var(--x));
}

.cm__line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--x);
  width: 2px;
  margin-left: -1px;
  background: var(--c-red, #e03a2f);
  pointer-events: none;
}

.cm__line i {
  position: absolute;
  top: 50%;
  left: 50%;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--c-red, #e03a2f);
  color: #fff;
  font: 600 16px/1 var(--font-ui);
  font-style: normal;
  transform: translate(-50%, -50%);
}

.cm__lab {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 6px 8px;
  background: #111;
  color: #fff;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}

.cm__lab--r {
  left: auto;
  right: 12px;
}

.cm__range {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.cm__stage:has(.cm__range:focus-visible) {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.cm__tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid #d8d8d4;
}

.cm__tabs li + li {
  border-left: 1px solid #d8d8d4;
}

.cm__tabs button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  width: 100%;
  padding: 12px;
  border: 0;
  background: none;
  color: #111;
  font: 500 13px/1.2 var(--font-ui);
  text-align: left;
  cursor: pointer;
}

.cm__tabs button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.cm__tabs img {
  grid-column: 1 / -1;
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  outline: 1px solid #d8d8d4;
  opacity: 0.5;
  transition: opacity 200ms ease-out;
}

.cm__tabs .is-on img,
.cm__tabs button:hover img {
  opacity: 1;
}

.cm__tabs b {
  margin-right: 4px;
  color: #999;
  font-weight: 500;
}

.cm__tabs .is-on b {
  color: var(--c-red, #e03a2f);
}

.cm__tabs em {
  font-style: normal;
  color: #888;
  font-variant-numeric: tabular-nums;
}

/* 01 The brief */
.bf {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  border-top: 1px solid var(--rule);
}

.bf__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.bf__ideas {
  display: grid;
  gap: 2px;
  margin: 8px 0 10px;
  padding: 0;
  list-style: none;
  font: 600 clamp(36px, 5vw, 64px)/0.95 var(--font-ui);
  letter-spacing: -0.03em;
}

.bf__ideas s {
  color: var(--muted);
  text-decoration-thickness: 3px;
  text-decoration-color: var(--c-red, #e03a2f);
}

.bf__ideas .is-kept {
  color: var(--c-fg);
}

.dk {
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 48px 24px 28px;
  border-left: 1px solid var(--rule);
}

.dk__pile {
  position: relative;
  width: min(62%, 240px);
  aspect-ratio: 3 / 4;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dk__card {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 8px;
  background: #f4f4f2;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  transition: transform 320ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.dk__card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(1);
}

.dk__card:first-child img {
  filter: none;
}

.dk__deal {
  display: flex;
  gap: 14px;
  padding: 10px 14px;
  border: 1px solid var(--rule);
  background: none;
  color: var(--c-fg);
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.dk__deal span {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.dk__deal:hover {
  border-color: var(--c-fg);
}

.dk__deal:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

/* 02 Drafts: a light table */
.lt {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.lt__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.lt__keys {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.lt__keys button {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 10px 0;
  border: 0;
  border-bottom: 1px solid var(--rule);
  background: none;
  color: var(--muted);
  font: 500 14px/1.2 var(--font-ui);
  text-align: left;
  cursor: pointer;
}

.lt__keys b {
  width: 1.5em;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.lt__keys button[aria-pressed='true'] {
  color: var(--c-fg);
}

.lt__keys button[aria-pressed='true'] b {
  color: var(--c-red, #e03a2f);
}

.lt__keys button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.lt__note {
  margin: 0;
  min-height: 1.6em;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--c-fg);
}

.lt__table {
  padding: 32px;
  background: #f4f4f2;
  border-left: 1px solid var(--rule);
}

.lt__stack {
  position: relative;
  container-type: inline-size;
  height: 0;
  padding-bottom: calc(100% * 0.75 * 9 / 16 + 100% * 0.05 * 5);
}

.lt__sheet {
  position: absolute;
  top: calc(var(--i) * 5cqw);
  left: calc(var(--i) * 5cqw);
  width: 75cqw;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #fff;
  outline: 1px solid #c8c8c4;
  opacity: 0.55;
  cursor: pointer;
  transition: opacity 200ms ease-out, transform 240ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.lt__sheet.is-up {
  z-index: 10;
  opacity: 1;
  transform: translateY(-6px);
  outline: 2px solid #111;
}

/* 03 Onion skin */
.on {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.on__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.on__ctl {
  display: grid;
  gap: 8px;
  margin-top: 6px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.on__ctl input {
  width: 100%;
  accent-color: var(--c-red, #e03a2f);
}

.on__tog {
  justify-self: start;
  padding: 10px 14px;
  border: 1px solid var(--rule);
  background: none;
  color: var(--c-fg);
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}

.on__tog[aria-pressed='true'] {
  background: var(--c-fg);
  color: var(--c-bg);
}

.on__tog:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.on__stage {
  position: relative;
  display: grid;
  background: #f4f4f2;
  border-left: 1px solid var(--rule);
}

.on__frame {
  grid-area: 1 / 1;
  width: min(100%, 560px);
  margin: 0 auto;
  aspect-ratio: 420 / 412;
  background-repeat: no-repeat;
  background-size: 1100% 400%;
  mix-blend-mode: multiply;
}

@media (prefers-reduced-motion: reduce) {
  .dk__card, .lt__sheet, .cm__tabs img { transition: none; }
}

@media (max-width: 720px) {
  .cm__tabs button {
    padding: 8px;
  }

  .cm__lab {
    font-size: 10px;
  }

  .bf,
  .lt,
  .on {
    grid-template-columns: minmax(0, 1fr);
  }

  .dk,
  .lt__table,
  .on__stage {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .lt__table {
    padding: 20px 16px;
  }

  .bf__words,
  .lt__words,
  .on__words {
    padding: 22px 52px 22px 16px;
  }
}
</style>
