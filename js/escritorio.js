/* Accessible, native horizontal testimonial rail: buttons, keyboard and touch. */
(() => {
 'use strict';
 const viewport = document.querySelector('[data-testimonial-viewport]');
 if (!viewport) return;
 const cards = [...viewport.querySelectorAll('[data-testimonial-card]')];
 const previous = document.querySelector('[data-testimonial-previous]');
 const next = document.querySelector('[data-testimonial-next]');
 const position = document.querySelector('[data-testimonial-position]');
 const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
 let current = 0;
 function update() {
  const first = cards[0].offsetLeft;
  current = cards.reduce((best, card, index) => Math.abs(card.offsetLeft - first - viewport.scrollLeft) < Math.abs(cards[best].offsetLeft - first - viewport.scrollLeft) ? index : best, 0);
  const atEnd = viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 2;
  previous.disabled = viewport.scrollLeft < 2;
  next.disabled = atEnd;
  position.textContent = `${current + 1} / ${cards.length}`;
 }
 function go(index) {
  const target = cards[Math.max(0, Math.min(cards.length - 1, index))];
  viewport.scrollTo({ left: target.offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth' });
 }
 previous.addEventListener('click', () => go(current - 1));
 next.addEventListener('click', () => go(current + 1));
 viewport.addEventListener('scroll', update, { passive: true });
 viewport.addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  go(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
 });
 new ResizeObserver(update).observe(viewport);
 update();
})();
