// Inaya Advisory — interactions

// Cal.com official embed loader (queues calls until their script arrives)
try {
  (function (C, A, L) { var p = function (a, ar) { a.q.push(ar); }; var d = C.document; C.Cal = C.Cal || function () { var cal = C.Cal; var ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { var api = function () { p(api, arguments); }; var namespace = ar[1]; api.q = api.q || []; if (typeof namespace === "string") { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ["initNamespace", namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal('init', { origin: 'https://cal.com' });
} catch (calErr) {
  // Cal embed failing must never take the page down
}

// Shared mark SVG
function inayaMarkSVG() {
  return '<svg viewBox="0 0 200 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path class="mini-bracket" d="M56 280 L56 0 L8 0 Q22 13 40 16 L40 264 Q22 267 8 280 Z"/>' +
    '<rect class="mini-bar mb1" x="70" y="0" width="10" height="280"/>' +
    '<rect class="mini-bar mb2" x="95" y="0" width="10" height="280"/>' +
    '<rect class="mini-bar mb3" x="120" y="0" width="10" height="280"/>' +
    '<path class="mini-bracket" d="M144 280 L144 0 L192 0 Q178 13 160 16 L160 264 Q178 267 192 280 Z"/>' +
    '</svg>';
}

// Page-transition curtain — used ONLY by the post-booking "Continue to Home Page" button
function transitionTo(href) {
  var ov = document.createElement('div');
  ov.className = 'page-trans';
  ov.innerHTML = '<div class="pt-mark">' + inayaMarkSVG() + '</div>';
  document.body.appendChild(ov);
  requestAnimationFrame(function () { ov.classList.add('show'); });
  sessionStorage.setItem('pageTrans', '1');
  setTimeout(function () { location.href = href; }, 900);
}
// arriving under the curtain: fade it away
if (sessionStorage.getItem('pageTrans')) {
  sessionStorage.removeItem('pageTrans');
  (function () {
    var inOv = document.createElement('div');
    inOv.className = 'page-trans show';
    inOv.innerHTML = '<div class="pt-mark">' + inayaMarkSVG() + '</div>';
    document.body.appendChild(inOv);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        inOv.classList.remove('show');
        setTimeout(function () { inOv.remove(); }, 500);
      });
    });
  })();
}

// Scroll reveals (blur-up + rise)
var revealEls = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && revealEls.length) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  revealEls.forEach(function (el) { io.observe(el); });
} else {
  revealEls.forEach(function (el) { el.classList.add('is-revealed'); });
}

// Section anchors — position adaptively: centered in tall viewports, under the nav in short ones
function scrollToSection(id, smooth) {
  var el = document.getElementById(id);
  if (!el) return false;
  var nav = document.querySelector('nav');
  var navH = nav ? nav.offsetHeight : 0;
  var vh = window.innerHeight;
  var secH = el.offsetHeight;
  var free = vh - secH;
  var offset;
  if (secH > vh - navH) {
    offset = navH + 8; // does not fit: pin top just below the nav
  } else {
    offset = Math.max(free / 2, navH + 8); // fits: center in the viewport
  }
  var top = el.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' });
  return true;
}
['thesis', 'about'].forEach(function (id) {
  document.querySelectorAll('a[href$="#' + id + '"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      if (document.getElementById(id)) {
        e.preventDefault();
        scrollToSection(id, true);
        history.replaceState(null, '', '#' + id);
      }
    });
  });
});
if (location.hash === '#thesis' || location.hash === '#about') {
  window.addEventListener('load', function () {
    var id = location.hash.slice(1);
    requestAnimationFrame(function () { scrollToSection(id, false); });
  });
}

// Service switcher — clicking a card swaps the panel above
document.querySelectorAll('.svc-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    var key = tab.getAttribute('data-svc-tab');
    document.querySelectorAll('.svc-tab').forEach(function (t) { t.classList.toggle('active', t === tab); });
    document.querySelectorAll('.svc-panel').forEach(function (p) {
      p.classList.toggle('active', p.getAttribute('data-svc-panel') === key);
    });
  });
});

// Funnel timeline — on every frame, the step nearest mid-viewport is active.
// Computed from scroll position (not an observer), so no scroll speed can skip a step.
var flowSteps = document.querySelectorAll('.flow-step');
if (flowSteps.length) {
  var flowTicking = false;
  var updateFlow = function () {
    var mid = window.innerHeight / 2;
    var best = null;
    var bestDist = Infinity;
    flowSteps.forEach(function (s) {
      var r = s.getBoundingClientRect();
      var d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = s; }
    });
    flowSteps.forEach(function (s) { s.classList.toggle('active', s === best); });
    flowTicking = false;
  };
  var onFlowScroll = function () {
    if (!flowTicking) {
      flowTicking = true;
      requestAnimationFrame(updateFlow);
    }
  };
  window.addEventListener('scroll', onFlowScroll, { passive: true });
  window.addEventListener('resize', onFlowScroll, { passive: true });
  updateFlow();
}

// Frosted nav on scroll
var navBar = document.querySelector('nav');
if (navBar) {
  var onScroll = function () { navBar.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Accordion — smooth expand, no bounce
document.querySelectorAll('.acc-head').forEach(function (head) {
  head.addEventListener('click', function () {
    var item = head.parentElement;
    var body = item.querySelector('.acc-body');
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item.open').forEach(function (other) {
      other.classList.remove('open');
      other.querySelector('.acc-body').style.maxHeight = '0';
    });
    if (!isOpen) {
      item.classList.add('open');
      body.style.maxHeight = body.scrollHeight + 'px';
    }
  });
});

// Team modal — instant appear/disappear
document.querySelectorAll('[data-modal-target]').forEach(function (card) {
  card.addEventListener('click', function () {
    var modal = document.getElementById(card.getAttribute('data-modal-target'));
    if (modal) modal.classList.add('open');
  });
});
document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) overlay.classList.remove('open');
  });
  var close = overlay.querySelector('.modal-close');
  if (close) close.addEventListener('click', function () { overlay.classList.remove('open'); });
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(function (o) { o.classList.remove('open'); });
  }
});

// Forms — on submit, replace the form with a receipt of the submitted data
// plus a scheduling link (when the form carries data-cal).
document.querySelectorAll('form[data-inline-success]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var endpoint = form.getAttribute('action');

    var showReceipt = function () {
      var formBody = form.parentElement;
      var splitEl = formBody.closest('.form-split');
      var visualEl = splitEl ? splitEl.querySelector('.form-visual') : null;
      var heading = formBody.querySelector('h2');

      // Lock the panel to the form-filling size BEFORE swapping anything, so the
      // image (left) and the box (right) never change size for the whole flow.
      var lockPanel = !!form.getAttribute('data-cal') && window.innerWidth > 860;
      if (lockPanel) {
        var H = formBody.offsetHeight; // measured while the form is still visible
        if (splitEl) splitEl.classList.add('cal-active');
        formBody.style.height = H + 'px';
        if (visualEl) visualEl.style.height = H + 'px';
      } else {
        formBody.style.minHeight = formBody.offsetHeight + 'px';
      }
      formBody.classList.add('receipt-mode');
      if (heading) heading.style.display = 'none';

      var name = (form.elements.name && form.elements.name.value) || '';
      var email = (form.elements.email && form.elements.email.value) || '';
      var details = {
        firm: (form.elements.firm && form.elements.firm.value) || '',
        mandateType: (form.elements.mandate_type && form.elements.mandate_type.value) || '',
        capitalTarget: (form.elements.capital_target && form.elements.capital_target.value) || '',
        description: (form.elements.description && form.elements.description.value) || ''
      };

      var receipt = document.createElement('div');
      receipt.className = 'form-receipt';

      var msg = document.createElement('p');
      msg.className = 'receipt-msg';
      msg.textContent = 'Your inquiry has been submitted.';
      receipt.appendChild(msg);

      var mark = document.createElement('div');
      mark.className = 'loader-mini';
      mark.innerHTML = inayaMarkSVG();
      receipt.appendChild(mark);

      var redirect = document.createElement('p');
      redirect.className = 'redirect-line';
      redirect.textContent = 'Redirecting You To The INAYA Advisory Calendar.';
      receipt.appendChild(redirect);

      form.style.display = 'none';
      form.insertAdjacentElement('afterend', receipt);

      var calUrl = form.getAttribute('data-cal');
      if (calUrl) {
        var calLink = calUrl.replace(/^https?:\/\/cal\.com\//, '').split('?')[0];

        function fadeReceiptOut(cb) {
          receipt.style.transition = 'opacity 0.5s ease';
          receipt.style.opacity = '0';
          setTimeout(cb, 520);
        }
        function fadeReceiptIn() {
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { receipt.style.opacity = '1'; });
          });
        }

        // booked confirmation — only the right content cross-fades; image untouched
        var enterBookedState = function () {
          fadeReceiptOut(function () {
            receipt.classList.remove('has-cal');
            receipt.classList.add('booked');
            receipt.innerHTML = '';
            var bookedMark = document.createElement('div');
            bookedMark.className = 'booked-mark';
            bookedMark.innerHTML = inayaMarkSVG();
            receipt.appendChild(bookedMark);
            var bmsg = document.createElement('p');
            bmsg.className = 'receipt-msg';
            bmsg.textContent = 'Your call has been booked.';
            receipt.appendChild(bmsg);
            var note = document.createElement('p');
            note.className = 'redirect-line booked-note';
            note.textContent = 'A confirmation has been sent to your email.';
            receipt.appendChild(note);
            var homeBtn = document.createElement('a');
            homeBtn.className = 'btn booked-home';
            homeBtn.href = '/';
            homeBtn.textContent = 'Continue to Home Page';
            homeBtn.addEventListener('click', function (ce) {
              ce.preventDefault();
              transitionTo('/');
            });
            receipt.appendChild(homeBtn);
            fadeReceiptIn();
          });
        };

        setTimeout(function () {
          fadeReceiptOut(function () {
            mark.remove();
            redirect.remove();
            receipt.classList.add('has-cal');
            receipt.innerHTML = '';

            msg = document.createElement('p');
            msg.className = 'receipt-msg';
            msg.textContent = 'Arrange An Introduction.';
            var headMark = document.createElement('span');
            headMark.className = 'cal-head-mark';
            headMark.innerHTML = inayaMarkSVG();
            msg.appendChild(headMark);
            receipt.appendChild(msg);

            var calMount = document.createElement('div');
            calMount.className = 'cal-mount';
            receipt.appendChild(calMount);

            mountInayaCalendar(calMount, {
              name: name,
              email: email,
              details: details,
              onBooked: enterBookedState,
              onReady: fadeReceiptIn,
              fallback: function () {
                mountCalEmbed(calMount, calLink, name, email, enterBookedState);
                fadeReceiptIn();
              }
            });
          });
        }, 4000);
      }
    };

    // Send the filled form straight to the team inbox the moment it is submitted,
    // independent of whether a call is later booked. Fire-and-forget (captured
    // before the form is swapped out) so the receipt/calendar appears instantly.
    if (endpoint && endpoint.indexOf('formspree') !== -1) {
      var leadData = new FormData(form);
      fetch(endpoint, { method: 'POST', body: leadData, headers: { Accept: 'application/json' } }).catch(function () {});
    }
    showReceipt();
  });
});

// ---------- Cal.com embed (fallback only) ----------
function mountCalEmbed(container, calLink, name, email, onBooked) {
  container.innerHTML = '';
  if (!container.id) container.id = 'cal-inline';
  container.classList.add('cal-frame', 'cal-embed');
  try {
    Cal('inline', {
      elementOrSelector: '#' + container.id,
      calLink: calLink,
      config: { name: name, email: email, theme: 'dark', layout: 'month_view' }
    });
    Cal('ui', {
      theme: 'dark',
      hideEventTypeDetails: true,
      cssVarsPerTheme: {
        dark: {
          'cal-brand': '#F5F2EB',
          'cal-bg': '#0B0B09',
          'cal-bg-muted': '#121110',
          'cal-border': 'rgba(245,242,235,0.16)',
          'cal-border-default': 'rgba(245,242,235,0.16)',
          'cal-border-subtle': 'rgba(245,242,235,0.1)',
          'cal-radius': '0px',
          'cal-radius-md': '0px',
          'cal-radius-lg': '0px'
        }
      }
    });
    Cal('on', { action: 'bookingSuccessful', callback: function () { onBooked(); } });
  } catch (e) {}
}

// ---------- Custom in-design calendar (Inaya) ----------
// Reads availability from /api/slots and books through /api/book.
// Both endpoints keep the Cal.com key server-side. Months are cached and the
// next month is prefetched, so navigation is instant after the first load.
function mountInayaCalendar(container, opts) {
  var tz = 'UTC';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) {}
  var name = opts.name, email = opts.email;
  var details = opts.details || {};
  var cache = {};
  var today = new Date();
  var view = { y: today.getFullYear(), m: today.getMonth() };
  var selectedDateKey = null;
  var selectedSlot = null;
  var booking = false;
  var firstLoad = true;

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function monthKey(y, m) { return y + '-' + pad(m + 1); }
  function dayKey(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }
  function nextMonth(y, m) { return m === 11 ? { y: y + 1, m: 0 } : { y: y, m: m + 1 }; }
  function prevMonth(y, m) { return m === 0 ? { y: y - 1, m: 11 } : { y: y, m: m - 1 }; }
  function atCurrentMonth() { return view.y === today.getFullYear() && view.m === today.getMonth(); }

  container.classList.add('inaya-cal');

  function fetchMonth(y, m) {
    var mk = monthKey(y, m);
    if (cache[mk]) return Promise.resolve(cache[mk]);
    var daysIn = new Date(y, m + 1, 0).getDate();
    var start = dayKey(y, m, 1);
    var end = dayKey(y, m, daysIn);
    var url = '/api/slots?start=' + encodeURIComponent(start) +
      '&end=' + encodeURIComponent(end) + '&timeZone=' + encodeURIComponent(tz);
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('slots ' + r.status); return r.json(); })
      .then(function (j) {
        if (!j || j.status !== 'success' || !j.data) throw new Error('bad payload');
        cache[mk] = j.data;
        return j.data;
      });
  }

  function prefetchNext() {
    var n = nextMonth(view.y, view.m);
    fetchMonth(n.y, n.m).catch(function () {});
  }

  function formatTime(iso) {
    try { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return iso; }
  }
  function formatDateHeading(key) {
    var p = key.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function renderLoading() {
    // no logo loader — keep the space clean; the calendar appears when ready
    container.innerHTML = '';
  }

  var gridEl = null, belowEl = null;
  function currentData() { return cache[monthKey(view.y, view.m)] || {}; }

  function buildHead() {
    var head = document.createElement('div');
    head.className = 'ic-head';
    var title = document.createElement('div');
    title.className = 'ic-title';
    title.innerHTML = '<span>' + MONTHS[view.m] + '</span> ' + view.y;
    head.appendChild(title);
    var navWrap = document.createElement('div');
    navWrap.className = 'ic-navwrap';
    var prev = document.createElement('button');
    prev.className = 'ic-nav'; prev.setAttribute('aria-label', 'Previous month'); prev.innerHTML = '&#8592;';
    prev.disabled = atCurrentMonth();
    var next = document.createElement('button');
    next.className = 'ic-nav'; next.setAttribute('aria-label', 'Next month'); next.innerHTML = '&#8594;';
    navWrap.appendChild(prev); navWrap.appendChild(next);
    head.appendChild(navWrap);
    prev.addEventListener('click', function () {
      if (prev.disabled) return;
      var p = prevMonth(view.y, view.m);
      view.y = p.y; view.m = p.m; selectedDateKey = null; selectedSlot = null; load();
    });
    next.addEventListener('click', function () {
      var n = nextMonth(view.y, view.m);
      view.y = n.y; view.m = n.m; selectedDateKey = null; selectedSlot = null; load();
    });
    return head;
  }

  function paint() {
    var data = currentData();
    container.innerHTML = '';
    container.appendChild(buildHead());

    gridEl = document.createElement('div');
    gridEl.className = 'ic-grid ic-anim-in';
    DOW.forEach(function (d) {
      var c = document.createElement('div'); c.className = 'ic-dow'; c.textContent = d; gridEl.appendChild(c);
    });
    var firstDow = new Date(view.y, view.m, 1).getDay();
    var daysIn = new Date(view.y, view.m + 1, 0).getDate();
    var todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    for (var i = 0; i < firstDow; i++) {
      var blank = document.createElement('div'); blank.className = 'ic-day is-blank'; gridEl.appendChild(blank);
    }
    for (var day = 1; day <= daysIn; day++) {
      var key = dayKey(view.y, view.m, day);
      var cell = document.createElement('button');
      cell.className = 'ic-day'; cell.textContent = day;
      var isPast = new Date(view.y, view.m, day) < todayMid;
      var hasSlots = data[key] && data[key].length > 0;
      if (isPast || !hasSlots) { cell.classList.add('is-empty'); cell.disabled = true; }
      else { cell.classList.add('is-available'); }
      if (key === selectedDateKey) cell.classList.add('is-selected');
      (function (k, c) {
        c.addEventListener('click', function () {
          if (c.disabled) return;
          selectedDateKey = k; selectedSlot = null;
          var cells = gridEl.querySelectorAll('.ic-day');
          for (var x = 0; x < cells.length; x++) cells[x].classList.remove('is-selected');
          c.classList.add('is-selected');
          renderBelow(true);
        });
      })(key, cell);
      gridEl.appendChild(cell);
    }
    // pad with trailing blanks so every month fills a full 6-week grid — height never changes between months
    for (var t = firstDow + daysIn; t < 42; t++) {
      var tail = document.createElement('div'); tail.className = 'ic-day is-blank'; gridEl.appendChild(tail);
    }
    container.appendChild(gridEl);

    belowEl = document.createElement('div');
    belowEl.className = 'ic-below';
    container.appendChild(belowEl);
    renderBelow(false);
  }

  function renderBelow(animate) {
    if (!belowEl) return;
    var data = currentData();
    var slots = data[selectedDateKey];
    belowEl.innerHTML = '';
    if (!selectedDateKey || !slots || !slots.length) {
      var hint = document.createElement('div');
      hint.className = 'ic-empty-hint';
      hint.textContent = 'Select a date to view available times.';
      belowEl.appendChild(hint);
      return;
    }

    var times = document.createElement('div');
    times.className = 'ic-times';
    var th = document.createElement('div');
    th.className = 'ic-times-head';
    th.textContent = formatDateHeading(selectedDateKey);
    times.appendChild(th);
    var list = document.createElement('div');
    list.className = 'ic-slot-list';
    slots.forEach(function (slot) {
      var b = document.createElement('button');
      b.className = 'ic-slot';
      b.textContent = formatTime(slot.start);
      if (selectedSlot && selectedSlot.start === slot.start) b.classList.add('is-selected');
      b.addEventListener('click', function () {
        selectedSlot = slot;
        var others = list.querySelectorAll('.ic-slot');
        for (var x = 0; x < others.length; x++) others[x].classList.remove('is-selected');
        b.classList.add('is-selected');
        showConfirm();
      });
      list.appendChild(b);
    });
    times.appendChild(list);
    belowEl.appendChild(times);

    if (selectedSlot) belowEl.appendChild(buildConfirm());

    if (animate) {
      belowEl.classList.remove('ic-anim-in');
      void belowEl.offsetWidth;
      belowEl.classList.add('ic-anim-in');
    }
  }

  function buildConfirm() {
    var confirm = document.createElement('div');
    confirm.className = 'ic-confirm';
    var line = document.createElement('p');
    line.className = 'ic-confirm-line';
    line.textContent = formatDateHeading(selectedDateKey) + ' at ' + formatTime(selectedSlot.start);
    confirm.appendChild(line);
    var cbtn = document.createElement('button');
    cbtn.className = 'btn ic-confirm-btn';
    cbtn.textContent = booking ? 'Confirming…' : 'Confirm This Time';
    cbtn.disabled = booking;
    cbtn.addEventListener('click', doBook);
    confirm.appendChild(cbtn);
    var err = document.createElement('p');
    err.className = 'ic-error'; err.id = 'ic-error';
    confirm.appendChild(err);
    return confirm;
  }

  function showConfirm() {
    if (!belowEl) return;
    var existing = belowEl.querySelector('.ic-confirm');
    if (existing) existing.remove();
    if (!selectedSlot) return;
    var c = buildConfirm();
    c.classList.add('ic-anim-in');
    belowEl.appendChild(c);
  }

  function showError(t) { var e = document.getElementById('ic-error'); if (e) e.textContent = t; }

  function doBook() {
    if (booking || !selectedSlot) return;
    booking = true;
    showConfirm();
    if (isLocalPreview()) {
      setTimeout(function () { booking = false; opts.onBooked(); }, 700);
      return;
    }
    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ start: selectedSlot.start, name: name, email: email, timeZone: tz, details: details })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        booking = false;
        if (res.ok && res.j && res.j.status === 'success') { opts.onBooked(); }
        else { showConfirm(); showError('That time is no longer available. Please choose another.'); }
      })
      .catch(function () { booking = false; showConfirm(); showError('Something went wrong. Please try again.'); });
  }

  function isLocalPreview() {
    return location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1' ||
      location.protocol === 'file:';
  }

  // Placeholder availability so the custom calendar can be designed locally
  // (the live /api endpoints only run on Vercel). Varies per day so the time
  // list visibly changes between dates.
  function mockMonth(y, m) {
    var data = {};
    var daysIn = new Date(y, m + 1, 0).getDate();
    var todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var pool = [[9, 30], [10, 0], [10, 30], [11, 0], [11, 30], [13, 30], [14, 0], [14, 30], [15, 0], [15, 30], [16, 0], [16, 30]];
    for (var d = 1; d <= daysIn; d++) {
      var dt = new Date(y, m, d);
      if (dt < todayMid) continue;
      if (dt.getDay() === 0 || dt.getDay() === 6) continue;
      var offset = d % 4;
      var count = 5 + (d % 4);
      var picks = pool.slice(offset, offset + count);
      data[dayKey(y, m, d)] = picks.map(function (h) {
        return { start: new Date(y, m, d, h[0], h[1]).toISOString() };
      });
    }
    return data;
  }

  var readyFired = false;
  function fireReady() {
    if (readyFired) return;
    readyFired = true;
    if (opts.onReady) opts.onReady();
  }

  function load() {
    var mk = monthKey(view.y, view.m);
    if (!cache[mk]) renderLoading();
    fetchMonth(view.y, view.m)
      .then(function () { firstLoad = false; paint(); fireReady(); prefetchNext(); })
      .catch(function () {
        if (isLocalPreview()) {
          cache[mk] = mockMonth(view.y, view.m);
          firstLoad = false;
          paint();
          fireReady();
        } else if (firstLoad && opts.fallback) {
          opts.fallback();
        } else {
          paint();
        }
      });
  }

  load();
}
