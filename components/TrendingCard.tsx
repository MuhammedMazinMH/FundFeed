'use client';

import React from 'react';
import Image from 'next/image';
import { FundraisingRound } from '@/types';
import { FollowButton } from './FollowButton';
import { RequestIntroButton } from './RequestIntroButton';

interface TrendingCardProps {
  round: FundraisingRound;
  isFollowing: boolean;
  hasRequestedIntro: boolean;
  onFollowToggle: (roundId: string) => Promise<void>;
}

export const TrendingCard: React.FC<TrendingCardProps> = ({
  round,
  isFollowing,
  hasRequestedIntro,
  onFollowToggle,
}) => {
  const handleFollowToggle = async () => {
    await onFollowToggle(round.id);
  };

  // Format the raising amount with proper currency display
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 sm:p-6"
      data-testid="trending-card"
    >
      {/* Logo */}
      <div className="mb-4 flex justify-center">
        <div className="relative h-20 w-20 overflow-hidden rounded-lg sm:h-24 sm:w-24">
          <Image
            src={round.logoUrl}
            alt={`${round.companyName} logo`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 80px, 96px"
          />
        </div>
      </div>

      {/* Company Name */}
      <h3
        className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl"
        data-testid="company-name"
      >
        {round.companyName}
      </h3>

      {/* Raising Amount */}
      <p
        className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base"
        data-testid="raising-amount"
      >
        Raising {formatAmount(round.raisingAmount, round.currency)}
      </p>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
        <FollowButton
          roundId={round.id}
          isFollowing={isFollowing}
          onToggle={handleFollowToggle}
        />
        <RequestIntroButton
          roundId={round.id}
          startupName={round.companyName}
          hasRequested={hasRequestedIntro}
        />
      </div>
    </div>
  );
};
