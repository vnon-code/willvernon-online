/**
 * Shared BPM-lock state (graft C2, PLAN.md/JUDGEMENT.md).
 *
 * Any page can arm a track by dispatching:
 *   window.dispatchEvent(new CustomEvent('vnon:bpm', { detail: { bpm: 174 } }))
 * and disarm with { bpm: null }. hud.ts and scramble.ts both read this to
 * lock their tick / glyph interval to 60000 / bpm.
 */

export type BpmDetail = { bpm: number | null };

let currentBpm: number | null = null;
let listenerAttached = false;
const subscribers = new Set<(bpm: number | null) => void>();

export function initBpmListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  window.addEventListener('vnon:bpm', (event) => {
    const detail = (event as CustomEvent<BpmDetail>).detail;
    currentBpm = typeof detail?.bpm === 'number' && detail.bpm > 0 ? detail.bpm : null;
    subscribers.forEach((fn) => fn(currentBpm));
  });
}

export function getBpm(): number | null {
  return currentBpm;
}

export function onBpmChange(fn: (bpm: number | null) => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** 60000 / bpm when armed, else the given default, clamped to a sane range. */
export function bpmIntervalMs(defaultMs: number, min = 60, max = 2000): number {
  if (!currentBpm) return defaultMs;
  const ms = 60000 / currentBpm;
  return Math.min(max, Math.max(min, ms));
}
