/* Native share destinations are prepared locally. Nothing is sent without a click. */
(() => {
  'use strict';
  const share = document.querySelector('[data-article-share]');
  if (!share) return;
  const pageURL = new URL(location.href);
  pageURL.hash = '';
  const url = pageURL.href;
  const title = document.querySelector('h1').textContent.trim();
  const destinations = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`
  };
  share.querySelectorAll('[data-share-link]').forEach(link => {
    if (destinations[link.dataset.shareLink]) link.href = destinations[link.dataset.shareLink];
  });
  const button = share.querySelector('[data-copy-link]');
  const label = button.querySelector('[data-copy-label]');
  const status = share.querySelector('[data-copy-status]');
  const fallback = share.querySelector('[data-copy-fallback]');
  const input = fallback.querySelector('input');
  input.value = url;
  button.addEventListener('click', async () => {
    status.textContent = '';
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      fallback.hidden = true;
      label.textContent = button.dataset.copiedLabel;
      status.textContent = button.dataset.copiedLabel;
    } catch {
      label.textContent = button.dataset.copyLabel;
      fallback.hidden = false;
      status.textContent = button.dataset.copyError;
      input.focus({ preventScroll: true });
      input.select();
    }
  });
  button.hidden = false;
})();
