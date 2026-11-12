/* Inaya Advisory: site shell behaviour (header, mega menus, mobile menu, tabs).
   Loaded on every page by tools/shell.py. No dependencies. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('ix-js');

  /* ---------- tabs: any [data-tabs] block (components.css .tabs) ---------- */
  [].forEach.call(d.querySelectorAll('[data-tabs]'), function (wrap) {
    var tabs = [].slice.call(wrap.querySelectorAll('[role="tab"]'));
    if (!tabs.length) return;
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab, panel = d.getElementById(t.getAttribute('aria-controls'));
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    select(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  });

  var hdr = d.getElementById('ix-hdr');
  if (!hdr) return;

  /* ---------- frosted bar once the page scrolls ---------- */
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- wordmark on the homepage scrolls to the top ---------- */
  var mark = hdr.querySelector('.ix-mark');
  if (mark) mark.addEventListener('click', function (e) {
    if (location.pathname === '/' || location.pathname === '/index.html') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  });

  /* ---------- desktop mega menus ---------- */
  var desk = window.matchMedia('(min-width: 1200px)');
  var items = [].slice.call(hdr.querySelectorAll('[data-ix-item]'));
  var current = null, closeTimer = null, openedAt = 0, quiet = false;

  function mark_(item, on) {
    item.classList.toggle('is-open', on);
    item.querySelector('.ix-top').setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  function open(item) {
    clearTimeout(closeTimer);
    if (current === item) return;
    if (current) mark_(current, false);
    current = item; openedAt = Date.now();
    mark_(item, true);
    hdr.classList.add('is-open');
  }
  function close() {
    clearTimeout(closeTimer);
    if (current) mark_(current, false);
    current = null;
    hdr.classList.remove('is-open');
  }
  function closeSoon() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); }

  items.forEach(function (item) {
    var top = item.querySelector('.ix-top');
    item.addEventListener('mouseenter', function () { if (desk.matches) open(item); });
    item.addEventListener('mouseleave', function () { if (current === item) closeSoon(); });
    top.addEventListener('click', function () {
      if (current === item && Date.now() - openedAt > 450) close(); else open(item);
    });
    item.addEventListener('focusin', function () { if (!quiet && desk.matches) open(item); });
    item.addEventListener('focusout', function (e) {
      if (current === item && !item.contains(e.relatedTarget)) close();
    });
    top.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); open(item);
        var first = item.querySelector('.ix-panel a');
        if (first) first.focus();
      }
    });
  });

  d.addEventListener('click', function (e) { if (current && !current.contains(e.target)) close(); });
  /* a link inside an open panel (also a same-page anchor) closes the panel */
  hdr.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('.ix-panel a'); if (a && current) close(); });
  hdr.addEventListener('mouseenter', function () { if (current) clearTimeout(closeTimer); });

  /* ---------- mobile menu ---------- */
  var burger = hdr.querySelector('.ix-burger');
  var mnav = d.getElementById('ix-mnav');

  function setMenu(on, restoreFocus) {
    hdr.classList.toggle('is-menu', on);
    root.classList.toggle('ix-lock', on);
    burger.setAttribute('aria-expanded', on ? 'true' : 'false');
    burger.setAttribute('aria-label', on ? 'Close menu' : 'Menu');
    if (on) {
      var first = mnav.querySelector('.ix-mtop');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 30);
    } else if (restoreFocus) {
      burger.focus();
    }
  }
  if (burger && mnav) {
    burger.addEventListener('click', function () { setMenu(!hdr.classList.contains('is-menu'), true); });
    [].forEach.call(mnav.querySelectorAll('.ix-mtop'), function (btn) {
      btn.addEventListener('click', function () {
        var acc = btn.parentNode, on = !acc.classList.contains('is-open');
        acc.classList.toggle('is-open', on);
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    });
    mnav.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (a) setMenu(false);
    });
    /* keep Tab inside the open menu (burger + menu contents) */
    d.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab' || !hdr.classList.contains('is-menu')) return;
      var list = [burger].concat([].slice.call(mnav.querySelectorAll('a, button')).filter(function (el) {
        return el.offsetParent !== null && getComputedStyle(el).visibility !== 'hidden';
      }));
      var i = list.indexOf(d.activeElement);
      if (e.shiftKey && (i <= 0)) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && i === list.length - 1) { e.preventDefault(); list[0].focus(); }
    });
  }

  /* ---------- Escape closes whatever is open ---------- */
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (hdr.classList.contains('is-menu')) { setMenu(false, true); return; }
    if (current) {
      var item = current, had = item.contains(d.activeElement);
      close();
      if (had) { quiet = true; item.querySelector('.ix-top').focus(); quiet = false; }
    }
  });

  /* ---------- crossing the breakpoint resets both menus ---------- */
  function reset() { close(); if (hdr.classList.contains('is-menu')) setMenu(false); }
  if (desk.addEventListener) desk.addEventListener('change', reset); else if (desk.addListener) desk.addListener(reset);
  window.addEventListener('pageshow', function (e) { if (e.persisted) reset(); });
})();



/* v5.2 (owner, 12 Nov 2026): side-by-side text blocks align. In every grid row of cards, titles and
   paragraphs that sit next to each other are locked to the height of the tallest one in that row, in
   whole lines, so the next element starts on one line across the row. Recomputed on resize and when
   fonts load. Single-column layouts are untouched. The homepage is excluded (layout locked). Opt out
   with data-no-eq on a container. */
(function () {
  var d = document;
  if (d.body.classList.contains('home')) return;
  var SEL = 'h3, h4, p, ul';
  function cards() {
    var out = [];
    [].forEach.call(d.querySelectorAll('main *'), function (c) {
      if (c.closest('[data-no-eq]')) return;
      var cs = getComputedStyle(c);
      if (cs.display !== 'grid' && cs.display !== 'flex') return;
      if (cs.display === 'flex' && cs.flexDirection.indexOf('column') === 0) return;
      var kids = [].filter.call(c.children, function (k) { return k.offsetParent !== null && k.getBoundingClientRect().width > 120; });
      if (kids.length < 2) return;
      out.push(kids);
    });
    return out;
  }
  function run() {
    var groups = cards();
    groups.forEach(function (kids) {
      kids.forEach(function (k) { [].forEach.call(k.querySelectorAll(SEL), function (el) { if (el.dataset.eq) { el.style.minHeight = ''; } }); });
    });
    groups.forEach(function (kids) {
      // rows: children sharing a top edge
      var rows = {};
      kids.forEach(function (k) { var t = k.offsetTop; (rows[t] = rows[t] || []).push(k); });
      Object.keys(rows).forEach(function (t) {
        var row = rows[t]; if (row.length < 2) return;
        // the n-th block of each tag+class inside each card is compared with its counterparts
        var slots = {};
        row.forEach(function (k) {
          var seen = {};
          [].forEach.call(k.querySelectorAll(SEL), function (el) {
            var anc = el.parentElement.closest('p, li'); if (el.closest('[data-no-eq]') || (anc && anc !== k && k.contains(anc))) return;
            var key = el.tagName + '.' + el.className.replace(/\b(is-[a-z-]+|rv[a-z-]*)\b/g, '').trim();
            seen[key] = (seen[key] || 0) + 1;
            (slots[key + '#' + seen[key]] = slots[key + '#' + seen[key]] || []).push(el);
          });
        });
        Object.keys(slots).forEach(function (s) {
          var els = slots[s]; if (els.length !== row.length) return;
          var max = 0;
          els.forEach(function (el) { max = Math.max(max, el.offsetHeight); });
          els.forEach(function (el) { el.style.minHeight = Math.ceil(max) + 'px'; el.dataset.eq = '1'; });
        });
      });
    });
  }
  window.inayaEqualize = run;
  var t;
  function later() { clearTimeout(t); t = setTimeout(run, 120); }
  if (d.readyState === 'complete') run(); else window.addEventListener('load', run);
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(later);
  window.addEventListener('resize', later);
})();
