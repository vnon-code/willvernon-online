/**
 * ScrollSmoother — OPT-IN, not wired by default. Base.astro does not wrap
 * <main> in #smooth-wrapper/#smooth-content, so this is a no-op on every
 * page unless a page explicitly adds that structure:
 *
 *   <div id="smooth-wrapper"><div id="smooth-content"> ...page content... </div></div>
 *
 * Keep position:fixed elements (Nav, the cursor ring, HUD panels, the VT
 * scanline) OUTSIDE #smooth-wrapper — ScrollSmoother translates its content
 * element, so anything fixed that lives inside it would scroll with the
 * page instead of staying pinned. Base's own fixed chrome (nav, cursor
 * ring, scanline) already renders outside <main>, so this is safe as long
 * as a page that opts in doesn't move that chrome inside the wrapper.
 *
 * Only runs on (pointer: fine) and (min-width: 1024px) and
 * (prefers-reduced-motion: no-preference); native scroll everywhere else.
 */
import { gsap, loadScrollSmoother } from './gsap';

export async function initSmoother() {
  const wrapper = document.getElementById('smooth-wrapper');
  const content = document.getElementById('smooth-content');
  if (!wrapper || !content) return;

  const ScrollSmoother = await loadScrollSmoother();
  const mm = gsap.matchMedia();

  mm.add('(pointer: fine) and (min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const smoother = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1.2,
      effects: false,
    });

    return () => smoother.kill();
  });
}
