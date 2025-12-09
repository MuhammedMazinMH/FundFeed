'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LaunchForm } from '@/components/LaunchForm';

export default function LaunchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      alert('Please sign in to launch a fundraising round');
      router.push('/');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        </div>
      </main>
    );
  }

  // Don't render form if not authenticated
  if (!user) {
    return null;
  }

  const handleSuccess = () => {
    // Redirect to homepage after successful launch
    setTimeout(() => {
      router.push('/');
    }, 2000); // Give time for confetti to show
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl">
            Launch Your Fundraising Round
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Share your startup with potential investors
          </p>
        </div>

        {/* Launch Form */}
        <LaunchForm onSuccess={handleSuccess} />
      </div>
    </main>
  );
}
