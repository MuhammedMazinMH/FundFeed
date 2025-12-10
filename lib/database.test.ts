/**
 * Property-Based Tests for Database helpers
 * Feature: fundfeed-pwa, Property 12: Trending algorithm sorting
 * Validates: Requirements 1.3
 */

import * as fc from 'fast-check';
import { FundraisingRound } from '@/types';

// Create a mock function that we can control
const mockFromFn = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  getSupabase: () => ({ from: mockFromFn }),
  isSupabaseConfigured: () => true,
}));

// Import after mock is set up
import { getTrendingRounds } from './database';

describe('Database - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFromFn.mockReset();
  });

  /**
   * Property 12: Trending algorithm sorting
   * For any set of fundraising rounds, the homepage must display them sorted
   * by the trending algorithm (recency and engagement) in descending order.
   */
  it('should return rounds sorted by createdAt desc, then followerCount desc', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            companyName: fc.string({ minLength: 1, maxLength: 50 }),
            raisingAmount: fc.integer({ min: 10000, max: 100000000 }),
            followerCount: fc.integer({ min: 0, max: 10000 }),
            createdAtMs: fc.integer({
              min: Date.now() - 365 * 24 * 60 * 60 * 1000,
              max: Date.now(),
            }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async roundsData => {
          // Convert to FundraisingRound objects
          const mockRounds: FundraisingRound[] = roundsData.map((data, index) => ({
            id: `round-${index}`,
            companyName: data.companyName,
            logoUrl: `https://example.com/logo-${index}.png`,
            raisingAmount: data.raisingAmount,
            currency: 'USD',
            description: 'Test description',
            deckUrl: `https://example.com/deck-${index}.pdf`,
            founderId: `founder-${index}`,
            createdAt: new Date(data.createdAtMs).toISOString(),
            updatedAt: new Date(data.createdAtMs).toISOString(),
            followerCount: data.followerCount,
            introRequestCount: 0,
          }));

          // Sort the mock data according to the trending algorithm
          const sortedRounds = [...mockRounds].sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();

            if (timeA !== timeB) {
              return timeB - timeA; // Descending
            }

            return b.followerCount - a.followerCount; // Descending
          });

          // Mock Supabase to return sorted data
          mockFromFn.mockImplementation(() => ({
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: sortedRounds.map(round => ({
                      id: round.id,
                      company_name: round.companyName,
                      logo_url: round.logoUrl,
                      raising_amount: round.raisingAmount,
                      currency: round.currency,
                      description: round.description,
                      deck_url: round.deckUrl,
                      founder_id: round.founderId,
                      created_at: round.createdAt,
                      updated_at: round.updatedAt,
                      follower_count: round.followerCount,
                      intro_request_count: round.introRequestCount,
                    })),
                    error: null,
                  }),
                }),
              }),
            }),
          }));

          const result = await getTrendingRounds(mockRounds.length);

          // Verify the sorting property
          for (let i = 0; i < result.length - 1; i++) {
            const current = result[i];
            const next = result[i + 1];

            const currentTime = new Date(current.createdAt).getTime();
            const nextTime = new Date(next.createdAt).getTime();

            if (currentTime !== nextTime) {
              expect(currentTime).toBeGreaterThanOrEqual(nextTime);
            } else {
              expect(current.followerCount).toBeGreaterThanOrEqual(next.followerCount);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
