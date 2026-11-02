/* News & Insights: copy-link button and simple pagination for long category grids. */
(function () {
  var copy = document.querySelector('.art-copy');
  if (copy) {
    var toast = document.createElement('div');
    toast.className = 'ni-toast'; toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    copy.addEventListener('click', function () {
      var url = copy.getAttribute('data-url') || location.href;
      var done = function () { toast.textContent = 'Link copied'; toast.classList.add('is-on'); setTimeout(function () { toast.classList.remove('is-on'); }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, done);
      else { var t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); done(); }
    });
  }

  [].forEach.call(document.querySelectorAll('[data-paginate]'), function (grid) {
    var per = parseInt(grid.getAttribute('data-paginate'), 10) || 9;
    var items = [].slice.call(grid.children);
    var pager = grid.parentNode.querySelector('.ni-pager');
    if (!pager || items.length <= per) return;
    var pages = Math.ceil(items.length / per);
    var m = /[?&]page=(\d+)/.exec(location.search);
    var cur = m ? Math.min(Math.max(parseInt(m[1], 10), 1), pages) : 1;
    function btn(label, page, attrs) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      if (attrs) for (var k in attrs) b.setAttribute(k, attrs[k]);
      b.addEventListener('click', function () { show(page, true); });
      return b;
    }
    function show(p, scroll) {
      cur = p;
      items.forEach(function (el, i) { el.hidden = Math.floor(i / per) + 1 !== p; });
      pager.innerHTML = '';
      var prev = btn('Previous', p - 1, { 'aria-label': 'Previous page' }); prev.disabled = p === 1; pager.appendChild(prev);
      for (var i = 1; i <= pages; i++) { var b = btn(String(i), i, { 'aria-label': 'Page ' + i }); if (i === p) b.setAttribute('aria-current', 'page'); pager.appendChild(b); }
      var next = btn('Next', p + 1, { 'aria-label': 'Next page' }); next.disabled = p === pages; pager.appendChild(next);
      if (history.replaceState) history.replaceState(null, '', p === 1 ? location.pathname : '?page=' + p);
      if (scroll) grid.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    pager.hidden = false;
    show(cur, false);
  });
})();
