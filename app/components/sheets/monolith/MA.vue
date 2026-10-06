<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import MoCredits from './MoCredits.vue'
import { FIGURE, FILM, MO, WORLD, CLIPS } from './story'
import { useOpenPlay } from './useOpenPlay'

// PROTOTYPE MA "White-out" (overnight run, Monolith r1).
// Refs: Your Majesty's FILA Explore site (Awwwards SOTD; campaign stories as full-bleed chapters on the collection's
// own colours) for the white band the film sits in; the expanding-panel galleries common on Awwwards (and Obys'
// bold, minimal blocks) for the character sheet; editorial magazine grids for the world.
// Beats, each its own device: the outcome on a white band whose white swallows the frames' white sky (film flanked by
// two stills, black type under it) → the eight portraits as slices that open on hover or focus → the world as an
// asymmetric grid → the stomp clip beside its Midjourney prompt.
// Videos play only in view and only once the Sheet is open (useOpenPlay). PLACEHOLDER: every size, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const flank = [FIGURE[6]!, FIGURE[7]!] // VARKON 4 and 8: the figure small in the white monoliths
const grid = [WORLD.concrete, WORLD.spires, WORLD.gateway, WORLD.storm, WORLD.steps, WORLD.canyon]
const stomp = CLIPS[0]!
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="ma">
      <!-- Outcome: the film between two stills on a white field, title and facts under it -->
      <section class="wo" data-sheet-body data-sheet-block="outcome" aria-label="Outcome">
        <div data-build>
          <div class="wo__row">
            <img class="wo__side" :src="flank[0]!.src" :srcset="flank[0]!.srcset" sizes="(max-width: 720px) 30vw, 320px" :alt="flank[0]!.alt" :width="flank[0]!.w" :height="flank[0]!.h" decoding="async">
            <figure class="wo__film">
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
                aria-label="Monolith Survival, the 34 second film"
              />
              <figcaption>{{ FILM.label }}</figcaption>
            </figure>
            <img class="wo__side" :src="flank[1]!.src" :srcset="flank[1]!.srcset" sizes="(max-width: 720px) 30vw, 320px" :alt="flank[1]!.alt" :width="flank[1]!.w" :height="flank[1]!.h" decoding="async">
          </div>
          <div class="wo__type">
            <h2 class="wo__title">
              {{ MO.title }} <span>{{ MO.year }}</span>
            </h2>
            <p class="wo__line">
              {{ MO.line }}
            </p>
            <dl class="wo__specs">
              <div v-for="s in MO.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <!-- 01 The figure: eight slices, one opens on hover or focus -->
      <section class="fg" data-sheet-block="figure" aria-label="The figure">
        <div class="ma__head">
          <p class="ma__count">
            <b>01</b> The figure
          </p>
          <p class="ma__text">
            {{ MO.figure }} {{ MO.brand }}
          </p>
        </div>
        <ul class="fg__row" aria-label="VARKON 1 to 8">
          <li v-for="(f, i) in FIGURE" :key="f.src" tabindex="0" :class="{ 'is-first': i === 0 }">
            <img :src="f.src" :srcset="f.srcset" sizes="(max-width: 720px) 62vw, 440px" :alt="f.alt" :width="f.w" :height="f.h" loading="lazy" decoding="async">
            <span aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          </li>
        </ul>
      </section>

      <!-- 02 The world: an asymmetric grid -->
      <section class="wd" data-sheet-block="world" aria-label="The world">
        <div class="ma__head">
          <p class="ma__count">
            <b>02</b> The world
          </p>
          <p class="ma__text">
            {{ MO.look }}
          </p>
        </div>
        <div class="wd__grid">
          <img v-for="(m, i) in grid" :key="m.src" :class="`wd__i wd__i--${i}`" :src="m.src" :srcset="m.srcset" :sizes="i === 0 ? '(max-width: 720px) 100vw, 600px' : '(max-width: 720px) 50vw, 440px'" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
        </div>
      </section>

      <!-- 03 One clip and its prompt -->
      <section class="sp" data-sheet-block="clip" aria-label="The stomp, from prompt to clip">
        <video
          class="sp__clip"
          :src="stomp.src"
          :poster="stomp.poster"
          width="1080"
          height="1872"
          muted
          loop
          playsinline
          preload="none"
          data-play
          aria-label="Five-second Midjourney clip: the boot stomps the ground"
        />
        <div class="sp__side">
          <p class="ma__count">
            <b>03</b> {{ stomp.k }}
          </p>
          <pre class="sp__prompt"><code>{{ MO.prompt }}</code></pre>
          <p class="ma__text">
            {{ MO.clips }}
          </p>
          <p class="ma__text">
            {{ MO.edit }}
          </p>
        </div>
      </section>

      <MoCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.ma__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 28px 24px;
}

.ma__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ma__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.ma__text {
  margin: 0;
  max-width: 54ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* Outcome on white: the stills' and the film's white sky run into the band */
.wo {
  background: #fff;
  color: #111;
  animation: ma-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes ma-in {
  from { opacity: 0; }
}

.wo__row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  align-items: end;
  gap: 0;
  padding: 0 24px;
}

.wo__side,
.wo__film video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1080 / 1872;
  object-fit: cover;
  background: #fff;
}

.wo__side {
  aspect-ratio: 1080 / 1920;
}

.wo__film {
  position: relative;
  margin: 0;
}

.wo__film figcaption {
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

.wo__type {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 16px 32px;
  padding: 28px 24px 32px;
}

.wo__title {
  grid-column: 1 / -1;
  margin: 0;
  font: 600 clamp(36px, 6.4vw, 76px)/0.95 var(--font-ui);
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.wo__title span {
  font-weight: 400;
  color: #c4061c;
}

.wo__line {
  margin: 0;
  max-width: 40ch;
  font: 400 17px/1.5 var(--font-ui);
}

.wo__specs {
  display: grid;
  gap: 10px;
  margin: 0;
}

.wo__specs div {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 12px;
}

.wo__specs dt {
  font: 500 11px/1.6 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b6b6b;
}

.wo__specs dd {
  margin: 0;
  font: 400 14px/1.5 var(--font-ui);
}

/* 01 Eight slices; the hovered or focused one opens (flex-grow on 8 items) */
.fg {
  border-top: 1px solid var(--rule);
}

.fg__row {
  display: flex;
  gap: 1px;
  height: min(560px, 70svh);
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
}

.fg__row li {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  outline: none;
  transition: flex-grow 500ms cubic-bezier(0.23, 1, 0.32, 1);
}

/* The first slice is open until another is hovered or focused */
.fg__row:not(:hover, :focus-within) li.is-first,
.fg__row li:hover,
.fg__row li:focus-visible {
  flex-grow: 4;
}

.fg__row li:focus-visible {
  box-shadow: inset 0 0 0 2px var(--c-accent);
}

.fg__row img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
}

.fg__row span {
  position: absolute;
  left: 8px;
  bottom: 8px;
  font: 600 12px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: #fff;
  text-shadow: 0 1px 2px rgb(0 0 0 / 0.6);
}

/* 02 The world: 12 columns, two rows of three, one large */
.wd {
  border-top: 1px solid var(--rule);
}

.wd__grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.wd__i {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.wd__i--0 { grid-column: span 7; grid-row: span 2; aspect-ratio: 1; }
.wd__i--1 { grid-column: span 5; aspect-ratio: 5 / 3.5; }
.wd__i--2 { grid-column: span 5; aspect-ratio: 5 / 3.5; }
.wd__i--3 { grid-column: span 3; aspect-ratio: 3 / 4; }
.wd__i--4 { grid-column: span 5; aspect-ratio: 5 / 4; }
.wd__i--5 { grid-column: span 4; aspect-ratio: 1; }

/* 03 The clip beside its prompt */
.sp {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.sp__clip {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 70%;
  background: #000;
}

.sp__side {
  display: grid;
  align-content: center;
  gap: 20px;
  padding: 32px 28px;
  border-left: 1px solid var(--rule);
}

.sp__prompt {
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font: 400 13px/1.6 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--c-fg);
  background: color-mix(in srgb, var(--c-fg) 6%, transparent);
  border-left: 2px solid #c4061c;
}

@media (prefers-reduced-motion: reduce) {
  .fg__row li { transition: none; }
  .wo { animation-duration: 1ms; }
}

@media (max-width: 720px) {
  .ma__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    padding: 22px 52px 22px 16px;
  }

  .wo__row {
    padding: 0 8px;
  }

  .wo__type {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 16px 26px;
  }

  .wo__line {
    font-size: 16px;
  }

  /* The slices become a swipe rail */
  .fg__row {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 62%;
    height: auto;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .fg__row li {
    aspect-ratio: 9 / 16;
    scroll-snap-align: start;
  }

  .wd__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .wd__i--0 { grid-column: span 2; grid-row: auto; }
  .wd__i--1, .wd__i--2, .wd__i--3, .wd__i--4, .wd__i--5 { grid-column: span 1; aspect-ratio: 1; }

  .sp {
    grid-template-columns: minmax(0, 1fr);
  }

  .sp__clip {
    aspect-ratio: 4 / 5;
  }

  .sp__side {
    padding: 22px 52px 26px 16px;
    border-left: 0;
  }
}
</style>
