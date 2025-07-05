'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/firebase';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
        duration: 3000,
      });
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      toast({
        title: 'Sign-in failed',
        description: 'There was a problem signing you in. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
       toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
        duration: 3000,
      });
    } catch (error) {
       console.error("Error signing out: ", error);
       toast({
        title: 'Sign-out failed',
        description: 'There was a problem signing you out. Please try again.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

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
