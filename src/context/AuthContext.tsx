'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';

// A mock user for local development
const mockUser: User = {
  uid: 'local-user-01',
  displayName: 'Local User',
  email: 'local@user.com',
  emailVerified: true,
  isAnonymous: false,
  photoURL: 'https://placehold.co/100x100.png',
  providerData: [],
  metadata: {},
  providerId: 'local',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
};

interface AuthContextType {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // In our local-only mode, the user is always "signed in" with our mock user.
  const [user] = useState<User | null>(mockUser);
  const [isAuthLoaded] = useState(true);

  // These functions do nothing in local-only mode.
  const signInWithGoogle = async () => {
    console.log("signInWithGoogle called in local mode. No action taken.");
  };

  const signOutUser = async () => {
    console.log("signOut called in local mode. No action taken.");
    // In a real local-only app, you might want to clear local storage here.
    // For now, we'll keep the user logged in to avoid disruption.
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
