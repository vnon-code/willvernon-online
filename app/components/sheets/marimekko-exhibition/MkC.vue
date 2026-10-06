<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, INFO, MK, OUT, PB, type Pic, TYPEWRITER } from './story'

// PROTOTYPE MkC "Rulebook" (overnight run, Marimekko Exhibition r1). The system told as a standards manual: the
// first view is Will's own A3 system sheet beside the four billboards → 01 four rules, each a huge typewriter
// numeral, one line, and its evidence as a strip of four → 02 a ledger of problem → fix, the problem struck through,
// each with its book page → 03 the loop: the animation's four beats as a numbered track over two frames and the
// process page → the mural, flags and wall as a full-bleed triptych.
// Refs: the NASA Graphics Standards Manual reissue (numbered rules, one example per rule), Experimental Jetset's
// identity pages (rule, then the thing), Will's A3 visual-system sheet. No scroll effects at all: hover only.
// PLACEHOLDER: sizes, copy, rule wording.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mkc', [
  { id: 'rules', label: 'The rules' },
  { id: 'fixes', label: 'Problems' },
  { id: 'loop', label: 'The loop' },
])

const RULES: { t: string, pics: Pic[] }[] = [
  { t: MK.fours, pics: ARTISTS.map(a => a.ticket) },
  { t: MK.colour, pics: ARTISTS.map(a => a.tape) },
  { t: MK.logo, pics: [PB.ideas, PB.logo, PB.system, OUT.frameLogo] },
  { t: MK.type, pics: [PB.type, ARTISTS[0]!.poster, ARTISTS[2]!.poster, ARTISTS[3]!.poster] },
]
const FIXES = [
  { bad: 'Low-resolution source patterns', fix: MK.redraw, p: PB.artists },
  { bad: 'Posters too small to read', fix: MK.posters, p: ARTISTS[1]!.poster },
  { bad: 'Four logos, four designers each', fix: MK.logoIdeas, p: PB.logo },
]
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div class="mkc" :style="{ '--tw': TYPEWRITER }">
      <SheetHead :title="MK.title" :hook="MK.hook" :info="INFO">
        <template #before>
          <div class="sp">
            <img class="sp__sheet" :src="OUT.system.src" :srcset="OUT.system.srcset" sizes="(max-width: 720px) 100vw, 30vw" :alt="OUT.system.alt" :width="OUT.system.w" :height="OUT.system.h" loading="lazy" decoding="async">
            <ul class="sp__bb" aria-label="The four billboards">
              <li v-for="a in ARTISTS" :key="a.id">
                <img :src="a.billboard.src" :srcset="a.billboard.srcset" sizes="(max-width: 720px) 50vw, 35vw" :alt="a.billboard.alt" :width="a.billboard.w" :height="a.billboard.h" loading="lazy" decoding="async">
              </li>
            </ul>
          </div>
        </template>
        <p class="mkc__brief">
          {{ MK.brief }}
        </p>
      </SheetHead>

      <!-- 01 The rules: numeral, one line, evidence in fours -->
      <section class="ru" v-bind="sec('rules')" data-sheet-block="rules">
        <div class="ru__top">
          <SheetSectionNo id="rules" />
        </div>
        <ol class="ru__list">
          <li v-for="(r, i) in RULES" :key="i" class="ru__rule">
            <div class="ru__head">
              <span class="ru__n" aria-hidden="true">{{ i + 1 }}</span>
              <p class="ru__t">
                {{ r.t }}
              </p>
            </div>
            <ul class="ru__ev">
              <li v-for="p in r.pics" :key="p.src" :class="{ 'is-page': p.w / p.h > 1.5 }">
                <img :src="p.src" :srcset="p.srcset" sizes="(max-width: 720px) 50vw, 17vw" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
              </li>
            </ul>
          </li>
        </ol>
      </section>

      <!-- 02 Problems: a ledger, the problem struck through -->
      <section class="lg" v-bind="sec('fixes')" data-sheet-block="fixes">
        <div class="lg__top">
          <SheetSectionNo id="fixes" />
        </div>
        <ul class="lg__rows">
          <li v-for="f in FIXES" :key="f.bad" class="lg__row">
            <p class="lg__bad">
              <s>{{ f.bad }}</s>
            </p>
            <p class="lg__fix">
              {{ f.fix }}
            </p>
            <img :src="f.p.src" :srcset="f.p.srcset" sizes="(max-width: 720px) 100vw, 28vw" :alt="f.p.alt" :width="f.p.w" :height="f.p.h" loading="lazy" decoding="async">
          </li>
        </ul>
      </section>

      <!-- 03 The loop: four beats as a track, then the frames -->
      <section class="lp" v-bind="sec('loop')" data-sheet-block="loop">
        <div class="lp__top">
          <SheetSectionNo id="loop" />
          <p class="mkc__text">
            {{ MK.anim }}
          </p>
        </div>
        <ol class="lp__track">
          <li v-for="(s, i) in MK.animSteps" :key="s">
            <span>{{ String(i + 1).padStart(2, '0') }}</span>{{ s }}
          </li>
        </ol>
        <div class="lp__frames">
          <img :src="OUT.frameStrips.src" :srcset="OUT.frameStrips.srcset" sizes="(max-width: 720px) 100vw, 33vw" :alt="OUT.frameStrips.alt" :width="OUT.frameStrips.w" :height="OUT.frameStrips.h" loading="lazy" decoding="async">
          <img :src="OUT.frameLogo.src" :srcset="OUT.frameLogo.srcset" sizes="(max-width: 720px) 100vw, 33vw" :alt="OUT.frameLogo.alt" :width="OUT.frameLogo.w" :height="OUT.frameLogo.h" loading="lazy" decoding="async">
          <img :src="PB.anim.src" :srcset="PB.anim.srcset" sizes="(max-width: 720px) 100vw, 33vw" :alt="PB.anim.alt" :width="PB.anim.w" :height="PB.anim.h" loading="lazy" decoding="async">
        </div>
      </section>

      <!-- Outcome: a full-bleed triptych (un-numbered) -->
      <div class="tr" data-sheet-block="out">
        <img :src="OUT.mural.src" :srcset="OUT.mural.srcset" sizes="(max-width: 720px) 100vw, 34vw" :alt="OUT.mural.alt" :width="OUT.mural.w" :height="OUT.mural.h" loading="lazy" decoding="async">
        <img :src="OUT.flags.src" :srcset="OUT.flags.srcset" sizes="(max-width: 720px) 50vw, 33vw" :alt="OUT.flags.alt" :width="OUT.flags.w" :height="OUT.flags.h" loading="lazy" decoding="async">
        <img :src="OUT.wall.src" :srcset="OUT.wall.srcset" sizes="(max-width: 720px) 50vw, 33vw" :alt="OUT.wall.alt" :width="OUT.wall.w" :height="OUT.wall.h" loading="lazy" decoding="async">
      </div>

      <SheetCredits :items="MK.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mkc__text,
.mkc__brief {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.mkc__brief {
  padding: 0 24px 28px;
}

/* First view: the system sheet beside the four billboards */
.sp {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 7fr);
  background: #fafafa;
}

.sp__sheet {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: 50% 0;
}

.sp__bb {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.sp__bb img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

/* 01 The rules */
.ru {
  border-top: 1px solid var(--rule);
}

.ru__top {
  padding: 28px 24px 12px;
}

.ru__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ru__rule {
  display: grid;
  grid-template-columns: minmax(0, 4fr) minmax(0, 8fr);
  border-top: 1px solid var(--rule);
}

.ru__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  padding: 20px 24px;
}

.ru__n {
  font: 700 clamp(64px, 7vw, 112px)/0.8 var(--tw);
  color: var(--c-accent);
}

.ru__t {
  margin: 0;
  padding-top: 4px;
  font: 400 17px/1.45 var(--font-ui);
  color: var(--c-fg);
}

.ru__ev {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
}

.ru__ev img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  transition: scale 400ms cubic-bezier(0.23, 1, 0.32, 1);
}

.ru__ev li {
  overflow: hidden;
}

/* Book pages and frames sit whole on white, not cropped */
.ru__ev .is-page img {
  object-fit: contain;
}

.ru__ev li:hover img {
  scale: 1.05;
}

/* 02 The ledger */
.lg {
  border-top: 1px solid var(--rule);
  background: #f4f1ea;
  color: #111;
  --c-fg: #111;
  --muted: rgb(0 0 0 / 0.65);
}

.lg__top {
  padding: 28px 24px 12px;
}

.lg__rows {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lg__row {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 4fr) minmax(0, 4fr);
  gap: 24px;
  align-items: start;
  padding: 20px 24px;
  border-top: 1px solid rgb(0 0 0 / 0.15);
}

.lg__bad {
  margin: 0;
  font: 400 18px/1.35 var(--tw);
}

.lg__bad s {
  text-decoration-color: #d4001e;
  text-decoration-thickness: 2px;
}

.lg__fix {
  margin: 0;
  font: 400 15px/1.55 var(--font-ui);
}

.lg__row img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  object-position: 50% 30%;
  background: #fff;
  border: 1px solid rgb(0 0 0 / 0.15);
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

.lp__track {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.lp__track li {
  position: relative;
  padding: 14px 24px 16px;
  font: 400 14px/1.4 var(--font-ui);
  color: var(--c-fg);
}

.lp__track li + li {
  border-left: 1px solid var(--rule);
}

/* The loop: the last beat points back to the first */
.lp__track li:last-child::after {
  content: '↺';
  position: absolute;
  top: 12px;
  right: 16px;
  color: var(--c-accent);
}

.lp__track span {
  display: block;
  margin-bottom: 6px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.lp__frames {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  background: #fff;
}

.lp__frames img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

/* The triptych */
.tr {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.tr img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

@media (prefers-reduced-motion: reduce) {
  .ru__ev img { transition: none; }
}

@media (max-width: 720px) {
  .mkc__brief {
    padding: 0 16px 22px;
  }

  .sp {
    grid-template-columns: minmax(0, 1fr);
  }

  .sp__sheet {
    display: none;
  }

  .ru__top,
  .lg__top,
  .lp__top {
    padding: 22px 52px 18px 16px;
  }

  .ru__rule {
    grid-template-columns: minmax(0, 1fr);
  }

  .ru__head {
    padding: 18px 16px;
  }

  .ru__n {
    font-size: 56px;
  }

  .ru__ev {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .ru__ev img {
    aspect-ratio: 1;
  }

  .lg__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 18px 16px;
  }

  .lp__track {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lp__track li {
    padding: 12px 16px 14px;
  }

  .lp__track li:nth-child(3) {
    border-left: 0;
  }

  .lp__track li:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }

  .lp__frames {
    grid-template-columns: minmax(0, 1fr);
  }

  .tr {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .tr img:first-child {
    grid-column: 1 / -1;
    aspect-ratio: 3 / 2;
  }
}
</style>
