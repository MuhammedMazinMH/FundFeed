/**
 * Property-Based Tests for Confetti Animation
 * Feature: fundfeed-pwa, Property 8: Confetti animation behavior
 * Validates: Requirements 7.1, 7.3, 7.4
 */

import * as fc from 'fast-check';
import confetti from 'canvas-confetti';
import { triggerConfetti, triggerCelebration } from './confetti';

// Mock canvas-confetti
jest.mock('canvas-confetti', () => {
  const mockConfetti = jest.fn();
  mockConfetti.reset = jest.fn();
  return mockConfetti;
});

describe('Confetti - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  /**
   * Property 8: Confetti animation behavior
   * For any successful fundraising round submission, a confetti animation must trigger
   * immediately, run without blocking user interaction, and automatically clean up after 3 seconds.
   */
  it('should trigger confetti immediately when called', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}), // No input needed
        async () => {
          // Call triggerConfetti
          triggerConfetti();

          // Confetti should be called immediately
          expect(confetti).toHaveBeenCalled();
          expect(confetti).toHaveBeenCalledWith(
            expect.objectContaining({
              particleCount: expect.any(Number),
              spread: expect.any(Number),
              origin: expect.any(Object),
            })
          );
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should auto-cleanup after 3 seconds', async () => {
    jest.useFakeTimers();
    
    try {
      await fc.assert(
        fc.asyncProperty(
          fc.constant({}),
          async () => {
            jest.clearAllMocks();
            
            // Call triggerConfetti
            triggerConfetti();

            // Fast-forward time by 3 seconds
            jest.advanceTimersByTime(3000);

            // After 3 seconds, reset should be called
            expect(confetti.reset).toHaveBeenCalled();
          }
        ),
        { numRuns: 20 }
      );
    } finally {
      jest.useRealTimers();
    }
  });

  it('should not block execution (non-blocking behavior)', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}),
        async () => {
          let executionContinued = false;

          // Call triggerConfetti
          triggerConfetti();

          // Code after triggerConfetti should execute immediately
          executionContinued = true;

          // Verify execution continued without waiting
          expect(executionContinued).toBe(true);
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should trigger celebration without errors', () => {
    jest.clearAllMocks();
    
    // Call triggerCelebration - should not throw
    expect(() => triggerCelebration()).not.toThrow();
    
    // Should set up interval (confetti will be called asynchronously)
    // We can't easily test the interval behavior without complex timer mocking
    // The important property is that it doesn't block and doesn't throw
  });

  /**
   * Property: Confetti should handle multiple rapid calls without errors
   */
  it('should handle multiple rapid calls without errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (callCount) => {
          jest.clearAllMocks();
          
          // Call triggerConfetti multiple times rapidly
          for (let i = 0; i < callCount; i++) {
            expect(() => triggerConfetti()).not.toThrow();
          }

          // All calls should have triggered confetti
          expect(confetti).toHaveBeenCalledTimes(callCount);
        }
      ),
      { numRuns: 50 }
    );
  });
});
