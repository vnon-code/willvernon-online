import type { Ref } from 'vue'
import type { ProjectCard, SheetMediaItem, SheetOpen, SheetStory } from '~/types/project'

// PROTOTYPE (Project Sheet rework; scored in .scratch/v1-launch/project-sheet-matrix.md). Round 1: A, B, C beside
// today's (0). Round 2 builds on A: A (baseline, Will's notes 2 and 3), R "Rooms", S "Signal chain", T "Type stage",
// U "Double diamond". These are the shared bodies; since the overnight run each project lists its own variants, default
// and scores (sheetRegistry.ts, app/components/sheets/<slug>/meta.json), switched from the options panel
// (SheetProtoPanel.vue) or `?sheet=<id>`. Everything here goes once Will picks: the winners fold into ProjectSheet.vue.
export const SHEET_VARIANTS = ['0', 'A', 'B', 'C', 'R', 'S', 'T', 'U'] as const
export type SheetVariant = (typeof SHEET_VARIANTS)[number]
export const SHEET_NAMES: Record<SheetVariant, string> = {
  0: 'Current', A: 'Hero column', B: 'Stage and plates', C: 'Split',
  R: 'Rooms', S: 'Signal chain', T: 'Type stage', U: 'Double diamond',
}

const isId = (v: unknown): v is string => typeof v === 'string' && /^[\w-]{1,24}$/.test(v)

// `variant` is the picked id (`?sheet=`), null for each project's default; `opened` is what the open Sheet resolved to
export function useSheetVariant() {
  const variant = useState<string | null>('sheet-variant', () => null)
  const opened = useState<{ slug: string, variant: string } | null>('sheet-opened', () => null)
  // Keeps the pick in the URL (`?sheet=A`), whatever the path, so a reload keeps it
  function setVariant(v: string) {
    if (!isId(v)) return
    variant.value = v
    const q = new URLSearchParams(location.search)
    q.set('sheet', v)
    history.replaceState(history.state, '', `${location.pathname}?${q}`)
  }
  return { variant, opened, setVariant }
}

// Reads `?sheet=` once on the client; the harness hook `window.__sheet` exists in dev and with `?proto`
export function initSheetVariant() {
  const { variant, opened, setVariant } = useSheetVariant()
  const q = new URLSearchParams(location.search)
  const v = q.get('sheet')
  if (isId(v)) variant.value = v
  const panel = import.meta.dev || q.has('proto')
  if (panel) {
    Object.assign(window, { __sheet: { get variant() { return variant.value }, get opened() { return opened.value }, setVariant } })
  }
  return panel
}

// ---------------------------------------------------------------------------------------------------------------
// The open and close shared by A, B and C. The teaser's box is ONE element (SheetMedia.vue) laid out where it ends
// up; it is drawn from the card's rect to there by transform alone (FLIP), its content counter-scaled so the video
// never stretches. The Landing's [data-drop] elements leave on Web Animations on a property their own CSS doesn't
// use, so the close can read the card's home rect (every drop rewound for one read) and fold back into it.
export type SheetPhase = 'opening' | 'open' | 'closing' | ''
export type DropStyle = 'fall' | 'part' | 'recede'
type Box = { x: number, y: number, w: number, h: number, r: number, rb: number } // r: top corners, rb: bottom

// PLACEHOLDER: every timing and the radii (open ≤ 700ms and close ≤ 450ms per the matrix)
export const SHEET_MS = { open: 560, close: 380, drop: 300, build: 280, buildAt: 260 }
export const SHEET_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)' // --ease-drawer
const CARD_R = 8 // the strip card's corner

export const setSheetPhase = (p: SheetPhase) => (document.documentElement.dataset.sheet = p)

// cubic-bezier(x1, y1, x2, y2) as a function of time, for the rAF-driven flight
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const f = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3
  const df = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t
  return (x: number) => {
    let t = x
    for (let i = 0; i < 8; i++) {
      const d = df(x1, x2, t)
      if (Math.abs(d) < 1e-6) break
      t = Math.min(1, Math.max(0, t - (f(x1, x2, t) - x) / d))
    }
    return f(y1, y2, t)
  }
}
const easeDrawer = bezier(0.32, 0.72, 0, 1)
// The open's flight starts gently, so the box grows out of the card instead of leaping its first frame (round 1, try 2)
const easeGrow = bezier(0.5, 0, 0.2, 1) // PLACEHOLDER
const box = (r: DOMRect, rad: number, rb = rad): Box => ({ x: r.left, y: r.top, w: r.width, h: r.height, r: rad, rb })

// The Landing's elements leave in each variant's way (`data-drop` names the kind). Each animation is on a property
// the element's own CSS leaves free: `transform` (the docks use `translate`; the side cards' `translate` is only the
// Sections parallax, at rest on the Landing).
function dropAway(style: DropStyle, reduced: boolean): Animation[] {
  const out: Animation[] = []
  const els = [...document.querySelectorAll<HTMLElement>('[data-drop]')]
  const ms = SHEET_MS.drop
  if (reduced) return els.map(el => el.animate({ opacity: [1, 0] }, { duration: 200, fill: 'both' }))
  for (const el of els) {
    const kind = el.dataset.drop ?? ''
    const hud = kind.startsWith('hud')
    const left = el.classList.contains('dock--left')
    if (style === 'fall') {
      // Gravity (ease-in), the lowest first; fades over the last 40% so nothing lingers at the bottom edge
      const delay = { 'cards': 50, 'row': 25, 'chips': 75 }[kind] ?? 0
      const p = hud ? 'translate' : 'transform'
      out.push(el.animate([
        { [p]: hud ? '0 0' : 'none', opacity: 1 },
        { opacity: 1, offset: 0.6 },
        { [p]: hud ? '0 100vh' : 'translateY(100vh)', opacity: 0 },
      ], { duration: ms - delay, delay, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'both' }))
    }
    else if (style === 'part') {
      // The side cards part outward (as the Scroll page shell does); the plates tuck into the centre card; the
      // drawers part to their own sides
      if (kind === 'cards') {
        for (const c of el.querySelectorAll<HTMLElement>('.card:not(.card--centre)')) {
          const dir = Number(c.style.getPropertyValue('--dir')) || 1
          out.push(c.animate({ translate: `${dir * 60}vw 0` }, { duration: ms, easing: SHEET_EASE, fill: 'both' }))
        }
        out.push(el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0 }], { duration: ms, fill: 'both' }))
      }
      else if (hud) out.push(el.animate({ translate: ['0 0', left ? 'calc(-100% - 16px) 0' : 'calc(100% + 16px) 0'] }, { duration: ms, easing: SHEET_EASE, fill: 'both' }))
      else {
        const y = { chips: '32px', row: '-32px' }[kind] ?? '100%'
        out.push(el.animate({ transform: ['none', `translateY(${y})`], opacity: [1, 0] }, { duration: ms * 0.7, easing: SHEET_EASE, fill: 'both' }))
      }
    }
    else {
      // Recede: the whole Landing falls back (below); the side cards drop away inside it, the plates fade with it,
      // the drawers and Learn More sink below the edge
      if (kind === 'cards') out.push(el.animate({ transform: ['none', 'translateY(6vh)'], opacity: [1, 0] }, { duration: ms, easing: SHEET_EASE, fill: 'both' }))
      else if (hud) out.push(el.animate({ translate: ['0 0', '0 100vh'] }, { duration: ms, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'both' }))
      else if (kind === 'learn-more') out.push(el.animate({ transform: ['none', 'translateY(100%)'], opacity: [1, 0] }, { duration: ms, easing: SHEET_EASE, fill: 'both' }))
      else out.push(el.animate({ opacity: [1, 0] }, { duration: ms * 0.7, easing: 'ease-out', fill: 'both' }))
    }
  }
  if (style === 'recede') {
    // Scale 8% about the stage's middle (its origin is the top edge, for the Sections recede) and back a touch
    const stage = document.querySelector<HTMLElement>('.landing__stage')
    if (stage) out.push(stage.animate({ transform: ['none', 'translateY(4%) scale(0.92)'] }, { duration: 400, easing: SHEET_EASE, fill: 'both' }))
  }
  return out
}

export function useSheetMotion(o: {
  sheet: SheetOpen
  drop: DropStyle
  root: Ref<HTMLElement | undefined>
  layer: Ref<HTMLElement | undefined>
  overlay: Ref<HTMLElement | undefined>
  media: Ref<{ root?: HTMLElement, fit?: HTMLElement, video?: HTMLVideoElement } | undefined>
  build: (dir: 'in' | 'out') => Animation[] // the variant's body arriving and leaving
  beforeClose?: () => void
  onWheel?: (e: WheelEvent) => void // default: the margins scroll the layer
  onClosed: () => void
}) {
  const { sfx } = useSound()
  const { docked } = useScrollPage()
  let reduced = false
  let closing = false
  let flight = 0 // the running rAF flight; a close mid-open takes over from wherever the box is
  let drops: Animation[] = []
  let srcHide: Animation | undefined
  let opener: HTMLElement | null = null
  // Round 2 (Will): while the Sheet is open the header is the Sections' docked one (links inline, solid, lit edge)
  let header: { docked: boolean, hdr: string } | null = null
  function dockHeader(on: boolean) {
    const s = document.documentElement.style
    if (on && !header) {
      header = { docked: docked.value, hdr: s.getPropertyValue('--hdr') }
      docked.value = true
      s.setProperty('--hdr', '1')
    }
    else if (!on && header) {
      if (!header.docked) docked.value = false // TheHeader fades its background out (header--leaving)
      s.setProperty('--hdr', header.hdr || '0')
      header = null
    }
  }

  // Draws the media box at rect R: the box by translate + scale from its laid-out rect F, its content (.fit, a box of
  // the card's aspect covering F) counter-scaled to cover R without stretching, and the corner kept round
  function put(m: HTMLElement, fit: HTMLElement, F: DOMRect, R: Box) {
    const sx = R.w / F.width, sy = R.h / F.height
    const k = Math.max(R.w / fit.offsetWidth, R.h / fit.offsetHeight)
    m.style.transform = `translate(${R.x - F.left}px, ${R.y - F.top}px) scale(${sx}, ${sy})`
    m.style.borderRadius = `${R.r / sx}px ${R.r / sx}px ${R.rb / sx}px ${R.rb / sx}px / ${R.r / sy}px ${R.r / sy}px ${R.rb / sy}px ${R.rb / sy}px`
    fit.style.transform = `scale(${k / sx}, ${k / sy})`
  }
  // At rest the content simply fills the box (no oversized layer); it takes the card's aspect again to fly
  function settle(m: HTMLElement, fit: HTMLElement, rest = false) {
    m.style.transform = m.style.borderRadius = fit.style.transform = ''
    fit.toggleAttribute('data-rest', rest)
  }
  function fly(a: Box, b: Box | null, ms: number, ease = easeDrawer) {
    const m = o.media.value?.root, fit = o.media.value?.fit
    if (!m || !fit) return Promise.resolve()
    settle(m, fit)
    const F = m.getBoundingClientRect()
    // Open: into the box's own resting corners (round 2: square at the bottom where it sits in the frame)
    const cs = getComputedStyle(m)
    const to = b ?? box(F, parseFloat(cs.borderTopLeftRadius) || 0, parseFloat(cs.borderBottomLeftRadius) || 0)
    const id = ++flight
    put(m, fit, F, a)
    return new Promise<void>((done) => {
      // The flight's own clock advances at most one frame's worth (20ms) per frame (round 2, try 2): a stalled frame
      // (content mounting, a video starting) delays the flight a little instead of making the box leap
      let elapsed = 0, last = 0
      const step = (now: number) => {
        if (id !== flight) return done()
        elapsed += last ? Math.min(now - last, 20) : 0
        last = now
        const t = Math.min(1, elapsed / ms), e = ease(t)
        const lerp = (k: keyof Box) => a[k] + (to[k] - a[k]) * e
        put(m, fit, F, { x: lerp('x'), y: lerp('y'), w: lerp('w'), h: lerp('h'), r: lerp('r'), rb: lerp('rb') })
        if (t < 1) return requestAnimationFrame(step)
        if (!b) settle(m, fit, true) // open: the box rests in its own place
        done()
      }
      requestAnimationFrame(step)
    })
  }

  // The card's rect with the Landing home: every drop rewound to its start for one read, then put back
  function homeRect(): Box {
    const el = o.sheet.el
    if (!el?.isConnected) return box(o.sheet.from, CARD_R)
    const saved = drops.map(a => a.currentTime)
    drops.forEach(a => (a.currentTime = 0))
    const r = el.getBoundingClientRect()
    drops.forEach((a, i) => (a.currentTime = saved[i]!))
    return box(r, CARD_R)
  }

  async function open() {
    reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    opener = document.activeElement as HTMLElement | null
    setSheetPhase('opening')
    dockHeader(true)
    // The teaser now lives in the Sheet: its card hides until the box folds back into it
    srcHide = o.sheet.el?.animate({ opacity: [0, 0] }, { duration: 1, fill: 'forwards' })
    const tasks: Promise<unknown>[] = []
    if (reduced) tasks.push(o.root.value!.animate({ opacity: [0, 1] }, { duration: 200, fill: 'both' }).finished)
    else {
      tasks.push(fly(box(o.sheet.from, CARD_R), null, SHEET_MS.open, easeGrow))
      tasks.push(o.overlay.value!.animate({ opacity: [0, 1] }, { duration: SHEET_MS.open, easing: 'ease', fill: 'both' }).finished)
      tasks.push(...o.build('in').map(a => a.finished))
    }
    drops = dropAway(o.drop, reduced)
    tasks.push(...drops.map(a => a.finished))
    o.root.value?.querySelector<HTMLElement>('[data-sheet-close]')?.focus({ preventScroll: true })
    await Promise.all(tasks).catch(() => {})
    if (!closing) setSheetPhase('open')
  }

  async function close() {
    if (closing) return
    closing = true
    setSheetPhase('closing')
    dockHeader(false)
    sfx('sheetClose')
    o.beforeClose?.()
    const tasks: Promise<unknown>[] = []
    if (reduced) tasks.push(o.root.value!.animate({ opacity: [1, 0] }, { duration: 200, fill: 'both' }).finished)
    else {
      const m = o.media.value?.root
      // From wherever the box is now (even mid-open), into the card's rect
      const mcs = m && getComputedStyle(m)
      const now = m && mcs ? box(m.getBoundingClientRect(), parseFloat(mcs.borderTopLeftRadius) || 0, parseFloat(mcs.borderBottomLeftRadius) || 0) : null
      const to = homeRect()
      // The card's own video picks up where the Sheet's will be when the box lands
      const sv = o.sheet.el?.querySelector('video'), mv = o.media.value?.video
      if (sv && mv && sv.duration) sv.currentTime = (mv.currentTime + SHEET_MS.close / 1000) % sv.duration
      if (now) tasks.push(fly(now, to, SHEET_MS.close))
      tasks.push(o.overlay.value!.animate({ opacity: [1, 0] }, { duration: SHEET_MS.close, easing: 'ease', fill: 'forwards' }).finished)
      tasks.push(...o.build('out').map(a => a.finished))
    }
    drops.forEach(a => a.reverse())
    tasks.push(...drops.map(a => a.finished))
    await Promise.all(tasks).catch(() => {})
    srcHide?.cancel()
    drops.forEach(a => a.cancel())
    o.onClosed()
    await nextTick() // the Landing is inert until the parent drops the Sheet
    const back = o.sheet.el?.isConnected ? o.sheet.el : opener
    back?.focus({ preventScroll: true })
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close()
  }
  // A header link (or the monogram) while the Sheet is open: the Sheet closes first, then the link goes
  function onHeaderClick(e: MouseEvent) {
    const a = (e.target as Element | null)?.closest?.('.header a') as HTMLElement | null
    if (!a || closing) return
    e.preventDefault()
    e.stopImmediatePropagation()
    close().then(() => a.isConnected && a.click())
  }
  function onWheel(e: WheelEvent) {
    if (o.onWheel) return o.onWheel(e)
    const l = o.layer.value
    if (!l || l.contains(e.target as Node)) return // the layer scrolls itself; overscroll is contained
    e.preventDefault()
    l.scrollBy({ top: e.deltaY })
  }

  onMounted(() => {
    addEventListener('keydown', onKey)
    document.addEventListener('click', onHeaderClick, true)
    o.root.value?.addEventListener('wheel', onWheel, { passive: false })
    open()
  })
  onBeforeUnmount(() => {
    removeEventListener('keydown', onKey)
    document.removeEventListener('click', onHeaderClick, true)
    dockHeader(false)
    flight++
    // Unmounted without a close (hot reload, a variant switch): put the Landing back as it was
    srcHide?.cancel()
    drops.forEach(a => a.cancel())
    setSheetPhase('')
  })
  return { close }
}

// Media in the Sheet's scroll layer plays while on screen and pauses off it
export function usePlayInView(layer: Ref<HTMLElement | undefined>) {
  let io: IntersectionObserver | undefined
  onMounted(() => {
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement
        if (e.isIntersecting) v.play().catch(() => {})
        else v.pause()
      }
    }, { root: layer.value, threshold: 0.25 })
    layer.value?.querySelectorAll('video[data-in-view]').forEach(v => io!.observe(v))
  })
  onBeforeUnmount(() => io?.disconnect())
}

// What a Sheet shows below the teaser: the steps, the outcome (unless a step or the teaser already shows it) and the
// renders
export function sheetContent(card: ProjectCard) {
  const used = new Set([card.teaser, ...card.process.map(s => s.media?.src)])
  const outcome = card.outcome && !used.has(card.outcome.src) ? card.outcome : null
  return { steps: card.process, outcome, gallery: card.gallery }
}
export const pad = (i: number) => String(i + 1).padStart(2, '0')

// ---------------------------------------------------------------------------------------------------------------
// Round 2: what the Sheets R, S, T and U show. A project with a story (content/stories/<slug>.json) tells it; one
// without falls back to its strip data: its process steps become the chapters and phases ('steps'), or, with none
// (the AI and experiment entries), just the intro ('thin').
export interface SheetChapter {
  id: string
  title: string
  subtitle?: string
  facts: { k: string, v: string }[] // a track: sound → visual → room
  screen?: SheetMediaItem // the track's visual
  slides: SheetMediaItem[] // the room: splash, then renders
  chain: { k: string, v: string, media: SheetMediaItem[] }[] // the signal chain: sound, visual, network, room
}
export interface SheetView {
  kind: 'story' | 'steps' | 'thin'
  title: string
  hook: string
  intro: string
  credits: { k: string, v: string }[]
  stats: string[]
  chapters: SheetChapter[]
  phases: { id: string, title: string, text: string, media: SheetMediaItem[] }[]
  outcome: { text: string, media: SheetMediaItem[] } | null
}
const TAGS: Record<string, string> = { projects: 'Project', experiments: 'Experiment', ai: 'AI' }
const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export function storyView(card: ProjectCard): SheetView {
  const s: SheetStory | null | undefined = card.story
  if (s) {
    return {
      kind: 'story', title: s.title, hook: s.hook, intro: s.intro ?? '', credits: s.credits, stats: s.stats,
      chapters: s.tracks.map(t => ({
        id: t.id, title: t.title, subtitle: t.subtitle,
        facts: [{ k: 'Sound', v: t.sound }, { k: 'Visual', v: t.visual }, { k: 'Room', v: t.room }],
        screen: t.video,
        slides: [t.splash, ...t.renders].filter((m): m is SheetMediaItem => !!m),
        chain: [
          { k: 'Sound', v: t.sound, media: t.art ? [t.art] : [] },
          { k: 'Visual', v: t.visual, media: [t.video, ...t.frames].filter((m): m is SheetMediaItem => !!m) },
          ...(t.network.length ? [{ k: 'Network', v: t.network[0]!.caption ?? '', media: t.network }] : []),
          { k: 'Room', v: t.room, media: t.splash ? [t.splash] : [] },
        ],
      })),
      phases: s.process,
      outcome: s.outcome ?? null,
    }
  }
  const credits = [
    { k: 'Type', v: TAGS[card.from] ?? card.discipline },
    { k: 'Discipline', v: card.discipline },
    ...(card.tools.length ? [{ k: card.from === 'ai' ? 'Tags' : 'Tools', v: card.tools.join(', ') }] : []),
  ]
  const steps = card.process.map(p => ({ id: slug(p.title), title: p.title, text: p.text, media: p.media ? [p.media] : [] }))
  const { outcome, gallery } = sheetContent(card)
  const out = [...(outcome ? [outcome] : []), ...gallery]
  return {
    kind: steps.length ? 'steps' : 'thin',
    title: card.title, hook: card.summary, intro: card.long, credits, stats: card.tools.slice(0, 3),
    chapters: steps.map(p => ({
      id: p.id, title: p.title, facts: p.text ? [{ k: '', v: p.text }] : [], slides: p.media,
      chain: [{ k: p.title, v: p.text, media: p.media }],
    })),
    phases: steps,
    outcome: out.length ? { text: '', media: out } : null,
  }
}

// Scroll-linked runs (S, T): CSS scroll-driven animations where the browser has them (compositor-driven); elsewhere
// this sets `--p` (0 → 1 across each [data-progress] element's pinned stretch) on the layer's scroll, once a frame.
export function useLayerProgress(layer: Ref<HTMLElement | undefined>) {
  let raf = 0
  let els: HTMLElement[] = []
  function update() {
    raf = 0
    const l = layer.value
    if (!l) return
    const h = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64
    const vh = l.clientHeight - h
    const ps = els.map((el) => {
      const r = el.getBoundingClientRect()
      return Math.min(1, Math.max(0, (h - r.top) / Math.max(1, r.height - vh)))
    })
    els.forEach((el, i) => el.style.setProperty('--p', ps[i]!.toFixed(4)))
  }
  const onScroll = () => (raf ||= requestAnimationFrame(update))
  onMounted(() => {
    if (CSS.supports('animation-timeline: view()')) return
    els = [...layer.value?.querySelectorAll<HTMLElement>('[data-progress]') ?? []]
    layer.value?.addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onScroll)
    update()
  })
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf)
    layer.value?.removeEventListener('scroll', onScroll)
    removeEventListener('resize', onScroll)
  })
}
