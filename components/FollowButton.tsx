'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FollowButtonProps {
  roundId?: string; // Optional, not used in component but kept for API compatibility
  isFollowing: boolean;
  onToggle: () => Promise<void>;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onToggle,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      // Require authentication before allowing follow action
      alert('Please sign in to follow startups');
      return;
    }

    setIsLoading(true);
    try {
      await onToggle();
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        isFollowing
          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
          : 'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'
      }`}
      aria-label={isFollowing ? 'Unfollow startup' : 'Follow startup'}
    >
      {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
