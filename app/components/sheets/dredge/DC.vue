<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, DR, FILM, INFO, KIT, WORLD } from './story'

// PROTOTYPE DC "Campaign" (overnight run, Dredge r1): shown as the campaign it pretends to be. Beats, each its own
// device: a magazine spread, the film on the left page and two stills on the right → the kit as an index of looks
// in big type, the look's still following the pointer as you run down the list (thumbnails inline on phones) → the
// whale clip as a wide billboard with its one line over it, the prompt under it in small type.
// Refs: the hover-reveal project indexes on Obys and Rejouice (Will's keepers); SSENSE and Arc'teryx System_A
// editorial lookbooks; out-of-home billboard mock-ups on agency case pages. The float moves on transforms only, one
// rAF per frame. Videos play only in view, once the Sheet is open (useOpenPlay). PLACEHOLDER: sizes, copy, the list.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('dc', [
  { id: 'looks', label: 'Looks' },
  { id: 'whale', label: 'The whale' },
])

const LOOKS = [
  { k: 'Hood', v: 'Black waxed shell', pic: KIT.hood },
  { k: 'Fog', v: 'Hood up, sea behind', pic: KIT.face },
  { k: 'Tabs', v: 'Red pulls on black', pic: KIT.portrait },
  { k: 'Bib', v: 'Straps and red gloves', pic: KIT.figure },
  { k: 'Glove', v: 'Red glove, wet', pic: KIT.gloves },
  { k: 'Buckle', v: 'Rain on the strap', pic: KIT.strap },
  { k: 'Pocket', v: 'Two red zips', pic: KIT.zip },
]

// The float: follows the pointer over the list; focus shows it beside the focused row
const list = ref<HTMLElement>()
const on = ref(-1)
const pos = reactive({ x: 0, y: 0 })
let raf = 0
let nx = 0
let ny = 0
function move(e: PointerEvent) {
  if (e.pointerType === 'touch' || !list.value) return
  const r = list.value.getBoundingClientRect()
  nx = e.clientX - r.left
  ny = e.clientY - r.top
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    pos.x = nx
    pos.y = ny
  })
}
function enter(i: number, e: PointerEvent) {
  if (e.pointerType === 'touch') return
  move(e)
  on.value = i
}
function focusRow(i: number, e: FocusEvent) {
  on.value = i
  const row = e.currentTarget as HTMLElement
  if (!list.value) return
  pos.x = list.value.clientWidth * 0.72
  pos.y = row.offsetTop + row.offsetHeight / 2
}
onBeforeUnmount(() => cancelAnimationFrame(raf))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="dc">
      <SheetHead :title="DR.title" :hook="DR.hook" :info="INFO">
        <template #before>
          <div class="spread">
            <figure class="spread__film">
              <video
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
              />
              <figcaption>{{ FILM.label }}</figcaption>
            </figure>
            <div class="spread__page">
              <img :src="WORLD.whaleWave.src" :srcset="WORLD.whaleWave.srcset" sizes="(max-width: 720px) 50vw, 520px" :alt="WORLD.whaleWave.alt" :width="WORLD.whaleWave.w" :height="WORLD.whaleWave.h" decoding="async">
              <img :src="KIT.portrait.src" :srcset="KIT.portrait.srcset" sizes="(max-width: 720px) 50vw, 520px" :alt="KIT.portrait.alt" :width="KIT.portrait.w" :height="KIT.portrait.h" decoding="async">
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The index of looks -->
      <section class="lk" v-bind="sec('looks')" data-sheet-block="looks">
        <div class="dc__head">
          <SheetSectionNo id="looks" />
          <p class="dc__text">
            {{ DR.kit }}
          </p>
        </div>
        <div ref="list" class="lk__list" @pointermove="move" @pointerleave="on = -1">
          <ol>
            <li
              v-for="(l, i) in LOOKS"
              :key="l.k"
              tabindex="0"
              :class="{ 'is-on': on === i }"
              @pointerenter="enter(i, $event)"
              @focus="focusRow(i, $event)"
              @blur="on = -1"
            >
              <span class="lk__n" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="lk__k">{{ l.k }}</span>
              <span class="lk__v">{{ l.v }}</span>
              <img class="lk__thumb" :src="l.pic.src" :srcset="l.pic.srcset" sizes="96px" :alt="l.pic.alt" :width="l.pic.w" :height="l.pic.h" loading="lazy" decoding="async">
            </li>
          </ol>
          <div class="lk__float" :class="{ 'is-on': on >= 0 }" :style="{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }" aria-hidden="true">
            <img
              v-for="(l, i) in LOOKS"
              :key="l.k"
              :class="{ 'is-on': on === i }"
              :src="l.pic.src"
              :srcset="l.pic.srcset"
              sizes="300px"
              alt=""
              :width="l.pic.w"
              :height="l.pic.h"
              loading="lazy"
              decoding="async"
            >
          </div>
        </div>
      </section>

      <!-- 02 The whale as a billboard -->
      <section class="bb" v-bind="sec('whale')" data-sheet-block="whale">
        <div class="bb__board">
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
          <div class="bb__over">
            <SheetSectionNo id="whale" />
            <p class="bb__line">
              {{ DR.whale }}
            </p>
          </div>
        </div>
        <p class="bb__prompt">
          <span>Prompt</span> {{ DR.prompt }}
        </p>
      </section>

      <SheetCredits :items="DR.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.dc__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.dc__text {
  margin: 0;
  max-width: 50ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* The spread: the film on the left page, two stills stacked on the right */
.spread {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1px;
  background: var(--rule);
}

.spread__film {
  position: relative;
  margin: 0;
}

.spread__film video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
  background: #000;
}

.spread__film figcaption {
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 8px;
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fff;
  background: rgb(0 0 0 / 0.55);
}

.spread__page {
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  aspect-ratio: 1080 / 1872; /* the film's height, so the stills never stretch the row */
  gap: 1px;
  min-height: 0;
}

.spread__page img {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  object-fit: cover;
}

.spread__page img:first-child {
  object-position: 50% 58%;
}

.spread__page img:last-child {
  object-position: 50% 25%;
}

/* 01 The index */
.lk {
  border-top: 1px solid var(--rule);
}

.lk__list {
  position: relative;
  overflow: hidden;
}

.lk__list ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lk__list li {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) minmax(0, 1fr);
  align-items: baseline;
  gap: 16px;
  padding: 14px 24px;
  border-top: 1px solid var(--rule);
  outline: none;
  cursor: default;
  transition: color 160ms ease-out;
}

.lk__list li:focus-visible {
  box-shadow: inset 2px 0 0 var(--c-accent);
}

.lk__n {
  font: 500 13px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.lk__k {
  font: 600 clamp(36px, 5.4vw, 72px)/1 var(--font-ui);
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.lk__v {
  font: 400 14px/1.4 var(--font-ui);
  color: var(--muted);
}

@media (hover: hover) and (min-width: 721px) {
  .lk__list ol:hover li:not(.is-on) .lk__k {
    color: color-mix(in srgb, var(--c-fg) 30%, transparent);
  }
}

.lk__list li.is-on .lk__k {
  color: #e03a2f;
}

.lk__thumb {
  display: none;
}

.lk__float {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 240px;
  aspect-ratio: 768 / 1344;
  margin: -210px 0 0 -120px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease-out;
  will-change: transform;
}

.lk__float.is-on {
  opacity: 1;
}

.lk__float img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
}

.lk__float img.is-on {
  opacity: 1;
}

/* 02 The billboard: the clip cropped wide, its line over it */
.bb {
  border-top: 1px solid var(--rule);
}

.bb__board {
  position: relative;
  overflow: hidden;
  background: #000;
}

.bb__board video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: 50% 45%;
}

.bb__over {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: 14px;
  padding: 24px;
  color: #fff;
  background: linear-gradient(to top, rgb(0 0 0 / 0.65), transparent);
}

.bb__over :deep(.sno) {
  color: #fff;
}

.bb__line {
  margin: 0;
  max-width: 16ch;
  font: 600 clamp(36px, 5.4vw, 72px)/0.95 var(--font-ui);
  letter-spacing: -0.04em;
}

.bb__prompt {
  margin: 0;
  padding: 18px 24px 22px;
  max-width: 96ch;
  font: 400 12px/1.6 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--muted);
}

.bb__prompt span {
  margin-right: 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #e03a2f;
}

@media (prefers-reduced-motion: reduce) {
  .lk__list li, .lk__float { transition: none; }
}

@media (hover: none), (max-width: 720px) {
  .lk__float {
    display: none;
  }

  .lk__list li {
    grid-template-columns: 32px minmax(0, 1fr) 72px;
    align-items: center;
  }

  .lk__v {
    grid-column: 2;
    grid-row: 2;
  }

  .lk__thumb {
    display: block;
    grid-column: 3;
    grid-row: 1 / span 2;
    width: 72px;
    height: 96px;
    object-fit: cover;
  }
}

@media (max-width: 720px) {
  .dc__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 52px 16px 16px;
  }

  .lk__list li {
    padding: 12px 16px;
    gap: 4px 12px;
  }

  .lk__k {
    font-size: 30px;
  }

  .bb__board video {
    aspect-ratio: 4 / 5;
  }

  .bb__over {
    padding: 16px;
  }

  .bb__line {
    font-size: 32px;
  }

  .bb__prompt {
    padding: 14px 16px 18px;
  }
}
</style>
