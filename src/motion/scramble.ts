/**
 * ScrambleText on [data-scramble] only — mono metadata (nav labels, HUD
 * captions, index-row tags). Never headings or body copy.
 *
 * Accessibility: the real text lives in a visually hidden sibling span
 * (.sr-only), and the glyph animation runs on a visually-identical child
 * span marked aria-hidden, so screen readers always read the final text,
 * never scramble frames. No aria-label is used: these are generic
 * span/p elements, where aria-label is prohibited (axe aria-prohibited-attr).
 */
import { gsap, ScrambleTextPlugin } from './gsap';
import { bpmIntervalMs } from './bpm';

void ScrambleTextPlugin; // ensure plugin import isn't tree-shaken away

const GLYPHS = '01#/[]—∆Ω';
const MAX_DURATION = 0.6;
const BASE_INTERVAL_MS = 600; // default (unarmed) time budget for one full resolve

function originalText(el: HTMLElement): string {
  if (el.dataset.scrambleText === undefined) {
    el.dataset.scrambleText = (el.textContent || '').trim();
  }
  return el.dataset.scrambleText;
}

function prepare(el: HTMLElement): HTMLElement {
  const ready = el.querySelector<HTMLElement>('[data-scramble-visual]');
  if (ready) return ready;

  const original = originalText(el);

  const label = document.createElement('span');
  label.className = 'sr-only';
  label.textContent = original;

  const visual = document.createElement('span');
  visual.setAttribute('data-scramble-visual', '');
  visual.setAttribute('aria-hidden', 'true');
  visual.textContent = original;

  el.textContent = '';
  el.append(label, visual);
  return visual;
}

function playScramble(visual: HTMLElement, text: string) {
  const intervalMs = bpmIntervalMs(BASE_INTERVAL_MS, 200, 1200);
  const duration = Math.min(MAX_DURATION, intervalMs / 1000);
  gsap.to(visual, {
    duration,
    ease: 'none',
    scrambleText: {
      text,
      chars: GLYPHS,
      revealDelay: 0,
      speed: 0.4,
      tweenLength: false,
    },
    overwrite: true,
  });
}

export function initScramble() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', () => {
    // Reduced motion: final text set instantly, no scramble frames at all.
    document.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
      el.textContent = originalText(el);
    });
  });

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-scramble]'));
    const cleanups: Array<() => void> = [];

    els.forEach((el) => {
      const visual = prepare(el);
      const text = originalText(el);

      const onEnter = () => playScramble(visual, text);
      // The span itself is never focusable; keyboard focus lands on the
      // closest interactive ancestor (e.g. the nav link), if any.
      const focusTarget = el.closest<HTMLElement>('a[href], button');
      el.addEventListener('mouseenter', onEnter);
      focusTarget?.addEventListener('focus', onEnter);
      cleanups.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        focusTarget?.removeEventListener('focus', onEnter);
      });
    });

    // Enter-viewport trigger for metadata that isn't hover-reachable
    // (footer status line, HUD captions above the fold on load, etc.)
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const visual = el.querySelector<HTMLElement>('[data-scramble-visual]');
          if (visual) playScramble(visual, originalText(el));
          io.unobserve(el);
        });
      },
      { threshold: 0.6 },
    );
    els.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    return () => cleanups.forEach((fn) => fn());
  });
}
