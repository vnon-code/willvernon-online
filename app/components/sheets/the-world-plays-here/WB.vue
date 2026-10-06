<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import { useOpenPlay } from '../monolith/useOpenPlay'
import TwCredits from './TwCredits.vue'
import { CHANNELS, CONCEPT, LOOP, SHELTER_ART, SLOGANS, SNAGS, TW } from './story'

// PROTOTYPE WB "Brand book" (overnight run, The World Plays Here r1).
// Refs: brand-identity case pages (Pentagram, Koto, Collins: the system laid out as numbered specs, mark / line /
// colour / frame) and Xbox's own guideline pages; a ballot paper for the slogans (the cross is the X); a snag/fix
// ledger from VFX breakdown notes; Apple-style stacked panels for the placements, each sliding over the last. Beats,
// each its own device: the system as a spec spread → the ballot, one box crossed → the ledger → the placements
// stacking on scroll. Only the loop moves. PLACEHOLDER: sizes, copy, swatch names, the stacking offsets.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const swatches = [
  { k: 'Space', c: '#050806' },
  { k: 'Xbox green', c: '#107c10' },
  { k: 'White', c: '#ffffff' },
]
const decks = CHANNELS.map((c, i) => ({ ...c, pic: c.pics[c.k === 'YouTube' ? 1 : c.k === 'Instagram' ? 1 : 0]!, i }))
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="wb">
      <!-- The system, as a brand-book spread -->
      <section class="sy" data-sheet-body data-sheet-block="system" aria-label="The system">
        <div data-build class="sy__grid">
          <figure class="sy__mark">
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
            <figcaption><b>01</b> Mark</figcaption>
          </figure>
          <div class="sy__side">
            <div class="sy__head">
              <h2 class="sy__title">
                {{ TW.title }}
              </h2>
              <p class="wb__text">
                {{ TW.brief }} {{ TW.year }}.
              </p>
            </div>
            <div class="sy__spec">
              <p class="wb__k">
                <b>02</b> Line
              </p>
              <p class="sy__line" aria-label="The World Plays Here, with a green line under Plays">
                The world<br><u>plays</u> here
              </p>
            </div>
            <div class="sy__spec">
              <p class="wb__k">
                <b>03</b> Colour
              </p>
              <ul class="sy__sw">
                <li v-for="s in swatches" :key="s.k">
                  <span :style="{ background: s.c }" aria-hidden="true" />{{ s.k }}
                </li>
              </ul>
            </div>
          </div>
          <figure class="sy__frame">
            <img :src="CONCEPT.src" :alt="CONCEPT.alt" :width="CONCEPT.w" :height="CONCEPT.h" decoding="async" loading="lazy">
            <figcaption><b>04</b> Frame</figcaption>
          </figure>
          <figure class="sy__poster">
            <img :src="SHELTER_ART.src" :alt="SHELTER_ART.alt" :width="SHELTER_ART.w" :height="SHELTER_ART.h" decoding="async" loading="lazy">
            <figcaption><b>05</b> Portrait</figcaption>
          </figure>
        </div>
      </section>

      <!-- The ballot: five lines, one cross -->
      <section class="bl" data-sheet-block="slogans" aria-label="Five slogans, one chosen">
        <div class="bl__head">
          <p class="wb__k">
            Five lines, one cross
          </p>
          <p class="wb__text">
            {{ TW.idea }}
          </p>
        </div>
        <ol class="bl__paper">
          <li v-for="s in SLOGANS" :key="s.t" :class="{ 'is-pick': s.pick }">
            <span class="bl__t">{{ s.t }}</span>
            <span class="bl__why">{{ s.why }}</span>
            <span class="bl__box" :aria-label="s.pick ? 'Chosen' : 'Not chosen'" role="img" />
          </li>
        </ol>
      </section>

      <!-- The ledger: snag, fix -->
      <section class="lg" data-sheet-block="fixes" aria-label="Snags and fixes">
        <div class="lg__row lg__th" aria-hidden="true">
          <span /><span>Snag</span><span>Fix</span>
        </div>
        <div v-for="(s, i) in SNAGS" :key="s.k" class="lg__row">
          <img :src="s.pic.src" :alt="s.pic.alt" :width="s.pic.w" :height="s.pic.h" loading="lazy" decoding="async">
          <p class="lg__k">
            <span class="lg__n">{{ String(i + 1).padStart(2, '0') }}</span>{{ s.k }}
          </p>
          <p class="lg__fix">
            {{ s.fix }}
          </p>
        </div>
      </section>

      <!-- The placements, stacking -->
      <section class="dk" data-sheet-block="placements" aria-label="Where it ran">
        <article v-for="d in decks" :key="d.k" class="dk__card" :style="{ '--i': d.i }">
          <figure>
            <img :src="d.pic.src" :alt="d.pic.alt" :width="d.pic.w" :height="d.pic.h" loading="lazy" decoding="async">
          </figure>
          <div class="dk__copy">
            <p class="dk__n">
              ×{{ d.n }}
            </p>
            <h3 class="dk__k">
              {{ d.k }}
            </h3>
            <p class="wb__text">
              {{ d.note }}
            </p>
          </div>
        </article>
      </section>

      <TwCredits />
    </div>
  </SheetShell>
</template>

<style scoped>
.wb__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.wb__k b,
.sy figcaption b {
  margin-right: 8px;
  font-weight: 600;
  color: var(--c-accent);
}

.wb__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

/* The spread */
.sy {
  animation: wb-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 420ms both;
}

@keyframes wb-in {
  from { opacity: 0; }
}

.sy__grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.sy__grid > * {
  min-width: 0;
  margin: 0;
  background: var(--c-bg);
}

.sy__mark {
  grid-column: 1 / 4;
  position: relative;
  aspect-ratio: 1;
}

.sy__side {
  grid-column: 4 / 7;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 1px;
  background: var(--rule);
}

.sy__side > * {
  background: var(--c-bg);
  padding: 20px 22px;
}

.sy__head {
  display: grid;
  gap: 10px;
}

.sy__title {
  margin: 0;
  font: 600 26px/1 var(--font-ui);
  letter-spacing: -0.02em;
  text-transform: uppercase;
}

.sy__spec {
  display: grid;
  align-content: start;
  gap: 14px;
}

.sy__line {
  margin: 0;
  font: 800 clamp(36px, 5.4vw, 64px)/0.95 var(--font-ui);
  letter-spacing: -0.03em;
  text-transform: uppercase;
}

.sy__line u {
  text-decoration: none;
  box-shadow: inset 0 -0.1em #107c10;
}

.sy__sw {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sy__sw li {
  display: grid;
  gap: 8px;
  font: 400 13px/1.3 var(--font-ui);
}

.sy__sw span {
  display: block;
  height: 44px;
  border: 1px solid var(--rule);
}

.sy__frame {
  grid-column: 1 / 5;
  position: relative;
}

.sy__poster {
  grid-column: 5 / 7;
  position: relative;
  overflow: hidden;
}

.sy__mark video,
.sy__frame img,
.sy__poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.sy__poster img {
  position: absolute;
  inset: 0;
  object-position: 50% 30%;
}

.sy figcaption {
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

/* The ballot */
.bl {
  border-top: 1px solid var(--rule);
  padding-bottom: 32px;
}

.bl__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 24px;
  align-items: baseline;
  padding: 22px 24px;
}

.bl__paper {
  margin: 0 24px;
  padding: 0;
  list-style: none;
  border: 1px solid var(--muted);
}

.bl__paper li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto 64px;
  gap: 20px;
  align-items: center;
  min-height: 72px;
  padding-left: 20px;
  border-top: 1px solid var(--rule);
}

.bl__paper li:first-child {
  border-top: 0;
}

.bl__t {
  font: 500 clamp(18px, 2.4vw, 26px)/1.15 var(--font-ui);
  letter-spacing: -0.01em;
}

.bl__why {
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

.bl__box {
  position: relative;
  align-self: stretch;
  border-left: 1px solid var(--muted);
}

.is-pick {
  background: color-mix(in srgb, #107c10 14%, transparent);
}

.is-pick .bl__t {
  font-weight: 700;
}

.is-pick .bl__why {
  color: var(--c-fg);
}

/* The cross: two strokes, drawn as the ballot scrolls in */
.is-pick .bl__box::before,
.is-pick .bl__box::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 46px;
  height: 5px;
  margin: -2.5px 0 0 -23px;
  border-radius: 3px;
  background: #3ec43e;
  rotate: 45deg;
}

.is-pick .bl__box::after {
  rotate: -45deg;
}

@supports (animation-timeline: view()) {
  .is-pick .bl__box::before,
  .is-pick .bl__box::after {
    animation: wb-stroke linear both;
    animation-timeline: view();
    animation-range: entry 80% cover 40%;
  }
}

@keyframes wb-stroke {
  from { transform: scaleX(0); }
}

/* The ledger */
.lg {
  border-top: 1px solid var(--rule);
}

.lg__row {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
  padding: 12px 24px;
  border-top: 1px solid var(--rule);
}

.lg__th {
  padding-block: 12px;
  border-top: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.lg__row img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  background: #111;
}

.lg__row p {
  margin: 0;
  font: 400 15px/1.45 var(--font-ui);
}

.lg__n {
  margin-right: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.lg__fix {
  color: var(--muted);
}

.lg__fix::before {
  content: '→ ';
  color: var(--c-fg);
}

/* The placements: each panel sticks under the header and the next slides over it */
.dk {
  border-top: 1px solid var(--rule);
}

.dk__card {
  position: sticky;
  top: calc(var(--i) * 14px - 16px); /* the layer padding: just under the header, as MB */
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  min-height: min(560px, 70svh);
  background: var(--c-bg);
  border-top: 1px solid var(--rule);
}

.dk__card figure {
  margin: 0;
  overflow: hidden;
  background: #e9e9e9;
}

.dk__card img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  scale: 1.18;
}

.dk__copy {
  display: grid;
  align-content: end;
  gap: 12px;
  padding: 24px;
}

.dk__n {
  margin: 0;
  font: 600 56px/1 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.dk__k {
  margin: 0;
  font: 600 28px/1.05 var(--font-ui);
  letter-spacing: -0.02em;
}

@media (prefers-reduced-motion: reduce) {
  .sy { animation-duration: 1ms; }

  .is-pick .bl__box::before,
  .is-pick .bl__box::after { animation: none; }
}

@media (max-width: 720px) {
  .sy__mark,
  .sy__side,
  .sy__frame {
    grid-column: 1 / -1;
  }

  .sy__poster {
    grid-column: 1 / -1;
    aspect-ratio: 4 / 3;
  }

  .sy__side > * {
    padding: 18px 16px;
  }

  .sy__head {
    padding-right: 52px !important;
  }

  .bl__head {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 22px 16px 16px;
  }

  .bl__paper {
    margin: 0 16px;
  }

  .bl__paper li {
    grid-template-columns: minmax(0, 1fr) 52px;
    gap: 4px 12px;
    padding: 12px 0 12px 14px;
  }

  .bl__why {
    grid-row: 2;
  }

  .bl__box {
    grid-row: 1 / 3;
    grid-column: 2;
  }

  .lg__row {
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 6px 14px;
    padding: 12px 16px;
  }

  .lg__th {
    display: none !important;
  }

  .lg__row img {
    grid-row: 1 / 3;
  }

  .dk__card {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto;
    min-height: 0;
  }

  .dk__card figure {
    aspect-ratio: 4 / 3;
  }

  .dk__copy {
    padding: 16px 16px 22px;
  }

  .dk__n {
    font-size: 40px;
  }
}
</style>
