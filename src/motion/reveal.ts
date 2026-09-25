/**
 * data-reveal="rise"   — y 24px→0 plus opacity.
 * data-reveal="cut"    — hard stepped appear (opacity only).
 * data-reveal-stagger  — on a parent: its direct children rise together,
 *                        staggered.
 * data-split="lines"   — SplitText line reveal for non-LCP headings.
 * data-split="chars"   — SplitText char reveal (404 H1, stems console
 *                        title only): characters settle from a random
 *                        `wdth` 75–125 to 100 in a raw stepped arrival.
 *
 * Phase 2b (D-brutalist-grid.md §3.3/§4.3, §6): the old data-reveal="lines"/
 * "fade" values are retired. Pages not yet migrated to the new values (or
 * that still carry the retired data-ruler system) are simply left alone —
 * motion.css only pre-hides the *new* attribute values, so an un-migrated
 * element was never hidden in the first place and needs no JS handling
 * here. This is the fail-open contract in practice.
 *
 * Fail-open: motion.css only hides these targets under `html.js` (further
 * gated to `(prefers-reduced-motion: no-preference)`), and Base.astro's
 * inline head script is the only thing that ever adds that class — so with
 * JS disabled nothing is ever hidden. Once html.js IS present, this module
 * is responsible for un-hiding what that CSS rule hid, either by animating
 * it in or, on any failure, by force-setting opacity back to 1 outright. Two
 * backstops guarantee that: a try/catch around every SplitText call, and a
 * safety timeout that, after 2.5s, force-reveals anything still pending in
 * or above the viewport (and anything below it once it has been scrolled
 * into view and had time to animate). If this module never runs at all,
 * Base.astro's inline head failsafe drops html.js after 3s.
 *
 * Reveals are un-hidden with an explicit inline `opacity: 1` (not
 * `removeProperty`), because the hidden state comes from a stylesheet rule,
 * not an inline style, and only an inline value beats it.
 */
import { gsap, ScrollTrigger, SplitText } from './gsap';
import { EASE_OUT, EASE_STEP, EASE_STEP3, DUR, STAGGER } from './eases';

const SAFETY_TIMEOUT_MS = 2500;
const pendingSafety = new Set<HTMLElement>();

function armSafety(el: HTMLElement) {
  pendingSafety.add(el);
}
function clearSafety(el: HTMLElement) {
  pendingSafety.delete(el);
}

function revealNow(el: HTMLElement) {
  el.style.setProperty('opacity', '1');
  el.style.removeProperty('transform');
}

function forceReveal(el: HTMLElement) {
  revealNow(el);
  el.style.removeProperty('visibility');
  el.querySelectorAll<HTMLElement>('.split-line, .split-char').forEach(revealNow);
}

function scheduleGlobalSafety() {
  // Only force what the viewer can actually see (in or above the viewport):
  // below-the-fold reveals are legitimately waiting for their ScrollTrigger
  // and must still animate when scrolled to. Those get the same guarantee
  // lazily: once one intersects, it has DUR.reveal + 1s to finish its tween.
  const graceMs = DUR.reveal * 1000 + 1000;
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

function revealRiseOrCut(kind: 'rise' | 'cut', motion: boolean) {
  const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-reveal="${kind}"]`));
  if (!els.length) return;
  if (!motion) {
    els.forEach(revealNow);
    return;
  }
  els.forEach(armSafety);

  ScrollTrigger.batch(els, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      const targets = batch as HTMLElement[];
      if (kind === 'rise') {
        gsap.fromTo(
          targets,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: DUR.reveal,
            ease: EASE_OUT,
            stagger: STAGGER.default,
            onComplete: () => targets.forEach(clearSafety),
          },
        );
      } else {
        gsap.fromTo(
          targets,
          { opacity: 0 },
          {
            opacity: 1,
            duration: DUR.reveal,
            ease: EASE_STEP,
            stagger: STAGGER.default,
            onComplete: () => targets.forEach(clearSafety),
          },
        );
      }
    },
  });
}

function revealStaggerGroups(motion: boolean) {
  document.querySelectorAll<HTMLElement>('[data-reveal-stagger]').forEach((parent) => {
    const children = Array.from(parent.children) as HTMLElement[];
    if (!children.length) return;
    children.forEach((c) => c.classList.add('split-child'));
    if (!motion) {
      children.forEach(revealNow);
      return;
    }
    armSafety(parent);
    ScrollTrigger.create({
      trigger: parent,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.fromTo(
          children,
          { y: 16, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: DUR.reveal,
            ease: EASE_OUT,
            stagger: STAGGER.default,
            onComplete: () => clearSafety(parent),
          },
        ),
    });
  });
}

/** Below-the-fold split headings are split only when they reach the same
 * 'top 88%' line their reveal fires at: one shared IntersectionObserver, no
 * ScrollTrigger (each of which would force a layout on creation), and no
 * SplitText work at all during load. */
function onApproach(els: HTMLElement[], fn: (el: HTMLElement) => void) {
  if (!('IntersectionObserver' in window)) {
    els.forEach(fn);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        io.unobserve(entry.target);
        fn(entry.target as HTMLElement);
      });
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  els.forEach((el) => io.observe(el));
}

/** Split work for headings in (or above) the first viewport runs now; the
 * rest waits for an idle callback so SplitText's layout reads never land in
 * the load-time long task. One batched read pass, before any split writes. */
function partitionByFold(els: HTMLElement[]): { now: HTMLElement[]; later: HTMLElement[] } {
  const vh = window.innerHeight;
  const tops = els.map((el) => el.getBoundingClientRect().top);
  const now: HTMLElement[] = [];
  const later: HTMLElement[] = [];
  els.forEach((el, i) => (tops[i] < vh ? now : later).push(el));
  return { now, later };
}

/**
 * SplitText autoSplit re-splits on resize and late font loads, replacing the
 * line elements. The reveal trigger is once-only, so onSplit must know
 * whether this heading has already been revealed: if so the fresh lines are
 * shown at rest; if not they are hidden and wait for the trigger. `revealed`
 * is filled the moment the trigger fires, so a re-split mid-tween also lands
 * visible.
 */
const revealedSplits = new WeakSet<HTMLElement>();

function tweenLines(el: HTMLElement, lines: Element[]) {
  revealedSplits.add(el);
  gsap.to(lines, {
    yPercent: 0,
    opacity: 1,
    duration: DUR.reveal,
    ease: EASE_OUT,
    stagger: STAGGER.splitLine,
    onComplete: () => clearSafety(el),
  });
}

/** `now`: the heading is already at its reveal line (onApproach), so tween
 * straight away instead of creating a ScrollTrigger. */
function setupSplitLine(el: HTMLElement, now = false) {
  let lines: Element[] = [];
  try {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      aria: 'auto',
      onSplit(self: { lines: Element[] }) {
        lines = self.lines;
        // motion.css hides the WHOLE heading (html.js [data-split]) so
        // there's no FOUC before SplitText runs; now that visibility is
        // delegated to the per-line masks, un-hide the heading itself.
        el.style.setProperty('opacity', '1');
        if (revealedSplits.has(el)) {
          gsap.set(self.lines, { yPercent: 0, opacity: 1 });
          return;
        }
        gsap.set(self.lines, { yPercent: 105, opacity: 0 });
      },
    });
  } catch {
    clearSafety(el);
    forceReveal(el);
    return;
  }
  if (!lines.length) {
    clearSafety(el);
    forceReveal(el);
    return;
  }

  if (now) {
    tweenLines(el, lines);
    return;
  }
  ScrollTrigger.create({
    trigger: el,
    start: 'top 88%',
    once: true,
    onEnter: () => tweenLines(el, lines),
  });
}

function revealSplitLines(motion: boolean) {
  const heads = Array.from(document.querySelectorAll<HTMLElement>('[data-split="lines"]'));
  if (!heads.length) return;
  if (!motion) {
    heads.forEach(forceReveal);
    return;
  }
  heads.forEach(armSafety);
  const { now, later } = partitionByFold(heads);
  now.forEach((el) => setupSplitLine(el));
  onApproach(later, (el) => setupSplitLine(el, true));
}

function setupSplitChars(el: HTMLElement, now = false) {
  try {
    SplitText.create(el, {
      type: 'chars',
      charsClass: 'split-char',
      aria: 'auto',
      onSplit(self: { chars: Element[] }) {
        // Same as setupSplitLine: un-hide the heading itself now that
        // visibility is delegated to the per-char opacity below.
        el.style.setProperty('opacity', '1');
        const chars = self.chars as HTMLElement[];
        chars.forEach((c) => {
          const rand = 75 + Math.random() * 50;
          c.style.setProperty('font-variation-settings', `'wdth' ${rand.toFixed(1)}`);
          c.style.opacity = '0';
        });
        const settle = () =>
          gsap.to(chars, {
            opacity: 1,
            fontVariationSettings: "'wdth' 100",
            duration: 0.4,
            ease: EASE_STEP3,
            stagger: STAGGER.splitChar,
            onComplete: () => clearSafety(el),
          });
        if (now) {
          settle();
          return;
        }
        ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: settle });
      },
    });
  } catch {
    clearSafety(el);
    forceReveal(el);
  }
}

function revealSplitChars(motion: boolean) {
  const heads = Array.from(document.querySelectorAll<HTMLElement>('[data-split="chars"]'));
  if (!heads.length) return;
  if (!motion) {
    heads.forEach(forceReveal);
    return;
  }
  heads.forEach(armSafety);
  const { now, later } = partitionByFold(heads);
  now.forEach((el) => setupSplitChars(el));
  onApproach(later, (el) => setupSplitChars(el, true));
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

      revealRiseOrCut('rise', motion);
      revealRiseOrCut('cut', motion);
      revealStaggerGroups(motion);
      revealSplitLines(motion);
      revealSplitChars(motion);

      // Tweens/ScrollTriggers created above are tracked by this matchMedia
      // context automatically and reverted when the query stops matching —
      // no manual cleanup needed (and killing ScrollTrigger.getAll() here
      // would also kill triggers owned by other motion modules).
    },
  );

  scheduleGlobalSafety();
}
