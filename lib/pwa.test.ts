/**
 * Property-Based Tests for PWA manifest
 * Feature: fundfeed-pwa, Property 7: PWA manifest and service worker registration
 * Validates: Requirements 5.1, 5.2
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('PWA Manifest - Property-Based Tests', () => {
  /**
   * Property 7: PWA manifest and service worker registration
   * For any compatible browser visiting Fundfeed, the PWA manifest must contain
   * all required fields and the service worker must successfully register to
   * enable installation prompts.
   */

  let manifest: any;

  beforeAll(() => {
    // Read the manifest file
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(manifestContent);
  });

  it('should contain all required PWA manifest fields', () => {
    // Required fields for PWA manifest
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'icons'];

    requiredFields.forEach(field => {
      expect(manifest).toHaveProperty(field);
      expect(manifest[field]).toBeDefined();
    });
  });

  it('should have valid name and short_name', () => {
    expect(typeof manifest.name).toBe('string');
    expect(manifest.name.length).toBeGreaterThan(0);
    expect(manifest.name.length).toBeLessThanOrEqual(45); // Recommended max length

    expect(typeof manifest.short_name).toBe('string');
    expect(manifest.short_name.length).toBeGreaterThan(0);
    expect(manifest.short_name.length).toBeLessThanOrEqual(12); // Recommended max length
  });

  it('should have valid start_url', () => {
    expect(typeof manifest.start_url).toBe('string');
    expect(manifest.start_url).toBe('/');
  });

  it('should have standalone display mode', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('should have icons defined', () => {
    expect(Array.isArray(manifest.icons)).toBe(true);
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it('should have valid icon entries with all required properties', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: manifest.icons.length - 1 }),
        async (iconIndex) => {
          const icon = manifest.icons[iconIndex];

          // Each icon must have src, sizes, and type
          expect(icon).toHaveProperty('src');
          expect(icon).toHaveProperty('sizes');
          expect(icon).toHaveProperty('type');

          // src must be a valid path
          expect(typeof icon.src).toBe('string');
          expect(icon.src.length).toBeGreaterThan(0);

          // sizes must be in format NxN or "any"
          expect(typeof icon.sizes).toBe('string');
          expect(icon.sizes).toMatch(/^(\d+x\d+|any)$/);

          // type must be a valid image MIME type
          expect(typeof icon.type).toBe('string');
          expect(icon.type).toMatch(/^image\/(png|jpeg|webp|svg\+xml)$/);
        }
      ),
      { numRuns: Math.min(manifest.icons.length, 100) }
    );
  });

  it('should have valid theme and background colors', () => {
    // theme_color and background_color should be valid hex colors or color names
    if (manifest.theme_color) {
      expect(typeof manifest.theme_color).toBe('string');
      expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$|^[a-z]+$/);
    }

    if (manifest.background_color) {
      expect(typeof manifest.background_color).toBe('string');
      expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$|^[a-z]+$/);
    }
  });

  it('should have description for better discoverability', () => {
    expect(manifest).toHaveProperty('description');
    expect(typeof manifest.description).toBe('string');
    expect(manifest.description.length).toBeGreaterThan(0);
  });
});
