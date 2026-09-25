/**
 * data-ruler on a container with children [data-ruler-step]: a calibration
 * ruler that fills as the reader scrolls the steps into view.
 *
 * Motion branch: ScrollTrigger scrub sets --ruler-progress (0..1) on the
 * container and marks the nearest step aria-current="step".
 * Reduced-motion branch: no scrub — an IntersectionObserver marks whichever
 * step is most visible as aria-current="step"; --ruler-progress jumps to
 * that step's index / (count - 1) instantly, no tween.
 */
import { gsap, ScrollTrigger } from './gsap';

function setActiveStep(steps: HTMLElement[], index: number) {
  steps.forEach((step, i) => {
    if (i === index) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
}

export function initRuler() {
  const containers = document.querySelectorAll<HTMLElement>('[data-ruler]');
  if (!containers.length) return;

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const triggers: ScrollTrigger[] = [];

    containers.forEach((container) => {
      const steps = Array.from(container.querySelectorAll<HTMLElement>('[data-ruler-step]'));
      if (!steps.length) return;

      container.style.setProperty('--ruler-progress', '0');

      const st = ScrollTrigger.create({
        trigger: container,
        start: 'top 75%',
        end: 'bottom 25%',
        scrub: true,
        onUpdate(self) {
          container.style.setProperty('--ruler-progress', self.progress.toFixed(4));
          const index = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
          setActiveStep(steps, index);
        },
      });
      triggers.push(st);
    });

    return () => triggers.forEach((st) => st.kill());
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    const observers: IntersectionObserver[] = [];

    containers.forEach((container) => {
      const steps = Array.from(container.querySelectorAll<HTMLElement>('[data-ruler-step]'));
      if (!steps.length) return;

      container.style.setProperty('--ruler-progress', '0');

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const index = steps.indexOf(entry.target as HTMLElement);
            if (index === -1) return;
            setActiveStep(steps, index);
            container.style.setProperty('--ruler-progress', String(index / Math.max(1, steps.length - 1)));
          });
        },
        { threshold: 0.5 },
      );
      steps.forEach((step) => io.observe(step));
      observers.push(io);
    });

    return () => observers.forEach((io) => io.disconnect());
  });
}
