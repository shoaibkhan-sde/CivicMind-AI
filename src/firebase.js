/**
 * @fileoverview Firebase initialization for CivicMind AI.
 * Exports pre-configured Firebase Auth, Realtime Database instances,
 * and the Google Auth provider. All config sourced from env vars.
 * Fails gracefully when env vars are not configured.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

/** @type {import('firebase/app').FirebaseOptions} Firebase project config */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app = null;
let auth = null;
let database = null;
let googleProvider = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    database = getDatabase(app);
    googleProvider = new GoogleAuthProvider();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[CivicMind] Firebase initialization failed — running in demo mode:', err.message);
    app = null;
    auth = null;
    database = null;
    googleProvider = null;
  }
}

export { auth, database, googleProvider };
export default app;

