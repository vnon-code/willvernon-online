<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, INFO, LOOP, MK, MK2, OUT, PB, type Pic, TYPEWRITER } from './story'

// MkD "Catalogue" (Marimekko Exhibition r2; the overnight run's top scorer). The Sheet reads like the show's own catalogue:
// the first view is the system as a 16-piece matrix (four designers x poster, floor tape, billboard, ticket) that
// re-sorts by designer or by piece (Vue's TransitionGroup moves the tiles, transform only), so the "everything in
// fours" rule reads both ways → 01 research pages hung on a line, each with a museum wall label (page, title, where,
// one line) → 02 the problems as an errata slip ("for … read …") beside the four A3 posters that came out of them →
// 03 the 22 s loop full width, playing only in view → the mural, then the flags and the wall, all uncropped.
// Refs: Pentagram's "Mushrooms" exhibition identity (a cataloguing grid as the system), Mucho's MACBA system
// (modular grid, black and white, focus on the work), Grafik's "Human Nature" (labels placed on a grid), museum
// tombstone labels and printed catalogue errata slips. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mkd', [
  { id: 'research', label: 'Research' },
  { id: 'errata', label: 'Errata' },
  { id: 'loop', label: 'The loop' },
])

// The matrix: 16 pieces, sorted by designer (rows = designers) or by piece (rows = pieces)
const KINDS = ['poster', 'tape', 'billboard', 'ticket'] as const
const TILES = ARTISTS.flatMap((a, ai) => KINDS.map((k, ki) => ({ key: `${a.id}-${k}`, a, p: a[k], ai, ki })))
const by = ref<'artist' | 'piece'>('artist')
const tiles = computed(() => by.value === 'artist' ? TILES : [...TILES].sort((x, y) => x.ki - y.ki || x.ai - y.ai))

const LABELS: { p: Pic, no: string, t: string, where?: string, line: string }[] = [
  { p: PB.trip, no: 'p.19', t: 'Field trip', where: MK2.tripWhere, line: MK2.trip },
  { p: PB.type, no: 'p.26', t: 'Typography', where: MK2.typeAgainst, line: MK.type },
  { p: PB.wayfinding, no: 'p.33', t: 'Wayfinding', line: MK2.wayfinding },
]
const ratio = (p: Pic) => p.w / p.h
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="mkd" :style="{ '--tw': TYPEWRITER }">
      <SheetHead :title="MK.title" :hook="MK.hook" :info="INFO">
        <template #before>
          <div class="mx">
            <TransitionGroup tag="ul" name="mkd-sort" class="mx__grid" aria-label="The system: four designers, four pieces each">
              <li v-for="x in tiles" :key="x.key" class="mx__tile" :style="{ '--dp': x.a.deep }">
                <img :src="x.p.src" :srcset="x.p.srcset" sizes="25vw" :alt="x.p.alt" :width="x.p.w" :height="x.p.h" loading="lazy" decoding="async">
              </li>
            </TransitionGroup>
            <div class="mx__bar">
              <div class="mx__sort" role="group" aria-label="Sort the pieces">
                <button type="button" :aria-pressed="by === 'artist'" @click="by = 'artist'">
                  By designer
                </button>
                <button type="button" :aria-pressed="by === 'piece'" @click="by = 'piece'">
                  By piece
                </button>
              </div>
              <p class="mx__key" aria-live="polite">
                {{ by === 'artist' ? MK2.byArtist : MK2.byPiece }}
              </p>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Research: pages hung on a line, each with its wall label -->
      <section class="hg" v-bind="sec('research')" data-sheet-block="research">
        <div class="hg__top">
          <SheetSectionNo id="research" />
        </div>
        <ul class="hg__list">
          <li v-for="l in LABELS" :key="l.no" class="hg__item">
            <img :src="l.p.src" :srcset="l.p.srcset" sizes="(max-width: 720px) 100vw, 64vw" :alt="l.p.alt" :width="l.p.w" :height="l.p.h" loading="lazy" decoding="async">
            <div class="hg__label">
              <span class="hg__no">{{ l.no }}</span>
              <b class="hg__t">{{ l.t }}</b>
              <i v-if="l.where" class="hg__where">{{ l.where }}</i>
              <p class="hg__line">
                {{ l.line }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 02 Errata: for … read …, beside the four A3 posters -->
      <section class="er" v-bind="sec('errata')" data-sheet-block="errata">
        <div class="er__top">
          <SheetSectionNo id="errata" />
        </div>
        <div class="er__body">
          <dl class="er__slip">
            <div v-for="e in MK2.errata" :key="e.p" class="er__row">
              <dt>{{ e.p }}</dt>
              <dd><i>For</i> {{ e.for }} <i>read</i> {{ e.read }}.</dd>
            </div>
          </dl>
          <ul class="er__posters" aria-label="The four A3 posters">
            <li v-for="a in ARTISTS" :key="a.id">
              <img :src="a.poster.src" :srcset="a.poster.srcset" sizes="(max-width: 720px) 50vw, 15vw" :alt="a.poster.alt" :width="a.poster.w" :height="a.poster.h" loading="lazy" decoding="async">
            </li>
          </ul>
        </div>
      </section>

      <!-- 03 The loop, full width -->
      <section class="lp" v-bind="sec('loop')" data-sheet-block="loop">
        <div class="lp__top">
          <SheetSectionNo id="loop" />
          <p class="mkd__text">
            {{ MK.anim }}
          </p>
        </div>
        <video
          class="lp__video"
          :src="LOOP.src"
          :poster="LOOP.poster"
          :width="LOOP.w"
          :height="LOOP.h"
          :aria-label="LOOP.alt"
          muted
          loop
          playsinline
          preload="none"
          data-in-view
        />
      </section>

      <!-- Outcome: the mural, then the flags and the wall, all whole (un-numbered) -->
      <div class="ot" data-sheet-block="out">
        <img class="ot__mural" :src="OUT.mural.src" :srcset="OUT.mural.srcset" sizes="100vw" :alt="OUT.mural.alt" :width="OUT.mural.w" :height="OUT.mural.h" loading="lazy" decoding="async">
        <div class="ot__pair">
          <img v-for="p in [OUT.flags, OUT.wall]" :key="p.src" :src="p.src" :srcset="p.srcset" sizes="(max-width: 720px) 100vw, 50vw" :alt="p.alt" :width="p.w" :height="p.h" :style="{ flexGrow: ratio(p) }" loading="lazy" decoding="async">
        </div>
      </div>

      <SheetCredits :items="MK.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mkd__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* First view: the 16-piece matrix, each piece whole on white with its designer's colour as a foot rule */
.mx__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
}

.mx__tile {
  border-bottom: 4px solid var(--dp);
}

.mx__tile img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: contain;
}

.mkd-sort-move {
  transition: transform 560ms cubic-bezier(0.65, 0, 0.35, 1);
}

.mx__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 20px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--rule);
}

.mx__sort {
  display: flex;
  border: 1px solid var(--rule);
}

.mx__sort button {
  min-height: 36px;
  padding: 0 14px;
  border: 0;
  background: none;
  font: 500 13px/1 var(--font-ui);
  color: var(--muted);
  cursor: pointer;
}

.mx__sort button + button {
  border-left: 1px solid var(--rule);
}

.mx__sort button[aria-pressed='true'] {
  background: var(--c-fg);
  color: var(--c-bg);
}

.mx__sort button:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.mx__key {
  margin: 0;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

/* 01 Research: hung on one line, a wall label beside each page */
.hg {
  border-top: 1px solid var(--rule);
}

.hg__top {
  padding: 28px 24px 20px;
}

.hg__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hg__item {
  display: grid;
  grid-template-columns: minmax(0, 8fr) minmax(0, 4fr);
  align-items: center;
  border-top: 1px solid var(--rule);
}

.hg__item img {
  display: block;
  width: 100%;
  height: auto;
  background: #fff;
}

/* The label's top rule sits on the page's centre line, like the hanging line in a gallery */
.hg__label {
  display: grid;
  gap: 4px;
  margin-right: 24px;
  padding: 14px 0 0 24px;
  border-top: 1px solid var(--c-fg);
  font: 400 14px/1.45 var(--font-ui);
  color: var(--muted);
}

.hg__no {
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.hg__t {
  font: 600 17px/1.3 var(--font-ui);
  color: var(--c-fg);
}

.hg__line {
  margin: 6px 0 0;
  max-width: 34ch;
  color: var(--c-fg);
}

/* 02 Errata: a white slip beside the four A3 posters */
.er {
  border-top: 1px solid var(--rule);
}

.er__top {
  padding: 28px 24px 20px;
}

.er__body {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: start;
  border-top: 1px solid var(--rule);
}

.er__slip {
  margin: 24px;
  padding: 20px 22px;
  background: #fff;
  color: #111;
}

.er__row {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
}

.er__row + .er__row {
  border-top: 1px solid rgb(0 0 0 / 0.15);
}

.er__slip dt {
  font: 500 13px/1.5 var(--font-ui);
  font-variant-numeric: tabular-nums;
  color: #d4001e;
}

.er__slip dd {
  margin: 0;
  font: 400 15px/1.5 var(--font-ui);
}

.er__slip i {
  color: rgb(0 0 0 / 0.55);
}

.er__posters {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.er__posters img {
  display: block;
  width: 100%;
  height: auto;
}

/* 03 The loop */
.lp {
  border-top: 1px solid var(--rule);
}

.lp__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 20px;
}

.lp__video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #fff;
}

/* Outcome */
.ot {
  border-top: 1px solid var(--rule);
}

.ot__mural {
  display: block;
  width: 100%;
  height: auto;
}

.ot__pair {
  display: flex;
  align-items: flex-start;
}

.ot__pair img {
  display: block;
  flex: 1 1 0;
  min-width: 0;
  height: auto;
}

@media (prefers-reduced-motion: reduce) {
  .mkd-sort-move { transition: none; }
}

@media (max-width: 720px) {
  .mx__bar {
    padding: 12px 16px;
  }

  .hg__top,
  .er__top,
  .lp__top {
    padding: 22px 52px 18px 16px;
  }

  .hg__item {
    grid-template-columns: minmax(0, 1fr);
  }

  .hg__label {
    margin: 0 16px;
    padding: 12px 0 18px;
  }

  .er__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .er__slip {
    margin: 16px;
  }

  .er__posters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ot__pair {
    flex-direction: column;
  }

  .ot__pair img {
    flex: none;
    width: 100%;
  }
}
</style>
