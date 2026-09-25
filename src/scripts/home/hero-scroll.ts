/**
 * Home hero — hides the "Scroll" tick (index.copy.049) once the visitor has
 * actually scrolled, per D-brutalist-grid.md §5.2. The tick's own draw/
 * retract loop is a CSS animation (index.astro's `hero-scroll-tick`
 * keyframes), which the global `prefers-reduced-motion: reduce` override in
 * base.css already freezes; this script only toggles visibility on scroll,
 * which is not itself motion.
 */
export function initHeroScroll(): void {
  const el = document.querySelector<HTMLElement>('[data-hero-scroll]');
  if (!el) return;

  const update = () => {
    el.classList.toggle('is-scrolled', window.scrollY > 0);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
}
