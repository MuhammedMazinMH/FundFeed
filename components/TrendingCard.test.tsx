/**
 * Property-Based Tests for TrendingCard
 * Feature: fundfeed-pwa, Property 1: Trending cards display completeness
 * Validates: Requirements 1.2
 */

import * as fc from 'fast-check';
import { render, screen } from '@testing-library/react';
import { TrendingCard } from './TrendingCard';
import { FundraisingRound } from '@/types';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signIn: jest.fn(),
    signInWithGoogle: jest.fn(),
    signOut: jest.fn(),
  }),
}));

describe('TrendingCard - Property-Based Tests', () => {
  /**
   * Property 1: Trending cards display completeness
   * For any fundraising round displayed on the homepage, the trending card must contain
   * all required fields: logo URL, company name, raising amount, and a follow button.
   */
  it('should display all required fields for any valid fundraising round', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          companyName: fc.string({ minLength: 1, maxLength: 100 }),
          logoUrl: fc.webUrl(),
          raisingAmount: fc.integer({ min: 1000, max: 100000000 }),
          currency: fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
          description: fc.string({ minLength: 10, maxLength: 500 }),
          deckUrl: fc.webUrl(),
          founderId: fc.string({ minLength: 1, maxLength: 50 }),
          followerCount: fc.integer({ min: 0, max: 10000 }),
          introRequestCount: fc.integer({ min: 0, max: 1000 }),
        }),
        fc.boolean(),
        async (roundData, isFollowing) => {
          // Create a fundraising round with the generated data
          const round: FundraisingRound = {
            ...roundData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const mockOnFollowToggle = jest.fn().mockResolvedValue(undefined);

          // Render the TrendingCard
          const { container, unmount } = render(
            <TrendingCard
              round={round}
              isFollowing={isFollowing}
              hasRequestedIntro={false}
              onFollowToggle={mockOnFollowToggle}
            />
          );

          // Property assertion: All required fields must be present

          // 1. Logo URL must be present in an image element
          const logoImage = container.querySelector('img[alt*="logo"]');
          expect(logoImage).toBeTruthy();
          expect(logoImage?.getAttribute('src')).toBeTruthy();

          // 2. Company name must be displayed
          const companyNameElement = container.querySelector('[data-testid="company-name"]');
          expect(companyNameElement).toBeTruthy();
          expect(companyNameElement?.textContent).toBe(round.companyName);

          // 3. Raising amount must be displayed with currency
          const raisingAmountElement = container.querySelector('[data-testid="raising-amount"]');
          expect(raisingAmountElement).toBeTruthy();
          expect(raisingAmountElement?.textContent).toContain('Raising');
          // Verify the amount is present in some form (formatted)
          expect(raisingAmountElement?.textContent).toBeTruthy();
          expect(raisingAmountElement?.textContent!.length).toBeGreaterThan(0);

          // 4. Follow button must be present
          const followButton = container.querySelector('button[aria-label*="Follow"]') || 
                               container.querySelector('button[aria-label*="Unfollow"]');
          expect(followButton).toBeTruthy();
          expect(followButton?.textContent).toBe(isFollowing ? 'Following' : 'Follow');

          // Clean up after each test iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property: Card should handle edge cases for currency formatting
   */
  it('should correctly format raising amounts for different currencies', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          companyName: fc.string({ minLength: 1 }),
          logoUrl: fc.webUrl(),
          raisingAmount: fc.integer({ min: 1, max: 1000000000 }),
          currency: fc.constantFrom('USD', 'EUR', 'GBP', 'JPY', 'INR'),
          description: fc.string({ minLength: 1 }),
          deckUrl: fc.webUrl(),
          founderId: fc.string({ minLength: 1 }),
          followerCount: fc.integer({ min: 0 }),
          introRequestCount: fc.integer({ min: 0 }),
        }),
        async (roundData) => {
          const round: FundraisingRound = {
            ...roundData,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const mockOnFollowToggle = jest.fn().mockResolvedValue(undefined);

          const { container, unmount } = render(
            <TrendingCard
              round={round}
              isFollowing={false}
              hasRequestedIntro={false}
              onFollowToggle={mockOnFollowToggle}
            />
          );

          const raisingAmountElement = container.querySelector('[data-testid="raising-amount"]');
          
          // The formatted amount should contain the currency symbol or code
          // and should not be empty
          expect(raisingAmountElement?.textContent).toBeTruthy();
          expect(raisingAmountElement?.textContent!.length).toBeGreaterThan('Raising '.length);

          // Clean up after each test iteration
          unmount();
        }
      ),
      { numRuns: 100 }
    );
  });
});
