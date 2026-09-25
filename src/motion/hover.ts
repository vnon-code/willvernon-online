/**
 * data-hot — hover response (D-brutalist-grid.md §3.4.D). While the pointer
 * is over any `[data-hot]` element, the GridFrame bay lines at its left and
 * right edges go ink. `(hover: hover) and (pointer: fine)` only; touch shows
 * its affordance permanently via CSS (C's job), no JS needed there.
 *
 * Geometry (container left, bay width, gutter) is cached once per
 * ScrollTrigger 'refresh' — the only per-pointer-event read is the hovered
 * element's own rect inside the enter handler itself, which is not a scroll
 * path (§3.4.D).
 */
import { gsap, ScrollTrigger } from './gsap';
import { DUR, EASE_OUT, EASE_STEP2 } from './eases';

interface Geometry {
  containerLeft: number;
  bayW: number;
  g: number;
}

let geometry: Geometry | null = null;

function measure(): Geometry | null {
  const track = document.querySelector<HTMLElement>('[data-grid-frame] .gf-track');
  if (!track) return null;
  const root = getComputedStyle(document.documentElement);
  const g = parseFloat(root.getPropertyValue('--g')) || 16;
  const bays = parseFloat(root.getPropertyValue('--bays')) || 1;
  const rect = track.getBoundingClientRect();
  const bayW = (rect.width - (bays - 1) * g) / bays;
  return { containerLeft: rect.left, bayW, g };
}

function lineIndexFor(x: number): number {
  if (!geometry) return 0;
  const k = Math.round((x - geometry.containerLeft) / (geometry.bayW + geometry.g));
  return Math.max(0, Math.min(4, k));
}

function hotEl(index: number): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-gf-line="${index}"] [data-gf-hot]`);
}

export function initHover() {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('[data-hot]'));
  if (!targets.length) return;

  const mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      reduced: '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conds = context.conditions as { motion: boolean; reduced: boolean };
      const instant = !!conds.reduced;

      geometry = measure();
      const onRefresh = () => {
        geometry = measure();
      };
      ScrollTrigger.addEventListener('refresh', onRefresh);

      const onEnter = (e: PointerEvent) => {
        const el = e.currentTarget as HTMLElement;
        const rect = el.getBoundingClientRect();
        const iLeft = lineIndexFor(rect.left);
        const iRight = lineIndexFor(rect.right);
        el.dataset.hotLines = `${iLeft},${iRight}`;
        [iLeft, iRight].forEach((i) => {
          const hot = hotEl(i);
          if (!hot) return;
          if (instant) gsap.set(hot, { opacity: 1 });
          else gsap.to(hot, { opacity: 1, duration: DUR.hotIn, ease: EASE_STEP2 });
        });
      };

      const onLeave = (e: PointerEvent) => {
        const el = e.currentTarget as HTMLElement;
        const stored = el.dataset.hotLines;
        if (!stored) return;
        stored.split(',').forEach((s) => {
          const hot = hotEl(Number(s));
          if (!hot) return;
          if (instant) gsap.set(hot, { opacity: 0 });
          else gsap.to(hot, { opacity: 0, duration: DUR.hotOut, ease: EASE_OUT });
        });
        delete el.dataset.hotLines;
      };

      targets.forEach((el) => {
        el.addEventListener('pointerenter', onEnter);
        el.addEventListener('pointerleave', onLeave);
      });

      return () => {
        ScrollTrigger.removeEventListener('refresh', onRefresh);
        targets.forEach((el) => {
          el.removeEventListener('pointerenter', onEnter);
          el.removeEventListener('pointerleave', onLeave);
        });
      };
    },
  );
}
