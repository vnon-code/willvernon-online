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
 */
import './gsap';
import { initReveal } from './reveal';
import { initScramble } from './scramble';
import { initHud } from './hud';
import { initRuler } from './ruler';
import { initCursor } from './cursor';
import { initTransitions } from './transition';
import { initSmoother } from './smoother';
import { initBpmListener } from './bpm';

let initialized = false;

export function initMotion() {
  if (initialized) return;
  initialized = true;

  initBpmListener();
  initReveal();
  initScramble();
  initHud();
  initRuler();
  initCursor();
  initTransitions();
  void initSmoother(); // no-op unless a page opts in with #smooth-wrapper/#smooth-content
}

export { setViewTransitionName } from './transition';
export { onBpmChange, getBpm } from './bpm';
