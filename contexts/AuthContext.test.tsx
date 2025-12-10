/**
 * Property-Based Tests for AuthContext
 * Feature: fundfeed-pwa, Property 9: Session persistence across refreshes
 * Validates: Requirements 4.3
 */

import * as fc from 'fast-check';
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { User } from '@supabase/supabase-js';

// Mock Supabase auth module
jest.mock('@/lib/auth', () => ({
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signInWithGoogle: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChange: jest.fn(),
  isAuthConfigured: jest.fn(() => true),
}));

import * as authLib from '@/lib/auth';

// Suppress act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: An update to') ||
       args[0].includes('was not wrapped in act') ||
       args[0].includes('unsubscribe is not a function'))
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
          jest.clearAllMocks();
          
          const mockUser: Partial<User> = {
            id: userData.uid,
            email: userData.email,
            user_metadata: { full_name: userData.displayName },
          };

          // Mock onAuthStateChange to return an unsubscribe function
          (authLib.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
            // Call callback with mock user
            callback(mockUser as User);
            // Return unsubscribe function
            return jest.fn();
          });

          // First render
          const { result: result1, unmount: unmount1 } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(result1.current.loading).toBe(false);
          });

          expect(result1.current.user).toBeTruthy();
          expect(result1.current.user?.id).toBe(userData.uid);
          expect(result1.current.user?.email).toBe(userData.email);

          unmount1();

          // Second render
          const { result: result2, unmount: unmount2 } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
          });

          await waitFor(() => {
            expect(result2.current.loading).toBe(false);
          });

          expect(result2.current.user).toBeTruthy();
          expect(result2.current.user?.id).toBe(userData.uid);
          expect(result2.current.user?.email).toBe(userData.email);
          
          unmount2();
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
          jest.clearAllMocks();
          
          const mockUser: Partial<User> = {
            id: userData.uid,
            email: userData.email,
          };

          let authStateCallback: ((user: User | null) => void) | null = null;

          (authLib.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
            authStateCallback = callback;
            callback(mockUser as User);
            return jest.fn();
          });

          (authLib.signOut as jest.Mock).mockImplementation(async () => {
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

          expect(result.current.user).toBeTruthy();

          await result.current.signOut();

          await waitFor(() => {
            expect(result.current.user).toBeNull();
          }, { timeout: 2000 });

          expect(result.current.user).toBeNull();
          
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
