/**
 * Case-study page behaviour (F1's own script, distinct from the shared
 * src/motion/* runtime): the process-video/gif-video in-view autoplay, the
 * embed click-to-load facade, and mirroring src/motion/rail.ts's
 * `aria-current="step"` onto `[data-rail][data-active-step]` for
 * ProcessSteps.astro's sticky detail panel CSS (see that component's
 * header comment — it never re-renders text at scroll time, only toggles a
 * data attribute the per-index CSS rules key off of).
 */

function initCaseVideos() {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('[data-cs-video]'));
  if (!videos.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const load = (v: HTMLVideoElement) => {
    if (v.dataset.csLoaded) return;
    v.dataset.csLoaded = '1';
    const src = v.dataset.csSrc;
    if (src) v.src = src;
  };

  if (reduced) {
    // No autoplay, ever: load enough that the poster/controls are usable if
    // the visitor presses play themselves, but nothing moves on its own.
    videos.forEach((v) => {
      v.preload = 'metadata';
      load(v);
    });
    return;
  }

  if (!('IntersectionObserver' in window)) {
    videos.forEach((v) => {
      load(v);
      v.play().catch(() => {});
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const v = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          load(v);
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    },
    { threshold: 0.35 },
  );
  videos.forEach((v) => io.observe(v));
}

function initEmbedFacades() {
  const facades = Array.from(document.querySelectorAll<HTMLElement>('[data-cs-embed]'));
  facades.forEach((facade) => {
    const btn = facade.querySelector<HTMLButtonElement>('[data-cs-embed-btn]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const src = facade.dataset.csEmbedSrc;
      const title = facade.dataset.csEmbedTitle || 'Embedded video';
      if (!src) return;
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = title;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
      iframe.allowFullscreen = true;
      facade.replaceChildren(iframe);
    });
  });
}

/** Mirrors rail.ts's aria-current onto the [data-rail] container itself, as
 * a plain zero-padded index, for ProcessSteps.astro's per-index CSS. One
 * MutationObserver per rail (there's at most one per case-study page). */
function initRailDetailMirror() {
  const rails = Array.from(document.querySelectorAll<HTMLElement>('[data-rail]'));
  rails.forEach((rail) => {
    const steps = Array.from(rail.querySelectorAll<HTMLElement>('[data-rail-step]'));
    if (!steps.length) return;
    const sync = () => {
      const idx = steps.findIndex((s) => s.getAttribute('aria-current') === 'step');
      if (idx >= 0) rail.dataset.activeStep = String(idx);
    };
    sync();
    const mo = new MutationObserver(sync);
    steps.forEach((s) => mo.observe(s, { attributes: true, attributeFilter: ['aria-current'] }));
  });
}

export function initCaseStudy() {
  initCaseVideos();
  initEmbedFacades();
  initRailDetailMirror();
}
