<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import MoCredits from './MoCredits.vue'
import { CLIPS, FIGURE, FILM, MO, SWATCH, WORLD } from './story'
import { useOpenPlay } from './useOpenPlay'

// PROTOTYPE MC "Product page" (overnight run, Monolith r1). The campaign is for a gear brand that doesn't exist, so
// the Sheet is laid out like that brand's product page.
// Refs: outdoor-gear product detail pages (Arc'teryx, Salomon: a main viewer, a row of views, a spec panel) and
// garment hang tags for the outcome; Pantone-style swatch cards for the palette; a gear brand's "in the field" strip
// for the clips.
// Beats, each its own device: the film in a main viewer with views to switch and a hang tag of facts → the four
// colours as swatches, each with the patch of the still it was sampled from → the clips as a row of field tests.
// PLACEHOLDER: every size, the copy, the swatch crops.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
const film = ref<HTMLVideoElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const views = [
  { k: 'Film', src: FILM.poster, alt: 'The film' },
  { k: 'Hood', ...FIGURE[0]! },
  { k: 'Field', ...FIGURE[6]! },
  { k: 'Spires', ...WORLD.spires },
  { k: 'Boot', ...WORLD.bootMj },
]
const active = ref(0)
// The film holds still while a view covers it
watch(active, (i) => {
  const v = film.value
  if (!v) return
  if (i) v.pause()
  else if (document.documentElement.dataset.sheet === 'open') v.play().catch(() => {})
})

// Each swatch's patch: the still, where `object-fit: cover` puts its window, and the zoom's origin on the patch
const patches = [
  { pic: FIGURE[0]!, pos: '0% 0%', origin: '10% 6%' },
  { pic: WORLD.spires, pos: '50% 50%', origin: '29% 68%' },
  { pic: FIGURE[0]!, pos: '50% 100%', origin: '51% 52%' },
  { pic: FIGURE[0]!, pos: '57% 40%', origin: '57% 42%' },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="mc">
      <!-- Outcome: a product page. The main viewer, the views, the hang tag -->
      <section class="pd" data-sheet-body data-sheet-block="outcome" aria-label="Outcome">
        <div class="pd__in" data-build>
          <div class="pd__main">
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
              aria-label="Monolith Survival, the 34 second film"
            />
            <Transition name="pd-swap">
              <img
                v-if="active"
                :key="views[active]!.src"
                class="pd__view"
                :src="views[active]!.src"
                :srcset="(views[active] as { srcset?: string }).srcset"
                sizes="(max-width: 720px) 100vw, 520px"
                :alt="views[active]!.alt"
              >
            </Transition>
          </div>
          <div class="pd__side">
            <div class="pd__views" role="group" aria-label="Views">
              <button
                v-for="(v, i) in views"
                :key="v.k"
                type="button"
                class="pd__thumb"
                :aria-pressed="active === i"
                :aria-label="`View: ${v.k}`"
                @click="active = i"
              >
                <img :src="v.src" :srcset="(v as { srcset?: string }).srcset" sizes="96px" alt="" width="96" height="170" decoding="async">
              </button>
            </div>
            <div class="pd__tag">
              <p class="pd__brand">
                VARKON <span>/ the brand name in the files</span>
              </p>
              <h2 class="pd__title">
                {{ MO.title }}
              </h2>
              <p class="pd__line">
                {{ MO.line }}
              </p>
              <dl class="pd__specs">
                <div>
                  <dt>Year</dt>
                  <dd>{{ MO.year }}</dd>
                </div>
                <div v-for="s in MO.specs" :key="s.k">
                  <dt>{{ s.k }}</dt>
                  <dd>{{ s.v }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      <!-- 01 Colourway: four swatches, each with the patch it was sampled from -->
      <section class="cw" data-sheet-block="colour" aria-label="Colourway">
        <div class="mc__head">
          <p class="mc__count">
            <b>01</b> Colourway
          </p>
          <p class="mc__text">
            {{ MO.look }}
          </p>
        </div>
        <ul class="cw__row">
          <li v-for="(s, i) in SWATCH" :key="s.k">
            <div class="cw__patch">
              <img
                :src="patches[i]!.pic.src"
                :alt="`Detail of the still: ${s.from}`"
                :width="patches[i]!.pic.w"
                :height="patches[i]!.pic.h"
                :style="{ objectPosition: patches[i]!.pos, transformOrigin: patches[i]!.origin }"
                loading="lazy"
                decoding="async"
              >
            </div>
            <div class="cw__chip" :style="{ background: s.hex }" />
            <p class="cw__name">
              {{ s.k }} <span>{{ s.hex }}</span>
            </p>
            <p class="cw__from">
              {{ s.from }}
            </p>
          </li>
        </ul>
      </section>

      <!-- 02 Field tests: the clips in a row -->
      <section class="ft" data-sheet-block="clips" aria-label="Clips">
        <div class="mc__head">
          <p class="mc__count">
            <b>02</b> Field tests
          </p>
          <div class="mc__stack">
            <p class="mc__text">
              {{ MO.clips }}
            </p>
            <p class="mc__text">
              {{ MO.edit }}
            </p>
          </div>
        </div>
        <ul class="ft__row">
          <li v-for="c in CLIPS" :key="c.src">
            <video
              :src="c.src"
              :poster="c.poster"
              width="1080"
              height="1872"
              muted
              loop
              playsinline
              preload="none"
              data-play
              :aria-label="`Five-second Midjourney clip: ${c.k}`"
            />
            <p>{{ c.k }}</p>
          </li>
        </ul>
      </section>

      <MoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.mc__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 28px 24px;
}

.mc__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.mc__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.mc__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.mc__stack {
  display: grid;
  gap: 10px;
}

/* Outcome: the product page */
.pd {
  animation: mc-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes mc-in {
  from { opacity: 0; }
}

.pd__in {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.pd__main {
  position: relative;
  aspect-ratio: 1080 / 1600;
  overflow: hidden;
  background: #000;
}

.pd__main video,
.pd__view {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pd-swap-enter-active,
.pd-swap-leave-active {
  transition: opacity 220ms ease-out;
}

.pd-swap-enter-from,
.pd-swap-leave-to {
  opacity: 0;
}

.pd__side {
  display: grid;
  align-content: start;
  border-left: 1px solid var(--rule);
}

.pd__views {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.pd__thumb {
  position: relative;
  padding: 0;
  border: 0;
  background: #000;
  cursor: pointer;
}

.pd__thumb img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  opacity: 0.55;
  transition: opacity 160ms ease-out;
}

.pd__thumb:hover img,
.pd__thumb[aria-pressed='true'] img {
  opacity: 1;
}

.pd__thumb[aria-pressed='true']::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 3px;
  background: #ca031c;
}

.pd__thumb:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: -2px;
}

/* The hang tag */
.pd__tag {
  display: grid;
  gap: 16px;
  padding: 28px 24px 32px;
  border-top: 1px solid var(--rule);
}

.pd__brand {
  margin: 0;
  font: 700 13px/1 var(--font-ui);
  letter-spacing: 0.32em;
}

.pd__brand span {
  font-weight: 400;
  letter-spacing: 0.02em;
  color: var(--muted);
}

.pd__title {
  margin: 0;
  font: 600 clamp(30px, 4.2vw, 52px)/1 var(--font-ui);
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.pd__line {
  margin: 0;
  max-width: 40ch;
  font: 400 16px/1.5 var(--font-ui);
}

.pd__specs {
  margin: 0;
  border-top: 1px solid var(--rule);
}

.pd__specs div {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--rule);
}

.pd__specs dt {
  font: 500 11px/1.6 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pd__specs dd {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
}

/* 01 Colourway */
.cw {
  border-top: 1px solid var(--rule);
}

.cw__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}

.cw__row li {
  display: grid;
  align-content: start;
  padding-bottom: 20px;
  background: var(--c-bg);
}

.cw__patch {
  aspect-ratio: 1;
  overflow: hidden;
}

.cw__patch img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(4);
}

.cw__chip {
  height: 96px;
}

.cw__name {
  margin: 14px 16px 4px;
  font: 600 15px/1.3 var(--font-ui);
}

.cw__name span {
  margin-left: 6px;
  font: 400 13px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--muted);
}

.cw__from {
  margin: 0 16px;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

/* 02 Field tests */
.ft {
  border-top: 1px solid var(--rule);
}

.ft__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}

.ft__row li {
  background: var(--c-bg);
}

.ft__row video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
  background: #000;
}

.ft__row p {
  margin: 0;
  padding: 10px 12px 14px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

@media (prefers-reduced-motion: reduce) {
  .pd { animation-duration: 1ms; }
}

@media (max-width: 720px) {
  .mc__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 22px 52px 22px 16px;
  }

  .pd__in {
    grid-template-columns: minmax(0, 1fr);
  }

  .pd__main {
    aspect-ratio: 4 / 5;
  }

  .pd__side {
    border-left: 0;
  }

  .pd__tag {
    padding: 22px 16px 26px;
  }

  .cw__row,
  .ft__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cw__chip {
    height: 64px;
  }
}
</style>
