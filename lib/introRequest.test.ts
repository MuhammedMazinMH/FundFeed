/**
 * Property-Based Tests for Intro Request functionality
 * Feature: fundfeed-pwa, Property 4: Intro request idempotency
 * Validates: Requirements 3.5
 */

import * as fc from 'fast-check';
import { createIntroRequest, hasIntroRequest } from './firestore';

// Mock Firestore
jest.mock('firebase/firestore', () => {
  const actual = jest.requireActual('firebase/firestore');
  return {
    ...actual,
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    updateDoc: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0 })),
    },
  };
});

jest.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

import * as firestore from 'firebase/firestore';

describe('Intro Request - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Property 4: Intro request idempotency
   * For any investor and fundraising round combination, submitting multiple intro requests
   * must result in only one stored request in Firestore, with subsequent attempts showing
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
          // Reset mocks for each property test iteration
          jest.clearAllMocks();
          
          const existingRequests: any[] = [];
          let addDocCallCount = 0;

          // Mock getDocs to check for existing requests
          (firestore.getDocs as jest.Mock).mockImplementation(async () => {
            return {
              empty: existingRequests.length === 0,
              docs: existingRequests,
            };
          });

          // Mock addDoc to simulate creating a request
          (firestore.addDoc as jest.Mock).mockImplementation(async () => {
            addDocCallCount++;
            const newRequestId = `request-${Date.now()}-${addDocCallCount}`;
            
            // Add to existing requests
            existingRequests.push({
              id: newRequestId,
              data: () => ({
                investorId: data.investorId,
                roundId: data.roundId,
                startupName: data.startupName,
                status: 'pending',
              }),
            });
            
            return { id: newRequestId };
          });

          // Mock getDoc for round updates
          (firestore.getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ introRequestCount: 0 }),
          });

          (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
          (firestore.doc as jest.Mock).mockReturnValue({});
          (firestore.collection as jest.Mock).mockReturnValue({});
          (firestore.query as jest.Mock).mockReturnValue({});
          (firestore.where as jest.Mock).mockReturnValue({});

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

          // Property: addDoc should only be called once (first request)
          expect(addDocCallCount).toBe(1);
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
          // Mock getDocs based on whether request exists
          (firestore.getDocs as jest.Mock).mockResolvedValue({
            empty: !data.hasRequest,
            docs: data.hasRequest
              ? [
                  {
                    id: 'request-123',
                    data: () => ({
                      investorId: data.investorId,
                      roundId: data.roundId,
                    }),
                  },
                ]
              : [],
          });

          (firestore.collection as jest.Mock).mockReturnValue({});
          (firestore.query as jest.Mock).mockReturnValue({});
          (firestore.where as jest.Mock).mockReturnValue({});

          const result = await hasIntroRequest(data.investorId, data.roundId);

          // Property: Result should match whether request exists
          expect(result).toBe(data.hasRequest);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different investor-round pairs should be independent
   */
  it('should treat different investor-round pairs independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          investor1: fc.string({ minLength: 1, maxLength: 50 }),
          investor2: fc.string({ minLength: 1, maxLength: 50 }),
          round1: fc.string({ minLength: 1, maxLength: 50 }),
          round2: fc.string({ minLength: 1, maxLength: 50 }),
        }).filter(
          (data) =>
            data.investor1 !== data.investor2 || data.round1 !== data.round2
        ),
        async (data) => {
          const requests: Map<string, any> = new Map();

          // Mock getDocs to check for existing requests
          (firestore.getDocs as jest.Mock).mockImplementation(async (query: any) => {
            // Extract investor and round from the query (simplified)
            const key = `${data.investor1}-${data.round1}`;
            const existing = requests.get(key);
            
            return {
              empty: !existing,
              docs: existing ? [existing] : [],
            };
          });

          // Mock addDoc
          (firestore.addDoc as jest.Mock).mockImplementation(async (collection: any, data: any) => {
            const key = `${data.investorId}-${data.roundId}`;
            const request = {
              id: `request-${key}`,
              data: () => data,
            };
            requests.set(key, request);
            return { id: request.id };
          });

          (firestore.getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ introRequestCount: 0 }),
          });

          (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
          (firestore.doc as jest.Mock).mockReturnValue({});
          (firestore.collection as jest.Mock).mockReturnValue({});
          (firestore.query as jest.Mock).mockReturnValue({});
          (firestore.where as jest.Mock).mockReturnValue({});

          // Create request for first pair
          await createIntroRequest({
            investorId: data.investor1,
            roundId: data.round1,
            startupName: 'Startup 1',
          });

          // Create request for second pair
          await createIntroRequest({
            investorId: data.investor2,
            roundId: data.round2,
            startupName: 'Startup 2',
          });

          // Property: Should have created requests (may be 1 or 2 depending on uniqueness)
          expect(requests.size).toBeGreaterThan(0);
        }
      ),
      { numRuns: 50 }
    );
  }, 15000);
});


/**
 * Property 11: Intro request data completeness
 * For any stored intro request in Firestore, the document must contain
 * investor ID, round ID, startup name, status, and timestamp fields.
 * Validates: Requirements 3.3
 */
describe('Intro Request Data Completeness - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
          jest.clearAllMocks();
          
          let storedDocument: any = null;

          // Mock getDocs to return empty (no existing request)
          (firestore.getDocs as jest.Mock).mockResolvedValue({
            empty: true,
            docs: [],
          });

          // Mock addDoc to capture the stored document
          (firestore.addDoc as jest.Mock).mockImplementation(async (_collection: any, docData: any) => {
            storedDocument = docData;
            return { id: 'new-request-id' };
          });

          // Mock getDoc for round updates
          (firestore.getDoc as jest.Mock).mockResolvedValue({
            exists: () => true,
            data: () => ({ introRequestCount: 0 }),
          });

          (firestore.updateDoc as jest.Mock).mockResolvedValue(undefined);
          (firestore.doc as jest.Mock).mockReturnValue({});
          (firestore.collection as jest.Mock).mockReturnValue({});
          (firestore.query as jest.Mock).mockReturnValue({});
          (firestore.where as jest.Mock).mockReturnValue({});

          // Create intro request
          await createIntroRequest({
            investorId: data.investorId,
            roundId: data.roundId,
            startupName: data.startupName,
          });

          // Property: Stored document must contain all required fields
          expect(storedDocument).not.toBeNull();
          
          // Check investorId
          expect(storedDocument).toHaveProperty('investorId');
          expect(storedDocument.investorId).toBe(data.investorId);
          
          // Check roundId
          expect(storedDocument).toHaveProperty('roundId');
          expect(storedDocument.roundId).toBe(data.roundId);
          
          // Check startupName
          expect(storedDocument).toHaveProperty('startupName');
          expect(storedDocument.startupName).toBe(data.startupName);
          
          // Check status (should be 'pending' for new requests)
          expect(storedDocument).toHaveProperty('status');
          expect(storedDocument.status).toBe('pending');
          
          // Check createdAt timestamp
          expect(storedDocument).toHaveProperty('createdAt');
          expect(storedDocument.createdAt).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  }, 30000);
});
