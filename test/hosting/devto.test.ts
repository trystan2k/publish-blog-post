import { describe, expect, vi, Mock, test } from 'vitest';
import ky, { HTTPError, KyResponse } from 'ky';

import { createDevToSDK } from '@/pbp/hosting/devto';
import { HostingAPIModel } from '@/pbp/hosting/types';
import { MatterData } from '@/pbp/utils/matter';

vi.mock('ky');

describe('DevToSDK', () => {
  let sdk: HostingAPIModel;
  const apiKey = 'test-api-key';
  const mockPostResponse = {
    id: 1,
    published_at: '2023-01-02T00:00:00Z',
    slug: 'test-slug',
    created_at: '2023-01-01T00:00:00Z',
  };

  test('should throw an error if the API key is not set', () => {
    expect(() => createDevToSDK('')).toThrowError('Dev.to API key is not set.');
  });

  describe('createPost', () => {
    test('should create a post', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      (ky.create as Mock).mockReturnValue({
        post: vi.fn().mockReturnValue({
          json: vi.fn().mockResolvedValue(mockPostResponse),
        }),
      });

      sdk = createDevToSDK(apiKey);
      const response = await sdk.createPost(matterData);

      expect(response).toEqual({
        devTo: 1,
        published_devTo_at: '2023-01-02T00:00:00Z',
      });

      expect(ky.create).toHaveBeenCalledWith({
        prefixUrl: 'https://dev.to/api',
        headers: {
          'api-key': apiKey,
          Accept: 'application/vnd.forem.api-v1+json',
        },
      });
      expect(ky.create().post).toHaveBeenCalledWith('articles', {
        json: {
          article: {
            body_markdown: '---\ntitle: Test Title\n---\nTest Body\n',
          },
        },
      });
    });

    test('should fail to create a post with a HTTPError', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      HTTPError.prototype.response = new Response(JSON.stringify({ error: 'HTTP Error 422' }), {
        status: 422,
      }) as KyResponse;

      (ky.create as Mock).mockReturnValue({
        post: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(
            new HTTPError(HTTPError.prototype.response, new Request('https://dev.to/api/create'), {
              method: 'POST',
              retry: {},
              prefixUrl: 'https://dev.to/api',
              headers: {
                'api-key': apiKey,
                Accept: 'application/vnd.forem.api-v1+json',
              },
              onDownloadProgress: () => null,
            }),
          ),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.createPost(matterData)).rejects.toThrowError(
        'Error publishing post \n Status: 422 \n Reason: HTTP Error 422',
      );
    });

    test('should fail to create a post with another error type', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      (ky.create as Mock).mockReturnValue({
        post: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(new Error('Error converting response to JSON')),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.createPost(matterData)).rejects.toThrowError('Error converting response to JSON');
    });
  });

  describe('updatePost', () => {
    test('should update a post', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
          devTo: 1,
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      (ky.create as Mock).mockReturnValue({
        put: vi.fn().mockReturnValue({
          json: vi.fn().mockResolvedValue({ ...mockPostResponse, edited_at: '2023-01-03T00:00:00Z' }),
        }),
      });

      sdk = createDevToSDK(apiKey);
      const response = await sdk.updatePost(matterData);

      expect(response).toEqual({
        devTo: 1,
        published_devTo_at: '2023-01-02T00:00:00Z',
        updated_devTo_at: '2023-01-03T00:00:00Z',
      });

      expect(ky.create).toHaveBeenCalledWith({
        prefixUrl: 'https://dev.to/api',
        headers: {
          'api-key': apiKey,
          Accept: 'application/vnd.forem.api-v1+json',
        },
      });
      expect(ky.create().put).toHaveBeenCalledWith(`articles/1`, {
        json: {
          article: {
            body_markdown: '---\ntitle: Test Title\n---\nTest Body\n',
          },
        },
      });
    });

    test('should fail to update a post with a HTTPError', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
          devTo: 1,
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      HTTPError.prototype.response = new Response(JSON.stringify({ error: 'HTTP Error 422' }), {
        status: 422,
      }) as KyResponse;

      (ky.create as Mock).mockReturnValue({
        put: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(
            new HTTPError(HTTPError.prototype.response, new Request('https://dev.to/api/create'), {
              method: 'POST',
              retry: {},
              prefixUrl: 'https://dev.to/api',
              headers: {
                'api-key': apiKey,
                Accept: 'application/vnd.forem.api-v1+json',
              },
              onDownloadProgress: () => null,
            }),
          ),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.updatePost(matterData)).rejects.toThrowError(
        'Error updating post \n Status: 422 \n Reason: HTTP Error 422',
      );
    });

    test('should fail to update a post with another error type', async () => {
      const matterData: MatterData = {
        data: {
          title: 'Test Title',
          devTo: 1,
        },
        content: 'Test Body',
        orig: '',
        language: '',
        matter: '',
        stringify: function (lang: string): string {
          throw new Error('Function not implemented.');
        },
      };

      (ky.create as Mock).mockReturnValue({
        put: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(new Error('Error converting response to JSON')),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.updatePost(matterData)).rejects.toThrowError('Error converting response to JSON');
    });
  });
});
