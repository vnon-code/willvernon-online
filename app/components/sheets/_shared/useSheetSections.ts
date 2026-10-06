import { provide, type InjectionKey } from 'vue'

// PROTOTYPE (overnight run, 2026-10-07; TOOLS.md "Shared head, contents, numbering"): one list of a Sheet's numbered
// sections, declared once by the variant. SheetContents (the index and the margin rail) and SheetSectionNo
// ("03 / 05 Define") both read it, so the numbers, the total and the anchors come from one place.
export interface SheetSection { id: string, label: string }
export interface SheetSections {
  list: SheetSection[]
  /** The section's anchor id (what the contents links to) */
  anchor: (id: string) => string
  /** Its heading's id (the section's accessible name) */
  heading: (id: string) => string
  /** Bind on the variant's own <section>: anchor id, aria-labelledby, and the hook the rail and the contents read */
  sec: (id: string) => Record<string, string>
}

// The project info SheetHead shows; each field optional, always in this order (Year, Module, Client, Role, Tools, With)
export interface SheetInfo { year?: string, module?: string, client?: string, role?: string, tools?: string, with?: string }

export const SHEET_SECTIONS: InjectionKey<SheetSections> = Symbol('sheet-sections')

export function useSheetSections(prefix: string, list: SheetSection[]): SheetSections {
  const anchor = (id: string) => `${prefix}-${id}`
  const heading = (id: string) => `${prefix}-${id}-h`
  const s: SheetSections = {
    list,
    anchor,
    heading,
    sec: id => ({ 'id': anchor(id), 'aria-labelledby': heading(id), 'data-sheet-section': id }),
  }
  provide(SHEET_SECTIONS, s)
  return s
}

// Scroll the Sheet's layer so the section sits just under the docked header, then hand focus to its heading
export function goToSection(id: string, s: SheetSections) {
  const el = document.getElementById(s.anchor(id))
  const layer = el?.closest<HTMLElement>('[data-sheet-layer]')
  if (!el || !layer) return
  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  layer.scrollBy({ top: el.getBoundingClientRect().top - header, behavior: reduce ? 'auto' : 'smooth' })
  document.getElementById(s.heading(id))?.focus({ preventScroll: true })
}

export const sheetNo = (i: number) => String(i + 1).padStart(2, '0')
