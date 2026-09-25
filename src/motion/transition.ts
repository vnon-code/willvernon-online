/**
 * Page transitions ("channel switch") ride the native cross-document View
 * Transitions API (see motion.css: @view-transition + ::view-transition-*
 * keyframes, gated under prefers-reduced-motion: no-preference). This
 * module only holds a small helper for tagging
 * view-transition-name on elements Phase 4 will pair across navigations
 * (index row title/thumbnail -> case-study hero).
 *
 * No JS link-interception overlay: navigation itself is never delayed.
 * Browsers without View Transitions support just navigate normally, and
 * pagereveal never carries a viewTransition, so the scanline never plays —
 * that is the correct fallback, not an error case.
 */

export function initTransitions() {
  // The scanline sweep is CSS-driven now (motion.css .vt-scanline +
  // html.vt-reveal, set by Base.astro's inline pagereveal listener). A
  // listener registered here would attach after pagereveal has already fired
  // (this module is deferred), and a pageswap animation on the outgoing page
  // is never seen because its snapshot is static. Kept as the init hook for
  // future view-transition wiring.
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
