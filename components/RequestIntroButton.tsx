'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RequestIntroButtonProps {
  roundId: string;
  startupName: string;
  hasRequested: boolean;
}

export const RequestIntroButton: React.FC<RequestIntroButtonProps> = ({
  roundId,
  startupName,
  hasRequested,
}) => {
  const { user } = useAuth();
  const [isRequested, setIsRequested] = useState(hasRequested);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!user) {
      alert('Please sign in to request introductions');
      return;
    }

    if (isRequested) {
      return; // Already requested, do nothing
    }

    setIsLoading(true);

    try {
      // Call API route to create intro request
      const response = await fetch('/api/intro-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roundId,
          startupName,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to request intro');
      }

      setIsRequested(true);
      alert(`Intro request sent to ${startupName}!`);
    } catch (error) {
      console.error('Error requesting intro:', error);
      alert('Failed to request intro. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || isRequested}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        isRequested
          ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
      }`}
      aria-label={isRequested ? 'Intro requested' : 'Request intro'}
    >
      {isLoading ? 'Requesting...' : isRequested ? 'Intro Requested' : 'Request Intro'}
    </button>
  );
};
