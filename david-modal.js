/* Team profile pop-ups (owner, 13 Nov 2026): David Hunter's original design, used for all four. No booking button, no previous/next. Opens from [data-profile] or [data-david]. */
(function () {
  var css = `
.dm-ov,.dm-ov *{box-sizing:border-box}
.dm-x button:focus{outline:none}.dm-x button:focus-visible{outline:1px solid #F4EFE6;outline-offset:2px}
.dm-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,8,7,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s}
.dm-ov.open{opacity:1;visibility:visible;transition:opacity .35s ease}
.dm-pn{position:relative;width:min(1080px,100%);max-height:calc(100vh - 48px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:#0B0B09;border:1px solid #2A2724;color:#A79E92;font-family:'DM Sans',sans-serif;font-weight:300;transform:translateY(28px) scale(.985);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .4s ease}
.dm-ov.open .dm-pn{transform:none;opacity:1}
.dm-x{position:sticky;top:0;display:flex;justify-content:flex-end;padding:18px 18px 0;z-index:2;pointer-events:none}
.dm-x button{pointer-events:auto;width:40px;height:40px;border:1px solid #3B3730;background:#0B0B09;color:#F4EFE6;font-size:20px;line-height:1;cursor:pointer;transition:border-color .2s}
.dm-x button:hover{border-color:#F4EFE6}
.dm-in{padding:0 clamp(22px,5vw,64px) clamp(36px,5vw,64px);margin-top:-22px}
.dm-ey{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#7E766C}
.dm-h1{font-family:'Cormorant Garamond',serif;font-weight:400;color:#F4EFE6;font-size:clamp(40px,5vw,60px);line-height:1;margin:14px 0 0}
.dm-h2{font-family:'Cormorant Garamond',serif;font-weight:400;color:#F4EFE6;font-size:clamp(26px,3vw,34px);line-height:1.15;margin:12px 0 0}
.dm-hero{display:grid;grid-template-columns:1fr 240px;gap:clamp(24px,5vw,64px);align-items:center;padding-top:clamp(20px,3vw,34px)}
.dm-lede{color:#F4EFE6;font-size:17px;line-height:1.6;margin-top:22px}
.dm-p{font-size:15px;line-height:1.7;margin-top:14px}
.dm-ph{width:240px;height:300px;border:1px solid #2A2724;overflow:hidden;background:#0B0B09}
.dm-ph img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.02);display:block}
.dm-sec{margin-top:clamp(40px,5vw,60px);padding-top:clamp(32px,4vw,44px);border-top:1px solid #2A2724}
.dm-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:26px}
.dm-c{border:1px solid #2A2724;background:#0B0B09;padding:24px 22px;opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .7s cubic-bezier(.22,1,.36,1)}
.dm-ov.open .dm-c{opacity:1;transform:none}
.dm-big{font-family:'Cormorant Garamond',serif;color:#F4EFE6;font-size:42px;line-height:1}
.dm-cap{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:#7E766C;margin-top:14px;padding-bottom:14px;border-bottom:1px solid #2A2724;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dm-c p{font-size:14px;line-height:1.65;margin-top:14px}
.dm-n{font-size:10px;letter-spacing:.14em;color:#5F594F}
.dm-c h3{font-family:'Cormorant Garamond',serif;font-weight:500;color:#F4EFE6;font-size:20px;margin:10px 0 0}
.dm-fine{font-size:11px;color:#5F594F;margin-top:16px}
.dm-cta{text-align:center}
.dm-cta p{font-size:15px;margin-top:10px}
.dm-btn{display:inline-block;margin-top:24px;padding:15px 34px;background:#F4EFE6;color:#0B0B09;font-size:13px;letter-spacing:.06em;text-decoration:none;border:1px solid #F4EFE6;transition:background .2s,color .2s}
.dm-btn:hover{background:transparent;color:#F4EFE6}
html.dm-lock,html.dm-lock body{overflow:hidden}
@media(max-width:820px){.dm-hero{grid-template-columns:1fr}.dm-ph{width:170px;height:212px;order:-1}.dm-g3{grid-template-columns:1fr}.dm-ov{padding:0}.dm-pn{max-height:100vh;height:100%;border:none}}
@media(prefers-reduced-motion:reduce){.dm-ov,.dm-pn,.dm-c{transition:none!important}}
.dm-g3c{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}
`;
  var d = function (i) { return 'transition-delay:' + (0.15 + i * 0.07) + 's'; };
  function card(i, n, t, p) { return '<div class="dm-c" style="' + d(i) + '"><div class="dm-n">' + n + '</div><h3>' + t + '</h3>' + (p ? '<p>' + p + '</p>' : '') + '</div>'; }
  var P = {
    'david-hunter': { role: 'Senior Advisor', name: 'David Hunter', img: 'images/david.webp',
      text: `<p class="dm-lede">As Executive Director and Chief Investment Officer of two US public pension systems, David decided which managers received pension capital. Today he brings managers to the allocators he knows.</p>
        <p class="dm-p">Close to forty years in institutional capital, twenty-four of them in banking at HSBC, Citibank and Sumitomo, and then as Executive Director and Chief Investment Officer of the North Dakota Retirement and Investment Office and the Texas Municipal Retirement System. Named among the ISS Power 100 Chief Investment Officers in 2023.</p>
      `,
      secs: `<div class="dm-sec">
      <div class="dm-ey">The record</div>
      <div class="dm-h2">The capital David has already been trusted with.</div>
      <div class="dm-g3">
        <div class="dm-c" style="${d(0)}"><div class="dm-big">US$7B+</div><div class="dm-cap">HSBC North America</div><p>Directed more than $7B in pension assets at HSBC North America, within twenty-four years in banking at HSBC, Citibank and Sumitomo.</p></div>
        <div class="dm-c" style="${d(1)}"><div class="dm-big">US$20B</div><div class="dm-cap">North Dakota Retirement &amp; Investment Office</div><p>Grew from approximately $8 billion to nearly $20 billion across 27 portfolios, including the state's sovereign wealth fund, as Executive Director and Chief Investment Officer.</p></div>
        <div class="dm-c" style="${d(2)}"><div class="dm-big">US$40B</div><div class="dm-cap">Texas Municipal Retirement System</div><p>As Executive Director and Chief Investment Officer, led the $40 billion retirement system for Texas cities to two consecutive years of top-quartile returns, a first for the system.</p></div>
      </div>
      <p class="dm-fine">Figures reflect the prior institutional experience of David Hunter and are not transactions of Inaya Advisory.</p>
    </div>

    
    ` },
    'anas-ansar': { role: 'Managing Partner', name: 'Anas Ansar', img: 'images/anas-ansar.webp',
      text: '<p class="dm-lede">Runs each mandate from the first review of a raise to its final close, and leads senior review with David Hunter.</p><p class="dm-p">Anas comes to private markets from origination, the function most firms treat as a cost centre and he treats as the engine. Over the last five years he built and ran a systems-driven origination practice serving more than fifty companies, generating seven figures in qualified pipeline and opening direct conversations with enterprises at the scale of Boeing, Caterpillar, Panasonic and Revlon. At Inaya he directs the deck, the data room and the terms review, signs each engagement on the firm&rsquo;s behalf, and leads investor relations after the close. He trained as an electronics and communication engineer, with a marketing specialisation from the University of Illinois Urbana-Champaign.</p>',
      secs: '<div class="dm-sec"><div class="dm-ey">The record</div><div class="dm-h2">An origination practice built from the ground up.</div><div class="dm-g3">' + '<div class="dm-c" style="' + d(0) + '"><div class="dm-big">5 years</div><div class="dm-cap">Origination practice</div><p>Built and ran a systems-driven origination practice before founding Inaya.</p></div>' + '<div class="dm-c" style="' + d(1) + '"><div class="dm-big">50+</div><div class="dm-cap">Companies served</div><p>Origination programmes run for more than fifty companies.</p></div>' + '<div class="dm-c" style="' + d(2) + '"><div class="dm-big">7 figures</div><div class="dm-cap">Qualified pipeline</div><p>Direct conversations opened with enterprises at the scale of Boeing, Caterpillar, Panasonic and Revlon.</p></div>' + '</div></div>' },
    'shayan-mohammed': { role: 'Managing Director', name: 'Shayan Mohammed', img: 'images/shayan.webp',
      text: '<p class="dm-lede">Leads the growth of the firm and its investor coverage across North America, Europe and the Gulf.</p><p class="dm-p">He decides which investors each mandate reaches, and in what order, so a raise goes first to the capital most likely to commit. He also decides when the first introductions are made.</p>',
      secs: '<div class="dm-sec"><div class="dm-ey">Focus</div><div class="dm-h2">Which investors, and in what order.</div><div class="dm-g3">' + card(0, '01', 'Investor coverage', 'North America, Europe and the Gulf.') + card(1, '02', 'Sequencing', 'Which investors each mandate reaches, and in what order.') + card(2, '03', 'The firm', 'The growth of Inaya Advisory.') + '</div></div>' },
    'abbas-chothia': { role: 'Client Advisor', name: 'Abbas Chothia', img: 'images/abbas-chothia-2.webp',
      text: '<p class="dm-lede">Leads every client conversation at Inaya, from the first call through to engagement, and takes each one himself.</p><p class="dm-p">Abbas brings more than twenty years across sales, business development and building his own companies. He founded a bookkeeping and consulting practice, and as General Manager scaled two wholesale distribution businesses past US$3 million, managing B2B pipelines, supplier negotiations and more than fifty commercial accounts. Since 2019 he has collected millions of dollars across consulting, professional services and advisory. That operating background lets him speak the language of business owners, and a first conversation with Inaya is with Abbas, in confidence, on the raise, the timeline and the constraints.</p>',
      secs: '<div class="dm-sec"><div class="dm-ey">The record</div><div class="dm-h2">An operator on the other side of the table.</div><div class="dm-g3">' + '<div class="dm-c" style="' + d(0) + '"><div class="dm-big">20+ years</div><div class="dm-cap">Sales and company building</div><p>Across sales, business development and companies he founded and ran.</p></div>' + '<div class="dm-c" style="' + d(1) + '"><div class="dm-big">US$3M+</div><div class="dm-cap">Two distribution businesses</div><p>Scaled two wholesale distribution businesses past US$3 million as General Manager.</p></div>' + '<div class="dm-c" style="' + d(2) + '"><div class="dm-big">50+</div><div class="dm-cap">Commercial accounts</div><p>B2B pipelines, supplier negotiations and more than fifty commercial accounts managed.</p></div>' + '</div></div>'}
  };
  function html(id) { var p = P[id];
    return '<div class="dm-pn" role="dialog" aria-modal="true" aria-label="' + p.name + ', ' + p.role + '"><div class="dm-x"><button type="button" aria-label="Close">&times;</button></div><div class="dm-in">' +
      '<div class="dm-hero"><div><div class="dm-ey">' + p.role + '</div><div class="dm-h1">' + p.name + '.</div>' + p.text + '</div><div class="dm-ph"><img src="/' + p.img + '" alt="' + p.name + '" loading="lazy"></div></div>' +
      p.secs + '</div></div>'; }
  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var ov = document.createElement('div'); ov.className = 'dm-ov'; ov.setAttribute('data-no-eq', ''); document.body.appendChild(ov);
    var last = null;
    function open(id, e) { if (e) e.preventDefault(); if (!P[id]) id = 'david-hunter'; last = document.activeElement; ov.innerHTML = html(id);
      ov.querySelector('.dm-x button').addEventListener('click', close); ov.querySelector('.dm-pn').scrollTop = 0;
      document.documentElement.classList.add('dm-lock'); requestAnimationFrame(function () { ov.classList.add('open'); });
      setTimeout(function () { ov.querySelector('.dm-x button').focus({ preventScroll: true }); }, 50); }
    function close() { ov.classList.remove('open'); document.documentElement.classList.remove('dm-lock'); if (last && last.focus) last.focus({ preventScroll: true }); }
    document.addEventListener('click', function (e) { if (!e.target.closest) return; var t = e.target.closest('[data-profile],[data-david]'); if (t) open(t.getAttribute('data-profile') || 'david-hunter', e); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
    var m = location.search.match(/[?&]profile=([a-z-]+)/); if (m) setTimeout(function () { open(m[1]); }, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
