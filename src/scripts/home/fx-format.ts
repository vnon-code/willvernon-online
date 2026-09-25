/**
 * Display formatting for the stems console's FX sliders — mirrors each
 * legacy `getDisplay(val)` closure (never itself extracted as tracked copy;
 * these are computed glyphs — BYPASS/OFF/DRY/CENTER/FLAT, a unit suffix —
 * not literal strings from redesign/content/INVENTORY.md). Shared between
 * StemsConsole.astro's server-rendered initial values and
 * stems-console.ts's live slider updates so the two never drift apart.
 */
export function fxDisplay(paramId: string, val: number): string {
  switch (paramId) {
    case 'filter':
      return val >= 3900 ? 'BYPASS' : `${val} Hz`;
    case 'dist':
      return val === 0 ? 'OFF' : `${val} DB`;
    case 'shine':
      return val === 0 ? 'FLAT' : val > 0 ? `+${val} DB` : `${val} DB`;
    case 'reverb':
      return val === 0 ? 'DRY' : `${val}%`;
    case 'wander':
      return val === 0 ? 'CENTER' : `${val}%`;
    case 'delay':
      return val === 0 ? 'OFF' : `${val}%`;
    case 'flanger':
      return val === 0 ? 'OFF' : `${val}%`;
    case 'cyber':
      return val === 0 ? 'OFF' : `${val}%`;
    default:
      return String(val);
  }
}
