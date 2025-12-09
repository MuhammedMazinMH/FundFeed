// Firebase Authentication helpers
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import { auth } from './firebase';

// Check if Firebase is configured
export const isFirebaseConfigured = (): boolean => {
  return auth !== null;
};

// Helper to ensure auth is available
const getAuth = (): Auth => {
  if (!auth) {
    console.warn('Firebase Auth is not configured. Please set up your environment variables in .env.local');
    throw new Error('Firebase Auth is not configured. Please set up your environment variables.');
  }
  return auth;
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(getAuth(), email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Create account with email and password
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating account:', error);
    throw error;
  }
};

// Sign in with Google OAuth
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(getAuth(), provider);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(getAuth());
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(getAuth(), callback);
};
