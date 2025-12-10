import { getSupabase, isSupabaseConfigured } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export const isAuthConfigured = (): boolean => {
  return isSupabaseConfigured();
};

export const signInWithEmail = async (email: string, password: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }

  return data.user;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Error creating account:', error);
    throw error;
  }

  return data.user;
};

export const signInWithGoogle = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: SupabaseUser | null) => void) => {
  const supabase = getSupabase();
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return subscription.unsubscribe;
};

export const getCurrentUser = async () => {
  const supabase = getSupabase();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }

  return user;
};
