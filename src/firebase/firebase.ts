// This file configures the Firebase connection.
// After these changes are applied, you MUST create a `.env.local` file
// in the root of your project and add your Firebase project's configuration keys.
// Your app will not connect to Firebase until you do.

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

// Initialize Firebase only if it's configured and not already initialized.
if (isFirebaseConfigured && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else if (getApps().length) {
  // If already initialized, get the instances.
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else {
  // If not configured, set to null and the app will show a configuration message.
  // This helps avoid runtime errors.
  app = null as any;
  auth = null as any;
  db = null as any;
  googleProvider = null as any;
}


export { app, auth, db, googleProvider };
