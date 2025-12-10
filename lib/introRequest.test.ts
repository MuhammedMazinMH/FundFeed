/**
 * Property-Based Tests for Intro Request functionality
 * Feature: fundfeed-pwa, Property 4: Intro request idempotency
 * Validates: Requirements 3.5
 */

import * as fc from 'fast-check';

// Create a mock function that we can control
const mockFromFn = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: { from: jest.fn() },
  getSupabase: () => ({ from: mockFromFn }),
  isSupabaseConfigured: () => true,
}));

// Import after mock is set up
import { createIntroRequest, hasIntroRequest } from './firestore';

describe('Intro Request - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFromFn.mockReset();
  });

  /**
   * Property 4: Intro request idempotency
   * For any investor and fundraising round combination, submitting multiple intro requests
   * must result in only one stored request, with subsequent attempts showing
   * "Intro Requested" status.
   */
  it('should ensure only one intro request exists per investor-round pair', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          investorId: fc.string({ minLength: 1, maxLength: 50 }),
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          startupName: fc.string({ minLength: 1, maxLength: 100 }),
          requestCount: fc.integer({ min: 1, max: 5 }),
        }),
        async (data) => {
          mockFromFn.mockReset();
          
          const existingRequests: any[] = [];
          let insertCallCount = 0;

          mockFromFn.mockImplementation((table: string) => {
            if (table === 'intro_requests') {
              return {
                select: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      maybeSingle: jest.fn().mockResolvedValue({
                        data: existingRequests.length > 0 ? existingRequests[0] : null,
                        error: null,
                      }),
                    }),
                  }),
                }),
                insert: jest.fn().mockImplementation((insertData: any) => {
                  insertCallCount++;
                  const newRequest = {
                    id: `request-${Date.now()}-${insertCallCount}`,
                    ...insertData,
                  };
                  existingRequests.push(newRequest);
                  return {
                    select: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({
                        data: newRequest,
                        error: null,
                      }),
                    }),
                  };
                }),
              };
            }
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: { intro_request_count: 0 }, error: null }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            };
          });

          // Submit multiple intro requests for the same investor-round pair
          const requestIds: string[] = [];
          for (let i = 0; i < data.requestCount; i++) {
            const requestId = await createIntroRequest({
              investorId: data.investorId,
              roundId: data.roundId,
              startupName: data.startupName,
            });
            requestIds.push(requestId);
          }

          // Property: All requests should return the same ID (idempotency)
          const uniqueIds = new Set(requestIds);
          expect(uniqueIds.size).toBe(1);

          // Property: Only one request should be stored
          expect(existingRequests.length).toBe(1);

          // Property: insert should only be called once (first request)
          expect(insertCallCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);

  /**
   * Property: hasIntroRequest should correctly identify existing requests
   */
  it('should correctly identify when an intro request exists', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          investorId: fc.string({ minLength: 1, maxLength: 50 }),
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          hasRequest: fc.boolean(),
        }),
        async (data) => {
          mockFromFn.mockImplementation(() => ({
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  maybeSingle: jest.fn().mockResolvedValue({
                    data: data.hasRequest ? { id: 'request-123' } : null,
                    error: null,
                  }),
                }),
              }),
            }),
          }));

          const result = await hasIntroRequest(data.investorId, data.roundId);

          expect(result).toBe(data.hasRequest);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 11: Intro request data completeness
 * Validates: Requirements 3.3
 */
describe('Intro Request Data Completeness - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFromFn.mockReset();
  });

  it('should store all required fields in intro request documents', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          investorId: fc.string({ minLength: 1, maxLength: 50 }),
          roundId: fc.string({ minLength: 1, maxLength: 50 }),
          startupName: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async (data) => {
          mockFromFn.mockReset();
          
          let storedDocument: any = null;

          mockFromFn.mockImplementation((table: string) => {
            if (table === 'intro_requests') {
              return {
                select: jest.fn().mockReturnValue({
                  eq: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                      maybeSingle: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                      }),
                    }),
                  }),
                }),
                insert: jest.fn().mockImplementation((insertData: any) => {
                  storedDocument = insertData;
                  return {
                    select: jest.fn().mockReturnValue({
                      single: jest.fn().mockResolvedValue({
                        data: { id: 'new-request-id', ...insertData },
                        error: null,
                      }),
                    }),
                  };
                }),
              };
            }
            return {
              select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                  single: jest.fn().mockResolvedValue({ data: { intro_request_count: 0 }, error: null }),
                }),
              }),
              update: jest.fn().mockReturnValue({
                eq: jest.fn().mockResolvedValue({ data: null, error: null }),
              }),
            };
          });

          await createIntroRequest({
            investorId: data.investorId,
            roundId: data.roundId,
            startupName: data.startupName,
          });

          expect(storedDocument).not.toBeNull();
          expect(storedDocument).toHaveProperty('investor_id');
          expect(storedDocument.investor_id).toBe(data.investorId);
          expect(storedDocument).toHaveProperty('round_id');
          expect(storedDocument.round_id).toBe(data.roundId);
          expect(storedDocument).toHaveProperty('startup_name');
          expect(storedDocument.startup_name).toBe(data.startupName);
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
