/**
 * Property-Based Tests for FollowButton
 * Feature: fundfeed-pwa, Property 5: Follow state consistency
 * Validates: Requirements 10.2, 10.3, 10.4, 10.5
 */

import * as fc from 'fast-check';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FollowButton } from './FollowButton';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('FollowButton - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 5: Follow state consistency
   * For any user and fundraising round, the follow button state (Follow/Following)
   * must accurately reflect whether the round ID exists in the user's followedRounds array.
   */
  it('should display correct state based on isFollowing prop', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          userId: fc.string({ minLength: 1, maxLength: 50 }),
          isFollowing: fc.boolean(),
        }),
        async (data) => {
          // Mock authenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: { uid: data.userId },
            loading: false,
          });

          const mockOnToggle = jest.fn().mockResolvedValue(undefined);

          const { container, unmount } = render(
            <FollowButton
              roundId={data.roundId}
              isFollowing={data.isFollowing}
              onToggle={mockOnToggle}
            />
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();

          // Property: Button text must match isFollowing state
          if (data.isFollowing) {
            expect(button?.textContent).toBe('Following');
            expect(button?.getAttribute('aria-label')).toContain('Unfollow');
          } else {
            expect(button?.textContent).toBe('Follow');
            expect(button?.getAttribute('aria-label')).toContain('Follow');
          }

          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Follow/unfollow toggle should update state correctly
   */
  it('should call onToggle when clicked by authenticated user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          userId: fc.string({ minLength: 1, maxLength: 50 }),
          initialFollowState: fc.boolean(),
        }),
        async (data) => {
          // Mock authenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: { uid: data.userId },
            loading: false,
          });

          const mockOnToggle = jest.fn().mockResolvedValue(undefined);

          const { container, unmount } = render(
            <FollowButton
              roundId={data.roundId}
              isFollowing={data.initialFollowState}
              onToggle={mockOnToggle}
            />
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();

          // Click the button
          fireEvent.click(button!);

          // Wait for async operation
          await waitFor(() => {
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
          }, { timeout: 2000 });

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property: Unauthenticated users should not be able to follow
   */
  it('should require authentication before allowing follow action', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          isFollowing: fc.boolean(),
        }),
        async (data) => {
          // Mock unauthenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
          });

          const mockOnToggle = jest.fn().mockResolvedValue(undefined);
          const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

          const { container, unmount } = render(
            <FollowButton
              roundId={data.roundId}
              isFollowing={data.isFollowing}
              onToggle={mockOnToggle}
            />
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();

          // Click the button
          fireEvent.click(button!);

          // Wait a bit for any async operations
          await waitFor(() => {
            // onToggle should NOT be called for unauthenticated users
            expect(mockOnToggle).not.toHaveBeenCalled();
            // Alert should be shown
            expect(alertSpy).toHaveBeenCalled();
          }, { timeout: 2000 });

          alertSpy.mockRestore();
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 30000);

  /**
   * Property: Button should handle loading state during toggle operation
   */
  it('should show loading state during async toggle operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          userId: fc.string({ minLength: 1, maxLength: 50 }),
          isFollowing: fc.boolean(),
          delayMs: fc.integer({ min: 10, max: 100 }),
        }),
        async (data) => {
          // Mock authenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: { uid: data.userId },
            loading: false,
          });

          // Mock onToggle with delay
          const mockOnToggle = jest.fn().mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, data.delayMs))
          );

          const { container, unmount } = render(
            <FollowButton
              roundId={data.roundId}
              isFollowing={data.isFollowing}
              onToggle={mockOnToggle}
            />
          );

          const button = container.querySelector('button');
          expect(button).toBeTruthy();

          // Click the button
          fireEvent.click(button!);

          // During loading, button should show "Loading..." and be disabled
          await waitFor(() => {
            expect(button?.textContent).toBe('Loading...');
            expect(button?.disabled).toBe(true);
          }, { timeout: 50 });

          // Wait for operation to complete
          await waitFor(() => {
            expect(mockOnToggle).toHaveBeenCalledTimes(1);
          }, { timeout: data.delayMs + 100 });

          unmount();
        }
      ),
      { numRuns: 50 } // Reduced runs due to delays
    );
  }, 15000);
});
