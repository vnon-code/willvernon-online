/**
 * Ease + duration constants mirroring the CSS motion tokens in
 * src/styles/tokens.css (--ease-*, --dur-*, --stagger). Keep these two
 * sources numerically identical — CSS drives the view-transition keyframes
 * and the reduced-motion/no-JS defaults, these drive GSAP tweens.
 *
 * Phase 2b (D-brutalist-grid.md §4.1): CustomEase and ScrambleTextPlugin are
 * dropped. Built-in GSAP eases (expo/power*) plus the "steps(n)" ease string
 * (part of gsap-core's EasePack, no plugin registration needed) cover the
 * whole language.
 */

export const EASE_OUT = 'expo.out'; // --ease-out: draws, reveals, entrances
export const EASE_MOVE = 'power4.inOut'; // --ease-move: menu sheet, Flip
export const EASE_SPRING = 'power3.out'; // --ease-spring: shear return, pointer-follow (quickTo)
export const EASE_CUT = 'steps(1)'; // --ease-cut: hard state swaps (crosses on, current nav, tab switch)
export const EASE_STEP = 'steps(4)'; // --ease-step: "raw" stepped wipes (hover fill, page transition, menu open)
export const EASE_STEP2 = 'steps(2)'; // hot-line hover-in (§3.4.D)
export const EASE_STEP3 = 'steps(3)'; // cross pop-in, split-chars settle (§3.4.A, §4.3)

export const DUR = {
  tap: 0.1, // --dur-tap
  hover: 0.18, // --dur-hover
  reveal: 0.7, // --dur-reveal
  draw: 0.9, // --dur-draw: intro vertical draw
  ruleDraw: 0.7, // intro rule draw (§3.4.A)
  ruleDrawDelay: 0.25, // rules begin 250ms after verticals (§3.4.A)
  crossPop: 0.24, // cross pop-in (§3.4.A)
  page: 0.36, // --dur-page
  hotIn: 0.12, // hot-line hover-in (§3.4.D)
  hotOut: 0.24, // hot-line hover-out (§3.4.D)
} as const;

export const STAGGER = {
  default: 0.06, // --stagger
  vertical: 0.07, // GridFrame verticals, left to right (§3.4.A)
  splitLine: 0.045,
  splitChar: 0.02,
} as const;
