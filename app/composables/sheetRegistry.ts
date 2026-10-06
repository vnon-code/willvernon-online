import { defineAsyncComponent, type Component } from 'vue'
import SheetA from '~/components/SheetA.vue'
import SheetB from '~/components/SheetB.vue'
import SheetC from '~/components/SheetC.vue'
import SheetR from '~/components/SheetR.vue'
import SheetS from '~/components/SheetS.vue'
import SheetT from '~/components/SheetT.vue'
import SheetU from '~/components/SheetU.vue'
import { SHEET_NAMES } from './useSheetProto'

// PROTOTYPE (overnight run; how-to in .scratch/v1-launch/overnight/TOOLS.md): which Sheet body a project opens with.
// A project's own bodies are app/components/sheets/<slug>/<Id>.vue, listed with its default and scores in
// app/components/sheets/<slug>/meta.json; a meta may also list the shared round-1/2 bodies (A, B, C, R, S, T, U) by id.
// `?sheet=<id>` picks a variant for whichever project opens, when that project has it; otherwise its default. A project
// with no meta.json opens the shared body `?sheet=` names, or else ProjectSheet ('0').
export interface SheetMeta {
  default: string
  variants: Record<string, { name: string, score?: number | null, of?: number }>
}

const metas = import.meta.glob<SheetMeta>('../components/sheets/*/meta.json', { import: 'default', eager: true })
const bodies = import.meta.glob<Component>('../components/sheets/*/*.vue', { import: 'default' })
const dir = (k: string) => k.split('/').at(-2)!
export const SHEET_META: Record<string, SheetMeta> = Object.fromEntries(Object.entries(metas).map(([k, m]) => [dir(k), m]))
const SHARED: Record<string, Component> = { A: SheetA, B: SheetB, C: SheetC, R: SheetR, S: SheetS, T: SheetT, U: SheetU }

const own = (slug: string, id: string) => bodies[`../components/sheets/${slug}/${id}.vue`]
const exists = (slug: string, id: string) => !!own(slug, id) || id in SHARED || id === '0'

// The variant id a project opens with
export function resolveSheet(slug: string, picked: string | null): string {
  const meta = SHEET_META[slug]
  if (meta) return picked && picked in meta.variants && exists(slug, picked) ? picked : meta.default
  return picked && picked in SHARED ? picked : '0'
}

// The body component for a variant; null means ProjectSheet ('0'), which takes other props (app.vue)
const cache = new Map<string, Component>()
export function sheetBody(slug: string, id: string): Component | null {
  const load = own(slug, id)
  if (!load) return SHARED[id] ?? null
  const key = `${slug}/${id}`
  if (!cache.has(key)) cache.set(key, defineAsyncComponent(load as () => Promise<Component>))
  return cache.get(key)!
}

// The options panel's list for a project
export function sheetOptions(slug: string) {
  const meta = SHEET_META[slug]
  if (!meta) return [{ id: '0', name: 'ProjectSheet (no variants yet)', score: null as number | null | undefined, of: 30 }]
  return Object.entries(meta.variants).map(([id, v]) => ({ id, name: v.name || SHEET_NAMES[id as keyof typeof SHEET_NAMES] || id, score: v.score, of: v.of ?? 30 }))
}
