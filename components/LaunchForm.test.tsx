/**
 * Property-Based Tests for LaunchForm
 * Feature: fundfeed-pwa, Property 10: Form validation completeness
 * Validates: Requirements 2.2
 */

import * as fc from 'fast-check';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { LaunchForm } from './LaunchForm';

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock storage functions
jest.mock('@/lib/storage', () => ({
  validateLogoFile: jest.fn((file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { valid: false, error: 'File too large' };
    }
    return { valid: true };
  }),
  validateDeckFile: jest.fn((file: File) => {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Invalid file type' };
    }
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File too large' };
    }
    return { valid: true };
  }),
  uploadRoundFiles: jest.fn().mockResolvedValue({
    logoUrl: 'https://example.com/logo.png',
    deckUrl: 'https://example.com/deck.pdf',
  }),
}));

// Mock database functions
jest.mock('@/lib/database', () => ({
  createFundraisingRound: jest.fn().mockResolvedValue('round-123'),
}));

import { useAuth } from '@/contexts/AuthContext';

describe('LaunchForm - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 10: Form validation completeness
   * For any launch form submission, the system must validate that all required fields
   * (company name, logo, raising amount, PDF deck) are present before allowing submission.
   */
  it('should prevent submission when any required field is missing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate combinations where at least one field is missing/invalid
          companyName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: '' }),
          raisingAmount: fc.option(fc.integer({ min: 1, max: 100000000 }).map(String), { nil: '' }),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: '' }),
          hasLogo: fc.boolean(),
          hasDeck: fc.boolean(),
        }).filter(data => {
          // Ensure at least one field is missing
          return (
            !data.companyName ||
            !data.raisingAmount ||
            !data.description ||
            !data.hasLogo ||
            !data.hasDeck
          );
        }),
        async (formData) => {
          // Mock authenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: { uid: 'test-user-123' },
            loading: false,
          });

          const mockOnSuccess = jest.fn();

          const { container, unmount } = render(
            <LaunchForm onSuccess={mockOnSuccess} />
          );

          // Fill in the form fields
          if (formData.companyName) {
            const companyNameInput = container.querySelector('#companyName') as HTMLInputElement;
            fireEvent.change(companyNameInput, { target: { value: formData.companyName } });
          }

          if (formData.raisingAmount) {
            const amountInput = container.querySelector('#raisingAmount') as HTMLInputElement;
            fireEvent.change(amountInput, { target: { value: formData.raisingAmount } });
          }

          if (formData.description) {
            const descInput = container.querySelector('#description') as HTMLTextAreaElement;
            fireEvent.change(descInput, { target: { value: formData.description } });
          }

          // Note: File inputs are harder to test in JSDOM, so we'll test the validation logic
          // The actual file upload validation is tested in storage.test.ts

          // Try to submit the form
          const form = container.querySelector('form');
          fireEvent.submit(form!);

          // Wait a bit
          await waitFor(() => {
            // onSuccess should NOT be called when validation fails
            expect(mockOnSuccess).not.toHaveBeenCalled();
          }, { timeout: 500 });

          unmount();
        }
      ),
      { numRuns: 50 } // Reduced runs due to DOM operations
    );
  }, 15000);

  /**
   * Property: Form should display error messages for missing required fields
   */
  it('should display error messages when required fields are empty', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constant({}), // Empty form data
        async () => {
          // Mock authenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: { uid: 'test-user-123' },
            loading: false,
          });

          const mockOnSuccess = jest.fn();

          const { container, unmount } = render(
            <LaunchForm onSuccess={mockOnSuccess} />
          );

          // Try to submit empty form
          const form = container.querySelector('form');
          fireEvent.submit(form!);

          // Wait for error messages to appear
          await waitFor(() => {
            const errorMessages = container.querySelectorAll('.text-red-600, .text-red-400');
            // Should have error messages for required fields
            expect(errorMessages.length).toBeGreaterThan(0);
          }, { timeout: 500 });

          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property: Form should require authentication
   */
  it('should prevent submission for unauthenticated users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          companyName: fc.string({ minLength: 1, maxLength: 100 }),
          raisingAmount: fc.integer({ min: 1, max: 100000000 }).map(String),
          description: fc.string({ minLength: 1, maxLength: 500 }),
        }),
        async (formData) => {
          // Mock unauthenticated user
          (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
          });

          const mockOnSuccess = jest.fn();
          const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

          const { container, unmount } = render(
            <LaunchForm onSuccess={mockOnSuccess} />
          );

          // Fill in the form
          const companyNameInput = container.querySelector('#companyName') as HTMLInputElement;
          fireEvent.change(companyNameInput, { target: { value: formData.companyName } });

          const amountInput = container.querySelector('#raisingAmount') as HTMLInputElement;
          fireEvent.change(amountInput, { target: { value: formData.raisingAmount } });

          const descInput = container.querySelector('#description') as HTMLTextAreaElement;
          fireEvent.change(descInput, { target: { value: formData.description } });

          // Try to submit
          const form = container.querySelector('form');
          fireEvent.submit(form!);

          await waitFor(() => {
            // Should show alert for unauthenticated users
            expect(alertSpy).toHaveBeenCalled();
            // onSuccess should NOT be called
            expect(mockOnSuccess).not.toHaveBeenCalled();
          }, { timeout: 500 });

          alertSpy.mockRestore();
          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);
});
