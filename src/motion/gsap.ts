/**
 * Registers every GSAP plugin used by the motion runtime, exactly once.
 * All plugins used here (ScrollTrigger, SplitText, ScrambleTextPlugin,
 * CustomEase; Flip/ScrollSmoother lazily via loadFlip/loadScrollSmoother) are free as of GSAP 3.13+.
 *
 * Import `gsap` from this module everywhere else in src/motion and
 * src/webgl so plugin registration always runs first.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';

let registered = false;

export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase };

/** Flip and ScrollSmoother are loaded on demand, only by pages that use them,
 * so they stay out of the shared motion bundle. */
export async function loadFlip() {
  const { Flip } = await import('gsap/Flip');
  gsap.registerPlugin(Flip);
  return Flip;
}

export async function loadScrollSmoother() {
  const { ScrollSmoother } = await import('gsap/ScrollSmoother');
  gsap.registerPlugin(ScrollSmoother);
  return ScrollSmoother;
}
