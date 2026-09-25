/**
 * data-rail / data-rail-step — the Phase 4 process-step rail that replaces
 * the retired data-ruler (D-brutalist-grid.md §3.3, §3.5.4). No Phase 2b
 * page renders this attribute yet (about.astro's timeline still carries the
 * old data-ruler markup — migrating it is a later-phase page-ownership job,
 * not this file's), so this module is a correct, ready no-op today.
 *
 * Sets `--rail-progress` (0..1) on the container as it scrolls through, and
 * toggles `aria-current="step"` on whichever `[data-rail-step]` the current
 * scroll depth has reached. Per §3.5.4 a dedicated ScrollTrigger per
 * `[data-rail]` container is explicitly allowed (unlike the grid-line
 * system's single master trigger), capped at one per case study. Step
 * geometry is cached on 'refresh', never read inside onUpdate.
 */
import { gsap, ScrollTrigger } from './gsap';

export function initRail() {
  const rails = Array.from(document.querySelectorAll<HTMLElement>('[data-rail]'));
  if (!rails.length) return;

  const mm = gsap.matchMedia();
  mm.add(
    { motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' },
    (context) => {
      const { reduced } = context.conditions as { reduced: boolean };
      const triggers: ScrollTrigger[] = [];
      const refreshCleanups: Array<() => void> = [];

      rails.forEach((rail) => {
        const steps = Array.from(rail.querySelectorAll<HTMLElement>('[data-rail-step]'));

        if (reduced) {
          rail.style.setProperty('--rail-progress', '1');
          if (steps.length) steps[steps.length - 1].setAttribute('aria-current', 'step');
          return;
        }

        let stepTops: number[] = [];
        let railHeight = 0;
        const measure = () => {
          const rect = rail.getBoundingClientRect();
          railHeight = rect.height;
          const railTop = rect.top + window.scrollY;
          stepTops = steps.map((s) => s.getBoundingClientRect().top + window.scrollY - railTop);
        };
        measure();
        const onRefresh = () => measure();
        ScrollTrigger.addEventListener('refresh', onRefresh);
        refreshCleanups.push(() => ScrollTrigger.removeEventListener('refresh', onRefresh));

        const setProgress = gsap.quickSetter(rail, '--rail-progress') as (v: number) => void;
        let activeIndex = -1;

        triggers.push(
          ScrollTrigger.create({
            trigger: rail,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.3,
            onUpdate: (self) => {
              setProgress(self.progress);
              if (!steps.length || !railHeight) return;
              const depth = self.progress * railHeight;
              let next = 0;
              for (let i = 0; i < stepTops.length; i += 1) {
                if (depth >= stepTops[i]) next = i;
              }
              if (next !== activeIndex) {
                if (steps[activeIndex]) steps[activeIndex].removeAttribute('aria-current');
                steps[next].setAttribute('aria-current', 'step');
                activeIndex = next;
              }
            },
          }),
        );
      });

      return () => {
        triggers.forEach((st) => st.kill());
        refreshCleanups.forEach((fn) => fn());
      };
    },
  );
}
