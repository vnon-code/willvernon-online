/**
 * Home contact — Discord handle copy-to-clipboard, and a light progressive
 * enhancement over the Formspree form: intercepted only to show an inline
 * status instead of a full-page navigation. The <form action method> stays
 * real, so a POST still works with JS off, and on fetch failure the script
 * falls back to a native form submit (Formspree's own response page).
 */
export function initContactForm(): void {
  const discordBtn = document.querySelector<HTMLButtonElement>('[data-discord-copy]');
  const tooltip = document.querySelector<HTMLElement>('[data-discord-tooltip]');

  if (discordBtn && tooltip) {
    discordBtn.addEventListener('click', (e) => {
      // A <button type="button">: nothing to cancel, kept defensive.
      e.preventDefault();
      const handle = discordBtn.dataset.discordHandle;
      if (!handle || !navigator.clipboard) return;
      navigator.clipboard
        .writeText(handle)
        .then(() => {
          // The live region starts empty and is filled only on success, so
          // screen readers announce the confirmation (and never read a
          // stale "Copied!" while browsing).
          tooltip.textContent = tooltip.dataset.copied ?? '';
          tooltip.setAttribute('data-visible', '');
          window.setTimeout(() => {
            tooltip.removeAttribute('data-visible');
            tooltip.textContent = '';
          }, 1600);
        })
        .catch(() => {});
    });
  }

  const form = document.querySelector<HTMLFormElement>('#contact-form');
  const status = document.querySelector<HTMLElement>('[data-form-status]');
  if (!form || !status) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    submitBtn?.setAttribute('disabled', '');

    fetch(form.action, {
      method: form.method || 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then((res) => {
        if (res.ok) {
          status.textContent = "Message sent — thanks, I'll get back to you soon.";
          status.setAttribute('data-tone', 'ok');
          form.reset();
        } else {
          throw new Error('Formspree responded with an error');
        }
      })
      .then(() => {
        status.hidden = false;
        submitBtn?.removeAttribute('disabled');
      })
      .catch(() => {
        // Fall back to the native POST (HTMLFormElement.submit() does not
        // re-fire this submit handler).
        form.submit();
      });
  });
}
