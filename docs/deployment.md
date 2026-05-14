# Deployment Checklist

1. Create a Firebase project and enable:
   - Authentication: Anonymous and Email/Password
   - Firestore
   - Cloud Functions
   - Firebase Hosting
   - Firebase Storage

2. Create a Firebase web app and copy its config into `js/firebase-config.js`.

3. Add Razorpay keys:
   ```bash
   firebase functions:secrets:set RAZORPAY_KEY_ID
   firebase functions:secrets:set RAZORPAY_KEY_SECRET
   ```
   Also set the public Razorpay key ID in `js/firebase-config.js`.

4. Install dependencies:
   ```bash
   npm install
   cd functions
   npm install
   cd ..
   ```

5. Seed the current menu into Firestore:
   ```bash
   npm run seed:menu
   ```

6. Create the admin staff user in Firebase Auth, then grant admin access:
   ```bash
   npm run admin:set -- owner@example.com
   ```

7. Deploy:
   ```bash
   firebase deploy
   ```

8. Open `/admin/`, sign in with the staff account, and confirm menu items and order status controls work.
