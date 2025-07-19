'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, GoogleAuthProvider, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getApps, initializeApp, getApp, type FirebaseOptions } from 'firebase/app';
import { isFirebaseConfigured, type FirebaseServices, firebaseConfig } from '@/firebase/firebase';
import FirebaseNotConfigured from '@/components/FirebaseNotConfigured';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoaded(true);
      return;
    }

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const googleProvider = new GoogleAuthProvider();

    const services: FirebaseServices = { app, auth, db, googleProvider, config: firebaseConfig };
    setFirebaseServices(services);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoaded(true);
    });
    
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!firebaseServices) return;

    try {
      const { auth, googleProvider, config } = firebaseServices;
      console.log('Browser origin:', window.location.origin);
      console.log('Attempting to sign in with this Firebase config:', config);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Full sign-in error object:", error);
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message || "An unknown error occurred.",
      });
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
