/**
 * initMotion() — the single entry point Base.astro calls at the end of
 * <body>: `import { initMotion } from '../motion/index.ts'; initMotion();`
 *
 * Idempotent: safe to call more than once (guarded by a module flag), so a
 * page that imports it twice, or a hot-reload in dev, never double-wires
 * listeners or duplicates ScrollTriggers.
 *
 * Every subsystem gates its own animated behaviour through
 * gsap.matchMedia() with an explicit (prefers-reduced-motion: reduce)
 * branch — see each module's file header for what that branch does.
 *
 * D-brutalist-grid.md (Phase 2b, builder B): the Signal Console modules
 * (scramble/hud/bpm/cursor/ruler) and ScrollSmoother are retired (§3.5.9,
 * §6) and replaced by the grid-line/kinetic/hover/rail system below.
 * lines.ts/kinetic.ts run synchronously (they own the LCP hero/H1 and the
 * always-present GridFrame lines); hover.ts/rail.ts only matter once the
 * visitor moves a pointer or scrolls into unbuilt Phase 4 territory, so
 * they're deferred to an idle callback — nothing on the critical render
 * path waits on them.
 */
import './gsap';
import { initReveal } from './reveal';
import { initTransitions } from './transition';
import { initLines } from './lines';
import { initKinetic } from './kinetic';
import { initHover } from './hover';
import { initRail } from './rail';

let initialized = false;

function whenIdle(fn: () => void) {
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void })
    .requestIdleCallback;
  if (typeof ric === 'function') ric(fn, { timeout: 500 });
  else window.setTimeout(fn, 200);
}

export function initMotion() {
  if (initialized) return;
  initialized = true;

  initReveal();
  initTransitions();
  initLines();
  initKinetic();
  whenIdle(initHover);
  whenIdle(initRail);
}

export { setViewTransitionName } from './transition';
