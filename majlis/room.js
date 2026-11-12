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
        try { sessionStorage.setItem(KEY, tob64(raw)); } catch (x) {}
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
    if (out) out.addEventListener('click', function (e) { e.preventDefault(); try { sessionStorage.removeItem(KEY); } catch (x) {} location.href = '/majlis/login'; });
    getEnc().then(function (enc) { return open(enc, b64(k)); }).then(function (data) {
      var upd = d.getElementById('mr-updated'); if (upd && data.updated) upd.textContent = 'Updated ' + data.updated;
      var rows = [['Strategy', 'strategy'], ['Size or target', 'size'], ['Raised so far', 'raised'], ['Stage', 'stage'], ['Timeline', 'timeline'], ['Minimum ticket', 'ticket'], ['Structure', 'structure'], ['Region', 'region'], ['What the raise needs', 'needs']];
      room.innerHTML = data.mandates.map(function (m, i) {
        var subj = 'Materials request: ' + m.ref + ', ' + m.sector;
        var body = 'Please send the materials for ' + m.ref + ' (' + m.sector + ', ' + m.region + ').';
        var dl = rows.filter(function (r) { return m[r[1]]; }).map(function (r) { return '<div class="mr-f' + (r[1] === 'strategy' || r[1] === 'needs' ? ' mr-f--wide' : '') + '"><dt>' + r[0] + '</dt><dd>' + esc(m[r[1]]) + '</dd></div>'; }).join('');
        return '<details class="mr-item"' + (i === 0 ? ' open' : '') + '><summary class="mr-sum"><span class="mr-ref">' + esc(m.ref) + '</span><span class="mr-sector">' + esc(m.sector) + '</span><span class="mr-size">' + esc(m.size || 'Size to be confirmed') + '</span><span class="mr-region">' + esc(m.region) + '</span><span class="mr-pm" aria-hidden="true"></span></summary>'
          + '<div class="mr-body"><dl class="mr-dl">' + dl + '</dl><div class="mr-act"><a class="xc-btn mr-btn" href="mailto:' + esc(data.contact) + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(body) + '">Request the materials</a><span class="mr-note">Materials follow once an agreement with a non-circumvention clause is signed.</span></div></div></details>';
      }).join('');
    }).catch(function () {
      try { sessionStorage.removeItem(KEY); } catch (x) {}
      location.replace('/majlis/login');
    });
  }
})();
