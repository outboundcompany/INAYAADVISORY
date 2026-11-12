/* Inaya Advisory design system behaviour (12 Nov 2026).
   [data-reveal]: the homepage's blur-up rise as elements enter the viewport. Children of [data-stagger]
   come in one after another. Content is never left hidden: html.ia-done (set after 2.5s by the head script,
   or at once without IntersectionObserver or with reduced motion) shows everything. */
(function () {
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(d.querySelectorAll('[data-stagger]'), function (row) {
    [].forEach.call(row.children, function (c, i) {
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', '');
      c.style.setProperty('--d', ((i % 4) * 0.09) + 's');
    });
  });
  var els = [].slice.call(d.querySelectorAll('.ia [data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)) {
    root.classList.add('ia-done');
    els.forEach(function (el) { el.classList.add('is-revealed'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-revealed'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
  root.classList.add('ia-ready');
  window.addEventListener('load', function () {
    els.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-revealed'); });
  });
})();
