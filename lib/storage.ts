import { getSupabase } from './supabase';

const LOGO_MAX_SIZE = 5 * 1024 * 1024;
const DECK_MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const ALLOWED_DECK_TYPES = ['application/pdf'];

export const validateLogoFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: PNG, JPG, JPEG, WEBP`,
    };
  }

  if (file.size > LOGO_MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB limit`,
    };
  }

  return { valid: true };
};

export const validateDeckFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_DECK_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only PDF files are allowed`,
    };
  }

  if (file.size > DECK_MAX_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit`,
    };
  }

  return { valid: true };
};

export const getLogoPath = (roundId: string, filename: string): string => {
  return `logos/${roundId}/${filename}`;
};

export const getDeckPath = (roundId: string, filename: string): string => {
  return `decks/${roundId}/${filename}`;
};

export const uploadLogo = async (
  roundId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const validation = validateLogoFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = getSupabase();
  const path = getLogoPath(roundId, file.name);

  const { error: uploadError } = await supabase.storage
    .from('fundraising')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('fundraising')
    .getPublicUrl(path);

  return { url: publicUrl, path };
};

export const uploadDeck = async (
  roundId: string,
  file: File
): Promise<{ url: string; path: string }> => {
  const validation = validateDeckFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const supabase = getSupabase();
  const path = getDeckPath(roundId, file.name);

  const { error: uploadError } = await supabase.storage
    .from('fundraising')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('fundraising')
    .getPublicUrl(path);

  return { url: publicUrl, path };
};

export const deleteFile = async (path: string): Promise<void> => {
  const supabase = getSupabase();
  const { error } = await supabase.storage
    .from('fundraising')
    .remove([path]);

  if (error) {
    throw error;
  }
};

export const uploadRoundFiles = async (
  roundId: string,
  logoFile: File,
  deckFile: File
): Promise<{ logoUrl: string; deckUrl: string }> => {
  const [logoResult, deckResult] = await Promise.all([
    uploadLogo(roundId, logoFile),
    uploadDeck(roundId, deckFile),
  ]);

  return {
    logoUrl: logoResult.url,
    deckUrl: deckResult.url,
  };
};
