export interface FundraisingRound {
  id: string;
  companyName: string;
  logoUrl: string;
  raisingAmount: number;
  currency: string;
  description: string;
  deckUrl: string;
  founderId: string;
  createdAt: string;
  updatedAt: string;
  followerCount: number;
  introRequestCount: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string;
  role: 'founder' | 'investor' | 'both';
  createdAt: string;
  followedRounds: string[];
}

export interface IntroRequest {
  id: string;
  investorId: string;
  roundId: string;
  startupName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  message?: string;
}
