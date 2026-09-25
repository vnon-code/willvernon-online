/**
 * Featured Work — row media.
 *
 * ≥1024 with a fine, hover-capable pointer: a hover preview locked to B4.
 * Only a mouse triggers it (never touch, never keyboard focus), after a
 * short intent delay so sweeping the cursor across the list fetches
 * nothing. The source videos are full-resolution R2 files, so on leave the
 * src is removed and the element reloaded, which aborts the in-flight
 * download. The preview only wipes in once a frame is actually playing.
 *
 * Below that (or on touch): the media shows inline at 16:10. When a row is
 * at least half in view, the video gets its src with a `#t=0.1` media
 * fragment and preload="metadata", so a real still appears; it then plays
 * muted while in view and pauses when it leaves (the still stays). Under
 * prefers-reduced-motion only the still is loaded, never played.
 */
const INTENT_MS = 150;

export function initFeaturedWork(): void {
  const rows = document.querySelectorAll<HTMLElement>('[data-fw-row]');
  if (!rows.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  const inline = new Map<Element, { video: HTMLVideoElement; src: string }>();

  rows.forEach((row) => {
    const video = row.querySelector<HTMLVideoElement>('[data-fw-video]');
    const src = row.dataset.fwSrc;
    if (!video || !src) return;
    let timer = 0;
    inline.set(row, { video, src });

    video.addEventListener('playing', () => {
      if (fineMq.matches) row.classList.add('is-playing');
    });

    const stop = () => {
      window.clearTimeout(timer);
      row.classList.remove('is-playing');
      if (!fineMq.matches || !video.getAttribute('src')) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || reduceMq.matches || !fineMq.matches) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        video.src = src;
        void video.play().catch(() => {});
      }, INTENT_MS);
    });
    row.addEventListener('pointerleave', stop);
  });

  if (!('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (fineMq.matches) return;
      entries.forEach((entry) => {
        const item = inline.get(entry.target);
        if (!item) return;
        const { video, src } = item;
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) {
            video.preload = 'metadata';
            video.src = `${src}#t=0.1`;
          }
          if (!reduceMq.matches) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.5 },
  );
  inline.forEach((_, row) => io.observe(row));
}
