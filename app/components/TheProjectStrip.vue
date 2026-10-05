<script setup lang="ts">
import strip from '~~/content/strip.json'
import type { ProtoCard, ProtoText } from '~/composables/useProto'

// The project strip (docs/specs/project-strip.md; reference prototype/project-strip.html?v=insidebig&auto=step&sides=mono).
// An endless ring of cards seen from inside. Scroll, drag, keys or a click turn it; left alone it steps every 10s.
const props = defineProps<{ active: boolean }>()
// The centred card, for the Landing background's palette
const emit = defineEmits<{
  centre: [card: { poster: string, teaser?: string | null }]
  expand: [e: { card: ProtoCard, from: DOMRect }] // PROTOTYPE (/proto)
}>()
// PROTOTYPE (/proto): info layout variants and the expanded view. Remove with useProto.
const proto = useProto()
const info = computed(() => proto.v.value.info)
// PROTOTYPE: the interaction options (useProtoFx.ts): sounds, the field's kick, the name and timer
const fx = useProtoFx()
const dir = ref(1) // the strip's last travel, for the name's slide
const shown = ref('') // the name as drawn (scrambles in, in 'scramble')
const bar = reactive({ key: 0, ms: 0, paused: false }) // the auto-step timer in the name box
const chipEls: Record<string, HTMLElement> = {}
const pill = reactive({ l: 0, r: 0, on: false }) // chips 'pill': the indicator's clip (px in from each side)

type Card = (typeof strip.cards)[number] & ProtoText

// Titles are looked up in the source files at prerender time, so the large content JSON stays out of the client bundle
const { data: allCards } = await useAsyncData('strip-cards', async () => {
  // Server only: the client reads the payload, and this branch (with the content chunks) is dropped from its build
  if (import.meta.client) return []
  const [{ caseStudies }, { projects }, { items }] = await Promise.all([
    import('~~/content/projects.json'),
    import('~~/content/ai.json'),
    import('~~/content/experiments.json'),
  ])
  // Title, short description and tools (software; tags for AI work) for the caption and the summary panel
  // PROTOTYPE: `long` and `process` feed /proto's expanded view only
  const info: Record<string, Record<string, ProtoText>> = {
    projects: Object.fromEntries(caseStudies.map(p => [p.slug, {
      title: p.title, summary: p.descShort, tools: p.software, long: p.descLong,
      process: p.process.map(s => ({ title: s.title, text: s.text })),
    }])),
    ai: Object.fromEntries(projects.map(p => [p.key, { title: p.title, summary: p.desc, tools: p.tags, long: '', process: [] }])),
    experiments: Object.fromEntries(items.map(p => [p.id, { title: p.title, summary: p.descShort, tools: p.software, long: '', process: [] }])),
  }
  return strip.cards.map(c => ({ ...c, ...info[c.from]![c.id]! }))
})

const chip = ref('All')
const picked = ref('All') // the pressed chip; `chip` (the filtered set) follows after the sweep-out
const cards = computed<Card[]>(() => (allCards.value ?? []).filter(c => chip.value === 'All' || c.chip === chip.value))
const countFor = (k: string) => (allCards.value ?? []).filter(c => k === 'All' || c.chip === k).length
const centre = ref(-1) // set on mount, so the first card's teaser starts
const current = computed(() => cards.value[centre.value])
watch(current, (c) => { if (c) emit('centre', c) })
const pad = (i: number) => String(i).padStart(2, '0')

// Ring geometry and motion (spec values, measured at 1280×800)
const FOCAL = 1600 // px perspective
const SPACING = 1.04 // × card width along the ring
// Desktop: card 32% wide, ring radius 55% of the width, centre grows 1.6×, neighbours pushed out 30% of a card,
// fading out 1.0–1.35 rad from the centre. Phones (Peek): card 72% wide, flatter ring, a sliver of each neighbour.
// PLACEHOLDER (Will, 2026-10-04: "carousel too big"): width 0.32 → 0.26, grow 0.6 → 0.35
const RING = { width: 0.26, radius: 0.55, grow: 0.35, push: 0.3, fade: [1.0, 1.35] }
const PHONE = { width: 0.72, radius: 1.6, grow: 0, push: 0, fade: [0.55, 0.8] }
const PHONE_MAX = 640 // px viewport width
const AIR = 24 // px kept clear above the chips and below the caption
const EASE = 0.085 // per frame at 60fps
const WHEEL_PX = 360 // wheel travel per card
const DRAG_W = 0.28 // × viewport width per card
const SNAP_MS = 140
const STEP_REST = 10000 // Auto: Step (Will)
const IDLE_RESUME = 3000
const TEASER_DELAY = 250
const BOTTOM_ROW_MIN = 1100 // px viewport width: drawers left and right, summary between them
const DRAWER_SIDE = 449 // px each side: a drawer (417) and 16px air on both sides of it
const STACK_REST = 136 // px: chips (32), caption (72) and the two 16px gaps around the strip
// PROTOTYPE: /proto has no caption under the strip (its info moved to the tools box and the bottom name box)
const PROTO_REST = { now: 0, centred: -88 }
const SWEEP_OUT = 220 // ms: filter change, old set fades while turning on
const SWEEP_IN = 380 // ms: new set fades in while spinning in from the right
const SWEEP_FROM = -2.2 // cards: where the new set starts turning from

const stripEl = ref<HTMLElement>()
const infoEl = ref<HTMLElement>() // PROTOTYPE: the summary panel (info 'now')
const protoRow = ref<HTMLElement>() // PROTOTYPE: the info row (tag, name, tools)
// PROTOTYPE: the tag under the card's left edge, by content source (Will, 2026-10-05)
const TAG: Record<string, string> = { projects: 'Project', experiments: 'Experiment', ai: 'AI' }
// PROTOTYPE 'centred' (Will, 2026-10-05, locked in): chips, strip and the info row form one block, centred between the
// header and the screen's foot. 16:9 cards at the ring's own scale. An open drawer that would cover the block pushes
// it up (lift). The info row (Will, 2026-10-05): the name under the card's left edge, the tools under its right edge.
const PLACE = { h: 42 } // PLACEHOLDER: name box height, matched to the tools box beside it
const CENTRED = { gap: 16, b: 36 } // px: centre card to the info row; the row's floor, clear of the drawer tabs
const dock = { w: 417, h: 196 } // PROTOTYPE: open drawer panel size, measured
const drawerState = useState<Record<string, boolean>>('drawers', () => ({}))
watch(drawerState, () => { if (info.value === 'centred') nextTick(onResize) }, { deep: true })
// The tools box changes height when a project has none, so lay out again once the new one has rendered
watch(current, () => { if (info.value === 'centred') nextTick(onResize) })
const worldEl = ref<HTMLElement>()
const cardEls: Record<string, HTMLElement> = {}
const videoEls: Record<string, HTMLVideoElement> = {}
const started = reactive<Record<string, boolean>>({}) // video element created (on first use)
const playing = reactive<Record<string, boolean>>({}) // video playing (fades in) or GIF showing

let target = 0, pos = 0, raf = 0, last = 0
let reduced = false
let hudClear = 0, headerH = 0
let snapTimer = 0, autoTimer = 0, teaserTimer = 0
let hovered = ''
let drag: { x: number, y: number, t: number } | null = null
let moved = false
let sweeping = false // filter change in progress: the caption holds on the new first card

const n = () => cards.value.length
const mod = (v: number, m: number) => ((v % m) + m) % m
// Shortest signed distance on the loop, in (-n/2, n/2]
const wrap = (d: number) => n() < 2 ? 0 : mod(d + n() / 2, n()) - n() / 2
const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const inOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

// The header row and the HUD toggle's space come from tokens (the header grows a row on phones)
function readLayoutVars() {
  const rootStyle = getComputedStyle(document.documentElement)
  hudClear = parseFloat(rootStyle.getPropertyValue('--hud-clear')) || 0
  headerH = parseFloat(rootStyle.getPropertyValue('--header-h')) || 0
}
const onResize = () => {
  readLayoutVars()
  const panel = document.querySelector<HTMLElement>('.dock--left .panel')
  if (panel) Object.assign(dock, { w: panel.offsetWidth, h: panel.offsetHeight })
  layout()
}

// Cards are projected to 2D by hand and stacked by depth (CSS preserve-3d re-sorted the planes and made cards pop)
let sized = { cw: 0, ch: 0 }

// PROTOTYPE 'centred': size the strip and place the block (a second pass when an open drawer lifts it)
function centredLayout(W: number, H: number, g: typeof RING) {
  const box = stripEl.value?.parentElement?.style
  const h = protoRow.value?.offsetHeight || PLACE.h
  const place = (b: number) => {
    const room = H - headerH - h - CENTRED.gap - b - STACK_REST - PROTO_REST.centred - 2 * AIR
    const cw = Math.min(W * g.width, H * 0.4 * 16 / 9, ((room - 16) / (1 + g.grow)) * 16 / 9), ch = cw * 9 / 16
    const stripH = Math.min(ch * (1 + g.grow), room)
    const slack = Math.max(0, H - headerH - b - (48 + stripH + CENTRED.gap + h))
    return { cw, ch, stripH, clear: H - (headerH + slack / 2 + 48 + stripH), iw: Math.min(W - 32, cw * (1 + g.grow)) }
  }
  let r = place(CENTRED.b)
  const l = (W - r.iw) / 2, rt = (W + r.iw) / 2
  const hit = (s: string) => !!document.querySelector(`.dock--${s}.dock--open`)
    && (W < PHONE_MAX || (s === 'left' ? l < 16 + dock.w + 8 : rt > W - 16 - dock.w - 8))
  if (hit('left') || hit('right')) r = place(16 + dock.h + CENTRED.gap)
  box?.setProperty('--hud-clear', `${r.clear}px`)
  box?.setProperty('--info-b', `${r.clear - CENTRED.gap - h}px`)
  box?.setProperty('justify-content', 'flex-end')
  box?.setProperty('--centre-w', `${Math.round(r.iw)}px`)
  stripEl.value?.style.setProperty('--strip-h', `${r.stripH}px`)
  sized = { cw: r.cw, ch: r.ch }
}

function layout() {
  const W = innerWidth, H = innerHeight
  const g = W < PHONE_MAX ? PHONE : RING
  // Fit (Claude's pick, 2026-10-03): the stack keeps AIR above the chips and below the caption, above the Sound HUD.
  // Cards shrink with height when the grown centre card wouldn't fit; the strip area is 2× card height at most.
  if (info.value === 'centred') centredLayout(W, H, g)
  else {
    // From 1100px the summary sits between the two mixer drawers and matches the centre card's width, so the
    // centre card is capped to that gap (Will, 2026-10-04): it only bites below ~1400px
    const gap = W >= BOTTOM_ROW_MIN ? (W - 2 * DRAWER_SIDE) / (1 + g.grow) : Infinity
    stripEl.value?.parentElement?.style.setProperty('--hud-clear', `${hudClear}px`)
    const room = H - headerH - hudClear - STACK_REST - 2 * AIR
    const cw = Math.min(W * g.width, H * 0.4 * 16 / 9, ((room - 16) / (1 + g.grow)) * 16 / 9, gap), ch = cw * 9 / 16
    stripEl.value?.style.setProperty('--strip-h', `${Math.min(ch * (1 + g.grow), room)}px`)
    stripEl.value?.parentElement?.style.setProperty('--centre-w', `${Math.round(cw * (1 + g.grow))}px`)
    sized = { cw, ch }
  }
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

// Auto: Step. 10s on a card, then glide to the next; restarts 3s after the last input; paused on the centre card
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

function setCentre(i: number) {
  if (i === centre.value) return
  const prev = centre.value
  centre.value = i
  playTeaser()
  // PROTOTYPE: a tick per card passed, the field kicks from the new centre card
  if (prev < 0 || !fx.on.value) return
  dir.value = Math.sign(wrap(i - prev)) || 1
  fx.sfx('step', i)
  const c = current.value
  if (c) fx.kickField(cardEls[c.id])
}

// PROTOTYPE 'scramble': the new name resolves left to right out of random glyphs
const GLYPHS = 'abcdefghijklmnopqrstuvwxyz' // lowercase: no wider than the name it resolves into
let scrambleRaf = 0
watch(() => current.value?.title, (t) => {
  shown.value = t ?? ''
  if (!import.meta.client) return
  cancelAnimationFrame(scrambleRaf)
  if (!t || reduced || !fx.on.value || fx.opt.value.name !== 'scramble') return
  const t0 = performance.now(), dur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fx-name')) * 1.4 || 360
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur), done = Math.floor(k * t.length)
    shown.value = t.slice(0, done) + [...t.slice(done)].map(ch => ch === ' ' ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join('')
    if (k < 1) scrambleRaf = requestAnimationFrame(step)
  }
  scrambleRaf = requestAnimationFrame(step)
}, { immediate: true })

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

// PROTOTYPE: the Sheet grows out of the info block (the centre card, or the info's own Open control)
function openSheet() {
  const c = current.value
  if (!proto.on.value || !c) return
  const from = (info.value === 'now' ? infoEl.value : cardEls[c.id]) ?? cardEls[c.id] // /proto: grows out of the centre card
  fx.sfx('sheetOpen')
  emit('expand', { card: c as ProtoCard, from: from!.getBoundingClientRect() })
}

function onCardClick(i: number) {
  if (moved) return
  touch()
  // PLACEHOLDER: the centre card does nothing until project pages exist (on /proto it opens the expanded view)
  if (i === centre.value) return openSheet()
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
  bar.paused = on && id === current.value?.id
  if (on) fx.sfx('hover', cards.value.findIndex(c => c.id === id))
  if (!on) scheduleAuto(STEP_REST)
}

// PROTOTYPE card 'tilt': the centre card leans towards the pointer (fine pointers only)
function onCardMove(e: PointerEvent, id: string) {
  if (e.pointerType !== 'mouse' || id !== current.value?.id) return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const el = e.currentTarget as HTMLElement
  el.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
  el.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
}

// PROTOTYPE chips 'pill': one filled pill slides between chips instead of each chip filling
// Pill mode changes the row's spacing, so re-place it when the option flips (CSS applies on the next frame)
watch(() => fx.opt.value.chips, () => requestAnimationFrame(() => requestAnimationFrame(placePill)))
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
  fx.sfx('chip', strip.chips.indexOf(k))
  placePill()
  if (!reduced) {
    go(target + 0.6)
    await fadeWorld(1, 0, SWEEP_OUT, 'ease-in')
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
  else clearTimeout(autoTimer)
})

onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  readLayoutVars()
  layout()
  setCentre(0)
  if (props.active) scheduleAuto(STEP_REST)
  placePill()
  addEventListener('wheel', onWheel, { passive: false })
  addEventListener('pointermove', onPointerMove)
  addEventListener('pointerup', onPointerUp)
  addEventListener('pointercancel', onPointerUp)
  addEventListener('resize', onResize)
  // PROTOTYPE: hooks for the layout search on /proto (size the info box, jump to a card without motion)
  if (proto.on.value) {
    Object.assign(window, {
      __protoGoto: (i: number) => { clearTimeout(autoTimer); cancelAnimationFrame(raf); raf = 0; pos = target = i; setCentre(mod(i, n())); layout() }, // frozen: no auto-step mid-measure
    })
  }
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
  <div class="stack">
    <div class="chips" role="group" aria-label="Filter projects" data-dot-clear>
      <span v-if="fx.on.value" class="chips__pill" :class="{ on: pill.on }" :style="{ clipPath: `inset(0 ${pill.r}px 0 ${pill.l}px round 999px)` }" aria-hidden="true" />
      <button
        v-for="k in strip.chips"
        :key="k"
        :ref="(el) => { if (el) chipEls[k] = el as HTMLElement }"
        class="chip"
        :aria-pressed="k === picked"
        @click="setChip(k)"
        @pointerenter="(e) => { if (e.pointerType === 'mouse' && k !== picked) fx.sfx('hover', 0, 'tick') }"
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
      <div ref="worldEl" class="world">
        <button
          v-for="(c, i) in cards"
          :key="c.id"
          :ref="(el) => { if (el) cardEls[c.id] = el as HTMLElement }"
          class="card"
          :class="{ 'card--centre': c.id === current?.id }"
          type="button"
          :aria-label="c.title"
          @click="onCardClick(i)"
          @pointerenter="onHover(c.id, true)"
          @pointerleave="onHover(c.id, false)"
          @pointermove="onCardMove($event, c.id)"
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
          <!-- PROTOTYPE timer (Will, 2026-10-05): along the centre card's bottom border, filling to the next auto-step -->
          <span
            v-if="c.id === current?.id && fx.opt.value.progress === 'bar'"
            :key="bar.key"
            class="card__bar"
            :class="{ paused: bar.paused }"
            :style="{ animationDuration: `${bar.ms}ms` }"
            aria-hidden="true"
          />
        </button>
      </div>
    </section>

    <div v-if="current && info === 'now'" class="caption" aria-live="polite" data-dot-clear>
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

    <!-- PROTOTYPE 'centred': one row under the centre card (Will, 2026-10-05): the tag at its left edge, the name
         centred, the tools at its right edge -->
    <div v-else-if="current" ref="protoRow" class="proto-row">
      <ProtoHug :k="current.from" :dir="dir" class="proto-tag hug--tag" data-dot-clear>
        <span class="proto-tag__text">{{ TAG[current.from] ?? current.chip }}</span>
      </ProtoHug>
      <ProtoHug :k="current.id" :dir="dir" class="proto-place hug--name" :style="{ '--place-h': `${PLACE.h}px` }" aria-live="polite" data-dot-clear>
        <h2 class="proto-place__title">
          <span class="sr">{{ current.title }}</span>
          <!-- the real name sets the width; the drawn one (scrambling) lies over it -->
          <span class="proto-place__ghost" aria-hidden="true">{{ current.title }}</span>
          <span class="proto-place__drawn" aria-hidden="true">{{ shown || current.title }}</span>
        </h2>
      </ProtoHug>
      <ProtoInfo :card="current" :dir="dir" class="proto-tools hug--tools" />
    </div>

    <!-- Project summary (Will, 2026-10-04): fixed at the bottom centre, between the two mixer drawers -->
    <aside
      v-if="current && info === 'now'"
      :ref="(el) => { if (el) infoEl = el as HTMLElement }"
      class="summary"
      aria-live="polite"
      data-dot-clear
    >
      <p :key="current.id" class="summary__text">
        {{ current.summary }}
      </p>
      <ul :key="`t-${current.id}`" class="summary__tools" aria-label="Tools">
        <li v-for="t in current.tools.slice(0, 4)" :key="t">
          {{ t }}
        </li>
      </ul>
    </aside>
  </div>
</template>

<style scoped>
/* PROTOTYPE 'centred': the info row, as wide as the grown centre card (`--centre-w`) and `--info-b` above the screen
   edge (at least CENTRED.b, so it clears the drawer tabs) */
.proto-row {
  position: fixed;
  left: 50%;
  bottom: var(--info-b, 16px);
  translate: -50% 0;
  z-index: 3000;
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* equal sides keep the name on the card's centre line */
  grid-template-areas: 'tag name tools';
  align-items: center;
  gap: 12px;
  width: var(--centre-w, 600px);
}

.proto-tag {
  grid-area: tag;
  justify-self: start;
}

.proto-place {
  grid-area: name;
  min-width: 0;
}

.proto-tools {
  grid-area: tools;
  justify-self: end;
}

/* PLACEHOLDER: the tag's type, after the filter chips' small caps */
.proto-tag__text {
  display: block;
  padding: 0 calc(var(--side-h, 42px) * 0.4); /* scales with the tag's height */
  font: 600 var(--tag-f, 12px)/calc(var(--side-h, 42px) - 2px) var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* PROTOTYPE Sides (Will, 2026-10-05: smaller than the name plate's 42px; the size is the open row). The tag plate and
   each tool tile are --side-h tall; corners scale with the name plate's 8px. */
.proto-row { --side-h: 36px; --icon: 18px; --tag-f: 11.5px; --side-r: calc(var(--side-h) * 8 / 42); container: row / inline-size; }
:root[data-fx-sides='s30'] .proto-row { --side-h: 30px; --icon: 14px; --tag-f: 10px; }
:root[data-fx-sides='s34'] .proto-row { --side-h: 34px; --icon: 16px; --tag-f: 11px; }
:root[data-fx-sides='s36'] .proto-row { --side-h: 36px; --icon: 18px; --tag-f: 11.5px; }
:root[data-fx-sides='s38'] .proto-row { --side-h: 38px; --icon: 20px; --tag-f: 12px; }

/* Narrow cards (1280px screens): the tag and tiles step down to 32px and the tiles close up, so a long name with three
   logos stays on the card's centre */
@container row (400px <= width < 480px) {
  .proto-row .proto-tag,
  .proto-row .proto-tools {
    --side-h: 32px;
    --icon: 16px;
    --tag-f: 11px;
    --side-r: calc(32px * 8 / 42);
  }

  .proto-row .proto-tools :deep(.tools) {
    gap: 2px;
  }
}

/* Morph from the edge each box is pinned to, so the tag's left and the tools' right edges never move */
.proto-tag :deep(.hug__bg) { transform-origin: 0 50%; }
.proto-tools :deep(.hug__bg) { transform-origin: 100% 50%; }

/* Plates (Will, 2026-10-05): the name and the tag on glass with a faint 10% hairline and soft corners */
.proto-place :deep(.hug__bg),
.proto-tag :deep(.hug__bg) {
  border-color: color-mix(in srgb, var(--c-fg) 10%, transparent);
  border-radius: 8px;
}

.proto-tag :deep(.hug__bg) {
  border-radius: var(--side-r);
}

/* Tiles (Will, 2026-10-05): no tools box; each logo on its own plate, the tag's height */
.proto-tools :deep(.hug__bg) {
  background: none;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.proto-tools :deep(.tools) {
  padding: 0;
  gap: 4px;
}

.proto-tools :deep(.tools li) {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: var(--side-h);
  height: var(--side-h);
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid color-mix(in srgb, var(--c-fg) 10%, transparent);
  border-radius: var(--side-r);
}

/* Phones: the name takes its own line above the tag and tools */
@media (max-width: 480px) {
  .proto-row {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'name name' 'tag tools';
    row-gap: 8px;
  }

  .proto-place {
    justify-self: center;
    max-width: 100%;
  }

  /* final judge: on phones the name element outweighed the teaser; 42 → 38px tall */
  .proto-row .proto-place__title {
    line-height: 36px;
  }

  
}

.proto-place__title {
  position: relative;
  margin: 0;
  padding: 0 20px;
  font: 500 18px/calc(var(--place-h) - 2px) var(--font-ui);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.proto-place__ghost {
  visibility: hidden;
}

.proto-place__drawn {
  position: absolute;
  left: 20px;
  right: 20px;
  top: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 480px) {
  .proto-place__title {
    padding: 0 12px;
    font-size: 15px;
  }

  .proto-place__drawn {
    left: 12px;
    right: 12px;
  }
}

/* Screen readers get the real name while the drawn one scrambles */
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* PROTOTYPE timer: a hairline in the centre card's bottom frame that fills until the next auto-step; holds on hover */
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
  animation: place-bar linear both;
}

.card__bar.paused {
  animation-play-state: paused;
}

@keyframes place-bar {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* PROTOTYPE card options act on the teaser inside the frame (the card's own transform is the ring's, set per frame).
   lift: the teaser grows a touch and the frame brightens. tilt: the teaser leans to the pointer. press (both): the
   teaser dips while held. Hover only on fine pointers. */
.card img,
.card video {
  transition: transform var(--fx-card, 180ms) var(--ease-out), opacity 0.6s var(--ease-out-expo);
}

:root[data-fx-card='lift'] .card,
:root[data-fx-card='tilt'] .card {
  transition: border-color var(--fx-card, 180ms) ease;
}

:root[data-fx-card='lift'] .card:active img,
:root[data-fx-card='lift'] .card:active video,
:root[data-fx-card='tilt'] .card:active img,
:root[data-fx-card='tilt'] .card:active video {
  transform: scale(var(--fx-press, 0.985));
}

@media (hover: hover) and (pointer: fine) {
  :root[data-fx-card='lift'] .card--centre:hover,
  :root[data-fx-card='tilt'] .card--centre:hover {
    border-color: color-mix(in srgb, var(--c-fg) 40%, transparent);
  }

  :root[data-fx-card='lift'] .card--centre:hover:not(:active) img,
  :root[data-fx-card='lift'] .card--centre:hover:not(:active) video {
    transform: scale(var(--fx-lift, 1.03));
  }

  :root[data-fx-card='tilt'] .card--centre:hover:not(:active) img,
  :root[data-fx-card='tilt'] .card--centre:hover:not(:active) video {
    transform: perspective(900px) rotateX(calc(var(--ty, 0) * var(--fx-tilt, 4deg) * -1)) rotateY(calc(var(--tx, 0) * var(--fx-tilt, 3deg))) scale(1.03);
  }
}

/* PROTOTYPE chips 'pill': one filled pill slides under the pressed chip; the chips themselves stay unfilled */
.chips__pill {
  position: absolute;
  inset: 0;
  background: var(--c-fg);
  opacity: 0;
  pointer-events: none;
  /* the fill spans the row and is clipped to the pressed chip, so it slides on clip-path alone */
  transition: clip-path var(--fx-chip, 260ms) var(--ease-out);
}

:root[data-fx-chips='pill'] .chips__pill.on {
  opacity: 1;
}

/* Pill: the row is one glass capsule (a segmented control) and the chips inside it are bare, so no chip's own blur
   softens the pill sliding beneath it */
:root[data-fx-chips='pill'] .chips {
  gap: 0;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--line);
  border-radius: 999px;
}

:root[data-fx-chips='pill'] .chip,
:root[data-fx-chips='pill'] .chip[aria-pressed='true'] {
  background: transparent;
  border-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

:root[data-fx-chips='pill'] .chip {
  position: relative;
  transition: color var(--fx-chip, 260ms) var(--ease-out), border-color 0.3s var(--ease-out-expo), background 0.3s var(--ease-out-expo);
}

@media (prefers-reduced-motion: reduce) {
  .card img,
  .card video {
    transition: opacity 0.6s var(--ease-out-expo);
  }

  .chips__pill {
    transition: none;
  }

  :root[data-fx-card] .card--centre img,
  :root[data-fx-card] .card--centre video {
    transform: none !important;
  }
}

.stack {
  --muted: color-mix(in srgb, var(--c-fg) 72%, transparent);
  --line: color-mix(in srgb, var(--c-fg) 14%, transparent);
  position: absolute;
  inset: var(--header-h) 0 var(--hud-clear);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px; /* Will, 2026-10-04: "tighter" (was 28). PLACEHOLDER value; STACK_REST counts it */
}

/* Summary: glass panel at the bottom centre, as wide as the centre card and as tall as the drawer panels
   (Will, 2026-10-04). From 1100px it sits between the drawers; below, it sits above the drawer tabs. */
.summary {
  position: fixed;
  left: 50%;
  bottom: 16px;
  translate: -50% 0;
  z-index: 3000;
  display: grid;
  align-content: start;
  gap: 10px;
  width: var(--centre-w, 448px);
  height: var(--summary-h);
  padding: 14px 16px;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--line);
}

.summary__text {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  font: 400 13px/1.45 var(--font-ui);
  color: var(--muted);
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  animation: fade-up 0.45s var(--ease-out);
}

.summary__tools {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
  animation: fade-up 0.45s var(--ease-out) 0.06s both;
}

.summary__tools li {
  padding: 4px 7px;
  font: 500 10px/1 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: 1px solid var(--line);
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
}

@media (max-width: 1099px) {
  .summary {
    bottom: 44px; /* above the two drawer tabs */
  }
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
  /* Filled, so the label never sits straight on the dots (Will, 2026-10-04) */
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  transition: color 0.3s var(--ease-out-expo), border-color 0.3s var(--ease-out-expo), background 0.3s var(--ease-out-expo);
}

@media (hover: hover) and (pointer: fine) {
  .chip:hover {
    color: var(--c-fg);
  }
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

.world {
  position: absolute;
  inset: 0;
}

.card {
  --frame: 4px; /* glass frame around the teaser (Will, 2026-10-04). PLACEHOLDER: thickness */
  position: absolute;
  left: 50%;
  top: 50%;
  padding: 0;
  /* Glass border: the drawers' glass fill and 18% hairline */
  border: 1px solid color-mix(in srgb, var(--c-fg) 18%, transparent);
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, var(--c-bg) 72%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  cursor: pointer;
  will-change: transform, opacity;
  backface-visibility: hidden;
}

/* Side cards are mono: black and white at full brightness, +10% contrast; colour returns over the last card-width */
.card img,
.card video {
  position: absolute;
  inset: var(--frame);
  width: calc(100% - 2 * var(--frame));
  height: calc(100% - 2 * var(--frame));
  object-fit: cover;
  display: block;
  filter: grayscale(var(--side, 0)) contrast(calc(1 + var(--side, 0) * 0.1));
}

.card video {
  opacity: 0;
  transition: transform var(--fx-card, 180ms) var(--ease-out), opacity 0.6s var(--ease-out-expo);
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
  .summary__text,
  .summary__tools {
    animation: none;
  }

  .caption__title span,
  .caption__discipline span {
    animation: none;
  }
}
</style>
