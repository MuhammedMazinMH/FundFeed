import { getSupabase, isSupabaseConfigured } from './supabase';
import { FundraisingRound, User, IntroRequest } from '@/types';
import type { Database } from '@/types/database';

// Helper to check if database operations are available
export const isDatabaseConfigured = (): boolean => {
  return isSupabaseConfigured();
};

export const createFundraisingRound = async (
  roundData: Omit<FundraisingRound, 'id' | 'createdAt' | 'updatedAt' | 'followerCount' | 'introRequestCount'>
): Promise<string> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('fundraising_rounds')
    .insert({
      company_name: roundData.companyName,
      logo_url: roundData.logoUrl,
      raising_amount: roundData.raisingAmount,
      currency: roundData.currency,
      description: roundData.description,
      deck_url: roundData.deckUrl,
      founder_id: roundData.founderId,
    } as any)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return data.id;
};

export const getFundraisingRound = async (roundId: string): Promise<FundraisingRound | null> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('fundraising_rounds')
    .select('*')
    .eq('id', roundId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    companyName: data.company_name,
    logoUrl: data.logo_url,
    raisingAmount: data.raising_amount,
    currency: data.currency,
    description: data.description,
    deckUrl: data.deck_url,
    founderId: data.founder_id,
    followerCount: data.follower_count,
    introRequestCount: data.intro_request_count,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const getTrendingRounds = async (limitCount: number = 20): Promise<FundraisingRound[]> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('fundraising_rounds')
    .select('*')
    .order('created_at', { ascending: false })
    .order('follower_count', { ascending: false })
    .limit(limitCount);

  if (error) {
    throw error;
  }

  return data.map((row: any) => ({
    id: row.id,
    companyName: row.company_name,
    logoUrl: row.logo_url,
    raisingAmount: row.raising_amount,
    currency: row.currency,
    description: row.description,
    deckUrl: row.deck_url,
    founderId: row.founder_id,
    followerCount: row.follower_count,
    introRequestCount: row.intro_request_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const updateFundraisingRound = async (
  roundId: string,
  updates: Partial<Omit<FundraisingRound, 'id' | 'createdAt'>>
): Promise<void> => {
  const supabase = getSupabase();
  const dbUpdates: Record<string, any> = {};

  if (updates.companyName) dbUpdates.company_name = updates.companyName;
  if (updates.logoUrl) dbUpdates.logo_url = updates.logoUrl;
  if (updates.raisingAmount) dbUpdates.raising_amount = updates.raisingAmount;
  if (updates.currency) dbUpdates.currency = updates.currency;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.deckUrl) dbUpdates.deck_url = updates.deckUrl;
  if (updates.followerCount !== undefined) dbUpdates.follower_count = updates.followerCount;
  if (updates.introRequestCount !== undefined) dbUpdates.intro_request_count = updates.introRequestCount;

  dbUpdates.updated_at = new Date().toISOString();

  const { error }: any = await (supabase.from('fundraising_rounds') as any)
    .update(dbUpdates)
    .eq('id', roundId);

  if (error) {
    throw error;
  }
};

export const deleteFundraisingRound = async (roundId: string): Promise<void> => {
  const supabase = getSupabase();
  const { error }: any = await supabase
    .from('fundraising_rounds')
    .delete()
    .eq('id', roundId);

  if (error) {
    throw error;
  }
};

export const createOrUpdateUser = async (userId: string, userData: Omit<User, 'id'>): Promise<void> => {
  const supabase = getSupabase();
  const { error }: any = await supabase.from('users').upsert({
    id: userId,
    email: userData.email,
    display_name: userData.displayName,
    photo_url: userData.photoUrl,
    role: userData.role,
    followed_rounds: userData.followedRounds,
  } as any);

  if (error) {
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoUrl: data.photo_url || undefined,
    role: data.role,
    followedRounds: data.followed_rounds,
    createdAt: data.created_at,
  };
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<Omit<User, 'id' | 'createdAt'>>
): Promise<void> => {
  const supabase = getSupabase();
  const dbUpdates: Record<string, any> = {};

  if (updates.email) dbUpdates.email = updates.email;
  if (updates.displayName) dbUpdates.display_name = updates.displayName;
  if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.followedRounds) dbUpdates.followed_rounds = updates.followedRounds;

  const { error }: any = await (supabase.from('users') as any).update(dbUpdates).eq('id', userId);

  if (error) {
    throw error;
  }
};

export const followRound = async (userId: string, roundId: string): Promise<void> => {
  const supabase = getSupabase();
  const { data: userData, error: userError }: any = await supabase
    .from('users')
    .select('followed_rounds')
    .eq('id', userId)
    .single();

  if (userError) {
    throw userError;
  }

  const followedRounds = userData.followed_rounds || [];

  if (!followedRounds.includes(roundId)) {
    const { error: updateUserError }: any = await (supabase.from('users') as any)
      .update({ followed_rounds: [...followedRounds, roundId] })
      .eq('id', userId);

    if (updateUserError) {
      throw updateUserError;
    }

    const { data: roundData, error: roundError }: any = await supabase
      .from('fundraising_rounds')
      .select('follower_count')
      .eq('id', roundId)
      .single();

    if (roundError) {
      throw roundError;
    }

    const { error: updateRoundError }: any = await (supabase.from('fundraising_rounds') as any)
      .update({ follower_count: (roundData.follower_count || 0) + 1 })
      .eq('id', roundId);

    if (updateRoundError) {
      throw updateRoundError;
    }
  }
};

export const unfollowRound = async (userId: string, roundId: string): Promise<void> => {
  const supabase = getSupabase();
  const { data: userData, error: userError }: any = await supabase
    .from('users')
    .select('followed_rounds')
    .eq('id', userId)
    .single();

  if (userError) {
    throw userError;
  }

  const followedRounds = userData.followed_rounds || [];

  if (followedRounds.includes(roundId)) {
    const { error: updateUserError }: any = await (supabase.from('users') as any)
      .update({ followed_rounds: followedRounds.filter((id: string) => id !== roundId) })
      .eq('id', userId);

    if (updateUserError) {
      throw updateUserError;
    }

    const { data: roundData, error: roundError }: any = await supabase
      .from('fundraising_rounds')
      .select('follower_count')
      .eq('id', roundId)
      .single();

    if (roundError) {
      throw roundError;
    }

    const { error: updateRoundError }: any = await (supabase.from('fundraising_rounds') as any)
      .update({ follower_count: Math.max((roundData.follower_count || 0) - 1, 0) })
      .eq('id', roundId);

    if (updateRoundError) {
      throw updateRoundError;
    }
  }
};

export const createIntroRequest = async (
  requestData: Omit<IntroRequest, 'id' | 'createdAt' | 'status'>
): Promise<string> => {
  const supabase = getSupabase();
  const { data: existingRequest, error: checkError }: any = await supabase
    .from('intro_requests')
    .select('id')
    .eq('investor_id', requestData.investorId)
    .eq('round_id', requestData.roundId)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  if (existingRequest) {
    return existingRequest.id;
  }

  const { data, error }: any = await supabase
    .from('intro_requests')
    .insert({
      investor_id: requestData.investorId,
      round_id: requestData.roundId,
      startup_name: requestData.startupName,
      message: requestData.message,
    } as any)
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  const { data: roundData, error: roundError }: any = await supabase
    .from('fundraising_rounds')
    .select('intro_request_count')
    .eq('id', requestData.roundId)
    .single();

  if (roundError) {
    throw roundError;
  }

  const { error: updateError }: any = await (supabase.from('fundraising_rounds') as any)
    .update({ intro_request_count: (roundData.intro_request_count || 0) + 1 })
    .eq('id', requestData.roundId);

  if (updateError) {
    throw updateError;
  }

  return data.id;
};

export const getIntroRequestsForInvestor = async (investorId: string): Promise<IntroRequest[]> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('intro_requests')
    .select('*')
    .eq('investor_id', investorId);

  if (error) {
    throw error;
  }

  return data.map((row: any) => ({
    id: row.id,
    investorId: row.investor_id,
    roundId: row.round_id,
    startupName: row.startup_name,
    status: row.status,
    message: row.message || undefined,
    createdAt: row.created_at,
  }));
};

export const getIntroRequestsForRound = async (roundId: string): Promise<IntroRequest[]> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('intro_requests')
    .select('*')
    .eq('round_id', roundId);

  if (error) {
    throw error;
  }

  return data.map((row: any) => ({
    id: row.id,
    investorId: row.investor_id,
    roundId: row.round_id,
    startupName: row.startup_name,
    status: row.status,
    message: row.message || undefined,
    createdAt: row.created_at,
  }));
};

export const hasIntroRequest = async (investorId: string, roundId: string): Promise<boolean> => {
  const supabase = getSupabase();
  const { data, error }: any = await supabase
    .from('intro_requests')
    .select('id')
    .eq('investor_id', investorId)
    .eq('round_id', roundId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data !== null;
};

export const updateIntroRequestStatus = async (
  requestId: string,
  status: 'pending' | 'accepted' | 'declined'
): Promise<void> => {
  const supabase = getSupabase();
  const { error }: any = await (supabase.from('intro_requests') as any).update({ status }).eq('id', requestId);

  if (error) {
    throw error;
  }
};
