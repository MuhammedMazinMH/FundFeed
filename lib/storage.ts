// Firebase Storage helpers for file uploads
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from 'firebase/storage';
import { storage } from './firebase';

// Helper to ensure storage is available
const getStorage = (): FirebaseStorage => {
  if (!storage) {
    throw new Error('Firebase Storage is not configured. Please set up your environment variables.');
  }
  return storage;
};

// File validation constants
const LOGO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DECK_MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_DECK_TYPES = ['application/pdf'];

// ============================================
// FILE VALIDATION
// ============================================

/**
 * Validate logo file (type and size)
 */
export const validateLogoFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP`,
    };
  }

  // Check file size
  if (file.size > LOGO_MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Validate PDF deck file (type and size)
 */
export const validateDeckFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (!ALLOWED_DECK_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only PDF files are allowed`,
    };
  }

  // Check file size
  if (file.size > DECK_MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit`,
    };
  }

  return { valid: true };
};

// ============================================
// STORAGE PATH GENERATION
// ============================================

/**
 * Generate storage path for logo
 */
export const getLogoPath = (roundId: string, filename: string): string => {
  return `logos/${roundId}/${filename}`;
};

/**
 * Generate storage path for deck
 */
export const getDeckPath = (roundId: string, filename: string): string => {
  return `decks/${roundId}/${filename}`;
};

// ============================================
// FILE UPLOAD FUNCTIONS
// ============================================

/**
 * Upload logo file to Firebase Storage
 */
export const uploadLogo = async (
  roundId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  // Validate file
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate storage path
  const path = getLogoPath(roundId, file.name);
  const storageRef = ref(getStorage(), path);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const url = await getDownloadURL(storageRef);

  return { url, path };
};

/**
 * Upload PDF deck file to Firebase Storage
 */
export const uploadDeck = async (
  roundId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  // Validate file
  const validation = validateDeckFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate storage path
  const path = getDeckPath(roundId, file.name);
  const storageRef = ref(getStorage(), path);

  // Upload file
  await uploadBytes(storageRef, file);

  // Get download URL
  const url = await getDownloadURL(storageRef);

  return { url, path };
};

/**
 * Delete a file from Firebase Storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(getStorage(), path);
  await deleteObject(storageRef);
};

/**
 * Upload both logo and deck for a fundraising round
 */
export const uploadRoundFiles = async (
  roundId: string,
  logoFile: File,
  deckFile: File
): Promise<{ logoUrl: string; deckUrl: string }> => {
  // Upload both files in parallel
  const [logoResult, deckResult] = await Promise.all([
    uploadLogo(roundId, logoFile),
    uploadDeck(roundId, deckFile),
  ]);

  return {
    logoUrl: logoResult.url,
    deckUrl: deckResult.url,
  };
};
