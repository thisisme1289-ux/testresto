(function () {
  const FALLBACK_SETTINGS = {
    isOpen: true,
    acceptingOrders: true,
    gstPercent: 5,
    prepTimeDefaultMinutes: 30,
    deliveryTimeDefaultMinutes: 45
  };

  const config = window.FIREBASE_CONFIG || {};
  const configReady = config.apiKey && !String(config.apiKey).startsWith('REPLACE_');

  if (!configReady || !window.firebase) {
    console.warn('Firebase is not configured yet. Ordering calls will fail until keys are added.');
    window.CustomerBackend = {
      ready: Promise.resolve(null),
      getCurrentUser: () => Promise.reject(new Error('Firebase is not configured yet')),
      getRestaurantSettings: () => Promise.resolve(FALLBACK_SETTINGS),
      subscribeRestaurantSettings: callback => { callback(FALLBACK_SETTINGS); return () => {}; },
      upsertCustomerProfile: () => Promise.reject(new Error('Firebase is not configured yet')),
      createRazorpayOrder: () => Promise.reject(new Error('Firebase is not configured yet')),
      openRazorpayCheckout: () => Promise.reject(new Error('Firebase is not configured yet')),
      getMyOrders: () => Promise.resolve([]),
      getMenuCatalog: () => Promise.resolve(null)
    };
    return;
  }

  firebase.initializeApp(config);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const functions = firebase.functions();

  const createRazorpayOrderFn = functions.httpsCallable('createRazorpayOrder');
  const verifyRazorpayPaymentFn = functions.httpsCallable('verifyRazorpayPayment');

  const ready = new Promise((resolve, reject) => {
    auth.onAuthStateChanged(async user => {
      try {
        if (!user) {
          const result = await auth.signInAnonymously();
          user = result.user;
        }

        localStorage.setItem('annamay_anonymous_uid', user.uid);
        await db.collection('users').doc(user.uid).set({
          authType: 'anonymous',
          lastSeenAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        resolve(user);
      } catch (err) {
        reject(err);
      }
    });
  });

  async function getCurrentUser() {
    return ready;
  }

  async function getRestaurantSettings() {
    const snap = await db.collection('settings').doc('restaurant').get();
    return snap.exists ? { ...FALLBACK_SETTINGS, ...snap.data() } : FALLBACK_SETTINGS;
  }

  function subscribeRestaurantSettings(callback) {
    return db.collection('settings').doc('restaurant').onSnapshot(snapshot => {
      callback(snapshot.exists ? { ...FALLBACK_SETTINGS, ...snapshot.data() } : FALLBACK_SETTINGS);
    }, () => callback(FALLBACK_SETTINGS));
  }

  async function upsertCustomerProfile(profile) {
    const user = await getCurrentUser();
    await db.collection('users').doc(user.uid).set({
      authType: 'anonymous',
      name: profile.name || '',
      phone: profile.phone || '',
      defaultAddress: profile.defaultAddress || '',
      lastSeenAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  }

  async function createRazorpayOrder(payload) {
    await getCurrentUser();
    const result = await createRazorpayOrderFn(payload);
    return result.data;
  }

  async function verifyRazorpayPayment(payload) {
    await getCurrentUser();
    const result = await verifyRazorpayPaymentFn(payload);
    return result.data;
  }

  function openRazorpayCheckout(checkout, customer) {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay Checkout could not be loaded'));
        return;
      }

      const razorpay = new window.Razorpay({
        key: window.RAZORPAY_KEY_ID,
        amount: checkout.amount,
        currency: checkout.currency || 'INR',
        name: 'Annamay Restaurant & Bakery',
        description: checkout.orderNumber || 'Food order',
        order_id: checkout.razorpayOrderId,
        prefill: {
          name: customer.name,
          contact: customer.phone,
          email: customer.email || ''
        },
        notes: {
          orderId: checkout.orderId,
          orderNumber: checkout.orderNumber
        },
        theme: { color: '#1f7a63' },
        handler: async response => {
          try {
            const verified = await verifyRazorpayPayment({
              orderId: checkout.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            resolve(verified);
          } catch (err) {
            reject(err);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment was cancelled'))
        }
      });

      razorpay.open();
    });
  }

  async function getMyOrders() {
    const user = await getCurrentUser();
    const snap = await db.collection('orders')
      .where('customerUid', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(25)
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async function getMenuCatalog() {
    const [categoriesSnap, itemsSnap] = await Promise.all([
      db.collection('categories').where('isActive', '==', true).orderBy('sortOrder').get(),
      db.collection('menuItems').where('isActive', '==', true).get()
    ]);
    const categories = categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const grouped = {};
    const images = {};
    categories.forEach(category => { grouped[category.name] = []; });
    itemsSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .forEach(item => {
        const categoryName = item.categoryName || categories.find(c => c.id === item.categoryId)?.name || 'Menu';
        if (!grouped[categoryName]) grouped[categoryName] = [];
        grouped[categoryName].push({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          isAvailable: item.isAvailable !== false
        });
        if (item.imageUrl) images[item.name] = item.imageUrl;
      });
    return { menu: grouped, images };
  }

  window.CustomerBackend = {
    ready,
    getCurrentUser,
    getRestaurantSettings,
    subscribeRestaurantSettings,
    upsertCustomerProfile,
    createRazorpayOrder,
    openRazorpayCheckout,
    getMyOrders,
    getMenuCatalog
  };
})();
