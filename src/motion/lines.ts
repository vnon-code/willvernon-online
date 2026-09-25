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
// Velocity shear (§3.4.C): px of x per px/s of scroll velocity, clamped.
const SHEAR_COEFF = 0.018;
const SHEAR_CLAMP_DESKTOP = 40;
const SHEAR_CLAMP_MOBILE = 10;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

// ---------------------------------------------------------------------
// GridFrame verticals: intro draw + velocity shear + 404 re-register
// ---------------------------------------------------------------------
interface VerticalEntry {
  el: HTMLElement;
  k: number;
  /** The GridFrame this line belongs to (fixed or local). */
  frame: Element | null;
  /** Shear sign/weight, -1 (leftmost visible) .. +1 (rightmost visible) in
   * its own frame; 0 when the line is hidden at this breakpoint. Recomputed
   * on every ScrollTrigger refresh. */
  s: number;
  visible: boolean;
  /** Last x target sent to quickX, so an unchanged target costs nothing. */
  last: number;
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
    frame: el.closest('[data-grid-frame]'),
    s: 0,
    visible: true,
    last: NaN,
    // The only resting x is the 404's inline --gf-offset: read it from the
    // inline style instead of parsing every line's computed transform.
    baseX: parseFloat(el.style.getPropertyValue('--gf-offset')) || 0,
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

/** §3.4.C: s runs -1 (leftmost) .. +1 (rightmost) over the lines actually
 * visible at this breakpoint, per frame, so a 2-line phone frame breathes
 * outwards instead of sliding as one. One computed-style read per line, only
 * on refresh. */
function computeShearWeights(entries: VerticalEntry[]) {
  const vis = entries.map((e) => getComputedStyle(e.el).display !== 'none');
  const byFrame = new Map<Element | null, VerticalEntry[]>();
  entries.forEach((e, i) => {
    e.visible = vis[i];
    e.s = 0;
    e.last = NaN;
    if (!e.visible) return;
    const list = byFrame.get(e.frame) || [];
    list.push(e);
    byFrame.set(e.frame, list);
  });
  byFrame.forEach((list) => {
    list.sort((a, b) => a.k - b.k);
    const n = list.length - 1;
    list.forEach((e, i) => {
      e.s = n ? (i / n) * 2 - 1 : 0;
    });
  });
}

/** 404 only: snap the out-of-register verticals back to x:0 on CTA
 * hover/focus. There's no dedicated data-attribute for "the 404 CTA" in the
 * §3.3 API and this file never edits markup, so this is detected purely from
 * data already on the page: GridFrame.astro only ever writes a non-zero
 * --gf-offset inline style when Base.astro is given `gridOffsets` (404
 * only), so any other page is a guaranteed no-op here. */
function wireGridFrameRegister(entries: VerticalEntry[], onUnlock: () => void) {
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
      e.last = NaN;
      e.registerLocked = false;
    });
    onUnlock();
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

/** True for elements inside a position: sticky/fixed ancestor (nav, mobile
 * menu): their document offset is meaningless for the scroll formula, so the
 * intro draws them once and the scroll loop leaves them alone. Structure
 * never changes, so this is read once per element and cached. */
const pinnedCache = new WeakMap<HTMLElement, boolean>();
function isPinned(el: HTMLElement): boolean {
  const cached = pinnedCache.get(el);
  if (cached !== undefined) return cached;
  let pinned = false;
  for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
    const pos = getComputedStyle(n).position;
    if (pos === 'sticky' || pos === 'fixed') {
      pinned = true;
      break;
    }
  }
  pinnedCache.set(el, pinned);
  return pinned;
}

/** Cross x-fractions from the bay math (same calc as .rule-x's `left`),
 * from ONE container measurement instead of a rect read per cross:
 * x_k = trackLeft + k * (bayW + g) - g / 2. */
function crossFractions(fullWidth: number): number[] {
  const track =
    document.querySelector<HTMLElement>('[data-grid-frame]:not(.gf-local) .bay-track') ||
    document.querySelector<HTMLElement>('.rule-x-track');
  if (!track || !fullWidth) return [0, 0, 0, 0, 0];
  const rect = track.getBoundingClientRect();
  const cs = getComputedStyle(track);
  const g = parseFloat(cs.getPropertyValue('--g')) || 0;
  const bays = parseFloat(cs.getPropertyValue('--bays')) || 1;
  const bayW = (rect.width - (bays - 1) * g) / bays;
  return [0, 1, 2, 3, 4].map((k) => (rect.left + k * (bayW + g) - g / 2) / fullWidth);
}

const crossState = new WeakMap<HTMLElement, CrossEntry>();

interface RuleRow extends RuleEntry {
  pinned: boolean;
}

function buildRules(fullWidth: number): RuleRow[] {
  const rules = Array.from(document.querySelectorAll<HTMLElement>('[data-rule]'));
  const fractions = crossFractions(fullWidth);
  // One read pass (no writes interleaved), then build.
  const scrollY = window.scrollY;
  const tops = rules.map((el) => el.getBoundingClientRect().top + scrollY);
  return rules.map((el, i) => {
    const line = el.querySelector<HTMLElement>('.rule-line') || el;
    const origin = (el.dataset.rule as RuleEntry['origin']) || 'start';
    const crosses: CrossEntry[] = Array.from(el.querySelectorAll<HTMLElement>('.rule-x')).map((c) => {
      // Keep on/everShown across re-measures so a resize never re-pops.
      const entry = crossState.get(c) || { el: c, fraction: 0, on: false, everShown: false };
      entry.fraction = fractions[Number(c.dataset.x) || 0] ?? 0;
      crossState.set(c, entry);
      return entry;
    });
    return {
      el,
      line,
      origin,
      docTop: tops[i],
      pinned: isPinned(el),
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
  const scrollY = window.scrollY;
  const tops = frames.map((el) => el.getBoundingClientRect().top + scrollY);
  return frames.map((el, i) => {
    const top = el.querySelector<HTMLElement>('.fr-t');
    const right = el.querySelector<HTMLElement>('.fr-r');
    const bottom = el.querySelector<HTMLElement>('.fr-b');
    const left = el.querySelector<HTMLElement>('.fr-l');
    const noop = () => {};
    return {
      el,
      docTop: tops[i],
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

function popCross(el: HTMLElement) {
  gsap.fromTo(
    el,
    { scale: 0, rotate: 90 },
    { scale: 1, rotate: 0, duration: DUR.crossPop, ease: 'steps(3)', overwrite: true },
  );
}

/** Standalone registration crosses (<Cross pop />): in the first viewport
 * they pop in with the intro rules; below it, when scrolled to. */
function setupStandaloneCrosses(skipIntro: boolean): ScrollTrigger[] {
  const crosses = Array.from(document.querySelectorAll<HTMLElement>('[data-cross-pop]'));
  if (!crosses.length) return [];
  if (skipIntro) {
    gsap.set(crosses, { scale: 1, rotate: 0 });
    return [];
  }
  const vh = window.innerHeight;
  const tops = crosses.map((c) => c.getBoundingClientRect().top);
  const triggers: ScrollTrigger[] = [];
  crosses.forEach((c, i) => {
    if (tops[i] < vh) {
      gsap.delayedCall(DUR.ruleDrawDelay + DUR.ruleDraw * 0.5, () => popCross(c));
      return;
    }
    triggers.push(
      ScrollTrigger.create({ trigger: c, start: 'top 88%', once: true, onEnter: () => popCross(c) }),
    );
  });
  return triggers;
}

function initMotionBranch(): () => void {
  const skipIntro = document.documentElement.classList.contains('vt-reveal');
  const verticals = setupVerticals(skipIntro);
  const crossTriggers = setupStandaloneCrosses(skipIntro);

  let rules: RuleRow[] = [];
  let frames: FrameEntry[] = [];
  // Rules the intro drew (first viewport at load, plus any inside the
  // sticky nav/menu): they stay drawn and the scroll formula never touches
  // them, so the signature line can't retract on the first scroll tick.
  const introDrawn = new WeakSet<HTMLElement>();

  const measure = () => {
    rules = buildRules(window.innerWidth);
    frames = buildFrames();
    computeShearWeights(verticals);
  };

  const update = (scrollY: number) => {
    const vh = window.innerHeight;
    const min = scrollY - vh;
    const max = scrollY + vh * 2;

    // Rules: scrubbed draw, reversible.
    rules.forEach((r) => {
      if (r.pinned || introDrawn.has(r.el)) return;
      if (r.docTop < min || r.docTop > max) return;
      const p = clamp01((vh - (r.docTop - scrollY)) / (vh * VIEWPORT_FRACTION));
      r.setScaleX(p);
      r.crosses.forEach((c) => updateCross(c, ruleProgressToScale(r.origin, p, c.fraction)));
    });

    // Frames: clockwise draw in 4 quarter-progress windows.
    frames.forEach((f) => {
      if (f.docTop < min || f.docTop > max) return;
      const fp = clamp01((vh - (f.docTop - scrollY)) / (vh * VIEWPORT_FRACTION));
      f.setTop(clamp01(fp / 0.25));
      f.setRight(clamp01((fp - 0.25) / 0.25));
      f.setBottom(clamp01((fp - 0.5) / 0.25));
      f.setLeft(clamp01((fp - 0.75) / 0.25));
    });
  };

  measure();

  // Intro (§3.4.A): rules in the viewport the page actually opened at (not
  // necessarily the top: a hash link or restored scroll lands mid-page) and
  // rules in pinned chrome draw once, 250ms after the verticals begin.
  {
    const vh = window.innerHeight;
    const y = window.scrollY;
    const intro = rules.filter((r) => r.pinned || (r.docTop - y >= -1 && r.docTop - y < vh));
    intro.forEach((r) => introDrawn.add(r.el));
    const draw = () =>
      intro.forEach((r) => {
        if (skipIntro) gsap.set(r.line, { scaleX: 1 });
        else gsap.to(r.line, { scaleX: 1, duration: DUR.ruleDraw, ease: 'expo.out' });
        r.crosses.forEach((c) => updateCross(c, true));
      });
    if (skipIntro) draw();
    else gsap.delayedCall(DUR.ruleDrawDelay, draw);
  }

  // Everything else takes its scroll-position state immediately, so a page
  // opened mid-scroll never shows collapsed lines in view.
  update(window.scrollY);

  // Re-measure after (not before) each refresh: by then every module's
  // refreshInit cleanup (e.g. kinetic.ts's block-size unpin) has run and
  // layout reflects the new viewport/fonts.
  const onRefresh = () => {
    measure();
    update(window.scrollY);
  };
  ScrollTrigger.addEventListener('refresh', onRefresh);
  document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

  const isDesktop = window.matchMedia('(min-width: 768px)');

  // Velocity shear runs on GSAP's ticker (ScrollTrigger's onUpdate stops the
  // instant scrolling stops, so a shear driven from there would freeze at
  // its last value instead of springing back). It is only attached while
  // there is something to do: the master onUpdate re-attaches it, and it
  // detaches itself once velocity has decayed and every line has been sent
  // back to rest. quickX is only called when a line's target actually moves.
  let shearActive = false;
  let master: ScrollTrigger;
  const shearTick = () => {
    const velocity = master.getVelocity();
    const clampRange = isDesktop.matches ? SHEAR_CLAMP_DESKTOP : SHEAR_CLAMP_MOBILE;
    let moving = Math.abs(velocity) > 1;
    verticals.forEach((v) => {
      if (v.registerLocked || !v.visible) return;
      const shear = Math.min(clampRange, Math.max(-clampRange, velocity * SHEAR_COEFF * v.s));
      const target = v.baseX + shear;
      if (Number.isNaN(v.last) || Math.abs(target - v.last) > 0.1) {
        v.last = target;
        v.quickX(target);
        moving = true;
      }
    });
    if (!moving) {
      gsap.ticker.remove(shearTick);
      shearActive = false;
    }
  };
  const wakeShear = () => {
    if (shearActive) return;
    shearActive = true;
    gsap.ticker.add(shearTick);
  };

  master = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      update(self.scroll());
      wakeShear();
    },
  });

  wireGridFrameRegister(verticals, wakeShear);

  return () => {
    gsap.ticker.remove(shearTick);
    shearActive = false;
    master.kill();
    crossTriggers.forEach((t) => t.kill());
    ScrollTrigger.removeEventListener('refresh', onRefresh);
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
