<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, BEATS, INFO, LOOP, MK, MK2, OUT, PB, type Pic, TYPEWRITER } from './story'

// PROTOTYPE MkC2 "Rulebook, refined" (overnight run, Marimekko Exhibition r2). MkC with the r1 judges' fixes:
// the work is never cropped (contain, or each piece at its own ratio); the brief folds into rule 1; rule 2 (one
// colour per room) is the moment: the four floor tapes across the full width over a four-colour tape line that
// draws as it scrolls in; rule 3 is one legible book page; the ledger sits on near-black; the loop is the real
// video (plays only in view) over a timeline of its six beats, the one on screen lit; the outcome is a triptych at
// each photo's own ratio. Refs as MkC (NASA Graphics Standards Manual reissue, Experimental Jetset identity pages,
// Will's A3 sheet), plus video-editor timelines for the loop. PLACEHOLDER: sizes, copy, beat times (read off frames).
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mkc2', [
  { id: 'rules', label: 'The rules' },
  { id: 'fixes', label: 'Problems' },
  { id: 'loop', label: 'The loop' },
])

// Each rule: its line, its evidence and the evidence's tile ratio (the pieces' own, so nothing is cropped)
type Rule = { t: string, pics: Pic[], ar?: string, kind: 'four' | 'wide' | 'one', cols?: number }
const RULES: Rule[] = [
  { t: MK.fours, pics: ARTISTS.map(a => a.ticket), ar: '4 / 3', kind: 'four', cols: 2 },
  { t: MK.colour, pics: ARTISTS.map(a => a.tape), kind: 'wide' },
  { t: MK.logo, pics: [PB.logo], kind: 'one' },
  { t: MK.type, pics: ARTISTS.map(a => a.poster), ar: '1358 / 1920', kind: 'four' },
]
const FIXES = [
  { bad: 'Low-resolution source patterns', fix: MK.redraw, p: PB.artists },
  { bad: 'Posters too small to read', fix: MK.posters, p: ARTISTS[1]!.poster },
  { bad: 'Four logos, four designers each', fix: MK.logoIdeas, p: PB.logo },
]
const TAPE = ARTISTS.map(a => a.deep)

// The loop's timeline: each beat's share of the 22 s, and the beat on screen now
const SPANS = BEATS.map((b, i) => (BEATS[i + 1]?.t ?? LOOP.dur) - b.t)
const now = ref(0)
function onTime(e: Event) {
  const t = (e.target as HTMLVideoElement).currentTime
  let i = 0
  while (i < BEATS.length - 1 && t >= BEATS[i + 1]!.t) i++
  if (i !== now.value) now.value = i
}
const fmt = (t: number) => `00:${String(Math.floor(t)).padStart(2, '0')}`
const ratio = (p: Pic) => p.w / p.h
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
      </SheetHead>

      <!-- 01 The rules: numeral, one line, evidence -->
      <section class="ru" v-bind="sec('rules')" data-sheet-block="rules">
        <div class="ru__top">
          <SheetSectionNo id="rules" />
        </div>
        <ol class="ru__list">
          <li v-for="(r, i) in RULES" :key="i" class="ru__rule" :class="`ru__rule--${r.kind}`">
            <div class="ru__head">
              <span class="ru__n" aria-hidden="true">{{ i + 1 }}</span>
              <div>
                <p class="ru__t">
                  {{ r.t }}
                </p>
                <p v-if="i === 0" class="ru__brief">
                  {{ MK.brief }}
                </p>
              </div>
            </div>
            <div v-if="r.kind === 'wide'" class="ru__wide">
              <ul class="ru__tapes">
                <li v-for="p in r.pics" :key="p.src">
                  <img :src="p.src" :srcset="p.srcset" sizes="(max-width: 720px) 50vw, 25vw" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
                </li>
              </ul>
              <div class="ru__line" aria-hidden="true">
                <span v-for="c in TAPE" :key="c" :style="{ background: c }" />
              </div>
            </div>
            <ul v-else class="ru__ev" :class="{ 'ru__ev--one': r.kind === 'one' }" :style="{ '--ar': r.ar ?? 'auto', '--cols': r.cols ?? 4 }">
              <li v-for="p in r.pics" :key="p.src">
                <img :src="p.src" :srcset="p.srcset" :sizes="r.kind === 'one' ? '(max-width: 720px) 100vw, 66vw' : '(max-width: 720px) 50vw, 17vw'" :alt="p.alt" :width="p.w" :height="p.h" loading="lazy" decoding="async">
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

      <!-- 03 The loop: the video over its timeline, the beat on screen lit -->
      <section class="lp" v-bind="sec('loop')" data-sheet-block="loop">
        <div class="lp__top">
          <SheetSectionNo id="loop" />
          <p class="mkc__text">
            {{ MK.anim }} {{ MK2.loop }}
          </p>
        </div>
        <div class="lp__stage">
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
            @timeupdate="onTime"
          />
          <img class="lp__page" :src="PB.anim.src" :srcset="PB.anim.srcset" sizes="(max-width: 720px) 100vw, 33vw" :alt="PB.anim.alt" :width="PB.anim.w" :height="PB.anim.h" loading="lazy" decoding="async">
        </div>
        <ol class="lp__track" aria-label="The loop's beats">
          <li v-for="(b, i) in BEATS" :key="b.l" :class="{ 'is-now': i === now }" :style="{ flexGrow: SPANS[i] }" :aria-current="i === now ? 'step' : undefined">
            <span>{{ fmt(b.t) }}</span>{{ b.l }}
          </li>
        </ol>
      </section>

      <!-- Outcome: a triptych, each photo at its own ratio (un-numbered) -->
      <div class="tr" data-sheet-block="out">
        <img v-for="p in [OUT.mural, OUT.flags, OUT.wall]" :key="p.src" :src="p.src" :srcset="p.srcset" sizes="(max-width: 720px) 100vw, 34vw" :alt="p.alt" :width="p.w" :height="p.h" :style="{ flexGrow: ratio(p) }" loading="lazy" decoding="async">
      </div>

      <SheetCredits :items="MK.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mkc__text {
  margin: 0;
  max-width: 52ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
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

.ru__rule--wide {
  grid-template-columns: minmax(0, 1fr);
}

.ru__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  padding: 20px 24px;
}

.ru__rule--wide .ru__head {
  max-width: 760px;
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

.ru__brief {
  margin: 10px 0 0;
  font: 400 13px/1.5 var(--font-ui);
  color: var(--muted);
}

/* Evidence in fours, each piece whole on white at its own ratio */
.ru__ev {
  display: grid;
  grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
  align-self: start;
  align-content: start;
  margin: 0;
  padding: 0;
  list-style: none;
  background: #fff;
}

.ru__ev--one {
  grid-template-columns: minmax(0, 1fr);
}

.ru__ev li {
  overflow: hidden;
}

.ru__ev img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: var(--ar, auto);
  object-fit: contain;
  transition: scale 400ms cubic-bezier(0.23, 1, 0.32, 1);
}

.ru__ev:not(.ru__ev--one) li:hover img {
  scale: 1.04;
}

/* Rule 2: the four tapes across the full width, over one tape line in the four colours */
.ru__tapes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.ru__tapes img {
  display: block;
  width: 100%;
  height: auto;
}

.ru__line {
  position: relative;
  display: flex;
  height: 18px;
  transform-origin: 0 50%;
}

.ru__line span {
  flex: 1;
}

.ru__line::after {
  content: '';
  position: absolute;
  inset: 8px 0 auto;
  height: 2px;
  background: repeating-linear-gradient(90deg, #111 0 14px, transparent 14px 28px);
}

@supports (animation-timeline: view()) {
  .ru__line {
    animation: mkc2-draw linear both;
    animation-timeline: view();
    animation-range: entry 10% cover 40%;
  }
}

@keyframes mkc2-draw {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* 02 The ledger, on near-black */
.lg {
  border-top: 1px solid var(--rule);
  background: #141414;
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
  border-top: 1px solid var(--rule);
}

.lg__bad {
  margin: 0;
  font: 400 18px/1.35 var(--font-ui);
  color: var(--c-fg);
}

.lg__bad s {
  text-decoration-color: var(--c-accent);
  text-decoration-thickness: 2px;
}

.lg__fix {
  margin: 0;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

.lg__row img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: contain;
  background: #fff;
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

.lp__stage {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  align-items: start;
  background: #fff;
}

.lp__video,
.lp__page {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
}

.lp__track {
  display: flex;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--rule);
}

.lp__track li {
  flex: 1 1 0;
  min-width: 0;
  padding: 12px 12px 14px;
  border-top: 3px solid transparent;
  font: 400 13px/1.35 var(--font-ui);
  color: var(--muted);
  transition: color 200ms ease, border-color 200ms ease;
}

.lp__track li + li {
  border-left: 1px solid var(--rule);
}

.lp__track li.is-now {
  border-top-color: var(--c-accent);
  color: var(--c-fg);
}

.lp__track span {
  display: block;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

/* The triptych: equal heights, each photo whole */
.tr {
  display: flex;
  align-items: flex-start;
  border-top: 1px solid var(--rule);
}

.tr img {
  display: block;
  flex: 1 1 0;
  min-width: 0;
  height: auto;
}

@media (prefers-reduced-motion: reduce) {
  .ru__ev img,
  .lp__track li { transition: none; }

  .ru__line { animation: none; }
}

@media (max-width: 720px) {
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

  .ru__ev:not(.ru__ev--one),
  .ru__tapes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lg__row {
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;
    padding: 18px 16px;
  }

  .lp__stage {
    grid-template-columns: minmax(0, 1fr);
  }

  .lp__track {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lp__track li {
    padding: 10px 16px 12px;
    border-bottom: 1px solid var(--rule);
  }

  .lp__track li + li {
    border-left: 0;
  }

  .lp__track li:nth-child(even) {
    border-left: 1px solid var(--rule);
  }

  .tr {
    flex-direction: column;
  }

  .tr img {
    flex: none;
    width: 100%;
  }
}
</style>
