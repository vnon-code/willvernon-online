<script setup lang="ts">
import strip from '~~/content/strip.json'
import type { ProjectText, SheetMediaItem, SheetOpen, SheetStory } from '~/types/project'

// The project strip (docs/specs/project-strip.md; reference prototype/project-strip.html?v=insidebig&auto=step&sides=mono).
// An endless ring of cards seen from inside. Scroll, drag, keys or a click turn it; left alone it steps every 10s.
// Layout and interaction picked by Will on /proto (2026-10-05): chips, strip and an info row (tag | name | tools)
// form one block, centred between the header and the screen's foot; clicking the centre card opens the Sheet.
const props = defineProps<{ active: boolean }>()
const { mode } = useScrollPage() // the plates tuck behind the centre card while the Landing isn't home
const emit = defineEmits<{
  centre: [card: { poster: string, teaser?: string | null }] // the Landing background's palette
  step: [el: Element] // a new centre card (not the first): the background pulses out of its border
  expand: [e: SheetOpen] // open the Sheet from the centre card
}>()
const sound = useSound()

type Card = (typeof strip.cards)[number] & ProjectText

// Titles are looked up in the source files at prerender time, so the large content JSON stays out of the client bundle
const { data: allCards } = await useAsyncData('strip-cards', async () => {
  // Server only: the client reads the payload, and this branch (with the content chunks) is dropped from its build
  if (import.meta.client) return []
  const [{ caseStudies }, { projects }, { items }, media] = await Promise.all([
    import('~~/content/projects.json'),
    import('~~/content/ai.json'),
    import('~~/content/experiments.json'),
    import('~~/content/media.json'),
  ])
  // PROTOTYPE (Project Sheet rework): the Sheet's media. A still shows its local derived webp when there is one; a
  // video carries its poster. Groups show their first item (the rest are the renders, which the gallery holds);
  // iframes are skipped.
  type Raw = { type: string, src?: string, alt?: string, items?: Raw[] } | null | undefined
  const images = media.images as Record<string, { derived?: { src: string } }>
  const posters = media.posters as Record<string, { src: string, w?: number, h?: number }>
  const toItem = (m: Raw): SheetMediaItem | undefined => {
    if (m?.type === 'group') return toItem(m.items?.[0])
    if (!m?.src) return
    if (m.type === 'video') return { type: 'video', src: m.src, poster: posters[m.src]?.src }
    if (m.type === 'image') return { type: 'image', src: images[m.src]?.derived?.src ?? m.src, alt: m.alt }
  }
  // The renders: every image in media.json under the project's asset folder, minus those a step already shows
  const galleryFor = (p: (typeof caseStudies)[number], used: (string | undefined)[]) => {
    const folder = JSON.stringify(p).match(/\/projects\/\d+_[^/]+\//)?.[0]
    if (!folder) return []
    return Object.entries(images)
      .filter(([k]) => k.includes(folder))
      .map(([k, v]) => ({ type: 'image' as const, src: v.derived?.src ?? k }))
      .filter(m => !used.includes(m.src))
  }
  // PROTOTYPE (Project Sheet rework, round 2): the stories (content/stories/<slug>.json), each video given its poster
  // and aspect
  const withPosters = (o: unknown): unknown => {
    if (Array.isArray(o)) return o.map(withPosters)
    if (!o || typeof o !== 'object') return o
    const m = Object.fromEntries(Object.entries(o).map(([k, v]) => [k, withPosters(v)])) as Record<string, unknown>
    const p = m.type === 'video' ? posters[m.src as string] : undefined
    if (p) Object.assign(m, { poster: m.poster ?? p.src, aspect: m.aspect ?? (p.w && p.h ? +(p.w / p.h).toFixed(3) : undefined) })
    return m
  }
  const storyFiles = import.meta.glob('../../content/stories/*.json', { import: 'default' })
  const stories: Record<string, SheetStory> = Object.fromEntries(await Promise.all(Object.entries(storyFiles).map(async ([k, load]) =>
    [k.replace(/^.*\/|\.json$/g, ''), withPosters(await load()) as SheetStory])))
  // Title, short description and tools (software; tags for AI work); `long`, `process`, `outcome` and `gallery`
  // feed the Sheet
  const info: Record<string, Record<string, ProjectText>> = {
    projects: Object.fromEntries(caseStudies.map((p) => {
      const process = p.process.map(s => ({ title: s.title, text: s.text, media: toItem(s.media as Raw) }))
      const outcome = toItem((p.outcome as { media?: Raw } | undefined)?.media) ?? null
      return [p.slug, {
        title: p.title, summary: p.descShort, tools: p.software, long: p.descLong, process, outcome,
        gallery: galleryFor(p, process.map(s => s.media?.src)), story: stories[p.slug] ?? null,
      }]
    })),
    ai: Object.fromEntries(projects.map(p => [p.key, { title: p.title, summary: p.desc, tools: p.tags, long: '', process: [], gallery: [] }])),
    experiments: Object.fromEntries(items.map(p => [p.id, { title: p.title, summary: p.descShort, tools: p.software, long: '', process: [], gallery: [] }])),
  }
  // Cards for work not on the old site, one file each in content/proto-cards/ (card and text together).
  // Shown to everyone since Will locked in the Sheets (2026-10-08).
  const protoFiles = import.meta.glob('../../content/proto-cards/*.json', { import: 'default' })
  const proto = await Promise.all(Object.values(protoFiles).map(async load => ({ ...(await load() as object), proto: true })))
  return [...strip.cards.map(c => ({ ...c, ...info[c.from]![c.id]! })), ...proto as unknown as Card[]]
})
const listed = computed(() => allCards.value ?? [])

const chip = ref('All')
const picked = ref('All') // the pressed chip; `chip` (the filtered set) follows after the sweep-out
const cards = computed<Card[]>(() => listed.value.filter(c => chip.value === 'All' || c.chip === chip.value))
const countFor = (k: string) => listed.value.filter(c => k === 'All' || c.chip === k).length
const centre = ref(-1) // set on mount, so the first card's teaser starts
const current = computed(() => cards.value[centre.value])
watch(current, (c) => { if (c) emit('centre', c) })
// The tag under the card's left edge, by content source
const TAG: Record<string, string> = { projects: 'Project', experiments: 'Experiment', ai: 'AI' }

// Ring geometry and motion (spec values, measured at 1280×800)
const FOCAL = 1600 // px perspective
const SPACING = 1.04 // × card width along the ring
// Desktop: ring radius 55% of the width, neighbours pushed out 30% of a card, fading out 1.0–1.35 rad from the
// centre. PLACEHOLDER (Will, 2026-10-04: "carousel too big"): card 26% wide, centre grows 1.35×.
// Phones (Peek): card 72% wide, flatter ring, a sliver of each neighbour.
const RING = { width: 0.26, radius: 0.55, grow: 0.35, push: 0.3, fade: [1.0, 1.35] }
const PHONE = { width: 0.72, radius: 1.6, grow: 0, push: 0, fade: [0.55, 0.8] }
const PHONE_MAX = 640 // px viewport width
const AIR = 24 // px kept clear above the chips and below the info row
const CHIPS = 48 // px: the chips (32) and the gap under them
// The info row: its height until it renders, the gap under the centre card, its lowest bottom (clear of the drawer
// tabs). PLACEHOLDER (not yet approved): gap and floor
const ROW = { h: 42, gap: 16, floor: 36 }
const EASE = 0.085 // per frame at 60fps
const WHEEL_PX = 360 // wheel travel per card
const DRAG_W = 0.28 // × viewport width per card
const SNAP_MS = 140
const STEP_REST = 10000 // Auto: Step (Will)
const IDLE_RESUME = 3000
const TEASER_DELAY = 250
const SWEEP_OUT = 220 // ms: filter change, old set fades while turning on
const SWEEP_IN = 380 // ms: new set fades in while spinning in from the right
const SWEEP_FROM = -2.2 // cards: where the new set starts turning from

const stackEl = ref<HTMLElement>()
const stripEl = ref<HTMLElement>()
const worldEl = ref<HTMLElement>()
const rowEl = ref<HTMLElement>()
const cardEls: Record<string, HTMLElement> = {}
const videoEls: Record<string, HTMLVideoElement> = {}
const chipEls: Record<string, HTMLElement> = {}
const started = reactive<Record<string, boolean>>({}) // video element created (on first use)
const playing = reactive<Record<string, boolean>>({}) // video playing (fades in) or GIF showing
const dir = ref(1) // the strip's last travel, so the name slides in from where it came
const bar = reactive({ key: 0, ms: 0, paused: true }) // the auto-step timer along the centre card's bottom edge
const pill = reactive({ l: 0, r: 0, on: false }) // the chips' sliding fill, clipped to the pressed chip (px in from each side)

// An open drawer that would cover the block lifts it
const drawers = useState<Record<string, boolean>>('drawers', () => ({}))
watch(drawers, () => nextTick(onResize), { deep: true })
// The tools tiles change the row's height when a project has none, so lay out again once the new one has rendered
watch(current, () => nextTick(onResize))
const panel = { w: 417, h: 196 } // an open drawer's panel, re-measured on resize

let target = 0, pos = 0, raf = 0, last = 0
let reduced = false
let headerH = 0
let snapTimer = 0, autoTimer = 0, teaserTimer = 0
let hovered = ''
let drag: { x: number, y: number, t: number } | null = null
let moved = false
let sweeping = false // filter change in progress: the info row holds on the new first card

const n = () => cards.value.length
const mod = (v: number, m: number) => ((v % m) + m) % m
// Shortest signed distance on the loop, in (-n/2, n/2]
const wrap = (d: number) => n() < 2 ? 0 : mod(d + n() / 2, n()) - n() / 2
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const inOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

function onResize() {
  headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0
  const p = document.querySelector<HTMLElement>('.dock--left .panel')
  if (p) Object.assign(panel, { w: p.offsetWidth, h: p.offsetHeight })
  layout()
  placePill()
}

// Cards are projected to 2D by hand and stacked by depth (CSS preserve-3d re-sorted the planes and made cards pop)
let sized = { cw: 0, ch: 0 }

// Size the strip and place the block: chips, strip and info row, centred between the header and the screen's foot
// with AIR above and below. Cards are 16:9 and shrink with the height when the grown centre card wouldn't fit. A
// second pass lifts the block when an open drawer would cover the info row.
function size(W: number, H: number, g: typeof RING) {
  const h = rowEl.value?.offsetHeight || ROW.h
  const place = (b: number) => {
    const room = H - headerH - h - ROW.gap - b - CHIPS - 2 * AIR
    const cw = Math.min(W * g.width, H * 0.4 * 16 / 9, ((room - 16) / (1 + g.grow)) * 16 / 9), ch = cw * 9 / 16
    const stripH = Math.min(ch * (1 + g.grow), room)
    const slack = Math.max(0, H - headerH - b - (CHIPS + stripH + ROW.gap + h))
    return { cw, ch, stripH, below: H - (headerH + slack / 2 + CHIPS + stripH), rowW: Math.min(W - 32, cw * (1 + g.grow)) }
  }
  let r = place(ROW.floor)
  const l = (W - r.rowW) / 2, rt = (W + r.rowW) / 2
  const hit = (s: string) => !!document.querySelector(`.dock--${s}.dock--open`)
    && (W < PHONE_MAX || (s === 'left' ? l < 16 + panel.w + 8 : rt > W - 16 - panel.w - 8))
  if (hit('left') || hit('right')) r = place(16 + panel.h + ROW.gap)
  const box = stackEl.value?.style
  box?.setProperty('--stack-b', `${r.below}px`)
  box?.setProperty('--row-b', `${r.below - ROW.gap - h}px`)
  box?.setProperty('--row-w', `${Math.round(r.rowW)}px`)
  stripEl.value?.style.setProperty('--strip-h', `${r.stripH}px`)
  sized = { cw: r.cw, ch: r.ch }
}

function layout() {
  const W = innerWidth, H = innerHeight
  const g = W < PHONE_MAX ? PHONE : RING
  size(W, H, g)
  const { cw, ch } = sized
  const R = W * g.radius, step = (cw * SPACING) / R
  cards.value.forEach((c, i) => {
    const el = cardEls[c.id]
    if (!el) return
    const d = wrap(i - pos), a = Math.abs(d), near = inOut(Math.max(0, 1 - a))
    const th = d * step
    const X = R * Math.sin(th), Z = R * (1 - Math.cos(th)) * 0.85
    const p = FOCAL / (FOCAL - Z)
    const x = X * p + Math.sign(d) * Math.min(a, 1) * cw * g.push * p
    const op = 1 - smooth(g.fade[0]!, g.fade[1]!, Math.abs(th))
    el.style.width = `${cw}px`
    el.style.height = `${ch}px`
    el.style.transform = `translate(-50%, -50%) translate(${x}px, 0) scale(${p * (1 + g.grow * near)}) perspective(${FOCAL}px) rotateY(${-th}rad)`
    el.style.zIndex = String(Math.round(2000 + Z))
    el.style.opacity = String(op)
    el.style.visibility = op <= 0.01 ? 'hidden' : 'visible'
    el.style.setProperty('--side', Math.min(a, 1).toFixed(3))
    el.style.setProperty('--dir', String(Math.sign(Math.round(d)))) // which side of the centre: -1, 0, 1
  })
}

// The frame loop runs only while the ring is moving or a drag is active
function wake() {
  if (!raf) {
    last = performance.now()
    raf = requestAnimationFrame(tick)
  }
}
function tick(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  pos = reduced ? target : pos + (target - pos) * (1 - (1 - EASE) ** (dt * 60))
  if (Math.abs(target - pos) < 0.0005) pos = target
  // keep the numbers small; the loop is endless either way
  if (Math.abs(pos) > n() * 50) {
    const s = Math.round(pos / n()) * n()
    pos -= s
    target -= s
  }
  layout()
  if (sweeping && Math.round(pos) === Math.round(target)) sweeping = false
  if (!sweeping) setCentre(mod(Math.round(pos), n()))
  raf = pos !== target || drag ? requestAnimationFrame(tick) : 0
}

function go(t: number) {
  target = t
  wake()
}

// Auto: Step. 10s on a card, then glide to the next; restarts 3s after the last input; paused on the centre card.
// The timer bar fills along the centre card's bottom edge over the same wait.
function scheduleAuto(ms: number) {
  clearTimeout(autoTimer)
  bar.paused = true
  if (reduced || n() < 2 || !props.active) return
  Object.assign(bar, { key: bar.key + 1, ms, paused: false })
  autoTimer = window.setTimeout(() => {
    if (hovered && hovered === current.value?.id) return // pointerleave reschedules
    go(Math.round(target) + 1)
    scheduleAuto(STEP_REST)
  }, ms)
}
const touch = () => scheduleAuto(IDLE_RESUME + STEP_REST)

// A tick per card passed; the background pulses out of the new centre card
function setCentre(i: number) {
  if (i === centre.value) return
  const prev = centre.value
  centre.value = i
  playTeaser()
  if (prev < 0) return
  dir.value = Math.sign(wrap(i - prev)) || 1
  sound.sfx('step')
  const c = current.value
  if (c && cardEls[c.id]) emit('step', cardEls[c.id]!)
}

// Only the centre card plays: muted, looping, inline, from 250ms after it arrives. Others pause (not destroyed).
function playTeaser() {
  clearTimeout(teaserTimer)
  const c = current.value
  for (const id in playing) if (id !== c?.id) playing[id] = false
  for (const id in videoEls) if (id !== c?.id) videoEls[id]!.pause()
  if (!c || reduced) return
  if (!c.teaser) return
  teaserTimer = window.setTimeout(async () => {
    if (c.teaser!.endsWith('.gif')) {
      playing[c.id] = true
      return
    }
    started[c.id] = true
    await nextTick()
    videoEls[c.id]?.play().catch(() => {})
  }, TEASER_DELAY)
}

function onCardClick(i: number) {
  if (moved) return
  touch()
  if (i !== centre.value) return go(Math.round(target) + wrap(i - Math.round(target)))
  // The centre card opens the Sheet, grown out of the card
  const c = current.value
  if (!c) return
  sound.sfx('sheetOpen')
  const el = cardEls[c.id]!
  emit('expand', { card: c, from: el.getBoundingClientRect(), el })
}

function onWheel(e: WheelEvent) {
  if (!props.active) return
  e.preventDefault()
  const d = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
  go(target + d * (e.deltaMode ? 0.33 : 1 / WHEEL_PX))
  touch()
  clearTimeout(snapTimer)
  snapTimer = window.setTimeout(() => go(Math.round(target)), SNAP_MS)
}

function onPointerDown(e: PointerEvent) {
  if (e.button > 0) return
  drag = { x: e.clientX, y: e.clientY, t: target }
  moved = false
  touch()
  wake()
}
function onPointerMove(e: PointerEvent) {
  if (!drag) return
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y
  const d = Math.abs(dx) > Math.abs(dy) ? -dx : -dy
  if (Math.abs(d) > 6) moved = true
  target = drag.t + d / (innerWidth * DRAG_W)
  touch()
}
function onPointerUp() {
  if (!drag) return
  drag = null
  go(Math.round(target))
  setTimeout(() => (moved = false), 0)
}

function onKey(e: KeyboardEvent) {
  const by = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
  if (!by) return
  e.preventDefault()
  go(Math.round(target) + by)
  touch()
}

function onHover(e: PointerEvent, id: string, on: boolean) {
  hovered = on ? id : ''
  bar.paused = on && id === current.value?.id
  if (on && e.pointerType === 'mouse') sound.sfx('hoverCard')
  if (!on) scheduleAuto(STEP_REST)
}

// Chips (Will, 2026-10-05: "pill"): one glass capsule; a filled pill slides under the pressed chip on clip-path
function placePill() {
  const el = chipEls[picked.value]
  const box = el?.parentElement
  if (el && box) Object.assign(pill, { l: el.offsetLeft, r: box.clientWidth - el.offsetLeft - el.offsetWidth, on: true })
}

// Filter change, Sweep (Claude's pick, 2026-10-03): the old set fades as it turns on, the ring rebuilds with the
// filtered cards, and the new set spins in from the right and settles on its first card. Reduced motion: a cut.
let switching = false
const fadeWorld = (from: number, to: number, ms: number, easing: string) =>
  worldEl.value!.animate({ opacity: [from, to] }, { duration: ms, easing, fill: 'forwards' }).finished
async function setChip(k: string) {
  if (k === chip.value || switching) return
  switching = true
  picked.value = k // the chip flips at once; the ring follows
  sound.sfx('chip')
  placePill()
  if (!reduced) {
    go(target + 0.6)
    await fadeWorld(1, 0, SWEEP_OUT, 'ease-out') // Will, 2026-10-05: reacts on the click (was ease-in)
  }
  chip.value = k
  centre.value = -1
  await nextTick()
  pos = reduced ? 0 : SWEEP_FROM
  target = 0
  setCentre(0)
  layout()
  if (!reduced) {
    sweeping = true
    wake()
    await fadeWorld(0, 1, SWEEP_IN, 'ease-out')
  }
  worldEl.value!.getAnimations().forEach(a => a.cancel())
  switching = false
  touch()
}

watch(() => props.active, (on) => {
  if (on) scheduleAuto(STEP_REST)
  else {
    clearTimeout(autoTimer)
    bar.paused = true // the timer holds while the Sheet is open
  }
})

onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  onResize()
  setCentre(0)
  if (props.active) scheduleAuto(STEP_REST)
  document.fonts?.ready.then(placePill) // the chips' widths settle once Host Grotesk has loaded
  addEventListener('wheel', onWheel, { passive: false })
  addEventListener('pointermove', onPointerMove)
  addEventListener('pointerup', onPointerUp)
  addEventListener('pointercancel', onPointerUp)
  addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ;[snapTimer, autoTimer, teaserTimer].forEach(clearTimeout)
  removeEventListener('wheel', onWheel)
  removeEventListener('pointermove', onPointerMove)
  removeEventListener('pointerup', onPointerUp)
  removeEventListener('pointercancel', onPointerUp)
  removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="stackEl" class="stack" :class="{ 'stack--away': mode !== 'landing' }">
    <div class="chips" role="group" aria-label="Filter projects" data-dot-clear data-drop="chips">
      <span class="chips__pill" :class="{ on: pill.on }" :style="{ clipPath: `inset(0 ${pill.r}px 0 ${pill.l}px round 999px)` }" aria-hidden="true" />
      <button
        v-for="k in strip.chips"
        :key="k"
        :ref="(el) => { if (el) chipEls[k] = el as HTMLElement }"
        class="chip"
        :aria-pressed="k === picked"
        @click="setChip(k)"
      >
        {{ k }}<sup>{{ countFor(k) }}</sup>
      </button>
    </div>

    <section
      ref="stripEl"
      class="strip"
      aria-roledescription="carousel"
      aria-label="Projects"
      tabindex="0"
      @keydown="onKey"
      @pointerdown="onPointerDown"
    >
      <!-- PROTOTYPE data-drop (Project Sheet rework): the side cards drop away as one; the centre card hides under the
           Sheet's growing media meanwhile -->
      <div ref="worldEl" class="world" data-drop="cards">
        <button
          v-for="(c, i) in cards"
          :key="c.id"
          :ref="(el) => { if (el) cardEls[c.id] = el as HTMLElement }"
          class="card"
          :class="{ 'card--centre': c.id === current?.id }"
          :data-slug="c.id"
          type="button"
          :aria-label="c.id === current?.id ? `Open ${c.title}` : c.title"
          @click="onCardClick(i)"
          @pointerenter="onHover($event, c.id, true)"
          @pointerleave="onHover($event, c.id, false)"
        >
          <img :src="playing[c.id] && c.teaser?.endsWith('.gif') ? c.teaser : c.poster" alt="" draggable="false">
          <video
            v-if="started[c.id]"
            :ref="(el) => { if (el) videoEls[c.id] = el as HTMLVideoElement }"
            :class="{ on: playing[c.id] }"
            :src="c.teaser!"
            muted
            loop
            playsinline
            preload="auto"
            @playing="playing[c.id] = true"
            @pause="playing[c.id] = false"
          />
          <!-- Timer (Will, 2026-10-05): fills along the centre card's bottom edge until the next auto-step -->
          <span
            v-if="c.id === current?.id && bar.ms"
            :key="bar.key"
            class="card__bar"
            :class="{ paused: bar.paused }"
            :style="{ animationDuration: `${bar.ms}ms` }"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>

    <!-- The info row under the centre card (Will, 2026-10-05): the tag at its left edge, the name centred, the tools
         at its right edge -->
    <div v-if="current" ref="rowEl" class="row" data-drop="row">
      <HugBox :k="current.from" pin="left" class="row__tag" data-dot-clear>
        <span class="row__tag-text">{{ TAG[current.from] ?? current.chip }}</span>
      </HugBox>
      <HugBox :k="current.id" :dir="dir" class="row__name" aria-live="polite" data-dot-clear>
        <h2 class="row__title">
          {{ current.title }}
        </h2>
      </HugBox>
      <ProjectTools :card="current" class="row__tools" />
    </div>
  </div>
</template>

<style scoped>
.stack {
  --muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  position: absolute;
  inset: var(--header-h) 0 var(--stack-b, 0px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 16px; /* Will, 2026-10-04: "tighter" (was 28). PLACEHOLDER value; CHIPS counts it */
}

/* Chips (Will, 2026-10-05: "pill"): the row is one glass capsule and the chips inside it are bare, so no chip's own
   blur softens the pill sliding beneath it */
.chips {
  translate: 0 calc(var(--sy, 0px) * var(--plx-chips));
  position: relative;
  z-index: 3000;
  display: flex;
  background: var(--fill);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
}

/* The fill spans the row and is clipped to the pressed chip, so it slides on clip-path alone */
.chips__pill {
  position: absolute;
  inset: 0;
  background: var(--c-fg);
  opacity: 0;
  pointer-events: none;
  transition: clip-path 260ms var(--ease-out);
}

.chips__pill.on {
  opacity: 1;
}

.chip {
  position: relative;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: color 260ms var(--ease-out);
}

@media (hover: hover) and (pointer: fine) {
  .chip:hover {
    color: var(--c-fg);
  }
}

.chip[aria-pressed='true'] {
  color: var(--c-bg);
}

.chip sup {
  font-size: 9px;
  margin-left: 3px;
  opacity: 0.6;
}

.chip:focus-visible,
.strip:focus-visible,
.card:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 2px;
}

.strip {
  position: relative;
  width: 100vw;
  height: var(--strip-h, 460px);
  touch-action: none;
  user-select: none;
}

.strip:focus-visible {
  outline-offset: -2px;
}

.world {
  position: absolute;
  inset: 0;
}

/* Depth layers (Will, 2026-10-06): as the Landing falls behind the panel (the stage scrolls at 0.6×, app.vue), each
   layer adds its own offset, so the side cards sink deepest and the chips stay nearest. Net speeds: side cards 0.35×,
   centre card 0.6×, info row 0.7×, chips 0.75×. The side cards also part outward (Will, 2026-10-06: "part + recede"),
   so they leave the margins beside the rising panel without being cut. `translate` stacks on the projected
   `transform` the ring sets per frame. PLACEHOLDER: the factors */
.stack {
  --plx-side: 0.25;
  --plx-row: -0.1;
  --plx-chips: -0.15;
  --plx-out: 0.7;
}

.card:not(.card--centre) {
  translate: calc(var(--dir, 0) * var(--sy, 0px) * var(--plx-out)) calc(var(--sy, 0px) * var(--plx-side));
}

/* The plates come back from the card (Will, 2026-10-06: "Deal"). Off the Landing they wait behind the centre card
   (under it in z), the tag and tools gathered under the name. Back home the chips and the row slide out from the
   card's edges, rising over it once clear, then the tag and tools fan out to their sides. Leaving, they tuck back in
   160ms. PLACEHOLDER: the timings */
.chips,
.row {
  transition: translate 520ms var(--ease-drawer), z-index 0s 520ms;
}

.row {
  transition-duration: 340ms, 0s;
  transition-delay: 0ms, 340ms;
}

.row > * {
  transition: translate 360ms var(--ease-drawer) 200ms;
}

.row > :nth-child(2) {
  position: relative;
  z-index: 1; /* the tag and tools gather under the name */
}

.row > :last-child {
  transition-delay: 240ms;
}

.stack--away .chips,
.stack--away .row {
  z-index: 1;
  transition: translate 160ms var(--ease-out), z-index 0s;
}

.stack--away .chips {
  translate: 0 calc(100% + 16px);
}

.stack--away .row {
  translate: -50% calc(-100% - 16px);
}

.stack--away .row > * {
  transition: translate 0s;
}

.stack--away .row > :first-child {
  translate: calc(var(--row-w, 600px) / 2 - 50%) 0;
}

.stack--away .row > :last-child {
  translate: calc(50% - var(--row-w, 600px) / 2) 0;
}

.card {
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 0;
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 8px; /* Will, 2026-10-05: no glass frame, the teaser runs to the lit edge, rounded like the plates */
  overflow: hidden;
  background: var(--fill);
  cursor: pointer;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Side cards are mono: black and white at full brightness, +10% contrast; colour returns over the last card-width */
.card img,
.card video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(var(--side, 0)) contrast(calc(1 + var(--side, 0) * 0.1));
  transition: transform 180ms var(--ease-out), opacity 0.6s var(--ease-out-expo);
}

.card video {
  opacity: 0;
}

.card video.on {
  opacity: 1;
}

/* Card "lift" (Will, 2026-10-05): the centre teaser grows a touch on hover and dips while pressed. The card's own
   transform is the ring's (set per frame), so this acts on the teaser inside the frame. */
.card:active img,
.card:active video {
  transform: scale(0.985);
}

@media (hover: hover) and (pointer: fine) {
  .card--centre:hover:not(:active) img,
  .card--centre:hover:not(:active) video {
    transform: scale(1.015);
  }
}

/* Timer: a hairline in the centre card's bottom frame that fills until the next auto-step; holds on hover */
.card__bar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  height: 2px;
  background: var(--c-fg);
  opacity: 0.35;
  transform-origin: 0 50%;
  animation: card-bar linear both;
}

.card__bar.paused {
  animation-play-state: paused;
}

@keyframes card-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* The info row: as wide as the grown centre card (--row-w), --row-b above the screen's foot. Equal sides keep the
   name on the card's centre line. */
.row {
  /* The tag plate and tool tiles (Will, 2026-10-05: 36px, under the name plate's 42px); corners scale with the
     name plate's 8px */
  --side-h: 36px;
  --icon: 18px;
  --tag-f: 11.5px;
  --side-r: calc(var(--side-h) * 8 / 42);
  position: fixed;
  left: 50%;
  bottom: var(--row-b, 16px);
  translate: -50% calc(var(--sy, 0px) * var(--plx-row));
  z-index: 3000;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: 'tag name tools';
  align-items: center;
  gap: 12px;
  width: var(--row-w, 600px);
  container: row / inline-size;
}

.row__tag {
  --hug-r: var(--side-r);
  --hug-fill: var(--plate-solid); /* the same solid plate as the tool tiles (Will, 2026-10-05) */
  grid-area: tag;
  justify-self: start;
}

.row__name {
  grid-area: name;
  min-width: 0;
}

.row__tools {
  grid-area: tools;
  justify-self: end;
}

/* Narrow cards (1280px screens): the tag and tiles step down to 32px and the tiles close up, so a long name with
   three logos stays on the card's centre */
@container row (400px <= width < 480px) {
  .row__tag,
  .row__tools {
    --side-h: 32px;
    --icon: 16px;
    --tag-f: 11px;
    --side-r: calc(32px * 8 / 42);
    --tile-gap: 2px;
  }
}

/* PLACEHOLDER: weight 600 */
.row__tag-text {
  display: block;
  padding: 0 calc(var(--side-h) * 0.4);
  font: 600 var(--tag-f)/calc(var(--side-h) - 2px) var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.row__title {
  margin: 0;
  padding: 0 20px;
  font: 500 18px/40px var(--font-ui);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Phones: the name takes its own line above the tag and tools, and shrinks so it doesn't outweigh the teaser */
@media (max-width: 480px) {
  .row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'name name' 'tag tools';
    row-gap: 8px;
  }

  .row__name {
    justify-self: center;
    max-width: 100%;
  }

  .row__title {
    padding: 0 12px;
    font-size: 15px;
    line-height: 36px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card img,
  .card video {
    transition: opacity 0.6s var(--ease-out-expo);
  }

  .card--centre img,
  .card--centre video {
    transform: none !important;
  }

  .chips__pill {
    transition: none;
  }
}
</style>
