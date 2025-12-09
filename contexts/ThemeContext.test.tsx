/**
 * Property-Based Tests for ThemeContext
 * Feature: fundfeed-pwa, Property 6: Theme persistence and restoration
 * Validates: Requirements 6.1, 6.3, 6.4
 */

import * as fc from 'fast-check';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from './ThemeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia for system preference detection
const createMatchMediaMock = (matches: boolean) => {
  return jest.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
};

describe('ThemeContext - Property-Based Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.classList.remove('dark');
  });

  /**
   * Property 6: Theme persistence and restoration
   * For any theme selection (light or dark), the system must persist the choice
   * to localStorage and restore it on subsequent visits.
   */
  it('should persist theme to localStorage and restore on remount', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        async (selectedTheme) => {
          // Clear localStorage before each property test iteration
          localStorageMock.clear();
          document.documentElement.classList.remove('dark');

          // Mock system preference to be opposite of selected theme
          const systemPrefersDark = selectedTheme === 'light';
          window.matchMedia = createMatchMediaMock(systemPrefersDark);

          // First render - user selects a theme
          const { result: result1, unmount: unmount1 } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
          });

          // Wait for component to mount
          await waitFor(() => {
            expect(result1.current).toBeDefined();
          }, { timeout: 2000 });

          // User toggles to desired theme
          await act(async () => {
            result1.current.toggleTheme();
          });

          // Verify theme is set correctly
          expect(result1.current.theme).toBe(selectedTheme);

          // Verify localStorage has the theme
          expect(localStorageMock.getItem('theme')).toBe(selectedTheme);

          // Unmount
          unmount1();

          // Second render - simulating page refresh
          const { result: result2 } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
          });

          // Wait for component to mount and restore theme
          await waitFor(() => {
            expect(result2.current).toBeDefined();
          }, { timeout: 2000 });

          // Verify theme was restored from localStorage
          expect(result2.current.theme).toBe(selectedTheme);
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property: System preference detection on first visit
   * When no theme is saved in localStorage, the system must detect and apply
   * the user's system color scheme preference.
   */
  it('should detect system preference when no saved theme exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        async (systemPrefersDark) => {
          // Clear localStorage to simulate first visit
          localStorageMock.clear();
          document.documentElement.classList.remove('dark');

          // Mock system preference BEFORE rendering
          window.matchMedia = createMatchMediaMock(systemPrefersDark);

          // Render with no saved preference
          const { result, unmount } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
          });

          // Wait for component to mount and detect system preference
          await waitFor(() => {
            expect(result.current).toBeDefined();
          }, { timeout: 2000 });

          // Verify theme matches system preference
          const expectedTheme = systemPrefersDark ? 'dark' : 'light';
          expect(result.current.theme).toBe(expectedTheme);

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property: Theme toggle switches between light and dark
   * For any current theme state, toggling must switch to the opposite theme
   * and persist the change.
   */
  it('should toggle between light and dark themes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('light' as const, 'dark' as const),
        async (initialTheme) => {
          // Set initial theme in localStorage
          localStorageMock.clear();
          localStorageMock.setItem('theme', initialTheme);
          document.documentElement.classList.remove('dark');

          window.matchMedia = createMatchMediaMock(false);

          const { result, unmount } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
          });

          await waitFor(() => {
            expect(result.current).toBeDefined();
          }, { timeout: 2000 });

          // Verify initial theme
          expect(result.current.theme).toBe(initialTheme);

          // Toggle theme
          await act(async () => {
            result.current.toggleTheme();
          });

          // Verify theme switched to opposite
          const expectedTheme = initialTheme === 'light' ? 'dark' : 'light';
          expect(result.current.theme).toBe(expectedTheme);

          // Verify localStorage was updated
          expect(localStorageMock.getItem('theme')).toBe(expectedTheme);

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property: Saved preference overrides system preference
   * When a theme is saved in localStorage, it must take precedence over
   * system preference.
   */
  it('should prioritize saved theme over system preference', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          savedTheme: fc.constantFrom('light' as const, 'dark' as const),
          systemPrefersDark: fc.boolean(),
        }),
        async ({ savedTheme, systemPrefersDark }) => {
          // Set saved theme in localStorage BEFORE mocking matchMedia
          localStorageMock.clear();
          localStorageMock.setItem('theme', savedTheme);
          document.documentElement.classList.remove('dark');

          // Mock system preference
          window.matchMedia = createMatchMediaMock(systemPrefersDark);

          const { result, unmount } = renderHook(() => useTheme(), {
            wrapper: ThemeProvider,
          });

          await waitFor(() => {
            expect(result.current).toBeDefined();
          }, { timeout: 2000 });

          // Verify saved theme takes precedence
          expect(result.current.theme).toBe(savedTheme);

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);
});
