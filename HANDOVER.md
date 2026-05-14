# Handover: Restaurant Firebase Ordering Platform

## Repository

GitHub repo:
https://github.com/thisisme1289-ux/testresto

Current branch:
`main`

Latest pushed commits:
- `7ce9e96` - Implement Firebase anonymous ordering platform
- `3576693` - Add package versions for npm compatibility

Local workspace:
`C:\Users\Administrator\Desktop\Restaurant-main`

## What Was Done

The original static restaurant website was converted into the foundation for a Firebase-based food ordering system.

Removed or replaced:
- Old WhatsApp checkout order flow.
- Old direct Firebase Realtime Database order writes.
- Old Realtime Database `EventSource` listeners.
- Old Formspree email order submission.
- Old local-only order history as the source of truth.
- Old hardcoded kitchen password dashboard.
- Old `annamay5` cart storage key.

Added:
- Firebase Anonymous Authentication customer flow.
- Firestore-backed customer identity, order history, menu sync, and restaurant status.
- Razorpay payment flow through Firebase Cloud Functions.
- Secure server-side Razorpay signature verification.
- Public-safe order tracking URLs through a Cloud Function.
- `/track.html` order tracking page.
- `/admin/` dashboard with Firebase email/password login and admin custom claims.
- Firestore security rules.
- Firebase Storage rules.
- Firebase Hosting config.
- Firestore indexes.
- Menu seeding script.
- Admin custom claim script.
- Deployment checklist.
- `.gitignore` so `node_modules` is not pushed.

## Important Files

Customer frontend:
- `index.html`
- `js/app.js`
- `js/data.js`
- `js/pwa.js`
- `js/firebase-config.js`
- `js/firebase-client.js`
- `track.html`

Admin dashboard:
- `admin/index.html`

Firebase backend/config:
- `firebase.json`
- `firestore.rules`
- `storage.rules`
- `firestore.indexes.json`
- `functions/src/index.js`
- `functions/package.json`

Setup scripts:
- `scripts/seed-menu-from-existing-data.js`
- `scripts/set-admin-claim.js`

Docs:
- `docs/deployment.md`
- `HANDOVER.md`

## Current Architecture

Customer side:
- Customer never sees login/signup.
- On page load, Firebase Anonymous Auth silently creates or restores the customer session.
- Customer cart and saved address/phone stay in `localStorage` for convenience.
- Firestore is the source of truth for orders and order history.
- Checkout calls a Cloud Function to create a Razorpay order.
- Razorpay payment is verified by a Cloud Function before the order becomes valid.
- After payment, customer gets an order tracking link.

Admin side:
- Admin uses Firebase email/password login at `/admin/`.
- Admin access requires Firebase custom claim: `admin: true`.
- Admin can see paid orders, change status, manage menu items, and pause/accept orders.

Backend:
- Cloud Functions handle trusted actions:
  - `createRazorpayOrder`
  - `verifyRazorpayPayment`
  - `updateOrderStatus`
  - `resolveTrackingOrder`
  - `setRestaurantAvailability`

## Dependency Status

Dependencies were installed locally using `npm.cmd` because PowerShell `npm.ps1` was hanging.

Working commands:
```bash
cmd /c npm.cmd install
cd functions
cmd /c npm.cmd install
```

Installed locally:
- root `node_modules`
- `functions/node_modules`

Committed to GitHub:
- `package.json`
- `package-lock.json`
- `functions/package.json`
- `functions/package-lock.json`

Not committed:
- `node_modules`
- `functions/node_modules`

There are low-severity npm audit warnings. These were not force-fixed because `npm audit fix --force` may introduce breaking dependency changes.

There is also a local warning because the machine has Node `v24.15.0`, while Firebase Functions are configured for Node `20`. This is okay for deploy because Firebase will run Functions on Node 20.

## Verified

Syntax checks passed:
```bash
node --check js/firebase-client.js
node --check js/app.js
node --check functions/src/index.js
```

Browser smoke test passed locally:
- `/`
- `/admin/`
- `/track.html`

No console errors were seen during the smoke test.

Cleanup search passed:
- No old `FB`
- No old `EventSource`
- No `Formspree`
- No `annamay5`
- No hardcoded kitchen password
- No WhatsApp checkout references

## What Is Still Left

The code is pushed, but Firebase production setup is not complete yet because real account values are needed.

### 1. Create/Use Firebase Project

Enable:
- Firebase Authentication
  - Anonymous provider
  - Email/password provider
- Firestore Database
- Cloud Functions
- Firebase Hosting
- Firebase Storage

### 2. Fill Firebase Web Config

Edit:
`js/firebase-config.js`

Replace:
```js
window.FIREBASE_CONFIG = {
  apiKey: "REPLACE_WITH_FIREBASE_API_KEY",
  authDomain: "REPLACE_WITH_PROJECT_ID.firebaseapp.com",
  projectId: "REPLACE_WITH_PROJECT_ID",
  storageBucket: "REPLACE_WITH_PROJECT_ID.appspot.com",
  messagingSenderId: "REPLACE_WITH_MESSAGING_SENDER_ID",
  appId: "REPLACE_WITH_FIREBASE_APP_ID"
};

window.RAZORPAY_KEY_ID = "REPLACE_WITH_RAZORPAY_KEY_ID";
```

These values come from:
Firebase Console > Project settings > Web app.

The Razorpay key ID comes from Razorpay Dashboard.

### 3. Set Razorpay Function Secrets

Run after Firebase CLI login/project setup:
```bash
firebase functions:secrets:set RAZORPAY_KEY_ID
firebase functions:secrets:set RAZORPAY_KEY_SECRET
```

### 4. Seed Menu Into Firestore

After Firebase Admin credentials/project are available:
```bash
npm run seed:menu
```

This reads the current `js/data.js` menu and creates:
- `categories`
- `menuItems`
- `settings/restaurant`

### 5. Create Admin User

In Firebase Console:
- Authentication > Users
- Add staff email/password user

Then set admin claim:
```bash
npm run admin:set -- owner@example.com
```

Replace `owner@example.com` with the real admin email.

### 6. Deploy

Use Firebase CLI:
```bash
firebase login
firebase use YOUR_PROJECT_ID
firebase deploy
```

If global Firebase CLI is not installed:
```bash
npx firebase-tools login
npx firebase-tools use YOUR_PROJECT_ID
npx firebase-tools deploy
```

Note: Trying to install `firebase-tools` into this project as a local dev dependency hit a local npm/arborist `Invalid Version` bug. The app dependencies themselves installed fine.

## Important Notes For Next Chat

Do not reintroduce:
- WhatsApp checkout
- Realtime Database ordering
- Password-gated kitchen page
- Direct client-side order creation
- Customer login/signup UI

Keep:
- Anonymous customer auth
- Admin email/password auth with custom claims
- Cloud Functions for payment/order trust
- Firestore as source of truth
- Local storage only for convenience: cart, address, phone, tracking link cache

The next best task is Firebase account setup and deployment, not more architecture work.

## Plain-English Current Status

The website code has been upgraded and pushed to GitHub.

It is not live on Firebase yet.

To make it live, the next chat needs to connect this repo to a real Firebase project, paste Firebase/Razorpay keys, seed the menu, create the admin user, and deploy.
