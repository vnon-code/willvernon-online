/**
 * The case-study image lightbox (D-brutalist-grid.md §5.7): wires every
 * `[data-lightbox]` trigger (CaseMedia.astro's single images and group
 * cells) to the one shared `<dialog>` Lightbox.astro renders. Native
 * `<dialog>.showModal()` supplies the focus trap and Esc-to-close for free;
 * this only needs to fill the dialog's content, page arrow keys through the
 * triggering element's `data-lightbox-group`, and return focus to the
 * trigger on close (the one thing `<dialog>` doesn't do on its own).
 * Reduced motion needs no branch here — the stepped-wipe entrance lives in
 * Lightbox.astro's CSS, already gated under
 * `(prefers-reduced-motion: no-preference)`; the dialog's own open/close is
 * instant either way.
 */

export function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('#case-lightbox');
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-lightbox]'));
  if (!dialog || !triggers.length) return;

  const media = dialog.querySelector<HTMLElement>('[data-lightbox-media]');
  const caption = dialog.querySelector<HTMLElement>('[data-lightbox-caption]');
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const prevBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-prev]');
  const nextBtn = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  if (!media || !closeBtn || !prevBtn || !nextBtn) return;

  const groups = new Map<string, HTMLButtonElement[]>();
  triggers.forEach((t) => {
    const key = t.dataset.lightboxGroup ?? '';
    const list = groups.get(key) ?? [];
    list.push(t);
    groups.set(key, list);
  });

  let lastFocused: HTMLElement | null = null;
  let activeGroup: HTMLButtonElement[] = [];
  let activeIndex = 0;

  function render() {
    const t = activeGroup[activeIndex];
    if (!t || !media || !caption) return;
    const src = t.dataset.lightboxSrc ?? '';
    const alt = t.dataset.lightboxAlt ?? '';
    const isVideo = /\.(mp4|webm)$/i.test(src);
    media.replaceChildren();
    if (isVideo) {
      const v = document.createElement('video');
      v.src = src;
      v.controls = true;
      v.autoplay = true;
      v.loop = true;
      v.playsInline = true;
      media.append(v);
    } else {
      const img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      media.append(img);
    }
    caption.textContent = alt;
    dialog?.toggleAttribute('data-single', activeGroup.length <= 1);
  }

  function open(trigger: HTMLButtonElement) {
    const key = trigger.dataset.lightboxGroup ?? '';
    activeGroup = groups.get(key) ?? [trigger];
    activeIndex = Math.max(0, activeGroup.indexOf(trigger));
    lastFocused = trigger;
    render();
    if (!dialog!.open) dialog!.showModal();
    closeBtn?.focus();
  }

  function step(delta: number) {
    if (activeGroup.length < 2) return;
    activeIndex = (activeIndex + delta + activeGroup.length) % activeGroup.length;
    render();
  }

  triggers.forEach((t) => t.addEventListener('click', () => open(t)));
  closeBtn.addEventListener('click', () => dialog!.close());
  prevBtn.addEventListener('click', () => step(-1));
  nextBtn.addEventListener('click', () => step(1));

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      step(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      step(1);
    }
  });

  dialog.addEventListener('close', () => {
    media.replaceChildren();
    lastFocused?.focus();
  });

  // Backdrop click closes (clicking the dialog element itself outside
  // .lightbox-inner, since the inner content stops propagation via its own
  // bounds — dialog::backdrop clicks land on the dialog element itself).
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });
}
