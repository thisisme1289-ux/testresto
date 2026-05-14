/* ═══════════════════════════════════════
   NAV SCROLL
═══════════════════════════════════════ */
window.addEventListener('scroll', () =>
  document.getElementById('nav').classList.toggle('raised', scrollY > 20), { passive: true });

const CUSTOMER_PROFILE_KEY = 'annamay_customer_profile_v1';
const TRACKING_LINKS_KEY = 'annamay_tracking_links_v1';
const RESTAURANT_LOCATION = { lat: 25.5066, lng: 81.8676 };
const MAX_DELIVERY_KM = 10;
let fulfillmentMode = 'delivery';
let estimatedDeliveryFee = 0;

function getSavedCustomerProfile() {
  try { return JSON.parse(localStorage.getItem(CUSTOMER_PROFILE_KEY) || '{}'); }
  catch { return {}; }
}

function saveCustomerProfile(profile) {
  localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(profile));
}

function fillSavedCustomerProfile() {
  const profile = getSavedCustomerProfile();
  const name = document.getElementById('oName');
  const phone = document.getElementById('oPhone');
  const addr = document.getElementById('oAddr');
  if (name && profile.name && !name.value) name.value = profile.name;
  if (phone && profile.phone && !phone.value) phone.value = profile.phone;
  if (addr && profile.address && !addr.value) addr.value = profile.address;
}

function setFulfillmentMode(mode) {
  fulfillmentMode = mode === 'pickup' ? 'pickup' : 'delivery';
  document.getElementById('deliveryModeBtn')?.classList.toggle('on', fulfillmentMode === 'delivery');
  document.getElementById('pickupModeBtn')?.classList.toggle('on', fulfillmentMode === 'pickup');
  const title = document.getElementById('coTitle');
  const addressField = document.getElementById('addressField');
  const locBtn = document.getElementById('locBtn');
  const locStatus = document.getElementById('locStatus');
  const mapPicker = document.getElementById('mapPicker');
  if (title) title.textContent = fulfillmentMode === 'pickup' ? 'Pickup Details' : 'Delivery Details';
  if (addressField) addressField.style.display = fulfillmentMode === 'pickup' ? 'none' : '';
  if (locBtn) locBtn.style.display = fulfillmentMode === 'pickup' ? 'none' : 'flex';
  if (locStatus && fulfillmentMode === 'pickup') locStatus.style.display = 'none';
  if (mapPicker) mapPicker.style.display = fulfillmentMode === 'pickup' ? 'none' : '';
  if (fulfillmentMode === 'pickup') estimatedDeliveryFee = 0;
  refreshCart();
}

function rememberTrackingLink(order) {
  if (!order || !order.trackingUrl) return;
  let links = [];
  try { links = JSON.parse(localStorage.getItem(TRACKING_LINKS_KEY) || '[]'); }
  catch { links = []; }
  links.unshift({
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    trackingUrl: order.trackingUrl,
    total: order.total,
    createdAt: new Date().toISOString()
  });
  localStorage.setItem(TRACKING_LINKS_KEY, JSON.stringify(links.slice(0, 10)));
}

async function syncMenuFromFirestore() {
  if (!window.CustomerBackend || typeof window.CustomerBackend.getMenuCatalog !== 'function') return;
  const catalog = await window.CustomerBackend.getMenuCatalog();
  if (!catalog || !catalog.menu || !Object.keys(catalog.menu).length) return;
  Object.keys(MENU).forEach(key => delete MENU[key]);
  Object.entries(catalog.menu).forEach(([category, items]) => {
    MENU[category] = items.filter(item => item.isAvailable !== false);
  });
  Object.assign(IMGS, catalog.images || {});
  activeCat = Object.keys(MENU)[0] || activeCat;
  buildCats();
  if (document.getElementById('menuPg')?.classList.contains('on')) buildMenuUI();
}

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
      poBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:6px"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18"/><path d="M7 15h4"/></svg> Pay Securely';
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
    if (window.CustomerBackend) {
      const settings = await window.CustomerBackend.getRestaurantSettings();
      ordersOpen = settings.acceptingOrders !== false && settings.isOpen !== false;
    }
  } catch(e) {
    ordersOpen = true;
  }
  applyOrderStatus();
}

/* ── Real-time listener — updates all customer browsers instantly
      when kitchen toggles open/closed ── */
function listenOrderStatus() {
  if (!window.CustomerBackend) return;
  window.CustomerBackend.subscribeRestaurantSettings(settings => {
    ordersOpen = settings.acceptingOrders !== false && settings.isOpen !== false;
    applyOrderStatus();
  });
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
function save() { localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)); }

function distanceKm(from, to) {
  const toRad = value => value * Math.PI / 180;
  const earthKm = 6371;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
    Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deliveryFeeForDistance(km) {
  if (km <= 1) return 10;
  if (km <= 2) return 20;
  if (km <= 3) return 25;
  if (km <= 4) return 30;
  if (km <= MAX_DELIVERY_KM) return 35;
  return null;
}

function refreshCart() {
  const subtotal = cart.reduce((s,c) => s+c.price*c.qty, 0);
  const cgst = Math.round(subtotal * 0.025);
  const sgst = Math.round(subtotal * 0.025);
  const deliveryFee = fulfillmentMode === 'delivery' ? estimatedDeliveryFee : 0;
  const total = subtotal + cgst + sgst + deliveryFee;
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
  const deliveryEl = document.getElementById('cDelivery');
  if (sub)    sub.textContent    = '\u20B9' + subtotal;
  if (cgstEl) cgstEl.textContent = '\u20B9' + cgst;
  if (sgstEl) sgstEl.textContent = '\u20B9' + sgst;
  if (deliveryEl) {
    deliveryEl.textContent = fulfillmentMode === 'pickup'
      ? '\u20B90'
      : (sharedLocationUrl ? '\u20B9' + deliveryFee : 'Share location');
  }

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
  setFulfillmentMode(fulfillmentMode);
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
let pendingLocationUrl = '';
let sharedLocation = null;
let pendingLocation = null;
let _orderInProgress  = false; /* rate-limit guard — prevents double submission */

function setMapPreview(lat, lng) {
  const mapPicker = document.getElementById('mapPicker');
  const mapFrame = document.getElementById('mapFrame');
  if (!mapPicker || !mapFrame) return;
  const point = { lat: Number(lat), lng: Number(lng) };
  const km = distanceKm(RESTAURANT_LOCATION, point);
  const fee = deliveryFeeForDistance(km);
  pendingLocation = { ...point, distanceKm: km, deliveryFee: fee };
  pendingLocationUrl = `https://maps.google.com/?q=${point.lat},${point.lng}`;
  mapPicker.classList.add('on', 'expanded', 'ready');
  mapFrame.innerHTML = `<iframe title="Selected delivery location" loading="lazy" src="https://maps.google.com/maps?q=${point.lat},${point.lng}&z=17&output=embed"></iframe>`;
}

function shareLocation() {
  const btn    = document.getElementById('locBtn');
  const txt    = document.getElementById('locBtnTxt');
  const status = document.getElementById('locStatus');
  const mapPicker = document.getElementById('mapPicker');
  if (!navigator.geolocation) {
    btn.classList.add('err');
    txt.textContent = 'Location not supported';
    return;
  }
  estimatedDeliveryFee = 0;
  sharedLocation = null;
  sharedLocationUrl = '';
  refreshCart();
  txt.textContent = 'Allow location access...';
  btn.classList.remove('got','err');
  if (mapPicker) mapPicker.classList.add('on', 'expanded');
  if (status) {
    status.style.display = 'block';
    status.textContent = 'Please allow location permission in your browser.';
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      setMapPreview(lat.toFixed(6), lng.toFixed(6));
      txt.textContent = 'Location found';
      status.style.display = 'block';
      if (pendingLocation.deliveryFee === null) {
        status.textContent = `This location is ${pendingLocation.distanceKm.toFixed(1)} km away. Delivery is available only within ${MAX_DELIVERY_KM} km.`;
        toast('Location is outside delivery range.');
      } else {
        status.textContent = `Confirm below. Distance ${pendingLocation.distanceKm.toFixed(1)} km, delivery charge \u20B9${pendingLocation.deliveryFee}.`;
        toast('Location found. Please confirm it.');
      }
    },
    () => {
      btn.classList.add('err');
      txt.textContent = 'Could not get location';
      status.style.display = 'block';
      status.textContent = 'You can still place the order without location.';
      if (mapPicker) mapPicker.classList.remove('expanded', 'ready');
      pendingLocationUrl = '';
      pendingLocation = null;
      sharedLocationUrl = '';
      sharedLocation = null;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function confirmSharedLocation() {
  const btn = document.getElementById('locBtn');
  const txt = document.getElementById('locBtnTxt');
  const status = document.getElementById('locStatus');
  if (!pendingLocationUrl) {
    toast('Please share your location first.');
    return;
  }
  sharedLocationUrl = pendingLocationUrl;
  sharedLocation = pendingLocation;
  if (sharedLocation && sharedLocation.deliveryFee === null) {
    toast('Sorry, delivery is available only within 10 km.');
    sharedLocation = null;
    sharedLocationUrl = '';
    estimatedDeliveryFee = 0;
    refreshCart();
    return;
  }
  estimatedDeliveryFee = sharedLocation ? sharedLocation.deliveryFee : 0;
  if (btn) btn.classList.add('got');
  if (txt) txt.textContent = 'Location confirmed';
  if (status) {
    status.style.display = 'block';
    status.textContent = `Location fixed. Distance ${sharedLocation.distanceKm.toFixed(1)} km, delivery charge \u20B9${estimatedDeliveryFee}.`;
  }
  refreshCart();
  toast('Location confirmed');
}

function clearSharedLocation() {
  const btn = document.getElementById('locBtn');
  const txt = document.getElementById('locBtnTxt');
  const status = document.getElementById('locStatus');
  const mapPicker = document.getElementById('mapPicker');
  const mapFrame = document.getElementById('mapFrame');
  pendingLocationUrl = '';
  sharedLocationUrl = '';
  pendingLocation = null;
  sharedLocation = null;
  estimatedDeliveryFee = 0;
  if (btn) btn.classList.remove('got', 'err');
  if (txt) txt.textContent = 'Share My Location';
  if (status) status.style.display = 'none';
  if (mapPicker) mapPicker.classList.remove('on', 'expanded', 'ready');
  if (mapFrame) mapFrame.innerHTML = '<div class="map-placeholder">Location map preview</div>';
  refreshCart();
}

async function placeOrder() {
  if (_orderInProgress) return;

  if (!ordersOpen) { toast('Sorry, we are currently closed'); return; }
  if (!cart.length) { toast('Your cart is empty'); return; }
  if (!window.CustomerBackend) { toast('Ordering is still loading. Please try again.'); return; }

  const name  = document.getElementById('oName').value.trim();
  const phone = document.getElementById('oPhone').value.trim();
  const addr  = document.getElementById('oAddr').value.trim();

  if (!name)  { toast('Please enter your name'); return; }
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    toast('Enter a valid Indian mobile number (starts with 6-9)'); return;
  }
  if (fulfillmentMode === 'delivery' && !addr)  { toast('Please enter your delivery address'); return; }
  if (fulfillmentMode === 'delivery' && (!sharedLocationUrl || !sharedLocation)) {
    toast('Please share and confirm your delivery location');
    return;
  }
  if (fulfillmentMode === 'delivery' && sharedLocation.distanceKm > MAX_DELIVERY_KM) {
    toast('Sorry, delivery is available only within 10 km');
    return;
  }

  _orderInProgress = true;
  const poBtnEl = document.getElementById('placeOrderBtn');
  if (poBtnEl) {
    poBtnEl.disabled = true;
    poBtnEl.textContent = 'Preparing payment...';
  }

  try {
    saveCustomerProfile({ name, phone, address: addr });
    await window.CustomerBackend.upsertCustomerProfile({
      name,
      phone,
      defaultAddress: fulfillmentMode === 'delivery' ? addr : ''
    });

    const checkout = await window.CustomerBackend.createRazorpayOrder({
      fulfillmentMode,
      customer: {
        name,
        phone,
        address: fulfillmentMode === 'delivery' ? addr : '',
        locationUrl: fulfillmentMode === 'delivery' ? sharedLocationUrl : '',
        location: fulfillmentMode === 'delivery' ? {
          lat: sharedLocation.lat,
          lng: sharedLocation.lng
        } : null
      },
      items: cart.map(c => ({ itemId: c.id, name: c.name, qty: c.qty })),
      source: 'web'
    });

    const verifiedOrder = await window.CustomerBackend.openRazorpayCheckout(checkout, {
      name,
      phone,
      email: ''
    });

    cart = [];
    sharedLocationUrl = '';
    pendingLocationUrl = '';
    sharedLocation = null;
    pendingLocation = null;
    estimatedDeliveryFee = 0;
    save();
    refreshCart();
    rememberTrackingLink(verifiedOrder);
    resetCheckoutForm();
    closeCart();
    showOrderSuccess(verifiedOrder);
  } catch (err) {
    console.error(err);
    toast(err && err.message ? err.message : 'Payment could not be completed');
  } finally {
    _orderInProgress = false;
    if (poBtnEl) {
      poBtnEl.disabled = false;
      applyOrderStatus();
    }
  }
}

function resetCheckoutForm() {
  const btn = document.getElementById('locBtn');
  const txt = document.getElementById('locBtnTxt');
  const locStatus = document.getElementById('locStatus');
  clearSharedLocation();
  if (btn) btn.classList.remove('got','err');
  if (txt) txt.textContent = 'Share My Location';
  if (locStatus) locStatus.style.display = 'none';
  setFulfillmentMode('delivery');
}

function showOrderSuccess(order) {
  const existing = document.getElementById('orderSuccessModal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'orderSuccessModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center;padding:18px;';
  const modeText = order.fulfillmentMode === 'pickup' ? 'Pickup order' : 'Delivery order';
  const totalText = order.total ? `&#8377;${order.total}` : '';
  modal.innerHTML = `
    <div style="width:100%;max-width:460px;background:#fff;border-radius:22px;padding:24px;color:#1a1916;box-shadow:0 24px 80px rgba(0,0,0,.35)">
      <div style="font-size:13px;font-weight:800;color:#1f7a63;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Order confirmed</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;margin-bottom:8px">${order.orderNumber || 'Your order'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px">
        <span style="border-radius:999px;background:#edf8f4;color:#165a48;padding:6px 10px;font-size:12px;font-weight:800">${modeText}</span>
        ${totalText ? `<span style="border-radius:999px;background:#f5f3ee;color:#1a1916;padding:6px 10px;font-size:12px;font-weight:800">${totalText} paid</span>` : ''}
      </div>
      <p style="color:#7a7570;font-size:14px;line-height:1.6;margin-bottom:18px">Payment verified. Track preparation${order.fulfillmentMode === 'pickup' ? ' and pickup' : ' and delivery'} status from this link.</p>
      <a href="${order.trackingUrl}" style="display:block;text-align:center;background:#1f7a63;color:#fff;text-decoration:none;border-radius:12px;padding:13px 16px;font-weight:800;margin-bottom:10px">Track Order</a>
      <button onclick="document.getElementById('orderSuccessModal').remove()" style="width:100%;border:1px solid #e0dcd5;background:#fff;border-radius:12px;padding:12px 16px;font-weight:700;color:#1a1916">Close</button>
    </div>`;
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.remove();
  });
  document.body.appendChild(modal);
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
fillSavedCustomerProfile();
if (window.CustomerBackend) {
  window.CustomerBackend.ready
    .then(() => {
      fillSavedCustomerProfile();
      syncMenuFromFirestore().catch(() => {});
      fetchOrderStatus();
      listenOrderStatus();
    })
    .catch(() => {
      fetchOrderStatus();
      applyOrderStatus();
    });
} else {
  fetchOrderStatus();
}

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
window.setFulfillmentMode = setFulfillmentMode;
window.confirmSharedLocation = confirmSharedLocation;
window.clearSharedLocation = clearSharedLocation;
