/* Plain fragment links are the fallback. JS selects a single static article. */
(() => {
  'use strict';
  if (location.hash === '#contratos') {
    location.replace('virada-de-bandeira.html');
    return;
  }
  const root = document.querySelector('[data-areas]');
  if (!root) return;
  const links = [...root.querySelectorAll('[data-area-link]')];
  const panels = [...root.querySelectorAll('[data-area-panel]')];
  const picker = root.querySelector('#area-select');
  const defaultSlug = panels[0].id;
  const slugFromHash = () => {
    try { return decodeURIComponent(location.hash.slice(1)); }
    catch { return ''; }
  };
  const validSlug = slug => panels.some(panel => panel.id === slug);

  function select(slug) {
    if (!validSlug(slug)) slug = defaultSlug;
    // History navigation must never leave keyboard focus inside a hidden panel.
    const panelWithFocus = document.activeElement?.closest('[data-area-panel]');
    if (panelWithFocus && panelWithFocus.id !== slug) {
      const focusTarget = getComputedStyle(picker.parentElement).display !== 'none'
        ? picker : links.find(link => link.hash === `#${slug}`);
      focusTarget.focus({ preventScroll: true });
    }
    panels.forEach(panel => { panel.hidden = panel.id !== slug; });
    links.forEach(link => {
      if (link.hash === `#${slug}`) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    picker.value = slug;
  }

  function navigate(slug) {
    if (!validSlug(slug)) return;
    if (location.hash !== `#${slug}`) history.pushState(null, '', `#${slug}`);
    select(slug);
  }

  root.classList.add('areas-enhanced');
  select(slugFromHash());
  links.forEach((link, index) => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      navigate(link.hash.slice(1));
    });
    link.addEventListener('keydown', event => {
      const indices = {
        ArrowDown: (index + 1) % links.length,
        ArrowRight: (index + 1) % links.length,
        ArrowUp: (index - 1 + links.length) % links.length,
        ArrowLeft: (index - 1 + links.length) % links.length,
        Home: 0,
        End: links.length - 1
      };
      if (!(event.key in indices)) return;
      event.preventDefault();
      const next = links[indices[event.key]];
      next.focus({ preventScroll: true });
      navigate(next.hash.slice(1));
    });
  });
  picker.addEventListener('change', () => navigate(picker.value));
  window.addEventListener('hashchange', () => select(slugFromHash()));
  window.addEventListener('popstate', () => select(slugFromHash()));
})();
