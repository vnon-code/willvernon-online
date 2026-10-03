<script setup lang="ts">
import strip from '~~/content/strip.json'

// The project strip (docs/specs/project-strip.md; reference prototype/project-strip.html?v=insidebig&auto=step&sides=mono).
// An endless ring of cards seen from inside. Scroll, drag, keys or a click turn it; left alone it steps every 10s.
const props = defineProps<{ active: boolean }>()

type Card = (typeof strip.cards)[number] & { title: string }

// Titles are looked up in the source files at prerender time, so the large content JSON stays out of the client bundle
const { data: allCards } = await useAsyncData('strip-cards', async () => {
  // Server only: the client reads the payload, and this branch (with the content chunks) is dropped from its build
  if (import.meta.client) return []
  const [{ caseStudies }, { projects }, { items }] = await Promise.all([
    import('~~/content/projects.json'),
    import('~~/content/ai.json'),
    import('~~/content/experiments.json'),
  ])
  const titles: Record<string, Record<string, string>> = {
    projects: Object.fromEntries(caseStudies.map(p => [p.slug, p.title])),
    ai: Object.fromEntries(projects.map(p => [p.key, p.title])),
    experiments: Object.fromEntries(items.map(p => [p.id, p.title])),
  }
  return strip.cards.map(c => ({ ...c, title: titles[c.from]![c.id]! }))
})

const chip = ref('All')
const cards = computed<Card[]>(() => (allCards.value ?? []).filter(c => chip.value === 'All' || c.chip === chip.value))
const countFor = (k: string) => (allCards.value ?? []).filter(c => k === 'All' || c.chip === k).length
const centre = ref(-1) // set on mount, so the first card's teaser starts
const current = computed(() => cards.value[centre.value])
const pad = (i: number) => String(i).padStart(2, '0')

// Ring geometry and motion (spec values, measured at 1280×800)
const FOCAL = 1600 // px perspective
const RADIUS = 0.55 // × viewport width
const SPACING = 1.04 // × card width along the ring
const GROW = 0.6 // centre card grows to 1.6×
const PUSH = 0.3 // neighbours move out by 30% of a card width
const FADE: [number, number] = [1.0, 1.35] // radians from the centre
const EASE = 0.085 // per frame at 60fps
const WHEEL_PX = 360 // wheel travel per card
const DRAG_W = 0.28 // × viewport width per card
const SNAP_MS = 140
const STEP_REST = 10000 // Auto: Step (Will)
const IDLE_RESUME = 3000
const TEASER_DELAY = 250
const STACK_REST = 160 // px: chips, caption and the two gaps around the strip

const stripEl = ref<HTMLElement>()
const cardEls: Record<string, HTMLElement> = {}
const videoEls: Record<string, HTMLVideoElement> = {}
const started = reactive<Record<string, boolean>>({}) // video element created (on first use)
const playing = reactive<Record<string, boolean>>({}) // video playing (fades in) or GIF showing

let target = 0, pos = 0, raf = 0, last = 0
let reduced = false
let hudClear = 0
let snapTimer = 0, autoTimer = 0, teaserTimer = 0
let hovered = ''
let drag: { x: number, y: number, t: number } | null = null
let moved = false

const n = () => cards.value.length
const mod = (v: number, m: number) => ((v % m) + m) % m
// Shortest signed distance on the loop, in (-n/2, n/2]
const wrap = (d: number) => n() < 2 ? 0 : mod(d + n() / 2, n()) - n() / 2
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const inOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

// Cards are projected to 2D by hand and stacked by depth (CSS preserve-3d re-sorted the planes and made cards pop)
function layout() {
  const W = innerWidth, H = innerHeight
  const cw = Math.min(W * 0.32, H * 0.4 * 16 / 9), ch = cw * 9 / 16
  // The strip area is 2× card height, squeezed (never below the big centre card) to fit above the Sound HUD
  const room = H - hudClear - STACK_REST
  stripEl.value?.style.setProperty('--strip-h', `${Math.max(ch * (1 + GROW) + 16, Math.min(ch * 2, room))}px`)
  const R = W * RADIUS, step = (cw * SPACING) / R
  cards.value.forEach((c, i) => {
    const el = cardEls[c.id]
    if (!el) return
    const d = wrap(i - pos), a = Math.abs(d), near = inOut(Math.max(0, 1 - a))
    const th = d * step
    const X = R * Math.sin(th), Z = R * (1 - Math.cos(th)) * 0.85
    const p = FOCAL / (FOCAL - Z)
    const x = X * p + Math.sign(d) * Math.min(a, 1) * cw * PUSH * p
    const op = 1 - smooth(FADE[0], FADE[1], Math.abs(th))
    el.style.width = `${cw}px`
    el.style.height = `${ch}px`
    el.style.transform = `translate(-50%, -50%) translate(${x}px, 0) scale(${p * (1 + GROW * near)}) perspective(${FOCAL}px) rotateY(${-th}rad)`
    el.style.zIndex = String(Math.round(2000 + Z))
    el.style.opacity = String(op)
    el.style.visibility = op <= 0.01 ? 'hidden' : 'visible'
    el.style.setProperty('--side', Math.min(a, 1).toFixed(3))
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
  setCentre(mod(Math.round(pos), n()))
  raf = pos !== target || drag ? requestAnimationFrame(tick) : 0
}

function go(t: number) {
  target = t
  wake()
}

// Auto: Step. 10s on a card, then glide to the next; restarts 3s after the last input; paused on the centre card
function scheduleAuto(ms: number) {
  clearTimeout(autoTimer)
  if (reduced || n() < 2 || !props.active) return
  autoTimer = window.setTimeout(() => {
    if (hovered && hovered === current.value?.id) return // pointerleave reschedules
    go(Math.round(target) + 1)
    scheduleAuto(STEP_REST)
  }, ms)
}
const touch = () => scheduleAuto(IDLE_RESUME + STEP_REST)

function setCentre(i: number) {
  if (i === centre.value) return
  centre.value = i
  playTeaser()
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
  // PLACEHOLDER: the centre card does nothing until project pages exist
  if (i === centre.value) return
  go(Math.round(target) + wrap(i - Math.round(target)))
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

function onHover(id: string, on: boolean) {
  hovered = on ? id : ''
  if (!on) scheduleAuto(STEP_REST)
}

// Filter change: the ring rebuilds with the filtered cards and starts at the first. PLACEHOLDER: no transition yet.
async function setChip(k: string) {
  if (k === chip.value) return
  chip.value = k
  target = pos = 0
  centre.value = -1
  await nextTick()
  layout()
  setCentre(0)
  touch()
}

watch(() => props.active, (on) => {
  if (on) scheduleAuto(STEP_REST)
  else clearTimeout(autoTimer)
})

onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  hudClear = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud-clear')) || 0
  layout()
  setCentre(0)
  if (props.active) scheduleAuto(STEP_REST)
  addEventListener('wheel', onWheel, { passive: false })
  addEventListener('pointermove', onPointerMove)
  addEventListener('pointerup', onPointerUp)
  addEventListener('pointercancel', onPointerUp)
  addEventListener('resize', layout)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  ;[snapTimer, autoTimer, teaserTimer].forEach(clearTimeout)
  removeEventListener('wheel', onWheel)
  removeEventListener('pointermove', onPointerMove)
  removeEventListener('pointerup', onPointerUp)
  removeEventListener('pointercancel', onPointerUp)
  removeEventListener('resize', layout)
})
</script>

<template>
  <div class="stack">
    <div class="chips" role="group" aria-label="Filter projects">
      <button
        v-for="k in strip.chips"
        :key="k"
        class="chip"
        :aria-pressed="k === chip"
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
      <button
        v-for="(c, i) in cards"
        :key="c.id"
        :ref="(el) => { if (el) cardEls[c.id] = el as HTMLElement }"
        class="card"
        type="button"
        :aria-label="c.title"
        @click="onCardClick(i)"
        @pointerenter="onHover(c.id, true)"
        @pointerleave="onHover(c.id, false)"
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
      </button>
    </section>

    <div v-if="current" class="caption" aria-live="polite">
      <div class="caption__count">
        <b>{{ pad(centre + 1) }}</b> / {{ pad(cards.length) }}
      </div>
      <div class="caption__title">
        <span :key="current.id">{{ current.title }}</span>
      </div>
      <div class="caption__discipline">
        <span :key="current.id">{{ current.discipline }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stack {
  --muted: color-mix(in srgb, var(--c-fg) 50%, transparent);
  --line: color-mix(in srgb, var(--c-fg) 14%, transparent);
  position: absolute;
  inset: 0 0 var(--hud-clear);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.chips {
  position: relative;
  z-index: 3000;
  display: flex;
  gap: 6px;
}

.chip {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  background: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: color 0.3s var(--ease-out-expo), border-color 0.3s var(--ease-out-expo), background 0.3s var(--ease-out-expo);
}

.chip:hover {
  color: var(--c-fg);
}

.chip[aria-pressed='true'] {
  color: var(--c-bg);
  background: var(--c-fg);
  border-color: var(--c-fg);
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

.card {
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 0;
  border: 0;
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, var(--c-fg) 6%, var(--c-bg));
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
}

.card video {
  opacity: 0;
  transition: opacity 0.6s var(--ease-out-expo);
}

.card video.on {
  opacity: 1;
}

.caption {
  position: relative;
  z-index: 3000;
  display: grid;
  justify-items: center;
  gap: 6px;
  min-height: 64px;
  text-align: center;
}

.caption__count {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.caption__count b {
  color: var(--c-accent);
  font-weight: 500;
}

.caption__title {
  font: 600 clamp(22px, 2.4vw, 34px)/1.05 var(--font-ui);
  letter-spacing: -0.02em;
  height: 1.1em;
  overflow: hidden;
}

.caption__discipline {
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  height: 1.2em;
  overflow: hidden;
}

.caption__title span,
.caption__discipline span {
  display: block;
  animation: roll 0.55s var(--ease-out-expo);
}

@keyframes roll {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .caption__title span,
  .caption__discipline span {
    animation: none;
  }
}
</style>
