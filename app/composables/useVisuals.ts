// The Landing background's live settings, shared by the Visuals HUD (faders, presets) and TheDotField.
// Values are in the dot field's own units; the faders map them to 0–1. They last for this visit only.
// Defaults: docs/specs/landing-background.md, with the 2026-10-04 trial (largest dot .30, brightness .55).

export interface Visuals {
  cell: number // grid, px
  dmin: number // smallest dot, fraction of the cell (no fader; presets set it)
  dmax: number // largest dot
  scale: number // zoom: field features per screen height
  warp: number
  speed: number
  level: number // the palette's lightest stop, luminance
}

export const VISUALS_DEFAULT: Visuals = { cell: 6, dmin: 0.08, dmax: 0.3, scale: 3.9, warp: 2.15, speed: 2.35, level: 0.55 }

// Fader ranges, from the prototype's sliders. Zoom is logarithmic, so each step zooms by the same ratio.
type Key = 'scale' | 'warp' | 'speed' | 'cell' | 'dmax' | 'level'
const RANGE: Record<Key, [number, number, 'log' | 'lin']> = {
  scale: [0.2, 8, 'log'],
  warp: [0, 5, 'lin'],
  speed: [0, 4, 'lin'],
  cell: [4, 40, 'lin'],
  dmax: [0.05, 0.75, 'lin'],
  level: [0.2, 1, 'lin'],
}
const toBand = (k: Key, v: number) => {
  const [a, b, m] = RANGE[k]
  return m === 'log' ? Math.log(v / a) / Math.log(b / a) : (v - a) / (b - a)
}
const fromBand = (k: Key, n: number) => {
  const [a, b, m] = RANGE[k]
  return m === 'log' ? a * (b / a) ** n : a + (b - a) * n
}

// Presets from prototype/backgrounds.html (Will's "Will" preset included). Only the keys that differ from the default.
export const VISUAL_PRESETS: Record<string, Partial<Visuals>> = {
  Default: {},
  Halftone: { cell: 20, dmin: 0, dmax: 0.56, scale: 1.1, warp: 1, speed: 0.5 },
  Grain: { cell: 5, dmin: 0, dmax: 0.5, scale: 2.6, warp: 3.6, speed: 2.2 },
  Lava: { cell: 9, dmin: 0, dmax: 0.75, scale: 0.8, warp: 4, speed: 0.6 },
  Atlas: { cell: 16, dmin: 0, dmax: 0.22, scale: 5, warp: 3, speed: 0.4 },
  Tide: { cell: 14, dmin: 0.04, dmax: 0.48, scale: 0.45, warp: 0.6, speed: 3 },
  Will: { cell: 10, dmin: 0.13, dmax: 0.32, scale: 5.65, warp: 3.7, speed: 2.2 },
}

export function useVisuals() {
  const v = useState<Visuals>('visuals', () => ({ ...VISUALS_DEFAULT }))
  const preset = useState('visuals-preset', () => 'Default')
  return {
    v,
    preset,
    band: (k: Key) => toBand(k, v.value[k]),
    setBand(k: Key, n: number) {
      const x = fromBand(k, n)
      v.value[k] = k === 'cell' ? Math.round(x) : x // whole pixels keep the grid crisp
      preset.value = ''
    },
    apply(name: string) {
      v.value = { ...VISUALS_DEFAULT, ...VISUAL_PRESETS[name] }
      preset.value = name
    },
  }
}
