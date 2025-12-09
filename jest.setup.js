// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
}));

// Mock Storage functions
jest.mock('firebase/storage', () => ({
  getStorage: jest.fn(() => ({})),
}));
