/**
 * Page transitions ride the native cross-document View Transitions API: the
 * hard-cut, stepped-per-bay wipe lives entirely in CSS
 * (src/styles/motion.css `@view-transition` + `::view-transition-*`
 * keyframes, gated under `prefers-reduced-motion: no-preference`).
 * D-brutalist-grid.md §4.4.
 *
 * This module only holds a small helper for tagging view-transition-name on
 * elements Phase 4 will pair across navigations (index row title/thumbnail
 * -> case-study hero).
 *
 * No JS link-interception overlay: navigation itself is never delayed.
 * Browsers without View Transitions support just navigate normally, and
 * `pagereveal` never carries a viewTransition on them, so the stepped wipe
 * never plays there — that is the correct fallback, not an error case.
 *
 * The GridFrame verticals and Nav both carry `view-transition-name` (grid-
 * frame, nav) and are excluded from the wipe animation in motion.css, so
 * they read as continuous across the cut; lines.ts additionally skips its
 * one-time intro draw on the incoming page of a view transition (detected
 * via `html.vt-reveal`, set by Base.astro's inline `pagereveal` listener)
 * since those lines are already drawn.
 */

export function initTransitions() {
  // No wiring needed: the transition itself is pure CSS + the browser's
  // native View Transitions lifecycle. Kept as the init hook for any future
  // per-transition JS (Phase 4 data-vt pairing beyond the name tag below).
}

/**
 * Tags an element with a unique view-transition-name so it morphs across a
 * cross-document navigation into the matching-named element on the next
 * page (Phase 4: project index row title/thumbnail -> case-study hero).
 * Applied via inline style per the View Transitions spec (names must be
 * set in CSS/style, not as a plain attribute). Pass null to clear it.
 */
export function setViewTransitionName(el: HTMLElement, name: string | null) {
  if (name) {
    el.style.setProperty('view-transition-name', name);
    el.dataset.vtName = name;
  } else {
    el.style.removeProperty('view-transition-name');
    delete el.dataset.vtName;
  }
}
