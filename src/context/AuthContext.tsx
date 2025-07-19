'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirebase, isFirebaseConfigured } from '@/firebase/firebase';
import FirebaseNotConfigured from '@/components/FirebaseNotConfigured';

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoaded(true); // Stop if Firebase is not configured.
      return;
    }

    const firebaseServices = getFirebase();
    if (firebaseServices) {
      const { auth } = firebaseServices;
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setIsAuthLoaded(true);
      });
      // Cleanup subscription on unmount
      return () => unsubscribe();
    }
  }, []);

  const signInWithGoogle = async () => {
    const firebaseServices = getFirebase();
    if (!firebaseServices) return;
    try {
      const { auth, googleProvider } = firebaseServices;
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  const signOutUser = async () => {
    const firebaseServices = getFirebase();
    if (!firebaseServices) return;
    try {
      const { auth } = firebaseServices;
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // If Firebase keys are missing, render a message instead of the app
  if (!isFirebaseConfigured) {
    return <FirebaseNotConfigured />;
  }
  
  return (
    <AuthContext.Provider value={{ user, signInWithGoogle, signOut: signOutUser, isAuthLoaded }}>
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
