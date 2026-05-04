import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { buildPublicMetadata } from './seo';

describe('buildPublicMetadata', () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    // Reset env before each test
    process.env.NEXT_PUBLIC_SITE_URL = 'https://wilroptravel.com';
  });

  afterEach(() => {
    // Restore original env
    if (originalEnv) {
      process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    } else {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    }
  });

  it('should generate basic metadata correctly', () => {
    const result = buildPublicMetadata({
      title: 'Test Title',
      description: 'Test Description',
      path: '/test-path',
    });

    expect(result.title).toBe('Test Title');
    expect(result.description).toBe('Test Description');
    expect(result.alternates?.canonical).toBe('https://wilroptravel.com/test-path');
    expect(result.openGraph?.title).toBe('Test Title');
    expect(result.openGraph?.description).toBe('Test Description');
    expect(result.openGraph?.url).toBe('https://wilroptravel.com/test-path');
    expect((result.openGraph?.images as any)[0].url).toBe('https://wilroptravel.com/images/hero.png');
    expect(result.twitter?.title).toBe('Test Title');
    expect(result.twitter?.description).toBe('Test Description');
  });

  it('should handle path without leading slash', () => {
    const result = buildPublicMetadata({
      title: 'Title',
      description: 'Description',
      path: 'no-slash-path',
    });

    expect(result.alternates?.canonical).toBe('https://wilroptravel.com/no-slash-path');
  });

  describe('ogImage resolution', () => {
    it('should resolve absolute http URL', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
        ogImage: 'http://example.com/image.png',
      });
      expect((result.openGraph?.images as any)[0].url).toBe('http://example.com/image.png');
    });

    it('should resolve absolute https URL', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
        ogImage: 'https://example.com/image.png',
      });
      expect((result.openGraph?.images as any)[0].url).toBe('https://example.com/image.png');
    });

    it('should resolve relative path with leading slash', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
        ogImage: '/custom/image.png',
      });
      expect((result.openGraph?.images as any)[0].url).toBe('https://wilroptravel.com/custom/image.png');
    });

    it('should resolve relative path without leading slash', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
        ogImage: 'custom/image.png',
      });
      expect((result.openGraph?.images as any)[0].url).toBe('https://wilroptravel.com/custom/image.png');
    });
  });

  describe('noIndex behavior', () => {
    it('should allow indexing by default', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
      });

      expect(result.robots).toEqual({
        index: true,
        follow: true,
      });
    });

    it('should prevent indexing when noIndex is true', () => {
      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/path',
        noIndex: true,
      });

      expect(result.robots).toEqual({
        index: false,
        follow: false,
        googleBot: {
          index: false,
          follow: false,
        },
      });
    });
  });

  describe('base URL resolution', () => {
    it('should respect NEXT_PUBLIC_SITE_URL', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com';

      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/custom-path',
      });

      expect(result.alternates?.canonical).toBe('https://custom-site.com/custom-path');
      expect((result.openGraph?.images as any)[0].url).toBe('https://custom-site.com/images/hero.png');
    });

    it('should handle NEXT_PUBLIC_SITE_URL with trailing slash', () => {
      process.env.NEXT_PUBLIC_SITE_URL = 'https://custom-site.com/';

      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/custom-path',
      });

      expect(result.alternates?.canonical).toBe('https://custom-site.com/custom-path');
      expect((result.openGraph?.images as any)[0].url).toBe('https://custom-site.com/images/hero.png');
    });

    it('should fallback to default URL if NEXT_PUBLIC_SITE_URL is not set', () => {
      delete process.env.NEXT_PUBLIC_SITE_URL;

      const result = buildPublicMetadata({
        title: 'Title',
        description: 'Description',
        path: '/test-path',
      });

      expect(result.alternates?.canonical).toBe('https://wilroptravel.com/test-path');
    });
  });
});
