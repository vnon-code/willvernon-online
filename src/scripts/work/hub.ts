/**
 * CH-02 work hub — WorkHubIndex.astro's client behaviour.
 *
 * 1. INDEX/INFORMATION toggle: two `[data-view-btn]` buttons flip the
 *    `<ol data-work-view>` attribute and each other's `aria-pressed`. Both
 *    row layouts already exist in the DOM (CSS-only display toggle), so
 *    this script only ever changes state, never markup. The switch itself
 *    animates with GSAP Flip (D-brutalist-grid.md §4.4/§5.4), skipped
 *    entirely under prefers-reduced-motion (the attribute just flips).
 * 2. Title wdth hover (§5.7): each row's mega title widens on hover via
 *    gsap.quickTo on the CSS custom property --rwdth (fine pointer, no
 *    reduced motion, ≥1024 only — the size that carries the mega scale).
 * 3. Row media, split by pointer/viewport:
 *    - ≥1024 with a fine, hover-capable pointer: a hover preview locked to
 *      bay 4 (WorkHubIndex.astro's CSS), the same language as home's
 *      FeaturedWorkIndex. Only a mouse triggers it (never touch, never
 *      keyboard focus), after a short intent delay so sweeping the cursor
 *      down the list fetches nothing. `src` is set on intent and removed
 *      again on leave, aborting an in-flight download. Under reduced
 *      motion the clip never loads or plays — hover just reveals the
 *      static `poster` the markup already carries.
 *    - Below that (or any coarse/no-hover pointer): the media shows inline
 *      at 16:10. When a row is at least 40% in view, playback starts
 *      (muted/loop) and pauses the instant it leaves, or the toggle
 *      switches to INDEX. Under reduced motion the src gets a `#t=0.1`
 *      media fragment with preload="metadata" instead of ever playing, so
 *      one real still frame is fetched and painted.
 */
import { gsap, loadFlip } from '../../motion/gsap';
import { DUR, EASE_SPRING } from '../../motion/eases';

const INTENT_MS = 150;

export function initWorkHub(): void {
  const list = document.querySelector<HTMLElement>('[data-work-view]');
  const toggleBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view-btn]'));
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-work-row]'));
  if (!rows.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  // ---------- INDEX / INFORMATION toggle ----------
  async function setView(view: string) {
    if (!list) return;
    if (list.dataset.workView === view) return;

    const doFlip = !reduceMq.matches;
    const Flip = doFlip ? await loadFlip().catch(() => null) : null;
    const state = Flip ? Flip.getState(rows) : null;

    list.dataset.workView = view;
    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.viewBtn === view ? 'true' : 'false');
    });

    if (Flip && state) {
      Flip.from(state, { duration: 0.5, ease: 'power4.inOut' });
    }

    if (view !== 'information') {
      // Compact view hides every preview: stop anything still playing.
      rows.forEach((row) => {
        pauseInline(row);
        stopHoverPreview(row);
      });
    } else {
      rows.forEach((row) => {
        if (!fineMq.matches && isRowInView(row)) playInline(row);
      });
    }
  }

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.viewBtn;
      if (view) void setView(view);
    });
  });

  function video(row: HTMLElement): HTMLVideoElement | null {
    return row.querySelector<HTMLVideoElement>('[data-work-row-video]');
  }

  // ---------- Title wdth hover (§5.7) ----------
  if (fineMq.matches && !reduceMq.matches) {
    rows.forEach((row) => {
      const title = row.querySelector<HTMLElement>('.work-row-title');
      if (!title) return;
      const setWdth = gsap.quickTo(title, '--rwdth', { duration: DUR.hover, ease: EASE_SPRING });
      row.addEventListener('pointerenter', (e) => {
        if (e.pointerType !== 'mouse') return;
        setWdth(125);
      });
      row.addEventListener('pointerleave', (e) => {
        if (e.pointerType !== 'mouse') return;
        setWdth(100);
      });
    });
  }

  // ---------- Bay-4 hover preview (≥1024, fine pointer) ----------
  const hoverTimers = new WeakMap<HTMLElement, number>();

  function stopHoverPreview(row: HTMLElement) {
    const timer = hoverTimers.get(row);
    if (timer) window.clearTimeout(timer);
    row.classList.remove('is-playing');
    const v = video(row);
    if (!v || !fineMq.matches || !v.getAttribute('src')) return;
    v.pause();
    v.removeAttribute('src');
    v.load();
  }

  rows.forEach((row) => {
    const v = video(row);
    const src = row.dataset.workRowSrc;
    if (!v || !src) return;

    v.addEventListener('playing', () => {
      if (fineMq.matches) row.classList.add('is-playing');
    });

    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !fineMq.matches) return;
      if (list?.dataset.workView !== 'information') return;
      if (reduceMq.matches) {
        // Reveal instantly; never fetch or play the clip, only the poster
        // the markup already carries.
        row.classList.add('is-playing');
        return;
      }
      const timer = window.setTimeout(() => {
        v.src = src;
        void v.play().catch(() => {});
      }, INTENT_MS);
      hoverTimers.set(row, timer);
    });
    row.addEventListener('pointerleave', () => stopHoverPreview(row));
  });

  // ---------- Inline scroll playback (<1024 / no fine hover) ----------
  function isRowInView(row: HTMLElement): boolean {
    const rect = row.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function playInline(row: HTMLElement) {
    const v = video(row);
    const src = row.dataset.workRowSrc;
    if (!v || !src) return;
    if (reduceMq.matches) {
      // Static still: fetch just enough to paint one frame, never play.
      if (!v.src) {
        v.preload = 'metadata';
        v.src = `${src}#t=0.1`;
      }
      return;
    }
    if (!v.src || v.src.includes('#t=')) v.src = src;
    if (list?.dataset.workView !== 'information') return;
    void v.play().catch(() => {});
  }

  function pauseInline(row: HTMLElement) {
    const v = video(row);
    if (!v || !v.src) return;
    v.pause();
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const row = entry.target as HTMLElement;
        if (fineMq.matches) return; // ≥1024 fine pointer: hover owns playback, not scroll.
        if (entry.isIntersecting) {
          playInline(row);
          row.classList.add('is-revealed');
        } else {
          pauseInline(row);
        }
      });
    },
    { threshold: 0.4 },
  );
  rows.forEach((row) => io.observe(row));

  if (reduceMq.matches) {
    // Fully drawn, no wipe: every inline row's media is revealed
    // immediately (the hover preview above never plays either).
    rows.forEach((row) => row.classList.add('is-revealed'));
  }
}
