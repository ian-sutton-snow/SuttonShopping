'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { firebaseConfig, isFirebaseConfigured, type FirebaseServices } from '@/firebase/firebase';
import FirebaseNotConfigured from '@/components/FirebaseNotConfigured';

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthLoaded: boolean;
  firebaseServices: FirebaseServices | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [firebaseServices, setFirebaseServices] = useState<FirebaseServices | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoaded(true);
      return;
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    const services = { app, auth, db, googleProvider };
    setFirebaseServices(services);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoaded(true);
    });
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseServices) return;
    try {
      const { auth, googleProvider } = firebaseServices;
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signOutUser = async () => {
    if (!firebaseServices) return;
    try {
      const { auth } = firebaseServices;
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }
  
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut: signOutUser, isAuthLoaded, firebaseServices }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
