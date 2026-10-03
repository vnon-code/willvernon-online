// Shared by TheGate and GateDots (docs/specs/gate.md, prototype/gate-intro.html at its defaults).

// The monogram polygon, in its own viewBox (136 251 808 577)
export const MARK_POINTS: [number, number][] = [
  [136, 251], [338, 251], [424, 406], [540, 251], [655, 406], [741, 251], [944, 251],
  [770, 587], [944, 828], [655, 828], [540, 635], [424, 828], [136, 828], [294, 587],
]
export const MARK_VIEWBOX = { x: 136, y: 251, w: 808, h: 577 }

// Entrance timeline, ms after mount
export const GATE_T = { rise: 650, squeeze: 1900, morph: 2700, swap: 3500, unfold: 3550, choices: 4200 }
export const GATE_DUR = { rise: 700, squeeze: 800, morph: 800, unfold: 800 }

// The dot matrix arrives once the morph completes: the five pieces around the logo void (l, r, tl, tr, b)
// each slide in from their own edge, all at once. Tune the entrance here: start (ms), duration (ms),
// and the cubic-bezier easing (x1, y1, x2, y2). Reduced motion skips the slide (GATE_REDUCED_FADE at `at`).
export const GATE_DOTS = { at: GATE_T.swap, dur: 2400, ease: [0.77, 0, 0.175, 1] as const }

// Reduced motion: the final state cross-fades in over this long
export const GATE_REDUCED_FADE = 200

// Mouse interaction on the dot matrix (docs/specs/gate.md "Mouse interaction"; prototype defaults)
export const GATE_MOUSE = {
  radius: 140, // px; falloff is (1 - d/radius)^2
  glow: 0.8, // spotlight: up to +80% opacity
  lens: 1.5, // dots grow up to 1.5x
  push: 1, // repel: px away from the cursor
  stiffness: 0.4, // repel spring
  damping: 0.72, // per frame
  ease: 0.25, // cursor easing per frame
  fade: 0.08, // influence fade per frame (~0.5s)
  ringSpeed: 550, // px/s
  ringWidth: 30, // px
  ringLife: 1000, // ms
  ringAlpha: 0.45, // +45% opacity
  ringRadius: 0.5, // +px dot radius
  maxRings: 6,
}

export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1)
export const outCubic = (t: number) => 1 - (1 - t) ** 3
export const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
// progress of a phase that starts at `from` ms and lasts `dur` ms
export const phase = (t: number, from: number, dur: number) => clamp01((t - from) / dur)

// CSS cubic-bezier(x1, y1, x2, y2) as a function of progress: Newton steps, then bisection if they miss
export function bezier(x1: number, y1: number, x2: number, y2: number) {
  const c = (a: number, b: number, t: number) => ((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t
  const dc = (a: number, b: number, t: number) => 3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 6; i++) {
      const d = dc(x1, x2, t)
      if (Math.abs(d) < 1e-6) break
      t -= (c(x1, x2, t) - x) / d
    }
    if (t < 0 || t > 1 || Math.abs(c(x1, x2, t) - x) > 1e-4) {
      let lo = 0, hi = 1
      t = x
      for (let i = 0; i < 30; i++) {
        if (c(x1, x2, t) < x) lo = t
        else hi = t
        t = (lo + hi) / 2
      }
    }
    return c(y1, y2, t)
  }
}
