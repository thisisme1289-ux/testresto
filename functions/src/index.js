const crypto = require('crypto');
const admin = require('firebase-admin');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const Razorpay = require('razorpay');

admin.initializeApp();
const db = admin.firestore();

const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');

const ORDER_STATUSES = ['pending', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
const DEFAULT_RESTAURANT_LOCATION = { lat: 25.5066, lng: 81.8676 };
const DEFAULT_MAX_DELIVERY_KM = 10;

function requireAuth(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Anonymous session required');
  return request.auth.uid;
}

function requireAdmin(request) {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }
  return request.auth.uid;
}

function assertString(value, field, min = 1, max = 500) {
  if (typeof value !== 'string') throw new HttpsError('invalid-argument', `${field} is required`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpsError('invalid-argument', `${field} length is invalid`);
  }
  return trimmed;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function makeTrackingToken() {
  return crypto.randomBytes(32).toString('base64url');
}

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
  if (km <= DEFAULT_MAX_DELIVERY_KM) return 35;
  return null;
}

function assertLocation(value) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new HttpsError('invalid-argument', 'Current delivery location is required');
  }
  return { lat, lng };
}

async function nextOrderNumber() {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const counterRef = db.collection('counters').doc(`orders-${today}`);
  const next = await db.runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    const value = snap.exists ? (snap.data().value || 0) + 1 : 1;
    tx.set(counterRef, { value, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return value;
  });
  return `ANN-${today}-${String(next).padStart(4, '0')}`;
}

async function getRestaurantSettings() {
  const snap = await db.collection('settings').doc('restaurant').get();
  return {
    isOpen: true,
    acceptingOrders: true,
    gstPercent: 5,
    deliveryFee: 0,
    prepTimeDefaultMinutes: 30,
    restaurantLocation: DEFAULT_RESTAURANT_LOCATION,
    maxDeliveryKm: DEFAULT_MAX_DELIVERY_KM,
    ...(snap.exists ? snap.data() : {})
  };
}

async function buildPricedItems(items) {
  if (!Array.isArray(items) || !items.length) {
    throw new HttpsError('invalid-argument', 'Cart is empty');
  }
  if (items.length > 60) throw new HttpsError('invalid-argument', 'Cart has too many items');

  const priced = [];
  for (const item of items) {
    const itemId = assertString(item.itemId, 'itemId', 1, 80);
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1 || qty > 25) {
      throw new HttpsError('invalid-argument', 'Invalid item quantity');
    }

    const snap = await db.collection('menuItems').doc(itemId).get();
    if (!snap.exists) throw new HttpsError('failed-precondition', `${item.name || itemId} is no longer available`);
    const data = snap.data();
    if (data.isAvailable === false || data.isActive === false) {
      throw new HttpsError('failed-precondition', `${data.name || itemId} is currently unavailable`);
    }

    priced.push({
      itemId,
      name: data.name,
      price: Number(data.price),
      qty,
      imageUrl: data.imageUrl || '',
      categoryId: data.categoryId || '',
      categoryName: data.categoryName || ''
    });
  }
  return priced;
}

function publicOrderPayload(order) {
  const customer = order.customer || {};
  return {
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payment?.status || 'unknown',
    fulfillmentMode: order.fulfillmentMode || 'delivery',
    customer: {
      name: customer.name || '',
      phone: customer.phone || '',
      address: customer.address || ''
    },
    items: (order.items || []).map(item => ({
      name: item.name,
      qty: item.qty,
      price: item.price,
      imageUrl: item.imageUrl || '',
      categoryName: item.categoryName || ''
    })),
    pricing: order.pricing || null,
    estimatedPrepMinutes: order.estimatedPrepMinutes || null,
    estimatedReadyAt: order.estimatedReadyAt ? order.estimatedReadyAt.toDate().toISOString() : null,
    updatedAt: order.updatedAt ? order.updatedAt.toDate().toISOString() : null,
    statusHistory: Array.isArray(order.statusHistory) ? order.statusHistory : [],
    cancellationReason: order.cancellationReason || '',
    googleReviewUrl: order.googleReviewUrl || ''
  };
}

function calculatePricing(items, settings, fulfillmentMode = 'delivery', deliveryQuote = null) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gstTotal = Math.round(subtotal * (Number(settings.gstPercent || 0) / 100));
  const cgst = Math.round(gstTotal / 2);
  const sgst = gstTotal - cgst;
  const deliveryFee = fulfillmentMode === 'pickup' ? 0 : Number(deliveryQuote?.fee || 0);
  const discount = 0;
  return {
    subtotal,
    cgst,
    sgst,
    deliveryFee,
    deliveryDistanceKm: deliveryQuote ? Number(deliveryQuote.distanceKm.toFixed(2)) : null,
    discount,
    total: subtotal + cgst + sgst + deliveryFee - discount
  };
}

exports.createRazorpayOrder = onCall({ secrets: [razorpayKeyId, razorpayKeySecret] }, async request => {
  const customerUid = requireAuth(request);
  const settings = await getRestaurantSettings();
  if (settings.isOpen === false || settings.acceptingOrders === false) {
    throw new HttpsError('failed-precondition', 'Restaurant is not accepting orders right now');
  }

  const fulfillmentMode = request.data.fulfillmentMode === 'pickup' ? 'pickup' : 'delivery';
  const customer = request.data.customer || {};
  const safeCustomer = {
    name: assertString(customer.name, 'name', 1, 100),
    phone: assertString(customer.phone, 'phone', 10, 10),
    address: fulfillmentMode === 'delivery' ? assertString(customer.address, 'address', 5, 500) : '',
    locationUrl: typeof customer.locationUrl === 'string' ? customer.locationUrl.slice(0, 300) : '',
    location: null
  };
  if (!/^[6-9]\d{9}$/.test(safeCustomer.phone)) {
    throw new HttpsError('invalid-argument', 'Invalid Indian mobile number');
  }
  let deliveryQuote = null;
  if (fulfillmentMode === 'delivery') {
    safeCustomer.location = assertLocation(customer.location);
    const origin = settings.restaurantLocation || DEFAULT_RESTAURANT_LOCATION;
    const distance = distanceKm(origin, safeCustomer.location);
    const maxDeliveryKm = Number(settings.maxDeliveryKm || DEFAULT_MAX_DELIVERY_KM);
    if (distance > maxDeliveryKm) {
      throw new HttpsError('failed-precondition', `Delivery is available only within ${maxDeliveryKm} km`);
    }
    const fee = deliveryFeeForDistance(distance);
    if (fee === null) throw new HttpsError('failed-precondition', 'Delivery is not available for this location');
    deliveryQuote = { distanceKm: distance, fee };
  }

  const items = await buildPricedItems(request.data.items);
  const pricing = calculatePricing(items, settings, fulfillmentMode, deliveryQuote);
  if (pricing.total < 1) throw new HttpsError('invalid-argument', 'Order total is invalid');

  const orderNumber = await nextOrderNumber();
  const trackingToken = makeTrackingToken();
  const orderRef = db.collection('orders').doc();
  const razorpay = new Razorpay({
    key_id: razorpayKeyId.value(),
    key_secret: razorpayKeySecret.value()
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: pricing.total * 100,
    currency: 'INR',
    receipt: orderNumber,
    notes: { orderId: orderRef.id, orderNumber, customerUid }
  });

  const trackingUrl = `/track.html?order=${encodeURIComponent(orderNumber)}&token=${encodeURIComponent(trackingToken)}`;
  await orderRef.set({
    orderNumber,
    customerUid,
    fulfillmentMode,
    trackingTokenHash: hashToken(trackingToken),
    customer: safeCustomer,
    items,
    pricing,
    status: 'payment_pending',
    payment: {
      provider: 'razorpay',
      status: 'created',
      razorpayOrderId: razorpayOrder.id
    },
    tracking: {
      publicUrl: trackingUrl,
      tokenCreatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    estimatedPrepMinutes: Number(settings.prepTimeDefaultMinutes || 30),
    googleReviewUrl: settings.googleReviewUrl || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: [{ status: 'payment_pending', at: new Date().toISOString(), by: 'system' }]
  });

  await db.collection('users').doc(customerUid).set({
    authType: 'anonymous',
    name: safeCustomer.name,
    phone: safeCustomer.phone,
    defaultAddress: safeCustomer.address,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSeenAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  return {
    orderId: orderRef.id,
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: razorpayKeyId.value()
  };
});

exports.verifyRazorpayPayment = onCall({ secrets: [razorpayKeySecret] }, async request => {
  const customerUid = requireAuth(request);
  const orderId = assertString(request.data.orderId, 'orderId', 1, 120);
  const razorpayOrderId = assertString(request.data.razorpayOrderId, 'razorpayOrderId', 1, 120);
  const razorpayPaymentId = assertString(request.data.razorpayPaymentId, 'razorpayPaymentId', 1, 120);
  const razorpaySignature = assertString(request.data.razorpaySignature, 'razorpaySignature', 1, 300);

  const expected = crypto
    .createHmac('sha256', razorpayKeySecret.value())
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  if (expected !== razorpaySignature) {
    throw new HttpsError('permission-denied', 'Payment signature verification failed');
  }

  const ref = db.collection('orders').doc(orderId);
  const snap = await ref.get();
  if (!snap.exists) throw new HttpsError('not-found', 'Order not found');
  const order = snap.data();
  if (order.customerUid !== customerUid) throw new HttpsError('permission-denied', 'Order does not belong to this customer');
  if (order.payment?.razorpayOrderId !== razorpayOrderId) {
    throw new HttpsError('invalid-argument', 'Payment order mismatch');
  }

  const statusEntry = { status: 'pending', at: new Date().toISOString(), by: 'system' };
  await ref.update({
    status: 'pending',
    payment: {
      ...order.payment,
      provider: 'razorpay',
      status: 'paid',
      razorpayOrderId,
      razorpayPaymentId,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: admin.firestore.FieldValue.arrayUnion(statusEntry)
  });

  return {
    orderId,
    orderNumber: order.orderNumber,
    status: 'pending',
    total: order.pricing.total,
    fulfillmentMode: order.fulfillmentMode || 'delivery',
    trackingUrl: order.tracking.publicUrl
  };
});

exports.updateOrderStatus = onCall(async request => {
  const adminUid = requireAdmin(request);
  const orderId = assertString(request.data.orderId, 'orderId', 1, 120);
  const status = assertString(request.data.status, 'status', 1, 40);
  if (!ORDER_STATUSES.includes(status)) {
    throw new HttpsError('invalid-argument', 'Unsupported order status');
  }

  const patch = {
    status,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    statusHistory: admin.firestore.FieldValue.arrayUnion({ status, at: new Date().toISOString(), by: adminUid })
  };
  if (status === 'accepted') {
    const minutes = Number(request.data.estimatedPrepMinutes || 30);
    if (!Number.isFinite(minutes) || minutes < 5 || minutes > 180) {
      throw new HttpsError('invalid-argument', 'Estimated prep time must be between 5 and 180 minutes');
    }
    patch.estimatedPrepMinutes = minutes;
    patch.estimatedReadyAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + minutes * 60000));
  }
  if (status === 'cancelled') {
    patch.cancellationReason = typeof request.data.cancellationReason === 'string'
      ? request.data.cancellationReason.trim().slice(0, 240)
      : '';
  }

  await db.collection('orders').doc(orderId).update(patch);
  return { ok: true };
});

exports.resolveTrackingOrder = onCall(async request => {
  const orderNumber = assertString(request.data.orderNumber, 'orderNumber', 1, 80);
  const token = assertString(request.data.token, 'token', 20, 200);
  const snap = await db.collection('orders').where('orderNumber', '==', orderNumber).limit(1).get();
  if (snap.empty) throw new HttpsError('not-found', 'Order not found');
  const order = snap.docs[0].data();
  if (order.trackingTokenHash !== hashToken(token)) {
    throw new HttpsError('permission-denied', 'Invalid tracking token');
  }
  return publicOrderPayload(order);
});

exports.submitOrderFeedback = onCall(async request => {
  const orderNumber = assertString(request.data.orderNumber, 'orderNumber', 1, 80);
  const token = assertString(request.data.token, 'token', 20, 200);
  const rating = Number(request.data.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpsError('invalid-argument', 'Rating must be between 1 and 5');
  }
  const message = typeof request.data.message === 'string' ? request.data.message.trim().slice(0, 1000) : '';

  const snap = await db.collection('orders').where('orderNumber', '==', orderNumber).limit(1).get();
  if (snap.empty) throw new HttpsError('not-found', 'Order not found');
  const orderDoc = snap.docs[0];
  const order = orderDoc.data();
  if (order.trackingTokenHash !== hashToken(token)) {
    throw new HttpsError('permission-denied', 'Invalid tracking token');
  }

  await db.collection('orderFeedback').doc(orderDoc.id).set({
    orderId: orderDoc.id,
    orderNumber,
    rating,
    message,
    fulfillmentMode: order.fulfillmentMode || 'delivery',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { ok: true };
});

exports.setRestaurantAvailability = onCall(async request => {
  requireAdmin(request);
  await db.collection('settings').doc('restaurant').set({
    isOpen: request.data.isOpen !== false,
    acceptingOrders: request.data.acceptingOrders !== false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return { ok: true };
});
