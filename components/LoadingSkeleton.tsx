'use client';

import React from 'react';

export const TrendingCardSkeleton: React.FC = () => {
  return (
    <div className="flex animate-pulse flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
      {/* Logo skeleton */}
      <div className="mb-4 flex justify-center">
        <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 sm:h-24 sm:w-24" />
      </div>

      {/* Company name skeleton */}
      <div className="mb-2 flex justify-center">
        <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Raising amount skeleton */}
      <div className="mb-4 flex justify-center">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Buttons skeleton */}
      <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
        <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

export const TrendingGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <TrendingCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-32 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-700" />
      <div className="h-12 w-full rounded bg-gray-200 dark:bg-gray-700" />
    </div>
  );
};
