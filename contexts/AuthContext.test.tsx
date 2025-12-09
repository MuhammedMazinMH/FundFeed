/**
 * Property-Based Tests for AuthContext
 * Feature: fundfeed-pwa, Property 9: Session persistence across refreshes
 * Validates: Requirements 4.3
 */

import * as fc from 'fast-check';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { User as FirebaseUser } from 'firebase/auth';

// Mock Firebase auth module
jest.mock('@/lib/auth', () => ({
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
  isFirebaseConfigured: jest.fn(() => true),
}));

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
  storage: {},
}));

import * as authLib from '@/lib/auth';

// Suppress act() warnings for this test file since we're testing async Firebase behavior
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: An update to') &&
      args[0].includes('was not wrapped in act')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('AuthContext - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 9: Session persistence across refreshes
   * For any authenticated user, refreshing the page must maintain the session
   * without requiring re-authentication until explicit sign-out.
   */
  it('should persist session across component remounts (simulating page refresh)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          uid: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          displayName: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (userData) => {
          // Create a mock Firebase user
          const mockUser: Partial<FirebaseUser> = {
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
          };

          let authStateCallback: ((user: FirebaseUser | null) => void) | null = null;

          // Mock onAuthStateChange to capture the callback
          (authLib.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
            authStateCallback = callback;
            // Call immediately with mock user (Firebase does this synchronously)
            callback(mockUser as FirebaseUser);
            return jest.fn(); // Return unsubscribe function
          });

          // First render - simulating initial page load with existing session
          const { result: result1, unmount: unmount1 } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          // Wait for auth state to be set
          await waitFor(() => {
            expect(result1.current.loading).toBe(false);
          });

          // Verify user is set from persisted session
          expect(result1.current.user).toBeTruthy();
          expect(result1.current.user?.uid).toBe(userData.uid);
          expect(result1.current.user?.email).toBe(userData.email);

          // Unmount (simulating page navigation away)
          unmount1();

          // Second render - simulating page refresh/return
          const { result: result2 } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          // Wait for auth state to be set again
          await waitFor(() => {
            expect(result2.current.loading).toBe(false);
          });

          // Verify session persisted - user should still be authenticated
          expect(result2.current.user).toBeTruthy();
          expect(result2.current.user?.uid).toBe(userData.uid);
          expect(result2.current.user?.email).toBe(userData.email);
        }
      ),
      { numRuns: 100 }
    );
  }, 15000);

  /**
   * Additional property: Session should be cleared after explicit sign-out
   */
  it('should clear session after explicit sign-out', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          uid: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
        }),
        async (userData) => {
          // Clear mocks for each iteration
          jest.clearAllMocks();
          
          const mockUser: Partial<FirebaseUser> = {
            uid: userData.uid,
            email: userData.email,
          };

          let authStateCallback: ((user: FirebaseUser | null) => void) | null = null;

          (authLib.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
            authStateCallback = callback;
            // Call immediately with mock user (Firebase does this synchronously)
            callback(mockUser as FirebaseUser);
            return jest.fn();
          });

          (authLib.signOut as jest.Mock).mockImplementation(async () => {
            // Simulate Firebase clearing the session by calling the callback with null
            if (authStateCallback) {
              authStateCallback(null);
            }
          });

          const { result, unmount } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(result.current.loading).toBe(false);
          }, { timeout: 2000 });

          // User should be authenticated initially
          expect(result.current.user).toBeTruthy();

          // Sign out - this should trigger the auth state callback with null
          await result.current.signOut();

          // Wait for the state to update
          await waitFor(() => {
            expect(result.current.user).toBeNull();
          }, { timeout: 2000 });

          // After sign-out, user should be null
          expect(result.current.user).toBeNull();
          
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
