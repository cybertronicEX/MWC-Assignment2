const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin using Environment Variables
// We support either a full JSON string in FIREBASE_SERVICE_ACCOUNT
// OR individual fields.

let serviceAccount;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_PRIVATE_KEY &&
        process.env.FIREBASE_CLIENT_EMAIL
    ) {
        serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines in env var
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        };
    } else {
        // Fallback to file for local dev convenience if envs are missing
        try {
            serviceAccount = require('../serviceAccountKey.json');
        } catch {
            throw new Error('No service account configuration found (Env vars or file).');
        }
    }

    // Construct storage bucket if not provided
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId}.appspot.com`;

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket
    });
    console.log('Firebase Admin Initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    console.warn('Backend authentication will fail.');
}

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();
const bucket = storage.bucket(); // Uses the default bucket defined in initializeApp

module.exports = { admin, db, auth, bucket };
