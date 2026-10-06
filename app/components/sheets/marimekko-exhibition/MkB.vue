<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import { useSheetSections } from '../_shared/useSheetSections'
import { ARTISTS, INFO, MK, OUT, PB, TYPEWRITER } from './story'

// PROTOTYPE MkB "Follow the tape" (overnight run, Marimekko Exhibition r1). The page is walked like the show: the
// first view is the building (the mural) over the four floor tapes → 01 the rooms: four full-width colour bands, one
// per designer, each led by its own floor tape that runs down the left edge as the room comes into view, with the
// poster, billboard and ticket hung like a wall → 02 the back office: the book pages pinned on a cork-grey board
// with the problems as tags → 03 the exit: the concrete wall and the flags under an EXIT sign.
// Refs: "Later Came Early" at Fabrica (It's Nice That: orange tape leads visitors to each work), the Powerhouse
// Museum's one colour per level (SEGD), Will's own field-trip note (two yellow lines like a road), Son Daven (assets
// lead the eye down the page). The tape draws once per room (IntersectionObserver, transform only). PLACEHOLDER.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
const root = ref<HTMLElement>()
defineExpose({ close: () => shell.value?.close() })
void props

const { sec } = useSheetSections('mkb', [
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

// The back office: pages with what went wrong or what was learnt, as tags
const PINS = [
  { p: PB.trip, tag: 'Field trip', t: MK.trip },
  { p: PB.artists, tag: 'Problem', t: MK.redraw },
  { p: PB.logo, tag: 'Problem', t: MK.logoIdeas },
  { p: PB.type, tag: 'Type', t: MK.type },
]
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
          :style="{ '--lt': a.light, '--dp': a.deep }"
        >
          <span class="rm__tape" aria-hidden="true" />
          <header class="rm__sign">
            <span class="rm__no">Room {{ i + 1 }}</span>
            <h4 class="rm__name">
              {{ a.name.toLowerCase() }}
            </h4>
          </header>
          <div class="rm__wall">
            <img class="rm__poster" :src="a.poster.src" :srcset="a.poster.srcset" sizes="(max-width: 720px) 50vw, 22vw" :alt="a.poster.alt" :width="a.poster.w" :height="a.poster.h" loading="lazy" decoding="async">
            <img class="rm__bb" :src="a.billboard.src" :srcset="a.billboard.srcset" sizes="(max-width: 720px) 100vw, 44vw" :alt="a.billboard.alt" :width="a.billboard.w" :height="a.billboard.h" loading="lazy" decoding="async">
            <img class="rm__tk" :src="a.ticket.src" :srcset="a.ticket.srcset" sizes="(max-width: 720px) 50vw, 22vw" :alt="a.ticket.alt" :width="a.ticket.w" :height="a.ticket.h" loading="lazy" decoding="async">
          </div>
        </article>
      </section>

      <!-- 02 Back office: book pages pinned up, the problems as tags -->
      <section class="bo" v-bind="sec('office')" data-sheet-block="office">
        <div class="bo__top">
          <SheetSectionNo id="office" />
          <p class="mkb__text">
            {{ MK.posters }}
          </p>
        </div>
        <ul class="bo__board">
          <li v-for="(n, i) in PINS" :key="n.p.src" class="bo__pin" :style="{ '--r': `${[-1.2, 0.8, -0.6, 1.1][i]}deg` }">
            <img :src="n.p.src" :srcset="n.p.srcset" sizes="(max-width: 720px) 100vw, 45vw" :alt="n.p.alt" :width="n.p.w" :height="n.p.h" loading="lazy" decoding="async">
            <p class="bo__tag">
              <b>{{ n.tag }}</b> {{ n.t }}
            </p>
          </li>
        </ul>
      </section>

      <!-- 03 Exit -->
      <section class="ex" v-bind="sec('exit')" data-sheet-block="exit">
        <div class="ex__sign">
          <SheetSectionNo id="exit" />
          <span class="ex__arrow" aria-hidden="true">→</span>
        </div>
        <div class="ex__grid">
          <img :src="OUT.wall.src" :srcset="OUT.wall.srcset" sizes="(max-width: 720px) 100vw, 50vw" :alt="OUT.wall.alt" :width="OUT.wall.w" :height="OUT.wall.h" loading="lazy" decoding="async">
          <img :src="OUT.flags.src" :srcset="OUT.flags.srcset" sizes="(max-width: 720px) 100vw, 50vw" :alt="OUT.flags.alt" :width="OUT.flags.w" :height="OUT.flags.h" loading="lazy" decoding="async">
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

/* First view: the building over the floor */
.en__mural {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 7;
  object-fit: cover;
  object-position: 50% 40%;
}

.en__floor {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.en__floor img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  object-fit: cover;
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

.rm__wall {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  grid-template-rows: auto auto;
}

.rm__wall img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rm__poster {
  grid-row: 1 / 3;
  aspect-ratio: 1358 / 1920;
}

.rm__bb {
  aspect-ratio: 4 / 3;
}

.rm__tk {
  aspect-ratio: 16 / 6;
}

.rm__room--flip .rm__wall {
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
}

.rm__room--flip .rm__poster {
  grid-column: 2;
  grid-row: 1 / 3;
}

.rm__room--flip .rm__bb,
.rm__room--flip .rm__tk {
  grid-column: 1;
}

.rm__room--flip .rm__bb {
  grid-row: 1;
}

.rm__room--flip .rm__tk {
  grid-row: 2;
}

/* 02 The back office: a grey board */
.bo {
  border-top: 1px solid var(--rule);
  background: #2a2826;
}

.bo__top {
  display: grid;
  gap: 12px;
  padding: 28px 24px 8px;
}

.bo__board {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 32px 40px;
  margin: 0;
  padding: 24px 40px 48px;
  list-style: none;
}

.bo__pin {
  position: relative;
  rotate: var(--r);
}

.bo__pin::before {
  content: '';
  position: absolute;
  top: -7px;
  left: 50%;
  width: 14px;
  height: 14px;
  margin-left: -7px;
  border-radius: 50%;
  background: var(--c-accent);
  box-shadow: 0 2px 3px rgb(0 0 0 / 0.4);
}

.bo__pin img {
  display: block;
  width: 100%;
  height: auto;
  background: #fff;
  box-shadow: 0 6px 18px rgb(0 0 0 / 0.35);
}

.bo__tag {
  position: relative;
  max-width: 40ch;
  margin: -18px 0 0 16px;
  padding: 10px 12px;
  background: #f4f1ea;
  color: #111;
  font: 400 14px/1.45 var(--font-ui);
  box-shadow: 0 3px 8px rgb(0 0 0 / 0.3);
}

.bo__tag b {
  display: block;
  margin-bottom: 2px;
  font: 700 13px/1.2 var(--tw);
  text-transform: lowercase;
}

/* 03 Exit */
.ex {
  border-top: 1px solid var(--rule);
}

.ex__sign {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  background: #0b7a3e;
  color: #fff;
  --c-fg: #fff;
  --muted: rgb(255 255 255 / 0.8);
  --c-accent: #fff;
}

.ex__arrow {
  font: 700 40px/1 var(--font-ui);
}

.ex__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.ex__grid img {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
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

  .rm__wall,
  .rm__room--flip .rm__wall {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .rm__poster,
  .rm__room--flip .rm__poster {
    grid-column: 1;
    grid-row: 2;
  }

  .rm__bb,
  .rm__room--flip .rm__bb {
    grid-column: 1 / -1;
    grid-row: 1;
  }

  .rm__tk,
  .rm__room--flip .rm__tk {
    grid-column: 2;
    grid-row: 2;
  }

  .bo__board {
    grid-template-columns: minmax(0, 1fr);
    padding: 16px 20px 32px;
  }

  .ex__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
