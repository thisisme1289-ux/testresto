const admin = require('firebase-admin');

admin.initializeApp();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run admin:set -- owner@example.com');
    process.exit(1);
  }

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Admin claim set for ${email}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
