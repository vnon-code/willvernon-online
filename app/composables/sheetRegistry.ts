import { defineAsyncComponent, type Component } from 'vue'

// Each project's Sheet body, by the card's id: the top scorer of the overnight variant run (karpathy-loop final pick,
// 2026-10-08). The losing variants are kept on the branch archive/project-sheet-variants.
const SHEETS: Record<string, Component> = {
  '04': defineAsyncComponent(() => import('~/components/sheets/04/TB.vue')), // Survey sheet
  'amplified-spaces': defineAsyncComponent(() => import('~/components/sheets/amplified-spaces/T2b.vue')), // Track switcher
  'cargo-5015': defineAsyncComponent(() => import('~/components/sheets/cargo-5015/Ko.vue')), // Knockout
  'dredge': defineAsyncComponent(() => import('~/components/sheets/dredge/DA.vue')), // Edit bay
  'handheld-stories': defineAsyncComponent(() => import('~/components/sheets/handheld-stories/HD.vue')), // Still / Moving
  'marimekko-exhibition': defineAsyncComponent(() => import('~/components/sheets/marimekko-exhibition/MkD.vue')), // Catalogue
  'monolith': defineAsyncComponent(() => import('~/components/sheets/monolith/MB.vue')), // Turnaround
  'powersurge': defineAsyncComponent(() => import('~/components/sheets/powersurge/PwB.vue')), // Curve
  'remnants': defineAsyncComponent(() => import('~/components/sheets/remnants/RD.vue')), // Specimen
  'smugglers-outpost': defineAsyncComponent(() => import('~/components/sheets/smugglers-outpost/SF.vue')), // Prompt to pixels
  'synthetic_corals': defineAsyncComponent(() => import('~/components/sheets/synthetic_corals/CD.vue')), // Plate
  'the-world-plays-here': defineAsyncComponent(() => import('~/components/sheets/the-world-plays-here/WE.vue')), // Zoom out
}

// The Sheet a project opens; null when it has none (its card then doesn't open)
export const sheetBody = (slug: string): Component | null => SHEETS[slug] ?? null
