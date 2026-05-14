/* ═══════════════════════════════════════
   NAV SCROLL
═══════════════════════════════════════ */
window.addEventListener('scroll', () =>
  document.getElementById('nav').classList.toggle('raised', scrollY > 20), { passive: true });

/* ═══════════════════════════════════════
   ORDER STATUS — reads from Firebase
   ordersOpen is set in data.js (default true)
   fetchOrderStatus() and listenOrderStatus()
   keep it in sync with Firebase in real-time.
═══════════════════════════════════════ */
function applyOrderStatus() {
  /* ── Cart footer checkout button ── */
  const cBtn = document.getElementById('checkoutBtn');
  if (cBtn) {
    if (ordersOpen) {
      cBtn.className = 'cart-cta';
      cBtn.onclick = showCo;
      cBtn.innerHTML = 'Proceed to Checkout';
    } else {
      cBtn.className = 'btn-closed';
      cBtn.onclick = null;
      cBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Restaurant is Closed';
    }
  }

  /* ── Checkout form closed banner + place order btn ── */
  const banner = document.getElementById('coBanner');
  const poBtn  = document.getElementById('placeOrderBtn');
  if (banner) banner.classList.toggle('show', !ordersOpen);
  if (poBtn) {
    if (ordersOpen) {
      poBtn.className = 'co-btn';
      poBtn.onclick = placeOrder;
      poBtn.disabled = false;
      poBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg> Place Order via WhatsApp';
    } else {
      poBtn.className = 'btn-closed';
      poBtn.onclick = null;
      poBtn.disabled = true;
      poBtn.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> Orders Currently Closed';
    }
  }

  /* ── Floating cart bar closed badge ── */
  const fb = document.getElementById('fbar');
  if (fb) {
    let badge = document.getElementById('fbar-closed');
    if (!ordersOpen) {
      if (!badge) {
        badge = document.createElement('div');
        badge.id = 'fbar-closed';
        badge.className = 'fbar-closed-badge';
        badge.textContent = 'Closed';
        fb.appendChild(badge);
      }
    } else {
      if (badge) badge.remove();
    }
  }
}

/* ── Fetch open/closed status from Firebase once on load ── */
async function fetchOrderStatus() {
  try {
    const res  = await fetch(FB + '/status/open.json');
    const data = await res.json();
    ordersOpen = data !== false; /* null = not set yet = open */
  } catch(e) {
    ordersOpen = true;
  }
  applyOrderStatus();
}

/* ── Real-time listener — updates all customer browsers instantly
      when kitchen toggles open/closed ── */
function listenOrderStatus() {
  const es = new EventSource(FB + '/status/open.json');
  es.addEventListener('put', e => {
    const payload = JSON.parse(e.data);
    ordersOpen = payload.data !== false;
    applyOrderStatus();
  });
  es.onerror = () => {
    es.close();
    setTimeout(listenOrderStatus, 10000);
  };
}

/* ═══════════════════════════════════════
   PAGE NAV
═══════════════════════════════════════ */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('on');
    p.setAttribute('aria-hidden', 'true');
  });
  const target = document.getElementById(id);
  target.classList.add('on');
  target.removeAttribute('aria-hidden');
  scrollTo(0, 0);
}
function goHome() { showPage('home'); }
function goMenu() { showPage('menuPg'); buildMenuUI(); }
function scrollGal() { document.getElementById('galSec').scrollIntoView({ behavior: 'smooth' }); }

/* ═══════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════ */
function buildDots() {
  const w = document.getElementById('cDots'); w.innerHTML = '';
  for (let i = 0; i < SLIDES; i++) {
    const d = document.createElement('div');
    d.className = 'c-dot' + (i === 0 ? ' on' : '');
    d.onclick = () => goSlide(i); w.appendChild(d);
  }
}
function goSlide(n) {
  document.querySelectorAll('.c-slide').forEach((s,i) => s.classList.toggle('on', i===n));
  document.querySelectorAll('.c-dot').forEach((d,i) => d.classList.toggle('on', i===n));
  slideIdx = n;
}
function shiftSlide(d) { slideIdx = (slideIdx + d + SLIDES) % SLIDES; goSlide(slideIdx); resetTimer(); }
function resetTimer() { clearInterval(slideTimer); slideTimer = setInterval(() => shiftSlide(1), 5200); }

/* ═══════════════════════════════════════
   FEATURED WHEEL (Specialities)
═══════════════════════════════════════ */
function initFeatWheel() {
  const host = document.getElementById('feat-whl-host');
  if (!host) return;
  buildWheel(host, FEATURED, "Chef's Pick", 'var(--p)', 'fw');
}

/* ═══════════════════════════════════════
   MENU UI
═══════════════════════════════════════ */
function buildMenuUI() { buildSidebar(); buildTabs(); renderCat(); }

function buildSidebar() {
  document.getElementById('mSide').innerHTML =
    `<div class="sb-head">Categories</div>` +
    Object.keys(MENU).map(c => `
      <button class="sb-btn${c===activeCat?' on':''}" onclick="switchCat('${c}')">
        <span>${c}</span><span class="sb-ct">${MENU[c].length}</span>
      </button>`).join('');
}

function buildTabs() {
  const wrap = document.getElementById('mTabs');
  wrap.querySelectorAll('.tab-btn').forEach(b => b.remove());
  Object.keys(MENU).forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (c === activeCat ? ' on' : '');
    btn.textContent = c;
    btn.onclick = () => switchCat(c);
    wrap.appendChild(btn);
  });
  requestAnimationFrame(slidePill);
}

function slidePill() {
  const a = document.querySelector('.tab-btn.on');
  const s = document.getElementById('tPill');
  if (a && s) { s.style.left = a.offsetLeft + 'px'; s.style.width = a.offsetWidth + 'px'; }
}

function switchCat(c) {
  activeCat = c; searchMode = false;
  document.getElementById('sInput').value = '';
  buildSidebar(); buildTabs(); renderCat();
  const a = document.querySelector('.tab-btn.on');
  if (a) a.scrollIntoView({ inline: 'center', behavior: 'smooth' });
  scrollTo({ top: 280, behavior: 'smooth' });
}

let menuWheelCounter = 0;
function renderCat() {
  const items = MENU[activeCat];
  const col = CAT_COLORS[activeCat] || 'var(--p)';
  const content = document.getElementById('mContent');
  const uid = 'mw' + (++menuWheelCounter);

  content.innerHTML = `
    <div class="mcat-wrap">
      <div class="mcat-hdr">
        <div class="mcat-title" style="color:${col}">${activeCat}</div>
        <div class="mcat-line"></div>
        <div class="mcat-count">${items.length} dishes</div>
      </div>
      <div id="${uid}_host"></div>
    </div>`;

  buildWheel(document.getElementById(`${uid}_host`), items, activeCat, col, uid);
}

/* ─── SEARCH ─────────────────────── */
function doSearch(q) {
  const query = q.trim().toLowerCase();
  if (!query) { searchMode = false; renderCat(); return; }
  searchMode = true;
  const res = [];
  Object.entries(MENU).forEach(([cat, items]) =>
    items.forEach(item => { if (item.name.toLowerCase().includes(query)) res.push({...item, cat}); })
  );
  const content = document.getElementById('mContent');
  if (!res.length) {
    content.innerHTML = `<div class="no-res">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <p>No results for "${q}"</p></div>`;
    return;
  }
  const uid = 'sw' + (++menuWheelCounter);
  content.innerHTML = `
    <div class="mcat-wrap">
      <div class="mcat-hdr">
        <div class="mcat-title">Search: <em>${q}</em></div>
        <div class="mcat-line"></div>
        <div class="mcat-count">${res.length} found</div>
      </div>
      <div id="${uid}_host"></div>
    </div>`;
  buildWheel(document.getElementById(`${uid}_host`), res, 'Search Result', 'var(--p)', uid);
}

/* ═══════════════════════════════════════
   ITEM MODAL
═══════════════════════════════════════ */
function openModal(id, name, price, cat) {
  selItem = {id, name, price, cat}; selQty = 1;
  document.getElementById('mImg').src = getImg(name);
  document.getElementById('mCat').textContent = cat || activeCat;
  document.getElementById('mName').textContent = name;
  document.getElementById('mPrice').textContent = '\u20B9' + price;
  document.getElementById('qVal').textContent = '1';
  const sbW = window.innerWidth - document.documentElement.clientWidth;
  const navBase = window.innerWidth <= 640 ? 16 : 32;
  document.body.style.paddingRight = sbW + 'px';
  document.getElementById('nav').style.paddingRight = (navBase + sbW) + 'px';
  document.body.classList.add('scroll-locked');
  document.getElementById('itemOv').classList.add('on');
}
function closeModal(e) {
  if (e.target.id === 'itemOv') {
    document.getElementById('itemOv').classList.remove('on');
    document.body.style.paddingRight = '';
    document.getElementById('nav').style.paddingRight = '';
    document.body.classList.remove('scroll-locked');
  }
}
function adjQty(d) { selQty = Math.max(1, selQty + d); document.getElementById('qVal').textContent = selQty; }
function addToCart() {
  const ex = cart.find(c => c.id === selItem.id);
  if (ex) ex.qty += selQty; else cart.push({...selItem, qty: selQty});
  save(); refreshCart();
  document.getElementById('itemOv').classList.remove('on');
  document.body.style.paddingRight = '';
  document.getElementById('nav').style.paddingRight = '';
  document.body.classList.remove('scroll-locked');
  toast('Added to cart');
}

/* ═══════════════════════════════════════
   CART
═══════════════════════════════════════ */
function save() { localStorage.setItem('annamay5', JSON.stringify(cart)); }

function refreshCart() {
  const subtotal = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  const total = subtotal + cgst + sgst;
  const count = cart.reduce((s,c) => s+c.qty, 0);

  /* Float bar */
  const fb = document.getElementById('fbar');
  if (count) {
    fb.classList.add('up');
    document.getElementById('fbCount').textContent = count + ' item' + (count>1?'s':'');
    document.getElementById('fbPrice').textContent = '\u20B9' + total;
  } else fb.classList.remove('up');

  /* Nav chip */
  const chip = document.getElementById('nav-chip');
  if (count) {
    chip.textContent = count; chip.style.display = 'inline-block';
    chip.classList.add('pop'); setTimeout(() => chip.classList.remove('pop'), 400);
    document.getElementById('nav-lbl').textContent = '\u20B9' + total;
  } else {
    chip.style.display = 'none';
    document.getElementById('nav-lbl').textContent = 'Cart';
  }

  /* Tax rows */
  const sub    = document.getElementById('cSubtotal');
  const cgstEl = document.getElementById('cCgst');
  const sgstEl = document.getElementById('cSgst');
  if (sub)    sub.textContent    = '\u20B9' + subtotal;
  if (cgstEl) cgstEl.textContent = '\u20B9' + cgst;
  if (sgstEl) sgstEl.textContent = '\u20B9' + sgst;

  /* Total */
  const tv = document.getElementById('cTotal');
  tv.textContent = '\u20B9' + total;
  tv.classList.add('bump'); setTimeout(() => tv.classList.remove('bump'), 400);

  /* Body */
  const body = document.getElementById('cBody');
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">
      <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
      <p>Your cart is empty</p><small>Add something delicious</small></div>`;
  } else {
    body.innerHTML = cart.map(c => `
      <div class="c-row">
        <img class="c-row-img" src="${getImg(c.name)}" alt="${c.name}" loading="lazy">
        <div class="c-row-info">
          <div class="c-row-nm">${c.name}</div>
          <div class="c-row-pr">\u20B9${c.price} \xD7 ${c.qty} = \u20B9${c.price*c.qty}</div>
        </div>
        <div class="c-ctrl">
          <button class="cc-b" onclick="chgQty('${c.id}',-1)">\u2212</button>
          <span class="cc-n">${c.qty}</span>
          <button class="cc-b" onclick="chgQty('${c.id}',1)">+</button>
        </div>
      </div>`).join('');
  }
}

function chgQty(id, d) {
  const c = cart.find(x => x.id===id); if (!c) return;
  c.qty += d; if (c.qty <= 0) cart = cart.filter(x => x.id!==id);
  save(); refreshCart();
}

function openCart() {
  const sbW = window.innerWidth - document.documentElement.clientWidth;
  const navBase = window.innerWidth <= 640 ? 16 : 32;
  document.body.style.paddingRight = sbW + 'px';
  document.getElementById('nav').style.paddingRight = (navBase + sbW) + 'px';
  document.body.classList.add('scroll-locked');
  document.getElementById('cDr').classList.add('open');
  document.getElementById('cBd').classList.add('on');
  document.getElementById('cItemsV').style.display = 'flex';
  document.getElementById('coView').classList.remove('on');
  applyOrderStatus();
}
function closeCart() {
  const dr = document.getElementById('cDr');
  dr.classList.add('closing');
  dr.classList.remove('open');
  document.getElementById('cBd').classList.remove('on');
  setTimeout(() => {
    dr.classList.remove('closing');
    document.body.style.paddingRight = '';
    document.getElementById('nav').style.paddingRight = '';
    document.body.classList.remove('scroll-locked');
  }, 300);
}
function showCo() {
  document.getElementById('cItemsV').style.display = 'none';
  document.getElementById('coView').classList.add('on');
}
function backCart() {
  document.getElementById('cItemsV').style.display = 'flex';
  document.getElementById('coView').classList.remove('on');
}

/* ═══════════════════════════════════════
   PHONE VALIDATION
═══════════════════════════════════════ */
function validatePhone(input) {
  const val = input.value.replace(/\D/g,'');
  input.value = val;
  const err = document.getElementById('phoneErr');
  if (val.length === 10 && /^[6-9]/.test(val)) {
    err.style.display = 'none';
    input.style.borderColor = 'var(--p)';
  } else if (val.length > 0) {
    err.style.display = 'block';
    input.style.borderColor = '#e53e3e';
  } else {
    err.style.display = 'none';
    input.style.borderColor = '';
  }
}

/* ═══════════════════════════════════════
   LOCATION SHARING
═══════════════════════════════════════ */
let sharedLocationUrl = '';
let _orderInProgress  = false; /* rate-limit guard — prevents double submission */

function shareLocation() {
  const btn    = document.getElementById('locBtn');
  const txt    = document.getElementById('locBtnTxt');
  const status = document.getElementById('locStatus');
  if (!navigator.geolocation) {
    btn.classList.add('err');
    txt.textContent = 'Location not supported';
    return;
  }
  txt.textContent = 'Getting location...';
  btn.classList.remove('got','err');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      sharedLocationUrl = 'https://maps.google.com/?q=' + lat + ',' + lng;
      txt.textContent = 'Location captured!';
      btn.classList.add('got');
      status.style.display = 'block';
      status.textContent = 'Lat: ' + lat.toFixed(5) + ', Lng: ' + lng.toFixed(5);
      toast('Location captured!');
    },
    () => {
      btn.classList.add('err');
      txt.textContent = 'Could not get location';
      status.style.display = 'block';
      status.textContent = 'You can still place the order without location.';
      sharedLocationUrl = '';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/* ═══════════════════════════════════════
   FORMSPREE — BACKGROUND EMAIL
═══════════════════════════════════════ */
function sendOrderToFormspree(order) {
  const itemLines = order.items
    .map(i => i.name + ' x' + i.qty + ' = Rs.' + (i.price * i.qty))
    .join('\n');

  const locationLine = sharedLocationUrl
    ? '\nDelivery Location (Maps): ' + sharedLocationUrl
    : '';

  const emailBody =
    'ORDER ID: '  + order.id   + '\n' +
    'Time: '      + order.time + '\n\n' +
    '--- CUSTOMER ---\n' +
    'Name: '      + order.customer.name    + '\n' +
    'Phone: +91 ' + order.customer.phone   + '\n' +
    'Address: '   + order.customer.address +
    locationLine  + '\n\n' +
    '--- ITEMS ---\n' + itemLines + '\n\n' +
    '--- BILL ---\n' +
    'Subtotal : Rs.' + order.subtotal + '\n' +
    'CGST 2.5%: Rs.' + order.cgst    + '\n' +
    'SGST 2.5%: Rs.' + order.sgst    + '\n' +
    'Grand Total: Rs.' + order.total;

  fetch('https://formspree.io/f/xaqvpqlg', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify({ _subject: 'Order ' + order.id, message: emailBody })
  }).catch(() => {});
}

/* ═══════════════════════════════════════
   ORDER
   Three fixes applied here vs the old code:

   1. _orderInProgress guard — the very first
      thing checked. Rapid double-clicks are
      dropped before touching Firebase or
      Formspree, so no duplicate orders appear
      in the kitchen dashboard or your inbox.

   2. WhatsApp URL built with encodeURIComponent
      on the full plain-text message. Dish names
      like "Mac & Cheese", "Hot & Sour Soup",
      "Corn & Mushroom Fried Rice" contain literal
      & characters which were silently breaking the
      URL — WhatsApp received nothing or a cut-off
      message. encodeURIComponent converts & to
      %26, keeping the URL intact.

   3. window.location.href instead of
      window.open('...', '_blank'). Mobile browsers
      treat window.open with _blank as a popup and
      block it, especially after any async work.
      location.href is never blocked and correctly
      triggers the WhatsApp app deep link on mobile.
═══════════════════════════════════════ */
function placeOrder() {
  /* Drop double-clicks before any side-effects */
  if (_orderInProgress) return;

  if (!ordersOpen) { toast('Sorry, we are currently closed'); return; }

  const name  = document.getElementById('oName').value.trim();
  const phone = document.getElementById('oPhone').value.trim();
  const addr  = document.getElementById('oAddr').value.trim();

  if (!name)  { toast('Please enter your name'); return; }
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    toast('Enter a valid Indian mobile number (starts with 6-9)'); return;
  }
  if (!addr)  { toast('Please enter your delivery address'); return; }

  /* Lock after all validations pass */
  _orderInProgress = true;
  const poBtnEl = document.getElementById('placeOrderBtn');
  if (poBtnEl) poBtnEl.disabled = true;

  const subtotal = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const cgst  = Math.round(subtotal * 0.025);
  const sgst  = Math.round(subtotal * 0.025);
  const total = subtotal + cgst + sgst;
  const id    = 'ORD-' + Date.now().toString(36).toUpperCase();
  const now   = new Date();

  const order = {
    id,
    customer: { name, phone, address: addr },
    items:    cart.map(c => ({...c})),
    subtotal, cgst, sgst, total,
    status:   'new',
    placedAt: now.toISOString(),
    time:     now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })
  };

  /* 1. Save to Firebase — kitchen dashboard reads this */
  fetch(FB + '/orders.json', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(order)
  }).catch(() => {});

  /* 2. Save to customer order history */
  if (typeof window.saveOrderToHistory === 'function') window.saveOrderToHistory(order);

  /* 3. Background email via Formspree */
  sendOrderToFormspree(order);

  /* 4. Build WhatsApp message
        Plain text first, then encodeURIComponent
        the whole thing — no partial encoding. */
  const sep = '\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500';

  const waItemLines = cart.map(c =>
    '  \u2022 ' + c.name + ' x' + c.qty + ' = Rs.' + (c.price * c.qty)
  ).join('\n');

  let waText =
    '\uD83C\uDF7D\uFE0F *New Order -- ' + id + '*\n' +
    sep + '\n' +
    '*Items:*\n' + waItemLines + '\n' +
    sep + '\n' +
    'Subtotal  :  Rs.' + subtotal + '\n' +
    'CGST 2.5% :  Rs.' + cgst    + '\n' +
    'SGST 2.5% :  Rs.' + sgst    + '\n' +
    sep + '\n' +
    '*Grand Total  :  Rs.' + total + '*\n' +
    sep + '\n' +
    '\uD83D\uDC64 *Customer:* '  + name  + '\n' +
    '\uD83D\uDCDE *Phone:* +91 ' + phone + '\n' +
    '\uD83C\uDFE0 *Address:* '   + addr;

  if (sharedLocationUrl) {
    waText += '\n\uD83D\uDCCD *Location:* ' + sharedLocationUrl;
  }

  const waUrl = 'https://wa.me/917523992202?text=' + encodeURIComponent(waText);

  /* 5. Clear cart and reset form */
  cart = []; sharedLocationUrl = '';
  save(); refreshCart();
  ['oName','oPhone','oAddr'].forEach(i => document.getElementById(i).value = '');
  const btn       = document.getElementById('locBtn');
  const txt       = document.getElementById('locBtnTxt');
  const locStatus = document.getElementById('locStatus');
  if (btn)       btn.classList.remove('got','err');
  if (txt)       txt.textContent = 'Share My Location';
  if (locStatus) locStatus.style.display = 'none';
  closeCart();
  toast('Order sent via WhatsApp!');

  /* 6. Open WhatsApp
        location.href is used — never blocked by
        browsers. Unlocks after 4 s so the user
        can place another order if they return. */
  const openWA = () => {
    window.location.href = waUrl;
    setTimeout(() => { _orderInProgress = false; }, 4000);
  };

  if (typeof window.triggerInstallPrompt === 'function') {
    window.triggerInstallPrompt(openWA);
  } else {
    openWA();
  }
}

/* ═══════════════════════════════════════
   TOAST
═══════════════════════════════════════ */
let tTimer;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(tTimer); tTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function call() { location.href = 'tel:+917523992202'; }

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
(function initAria() {
  document.querySelectorAll('.page:not(#home)').forEach(p =>
    p.setAttribute('aria-hidden', 'true')
  );
})();

buildDots();
resetTimer();
initFeatWheel();
refreshCart();
fetchOrderStatus();    /* fetch open/closed once from Firebase */
listenOrderStatus();   /* then keep listening for real-time changes */

/* ═══════════════════════════════════════
   FOOTER — HOURS + COPYRIGHT
═══════════════════════════════════════ */
function updateFooterStatus() {
  const now  = new Date();
  const day  = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  let openMin, closeMin;
  if (day === 0)      { openMin = 9*60;  closeMin = 22*60; }
  else if (day === 6) { openMin = 8*60;  closeMin = 23*60; }
  else                { openMin = 8*60;  closeMin = 22*60; }

  const isOpen = mins >= openMin && mins < closeMin;

  document.querySelectorAll('.footer-hours-row').forEach(row => {
    const d = row.getAttribute('data-day');
    const isToday =
      (d === '0'       && day === 0) ||
      (d === '6'       && day === 6) ||
      (d === 'weekday' && day >= 1 && day <= 5);
    row.classList.toggle('today', isToday);
  });

  const openHTML = isOpen
    ? `<span style="font-size:11px;color:var(--a);font-weight:700;">&#9679; We\u2019re Open Now!</span>
       <p style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;">Dine-in &amp; Delivery available</p>`
    : `<span style="font-size:11px;color:#f87171;font-weight:700;">&#9679; Currently Closed</span>
       <p style="font-size:11px;color:rgba(255,255,255,.4);margin-top:4px;">We\u2019ll be back soon \u2014 see hours above</p>`;

  const badgeStyle = isOpen
    ? 'background:rgba(43,191,155,.1);border:1px solid rgba(43,191,155,.2);'
    : 'background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2);';

  ['openStatusBadge1','openStatusBadge2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.cssText = badgeStyle; el.innerHTML = openHTML; }
  });

  const copy = '\u00A9 ' + now.getFullYear() + ' Annamay Restaurant &amp; Bakery. All rights reserved.';
  ['copyrightLine1','copyrightLine2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = copy;
  });
}

/* ═══════════════════════════════════════
   CART FOCUS TRAP
═══════════════════════════════════════ */
(function initCartFocusTrap() {
  const FOCUSABLE = 'a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex="-1"])';

  document.addEventListener('keydown', e => {
    const dr = document.getElementById('cDr');
    if (!dr || !dr.classList.contains('open')) return;
    if (e.key !== 'Tab') {
      if (e.key === 'Escape') closeCart();
      return;
    }
    const nodes = [...dr.querySelectorAll(FOCUSABLE)].filter(n => !n.closest('[aria-hidden="true"]'));
    if (!nodes.length) return;
    const first = nodes[0], last = nodes[nodes.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  const origOpen = window.openCart;
  window.openCart = function() {
    origOpen();
    requestAnimationFrame(() => {
      const dr    = document.getElementById('cDr');
      const first = dr && dr.querySelector(FOCUSABLE);
      if (first) first.focus();
    });
  };
})();

updateFooterStatus();
setInterval(updateFooterStatus, 60000);

/* ═══════════════════════════════════════
   GLOBAL EXPORTS — used by pwa.js
═══════════════════════════════════════ */
window.cart        = cart;
window.save        = save;
window.refreshCart = refreshCart;
window.toast       = toast;
window.openCart    = openCart;
