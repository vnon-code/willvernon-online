/**
 * Registers every GSAP plugin used by the motion runtime, exactly once.
 * ScrollTrigger and SplitText are free as of GSAP 3.13+; Flip is loaded
 * lazily (in-page reflow only: work filters, the Phase 4 lightbox).
 *
 * Import `gsap` from this module everywhere else in src/motion so plugin
 * registration always runs first.
 *
 * Phase 2b (D-brutalist-grid.md §4.1, §6): CustomEase and ScrambleTextPlugin
 * are dropped — built-in eases and steps() cover the language, and
 * ScrollSmoother is dropped — native scroll keeps the velocity honest and
 * input latency at zero (§3.5.9). Neither is registered or exported here.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText };

/** Flip is loaded on demand, only by pages that use it, so it stays out of
 * the shared motion bundle. */
export async function loadFlip() {
  const { Flip } = await import('gsap/Flip');
  gsap.registerPlugin(Flip);
  return Flip;
}
