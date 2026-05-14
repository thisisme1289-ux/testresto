/* PWA install prompt + Firestore-backed order history. */
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

function triggerInstallPrompt(next) {
  if (!deferredInstallPrompt) {
    if (typeof next === 'function') next();
    return;
  }

  deferredInstallPrompt.prompt();
  deferredInstallPrompt.userChoice.finally(() => {
    deferredInstallPrompt = null;
    if (typeof next === 'function') next();
  });
}

async function showOrderHistory() {
  const existing = document.getElementById('historyDrawer');
  if (existing) existing.remove();

  const drawer = document.createElement('div');
  drawer.id = 'historyDrawer';
  drawer.style.cssText = `
    position:fixed;inset:0;z-index:9998;
    display:flex;align-items:flex-end;justify-content:center;
    background:rgba(0,0,0,.55);backdrop-filter:blur(6px);
  `;

  drawer.innerHTML = `
    <div style="
      background:linear-gradient(160deg,#1a2e28,#0f1f1a);
      border-radius:24px 24px 0 0;width:100%;max-width:500px;
      max-height:82vh;display:flex;flex-direction:column;
      border-top:1px solid rgba(43,191,155,.2);
      box-shadow:0 -8px 40px rgba(0,0,0,.4);
    ">
      <div style="padding:20px 20px 0;flex-shrink:0;">
        <div style="width:40px;height:4px;background:rgba(255,255,255,.15);border-radius:4px;margin:0 auto 18px;"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:700;color:#fff;">Order History</div>
          <button onclick="document.getElementById('historyDrawer').remove()" style="
            background:rgba(255,255,255,.08);border:none;border-radius:50%;
            width:32px;height:32px;color:rgba(255,255,255,.65);
            font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
          ">&times;</button>
        </div>
      </div>
      <div id="historyList" style="overflow-y:auto;padding:0 20px 32px;flex:1;">
        <div style="text-align:center;padding:44px 20px;color:rgba(255,255,255,.45);font-size:14px;">Loading your orders...</div>
      </div>
    </div>
  `;

  drawer.addEventListener('click', e => {
    if (e.target === drawer) drawer.remove();
  });
  document.body.appendChild(drawer);

  const list = document.getElementById('historyList');
  try {
    if (!window.CustomerBackend) throw new Error('Order history is still loading');
    const orders = await window.CustomerBackend.getMyOrders();
    if (!orders.length) {
      list.innerHTML = `
        <div style="text-align:center;padding:48px 24px;color:rgba(255,255,255,.38);">
          <div style="font-size:15px;">No orders yet</div>
          <div style="font-size:12px;margin-top:6px;">Paid orders from this browser will appear here.</div>
        </div>`;
      return;
    }

    list.innerHTML = orders.map(order => {
      const items = (order.items || []).map(i => `${i.name} x${i.qty}`).join(' &middot; ');
      const total = order.pricing ? order.pricing.total : order.total;
      const trackingUrl = order.tracking && order.tracking.publicUrl ? order.tracking.publicUrl : '#';
      return `
        <div style="background:rgba(255,255,255,.05);border-radius:14px;padding:14px 16px;margin-bottom:10px;border:1px solid rgba(255,255,255,.08);">
          <div style="display:flex;justify-content:space-between;gap:14px;margin-bottom:10px;">
            <div>
              <div style="font-size:12px;font-weight:800;color:var(--a,#2bbf9b);letter-spacing:.4px;">${order.orderNumber || order.id}</div>
              <div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px;text-transform:capitalize;">${order.status || 'pending'} &middot; ${order.payment?.status || 'payment pending'}</div>
            </div>
            <div style="font-size:15px;font-weight:800;color:#fff;">&#8377;${total || 0}</div>
          </div>
          <div style="font-size:12px;color:rgba(255,255,255,.62);margin-bottom:12px;line-height:1.6;">${items}</div>
          <a href="${trackingUrl}" style="display:block;text-align:center;padding:10px;border-radius:10px;text-decoration:none;background:linear-gradient(135deg,#1f7a63,#2bbf9b);color:#fff;font-size:13px;font-weight:800;">Track Order</a>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = `<div style="text-align:center;padding:44px 20px;color:#fca5a5;font-size:14px;">${err.message || 'Could not load order history'}</div>`;
  }
}

window.showOrderHistory = showOrderHistory;
window.triggerInstallPrompt = triggerInstallPrompt;
