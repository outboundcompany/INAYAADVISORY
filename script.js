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
  // No leaving curtain on this page — go straight to home. The home page still
  // plays its own arrival fade (the pageTrans block below); that one we keep.
  sessionStorage.setItem('pageTrans', '1');
  location.href = href;
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
['thesis', 'about', 'people'].forEach(function (id) {
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
if (location.hash === '#thesis' || location.hash === '#about' || location.hash === '#people') {
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
        companyType: (form.elements.company_type && form.elements.company_type.value) || '',
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
            formBody.classList.remove('cal-mode');
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
            homeBtn.href = 'index.html';
            homeBtn.textContent = 'Continue to Home Page';
            homeBtn.addEventListener('click', function (ce) {
              ce.preventDefault();
              transitionTo('index.html');
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
            formBody.classList.add('cal-mode');
            receipt.innerHTML = '';
            // Panel stays LOCKED at the form height. Cal.com resizes its own
            // iframe as dates/months are clicked, but that happens inside a
            // fixed-height scroll wrapper, so the panel and the image matched
            // to it never move.

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

            // Plain Cal.com layout (dark-themed) mounted straight into the
            // right-side space — no custom in-design calendar.
            mountCalEmbed(calMount, calLink, name, email, enterBookedState);
            fadeReceiptIn();
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

// ---------- Cal.com inline embed (stock interface) ----------
// Mounts Cal.com's own booking UI, unstyled, straight into calMount. The panel
// is locked to the form height and calMount scrolls internally, so Cal.com
// resizing its iframe (on date/month clicks) never moves the panel or the
// height-matched image. On a successful booking, onBooked() swaps in our own
// confirmation (see enterBookedState).
function mountCalEmbed(container, calLink, name, email, onBooked) {
  container.innerHTML = '';
  if (!container.id) container.id = 'cal-inline';
  container.classList.add('cal-embed');
  var done = false;
  function fireBooked() { if (done) return; done = true; onBooked(); }
  try {
    Cal('inline', {
      elementOrSelector: '#' + container.id,
      calLink: calLink,
      config: { name: name, email: email, theme: 'light', layout: 'month_view' }
    });
    // Cal.com's own default (light) interface — no Inaya theming applied.
    Cal('ui', { theme: 'light', hideEventTypeDetails: false });
    // On a completed booking, swap Cal.com's own confirmation for ours: the
    // "Arrange An Introduction." heading clears and enterBookedState shows
    // "Your call has been booked." + the Continue to Home Page button. Register
    // both event names Cal.com has shipped, guarded so it only fires once.
    Cal('on', { action: 'bookingSuccessful', callback: fireBooked });
    Cal('on', { action: 'bookingSuccessfulV2', callback: fireBooked });
  } catch (e) {}
}
