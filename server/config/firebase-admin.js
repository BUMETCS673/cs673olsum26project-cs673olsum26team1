// AI-USAGE SUMMARY
// Tools: ChatGPT | Claude
// Overall AI Contribution: ~20%
// AI-Assisted Areas: Test scaffolding, authentication flow structure, Firebase env handling, protected route logic
// Human Contributions: Business rules, debugging, project integration, validation, testing, and final verification
// Notes: AI-generated suggestions were reviewed, modified, and manually tested before integration.

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/^"|"$/g, '')
    ?.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

module.exports = admin;

