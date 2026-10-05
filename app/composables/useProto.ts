// PROTOTYPE — throwaway (Will, 2026-10-04). /proto renders the real Landing with layout variants, switched from a
// panel and kept in the URL (/proto?info=row). Picked so far: Sheet expand and Icon nav, always on here.
// Delete this file, ProtoPanel, ProtoExpand, ProtoInfo and every `proto` branch before shipping. '/' is unaffected.

export const PROTO_OPTIONS = {
  // Project info (Will, 2026-10-05): 'centred' is locked in — tools box under the strip, name in the bottom box.
  // Pages off /proto read 'now' (today's '/').
  info: ['centred'],
  // Interaction exploration (Will, 2026-10-05). Will's picks are locked in (one option each); useProtoFx.ts holds
  // what each one does. Everything is decided (round 19); next, build it into the real components.
  motion: ['medium'], // overall timing and travel
  change: ['morph'], // how the two boxes fit the next project
  name: ['slide'], // how the project name changes
  card: ['lift'], // hover and press on the centre card
  drawer: ['cascade'], // how the folder-tab drawers open
  chips: ['pill'], // the filter chips
  header: ['press'], // the round header buttons
  field: ['bright'], // Breath Bright: a slow pulse out of the centre teaser's border (FIELD_PRESETS)
  colour: ['smooth'], // the dot field's colours respond at once, then settle softly
  progress: ['bar'], // auto-step timer along the centre card's bottom border
  // The info row under the card (Will, 2026-10-05: tag | name | tools): tag and name on plates, tools as tiles, and the
  // name/tools boxes morph as before (hug). Open: the tag and tile size, all under the name plate's 42px.
  tagStyle: ['plate'],
  nameStyle: ['plate'],
  toolsStyle: ['tiles'],
  sides: ['s36'], // Will, 2026-10-05: 36px tag plate and tiles (the size loop's ★ was 32)
  rowMotion: ['hug'],
  // Round 24 (Will, 2026-10-05): the borders of everything, and how the dot field meets what's in front of it
  edges: ['lit'], // Will, 2026-10-05: light from above (ProtoPanel.vue's unscoped style)
  behind: ['shrink'], // Will, 2026-10-05: the dots shrink under the UI, as before (TheDotField.vue uMode 0)
  sound: ['tactile'], // UI sound palette (follows mute); step, chip and press are kept (Will, 2026-10-05)
  // The redone sounds (rounds 15–17): digital, in the hover tick's language; the Sheet is its drawer, bigger
  // Will's picks (2026-10-05). Also wired, without rows: the menu button clicks with the chip's blip tick, and hovering
  // a filter chip or a nav link plays the plain tick
  drawerSfx: ['blipTick'], // folder-tab drawers: two notes on ticks, up on open, down on close
  sheetSfx: ['ticksSlow'], // the project Sheet: four wide-stepped ticks
  hoverSfx: ['tickHi'], // pointer onto a strip card
  stepSfx: ['tick'], // a card passing the centre: a plain tick, ~10 dB under the old step
  chipSfx: ['blipTick'], // pressing a filter chip: two quick notes up, each on a tick
} as const
// Claude's pick per row where a row still has options (marked ★ in the switcher)
export const PROTO_PICKS: Partial<Record<keyof typeof PROTO_OPTIONS, string>> = {}

type Options = typeof PROTO_OPTIONS

// A strip card's text. `long` and `process` exist only for the expanded view (projects have them; AI and
// experiments leave them empty).
export interface ProtoText {
  title: string
  summary: string
  tools: string[]
  long: string
  process: { title: string, text: string }[]
}
export type ProtoCard = ProtoText & { id: string, discipline: string, poster: string, teaser?: string | null }
export type Proto = { [K in keyof Options]: K extends 'info' ? Options[K][number] | 'now' : Options[K][number] }

export function useProto() {
  const route = useRoute()
  const on = computed(() => route.path.replace(/\/$/, '') === '/proto')
  const state = useState<Proto>('proto', () => {
    const q = route.query
    const pick = <K extends keyof Options>(k: K): Proto[K] => {
      const v = String(q[k] ?? '')
      return ((PROTO_OPTIONS[k] as readonly string[]).includes(v) ? v : PROTO_OPTIONS[k][0]) as Proto[K]
    }
    return Object.fromEntries(Object.keys(PROTO_OPTIONS).map(k => [k, pick(k as keyof Options)])) as Proto
  })
  // Off /proto every variant reads as today's build
  const v = computed<Proto>(() => (on.value ? state.value : { ...state.value, info: 'now' }))
  function set<K extends keyof Options>(k: K, value: Proto[K]) {
    state.value[k] = value
    history.replaceState(history.state, '', `/proto?${new URLSearchParams(state.value as Record<string, string>)}`)
    dispatchEvent(new Event('resize')) // layouts read their tokens on resize
  }
  return { on, v, set }
}
