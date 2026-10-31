/* David Hunter profile pop-up. Opens in place from any element with data-david. */
(function () {
  var css = `
.dm-ov,.dm-ov *{box-sizing:border-box}
.dm-x button:focus{outline:none}.dm-x button:focus-visible{outline:1px solid #F4EFE6;outline-offset:2px}
.dm-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,8,7,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:24px;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility 0s linear .35s}
.dm-ov.open{opacity:1;visibility:visible;transition:opacity .35s ease}
.dm-pn{position:relative;width:min(1080px,100%);max-height:calc(100vh - 48px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;background:#121110;border:1px solid #2A2724;color:#A79E92;font-family:'DM Sans',sans-serif;font-weight:300;transform:translateY(28px) scale(.985);opacity:0;transition:transform .5s cubic-bezier(.22,1,.36,1),opacity .4s ease}
.dm-ov.open .dm-pn{transform:none;opacity:1}
.dm-x{position:sticky;top:0;display:flex;justify-content:flex-end;padding:18px 18px 0;z-index:2;pointer-events:none}
.dm-x button{pointer-events:auto;width:40px;height:40px;border:1px solid #3B3730;background:#121110;color:#F4EFE6;font-size:20px;line-height:1;cursor:pointer;transition:border-color .2s}
.dm-x button:hover{border-color:#F4EFE6}
.dm-in{padding:0 clamp(22px,5vw,64px) clamp(36px,5vw,64px);margin-top:-22px}
.dm-ey{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#7E766C}
.dm-h1{font-family:'Cormorant Garamond',serif;font-weight:400;color:#F4EFE6;font-size:clamp(40px,5vw,60px);line-height:1;margin:14px 0 0}
.dm-h2{font-family:'Cormorant Garamond',serif;font-weight:400;color:#F4EFE6;font-size:clamp(26px,3vw,34px);line-height:1.15;margin:12px 0 0}
.dm-hero{display:grid;grid-template-columns:1fr 240px;gap:clamp(24px,5vw,64px);align-items:center;padding-top:clamp(20px,3vw,34px)}
.dm-lede{color:#F4EFE6;font-size:17px;line-height:1.6;margin-top:22px}
.dm-p{font-size:15px;line-height:1.7;margin-top:14px}
.dm-ph{width:240px;height:300px;border:1px solid #2A2724;overflow:hidden;background:#1D1B18}
.dm-ph img{width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.02);display:block}
.dm-sec{margin-top:clamp(40px,5vw,60px);padding-top:clamp(32px,4vw,44px);border-top:1px solid #2A2724}
.dm-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:26px}
.dm-c{border:1px solid #2A2724;background:#161514;padding:24px 22px;opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .7s cubic-bezier(.22,1,.36,1)}
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
`;
  var book = (location.pathname.indexOf('mandateconsultation') > -1) ? '#book' : 'mandateconsultation#book';
  var d = function (i) { return 'transition-delay:' + (0.15 + i * 0.07) + 's'; };
  var html = `
<div class="dm-pn" role="dialog" aria-modal="true" aria-label="David Hunter, Senior Advisor">
  <div class="dm-x"><button type="button" aria-label="Close">&times;</button></div>
  <div class="dm-in">
    <div class="dm-hero">
      <div>
        <div class="dm-ey">Senior Advisor</div>
        <div class="dm-h1">David Hunter.</div>
        <p class="dm-lede">For most of his career, David decided which managers received pension capital. Today he brings managers to the allocators he knows.</p>
        <p class="dm-p">Nearly four decades in institutional capital, from HSBC, Citicorp and SMBC to two US public pension systems, which he served as Executive Director and Chief Investment Officer.</p>
      </div>
      <div class="dm-ph"><img src="images/david.webp" alt="David Hunter" loading="lazy"></div>
    </div>

    <div class="dm-sec">
      <div class="dm-ey">The record</div>
      <div class="dm-h2">The capital David has already been trusted with.</div>
      <div class="dm-g3">
        <div class="dm-c" style="${d(0)}"><div class="dm-big">$7B+</div><div class="dm-cap">HSBC North America</div><p>Directed more than $7B in pension assets at HSBC North America, within twenty-four years across HSBC, Citicorp and SMBC before he moved to the allocator's side.</p></div>
        <div class="dm-c" style="${d(1)}"><div class="dm-big">$20B</div><div class="dm-cap">North Dakota Retirement &amp; Investment Office</div><p>Grew from approximately $8 billion to nearly $20 billion across 27 portfolios, including the state's sovereign wealth fund, as Executive Director and Chief Investment Officer.</p></div>
        <div class="dm-c" style="${d(2)}"><div class="dm-big">$40B</div><div class="dm-cap">Texas Municipal Retirement System</div><p>As Chief Investment Officer, led the $40 billion retirement system for Texas cities to two consecutive years of top-quartile returns, a first for the system.</p></div>
      </div>
      <p class="dm-fine">Figures reflect the prior institutional experience of David Hunter and are not transactions of Inaya Advisory.</p>
    </div>

    <div class="dm-sec">
      <div class="dm-ey">Standing</div>
      <div class="dm-h2">Known on the allocator's side of the table.</div>
      <div class="dm-g3">
        <div class="dm-c" style="${d(3)}"><div class="dm-n">01</div><h3>Former CIO</h3><p>Texas Municipal Retirement System and the North Dakota Retirement and Investment Office.</p></div>
        <div class="dm-c" style="${d(4)}"><div class="dm-n">02</div><h3>ISS Power 100</h3><p>Named among the Power 100 Chief Investment Officers in 2023.</p></div>
        <div class="dm-c" style="${d(5)}"><div class="dm-n">03</div><h3>200+ CIO relationships</h3><p>Across US public pensions, consultants, endowments and family offices.</p></div>
      </div>
    </div>

    <div class="dm-sec dm-cta">
      <div class="dm-h2">The right access changes everything.</div>
      <p>If you are raising, we would like to understand the mandate.</p>
      <a class="dm-btn" href="${book}">Book the consultation</a>
    </div>
  </div>
</div>`;

  function init() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var ov = document.createElement('div'); ov.className = 'dm-ov'; ov.innerHTML = html; document.body.appendChild(ov);
    var pn = ov.querySelector('.dm-pn'), last = null;
    function open(e) { if (e) e.preventDefault(); last = document.activeElement; pn.scrollTop = 0; document.documentElement.classList.add('dm-lock'); ov.classList.add('open'); setTimeout(function () { ov.querySelector('.dm-x button').focus({ preventScroll: true }); }, 50); }
    function close() { ov.classList.remove('open'); document.documentElement.classList.remove('dm-lock'); if (last && last.focus) last.focus({ preventScroll: true }); }
    document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-david]'); if (t) open(e); });
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.dm-x button').addEventListener('click', close);
    ov.querySelector('.dm-btn').addEventListener('click', function () { close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });
    if (/[?&]profile=david-hunter\b/.test(location.search)) setTimeout(open, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
