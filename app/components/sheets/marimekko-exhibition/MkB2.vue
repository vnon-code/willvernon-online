<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, INFO, LOOP, MK, MK2, OUT, PB, type Pic, TYPEWRITER } from './story'

// PROTOTYPE MkB2 "Follow the tape, refined" (overnight run, Marimekko Exhibition r2). MkB with judge 1's r1 list:
// each room's wall is sized by its poster (poster | billboard over ticket, every piece whole at its own ratio, no
// crop); the back office is a near-black board, notes are plain 1px-ruled cards with no tilt or shadow, the red pin
// dots the only accent; three notes tagged Problem match the story's three problems (low-res patterns, posters redone
// at A3, a logotype carrying all four designers); room labels and tags in Host Grotesk, typewriter only for the
// designer names; the EXIT bar is the site's black with a red arrow, and the exit plays the 22 s loop (only in view)
// over the wall and flags. Refs as MkB: "Later Came Early" at Fabrica (orange tape leads visitors), the Powerhouse
// Museum's one colour per level (SEGD), Will's field-trip note, Son Daven. PLACEHOLDER: sizes, copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mkb2', [
  { id: 'rooms', label: 'The rooms' },
  { id: 'office', label: 'Back office' },
  { id: 'exit', label: 'Exit' },
])

// Rooms whose tape has been drawn
const seen = ref<Record<string, boolean>>({})
let io: IntersectionObserver | undefined
onMounted(() => {
  if (!root.value) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ARTISTS.forEach(a => (seen.value[a.id] = true))
    return
  }
  io = new IntersectionObserver((es) => {
    for (const e of es) {
      if (!e.isIntersecting) continue
      seen.value[(e.target as HTMLElement).dataset.room!] = true
      io!.unobserve(e.target)
    }
  }, { root: root.value.closest('[data-sheet-layer]'), threshold: 0.2 })
  root.value.querySelectorAll('[data-room]').forEach(el => io!.observe(el))
})
onBeforeUnmount(() => io?.disconnect())

// The back office: research, the three problems, type, wayfinding
const PINS: { p: Pic, tag: string, t: string }[] = [
  { p: PB.trip, tag: 'Research', t: MK2.trip },
  { p: PB.artists, tag: 'Problem', t: MK.redraw },
  { p: ARTISTS[1]!.poster, tag: 'Problem', t: MK.posters },
  { p: PB.logo, tag: 'Problem', t: MK.logoIdeas },
  { p: PB.type, tag: 'Type', t: MK.type },
  { p: PB.wayfinding, tag: 'Wayfinding', t: MK2.wayfinding },
]
const ratio = (p: Pic) => p.w / p.h
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <div ref="root" class="mkb" :style="{ '--tw': TYPEWRITER }">
      <SheetHead :title="MK.title" :hook="MK.hook" :info="INFO">
        <template #before>
          <div class="en">
            <img class="en__mural" :src="OUT.mural.src" :srcset="OUT.mural.srcset" sizes="100vw" :alt="OUT.mural.alt" :width="OUT.mural.w" :height="OUT.mural.h" loading="lazy" decoding="async">
            <ul class="en__floor" aria-label="The four floor tapes">
              <li v-for="a in ARTISTS" :key="a.id">
                <img :src="a.tape.src" :srcset="a.tape.srcset" sizes="(max-width: 720px) 50vw, 25vw" :alt="a.tape.alt" :width="a.tape.w" :height="a.tape.h" loading="lazy" decoding="async">
              </li>
            </ul>
          </div>
        </template>
      </SheetHead>

      <!-- 01 The rooms: one colour band per designer, each led by its tape -->
      <section class="rm" v-bind="sec('rooms')" data-sheet-block="rooms">
        <div class="rm__top">
          <SheetSectionNo id="rooms" />
          <p class="mkb__text">
            {{ MK.colour }} {{ MK.fours }}
          </p>
        </div>
        <article
          v-for="(a, i) in ARTISTS"
          :key="a.id"
          class="rm__room"
          :class="{ 'is-seen': seen[a.id], 'rm__room--flip': i % 2 }"
          :data-room="a.id"
          :style="{ '--lt': a.light, '--dp': a.deep, '--pr': ratio(a.poster), '--sr': ratio(a.billboard) / 2 }"
        >
          <span class="rm__tape" aria-hidden="true" />
          <header class="rm__sign">
            <span class="rm__no">Room {{ i + 1 }}</span>
            <h4 class="rm__name">
              {{ a.name.toLowerCase() }}
            </h4>
          </header>
          <div class="rm__wall">
            <img class="rm__poster" :src="a.poster.src" :srcset="a.poster.srcset" sizes="(max-width: 720px) 52vw, 36vw" :alt="a.poster.alt" :width="a.poster.w" :height="a.poster.h" loading="lazy" decoding="async">
            <div class="rm__side">
              <img :src="a.billboard.src" :srcset="a.billboard.srcset" sizes="(max-width: 720px) 48vw, 34vw" :alt="a.billboard.alt" :width="a.billboard.w" :height="a.billboard.h" loading="lazy" decoding="async">
              <img :src="a.ticket.src" :srcset="a.ticket.srcset" sizes="(max-width: 720px) 48vw, 34vw" :alt="a.ticket.alt" :width="a.ticket.w" :height="a.ticket.h" loading="lazy" decoding="async">
            </div>
          </div>
        </article>
      </section>

      <!-- 02 Back office: book pages pinned up, tagged -->
      <section class="bo" v-bind="sec('office')" data-sheet-block="office">
        <div class="bo__top">
          <SheetSectionNo id="office" />
        </div>
        <ul class="bo__board">
          <li v-for="n in PINS" :key="n.p.src" class="bo__pin" :class="{ 'is-problem': n.tag === 'Problem' }">
            <img :src="n.p.src" :srcset="n.p.srcset" sizes="(max-width: 720px) 100vw, 45vw" :alt="n.p.alt" :width="n.p.w" :height="n.p.h" loading="lazy" decoding="async">
            <p class="bo__tag">
              <b>{{ n.tag }}</b> {{ n.t }}
            </p>
          </li>
        </ul>
      </section>

      <!-- 03 Exit: the loop, then the wall and the flags -->
      <section class="ex" v-bind="sec('exit')" data-sheet-block="exit">
        <div class="ex__sign">
          <SheetSectionNo id="exit" />
          <span class="ex__arrow" aria-hidden="true">→</span>
        </div>
        <video
          class="ex__loop"
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
        <div class="ex__grid">
          <img v-for="p in [OUT.wall, OUT.flags]" :key="p.src" :src="p.src" :srcset="p.srcset" sizes="(max-width: 720px) 100vw, 50vw" :alt="p.alt" :width="p.w" :height="p.h" :style="{ flexGrow: ratio(p) }" loading="lazy" decoding="async">
        </div>
      </section>

      <SheetCredits :items="MK.credits" />
    </div>
  </SheetShell>
</template>

<style scoped>
.mkb__text {
  margin: 0;
  max-width: 46ch;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

/* First view: the building over the floor, both whole */
.en__mural,
.en__floor img {
  display: block;
  width: 100%;
  height: auto;
}

.en__floor {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

/* 01 The rooms */
.rm {
  border-top: 1px solid var(--rule);
}

.rm__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 24px;
}

.rm__room {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 9fr);
  padding-left: 40px;
  background: var(--lt);
  color: #111;
}

/* The floor tape: a band of the deep colour with a dashed centre line, drawn top to bottom once */
.rm__tape {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 12px;
  width: 16px;
  background:
    repeating-linear-gradient(180deg, #111 0 10px, transparent 10px 20px) center / 2px 100% no-repeat,
    var(--dp);
  transform: scaleY(0);
  transform-origin: 50% 0;
  transition: transform 900ms cubic-bezier(0.65, 0, 0.35, 1);
}

.is-seen .rm__tape {
  transform: scaleY(1);
}

.rm__sign {
  display: grid;
  align-content: start;
  gap: 6px;
  padding: 28px 24px;
}

.rm__no {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgb(0 0 0 / 0.65);
}

.rm__name {
  margin: 0;
  font: 700 clamp(26px, 3vw, 40px)/1.05 var(--tw);
  color: #111;
}

/* The wall: the poster sets the height; billboard over ticket beside it fills the same height (column widths in
   the pieces' own ratios), so nothing is cropped */
.rm__wall {
  display: grid;
  align-items: start;
  grid-template-columns: calc(100% * var(--pr) / (var(--pr) + var(--sr))) calc(100% * var(--sr) / (var(--pr) + var(--sr)));
}

.rm__wall img {
  display: block;
  width: 100%;
  height: auto;
}

.rm__room--flip .rm__wall {
  grid-template-columns: calc(100% * var(--sr) / (var(--pr) + var(--sr))) calc(100% * var(--pr) / (var(--pr) + var(--sr)));
}

.rm__room--flip .rm__poster {
  order: 2;
}

/* 02 The back office: a near-black board, plain ruled notes, red pins */
.bo {
  border-top: 1px solid var(--rule);
  background: #141414;
}

.bo__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 8px;
}

.bo__board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 36px 40px;
  margin: 0;
  padding: 28px 40px 48px;
  list-style: none;
}

.bo__pin {
  position: relative;
}

.bo__pin::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  width: 12px;
  height: 12px;
  margin-left: -6px;
  border-radius: 50%;
  background: var(--c-accent);
}

.bo__pin img {
  display: block;
  width: 100%;
  height: auto;
  background: #fff;
}

.bo__tag {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid var(--rule);
  border-top: 0;
  font: 400 14px/1.45 var(--font-ui);
  color: var(--muted);
}

.bo__tag b {
  display: block;
  margin-bottom: 2px;
  font: 600 12px/1.2 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-fg);
}

.is-problem .bo__tag b {
  color: var(--c-accent);
}

/* The A3 poster pinned among landscape pages: whole, on white, at page height */
.bo__pin:nth-child(3) img {
  aspect-ratio: 16 / 9;
  object-fit: contain;
}

/* 03 Exit: the site's black, a red arrow */
.ex {
  border-top: 1px solid var(--rule);
}

.ex__sign {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: var(--c-bg);
}

.ex__arrow {
  font: 700 40px/1 var(--font-ui);
  color: var(--c-accent);
}

.ex__loop {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  background: #fff;
}

.ex__grid {
  display: flex;
  align-items: flex-start;
}

.ex__grid img {
  display: block;
  flex: 1 1 0;
  min-width: 0;
  height: auto;
}

@media (prefers-reduced-motion: reduce) {
  .rm__tape { transition: none; }
}

@media (max-width: 720px) {
  .rm__top,
  .bo__top {
    padding: 22px 52px 18px 16px;
  }

  .ex__sign {
    padding: 16px 52px 16px 16px;
  }

  .en__floor {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .rm__room {
    grid-template-columns: minmax(0, 1fr);
    padding-left: 28px;
  }

  .rm__tape {
    left: 6px;
    width: 12px;
  }

  .rm__sign {
    padding: 20px 16px 14px;
  }

  .bo__board {
    grid-template-columns: minmax(0, 1fr);
    padding: 20px 20px 32px;
  }

  .ex__grid {
    flex-direction: column;
  }

  .ex__grid img {
    flex: none;
    width: 100%;
  }
}
</style>
