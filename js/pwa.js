/* ═══════════════════════════════════════════════════════════
   Annamay Restaurant — PWA + Install Prompt + Order History
═══════════════════════════════════════════════════════════ */

/* ── SERVICE WORKER REGISTRATION ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered, scope:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}

/* ═══════════════════════════════════════════
   INSTALL PROMPT
   - Catches the browser's beforeinstallprompt event
   - Fires the prompt when user taps "Place Order on WhatsApp"
     for the first time
   - Shows a manual guide for iOS (Safari doesn't support prompt)
═══════════════════════════════════════════ */
let _deferredPrompt = null;
let _installShown   = false;

/* Intercept browser prompt — save it for later */
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredPrompt = e;
});

/* Called by app.js right before opening WhatsApp */
function triggerInstallPrompt(callback) {
  /* Only show once per session */
  if (_installShown) { callback(); return; }
  /* Don't show if already installed */
  if (window.matchMedia('(display-mode: standalone)').matches) { callback(); return; }

  _installShown = true;

  /* ── Android / Chrome — native prompt ── */
  if (_deferredPrompt) {
    showInstallModal({
      type: 'native',
      onInstall: () => {
        _deferredPrompt.prompt();
        _deferredPrompt.userChoice.then(() => {
          _deferredPrompt = null;
          callback();
        });
      },
      onSkip: callback
    });
    return;
  }

  /* ── iOS Safari — manual guide ── */
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isIOS && isSafari) {
    showInstallModal({ type: 'ios', onInstall: callback, onSkip: callback });
    return;
  }

  /* Desktop or unsupported — skip straight to order */
  callback();
}

/* ── Build & show the install modal ── */
function showInstallModal({ type, onInstall, onSkip }) {
  const existing = document.getElementById('pwaModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'pwaModal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    display:flex;align-items:flex-end;justify-content:center;
    background:rgba(0,0,0,.55);backdrop-filter:blur(6px);
    animation:pgIn .25s ease;
  `;

  const iosGuide = type === 'ios' ? `
    <div style="background:#1a2e28;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
      <div style="font-size:12px;color:rgba(255,255,255,.5);margin-bottom:10px;text-transform:uppercase;letter-spacing:.6px;">How to install on iPhone</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span style="font-size:20px;">1️⃣</span>
        <span style="font-size:13px;color:rgba(255,255,255,.8);">Tap the <strong style="color:#fff;">Share</strong> button <span style="font-size:16px;">⬆️</span> at the bottom of Safari</span>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">2️⃣</span>
        <span style="font-size:13px;color:rgba(255,255,255,.8);">Scroll down and tap <strong style="color:#fff;">"Add to Home Screen"</strong></span>
      </div>
    </div>` : '';

  const installBtnLabel = type === 'ios' ? '✓ Got it — Continue to Order' : '📲 Install App & Continue';

  modal.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#1a2e28,#0f1f1a);
      border-radius:24px 24px 0 0;
      padding:28px 24px 36px;
      width:100%;max-width:480px;
      border-top:1px solid rgba(43,191,155,.2);
      box-shadow:0 -8px 40px rgba(0,0,0,.4);
    ">
      <!-- Handle -->
      <div style="width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;margin:0 auto 24px;"></div>

      <!-- Icon + headline -->
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
        <div style="
          width:56px;height:56px;border-radius:14px;flex-shrink:0;
          background:linear-gradient(135deg,#1f7a63,#2bbf9b);
          display:flex;align-items:center;justify-content:center;font-size:26px;
          box-shadow:0 4px 16px rgba(31,122,99,.4);
        ">🍽️</div>
        <div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#fff;line-height:1.2;">Get the Annamay App</div>
          <div style="font-size:13px;color:rgba(255,255,255,.5);margin-top:3px;">Free · No app store needed</div>
        </div>
      </div>

      <!-- Benefits -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
        ${['⚡ Loads instantly','📶 Works offline','📋 Order history','🔔 No app store'].map(b => `
          <div style="background:rgba(255,255,255,.05);border-radius:10px;padding:10px 12px;font-size:12px;color:rgba(255,255,255,.7);">${b}</div>
        `).join('')}
      </div>

      ${iosGuide}

      <!-- Buttons -->
      <button onclick="document.getElementById('pwaModal')._onInstall()" style="
        width:100%;padding:14px;border-radius:12px;border:none;
        background:linear-gradient(135deg,#1f7a63,#2bbf9b);
        color:#fff;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;
        box-shadow:0 6px 20px rgba(31,122,99,.4);margin-bottom:10px;cursor:pointer;
      ">${installBtnLabel}</button>

      <button onclick="document.getElementById('pwaModal')._onSkip()" style="
        width:100%;padding:12px;border-radius:12px;border:none;
        background:transparent;color:rgba(255,255,255,.4);
        font-family:'DM Sans',sans-serif;font-size:13px;cursor:pointer;
      ">Not now — Just place the order</button>
    </div>
  `;

  modal._onInstall = onInstall;
  modal._onSkip    = onSkip;

  /* Close on backdrop tap */
  modal.addEventListener('click', e => {
    if (e.target === modal) { modal.remove(); onSkip(); }
  });

  document.body.appendChild(modal);
}

/* ═══════════════════════════════════════════
   ORDER HISTORY
   Saves last 10 orders to localStorage.
   Exposed via window so app.js can call it.
═══════════════════════════════════════════ */
const ORDER_HISTORY_KEY = 'annamay_history';
const MAX_HISTORY = 10;

function saveOrderToHistory(order) {
  const history = getOrderHistory();
  /* Prepend newest */
  history.unshift({
    id:       order.id,
    date:     new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }),
    time:     new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }),
    items:    order.items.map(i => ({ id:i.id, name:i.name, price:i.price, cat:i.cat, qty:i.qty })),
    subtotal: order.subtotal,
    cgst:     order.cgst,
    sgst:     order.sgst,
    total:    order.total
  });
  /* Keep only last MAX_HISTORY */
  if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history));
}

function getOrderHistory() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

/* Build and show the order history drawer */
function showOrderHistory() {
  const history = getOrderHistory();
  const existing = document.getElementById('historyDrawer');
  if (existing) existing.remove();

  const drawer = document.createElement('div');
  drawer.id = 'historyDrawer';
  drawer.style.cssText = `
    position:fixed;inset:0;z-index:9998;
    display:flex;align-items:flex-end;justify-content:center;
    background:rgba(0,0,0,.55);backdrop-filter:blur(6px);
    animation:pgIn .25s ease;
  `;

  const emptyMsg = `
    <div style="text-align:center;padding:48px 24px;color:rgba(255,255,255,.35);">
      <div style="font-size:40px;margin-bottom:12px;">📋</div>
      <div style="font-size:15px;">No orders yet</div>
      <div style="font-size:12px;margin-top:6px;">Your past orders will appear here</div>
    </div>`;

  const orderCards = history.length ? history.map((o, idx) => `
    <div style="
      background:rgba(255,255,255,.05);border-radius:14px;
      padding:14px 16px;margin-bottom:10px;
      border:1px solid rgba(255,255,255,.08);
    ">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--a,#2bbf9b);letter-spacing:.4px;">${o.id}</div>
          <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;">${o.date} · ${o.time}</div>
        </div>
        <div style="font-size:15px;font-weight:700;color:#fff;">₹${o.total}</div>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,.6);margin-bottom:12px;line-height:1.6;">
        ${o.items.map(i => `${i.name} ×${i.qty}`).join(' &nbsp;·&nbsp; ')}
      </div>
      <button onclick="reorder(${idx})" style="
        width:100%;padding:9px;border-radius:9px;border:none;
        background:linear-gradient(135deg,#1f7a63,#2bbf9b);
        color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;
        cursor:pointer;box-shadow:0 3px 10px rgba(31,122,99,.3);
      ">🔁 Reorder</button>
    </div>
  `).join('') : emptyMsg;

  drawer.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#1a2e28,#0f1f1a);
      border-radius:24px 24px 0 0;
      width:100%;max-width:480px;
      max-height:80vh;
      display:flex;flex-direction:column;
      border-top:1px solid rgba(43,191,155,.2);
      box-shadow:0 -8px 40px rgba(0,0,0,.4);
    ">
      <!-- Header -->
      <div style="padding:20px 20px 0;flex-shrink:0;">
        <div style="width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;margin:0 auto 18px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:700;color:#fff;">Order History</div>
          <button onclick="document.getElementById('historyDrawer').remove()" style="
            background:rgba(255,255,255,.08);border:none;border-radius:50%;
            width:30px;height:30px;color:rgba(255,255,255,.6);
            font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
          ">✕</button>
        </div>
      </div>
      <!-- Scrollable list -->
      <div style="overflow-y:auto;padding:0 20px 32px;flex:1;">
        ${orderCards}
      </div>
    </div>
  `;

  drawer.addEventListener('click', e => {
    if (e.target === drawer) drawer.remove();
  });

  document.body.appendChild(drawer);
}

/* Reorder — load items from a history entry back into cart */
function reorder(historyIndex) {
  const history = getOrderHistory();
  const past = history[historyIndex];
  if (!past) return;

  /* Merge into current cart */
  past.items.forEach(item => {
    const ex = window.cart.find(c => c.id === item.id);
    if (ex) ex.qty += item.qty;
    else window.cart.push({ id:item.id, name:item.name, price:item.price, cat:item.cat, qty:item.qty });
  });

  window.save();
  window.refreshCart();
  document.getElementById('historyDrawer').remove();
  window.openCart();
  if (typeof window.toast === 'function') window.toast('Items added to cart!');
}

/* Expose globally */
window.saveOrderToHistory = saveOrderToHistory;
window.showOrderHistory   = showOrderHistory;
window.reorder            = reorder;
window.triggerInstallPrompt = triggerInstallPrompt;
