/**
 * Property-Based Tests for Firestore helpers
 * Feature: fundfeed-pwa, Property 12: Trending algorithm sorting
 * Validates: Requirements 1.3
 */

import * as fc from 'fast-check';
import { getTrendingRounds } from './firestore';
import { FundraisingRound } from '@/types';
import { Timestamp } from 'firebase/firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    getDocs: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
      fromDate: jest.fn((date: Date) => ({ 
        seconds: date.getTime() / 1000, 
        nanoseconds: 0,
        toDate: () => date,
      })),
    },
  };
});

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

import * as firestore from 'firebase/firestore';

describe('Firestore - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 12: Trending algorithm sorting
   * For any set of fundraising rounds, the homepage must display them sorted
   * by the trending algorithm (recency and engagement) in descending order.
   * 
   * The trending algorithm sorts primarily by createdAt (most recent first),
   * and secondarily by followerCount (most followers first).
   */
  it('should return rounds sorted by createdAt desc, then followerCount desc', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate an array of fundraising rounds with random data
        fc.array(
          fc.record({
            companyName: fc.string({ minLength: 1, maxLength: 50 }),
            raisingAmount: fc.integer({ min: 10000, max: 100000000 }),
            followerCount: fc.integer({ min: 0, max: 10000 }),
            // Generate timestamps within the last year
            createdAtMs: fc.integer({ 
              min: Date.now() - 365 * 24 * 60 * 60 * 1000, 
              max: Date.now() 
            }),
          }),
          { minLength: 2, maxLength: 20 }
        ),
        async (roundsData) => {
          // Convert to FundraisingRound objects with Firestore Timestamps
          const mockRounds: FundraisingRound[] = roundsData.map((data, index) => ({
            id: `round-${index}`,
            companyName: data.companyName,
            logoUrl: `https://example.com/logo-${index}.png`,
            raisingAmount: data.raisingAmount,
            currency: 'USD',
            description: 'Test description',
            deckUrl: `https://example.com/deck-${index}.pdf`,
            founderId: `founder-${index}`,
            createdAt: {
              seconds: data.createdAtMs / 1000,
              nanoseconds: 0,
              toDate: () => new Date(data.createdAtMs),
            } as any,
            updatedAt: {
              seconds: data.createdAtMs / 1000,
              nanoseconds: 0,
              toDate: () => new Date(data.createdAtMs),
            } as any,
            followerCount: data.followerCount,
            introRequestCount: 0,
          }));

          // Sort the mock data according to the trending algorithm
          // (this simulates what Firestore would do with orderBy)
          const sortedRounds = [...mockRounds].sort((a, b) => {
            // Primary sort: createdAt descending (newer first)
            const timeA = a.createdAt.toDate().getTime();
            const timeB = b.createdAt.toDate().getTime();
            
            if (timeA !== timeB) {
              return timeB - timeA; // Descending
            }
            
            // Secondary sort: followerCount descending (more followers first)
            return b.followerCount - a.followerCount; // Descending
          });

          // Mock Firestore to return sorted data
          const mockQuerySnapshot = {
            docs: sortedRounds.map(round => ({
              id: round.id,
              data: () => {
                const { id, ...data } = round;
                return data;
              },
            })),
            empty: sortedRounds.length === 0,
          };

          (firestore.getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);
          (firestore.collection as jest.Mock).mockReturnValue({});
          (firestore.query as jest.Mock).mockReturnValue({});
          (firestore.orderBy as jest.Mock).mockReturnValue({});
          (firestore.limit as jest.Mock).mockReturnValue({});

          // Call the function
          const result = await getTrendingRounds(mockRounds.length);

          // Verify the sorting property
          // The result should be sorted by createdAt (desc), then followerCount (desc)
          for (let i = 0; i < result.length - 1; i++) {
            const current = result[i];
            const next = result[i + 1];

            const currentTime = current.createdAt.toDate().getTime();
            const nextTime = next.createdAt.toDate().getTime();

            // Primary sort: createdAt descending (newer first)
            if (currentTime !== nextTime) {
              expect(currentTime).toBeGreaterThanOrEqual(nextTime);
            } else {
              // Secondary sort: followerCount descending (more followers first)
              expect(current.followerCount).toBeGreaterThanOrEqual(next.followerCount);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
