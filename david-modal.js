/* Inaya Advisory people profiles (12 Nov 2026). One shared panel for the four people on /firm.
   Opens from any element with data-profile="<id>" (david-hunter, anas-ansar, shayan-mohammed,
   abbas-chothia); data-david still opens David Hunter, so older pages keep working. Deep link:
   ?profile=<id>. Layout after the owner's reference: a large portrait on the left, then name, the role
   as an outlined tag, a few short paragraphs and the focus areas on the right. Text is the site's
   approved copy only (firm bios, brochure bios, the David Hunter profile). Photographs are the original
   files with the site's original treatment. */
(function () {
  var css = `
.pm-ov,.pm-ov *{box-sizing:border-box}
.pm-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,8,7,.78);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:32px;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s}
.pm-ov.open{opacity:1;visibility:visible;transition:opacity .35s ease}
.pm-pn{position:relative;width:min(1120px,100%);height:min(760px,calc(100vh - 64px));display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);background:#121110;border:1px solid rgba(245,242,235,.14);color:#98948B;font-family:'DM Sans',sans-serif;font-weight:300;transform:translateY(24px);opacity:0;transition:transform .55s cubic-bezier(.22,1,.36,1),opacity .4s ease}
.pm-ov.open .pm-pn{transform:none;opacity:1}
.pm-ph{position:relative;overflow:hidden;background:#151411;border-right:1px solid rgba(245,242,235,.1)}
.pm-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.04);display:block}
.pm-body{position:relative;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:clamp(40px,4.4vw,64px) clamp(28px,4.4vw,64px) clamp(36px,4vw,56px)}
.pm-x{position:absolute;top:18px;right:18px;z-index:3;width:42px;height:42px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(245,242,235,.24);background:#121110;color:#F4EFE6;cursor:pointer;transition:border-color .2s ease}
.pm-x:hover,.pm-x:focus-visible{border-color:#F4EFE6;outline:none}
.pm-x svg{width:14px;height:14px;stroke:currentColor;stroke-width:1.2}
.pm-lab{font-size:10px;font-weight:500;letter-spacing:.4em;text-transform:uppercase;color:#A6A29A;margin:0}
.pm-name{font-family:'Cormorant Garamond',serif;font-weight:300;color:#F4EFE6;font-size:clamp(38px,4vw,56px);line-height:1.04;margin:22px 0 0}
.pm-role{display:inline-block;margin-top:18px;padding:7px 14px;border:1px solid rgba(245,242,235,.3);font-size:10.5px;font-weight:400;letter-spacing:.26em;text-transform:uppercase;color:#E9E3D8}
.pm-lede{color:#E9E3D8;font-size:17px;line-height:1.65;margin:34px 0 0;max-width:36em}
.pm-p{font-size:15px;line-height:1.75;margin:16px 0 0;max-width:38em}
.pm-sec{margin-top:40px;padding-top:28px;border-top:1px solid rgba(245,242,235,.12)}
.pm-sec .pm-lab{margin-bottom:18px}
.pm-focus{list-style:none;margin:0;padding:0;border-bottom:1px solid rgba(245,242,235,.12)}
.pm-focus li{display:grid;grid-template-columns:40px minmax(0,1fr);align-items:baseline;padding:13px 0;border-top:1px solid rgba(245,242,235,.12);font-size:14.5px;line-height:1.6;color:#D9D3C9}
.pm-focus li:first-child{border-top:0}
.pm-focus i{font-style:normal;font-family:'Cormorant Garamond',serif;font-size:16px;color:#8A8277;font-variant-numeric:lining-nums}
.pm-figs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
.pm-figs>div{border-top:1px solid rgba(245,242,235,.12);padding-top:16px}
.pm-fig-n{font-family:'Cormorant Garamond',serif;font-weight:300;color:#F4EFE6;font-size:36px;line-height:1;font-variant-numeric:lining-nums}
.pm-fig-c{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#7E766C;margin-top:12px;line-height:1.6}
.pm-figs p{font-size:13.5px;line-height:1.65;margin:10px 0 0}
.pm-fine{font-size:11.5px;line-height:1.6;color:#6F685E;margin:20px 0 0}
.pm-foot{margin-top:44px;padding-top:28px;border-top:1px solid rgba(245,242,235,.12);display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:18px 28px}
.pm-foot p{font-size:14px;margin:0;max-width:26em}
.pm-btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 30px;border:1px solid rgba(245,242,235,.35);color:#F4EFE6;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;white-space:nowrap;transition:background-color .25s,color .25s,border-color .25s}
.pm-btn:hover,.pm-btn:focus-visible{background:#F4EFE6;color:#0B0B09;border-color:#F4EFE6}
.pm-nav{margin-top:28px;display:flex;justify-content:space-between;gap:16px}
.pm-nav button{background:none;border:0;padding:6px 0;color:#A79E92;font:inherit;font-size:11px;letter-spacing:.22em;text-transform:uppercase;cursor:pointer;display:inline-flex;align-items:center;gap:12px;transition:color .2s}
.pm-nav button:hover,.pm-nav button:focus-visible{color:#F4EFE6;outline:none}
.pm-nav .pm-prev::before,.pm-nav .pm-next::after{content:'';display:block;width:24px;height:1px;background:currentColor}
.pm-body>*{opacity:0;transform:translateY(10px);transition:opacity .5s ease,transform .6s cubic-bezier(.22,1,.36,1)}
.pm-ov.open .pm-body>*{opacity:1;transform:none}
.pm-ov.open .pm-body>:nth-child(2){transition-delay:.05s}.pm-ov.open .pm-body>:nth-child(3){transition-delay:.1s}.pm-ov.open .pm-body>:nth-child(n+4){transition-delay:.15s}
html.pm-lock,html.pm-lock body{overflow:hidden}
@media(max-width:860px){
 .pm-ov{padding:0}
 .pm-pn{width:100%;height:100%;grid-template-columns:1fr;grid-template-rows:auto;overflow-y:auto;overscroll-behavior:contain;border:0;display:block}
 .pm-ph{height:min(62vh,520px);border-right:0}
 .pm-ph img{object-position:50% 22%}
 .pm-body{overflow:visible;padding:36px 20px 48px}
 .pm-x{position:fixed}
 .pm-figs{grid-template-columns:1fr;gap:18px}
}
@media(prefers-reduced-motion:reduce){.pm-ov,.pm-pn,.pm-body>*{transition:none!important}}
`;
  var book = (location.pathname.indexOf('mandateconsultation') > -1) ? '#book' : '/mandateconsultation#book';

  var PEOPLE = [
    { id: 'david-hunter', name: 'David Hunter', role: 'Senior Advisor', img: '/images/david.webp',
      lede: 'As Executive Director and Chief Investment Officer of two US public pension systems, David decided which managers received pension capital. Today he brings managers to the allocators he knows.',
      paras: ['Close to forty years in institutional capital, twenty-four of them in banking at HSBC, Citibank and Sumitomo, and then as Executive Director and Chief Investment Officer of the North Dakota Retirement and Investment Office and the Texas Municipal Retirement System.'],
      figs: [
        ['$7B+', 'HSBC North America', 'Directed more than $7B in pension assets at HSBC North America, within twenty-four years in banking at HSBC, Citibank and Sumitomo.'],
        ['$20B', 'North Dakota Retirement and Investment Office', 'Grew from approximately $8 billion to nearly $20 billion across 27 portfolios, including the state’s sovereign wealth fund, as Executive Director and Chief Investment Officer.'],
        ['$40B', 'Texas Municipal Retirement System', 'As Executive Director and Chief Investment Officer, led the $40 billion retirement system for Texas cities to two consecutive years of top-quartile returns, a first for the system.']
      ],
      fine: 'Figures reflect the prior institutional experience of David Hunter and are not transactions of Inaya Advisory.',
      focusLabel: 'Standing',
      focus: ['Former Executive Director and CIO of the Texas Municipal Retirement System and the North Dakota Retirement and Investment Office.', 'Named among the ISS Power 100 Chief Investment Officers in 2023.', '200+ CIO relationships across US public pensions, consultants, endowments and family offices.'] },
    { id: 'anas-ansar', name: 'Anas Ansar', role: 'Managing Partner', img: '/images/anas-ansar.webp',
      lede: 'Runs each mandate from the first review of a raise to its final close.',
      paras: ['He leads the origination of new mandates, directs the deck, the data room and the terms review, and signs each engagement on the firm’s behalf.',
              'Anas comes to private markets from origination. He leads senior review with David Hunter, and leads investor relations after the close.'],
      focusLabel: 'Focus',
      focus: ['Origination of new mandates', 'Senior review, with David Hunter', 'The deck, the data room and the terms review', 'Investor relations after the close'] },
    { id: 'shayan-mohammed', name: 'Shayan Mohammed', role: 'Managing Director', img: '/images/shayan.webp',
      lede: 'Leads the growth of the firm and its investor coverage across North America, Europe and the Gulf.',
      paras: ['He decides which investors each mandate reaches, and in what order, so a raise goes first to the capital most likely to commit. He also decides when the first introductions are made.'],
      focusLabel: 'Focus',
      focus: ['Investor coverage across North America, Europe and the Gulf', 'Which investors each mandate reaches, and in what order', 'The growth of the firm'] },
    { id: 'abbas-chothia', name: 'Abbas Chothia', role: 'Client Advisor', img: '/images/abbas-chothia-2.webp',
      lede: 'Leads every client conversation at Inaya, from the first call through to engagement, and takes each one himself.',
      paras: ['Over two decades across principal-level advisory, deal execution and company building, including businesses he founded and ran.',
              'A first conversation with Inaya is with Abbas, in confidence, on the raise, the timeline and the constraints, and he carries it through to an engagement confirmed in writing.'],
      focusLabel: 'Focus',
      focus: ['The first conversation, in confidence', 'Client conversations through to engagement', 'Principal-level advisory and deal execution'] }
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function two(n) { return (n < 10 ? '0' : '') + n; }
  function render(p, i) {
    var h = '<p class="pm-lab">Our people</p><h2 class="pm-name" id="pm-name">' + esc(p.name) + '</h2><span class="pm-role">' + esc(p.role) + '</span>';
    h += '<p class="pm-lede">' + esc(p.lede) + '</p>';
    p.paras.forEach(function (t) { h += '<p class="pm-p">' + esc(t) + '</p>'; });
    if (p.figs) {
      h += '<div class="pm-sec"><p class="pm-lab">The record</p><div class="pm-figs">';
      p.figs.forEach(function (f) { h += '<div><div class="pm-fig-n">' + esc(f[0]) + '</div><div class="pm-fig-c">' + esc(f[1]) + '</div><p>' + esc(f[2]) + '</p></div>'; });
      h += '</div><p class="pm-fine">' + esc(p.fine) + '</p></div>';
    }
    h += '<div class="pm-sec"><p class="pm-lab">' + esc(p.focusLabel) + '</p><ul class="pm-focus">';
    p.focus.forEach(function (f, k) { h += '<li><i>' + two(k + 1) + '</i><span>' + esc(f) + '</span></li>'; });
    h += '</ul></div>';
    h += '<div class="pm-foot"><p>If you are raising, we would like to understand the mandate.</p><a class="pm-btn" href="' + book + '">Book the consultation</a></div>';
    var prev = PEOPLE[(i + PEOPLE.length - 1) % PEOPLE.length], next = PEOPLE[(i + 1) % PEOPLE.length];
    h += '<div class="pm-nav"><button type="button" class="pm-prev" data-go="' + prev.id + '">' + esc(prev.name) + '</button><button type="button" class="pm-next" data-go="' + next.id + '">' + esc(next.name) + '</button></div>';
    return h;
  }

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var ov = document.createElement('div'); ov.className = 'pm-ov'; ov.setAttribute('data-no-eq', '');
    ov.innerHTML = '<div class="pm-pn" role="dialog" aria-modal="true" aria-labelledby="pm-name"><button type="button" class="pm-x" aria-label="Close"><svg viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 1l12 12M13 1L1 13"/></svg></button><div class="pm-ph"><img alt="" decoding="async"></div><div class="pm-body"></div></div>';
    document.body.appendChild(ov);
    var pn = ov.querySelector('.pm-pn'), body = ov.querySelector('.pm-body'), img = ov.querySelector('.pm-ph img'), xb = ov.querySelector('.pm-x'), last = null;
    function show(id) {
      var i = 0; PEOPLE.forEach(function (p, k) { if (p.id === id) i = k; });
      var p = PEOPLE[i];
      img.src = p.img; img.alt = p.name + ', ' + p.role;
      body.innerHTML = render(p, i); body.scrollTop = 0; pn.scrollTop = 0;
    }
    function open(id, e) {
      if (e) e.preventDefault();
      if (!ov.classList.contains('open')) last = document.activeElement;
      show(id);
      document.documentElement.classList.add('pm-lock'); ov.classList.add('open');
      setTimeout(function () { xb.focus({ preventScroll: true }); }, 50);
    }
    function close() { ov.classList.remove('open'); document.documentElement.classList.remove('pm-lock'); if (last && last.focus) last.focus({ preventScroll: true }); }
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-profile],[data-david]');
      if (t) open(t.getAttribute('data-profile') || 'david-hunter', e);
    });
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { close(); return; }
      var g = e.target.closest('[data-go]'); if (g) { show(g.getAttribute('data-go')); xb.focus({ preventScroll: true }); return; }
      if (e.target.closest('.pm-btn')) close();
    });
    xb.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (!ov.classList.contains('open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        var f = [].slice.call(pn.querySelectorAll('button, a[href]'));
        var a = f.indexOf(document.activeElement);
        if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    var m = /[?&]profile=([a-z-]+)/.exec(location.search);
    if (m) setTimeout(function () { open(m[1]); }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
