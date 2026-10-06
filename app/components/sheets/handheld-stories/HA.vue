<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CHAPTERS, CLIPS, HS, INFO, OXFORD, PICS, SB, TURN } from './story'

// PROTOTYPE HA "Walkthrough" (overnight run, Handheld Stories r1). Beats, each its own device: the film in a browser
// frame: an eight-second cut per page of the site, each running into the next, the address bar and tabs following → the museum
// visit as a contact strip of phone photos → the Coiled Snake as a drag-to-turn object (44 frames of the film's
// viewer in one sprite; arrow keys too) → all 150 rotoscoped frames as one grid.
// Refs: Figma's prototype view and Vimeo's chapter markers (pages as chapters); Sketchfab's viewer and Apple's
// product spin views (drag to turn); the contact-sheet process pages in Pentagram's and Locomotive's case studies.
// Videos play only in view, once the Sheet is open (useOpenPlay); the sprite loads when its section nears.
// PLACEHOLDER: sizes, copy, chapter times.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('ha', [
  { id: 'brief', label: 'The brief' },
  { id: 'object', label: 'The object' },
  { id: 'roto', label: 'Roto' },
])

// Chapters: one eight-second cut of the film per page; each runs into the next, a click picks one
const film = ref<HTMLVideoElement>()
const ch = ref(0)
const slug = computed(() => CHAPTERS[ch.value]!.k.toLowerCase())
const clip = computed(() => CLIPS[CHAPTERS[ch.value]!.sb])
const fmt = (t: number) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
async function pick(i: number, play = true) {
  ch.value = (i + CHAPTERS.length) % CHAPTERS.length
  await nextTick()
  const v = film.value
  if (play && v && document.documentElement.dataset.sheet === 'open') v.play().catch(() => {})
}

// The turntable: drag (or arrow keys) through the sprite's frames
const frame = ref(0)
const turnEl = ref<HTMLElement>()
const near = ref(false)
let io: IntersectionObserver | undefined
let x0 = 0
let f0 = 0
let dragging = false
const setFrame = (f: number) => { frame.value = ((Math.round(f) % TURN.n) + TURN.n) % TURN.n }
function down(e: PointerEvent) {
  dragging = true
  x0 = e.clientX
  f0 = frame.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function move(e: PointerEvent) {
  if (!dragging) return
  const w = (e.currentTarget as HTMLElement).clientWidth
  setFrame(f0 + ((e.clientX - x0) / w) * TURN.n)
}
function up() { dragging = false }
function key(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setFrame(frame.value + 1)
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setFrame(frame.value - 1)
  else return
  e.preventDefault()
}
const spritePos = computed(() => {
  const c = frame.value % TURN.cols
  const r = Math.floor(frame.value / TURN.cols)
  return `${(c / (TURN.cols - 1)) * 100}% ${(r / (TURN.rows - 1)) * 100}%`
})
onMounted(() => {
  if (!turnEl.value) return
  io = new IntersectionObserver((es) => {
    if (es.some(e => e.isIntersecting)) {
      near.value = true
      io?.disconnect()
    }
  }, { root: turnEl.value.closest('[data-sheet-layer]'), rootMargin: '600px 0px' })
  io.observe(turnEl.value)
})
onBeforeUnmount(() => io?.disconnect())
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ha">
      <SheetHead :title="HS.title" :hook="HS.hook" :info="INFO">
        <template #before>
          <div class="wt">
            <div class="wt__bar" aria-hidden="true">
              <span class="wt__dots"><i /><i /><i /></span>
              <span class="wt__url">handheld-stories / <b>{{ slug }}</b></span>
              <span class="wt__tc">{{ fmt(CHAPTERS[ch]!.t) }} / 1:40</span>
            </div>
            <video
              ref="film"
              class="wt__film"
              :src="clip.src"
              :poster="clip.poster"
              width="960"
              height="540"
              muted
              playsinline
              preload="none"
              data-play
              :aria-label="`Eight seconds of the walkthrough film. ${clip.alt}`"
              @ended="pick(ch + 1)"
            />
            <ol class="wt__ch" aria-label="The film's pages; choose one to play it">
              <li v-for="(c, i) in CHAPTERS" :key="c.k">
                <button type="button" :class="{ 'is-on': ch === i }" :aria-current="ch === i ? 'step' : undefined" @click="pick(i)">
                  <img :src="`${SB[c.sb].src.replace('.webp', '-sm.webp')}`" alt="" width="800" height="450" loading="lazy" decoding="async">
                  <span class="wt__k"><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ c.k }}</span>
                  <span class="wt__t">{{ fmt(c.t) }}</span>
                </button>
              </li>
            </ol>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The brief: the visit as a contact strip -->
      <section class="br" v-bind="sec('brief')" data-sheet-block="brief">
        <div class="br__words">
          <SheetSectionNo id="brief" />
          <p class="ha__text">
            {{ HS.brief }}
          </p>
          <p class="ha__text">
            {{ HS.spark }}
          </p>
        </div>
        <ul class="br__strip" aria-label="Photos from the Oxford University Museum of Natural History visit">
          <li v-for="(o, i) in OXFORD" :key="o.src">
            <img :src="o.src" :width="o.w" :height="o.h" :alt="`Museum display ${i + 1}`" loading="lazy" decoding="async">
          </li>
        </ul>
      </section>

      <!-- 02 The object: drag to turn -->
      <section class="ob" v-bind="sec('object')" data-sheet-block="object">
        <div class="ob__words">
          <SheetSectionNo id="object" />
          <p class="ha__text">
            {{ HS.subject }}
          </p>
          <p class="ha__text">
            {{ HS.turn }}
          </p>
          <img class="ob__cap" :src="PICS.capture.src" :width="PICS.capture.w" :height="PICS.capture.h" :alt="PICS.capture.alt" loading="lazy" decoding="async">
        </div>
        <div
          ref="turnEl"
          class="ob__turn"
          role="slider"
          tabindex="0"
          aria-label="The Coiled Snake netsuke; drag or use the arrow keys to turn it"
          aria-valuemin="1"
          :aria-valuemax="TURN.n"
          :aria-valuenow="frame + 1"
          :aria-valuetext="`Frame ${frame + 1} of ${TURN.n}`"
          @pointerdown="down"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="up"
          @keydown="key"
        >
          <div
            class="ob__sprite"
            :style="near ? { backgroundImage: `url(${TURN.src})`, backgroundPosition: spritePos } : undefined"
          />
          <p class="ob__hint" aria-hidden="true">
            ← {{ HS.turnHint }} → <span>{{ String(frame + 1).padStart(2, '0') }} / {{ TURN.n }}</span>
          </p>
        </div>
      </section>

      <!-- 03 Roto: every frame -->
      <section class="ro" v-bind="sec('roto')" data-sheet-block="roto">
        <div class="ro__words">
          <SheetSectionNo id="roto" />
          <p class="ha__text">
            {{ HS.roto }}
          </p>
          <p class="ro__n" aria-hidden="true">
            150
          </p>
        </div>
        <img class="ro__grid" :src="PICS.roto.src" :width="PICS.roto.w" :height="PICS.roto.h" :alt="PICS.roto.alt" loading="lazy" decoding="async">
      </section>

      <SheetCredits :items="HS.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ha__text {
  margin: 0;
  max-width: 44ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The browser frame: Will's white UI inside the dark Sheet */
.wt {
  background: #f4f4f2;
  color: #111;
}

.wt__bar {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #d8d8d4;
  font: 500 12px/1 var(--font-ui);
}

.wt__dots {
  display: flex;
  gap: 6px;
}

.wt__dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c9c9c4;
}

.wt__url {
  justify-self: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: #fff;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.wt__url b {
  color: #111;
  font-weight: 600;
}

.wt__tc {
  font-variant-numeric: tabular-nums;
  color: #666;
}

.wt__film {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #fff;
}

.wt__ch {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid #d8d8d4;
}

.wt__ch li + li {
  border-left: 1px solid #d8d8d4;
}

.wt__ch button {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px 12px;
  width: 100%;
  padding: 12px;
  border: 0;
  background: none;
  color: #111;
  text-align: left;
  cursor: pointer;
  transition: background-color 160ms ease-out;
}

.wt__ch button:hover {
  background: #fff;
}

.wt__ch button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.wt__ch img {
  grid-column: 1 / -1;
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  outline: 1px solid #d8d8d4;
  opacity: 0.55;
  transition: opacity 200ms ease-out;
}

.wt__ch .is-on img,
.wt__ch button:hover img {
  opacity: 1;
}

.wt__k {
  font: 500 13px/1.2 var(--font-ui);
}

.wt__k b {
  margin-right: 4px;
  color: #999;
  font-weight: 500;
}

.wt__ch .is-on .wt__k b {
  color: var(--c-red, #e03a2f);
}

.wt__t {
  font: 400 12px/1.2 var(--font-ui);
  color: #888;
  font-variant-numeric: tabular-nums;
}

/* 01 Brief */
.br {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.br__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.br__strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-left: 1px solid var(--rule);
}

.br__strip img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  filter: grayscale(1);
  transition: filter 240ms ease-out;
}

.br__strip li:hover img {
  filter: none;
}

/* 02 The object */
.ob {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.ob__words {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 28px 24px;
}

.ob__cap {
  display: block;
  width: 100%;
  height: auto;
  margin-top: 8px;
  outline: 1px solid var(--rule);
}

.ob__turn {
  position: relative;
  background: #f4f4f2;
  border-left: 1px solid var(--rule);
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}

.ob__turn:active {
  cursor: grabbing;
}

.ob__turn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.ob__sprite {
  width: min(100%, 640px);
  margin: 0 auto;
  aspect-ratio: 420 / 412;
  background-repeat: no-repeat;
  background-size: 1100% 400%;
}

.ob__hint {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;
  display: flex;
  justify-content: space-between;
  margin: 0;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #555;
}

.ob__hint span {
  font-variant-numeric: tabular-nums;
}

/* 03 Roto */
.ro {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
  background: #050505;
}

.ro__words {
  display: grid;
  align-content: space-between;
  gap: 14px;
  padding: 28px 24px;
}

.ro__n {
  margin: 0;
  font: 600 clamp(64px, 9vw, 132px)/0.85 var(--font-ui);
  letter-spacing: -0.05em;
}

.ro__grid {
  display: block;
  width: 100%;
  height: auto;
  border-left: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .wt__ch button, .wt__ch img, .br__strip img { transition: none; }
}

@media (max-width: 720px) {
  .wt__bar {
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 8px 52px 8px 12px;
  }

  .wt__dots {
    display: none;
  }

  .wt__url {
    justify-self: start;
  }

  .wt__ch {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .wt__ch li:nth-child(3) {
    border-left: 0;
  }

  .wt__ch li:nth-child(n + 3) {
    border-top: 1px solid #d8d8d4;
  }

  .br,
  .ob,
  .ro {
    grid-template-columns: minmax(0, 1fr);
  }

  .br__strip,
  .ob__turn,
  .ro__grid {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .br__strip {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .br__words,
  .ob__words,
  .ro__words {
    padding: 22px 52px 22px 16px;
  }

  .ob__turn {
    padding-bottom: 32px;
  }
}
</style>
