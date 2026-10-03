<script setup lang="ts">
import { GATE_DOTS as D, GATE_MOUSE as M, GATE_REDUCED_FADE, MARK_POINTS, MARK_VIEWBOX, bezier, phase } from '~/utils/gate'

// The Gate's dot matrix (docs/specs/gate.md). Nothing is drawn until the morph completes (GATE_DOTS.at);
// then the dots outside the logo void (a viewport-high monogram silhouette, centred on the mark) arrive as
// five pieces, each sliding in from its own edge, all at once. Draws every frame until the slide ends.
// After that a rAF loop runs only while the mouse effects (spotlight, lens, repel, click ripples) are moving;
// it goes idle once they settle and wakes on pointer events.

const GAP = 18 // px between dots
const BASE = 0.12 // resting opacity, of the type colour

// The pieces around the void: the side notches slide in from the left and right, the two top V notches
// from the top, the bottom notch from the bottom
type Piece = 'l' | 'r' | 'tl' | 'tr' | 'b'
const PIECES: Piece[] = ['l', 'r', 'tl', 'tr', 'b']
const ease = bezier(...D.ease)

const canvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
// hole: inside the logo void (never drawn) · piece: which edge it slides in from
// ox/oy/vx/vy: the repel spring's offset and velocity
type Dot = { x: number, y: number, hole: boolean, piece: Piece, ox: number, oy: number, vx: number, vy: number }
let dots: Dot[] = []
// how far each piece starts from home: just enough to be fully off-screen
let slide: Partial<Record<Piece, { x: number, y: number }>> = {}
let W = 0, H = 0, t0 = 0, raf = 0
let reduced = false
let mouseOk = false // mouse-only effects: a fine hover pointer, and no reduced motion

// Cursor eases toward the pointer (x/y -> tx/ty); a is the influence, fading to 1 inside the window and 0 outside
const mouse = { x: 0, y: 0, tx: 0, ty: 0, a: 0, on: false }
const rings: { x: number, y: number, t: number }[] = []

function layout() {
  const el = canvas.value
  if (!el) return
  const dpr = Math.min(devicePixelRatio, 2)
  W = innerWidth
  H = innerHeight
  el.width = W * dpr
  el.height = H * dpr
  ctx = el.getContext('2d')
  if (!ctx) return
  const cx = W / 2, cy = H / 2

  // The void: the monogram polygon scaled to the viewport height, centred on the mark
  const k = H / MARK_VIEWBOX.h, mx = MARK_VIEWBOX.x + MARK_VIEWBOX.w / 2, my = MARK_VIEWBOX.y + MARK_VIEWBOX.h / 2
  const path = new Path2D()
  MARK_POINTS.forEach(([x, y], i) => path[i ? 'lineTo' : 'moveTo'](cx + (x - mx) * k, cy + (y - my) * k))
  path.closePath()
  ctx.setTransform(1, 0, 0, 1, 0, 0) // test in CSS px, the same space as the path

  dots = []
  const ox = (W % GAP) / 2 + GAP / 2, oy = (H % GAP) / 2 + GAP / 2
  for (let y = oy; y < H; y += GAP) {
    for (let x = ox; x < W; x += GAP) {
      // the piece, in the mark's own units (box 136..944 × 251..828): side notches by x first,
      // then the two top V notches and the bottom notch by y
      const u = (x - cx) / k + mx, v = (y - cy) / k + my
      const piece: Piece = u <= 294 ? 'l' : u >= 770 ? 'r' : v <= 406 ? (u < 540 ? 'tl' : 'tr') : v >= 635 ? 'b' : (u < 540 ? 'l' : 'r')
      dots.push({ x, y, hole: ctx.isPointInPath(path, x, y), piece, ox: 0, oy: 0, vx: 0, vy: 0 })
    }
  }
  slide = {}
  for (const id of PIECES) {
    const ps = dots.filter(p => !p.hole && p.piece === id)
    if (!ps.length) continue
    const xs = ps.map(p => p.x), ys = ps.map(p => p.y)
    slide[id] = id === 'l'
      ? { x: -(Math.max(...xs) + GAP), y: 0 }
      : id === 'r'
        ? { x: W - Math.min(...xs) + GAP, y: 0 }
        : id === 'b'
          ? { x: 0, y: H - Math.min(...ys) + GAP }
          : { x: 0, y: -(Math.max(...ys) + GAP) }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

// t: ms since mount (held at the end of the intro afterwards), now: performance.now() for the rings.
// Returns true while the mouse effects are still moving, so the caller knows whether to keep drawing.
function draw(t: number, now: number): boolean {
  if (!ctx) return false
  let busy = false
  if (mouseOk) {
    mouse.x += (mouse.tx - mouse.x) * M.ease
    mouse.y += (mouse.ty - mouse.y) * M.ease
    if (Math.abs(mouse.tx - mouse.x) < 0.1) mouse.x = mouse.tx
    if (Math.abs(mouse.ty - mouse.y) < 0.1) mouse.y = mouse.ty
    const goal = mouse.on ? 1 : 0
    mouse.a += (goal - mouse.a) * M.fade
    if (Math.abs(goal - mouse.a) < 0.002) mouse.a = goal
    while (rings.length && now - rings[0]!.t > M.ringLife) rings.shift()
    busy = mouse.a !== goal || mouse.x !== mouse.tx || mouse.y !== mouse.ty || rings.length > 0
  }
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = getComputedStyle(canvas.value!).color
  // reduced motion: no slide, a short cross-fade at the same moment
  const go = phase(t, D.at, reduced ? GATE_REDUCED_FADE : D.dur)
  if (go > 0) {
    const e = reduced ? go : ease(go), m = reduced ? 0 : 1 - e
    const landed = go >= 1 ? 1 : 0 // mouse effects wait until the slide has finished
    const base = BASE * (reduced ? go : Math.min(1, e * 2.5))
    for (const p of dots) {
      if (p.hole) continue
      const sl = slide[p.piece] ?? { x: 0, y: 0 }
      let a = base
      let r = 1 // half the dot size, px
      if (mouseOk) {
        // f: 1 under the cursor, 0 at the radius
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy)
        const f = (1 - Math.min(1, d / M.radius)) ** 2 * mouse.a * landed
        // repel: a spring toward an offset pointing away from the cursor
        const tx = d > 0.01 ? dx / d * M.push * f : 0, ty = d > 0.01 ? dy / d * M.push * f : 0
        p.vx = (p.vx + (tx - p.ox) * M.stiffness) * M.damping
        p.vy = (p.vy + (ty - p.oy) * M.stiffness) * M.damping
        p.ox += p.vx
        p.oy += p.vy
        if (Math.abs(p.vx) + Math.abs(p.vy) + Math.abs(tx - p.ox) + Math.abs(ty - p.oy) < 0.005) {
          p.ox = tx; p.oy = ty; p.vx = 0; p.vy = 0 // settled
        }
        else busy = true
        // click ripples: a bright ring travelling out, fading with age
        let ring = 0
        for (const rp of rings) {
          const age = Math.max(0, now - rp.t)
          ring += Math.max(0, 1 - Math.abs(Math.hypot(p.x - rp.x, p.y - rp.y) - age / 1000 * M.ringSpeed) / M.ringWidth) * (1 - age / M.ringLife)
        }
        ring *= landed
        a += M.glow * f + M.ringAlpha * ring
        r += (M.lens - 1) * f + M.ringRadius * Math.min(1, ring)
      }
      ctx.globalAlpha = Math.min(1, a) // canvas ignores alpha above 1
      ctx.fillRect(p.x + sl.x * m + p.ox - r, p.y + sl.y * m + p.oy - r, r * 2, r * 2)
    }
  }
  ctx.globalAlpha = 1
  return busy
}

const doneAt = () => D.at + (reduced ? GATE_REDUCED_FADE : D.dur)

function loop(now: number) {
  const t = Math.min(now - t0, doneAt())
  const busy = draw(t, performance.now())
  raf = t < doneAt() || busy ? requestAnimationFrame(loop) : 0
}

// Restart the loop after it has gone idle
function wake() {
  if (!raf) raf = requestAnimationFrame(loop)
}

function onMove(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  mouse.tx = e.clientX
  mouse.ty = e.clientY
  if (!mouse.a) { mouse.x = e.clientX; mouse.y = e.clientY } // entering: start under the cursor
  mouse.on = true
  wake()
}

// The canvas sits behind the gate, so listen on window; a click on a button may still send a ring
function onDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse') return
  rings.push({ x: e.clientX, y: e.clientY, t: performance.now() })
  if (rings.length > M.maxRings) rings.shift()
  wake()
}

function onLeave() {
  mouse.on = false
  wake()
}

// Re-carve the void and the pieces on resize; after the intro, a resize or theme change redraws the final state
function redraw() {
  layout()
  if (!raf && draw(doneAt(), performance.now())) wake()
}

let scheme: MediaQueryList | undefined
onMounted(() => {
  reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  mouseOk = !reduced && matchMedia('(hover: hover) and (pointer: fine)').matches
  layout()
  t0 = performance.now()
  raf = requestAnimationFrame(loop)
  addEventListener('resize', redraw)
  if (mouseOk) {
    addEventListener('pointermove', onMove)
    addEventListener('pointerdown', onDown)
    document.documentElement.addEventListener('pointerleave', onLeave)
  }
  scheme = matchMedia('(prefers-color-scheme: dark)')
  scheme.addEventListener('change', redraw)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('resize', redraw)
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerdown', onDown)
  document.documentElement.removeEventListener('pointerleave', onLeave)
  scheme?.removeEventListener('change', redraw)
})
</script>

<template>
  <canvas ref="canvas" class="dots" aria-hidden="true" />
</template>

<style scoped>
.dots {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  color: var(--c-fg); /* read by the canvas as the dot colour */
}
</style>
