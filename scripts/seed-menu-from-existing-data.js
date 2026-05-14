const fs = require('fs');
const vm = require('vm');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

const source = fs.readFileSync('js/data.js', 'utf8');
const context = { localStorage: { getItem: () => '[]' } };
vm.createContext(context);
vm.runInContext(`${source}; this.__MENU__ = MENU; this.__IMGS__ = IMGS;`, context);

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function main() {
  const batch = db.batch();
  let categoryOrder = 0;
  let itemCount = 0;

  for (const [categoryName, items] of Object.entries(context.__MENU__)) {
    const categoryId = slug(categoryName);
    batch.set(db.collection('categories').doc(categoryId), {
      name: categoryName,
      sortOrder: categoryOrder++,
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    items.forEach((item, sortOrder) => {
      batch.set(db.collection('menuItems').doc(item.id), {
        name: item.name,
        categoryId,
        categoryName,
        price: Number(item.price),
        imageUrl: context.__IMGS__[item.name] || 'images/default.jpg',
        isAvailable: true,
        isActive: true,
        isVeg: true,
        sortOrder,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      itemCount += 1;
    });
  }

  batch.set(db.collection('settings').doc('restaurant'), {
    isOpen: true,
    acceptingOrders: true,
    gstPercent: 5,
    deliveryFee: 0,
    prepTimeDefaultMinutes: 30,
    deliveryTimeDefaultMinutes: 45,
    restaurantLocation: { lat: 25.5066, lng: 81.8676 },
    maxDeliveryKm: 10,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await batch.commit();
  console.log(`Seeded ${itemCount} menu items.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
