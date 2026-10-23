/* Editorial categories filter static articles; all content remains available without JS. */
(() => {
  'use strict';
  const filters = document.querySelector('[data-blog-filters]');
  const posts = [...document.querySelectorAll('[data-blog-post]')];
  const count = document.querySelector('[data-blog-count]');
  const featuredSection = document.querySelector('[data-blog-featured]');
  const archiveSection = document.querySelector('[data-blog-archive]');
  const grid = document.querySelector('[data-blog-grid]');
  const empty = document.querySelector('[data-blog-empty]');
  if (!filters || !posts.length) return;
  const buttons = [...filters.querySelectorAll('[data-blog-filter]')];
  const valid = category => buttons.some(button => button.dataset.blogFilter === category);
  function currentCategory() {
    try {
      const slug = decodeURIComponent(location.hash.slice(1));
      return valid(slug) ? slug : 'todos';
    } catch { return 'todos'; }
  }
  function filter(category, announce = true) {
    if (!valid(category)) category = 'todos';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.blogFilter === category)));
    posts.forEach(post => { post.hidden = category !== 'todos' && post.dataset.category !== category; });
    featuredSection.hidden = !featuredSection.querySelector('[data-blog-post]:not([hidden])');
    archiveSection.hidden = !archiveSection.querySelector('[data-blog-post]:not([hidden])');
    grid.dataset.visible = grid.querySelectorAll('[data-blog-post]:not([hidden])').length;
    empty.hidden = posts.some(post => !post.hidden);
    if (announce) {
      const total = posts.filter(post => !post.hidden).length;
      count.textContent = `${total} ${total === 1 ? 'artigo nesta seleção.' : 'artigos nesta seleção.'}`;
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.blogFilter;
    if (location.hash !== `#${category}`) history.pushState(null, '', `#${category}`);
    filter(category);
  }));
  filter(currentCategory());
  filters.hidden = false;
  window.addEventListener('hashchange', () => filter(currentCategory()));
  window.addEventListener('popstate', () => filter(currentCategory()));
})();
