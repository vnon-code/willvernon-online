/**
 * The native pointer always stays visible. [data-cursor] (rendered once by
 * Base.astro as .cursor-ring) is an 8px accent ring that tracks the pointer
 * 1:1 via a direct transform on every pointermove — no gsap.quickTo lag, no
 * easing on position (REFERENCES anti-pattern: "a cursor that lags behind
 * it"). It becomes a crosshair with an XY readout over [data-scope], and
 * fills solid with a label over [data-cursor-label="..."] elements.
 *
 * Disabled entirely on (pointer: coarse) and under reduced motion: the ring
 * is never created/shown there, native cursor only.
 */
import { gsap } from './gsap';

export function initCursor() {
  const ring = document.querySelector<HTMLElement>('[data-cursor]');
  if (!ring) return;

  const mm = gsap.matchMedia();

  mm.add('(pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
    ring.classList.add('is-active');

    let label: HTMLElement | null = ring.querySelector('[data-cursor-ring-label]');
    if (!label) {
      label = document.createElement('span');
      label.setAttribute('data-cursor-ring-label', '');
      ring.appendChild(label);
    }

    const onMove = (e: PointerEvent) => {
      gsap.set(ring, { x: e.clientX, y: e.clientY });

      const overScope = (e.target as Element)?.closest?.('[data-scope]');
      ring.classList.toggle('is-crosshair', !!overScope);
      if (overScope && label) {
        const rect = overScope.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
        label.textContent = `${String(x).padStart(4, '0')},${String(y).padStart(4, '0')}`;
      }
    };

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element)?.closest<HTMLElement>('[data-cursor-label]');
      if (target) {
        ring.classList.add('is-filled');
        if (label) label.textContent = target.dataset.cursorLabel || '';
      }
    };
    const onOut = (e: PointerEvent) => {
      const leavingLabelled = (e.target as Element)?.closest?.('[data-cursor-label]');
      const enteringLabelled = (e.relatedTarget as Element | null)?.closest?.('[data-cursor-label]');
      if (leavingLabelled && !enteringLabelled) {
        ring.classList.remove('is-filled');
        if (label && !ring.classList.contains('is-crosshair')) label.textContent = '';
      }
    };

    window.addEventListener('pointermove', onMove);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      ring.classList.remove('is-active', 'is-crosshair', 'is-filled');
    };
  });
}
