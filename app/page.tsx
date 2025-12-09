'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TrendingCard } from '@/components/TrendingCard';
import { TrendingGridSkeleton } from '@/components/LoadingSkeleton';
import { getTrendingRounds } from '@/lib/firestore';
import { followRound, unfollowRound, getUserProfile, getIntroRequestsForInvestor } from '@/lib/firestore';
import { FundraisingRound } from '@/types';

export default function Home() {
  const { user } = useAuth();
  const [rounds, setRounds] = useState<FundraisingRound[]>([]);
  const [followedRounds, setFollowedRounds] = useState<string[]>([]);
  const [requestedIntros, setRequestedIntros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch trending rounds and user's followed rounds
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch trending rounds
        const trendingRounds = await getTrendingRounds(20);
        setRounds(trendingRounds);

        // Fetch user's followed rounds and intro requests if authenticated
        if (user) {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile) {
            setFollowedRounds(userProfile.followedRounds || []);
          }
          
          // Fetch user's intro requests
          const introRequests = await getIntroRequestsForInvestor(user.uid);
          setRequestedIntros(introRequests.map(req => req.roundId));
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load fundraising rounds. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle follow/unfollow toggle
  const handleFollowToggle = async (roundId: string) => {
    if (!user) {
      alert('Please sign in to follow startups');
      return;
    }

    try {
      const isCurrentlyFollowing = followedRounds.includes(roundId);

      if (isCurrentlyFollowing) {
        await unfollowRound(user.uid, roundId);
        setFollowedRounds(prev => prev.filter(id => id !== roundId));
      } else {
        await followRound(user.uid, roundId);
        setFollowedRounds(prev => [...prev, roundId]);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Failed to update follow status. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Trending Fundraising Rounds
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Discover startups currently raising capital
          </p>
        </div>

        {/* Loading State */}
        {loading && <TrendingGridSkeleton count={8} />}

        {/* Error State */}
        {error && (
          <div className="mx-auto max-w-md rounded-lg bg-red-50 p-4 text-center text-red-800 dark:bg-red-900 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && rounds.length === 0 && (
          <div className="mx-auto max-w-md rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              No fundraising rounds yet
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Be the first to launch a fundraising round!
            </p>
          </div>
        )}

        {/* Trending Cards Grid */}
        {!loading && !error && rounds.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rounds.map(round => (
              <TrendingCard
                key={round.id}
                round={round}
                isFollowing={followedRounds.includes(round.id)}
                hasRequestedIntro={requestedIntros.includes(round.id)}
                onFollowToggle={handleFollowToggle}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
