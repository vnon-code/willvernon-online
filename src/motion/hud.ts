/**
 * Telemetry readouts, all real state, none decorative:
 *   data-hud="scroll"  — scroll position as 000–100
 *   data-hud="clock"   — HH:MM:SS, local time
 *   data-hud="xy"      — cursor X/Y, 4-digit each
 *   data-hud="bpm"     — armed-track BPM, "---" when unarmed
 *
 * Updates are throttled to <=10fps (100ms) always. When a track is armed via
 * 'vnon:bpm', the tick locks to 60000/bpm (graft C2) instead. tabular-nums
 * is a CSS concern (motion.css).
 *
 * Reduced-motion branch: readouts are information, not decoration, so they
 * keep updating live under prefers-reduced-motion — there is no digit-roll
 * tween to skip, the swap is already instant. The branch still runs through
 * gsap.matchMedia() (both conditions call the same instant-swap ticker) so
 * the decision is explicit and auditable rather than assumed. The one
 * actual behaviour difference gated here: the cursor XY readout only wires
 * up its pointermove listener on (pointer: fine).
 */
import { gsap } from './gsap';
import { getBpm, initBpmListener, bpmIntervalMs } from './bpm';

const MIN_TICK_MS = 100; // 10fps ceiling

function pad(n: number, len = 2) {
  return String(Math.floor(n)).padStart(len, '0');
}

function formatClock(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatCoord(n: number) {
  const clamped = Math.max(0, Math.min(9999, Math.round(n)));
  return pad(clamped, 4);
}

export function initHud() {
  initBpmListener();

  const scrollEls = document.querySelectorAll<HTMLElement>('[data-hud="scroll"]');
  const clockEls = document.querySelectorAll<HTMLElement>('[data-hud="clock"]');
  const xyEls = document.querySelectorAll<HTMLElement>('[data-hud="xy"]');
  const bpmEls = document.querySelectorAll<HTMLElement>('[data-hud="bpm"]');

  if (!scrollEls.length && !clockEls.length && !xyEls.length && !bpmEls.length) return;

  let pointer = { x: 0, y: 0 };
  if (xyEls.length) {
    const mm = gsap.matchMedia();
    mm.add('(pointer: fine)', () => {
      const onMove = (e: PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY };
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    });
  }

  bpmEls.forEach((el) => {
    el.textContent = '---';
    el.hidden = true; // no BPM segment until a track is armed
  });

  const updateBpm = (bpm: number | null) => {
    bpmEls.forEach((el) => {
      el.textContent = bpm ? String(Math.round(bpm)) : '---';
      el.hidden = !bpm;
    });
  };

  let lastTick = 0;
  let raf = 0;

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    const intervalMs = Math.max(MIN_TICK_MS, bpmIntervalMs(MIN_TICK_MS, MIN_TICK_MS, 1000));
    if (now - lastTick < intervalMs) return;
    lastTick = now;

    if (scrollEls.length) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      const text = pad(pct, 3);
      scrollEls.forEach((el) => {
        if (el.textContent !== text) el.textContent = text;
      });
    }

    if (clockEls.length) {
      const text = formatClock(new Date());
      clockEls.forEach((el) => {
        if (el.textContent !== text) el.textContent = text;
      });
    }

    if (xyEls.length) {
      const text = `${formatCoord(pointer.x)},${formatCoord(pointer.y)}`;
      xyEls.forEach((el) => {
        if (el.textContent !== text) el.textContent = text;
      });
    }

    updateBpm(getBpm());
  }

  // Explicit reduced-motion branch (see file header): both conditions start
  // the same instant-swap ticker, since there is no tween to strip out.
  const tickerMm = gsap.matchMedia();
  tickerMm.add(
    { motion: '(prefers-reduced-motion: no-preference)', reduced: '(prefers-reduced-motion: reduce)' },
    () => {
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    },
  );

  // No cleanup path beyond the matchMedia revert above: HUD readouts run
  // for the page's lifetime and are cheap (one rAF, throttled writes only).
  // Astro's static-file MPA navigates away the whole document on page
  // change, which tears this down naturally.
  window.addEventListener('pagehide', () => cancelAnimationFrame(raf));
  // Back/forward-cache restore: pagehide stopped the loop, so restart it.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  });
}
