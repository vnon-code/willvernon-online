<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { useOpenPlay } from '../monolith/useOpenPlay'
import { CLIPS, CO, INFO, NODES, PROMPT, RUNS } from './story'

// PROTOTYPE CB "Re-roll" (overnight run, Synthetic Corals r1). Beats, each its own device: the outcome as one frame
// you run again, stepping through the runs on the site (run 3 flashes past as missing) beside a run list → the
// settings as a printed ticket, the same for every run, next to the short clip → a lights switch: the section goes
// from white to black as the bleached run gives way to the glowing one.
// Refs: fxhash and Art Blocks token pages (one live view, a "new variation" button, the run's params beside it);
// a thermal print receipt; Apple's light/dark product toggles. Videos play only in view, once the Sheet is open
// (useOpenPlay). PLACEHOLDER: sizes, copy, the ticket's look.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
useOpenPlay(root)
void props

const { sec } = useSheetSections('cb', [
  { id: 'ticket', label: 'Same settings' },
  { id: 'lights', label: 'Bleached, glowing' },
])

// Run again: 1 → 2 → (3 isn't on the site) → 4 → 5 → 1
const LIST = [1, 2, 3, 4, 5].map(n => ({ n, run: RUNS.find(r => r.n === n) }))
const at = ref(1)
const skipped = ref(false)
const cur = computed(() => RUNS.find(r => r.n === at.value)!)
let t = 0
function again() {
  let n = at.value % 5 + 1
  skipped.value = n === 3
  if (n === 3) n = 4
  at.value = n
  clearTimeout(t)
  if (skipped.value) t = window.setTimeout(() => (skipped.value = false), 900)
}
onBeforeUnmount(() => clearTimeout(t))

// The lights
const dark = ref(false)
const [bleached, glowing] = [RUNS[0]!, RUNS[1]!]
const [lineOn, lineOff] = CO.lights.split(', ')
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="cb">
      <SheetHead :title="CO.title" :hook="CO.hook" :info="INFO">
        <template #before>
          <div class="rr">
            <div class="rr__frame">
              <img
                v-for="r in RUNS"
                :key="r.n"
                :class="{ 'is-on': at === r.n }"
                :src="r.src"
                :srcset="r.srcset"
                sizes="(max-width: 720px) 100vw, 610px"
                :alt="at === r.n ? r.alt : ''"
                :aria-hidden="at !== r.n"
                :width="r.w"
                :height="r.h"
                loading="lazy"
                decoding="async"
              >
              <p class="rr__count" aria-hidden="true">
                Run {{ String(at).padStart(2, '0') }}<span> / 05</span>
              </p>
            </div>
            <div class="rr__side">
              <p class="rr__runs">
                {{ CO.runs }}
              </p>
              <ol class="rr__list">
                <li
                  v-for="l in LIST"
                  :key="l.n"
                  :class="{ 'is-on': at === l.n, 'is-gap': !l.run, 'is-flash': !l.run && skipped }"
                >
                  <b>{{ String(l.n).padStart(2, '0') }}</b> {{ l.run ? l.run.name : CO.missing }}
                </li>
              </ol>
              <button type="button" class="rr__btn" @click="again">
                Run again
              </button>
              <p class="rr__live" aria-live="polite">
                Run {{ at }}: {{ cur.name }}
              </p>
            </div>
          </div>
        </template>
      </SheetHead>

      <!-- 01 Same settings: a printed ticket beside the short clip -->
      <section class="tk" v-bind="sec('ticket')" data-sheet-block="ticket">
        <div class="tk__desk">
          <div class="tk__top">
            <SheetSectionNo id="ticket" />
          </div>
          <div class="tk__paper">
            <p class="tk__h">
              {{ CO.title }}<br>Runs 01–05
            </p>
            <p class="tk__prompt">
              {{ PROMPT }}
            </p>
            <dl class="tk__rows">
              <div v-for="n in NODES" :key="n.k">
                <dt>{{ n.k }}</dt>
                <dd>{{ n.v }}</dd>
              </div>
            </dl>
            <p class="tk__foot">
              {{ CO.nodes }}
            </p>
          </div>
        </div>
        <div class="tk__clip">
          <video
            :src="CLIPS.cut.src"
            :poster="CLIPS.cut.poster"
            :width="CLIPS.cut.w"
            :height="CLIPS.cut.h"
            muted
            loop
            playsinline
            preload="none"
            data-play
            :aria-label="`${CLIPS.cut.label} clip: ${CLIPS.cut.alt}`"
          />
        </div>
      </section>

      <!-- 02 Lights: white to black, bleached to glowing -->
      <section class="lt" :class="{ 'is-dark': dark }" v-bind="sec('lights')" data-sheet-block="lights">
        <div class="lt__words">
          <SheetSectionNo id="lights" />
          <p class="lt__line">
            <span :class="{ 'is-off': dark }">{{ lineOn }},</span>{{ ' ' }}<span :class="{ 'is-off': !dark }">{{ lineOff }}</span>
          </p>
          <button type="button" class="lt__btn" :aria-pressed="dark" @click="dark = !dark">
            <span class="lt__sw" aria-hidden="true" />
            {{ dark ? 'Lights on' : 'Lights off' }}
          </button>
        </div>
        <div class="lt__pic">
          <img :class="{ 'is-on': !dark }" :src="bleached.src" :srcset="bleached.srcset" sizes="(max-width: 720px) 100vw, 560px" :alt="dark ? '' : bleached.alt" :aria-hidden="dark" :width="bleached.w" :height="bleached.h" loading="lazy" decoding="async">
          <img :class="{ 'is-on': dark }" :src="glowing.src" :srcset="glowing.srcset" sizes="(max-width: 720px) 100vw, 560px" :alt="dark ? glowing.alt : ''" :aria-hidden="!dark" :width="glowing.w" :height="glowing.h" loading="lazy" decoding="async">
        </div>
      </section>

      <SheetCredits :items="CO.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
/* Re-roll: the frame left, the run list and the button right */
.rr {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  background: #000;
  color: #e9ecef;
}

.rr__frame {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.rr__frame img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  scale: 1.03;
  transition: opacity 360ms ease-out, scale 600ms cubic-bezier(0.23, 1, 0.32, 1);
}

.rr__frame img.is-on {
  opacity: 1;
  scale: 1;
}

.rr__count {
  position: absolute;
  left: 20px;
  top: 16px;
  margin: 0;
  font: 500 13px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

.rr__count span {
  color: rgb(255 255 255 / 0.45);
}

.rr__side {
  display: grid;
  align-content: end;
  gap: 20px;
  padding: 24px;
  border-left: 1px solid rgb(255 255 255 / 0.1);
}

.rr__runs {
  margin: 0;
  max-width: 32ch;
  font: 400 14px/1.5 var(--font-ui);
  color: rgb(255 255 255 / 0.7);
}

.rr__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.rr__list li {
  display: flex;
  gap: 14px;
  padding: 9px 0;
  border-top: 1px solid rgb(255 255 255 / 0.12);
  font: 400 14px/1.3 var(--font-ui);
  color: rgb(255 255 255 / 0.5);
  transition: color 200ms ease-out;
}

.rr__list b {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.rr__list li.is-on {
  color: #fff;
}

.rr__list li.is-gap {
  color: rgb(255 255 255 / 0.3);
  text-decoration: line-through;
}

.rr__list li.is-flash {
  color: #ff6a5e;
  transition: none;
}

.rr__btn {
  justify-self: stretch;
  padding: 16px 20px;
  font: 600 14px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #000;
  background: #fff;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: scale 120ms ease-out;
}

.rr__btn:active {
  scale: 0.97;
}

.rr__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 3px;
}

.rr__live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

/* 01 The ticket */
.tk {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  border-top: 1px solid var(--rule);
}

.tk__desk {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: 24px;
  padding: 28px 24px 40px;
}

.tk__top {
  justify-self: stretch;
}

.tk__paper {
  width: min(100%, 380px);
  padding: 22px 22px 34px;
  font: 400 12.5px/1.55 ui-monospace, 'SF Mono', Menlo, monospace;
  color: #1a1a1a;
  background: #f4f1ea;
  rotate: -1.2deg;
  /* The torn foot */
  mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 14px 100%;
}

.tk__h {
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgb(0 0 0 / 0.4);
  font-weight: 700;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tk__prompt {
  margin: 0 0 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed rgb(0 0 0 / 0.4);
  overflow-wrap: anywhere;
}

.tk__rows {
  margin: 0;
}

.tk__rows div {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 10px;
  padding: 3px 0;
}

.tk__rows dt {
  text-transform: uppercase;
  color: rgb(0 0 0 / 0.6);
}

.tk__rows dd {
  margin: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.tk__foot {
  margin: 14px 0 0;
  padding-top: 12px;
  border-top: 1px dashed rgb(0 0 0 / 0.4);
  text-align: center;
}

.tk__clip {
  border-left: 1px solid var(--rule);
  background: #fff;
}

.tk__clip video {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 720 / 1280;
  object-fit: cover;
}

/* 02 Lights */
.lt {
  display: grid;
  grid-template-columns: minmax(0, 6fr) minmax(0, 6fr);
  border-top: 1px solid var(--rule);
  background: #f2f2ef;
  --c-fg: #111;
  --muted: rgb(0 0 0 / 0.6);
  color: #111;
  transition: background-color 420ms ease-out, color 420ms ease-out;
}

.lt.is-dark {
  background: #000;
  --c-fg: #f2f2ef;
  --muted: rgb(255 255 255 / 0.65);
  color: #f2f2ef;
}

.lt__words {
  display: grid;
  align-content: space-between;
  gap: 28px;
  padding: 28px 24px;
}

.lt__line {
  margin: 0;
  font: 500 clamp(26px, 3.2vw, 40px)/1.12 var(--font-ui);
  letter-spacing: -0.02em;
}

.lt__line span {
  transition: opacity 420ms ease-out;
}

.lt__line .is-off {
  opacity: 0.25;
}

.lt__btn {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 10px;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: inherit;
  background: none;
  border: 1px solid currentcolor;
  border-radius: 999px;
  cursor: pointer;
}

.lt__btn:focus-visible {
  outline: 2px solid var(--c-accent);
  outline-offset: 2px;
}

.lt__sw {
  position: relative;
  width: 34px;
  height: 18px;
  border-radius: 999px;
  background: currentcolor;
  opacity: 0.85;
}

.lt__sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #f2f2ef;
  transition: translate 240ms cubic-bezier(0.23, 1, 0.32, 1), background-color 420ms ease-out;
}

.is-dark .lt__sw::after {
  translate: 16px 0;
  background: #000;
}

.lt__pic {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: #000;
}

.lt__pic img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 420ms ease-out;
}

.lt__pic img.is-on {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .rr__frame img, .lt, .lt__line span, .lt__sw::after, .lt__pic img { transition: none; }
}

@media (max-width: 720px) {
  .rr,
  .tk,
  .lt {
    grid-template-columns: minmax(0, 1fr);
  }

  .rr__side {
    padding: 18px 16px 20px;
    border-left: 0;
  }

  .tk__desk {
    padding: 22px 16px 32px;
  }

  .tk__top {
    padding-right: 36px;
  }

  .tk__clip {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .tk__clip video {
    aspect-ratio: 4 / 5;
  }

  .lt__words {
    padding: 22px 52px 22px 16px;
  }
}
</style>
