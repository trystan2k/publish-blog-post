import { describe, expect, test, vi, beforeEach, Mock } from 'vitest';

import { HostingType } from '@/pbp/hosting/types';
import { createDevToSDK } from '@/pbp/hosting/devto';
import { createHostingAPI, HostingAPI } from '@/pbp/hosting';

vi.mock('@/pbp/hosting/devto');

describe('Hosting', () => {
  test('should throw error when hosting is not supported', () => {
    expect(() => createHostingAPI('unsupported', 'apiKey')).toThrowError('Hosting unsupported is not supported.');
  });

  describe.each([[HostingType.DEV_TO, createDevToSDK]])('% Hosting', (name, mockFn) => {
    beforeEach(() => {
      vi.mocked(mockFn as Mock).mockImplementation(() => ({
        createPost: vi.fn().mockResolvedValue('post response body'),
        updatePost: vi.fn().mockResolvedValue('update response body'),
      }));
    });

    test('should create hosting instance with correct hosting', () => {
      const hosting = createHostingAPI(name, 'apiKey');
      expect(hosting).toBeInstanceOf(HostingAPI);
    });

    test('should create a post', async () => {
      const hosting = createHostingAPI(name, 'apiKey');
      const response = await hosting.createPost({
        data: { title: 'Test Title' },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      });
      expect(response).toBe('post response body');
    });

    test('should update a post', async () => {
      const hosting = createHostingAPI(name, 'apiKey');
      const response = await hosting.updatePost({
        data: { title: 'Test Title', devTo: 1 },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      });
      expect(response).toBe('update response body');
    });
  });
});
