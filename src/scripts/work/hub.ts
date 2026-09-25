/**
 * CH-02 work hub — WorkHubIndex.astro's client behaviour.
 *
 * 1. INDEX/INFORMATION toggle: two `[data-view-btn]` buttons flip the
 *    `<ol data-work-view>` attribute and each other's `aria-pressed`. Both
 *    row layouts already exist in the DOM (CSS-only display toggle), so
 *    this script only ever changes state, never markup.
 * 2. The 3 R2 preview videos: `preload="none"` until a row's video first
 *    intersects the viewport, at which point `src` is set from
 *    `data-work-row-src`. Playback (muted/loop) starts only when the row is
 *    in view, the INFORMATION view is active, and the viewer has not
 *    requested reduced motion; it pauses the instant any of those stop
 *    being true. Under reduced motion `play()` is never called; the src is
 *    set with a `#t=0.1` media fragment and preload="metadata" instead, so
 *    one still frame is fetched and painted as a static preview.
 */
export function initWorkHub(): void {
  const list = document.querySelector<HTMLElement>('[data-work-view]');
  const toggleBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-view-btn]'));
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-work-row]'));

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setView(view: string) {
    if (!list) return;
    list.dataset.workView = view;
    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.dataset.viewBtn === view ? 'true' : 'false');
    });
    if (view !== 'information') {
      // Compact view hides the previews: stop anything still playing.
      rows.forEach((row) => pause(row));
    } else {
      rows.forEach((row) => {
        if (isRowInView(row)) play(row);
      });
    }
  }

  toggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.viewBtn;
      if (view) setView(view);
    });
  });

  function video(row: HTMLElement): HTMLVideoElement | null {
    return row.querySelector<HTMLVideoElement>('[data-work-row-video]');
  }

  function isRowInView(row: HTMLElement): boolean {
    const rect = row.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }

  function play(row: HTMLElement) {
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

  function pause(row: HTMLElement) {
    const v = video(row);
    if (!v || !v.src) return;
    v.pause();
  }

  if (!rows.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const row = entry.target as HTMLElement;
        if (entry.isIntersecting) play(row);
        else pause(row);
      });
    },
    { threshold: 0.4 },
  );
  rows.forEach((row) => io.observe(row));
}
