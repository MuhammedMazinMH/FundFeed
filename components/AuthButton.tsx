'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';

interface AuthButtonProps {
  variant?: 'default' | 'compact';
}

export const AuthButton: React.FC<AuthButtonProps> = ({ variant = 'default' }) => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out. Please try again.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700" />
        {variant === 'default' && (
          <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
        )}
      </div>
    );
  }

  // Signed in state
  if (user) {
    return (
      <div className="flex items-center gap-3">
        {variant === 'default' && (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName || 'User'}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-700">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.displayName || user.email}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
          aria-label="Sign out"
        >
          Sign Out
        </button>
        {error && (
          <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
        )}
      </div>
    );
  }

  // Signed out state
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        aria-label="Sign in with Google"
      >
        {isSigningIn ? 'Signing in...' : 'Sign In with Google'}
      </button>
      {error && (
        <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
      )}
    </div>
  );
};
