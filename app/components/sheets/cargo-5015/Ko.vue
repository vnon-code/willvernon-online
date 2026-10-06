<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { BLENDER, FRONT_FINAL, FRONTS, FRONTS_LINE, GROUNDS, HOOK, INFO, MASK, MASK_LINE, MASKED, MOCK, ROUNDS, TITLE } from './story'

// PROTOTYPE Ko "Knockout" (overnight curation run, cargo-5015). An identity piece, so the page is a mark sheet:
// the outcome first (the card on concrete and polystyrene) → 01 Eight to one: the mark's rounds as a ladder, a big
// round number on the left, the round in view lit and the rest dimmed → 02 Mark as mask: one stage, five grounds
// from page 17 (the mark on texture, red, black; then texture or a gradient map inside it) → 03 Five fronts: four
// options struck through, the kept one big. No card back: it shows Will's phone number and email.
// Refs: Pentagram and Koto identity case studies (mark construction, then applications), brand-guideline
// "do / don't" grids. PLACEHOLDER: sizes, copy, the red.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('ko', [
  { id: 'rounds', label: 'Eight to one' },
  { id: 'mask', label: 'Mark as mask' },
  { id: 'fronts', label: 'Five fronts' },
])

// The credits come from the story's own info (no separate credits exist yet for this project)
const credits = [{ k: 'Module', v: INFO.module }, { k: 'Tools', v: INFO.tools }]

// 01 The round in view is lit
const lit = ref(0)
const roundEls = ref<HTMLElement[]>([])
let io: IntersectionObserver | undefined
onMounted(() => {
  io = new IntersectionObserver((es) => {
    for (const e of es) if (e.isIntersecting) lit.value = Number((e.target as HTMLElement).dataset.i)
  }, { rootMargin: '-40% 0px -40% 0px' })
  roundEls.value.forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

// 02 The ground
const ground = ref(GROUNDS[0]!.id)
const g = computed(() => GROUNDS.find(x => x.id === ground.value)!)
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="ko">
      <SheetHead :title="TITLE" :hook="HOOK" :info="INFO">
        <template #before>
          <div class="ko__out">
            <img class="ko__wide" :src="MOCK.steps.src" :alt="MOCK.steps.alt" :width="MOCK.steps.w" :height="MOCK.steps.h" decoding="async">
            <img :src="MOCK.tray.src" :alt="MOCK.tray.alt" :width="MOCK.tray.w" :height="MOCK.tray.h" decoding="async">
            <img :src="MOCK.box.src" :alt="MOCK.box.alt" :width="MOCK.box.w" :height="MOCK.box.h" decoding="async">
          </div>
        </template>
      </SheetHead>

      <!-- 01 Eight to one: a ladder of rounds -->
      <section class="ko__sec" v-bind="sec('rounds')" data-sheet-block="rounds">
        <SheetSectionNo id="rounds" />
        <ol class="ld">
          <li
            v-for="(r, i) in ROUNDS"
            :key="r.n"
            ref="roundEls"
            :data-i="i"
            class="ld__row"
            :class="{ on: lit === i, fin: r.label === 'Final' }"
          >
            <div class="ld__n" aria-hidden="true">
              {{ r.n }}
            </div>
            <div class="ld__txt">
              <span class="ko__k">{{ r.label }}</span>
              <p v-if="r.line">
                {{ r.line }}
              </p>
            </div>
            <figure class="ld__fig">
              <img :src="r.p.src" :alt="r.p.alt" :width="r.p.w" :height="r.p.h" loading="lazy" decoding="async">
            </figure>
          </li>
        </ol>
      </section>

      <!-- 02 Mark as mask: one stage, five grounds -->
      <section class="ko__sec" v-bind="sec('mask')" data-sheet-block="mask">
        <SheetSectionNo id="mask" />
        <div class="mk">
          <div class="mk__stage" :style="{ background: g.plate }" role="img" :aria-label="`The mark, ${g.label.toLowerCase()}`">
            <div class="mk__mark" :style="{ background: g.fill, maskImage: `url(${MASK})`, webkitMaskImage: `url(${MASK})` }" />
          </div>
          <div class="mk__side">
            <div class="mk__chips" role="group" aria-label="Ground">
              <button
                v-for="x in GROUNDS"
                :key="x.id"
                type="button"
                class="mk__chip"
                :aria-pressed="ground === x.id"
                @click="ground = x.id"
              >
                {{ x.label }}
              </button>
            </div>
            <p class="ko__text">
              {{ MASK_LINE }}
            </p>
          </div>
        </div>
        <figure class="mk__row">
          <img :src="BLENDER.src" :alt="BLENDER.alt" :width="BLENDER.w" :height="BLENDER.h" loading="lazy" decoding="async">
          <figcaption class="ko__cap">
            {{ BLENDER.line }}
          </figcaption>
        </figure>
        <figure class="mk__row">
          <img :src="MASKED.src" :alt="MASKED.alt" :width="MASKED.w" :height="MASKED.h" loading="lazy" decoding="async">
          <figcaption class="ko__cap">
            {{ MASKED.line }}
          </figcaption>
        </figure>
      </section>

      <!-- 03 Five fronts: four cut, one kept -->
      <section class="ko__sec" v-bind="sec('fronts')" data-sheet-block="fronts">
        <SheetSectionNo id="fronts" />
        <div class="fr">
          <ul class="fr__cut">
            <li v-for="f in FRONTS" :key="f.src">
              <img :src="f.src" :alt="f.alt" :width="f.w" :height="f.h" loading="lazy" decoding="async">
              <span class="fr__x" aria-hidden="true" />
              <span class="ko__k fr__tag">Cut</span>
            </li>
          </ul>
          <figure class="fr__kept">
            <img :src="FRONT_FINAL.src" :alt="FRONT_FINAL.alt" :width="FRONT_FINAL.w" :height="FRONT_FINAL.h" loading="lazy" decoding="async">
            <figcaption>
              <span class="ko__k">Kept</span>
              <p class="ko__text">
                {{ FRONTS_LINE }}
              </p>
            </figcaption>
          </figure>
        </div>
      </section>

      <SheetCredits :items="credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.ko img {
  display: block;
  width: 100%;
  height: auto;
}

.ko figure {
  margin: 0;
}

.ko__k {
  font: 500 11px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.ko__text {
  margin: 0;
  max-width: 44ch;
  font: 400 16px/1.5 var(--font-ui);
}

.ko__cap {
  margin: 10px 0 0;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
}

/* First view: the outcome, one wide and two square-ish */
.ko__out {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  background: #000;
}

.ko__out img {
  height: 100% !important;
  object-fit: cover;
  min-height: 0;
}

.ko__wide {
  grid-row: 1 / 3;
}

.ko__out img + img {
  border-left: 1px solid #000;
}

.ko__out img:last-child {
  border-top: 1px solid #000;
}

/* Sections: a rule on top, padding only */
.ko__sec {
  padding: 28px 24px 40px;
  border-top: 1px solid var(--rule);
}

/* 01 The ladder */
.ld {
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.ld__row {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr) minmax(0, 2fr);
  gap: 0 32px;
  align-items: start;
  padding: 28px 0;
  border-top: 1px solid var(--rule);
  opacity: 0.32;
  transition: opacity 0.3s ease;
}

.ld__row.on {
  opacity: 1;
}

.ld__n {
  font: 700 clamp(64px, 10vw, 148px) / 0.82 var(--font-ui);
  letter-spacing: -0.04em;
}

.ld__txt p {
  margin: 10px 0 0;
  font: 400 16px/1.5 var(--font-ui);
}

.ld__fig {
  background: #fff;
}

.ld__row.fin .ld__n {
  color: var(--c-accent, var(--c-fg));
}

/* 02 The mask stage */
.mk {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 0 32px;
  margin-top: 20px;
}

.mk__stage {
  display: grid;
  place-items: center;
  aspect-ratio: 4 / 3;
  transition: background-color 0.2s ease;
}

.mk__mark {
  width: 58%;
  aspect-ratio: 808 / 577;
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.mk__side {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.mk__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mk__chip {
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: transparent;
  color: var(--c-fg);
  font: 500 13px/1 var(--font-ui);
  cursor: pointer;
}

.mk__chip[aria-pressed='true'] {
  background: var(--c-fg);
  color: var(--c-bg);
}

.mk__chip:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.mk__row {
  margin-top: 28px !important;
}

.mk__row img {
  background: #fff;
}

/* 03 Fronts: four struck, one kept */
.fr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
  gap: 0 32px;
  margin-top: 20px;
}

.fr__cut {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  align-content: start;
}

.fr__cut li {
  position: relative;
}

.fr__cut img {
  opacity: 0.45;
  filter: grayscale(1);
}

.fr__x {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, transparent calc(50% - 1px), var(--c-accent, #c8102e) calc(50% - 1px), var(--c-accent, #c8102e) calc(50% + 1px), transparent calc(50% + 1px));
}

.fr__tag {
  position: absolute;
  left: 8px;
  top: 8px;
}

.fr__kept figcaption {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .ld__row,
  .mk__stage {
    transition: none;
  }
}

@media (max-width: 720px) {
  .ko__sec {
    padding: 22px 16px 28px;
  }

  .ko__out {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto;
  }

  .ko__wide {
    grid-row: auto;
    grid-column: 1 / 3;
  }

  .ko__out img:last-child {
    border-top: 0;
  }

  .ld__row {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 12px 16px;
    padding: 20px 0;
  }

  .ld__n {
    font-size: 56px;
  }

  .ld__fig {
    grid-column: 1 / 3;
  }

  .mk,
  .fr {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
}
</style>
