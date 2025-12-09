// Firestore CRUD operations and helpers
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import { FundraisingRound, User, IntroRequest } from '@/types';

// Helper to ensure db is available
const getDb = (): Firestore => {
  if (!db) {
    throw new Error('Firebase is not configured. Please set up your environment variables.');
  }
  return db;
};

// ============================================
// FUNDRAISING ROUNDS
// ============================================

/**
 * Create a new fundraising round
 */
export const createFundraisingRound = async (
  roundData: Omit<FundraisingRound, 'id' | 'createdAt' | 'updatedAt' | 'followerCount' | 'introRequestCount'>
): Promise<string> => {
  const now = Timestamp.now();
  const roundsRef = collection(getDb(), 'fundraising_rounds');
  
  const newRound = {
    ...roundData,
    createdAt: now,
    updatedAt: now,
    followerCount: 0,
    introRequestCount: 0,
  };
  
  const docRef = await addDoc(roundsRef, newRound);
  return docRef.id;
};

/**
 * Get a single fundraising round by ID
 */
export const getFundraisingRound = async (roundId: string): Promise<FundraisingRound | null> => {
  const roundRef = doc(getDb(), 'fundraising_rounds', roundId);
  const roundSnap = await getDoc(roundRef);
  
  if (!roundSnap.exists()) {
    return null;
  }
  
  return {
    id: roundSnap.id,
    ...roundSnap.data(),
  } as FundraisingRound;
};

/**
 * Get trending fundraising rounds (sorted by recency and engagement)
 * Trending algorithm: Sort by createdAt (descending) and followerCount (descending)
 */
export const getTrendingRounds = async (limitCount: number = 20): Promise<FundraisingRound[]> => {
  const roundsRef = collection(getDb(), 'fundraising_rounds');
  
  // Primary sort by createdAt (recency), secondary by followerCount (engagement)
  const q = query(
    roundsRef,
    orderBy('createdAt', 'desc'),
    orderBy('followerCount', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FundraisingRound));
};

/**
 * Update a fundraising round
 */
export const updateFundraisingRound = async (
  roundId: string,
  updates: Partial<Omit<FundraisingRound, 'id' | 'createdAt'>>
): Promise<void> => {
  const roundRef = doc(getDb(), 'fundraising_rounds', roundId);
  await updateDoc(roundRef, {
    ...updates,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Delete a fundraising round
 */
export const deleteFundraisingRound = async (roundId: string): Promise<void> => {
  const roundRef = doc(getDb(), 'fundraising_rounds', roundId);
  await deleteDoc(roundRef);
};

// ============================================
// USER PROFILE MANAGEMENT
// ============================================

/**
 * Create or update a user profile
 */
export const createOrUpdateUser = async (userId: string, userData: Omit<User, 'id'>): Promise<void> => {
  const userRef = doc(getDb(), 'users', userId);
  await setDoc(userRef, userData, { merge: true });
};

/**
 * Get a user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const userRef = doc(getDb(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }
  
  return {
    id: userSnap.id,
    ...userSnap.data(),
  } as User;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  const userRef = doc(getDb(), 'users', userId);
  await updateDoc(userRef, updates);
};

/**
 * Add a round to user's followed list
 */
export const followRound = async (userId: string, roundId: string): Promise<void> => {
  const userRef = doc(getDb(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userSnap.data() as User;
  const followedRounds = userData.followedRounds || [];
  
  if (!followedRounds.includes(roundId)) {
    await updateDoc(userRef, {
      followedRounds: [...followedRounds, roundId],
    });
    
    // Increment follower count on the round
    const roundRef = doc(getDb(), 'fundraising_rounds', roundId);
    const roundSnap = await getDoc(roundRef);
    if (roundSnap.exists()) {
      const roundData = roundSnap.data() as FundraisingRound;
      await updateDoc(roundRef, {
        followerCount: (roundData.followerCount || 0) + 1,
      });
    }
  }
};

/**
 * Remove a round from user's followed list
 */
export const unfollowRound = async (userId: string, roundId: string): Promise<void> => {
  const userRef = doc(getDb(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    throw new Error('User not found');
  }
  
  const userData = userSnap.data() as User;
  const followedRounds = userData.followedRounds || [];
  
  if (followedRounds.includes(roundId)) {
    await updateDoc(userRef, {
      followedRounds: followedRounds.filter(id => id !== roundId),
    });
    
    // Decrement follower count on the round
    const roundRef = doc(getDb(), 'fundraising_rounds', roundId);
    const roundSnap = await getDoc(roundRef);
    if (roundSnap.exists()) {
      const roundData = roundSnap.data() as FundraisingRound;
      await updateDoc(roundRef, {
        followerCount: Math.max((roundData.followerCount || 0) - 1, 0),
      });
    }
  }
};

// ============================================
// INTRO REQUESTS
// ============================================

/**
 * Create an intro request
 */
export const createIntroRequest = async (
  requestData: Omit<IntroRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  const requestsRef = collection(getDb(), 'intro_requests');
  
  // Check if request already exists (idempotency)
  const existingQuery = query(
    requestsRef,
    where('investorId', '==', requestData.investorId),
    where('roundId', '==', requestData.roundId)
  );
  
  const existingSnap = await getDocs(existingQuery);
  
  if (!existingSnap.empty) {
    // Return existing request ID
    return existingSnap.docs[0].id;
  }
  
  // Create new request
  const newRequest = {
    ...requestData,
    status: 'pending' as const,
    createdAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(requestsRef, newRequest);
  
  // Increment intro request count on the round
  const roundRef = doc(getDb(), 'fundraising_rounds', requestData.roundId);
  const roundSnap = await getDoc(roundRef);
  if (roundSnap.exists()) {
    const roundData = roundSnap.data() as FundraisingRound;
    await updateDoc(roundRef, {
      introRequestCount: (roundData.introRequestCount || 0) + 1,
    });
  }
  
  return docRef.id;
};

/**
 * Get intro requests for an investor
 */
export const getIntroRequestsForInvestor = async (investorId: string): Promise<IntroRequest[]> => {
  const requestsRef = collection(getDb(), 'intro_requests');
  const q = query(requestsRef, where('investorId', '==', investorId));
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as IntroRequest));
};

/**
 * Get intro requests for a specific round
 */
export const getIntroRequestsForRound = async (roundId: string): Promise<IntroRequest[]> => {
  const requestsRef = collection(getDb(), 'intro_requests');
  const q = query(requestsRef, where('roundId', '==', roundId));
  
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as IntroRequest));
};

/**
 * Check if an intro request exists
 */
export const hasIntroRequest = async (investorId: string, roundId: string): Promise<boolean> => {
  const requestsRef = collection(getDb(), 'intro_requests');
  const q = query(
    requestsRef,
    where('investorId', '==', investorId),
    where('roundId', '==', roundId)
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

/**
 * Update intro request status
 */
export const updateIntroRequestStatus = async (
  requestId: string,
  status: 'pending' | 'accepted' | 'declined'
): Promise<void> => {
  const requestRef = doc(getDb(), 'intro_requests', requestId);
  await updateDoc(requestRef, { status });
};
