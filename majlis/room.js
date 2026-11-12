/* The Majlis member room (13 Nov 2026).
   room.enc.json holds ciphertext only (AES-256-GCM). The data key is wrapped once per accepted login with a
   key derived by PBKDF2-SHA256 (310,000 iterations) from the member's email and password, the same scheme as
   the Inaya CRM. Wrong credentials cannot unwrap the key, so nothing decrypts. The unwrapped data key is kept
   for this browser tab only (sessionStorage) so the room can open after sign-in. */
(function () {
  var ENC = '/majlis/room.enc.json';
  var KEY = 'inaya_majlis_k';
  var d = document;
  function b64(s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); }
  function tob64(buf) { var b = new Uint8Array(buf), s = ''; for (var i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function getEnc() { return fetch(ENC + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('fetch'); return r.json(); }); }

  async function unwrap(enc, email, pass) {
    var secret = new TextEncoder().encode(email.trim().toLowerCase() + '\n' + pass);
    var base = await crypto.subtle.importKey('raw', secret, 'PBKDF2', false, ['deriveKey']);
    var kek = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(enc.salt), iterations: enc.iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    for (var i = 0; i < enc.keys.length; i++) {
      try { return await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.keys[i].iv) }, kek, b64(enc.keys[i].k)); } catch (e) {}
    }
    throw new Error('credentials');
  }
  async function open(enc, rawKey) {
    var key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, false, ['decrypt']);
    var pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, key, b64(enc.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }

  /* ---------- sign-in (majlis/login) ---------- */
  var form = d.getElementById('ml-form');
  if (form) {
    var err = d.getElementById('ml-err'), btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var email = d.getElementById('ml-email').value, pass = d.getElementById('ml-pass').value;
      if (!email || !pass) { err.textContent = 'Enter your email address and password.'; return; }
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Signing in'; err.textContent = '';
      try {
        var enc = await getEnc();
        var raw = await unwrap(enc, email, pass);
        try { sessionStorage.setItem(KEY, tob64(raw)); sessionStorage.setItem('inaya_majlis_e', email.trim().toLowerCase()); } catch (x) {}
        location.href = '/majlis/room';
      } catch (x) {
        btn.disabled = false; btn.textContent = label;
        err.textContent = x.message === 'credentials' ? 'That email address and password do not match a seat.' : 'The member room could not be reached. Try again in a moment.';
      }
    });
  }

  /* ---------- the room (majlis/room) ---------- */
  var room = d.getElementById('mr-list');
  if (room) {
    var k = null; try { k = sessionStorage.getItem(KEY); } catch (x) {}
    if (!k) { location.replace('/majlis/login'); return; }
    var out = d.getElementById('mr-signout');
    if (out) out.addEventListener('click', function (e) { e.preventDefault(); try { sessionStorage.removeItem(KEY); sessionStorage.removeItem('inaya_majlis_ack'); sessionStorage.removeItem('inaya_majlis_e'); } catch (x) {} location.href = '/majlis/login'; });
    /* deterrents: a website cannot block screenshots, so the room carries the member's name on every
       capture, cannot be printed, selected or copied, and blurs when the window loses focus */
    (function protect() {
      var who = ''; try { who = sessionStorage.getItem('inaya_majlis_e') || ''; } catch (x) {}
      var date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      var text = (who || 'Majlis member') + ' \u00b7 ' + date + ' \u00b7 Confidential';
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="460" height="260"><text x="0" y="150" transform="rotate(-24 230 130)" fill="#F4EFE6" fill-opacity="0.07" font-family="DM Sans, Arial, sans-serif" font-size="15" letter-spacing="1">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</text></svg>';
      var wm = d.createElement('div'); wm.className = 'mr-wm'; wm.setAttribute('aria-hidden', 'true');
      wm.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
      d.body.appendChild(wm);
      d.documentElement.classList.add('mr-protect');
      ['copy', 'cut', 'contextmenu', 'dragstart', 'selectstart'].forEach(function (ev) {
        d.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest('main')) e.preventDefault(); });
      });
      d.addEventListener('keydown', function (e) { var k2 = (e.key || '').toLowerCase(); if ((e.metaKey || e.ctrlKey) && (k2 === 'p' || k2 === 's' || k2 === 'c' || k2 === 'a')) e.preventDefault(); });
      function hide() { d.documentElement.classList.add('mr-away'); }
      function show() { d.documentElement.classList.remove('mr-away'); }
      window.addEventListener('blur', hide); window.addEventListener('focus', show);
      d.addEventListener('visibilitychange', function () { if (d.hidden) hide(); else show(); });
    })();
    var ACK = 'inaya_majlis_ack';
    function acked() { return false; }  // the notice shows on every sign-in and every visit (owner, 13 Nov)
    function gate(done) {
      if (acked()) { done(); return; }
      var g = d.getElementById('mr-gate'), main = d.getElementById('mr-main');
      if (main) main.hidden = true;
      g.hidden = false;
      var b = g.querySelector('#mr-agree'); try { b.focus({ preventScroll: true }); } catch (x) {}
      b.addEventListener('click', function () { try { sessionStorage.setItem(ACK, k.slice(0, 16)); } catch (x) {} g.hidden = true; if (main) main.hidden = false; window.scrollTo(0, 0); done(); }, { once: true });
    }
    getEnc().then(function (enc) { return open(enc, b64(k)); }).then(function (data) { return new Promise(function (res) { gate(function () { res(data); }); }); }).then(function (data) {
      var upd = d.getElementById('mr-updated'); if (upd && data.updated) upd.textContent = 'Updated ' + data.updated;
      var rows = [['Strategy and thesis', 'strategy', 1], ['Portfolio or pipeline', 'portfolio', 1], ['Fund', 'fund'], ['Raised so far', 'raised'], ['Track record', 'track'], ['Team', 'team'], ['Stage', 'stage'], ['Timeline', 'timeline'], ['Minimum ticket', 'ticket'], ['Structure and terms', 'structure'], ['Geography', 'region'], ['What the raise needs', 'needs', 1]];
      room.innerHTML = data.mandates.map(function (m) {
        var subj = 'The Majlis: request for name and materials, ' + m.ref + ' (' + m.sector + ')';
        var who = ''; try { who = sessionStorage.getItem('inaya_majlis_e') || ''; } catch (x) {}
        var body = 'Dear Inaya Advisory,\n\n'
          + 'I would like to receive the name and the materials for ' + m.ref + ', ' + m.sector + ' (' + m.region + (m.size ? ', ' + m.size : '') + '), which I have reviewed in the Majlis mandate room.\n\n'
          + 'Please send the non-circumvention agreement for signature, and the materials once it is signed. I am also available for a call to discuss the mandate.\n\n'
          + 'Name:\nFirm and role:\nPhone:\n\n'
          + 'Regards,\n'
          + (who ? '\n(Requested from the Majlis login ' + who + ')' : '');
        var facts = rows.filter(function (r) { return m[r[1]]; }).map(function (r) { return '<div class="mr-f' + (r[2] ? ' mr-f--wide' : '') + '"><dt>' + r[0] + '</dt><dd>' + (m[r[1]] ? esc(m[r[1]]) : '<span class="mr-na">To be confirmed</span>') + '</dd></div>'; }).join('');
        var deck = m.deckUrl ? '<a class="mr-deck" href="#" data-deck="' + esc(m.deckUrl) + '" data-file="' + esc(m.ref) + '.pdf">Download the deck</a>' : '';
        return '<article class="mr-card"><header class="mr-card-h"><p class="mr-kicker"><span class="mr-ref">' + esc(m.ref) + '</span><span class="mr-sector">' + esc(m.sector) + '</span>' + (m.name ? '<span class="mr-name">' + esc(m.name) + '</span>' : '') + '</p>'
          + '<p class="mr-size">' + esc(m.size || 'Size to be confirmed') + '</p></header>'
          + '<dl class="mr-dl">' + facts + '</dl>'
          + '<div class="mr-act"><a class="mr-btn" href="mailto:' + esc(data.contact) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + '">Request the materials</a>' + deck + '<span class="mr-note">Materials follow once an agreement with a non-circumvention clause is signed.</span></div></article>';
      }).join('');
      /* decks: fetched as ciphertext, decrypted here with the room key, saved as a PDF */
      room.addEventListener('click', async function (e) {
        var a = e.target.closest && e.target.closest('[data-deck]'); if (!a) return;
        e.preventDefault();
        var label = a.textContent; a.textContent = 'Preparing the deck';
        try {
          var r = await fetch(a.getAttribute('data-deck') + '?t=' + Date.now(), { cache: 'no-store' });
          if (!r.ok) throw new Error('fetch');
          var buf = new Uint8Array(await r.arrayBuffer());
          var key = await crypto.subtle.importKey('raw', b64(k), { name: 'AES-GCM' }, false, ['decrypt']);
          var pdf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, key, buf.slice(12));
          var url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
          var dl = d.createElement('a'); dl.href = url; dl.download = a.getAttribute('data-file'); d.body.appendChild(dl); dl.click(); dl.remove();
          setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          a.textContent = label;
        } catch (x) { a.textContent = 'The deck could not be opened. Request the materials instead.'; }
      });
    }).catch(function () {
      try { sessionStorage.removeItem(KEY); } catch (x) {}
      location.replace('/majlis/login');
    });
  }
})();
