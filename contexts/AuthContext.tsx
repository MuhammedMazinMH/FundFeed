'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as authSignOut,
  onAuthStateChange,
  isFirebaseConfigured,
} from '@/lib/auth';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signUp: (email: string, password: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is configured
    if (!isFirebaseConfigured()) {
      console.warn('Firebase is not configured. Auth features will be disabled.');
      setLoading(false);
      return;
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const user = await signInWithEmail(email, password);
    return user;
  };

  const signUp = async (email: string, password: string) => {
    const user = await signUpWithEmail(email, password);
    return user;
  };

  const signInWithGoogleProvider = async () => {
    const user = await signInWithGoogle();
    return user;
  };

  const signOut = async () => {
    await authSignOut();
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleProvider,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
