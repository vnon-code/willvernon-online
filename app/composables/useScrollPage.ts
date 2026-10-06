import Lenis from 'lenis'

// The one scrolling page (docs/adr/0002-one-scrolling-page.md; Scroll page shell, Will 2026-10-05). The Landing is
// scroll-locked on top: the strip takes the wheel. Learn More, the header links and deep links scroll down to a
// Section, and the whole Landing scrolls up with the page. Scrolling back up is free (Will, 2026-10-06: no jump) until
// the last stretch, which glides home; there the Landing re-locks, and a beat later it is `settled`: the strip takes
// the wheel again and Learn More rises back in.
// The URL follows the scroll: `/` on the Landing, `/<section>` in a Section. `--sy` (scroll px) drives the Landing's
// parallax in CSS. Lenis glides the wheel (Will, 2026-10-06: "smooth + depth").
export const SECTIONS = [
  { id: 'about', label: 'About me' },
  { id: 'music', label: 'Music' },
  { id: 'ai', label: 'AI' },
  { id: 'contact', label: 'Contact' },
] as const
export type SectionId = (typeof SECTIONS)[number]['id']

const DOWN_S = 1.2 // Landing → Section. PLACEHOLDER
const HOME_S = 1.2 // the monogram's way home. PLACEHOLDER
// The last stretch before the panel reaches the header (Will, 2026-10-06: "long fade, early swap"): the header docks as
// the panel enters it (the links swap in), and --dock runs 0 → 1 across it. PLACEHOLDER
const DOCK_PX = 240
const SETTLE_MS = 350 // back home: the beat before the strip takes the wheel and Learn More rises. PLACEHOLDER
const HOME_SNAP_PX = 120 // heading up under this, the page glides the rest of the way home. PLACEHOLDER
const HOME_SNAP_S = 0.45 // PLACEHOLDER
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

export function useScrollPage() {
  const mode = useState<'landing' | 'sections'>('scroll-mode', () => 'landing')
  const current = useState<SectionId | null>('scroll-section', () => null)
  // The header is docked from the moment the panel reaches it until the page is fully back home (Will, 2026-10-06:
  // the header stays on the whole way up, then goes)
  const docked = useState('scroll-docked', () => false)
  // true while the Landing is home and at rest
  const settled = useState('scroll-settled', () => true)
  return { mode, current, docked, settled, goTo, goHome }
}

let lenis: Lenis | null = null
let tweening = false
let raf = 0
let settleTimer = 0
let hdrFull = false

const headerH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64

// Scroll position that puts an element's top under the header
function topOf(el: Element | null) {
  return el ? el.getBoundingClientRect().top + scrollY - headerH() : innerHeight
}
const sectionTop = (id: SectionId) => topOf(document.getElementById(`section-${id}`))
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches

// A programmatic scroll: Lenis when it's on, otherwise a rAF tween. Nothing else moves the page meanwhile.
function scrollToY(to: number, s: number, ease: (t: number) => number) {
  tweening = true
  return new Promise<void>((done) => {
    const end = () => {
      tweening = false
      done()
    }
    if (lenis) return lenis.scrollTo(to, { duration: s, easing: ease, force: true, lock: true, onComplete: end })
    cancelAnimationFrame(raf)
    const from = scrollY, t0 = performance.now(), ms = reduced() ? 0 : s * 1000
    const step = (now: number) => {
      const t = ms ? Math.min(1, (now - t0) / ms) : 1
      scrollTo(0, from + (to - from) * ease(t))
      if (t < 1) raf = requestAnimationFrame(step)
      else end()
    }
    raf = requestAnimationFrame(step)
  })
}

function setLocked(on: boolean) {
  document.documentElement.classList.toggle('page-locked', on)
  if (on) lenis?.stop()
  else lenis?.start()
}

async function goTo(id: SectionId) {
  const { mode, settled } = useScrollPage()
  clearTimeout(settleTimer)
  settled.value = false
  mode.value = 'sections'
  setLocked(true) // no wheel fights the scroll
  useSound().sfx('depart')
  await scrollToY(sectionTop(id), DOWN_S, easeOutQuart)
  setLocked(false)
  onScroll()
}

// The monogram: the same way home a visitor's own scroll takes, just driven
async function goHome() {
  const { mode } = useScrollPage()
  if (mode.value === 'landing' && scrollY === 0) return
  setLocked(true)
  useSound().sfx('arrive')
  await scrollToY(0, HOME_S, easeInOutCubic)
  arriveHome()
}

function arriveHome() {
  const { mode, current, settled, docked } = useScrollPage()
  mode.value = 'landing'
  docked.value = false
  current.value = null
  setLocked(true)
  history.replaceState(history.state, '', '/' + location.search)
  useSound().sfx('deal') // in step with the plates landing (TheProjectStrip.vue)
  clearTimeout(settleTimer)
  settleTimer = window.setTimeout(() => (settled.value = true), SETTLE_MS)
  onScroll() // drops the header's hold (--hdr), so it fades out now
}

// Called on every scroll: publishes --sy, --land, --dock, --hdr and `docked`, re-locks at the very top, and keeps the URL on the Section
// under the header
function onScroll() {
  const { mode, current, docked } = useScrollPage()
  const root = document.documentElement
  const y = scrollY
  // The scroll at which the panel reaches the header (measured: 100svh and innerHeight differ on phones)
  const panel = document.querySelector('.sections__panel')
  const span = Math.max(1, topOf(panel))
  if (mode.value === 'sections' && y >= span - DOCK_PX) docked.value = true
  const d = Math.min(1, Math.max(0, (y - (span - DOCK_PX)) / DOCK_PX))
  const dock = d * d * (3 - 2 * d) // smoothstep
  root.style.setProperty('--dock', dock.toFixed(4))
  // The header's copy, held at 1 once full until the page is home (it stays on the whole way up)
  if (d >= 1) hdrFull = true
  if (!docked.value) hdrFull = false
  root.style.setProperty('--hdr', hdrFull ? '1' : dock.toFixed(4))
  root.style.setProperty('--sy', `${y}px`)
  root.style.setProperty('--land', Math.min(1, y / span).toFixed(4)) // 0 home → 1 docked: the Landing recedes
  if (tweening || mode.value !== 'sections') return
  // Heading up through the last stretch: glide home in one short beat instead of Lenis's ~600ms crawl (Will,
  // 2026-10-06, scored in .scratch/v1-launch/scroll-back-matrix.md)
  if (lenis && lenis.direction === -1 && y > 2 && y < HOME_SNAP_PX) {
    lenis.stop() // drop the wheel's own glide
    useSound().sfx('arrive')
    scrollToY(0, HOME_SNAP_S, easeOutCubic).then(arriveHome)
    return
  }
  // Lenis creeps through the last pixels for ~300ms; under 2px the page already looks home, so finish it there
  if (y < 2) {
    arriveHome() // first: mode is 'landing' before the scroll below re-enters here
    lenis?.scrollTo(0, { immediate: true, force: true })
    return
  }
  let at: SectionId = SECTIONS[0].id
  for (const s of SECTIONS) if (sectionTop(s.id) <= y + innerHeight * 0.4) at = s.id
  if (at !== current.value) {
    current.value = at
    if (!location.pathname.startsWith('/work/')) history.replaceState(history.state, '', `/${at}${location.search}`)
  }
}

// Mount once (app.vue). Returns what the first path asked for, to act on after the Gate.
export function initScrollPage() {
  // Reduced motion: the browser's own scroll, and programmatic scrolls jump
  if (!reduced()) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.085 }) // PLACEHOLDER: the glide
    lenis.on('scroll', onScroll) // fires in the frame Lenis moves the page
  }
  setLocked(true)
  scrollTo(0, 0)
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  // Synchronous, not deferred to the next frame: the stage's parallax and clip must move in the same frame as the
  // panel, or a sliver of the strip flickers at its edge (scroll events already fire once per frame)
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', onScroll)
  onScroll()
  const [, first, slug] = location.pathname.split('/')
  if (first === 'work' && slug) return { work: slug }
  if (SECTIONS.some(s => s.id === first)) return { section: first as SectionId }
  return {}
}
