/* Inaya Advisory: scroll motion, modelled on blackstone.com's theme animations (1 Nov 2026).
   Adds .is-in to elements as they enter the viewport. Hidden start states live in components.css and only apply
   while html.rv-js is set (added by a tiny script in the head). Pages that use the homepage's own [data-reveal]
   system are left alone. Reduced motion: everything is shown at once. */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains('rv-js')) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.querySelector('[data-reveal]') || reduce || !('IntersectionObserver' in window)) {
    root.classList.add('rv-done');
    return;
  }

  // what animates, by default (the same list as components.css)
  var FADE = [
    '.crumbs', '.pg-lede', '.pg-meta', '.eyebrow-rule', '.statement', '.sec-intro', '.blk-head > :not(.statement):not(.eyebrow-rule)',
    '.split-body > *', '.item', '.acc-row', '.story-card', '.person-card', '.quote', '.stat',
    '.tp-grid', '.legal-body section', '.smap-group', '.disclose', '.stat-src', '.offset-row',
    '.cta-band .wrap > *', '.profile-hero > :last-child > *', '.profile-body > *',
    '.ni-head > *', '.ni-sec-head', '.ni-card', '.ni-feat', '.art-head > *', '.art-body > *', '.ni-band-txt > *',
    '.ed-hero .wrap > *', '.sec-grid > *', '.stage', '.bro', '.dl', '.oc', '.svc4 > *', '.serves'
  ].join(',');
  var IMG = ['.hero-media', '.split-media', '.profile-photo', '.art-hero', '.ni-feat-img'].join(',');
  var WORDS = ['.pg-head h1', '.nf h1', '.ni-head h1', '.ed-hero h1'].join(',');
  var LINE = ['.stat-row'].join(',');
  var STAGGER = ['.grid-2', '.grid-3', '.grid-4', '.stories', '.people', '.stat-row', '.ni-grid', '.smap', '.brochure-row', '.cta-facts', '.svc4'].join(',');

  function skip(el) { return el.closest('[data-no-reveal], .ix-hdr, .ifoot, .ix-panel'); }

  // split plain-text headings into words
  document.querySelectorAll(WORDS + ', .rv-words').forEach(function (h) {
    if (skip(h) || h.children.length || h.dataset.rvSplit) return;
    var words = h.textContent.trim().split(/\s+/);
    h.textContent = '';
    words.forEach(function (w, i) {
      var s = document.createElement('span');
      s.className = 'rv-w';
      s.style.setProperty('--rv-i', i);
      s.textContent = w;
      h.appendChild(s);
      if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
    });
    h.classList.add('rv-words');
    h.dataset.rvSplit = '1';
  });

  var els = [];
  function mark(sel, cls) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (skip(el)) return;
      el.classList.add(cls);
      els.push(el);
    });
  }
  mark(FADE + ', .rv', 'rv');
  mark(IMG + ', .rv-img', 'rv-img');
  mark(LINE + ', .rv-line', 'rv-line');
  document.querySelectorAll('.rv-words').forEach(function (el) { els.push(el); });

  // stagger: children of a row come in one after another, four per row
  document.querySelectorAll(STAGGER + ', .rv-stagger').forEach(function (row) {
    if (skip(row)) return;
    Array.prototype.forEach.call(row.children, function (c, i) { c.style.setProperty('--rv-d', ((i % 4) * 90) + 'ms'); });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach(function (el) { io.observe(el); });

  // anything already scrolled past (anchor jumps, back navigation) is shown without waiting
  window.addEventListener('load', function () {
    els.forEach(function (el) { if (el.getBoundingClientRect().bottom < 0) el.classList.add('is-in'); });
  });
  root.classList.add('rv-ready');
})();
