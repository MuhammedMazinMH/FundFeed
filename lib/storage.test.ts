/**
 * Property-Based Tests for Firebase Storage helpers
 * Feature: fundfeed-pwa, Property 2: File upload validation
 * Validates: Requirements 2.3, 2.4
 */

import * as fc from 'fast-check';
import { validateLogoFile, validateDeckFile } from './storage';

describe('Storage - Property-Based Tests', () => {
  /**
   * Property 2: File upload validation
   * For any file upload attempt, the system must validate both file type and size:
   * - Logos must be PNG/JPG/WEBP under 5MB
   * - Decks must be PDF under 10MB
   * - All invalid files must be rejected before upload to Firebase Storage
   */

  describe('Logo file validation', () => {
    it('should accept valid logo files (PNG/JPG/JPEG/WEBP under 5MB)', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Valid logo types
            type: fc.constantFrom('image/png', 'image/jpeg', 'image/jpg', 'image/webp'),
            // Valid size: 1 byte to 5MB
            size: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.png'),
          }),
          async (fileData) => {
            // Create a mock File object
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            // Override the size property (File objects are read-only, so we use Object.defineProperty)
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateLogoFile(mockFile);

            // All valid files should pass validation
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject logo files with invalid types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Invalid types (not PNG/JPG/JPEG/WEBP)
            type: fc.constantFrom(
              'application/pdf',
              'text/plain',
              'image/gif',
              'image/svg+xml',
              'video/mp4',
              'application/zip'
            ),
            // Any size
            size: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateLogoFile(mockFile);

            // All invalid types should be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('Invalid file type');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject logo files exceeding 5MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Valid type
            type: fc.constantFrom('image/png', 'image/jpeg', 'image/jpg', 'image/webp'),
            // Invalid size: over 5MB
            size: fc.integer({ min: 5 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.png'),
          }),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateLogoFile(mockFile);

            // All oversized files should be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('5MB');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Deck file validation', () => {
    it('should accept valid PDF files under 10MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Valid PDF type
            type: fc.constant('application/pdf'),
            // Valid size: 1 byte to 10MB
            size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.pdf'),
          }),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateDeckFile(mockFile);

            // All valid PDF files should pass validation
            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject deck files with non-PDF types', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Invalid types (not PDF)
            type: fc.constantFrom(
              'image/png',
              'image/jpeg',
              'text/plain',
              'application/zip',
              'application/msword',
              'video/mp4'
            ),
            // Any size
            size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
          }),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateDeckFile(mockFile);

            // All non-PDF files should be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('PDF');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject deck files exceeding 10MB', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            // Valid type
            type: fc.constant('application/pdf'),
            // Invalid size: over 10MB
            size: fc.integer({ min: 10 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
            name: fc.string({ minLength: 1, maxLength: 50 }).map(s => s + '.pdf'),
          }),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = validateDeckFile(mockFile);

            // All oversized files should be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('10MB');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Combined property: Any file that violates either type or size constraints
   * should be rejected before upload
   */
  describe('Combined validation property', () => {
    it('should reject any file that violates type OR size constraints', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Invalid logo: wrong type
            fc.record({
              fileType: fc.constant('logo' as const),
              type: fc.constantFrom('application/pdf', 'text/plain', 'image/gif'),
              size: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            // Invalid logo: too large
            fc.record({
              fileType: fc.constant('logo' as const),
              type: fc.constantFrom('image/png', 'image/jpeg'),
              size: fc.integer({ min: 5 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            // Invalid deck: wrong type
            fc.record({
              fileType: fc.constant('deck' as const),
              type: fc.constantFrom('image/png', 'text/plain', 'application/zip'),
              size: fc.integer({ min: 1, max: 10 * 1024 * 1024 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            }),
            // Invalid deck: too large
            fc.record({
              fileType: fc.constant('deck' as const),
              type: fc.constant('application/pdf'),
              size: fc.integer({ min: 10 * 1024 * 1024 + 1, max: 50 * 1024 * 1024 }),
              name: fc.string({ minLength: 1, maxLength: 50 }),
            })
          ),
          async (fileData) => {
            const mockFile = new File([''], fileData.name, {
              type: fileData.type,
            });
            
            Object.defineProperty(mockFile, 'size', {
              value: fileData.size,
              writable: false,
            });

            const result = fileData.fileType === 'logo' 
              ? validateLogoFile(mockFile)
              : validateDeckFile(mockFile);

            // All invalid files should be rejected
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
