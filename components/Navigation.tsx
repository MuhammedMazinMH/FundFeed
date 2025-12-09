'use client';

import React from 'react';
import Link from 'next/link';
import { AuthButton } from './AuthButton';
import ThemeToggle from './ThemeToggle';

export const Navigation: React.FC = () => {
  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              Fundfeed
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Home
            </Link>
            <Link
              href="/launch"
              className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Launch Round
            </Link>
          </div>

          {/* Right side: Theme Toggle and Auth Button */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};
