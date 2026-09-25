/**
 * CustomEase family + duration constants mirroring the CSS motion tokens
 * defined in src/styles/tokens.css (--ease-*, --dur-*). Keep these two
 * sources numerically identical — CSS drives view-transition keyframes,
 * these drive GSAP tweens.
 */
import { CustomEase } from './gsap';

export const EASE_OUT = CustomEase.create('consoleOut', '0.16, 1, 0.3, 1');
export const EASE_INOUT = CustomEase.create('consoleInOut', '0.65, 0, 0.35, 1');
export const EASE_SNAP = CustomEase.create('snap', '0.2, 0.8, 0.2, 1');

export const DUR = {
  instant: 0.12,
  fast: 0.22,
  base: 0.4,
  slow: 0.7,
  scene: 1.2,
} as const;

export const STAGGER = {
  splitLine: 0.045,
  indexRow: 0.06,
  hudDigit: 0.02,
};
