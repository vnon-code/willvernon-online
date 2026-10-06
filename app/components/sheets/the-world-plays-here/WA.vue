<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TwCredits from './TwCredits.vue'
import { BP, CHANNELS, CONCEPT, LOOP, M, QUARTERS, SHELTER_ART, SLOGANS, TW } from './story'

// PROTOTYPE WA "Entry board" (overnight run, The World Plays Here r1).
// Refs: D&AD New Blood archive entries (dandad.org/work/new-blood-archive, e.g. "Every Screen is an Xbox", "Just
// Press X": one board with the brief, the idea and the executions); an agency copy deck, where the dead lines stay on
// the page with a rule through them; an out-of-home media plan (channel, units, decision). Beats, each its own device:
// the entry board (brief beside the concept frame, then loop, subway and shelter as square tiles) → the shortlist
// struck through as you scroll, the pick with the billboard's green line under PLAYS → the build as four numbered
// frames → the media plan as a table. Only the loop moves. PLACEHOLDER: sizes, copy, tile order.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const frames = [BP.inLogo, BP.split, BP.wrap, BP.arc].map((pic, i) => ({ pic, n: i + 1, text: QUARTERS[i]! }))
const pick = SLOGANS.find(s => s.pick)!
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="wa">
      <!-- The entry board -->
      <section class="bd" data-sheet-body data-sheet-block="board" aria-label="The entry">
        <div data-build class="bd__grid">
          <div class="bd__cover">
            <p class="wa__k">
              D&amp;AD × Xbox · {{ TW.year }}
            </p>
            <h2 class="bd__title">
              {{ TW.title }}
            </h2>
            <p class="wa__text">
              {{ TW.brief }}
            </p>
            <dl class="bd__specs">
              <div v-for="s in TW.specs" :key="s.k">
                <dt>{{ s.k }}</dt>
                <dd>{{ s.v }}</dd>
              </div>
            </dl>
          </div>
          <figure class="bd__tile bd__concept">
            <img :src="CONCEPT.src" :alt="CONCEPT.alt" :width="CONCEPT.w" :height="CONCEPT.h" decoding="async" loading="lazy">
            <figcaption>Key frame</figcaption>
          </figure>
          <figure class="bd__tile">
            <video
              :src="LOOP.src"
              :poster="LOOP.poster"
              :width="LOOP.w"
              :height="LOOP.h"
              muted
              loop
              playsinline
              preload="none"
              data-play
              aria-label="The Xbox logo wrapping the Earth, a 13 second loop"
            />
            <figcaption>Loop</figcaption>
          </figure>
          <figure class="bd__tile">
            <img :src="M.subway[0]!.src" :alt="M.subway[0]!.alt" :width="M.subway[0]!.w" :height="M.subway[0]!.h" decoding="async" loading="lazy" class="is-trim">
            <figcaption>Subway</figcaption>
          </figure>
          <figure class="bd__tile">
            <img :src="SHELTER_ART.src" :alt="SHELTER_ART.alt" :width="SHELTER_ART.w" :height="SHELTER_ART.h" decoding="async" loading="lazy" class="is-top">
            <figcaption>Shelter</figcaption>
          </figure>
        </div>
      </section>

      <!-- The shortlist, struck through -->
      <section class="sl" data-sheet-block="slogans" aria-label="The shortlist">
        <div class="sl__head">
          <p class="wa__k">
            Shortlist
          </p>
          <p class="wa__text">
            {{ TW.idea }}
          </p>
        </div>
        <ol class="sl__list">
          <li v-for="s in SLOGANS" :key="s.t" :class="{ 'is-pick': s.pick }">
            <span class="sl__t">
              <template v-if="s.pick">The World <u>Plays</u> Here.</template>
              <template v-else>{{ s.t }}</template>
            </span>
            <span class="sl__why">{{ s.why }}</span>
          </li>
        </ol>
        <p class="sr-only">
          Chosen: {{ pick.t }}
        </p>
      </section>

      <!-- The build: four frames, four steps -->
      <section class="fr" data-sheet-block="build" aria-label="The build">
        <div class="fr__head">
          <p class="wa__k">
            Build
          </p>
          <p class="wa__text">
            {{ TW.concept }}
          </p>
        </div>
        <ol class="fr__row">
          <li v-for="f in frames" :key="f.n">
            <figure>
              <img :src="f.pic.src" :alt="f.pic.alt" :width="f.pic.w" :height="f.pic.h" decoding="async" loading="lazy">
              <span class="fr__n" aria-hidden="true">{{ f.n }}</span>
            </figure>
            <p>{{ f.text }}</p>
          </li>
        </ol>
      </section>

      <!-- The media plan -->
      <section class="pl" data-sheet-block="plan" aria-label="Where it ran">
        <div class="pl__row pl__th" aria-hidden="true">
          <span>Channel</span><span>Units</span><span>Decision</span><span />
        </div>
        <div v-for="c in CHANNELS" :key="c.k" class="pl__row">
          <p class="pl__ch">
            {{ c.k }}
          </p>
          <p class="pl__n">
            ×{{ c.n }}
          </p>
          <p class="pl__note">
            {{ c.note }}
          </p>
          <div class="pl__pics">
            <img v-for="pic in c.pics.slice(0, 2)" :key="pic.src" :src="pic.src" :alt="pic.alt" :width="pic.w" :height="pic.h" loading="lazy" decoding="async">
          </div>
        </div>
      </section>

      <TwCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.wa__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.wa__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* The board */
.bd {
  animation: wa-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes wa-in {
  from { opacity: 0; }
}

.bd__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.bd__grid > * {
  min-width: 0;
  background: var(--c-bg);
}

.bd__cover {
  display: grid;
  align-content: start;
  gap: 14px;
  padding: 22px 20px;
}

.bd__title {
  margin: 0;
  font: 600 30px/1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.bd__specs {
  display: grid;
  gap: 8px;
  margin: 4px 0 0;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
}

.bd__specs dt {
  font: 500 10px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.bd__specs dd {
  margin: 2px 0 0;
  font: 400 13px/1.4 var(--font-ui);
}

.bd__tile {
  position: relative;
  margin: 0;
  aspect-ratio: 1;
  overflow: hidden;
}

.bd__concept {
  grid-column: span 2;
  aspect-ratio: auto;
}

.bd__tile img,
.bd__tile video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

/* The mockup PNGs carry wide grey margins: trim them */
.bd__tile img.is-trim {
  scale: 1.45;
}

.bd__tile img.is-top {
  object-fit: contain;
}

.bd__tile figcaption {
  position: absolute;
  bottom: 0;
  left: 0;
  padding: 5px 8px;
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #fff;
  background: #000;
}

/* The shortlist */
.sl {
  border-top: 1px solid var(--rule);
  padding-bottom: 28px;
}

.sl__head,
.fr__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.sl__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.sl__list li {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 24px;
  padding: 10px 24px;
  border-top: 1px solid var(--rule);
}

.sl__t {
  position: relative;
  font: 600 clamp(24px, 4.2vw, 48px)/1.05 var(--font-ui);
  letter-spacing: -0.02em;
  color: var(--muted);
}

/* The rule through each dead line, drawn as it scrolls into view */
li:not(.is-pick) .sl__t::after {
  content: '';
  position: absolute;
  left: -4px;
  right: -4px;
  top: 52%;
  height: 3px;
  background: var(--c-accent);
  transform-origin: 0 50%;
}

@supports (animation-timeline: view()) {
  li:not(.is-pick) .sl__t::after {
    animation: wa-strike linear both;
    animation-timeline: view();
    animation-range: entry 60% cover 45%;
  }
}

@keyframes wa-strike {
  from { transform: scaleX(0); }
}

.sl__why {
  font: 400 14px/1.4 var(--font-ui);
  color: var(--muted);
}

.is-pick .sl__t {
  color: var(--c-fg);
}

/* The billboards' decision: a green line under PLAYS */
.is-pick u {
  text-decoration: none;
  box-shadow: inset 0 -0.12em #107c10;
}

.is-pick .sl__why {
  color: var(--c-fg);
}

/* The build */
.fr {
  border-top: 1px solid var(--rule);
}

.fr__row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
}

.fr__row li {
  min-width: 0;
  background: var(--c-bg);
}

.fr__row figure {
  position: relative;
  margin: 0;
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.fr__row img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #111;
}

.fr__n {
  position: absolute;
  top: 6px;
  left: 10px;
  font: 600 44px/1 var(--font-ui);
  color: #fff;
  text-shadow: 0 1px 8px rgb(0 0 0 / 0.6);
}

.fr__row p {
  margin: 0;
  padding: 12px 14px 18px;
  font: 400 14px/1.45 var(--font-ui);
}

/* The media plan */
.pl {
  border-top: 1px solid var(--rule);
}

.pl__row {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) 56px minmax(0, 2.4fr) minmax(0, 2.4fr);
  gap: 20px;
  align-items: center;
  padding: 14px 24px;
  border-top: 1px solid var(--rule);
}

.pl__th {
  padding-block: 12px;
  border-top: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.pl__row p {
  margin: 0;
}

.pl__ch {
  font: 600 20px/1.1 var(--font-ui);
}

.pl__n {
  font: 500 20px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.pl__note {
  font: 400 14px/1.45 var(--font-ui);
  color: var(--muted);
}

.pl__pics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
}

.pl__pics img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  background: #e9e9e9;
}

@media (prefers-reduced-motion: reduce) {
  .bd { animation-duration: 1ms; }

  li:not(.is-pick) .sl__t::after { animation: none; }
}

@media (max-width: 720px) {
  .bd__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bd__cover,
  .bd__concept {
    grid-column: 1 / -1;
  }

  .bd__concept {
    aspect-ratio: 16 / 9;
  }

  .bd__cover {
    padding: 18px 52px 20px 16px;
  }

  .sl__head,
  .fr__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 16px 16px;
  }

  .sl__list li {
    padding: 10px 16px;
  }

  .fr__row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fr__n {
    font-size: 32px;
  }

  .fr__row p {
    padding: 10px 12px 14px;
  }

  .pl__th {
    display: none !important;
  }

  .pl__row {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px 12px;
    padding: 16px;
  }

  .pl__note,
  .pl__pics {
    grid-column: 1 / -1;
  }
}
</style>
