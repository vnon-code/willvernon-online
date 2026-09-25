/**
 * data-kinetic="wdth" — the LCP-safe width-axis scrub (D-brutalist-grid.md
 * §4.3). The element is server-rendered at its final state and never hidden,
 * never split, never starts at opacity 0 or an offset: its only motion is
 * the `--wdth` custom property tweening 125→75 (108→75 below 768px) while it
 * scrolls out (`start: 'top top', end: 'bottom top', scrub: 0.3`).
 *
 * Guard against reflow: the element's block-size is pinned to its
 * first-render height and `contain: layout paint` is set before the scrub
 * starts (a one-time setup read, not a per-frame scroll-path read).
 *
 * Perf fallback (§4.3): where CSS.registerProperty isn't available the
 * custom-property tween can cost more than 4ms of layout on a low-end
 * device, so this falls back to a `scaleX` transform on the same element
 * instead — same visual compression, cheaper technique.
 */
import { gsap, ScrollTrigger } from './gsap';

const DESKTOP_QUERY = '(min-width: 768px)';
const MIN_WDTH = 75;

function supportsRegisteredCustomProps(): boolean {
  return typeof CSS !== 'undefined' && typeof CSS.registerProperty === 'function';
}

function getMaxWdth(): number {
  return window.matchMedia(DESKTOP_QUERY).matches ? 125 : 108;
}

export function initKinetic() {
  const els = document.querySelectorAll<HTMLElement>('[data-kinetic="wdth"]');
  if (!els.length) return;

  let registeredProp = false;
  if (supportsRegisteredCustomProps()) {
    try {
      (CSS as unknown as { registerProperty: (def: Record<string, unknown>) => void }).registerProperty({
        name: '--wdth',
        syntax: '<number>',
        inherits: false,
        initialValue: '125',
      });
      registeredProp = true;
    } catch {
      registeredProp = false;
    }
  }

  const mm = gsap.matchMedia();
  mm.add(
    { reduced: '(prefers-reduced-motion: reduce)' },
    () => {
      // Reduced motion: the element sits at its CSS-authored resting wdth
      // (125, or 108 below 768px per base.css) with no scrub at all.
    },
  );

  mm.add({ motion: '(prefers-reduced-motion: no-preference)' }, () => {
    const triggers: ScrollTrigger[] = [];

    // Block-size pin (§4.3): cleared on every refreshInit so the element
    // lays out at its natural height for the new viewport/fonts, then
    // re-measured on refresh. One read per element per refresh, never per
    // frame. document.fonts.ready triggers a refresh elsewhere (lines.ts),
    // which re-pins here too.
    const unpin = () => els.forEach((el) => el.style.removeProperty('block-size'));
    const write = (heights: number[]) =>
      els.forEach((el, i) => {
        el.style.blockSize = `${heights[i]}px`;
      });
    const pin = () => write(Array.from(els, (el) => el.getBoundingClientRect().height));
    // First pin: read now (layout is still clean at init), write on the next
    // frame so this module never dirties layout for the reads that follow
    // it in the same task (lines.ts, SplitText).
    const firstHeights = Array.from(els, (el) => el.getBoundingClientRect().height);
    requestAnimationFrame(() => {
      els.forEach((el) => {
        el.style.contain = 'layout paint';
      });
      write(firstHeights);
    });
    ScrollTrigger.addEventListener('refreshInit', unpin);
    ScrollTrigger.addEventListener('refresh', pin);

    els.forEach((el) => {
      if (registeredProp) {
        el.style.setProperty('--wdth', String(getMaxWdth()));
        const setWdth = gsap.quickSetter(el, '--wdth') as (v: string) => void;

        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.3,
            onRefresh: (self) => {
              const max = getMaxWdth();
              setWdth(String(max - self.progress * (max - MIN_WDTH)));
            },
            onUpdate: (self) => {
              const max = getMaxWdth();
              setWdth(String(max - self.progress * (max - MIN_WDTH)));
            },
          }),
        );
        return;
      }

      el.style.transformOrigin = 'left';
      const setScaleX = gsap.quickSetter(el, 'scaleX') as (v: number) => void;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.3,
          onUpdate: (self) => {
            const min = MIN_WDTH / getMaxWdth();
            setScaleX(1 - self.progress * (1 - min));
          },
        }),
      );
    });

    return () => {
      triggers.forEach((st) => st.kill());
      ScrollTrigger.removeEventListener('refreshInit', unpin);
      ScrollTrigger.removeEventListener('refresh', pin);
      unpin();
      els.forEach((el) => {
        el.style.removeProperty('contain');
        el.style.removeProperty('--wdth');
      });
    };
  });
}
