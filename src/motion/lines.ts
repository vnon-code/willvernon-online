/**
 * The grid-line system's motion: intro draw, scrubbed scroll draw (with
 * retraction on scroll-up), velocity shear of the fixed verticals, and the
 * 404 out-of-register snap-back. D-brutalist-grid.md §3.4, §3.5.
 *
 * Everything here reads only A's data-attribute API (data-grid-frame,
 * data-rule[-dash][-cross], data-frame) and the shared `.gf-v` / `.rule-x` /
 * `.fr-*` / `.cross` markup those components render — never touches markup
 * or base.css. Only `transform`/`opacity` animate (§3.5.1); geometry is
 * cached on ScrollTrigger 'refresh' (and once after document.fonts.ready),
 * never read inside the per-frame update (§3.5.2).
 *
 * A single master ScrollTrigger drives every rule/frame draw and the
 * vertical shear (§3.5.2, rule 2). Reduced motion: base.css/GridFrame.astro
 * already render everything fully drawn and static (this module's
 * pre-hidden from-states in motion.css are scoped under
 * `(prefers-reduced-motion: no-preference)`, so a reduced-motion user never
 * sees the collapsed state at all) — this module's reduced branch only has
 * to (a) zero the 404 signature's static x-offset so the lines sit aligned,
 * and (b) make hover instant instead of eased (handled in hover.ts).
 */
import { gsap, ScrollTrigger } from './gsap';
import { DUR, STAGGER } from './eases';

const VIEWPORT_FRACTION = 0.45; // draw completes by the time top is 55% up the viewport

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

// ---------------------------------------------------------------------
// GridFrame verticals: intro draw + velocity shear + 404 re-register
// ---------------------------------------------------------------------
interface VerticalEntry {
  el: HTMLElement;
  k: number;
  /** Resting x before any shear: 0 on every page except the 404 signature,
   * where GridFrame.astro bakes a static --gf-offset into the initial
   * transform (§5.5). The shear target must add to this, never replace it —
   * otherwise a always-on shear ticker (see below) would quietly erase the
   * out-of-register signature at rest, before the visitor scrolls at all. */
  baseX: number;
  quickX: (v: number) => void;
  registerLocked: boolean;
}

function makeQuickX(el: HTMLElement): (v: number) => void {
  return gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' }) as (v: number) => void;
}

function setupVerticals(skipIntro: boolean): VerticalEntry[] {
  const verticals = Array.from(document.querySelectorAll<HTMLElement>('[data-gf-line]'));
  if (!verticals.length) return [];

  const entries: VerticalEntry[] = verticals.map((el) => ({
    el,
    k: Number(el.dataset.gfLine) || 0,
    baseX: (gsap.getProperty(el, 'x') as number) || 0,
    quickX: makeQuickX(el),
    registerLocked: false,
  }));

  if (skipIntro) {
    gsap.set(verticals, { scaleY: 1 });
  } else {
    gsap.to(verticals, {
      scaleY: 1,
      duration: DUR.draw,
      ease: 'expo.out',
      stagger: STAGGER.vertical,
    });
  }

  return entries;
}

/** 404 only: snap the out-of-register verticals back to x:0 on CTA
 * hover/focus. There's no dedicated data-attribute for "the 404 CTA" in the
 * §3.3 API and this file never edits markup, so this is detected purely from
 * data already on the page: GridFrame.astro only ever writes a non-zero
 * --gf-offset inline style when Base.astro is given `gridOffsets` (404
 * only), so any other page is a guaranteed no-op here. */
function wireGridFrameRegister(entries: VerticalEntry[]) {
  const isOutOfRegister = entries.some((e) => {
    const v = parseFloat(e.el.style.getPropertyValue('--gf-offset'));
    return Number.isFinite(v) && v !== 0;
  });
  if (!isOutOfRegister) return;

  const cta = document.querySelector<HTMLElement>('main .btn, main .btn-line');
  if (!cta) return;

  const lock = () => {
    entries.forEach((e) => {
      e.registerLocked = true;
      // overwrite: true forcibly kills the quickTo tween's hold on `x` on
      // this element first. Without it, that persistent quickTo tween (still
      // "owning" x from the shear, even though we've stopped calling its
      // setter) and this one-off tween both track the same property, and
      // the quickTo tween's stale cached value wins the final render the
      // instant this tween completes — silently snapping the line straight
      // back to its unregistered position.
      gsap.to(e.el, { x: 0, duration: DUR.page, ease: 'steps(4)', overwrite: true });
    });
  };
  const unlock = () => {
    entries.forEach((e) => {
      // The lock tween's `overwrite: true` killed the quickTo tween that
      // used to control `x` on this element, so the closure captured in
      // `e.quickX` now points at a dead tween — silently a no-op if called
      // again. A fresh quickTo gives the shear ticker a live tween to drive
      // once it resumes on the next frame.
      e.quickX = makeQuickX(e.el);
      e.registerLocked = false;
    });
  };

  cta.addEventListener('pointerenter', lock);
  cta.addEventListener('focus', lock);
  cta.addEventListener('pointerleave', unlock);
  cta.addEventListener('blur', unlock);
}

// ---------------------------------------------------------------------
// Rules: scrubbed draw + crosses
// ---------------------------------------------------------------------
interface CrossEntry {
  el: HTMLElement;
  fraction: number;
  on: boolean;
  everShown: boolean;
}

interface RuleEntry {
  el: HTMLElement;
  line: HTMLElement;
  origin: 'start' | 'end' | 'center';
  docTop: number;
  setScaleX: (v: number) => void;
  crosses: CrossEntry[];
}

function ruleProgressToScale(origin: RuleEntry['origin'], p: number, fraction: number): boolean {
  if (origin === 'end') return p >= 1 - fraction;
  if (origin === 'center') return Math.abs(fraction - 0.5) <= p / 2;
  return p >= fraction; // start
}

function buildRules(fullWidth: number): RuleEntry[] {
  const rules = Array.from(document.querySelectorAll<HTMLElement>('[data-rule]'));
  return rules.map((el) => {
    const line = el.querySelector<HTMLElement>('.rule-line') || el;
    const rect = el.getBoundingClientRect();
    const docTop = rect.top + window.scrollY;
    const origin = (el.dataset.rule as RuleEntry['origin']) || 'start';

    const crossEls = Array.from(el.querySelectorAll<HTMLElement>('.rule-x'));
    const crosses: CrossEntry[] = crossEls.map((c) => {
      const cRect = c.getBoundingClientRect();
      const x = cRect.left + cRect.width / 2;
      return { el: c, fraction: fullWidth ? x / fullWidth : 0, on: false, everShown: false };
    });

    return {
      el,
      line,
      origin,
      docTop,
      setScaleX: gsap.quickSetter(line, 'scaleX') as (v: number) => void,
      crosses,
    };
  });
}

// ---------------------------------------------------------------------
// Frames: clockwise scrubbed draw (top -> right -> bottom -> left)
// ---------------------------------------------------------------------
interface FrameEntry {
  el: HTMLElement;
  docTop: number;
  setTop: (v: number) => void;
  setRight: (v: number) => void;
  setBottom: (v: number) => void;
  setLeft: (v: number) => void;
}

function buildFrames(): FrameEntry[] {
  const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-frame]'));
  return frames.map((el) => {
    const rect = el.getBoundingClientRect();
    const top = el.querySelector<HTMLElement>('.fr-t');
    const right = el.querySelector<HTMLElement>('.fr-r');
    const bottom = el.querySelector<HTMLElement>('.fr-b');
    const left = el.querySelector<HTMLElement>('.fr-l');
    const noop = () => {};
    return {
      el,
      docTop: rect.top + window.scrollY,
      setTop: top ? (gsap.quickSetter(top, 'scaleX') as (v: number) => void) : noop,
      setRight: right ? (gsap.quickSetter(right, 'scaleY') as (v: number) => void) : noop,
      setBottom: bottom ? (gsap.quickSetter(bottom, 'scaleX') as (v: number) => void) : noop,
      setLeft: left ? (gsap.quickSetter(left, 'scaleY') as (v: number) => void) : noop,
    };
  });
}

// ---------------------------------------------------------------------
// Master loop
// ---------------------------------------------------------------------
function updateCross(entry: CrossEntry, shouldBeOn: boolean) {
  if (shouldBeOn === entry.on) return;
  entry.on = shouldBeOn;
  if (shouldBeOn) {
    if (!entry.everShown) {
      entry.everShown = true;
      gsap.fromTo(
        entry.el,
        { scale: 0, rotate: 90 },
        { scale: 1, rotate: 0, duration: DUR.crossPop, ease: 'steps(3)' },
      );
    } else {
      gsap.set(entry.el, { scale: 1, rotate: 0 });
    }
  } else {
    gsap.set(entry.el, { scale: 0, rotate: 90 });
  }
}

function initMotionBranch(): () => void {
  const skipIntro = document.documentElement.classList.contains('vt-reveal');
  const verticals = setupVerticals(skipIntro);

  let rules: RuleEntry[] = [];
  let frames: FrameEntry[] = [];
  let activeWindow = { min: -Infinity, max: Infinity };

  const measure = () => {
    const fullWidth = window.innerWidth;
    rules = buildRules(fullWidth);
    frames = buildFrames();
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

  // Rules already in the first viewport draw once on load, 250ms after the
  // verticals begin (§3.4.A); everything below the fold starts collapsed and
  // is driven purely by scroll position from here on.
  window.setTimeout(() => {
    const vh = window.innerHeight;
    rules
      .filter((r) => r.docTop < vh)
      .forEach((r) => {
        gsap.to(r.line, { scaleX: 1, duration: DUR.ruleDraw, ease: 'expo.out' });
        r.crosses.forEach((c) => updateCross(c, true));
      });
  }, DUR.ruleDrawDelay * 1000);

  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  const master = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const scrollY = self.scroll();
      const vh = window.innerHeight;
      activeWindow = { min: scrollY - vh, max: scrollY + vh * 2 };

      // Rules: scrubbed draw, reversible.
      rules.forEach((r) => {
        if (r.docTop < activeWindow.min || r.docTop > activeWindow.max) return;
        const p = clamp01((vh - (r.docTop - scrollY)) / (vh * VIEWPORT_FRACTION));
        r.setScaleX(p);
        r.crosses.forEach((c) => updateCross(c, ruleProgressToScale(r.origin, p, c.fraction)));
      });

      // Frames: clockwise draw in 4 quarter-progress windows.
      frames.forEach((f) => {
        if (f.docTop < activeWindow.min || f.docTop > activeWindow.max) return;
        const fp = clamp01((vh - (f.docTop - scrollY)) / (vh * VIEWPORT_FRACTION));
        f.setTop(clamp01(fp / 0.25));
        f.setRight(clamp01((fp - 0.25) / 0.25));
        f.setBottom(clamp01((fp - 0.5) / 0.25));
        f.setLeft(clamp01((fp - 0.75) / 0.25));
      });
    },
  });

  // Velocity shear runs on GSAP's own ticker rather than inside the master
  // ScrollTrigger's onUpdate: ScrollTrigger only calls onUpdate while an
  // actual scroll is in flight, so a shear driven from there would freeze at
  // its last value the instant the user lifts their finger/wheel — never
  // springing back to 0. Sampling self.getVelocity() every frame instead
  // (still the SAME single master trigger's velocity, just polled
  // continuously) is what lets GSAP's decaying velocity estimate actually
  // reach quickTo and ease the lines back to their gutter positions.
  const shearTick = () => {
    const velocity = master.getVelocity();
    const clampRange = isDesktop() ? 28 : 10;
    verticals.forEach((v) => {
      if (v.registerLocked) return;
      const s = (v.k / 4) * 2 - 1;
      const shear = Math.min(clampRange, Math.max(-clampRange, velocity * 0.012 * s));
      v.quickX(v.baseX + shear);
    });
  };
  gsap.ticker.add(shearTick);

  wireGridFrameRegister(verticals);

  return () => {
    gsap.ticker.remove(shearTick);
    master.kill();
    ScrollTrigger.removeEventListener('refreshInit', measure);
  };
}

function initReducedBranch() {
  // Base CSS already renders everything fully drawn and static. The only
  // thing this branch owns is the 404 signature: its lines carry a static
  // --gf-offset inline style regardless of motion preference (Base.astro/
  // GridFrame.astro render it unconditionally), so under reduced motion we
  // zero it here — "the lines are simply aligned" (§5.5).
  document.querySelectorAll<HTMLElement>('[data-gf-line]').forEach((el) => {
    el.style.setProperty('--gf-offset', '0px');
  });
}

export function initLines() {
  const mm = gsap.matchMedia();
  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conds = context.conditions as { motion: boolean; reduced: boolean };
      if (conds.motion) return initMotionBranch();
      if (conds.reduced) initReducedBranch();
      return undefined;
    },
  );
}
