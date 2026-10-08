<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, DR, FILM, INFO, KIT, STRIP } from './story'

// DA "Edit bay" (Dredge r1; the overnight run's top scorer). Beats, each its own device: the film in an edit bay, a strip of
// fifteen of its frames under it as a timeline you scrub by pointing (the playhead follows the film) → the kit as a
// product page's hotspots, four numbered points on the figure, each opening its close-up → the prompt's 2.35:1 laid
// over the 9:16 whale clip as a framing guide you switch on and off.
// Refs: Premiere's source monitor and its thumbnail track; Apple's scroll-scrubbed product films; the feature
// hotspots on Your Majesty's Rottefella site (Awwwards SOTY nominee) and Arc'teryx's technical lookbooks; camera
// framing guides. Videos play only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy, spots.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('da', [
  { id: 'kit', label: 'The kit' },
  { id: 'ratio', label: 'The prompt' },
])

// The scrub: pointing at the strip seeks the film; the playhead and the readout follow the film
const film = ref<HTMLVideoElement>()
const now = ref(0)
const fmt = (t: number) => `0:${String(Math.floor(t)).padStart(2, '0')}`
let raf = 0
let want = -1
function seek(t: number) {
  const v = film.value
  if (!v) return
  if (v.preload !== 'auto') v.preload = 'auto'
  want = t
  now.value = t
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    if (want < 0 || !film.value) return
    const fv = film.value as HTMLVideoElement & { fastSeek?: (t: number) => void }
    if (fv.fastSeek) fv.fastSeek(want)
    else fv.currentTime = want
  })
}
function scrub(e: PointerEvent) {
  if (e.pointerType === 'touch') return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  seek(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * FILM.dur)
}
function onTime() {
  if (film.value) now.value = film.value.currentTime
}
onBeforeUnmount(() => cancelAnimationFrame(raf))

// The hotspots on the figure (placed by eye on mj-gloves-dark), each with its close-up
const SPOTS = [
  { k: 'Hood', x: 50, y: 8, pic: KIT.hood },
  { k: 'Straps', x: 37, y: 37, pic: KIT.strap },
  { k: 'Pocket', x: 52, y: 54, pic: KIT.zip },
  { k: 'Gloves', x: 54, y: 79, pic: KIT.gloves },
]
const spot = ref(0)

// The ratio guide
const wide = ref(false)
const promptParts = DR.prompt.split(DR.ar)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="da">
      <SheetHead :title="DR.title" :hook="DR.hook" :info="INFO">
        <template #before>
          <div class="bay">
            <div class="bay__mon">
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
                data-play
                aria-label="Dredge, the 44.7 second film"
                @timeupdate="onTime"
              />
            </div>
            <div class="bay__side">
              <p class="bay__tc" aria-hidden="true">
                {{ fmt(now) }}<span> / 0:44</span>
              </p>
              <p class="bay__k">
                {{ FILM.label }}. {{ DR.clips }}
              </p>
            </div>
            <div class="bay__track" @pointermove="scrub">
              <ol class="bay__strip" aria-label="Fifteen frames of the film; choose one to jump there">
                <li v-for="f in STRIP" :key="f.src">
                  <button type="button" :aria-label="`Jump to ${f.tc}`" @click="seek(f.t)" @focus="seek(f.t)">
                    <img :src="f.src" alt="" width="120" height="208" loading="lazy" decoding="async">
                  </button>
                </li>
              </ol>
              <span class="bay__head" aria-hidden="true" :style="{ translate: `${(now / FILM.dur) * 100}cqw 0` }" />
            </div>
            <p class="bay__hint">
              {{ DR.scrub }}
            </p>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The kit: hotspots -->
      <section class="kit" v-bind="sec('kit')" data-sheet-block="kit">
        <div class="kit__fig">
          <img :src="KIT.figure.src" :srcset="KIT.figure.srcset" sizes="(max-width: 720px) 100vw, 420px" :alt="KIT.figure.alt" :width="KIT.figure.w" :height="KIT.figure.h" loading="lazy" decoding="async">
          <button
            v-for="(s, i) in SPOTS"
            :key="s.k"
            type="button"
            class="kit__dot"
            :class="{ 'is-on': spot === i }"
            :style="{ left: `${s.x}%`, top: `${s.y}%` }"
            :aria-pressed="spot === i"
            :aria-label="s.k"
            @click="spot = i"
            @pointerenter="spot = i"
          >
            {{ i + 1 }}
          </button>
        </div>
        <div class="kit__side">
          <div class="kit__top">
            <SheetSectionNo id="kit" />
            <p class="da__text">
              {{ DR.kit }}
            </p>
          </div>
          <div class="kit__zoom">
            <img
              v-for="(s, i) in SPOTS"
              :key="s.k"
              :class="{ 'is-on': spot === i }"
              :src="s.pic.src"
              :srcset="s.pic.srcset"
              sizes="(max-width: 720px) 100vw, 620px"
              :alt="spot === i ? s.pic.alt : ''"
              :aria-hidden="spot !== i"
              :width="s.pic.w"
              :height="s.pic.h"
              loading="lazy"
              decoding="async"
            >
            <p class="kit__label" aria-live="polite">
              <b>{{ String(spot + 1).padStart(2, '0') }}</b> {{ SPOTS[spot]!.k }}
            </p>
          </div>
        </div>
      </section>

      <!-- 02 The prompt's 2.35:1 over the 9:16 clip -->
      <section class="rt" v-bind="sec('ratio')" data-sheet-block="ratio">
        <div class="rt__side">
          <SheetSectionNo id="ratio" />
          <pre class="rt__prompt"><code>{{ promptParts[0] }}<mark>{{ DR.ar }}</mark>{{ promptParts[1] }}</code></pre>
          <p class="da__text">
            {{ DR.ratio }}
          </p>
          <button type="button" class="rt__btn" :aria-pressed="wide" @click="wide = !wide">
            {{ wide ? 'Show 9:16' : 'Show 2.35:1' }}
          </button>
        </div>
        <div class="rt__frame" :class="{ 'is-wide': wide }">
          <video
            :src="CLIPS.whale.src"
            :poster="CLIPS.whale.poster"
            width="1080"
            height="1872"
            muted
            loop
            playsinline
            preload="none"
            data-play
            :aria-label="`Five-second Midjourney clip: ${CLIPS.whale.alt}`"
          />
          <span class="rt__bar rt__bar--t" aria-hidden="true" />
          <span class="rt__bar rt__bar--b" aria-hidden="true" />
          <span class="rt__tag" aria-hidden="true">{{ wide ? '2.35 : 1' : '9 : 16' }}</span>
        </div>
      </section>

      <SheetCredits :items="DR.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.da__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The edit bay: monitor left, timecode right, the strip under both */
.bay {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  background: #050607;
  color: #e9ecef;
}

.bay__mon video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
  background: #000;
}

.bay__side {
  display: grid;
  align-content: end;
  gap: 16px;
  padding: 24px;
  border-left: 1px solid rgb(255 255 255 / 0.08);
}

.bay__tc {
  margin: 0;
  font: 500 clamp(48px, 6.4vw, 88px)/0.9 var(--font-ui);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
}

.bay__tc span {
  color: rgb(255 255 255 / 0.35);
}

.bay__k {
  margin: 0;
  max-width: 34ch;
  font: 400 14px/1.5 var(--font-ui);
  color: rgb(255 255 255 / 0.7);
}

.bay__track {
  position: relative;
  grid-column: 1 / -1;
  container-type: inline-size;
  border-top: 1px solid rgb(255 255 255 / 0.08);
  cursor: ew-resize;
}

.bay__strip {
  display: grid;
  grid-template-columns: repeat(15, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.bay__strip button {
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: inherit;
}

.bay__strip button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

.bay__strip img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 120 / 208;
  object-fit: cover;
  opacity: 0.75;
}

.bay__head {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 2px;
  background: #e03a2f;
  pointer-events: none;
  transition: translate 260ms linear;
}

.bay__hint {
  grid-column: 1 / -1;
  margin: 0;
  padding: 10px 24px 12px;
  font: 500 11px/1.4 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.5);
}

/* 01 Hotspots */
.kit {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  border-top: 1px solid var(--rule);
}

.kit__fig {
  position: relative;
}

.kit__fig img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 768 / 1344;
  object-fit: cover;
}

.kit__dot {
  position: absolute;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  translate: -50% -50%;
  padding: 0;
  border: 1px solid rgb(255 255 255 / 0.85);
  border-radius: 50%;
  font: 600 13px/1 var(--font-ui);
  color: #fff;
  background: rgb(0 0 0 / 0.45);
  cursor: pointer;
  transition: background-color 160ms ease-out, scale 160ms ease-out;
}

.kit__dot.is-on {
  background: #e03a2f;
  border-color: #e03a2f;
  scale: 1.15;
}

.kit__dot:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.kit__side {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border-left: 1px solid var(--rule);
}

.kit__top {
  display: grid;
  gap: 14px;
  padding: 24px;
}

.kit__zoom {
  position: relative;
  overflow: hidden;
  min-height: 320px;
  border-top: 1px solid var(--rule);
}

.kit__zoom img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 240ms ease-out;
}

.kit__zoom img.is-on {
  opacity: 1;
}

.kit__label {
  position: absolute;
  left: 16px;
  bottom: 14px;
  margin: 0;
  padding: 6px 10px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

.kit__label b {
  margin-right: 6px;
  color: #ff6a5e;
}

/* 02 The ratio guide */
.rt {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  border-top: 1px solid var(--rule);
}

.rt__side {
  display: grid;
  align-content: center;
  gap: 20px;
  padding: 32px 24px;
}

.rt__prompt {
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: 400 13px/1.6 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-fg) 6%, transparent);
  border-left: 2px solid #e03a2f;
}

.rt__prompt mark {
  padding: 0 2px;
  color: #fff;
  background: #e03a2f;
}

.rt__btn {
  justify-self: start;
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

.rt__btn:hover {
  border-color: var(--c-fg);
}

.rt__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.rt__frame {
  position: relative;
  overflow: hidden;
  border-left: 1px solid var(--rule);
  background: #000;
}

.rt__frame video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
}

/* 2.35:1 across a 9:16 frame is 24.5% of its height: each bar covers 37.75% */
.rt__bar {
  position: absolute;
  left: 0;
  right: 0;
  height: 37.75%;
  background: rgb(0 0 0 / 0.82);
  scale: 1 0;
  transition: scale 420ms cubic-bezier(0.23, 1, 0.32, 1);
}

.rt__bar--t { top: 0; transform-origin: top; }
.rt__bar--b { bottom: 0; transform-origin: bottom; }
.is-wide .rt__bar { scale: 1 1; }

.rt__tag {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 4px 8px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

@media (prefers-reduced-motion: reduce) {
  .bay__head, .kit__dot, .kit__zoom img, .rt__bar { transition: none; }
}

@media (max-width: 720px) {
  .bay {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .bay__side {
    padding: 16px 52px 16px 16px;
  }

  .bay__tc {
    font-size: 26px;
  }

  .bay__hint {
    padding: 8px 16px 10px;
  }

  .kit,
  .rt {
    grid-template-columns: minmax(0, 1fr);
  }

  .kit__side,
  .rt__frame {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .kit__top,
  .rt__side {
    padding: 22px 52px 22px 16px;
  }

  .kit__zoom {
    aspect-ratio: 4 / 5;
  }

  .rt__side {
    order: -1;
  }
}
</style>
