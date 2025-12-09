'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateLogoFile, validateDeckFile } from '@/lib/storage';

interface LaunchFormProps {
  onSuccess: () => void;
}

interface FormData {
  companyName: string;
  raisingAmount: string;
  currency: string;
  description: string;
}

interface FormErrors {
  companyName?: string;
  raisingAmount?: string;
  description?: string;
  logo?: string;
  deck?: string;
}

export const LaunchForm: React.FC<LaunchFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    raisingAmount: '',
    currency: 'USD',
    description: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deckFile, setDeckFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateLogoFile(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, logo: validation.error }));
        setLogoFile(null);
      } else {
        setLogoFile(file);
        setErrors(prev => ({ ...prev, logo: undefined }));
      }
    }
  };

  // Handle deck file selection
  const handleDeckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateDeckFile(file);
      if (!validation.valid) {
        setErrors(prev => ({ ...prev, deck: validation.error }));
        setDeckFile(null);
      } else {
        setDeckFile(file);
        setErrors(prev => ({ ...prev, deck: undefined }));
      }
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.raisingAmount || parseFloat(formData.raisingAmount) <= 0) {
      newErrors.raisingAmount = 'Valid raising amount is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!logoFile) {
      newErrors.logo = 'Logo is required';
    }

    if (!deckFile) {
      newErrors.deck = 'Pitch deck is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to launch a fundraising round');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Import functions dynamically to avoid circular dependencies
      const { uploadRoundFiles } = await import('@/lib/storage');
      const { createFundraisingRound } = await import('@/lib/firestore');

      // Generate a temporary ID for the round
      const tempRoundId = `temp-${Date.now()}`;

      // Upload files
      const { logoUrl, deckUrl } = await uploadRoundFiles(
        tempRoundId,
        logoFile!,
        deckFile!
      );

      // Create fundraising round
      await createFundraisingRound({
        companyName: formData.companyName.trim(),
        logoUrl,
        raisingAmount: parseFloat(formData.raisingAmount),
        currency: formData.currency,
        description: formData.description.trim(),
        deckUrl,
        founderId: user.id,
      });

      // Trigger confetti animation
      const { triggerCelebration } = await import('@/lib/confetti');
      triggerCelebration();

      // Call success callback
      onSuccess();
    } catch (error) {
      console.error('Error creating fundraising round:', error);
      alert('Failed to create fundraising round. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      {/* Company Name */}
      <div>
        <label
          htmlFor="companyName"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Company Name *
        </label>
        <input
          type="text"
          id="companyName"
          name="companyName"
          value={formData.companyName}
          onChange={handleInputChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          placeholder="Enter your company name"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.companyName}</p>
        )}
      </div>

      {/* Raising Amount */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label
            htmlFor="raisingAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Raising Amount *
          </label>
          <input
            type="number"
            id="raisingAmount"
            name="raisingAmount"
            value={formData.raisingAmount}
            onChange={handleInputChange}
            min="0"
            step="1000"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
            placeholder="1000000"
          />
          {errors.raisingAmount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.raisingAmount}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="currency"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
            <option value="INR">INR</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-white dark:focus:ring-white"
          placeholder="Describe your fundraising round..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
        )}
      </div>

      {/* Logo Upload */}
      <div>
        <label
          htmlFor="logo"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Company Logo * (PNG, JPG, WEBP - Max 5MB)
        </label>
        <input
          type="file"
          id="logo"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleLogoChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800 dark:file:bg-white dark:file:text-black dark:hover:file:bg-gray-200"
        />
        {logoFile && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Selected: {logoFile.name}
          </p>
        )}
        {errors.logo && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.logo}</p>
        )}
      </div>

      {/* Deck Upload */}
      <div>
        <label
          htmlFor="deck"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Pitch Deck * (PDF - Max 10MB)
        </label>
        <input
          type="file"
          id="deck"
          accept="application/pdf"
          onChange={handleDeckChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800 dark:file:bg-white dark:file:text-black dark:hover:file:bg-gray-200"
        />
        {deckFile && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">
            Selected: {deckFile.name}
          </p>
        )}
        {errors.deck && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deck}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          {isSubmitting ? 'Launching...' : 'Launch Fundraising Round'}
        </button>
      </div>
    </form>
  );
};
