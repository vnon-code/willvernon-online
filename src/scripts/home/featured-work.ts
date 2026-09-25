/**
 * Featured Work — hover preview for the numbered project index.
 *
 * Only a fine, hover-capable pointer triggers it (never touch, never keyboard
 * focus), and only after a short intent delay so sweeping the cursor across
 * the list fetches nothing. The source videos are full-resolution R2 files,
 * so on leave the src is removed and the element reloaded, which aborts the
 * in-flight download instead of letting it buffer on. The row only shows
 * the preview box once a frame is actually playing. Under
 * prefers-reduced-motion nothing is fetched or played.
 */
const INTENT_MS = 150;

export function initFeaturedWork(): void {
  const rows = document.querySelectorAll<HTMLElement>('[data-fw-row]');
  if (!rows.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)');

  rows.forEach((row) => {
    const video = row.querySelector<HTMLVideoElement>('[data-fw-video]');
    const src = row.dataset.fwSrc;
    if (!video || !src) return;
    let timer = 0;

    video.addEventListener('playing', () => row.classList.add('is-playing'));

    const stop = () => {
      window.clearTimeout(timer);
      row.classList.remove('is-playing');
      if (!video.getAttribute('src')) return;
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
}
