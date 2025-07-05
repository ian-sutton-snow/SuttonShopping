// This file is now configured for local-only development.
// The app will use mock data and will not attempt to connect to Firebase.

import type { FirebaseApp } from "firebase/app";
import type { Auth, GoogleAuthProvider } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

export const isFirebaseConfigured = false;

// In local-only mode, these are null to prevent any Firebase connection.
const app: FirebaseApp | null = null;
const auth: Auth | null = null;
const db: Firestore | null = null;
const googleProvider: GoogleAuthProvider | null = null;

export { app, auth, db, googleProvider };
