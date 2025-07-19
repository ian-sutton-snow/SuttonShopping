// This file configures the Firebase connection.
// After these changes are applied, you MUST create a `.env.local` file
// in the root of your project and add your Firebase project's configuration keys.
// Your app will not connect to Firebase until you do.

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// This boolean will be true if all required environment variables are set.
export const isFirebaseConfigured =
  !!firebaseConfig.apiKey &&
  !!firebaseConfig.authDomain &&
  !!firebaseConfig.projectId;

// Singleton instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

interface FirebaseServices {
    app: FirebaseApp;
    auth: Auth;
    db: Firestore;
    googleProvider: GoogleAuthProvider;
}

/**
 * Initializes Firebase services on-demand and returns them.
 * This prevents initialization errors when environment variables are not yet loaded.
 * @returns An object containing the initialized Firebase services, or null if not configured.
 */
export function getFirebase(): FirebaseServices | null {
  if (!isFirebaseConfigured) {
    return null;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
  }

  return { app, auth, db, googleProvider };
}
