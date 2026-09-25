/**
 * data-reveal="lines"  — SplitText line reveal for headings/paragraphs.
 * data-reveal="fade"   — block fade-up.
 * data-reveal-stagger  — on a parent: its direct children stagger in 60ms apart.
 *
 * Fail-open: motion.css only hides [data-reveal]/[data-reveal-stagger]
 * children when `html.js` is present, and Base.astro's inline head script
 * is the only thing that ever adds that class — so with JS disabled
 * nothing is ever hidden. Once `html.js` IS present, this module is
 * responsible for un-hiding what that CSS rule hid, either by animating it
 * in or, on any failure, by force-setting opacity back to 1 outright. Two
 * backstops guarantee that: a try/catch around the SplitText path, and a
 * safety timeout that, after 2.5s, force-reveals anything still pending in
 * or above the viewport (and anything below it once it has been scrolled
 * into view and had time to animate). If this module never runs at all,
 * Base.astro's inline head failsafe drops html.js after 3s. Reveals are un-hidden with an explicit inline `opacity: 1`
 * (not `removeProperty`), because the hidden state comes from a
 * stylesheet rule, not an inline style, and only an inline value beats it.
 */
import { gsap, SplitText } from './gsap';
import { EASE_OUT, DUR, STAGGER } from './eases';

const SAFETY_TIMEOUT_MS = 2500;
const pendingSafety = new Set<HTMLElement>();

function armSafety(el: HTMLElement) {
  pendingSafety.add(el);
}
function clearSafety(el: HTMLElement) {
  pendingSafety.delete(el);
}

/** Already on screen at init: animate now instead of waiting for the
 * 'top 88%' start line, which a partly visible element may never cross
 * (e.g. the bottom of a short page, or the hero's lower lines). */
function trigger(el: HTMLElement) {
  if (el.getBoundingClientRect().top < window.innerHeight) return undefined;
  return { trigger: el, start: 'top 88%', once: true };
}

function revealNow(el: HTMLElement) {
  el.style.setProperty('opacity', '1');
  el.style.removeProperty('transform');
}

function forceReveal(el: HTMLElement) {
  revealNow(el);
  el.style.removeProperty('visibility');
  el.querySelectorAll<HTMLElement>('.split-line, .split-child').forEach(revealNow);
}

function scheduleGlobalSafety() {
  // Only force what the viewer can actually see (in or above the viewport):
  // below-the-fold reveals are legitimately waiting for their ScrollTrigger
  // and must still animate when scrolled to. Those get the same guarantee
  // lazily: once one intersects, it has DUR.base + 1s to finish its tween.
  const graceMs = DUR.base * 1000 + 1000;
  window.setTimeout(() => {
    const later: HTMLElement[] = [];
    pendingSafety.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        forceReveal(el);
        pendingSafety.delete(el);
      } else {
        later.push(el);
      }
    });
    if (!later.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        window.setTimeout(() => {
          if (!pendingSafety.has(el)) return;
          forceReveal(el);
          pendingSafety.delete(el);
        }, graceMs);
      });
    });
    later.forEach((el) => io.observe(el));
  }, SAFETY_TIMEOUT_MS);
}

declare global {
  interface Window {
    __motionReady?: boolean;
  }
}

export function initReveal() {
  // Tells Base.astro's inline head failsafe that the reveal owner is alive,
  // so it must not strip html.js. If it already did (module arrived after
  // the failsafe window), everything is visible: don't re-hide, just settle.
  window.__motionReady = true;
  const hiddenByCss = document.documentElement.classList.contains('js');

  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conds = context.conditions as { motion: boolean; reduced: boolean };
      const motion = conds.motion && hiddenByCss;

      // ---- data-reveal="lines" ----
      document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
        if (!motion) {
          revealNow(el);
          return;
        }
        armSafety(el);
        // The CSS rule that hid this element (html.js [data-reveal]) hides
        // the WHOLE element, but the reveal itself now happens per-line —
        // clear it here so an ancestor opacity:0 doesn't sit over lines
        // that are individually animating to opacity:1.
        el.style.setProperty('opacity', '1');
        try {
          SplitText.create(el, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'split-line',
            autoSplit: true,
            onSplit(self: { lines: Element[] }) {
              clearSafety(el);
              return gsap.fromTo(self.lines, { yPercent: 100, opacity: 0 }, {
                yPercent: 0,
                opacity: 1,
                duration: DUR.base,
                ease: EASE_OUT,
                stagger: STAGGER.splitLine,
                scrollTrigger: trigger(el),
              });
            },
          });
        } catch {
          clearSafety(el);
          forceReveal(el);
        }
      });

      // ---- data-reveal="fade" ----
      const fadeEls = document.querySelectorAll<HTMLElement>('[data-reveal="fade"]');
      fadeEls.forEach((el) => {
        if (!motion) {
          revealNow(el);
          return;
        }
        armSafety(el);
        // fromTo, not from(): the CSS rule (html.js [data-reveal]) already
        // computes opacity 0, so a from() would tween 0 -> 0.
        gsap.fromTo(el, { y: 24, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: DUR.base,
          ease: EASE_OUT,
          scrollTrigger: trigger(el),
          onComplete: () => clearSafety(el),
        });
      });

      // ---- data-reveal-stagger (direct children) ----
      document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((parent) => {
        const children = Array.from(parent.children) as HTMLElement[];
        if (!children.length) return;
        children.forEach((c) => c.classList.add('split-child'));
        if (!motion) {
          children.forEach(revealNow);
          return;
        }
        armSafety(parent);
        gsap.fromTo(children, { y: 16, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: DUR.base,
          ease: EASE_OUT,
          stagger: 0.06,
          scrollTrigger: trigger(parent),
          onComplete: () => clearSafety(parent),
        });
      });

      // Tweens/ScrollTriggers created above are tracked by this matchMedia
      // context automatically and reverted when the query stops matching —
      // no manual cleanup needed (and killing ScrollTrigger.getAll() here
      // would also kill triggers owned by other motion modules).
    },
  );

  scheduleGlobalSafety();
}
