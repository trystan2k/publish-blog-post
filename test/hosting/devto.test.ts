import { describe, it, expect, vi, Mock } from 'vitest';
import ky, { HTTPError, KyResponse } from 'ky';

import { createDevToSDK } from '@/pbp/hosting/devto';
import { HostingAPIModel } from '@/pbp/hosting/types';

vi.mock('ky');

describe('DevToSDK', () => {
  let sdk: HostingAPIModel;
  const apiKey = 'test-api-key';
  const mockPostResponse = {
    id: 1,
    slug: 'test-slug',
    path: '/test-path',
    url: 'https://dev.to/test-url',
    created_at: '2023-01-01T00:00:00Z',
    published_at: '2023-01-01T00:00:00Z',
  };

  it('should throw an error if the API key is not set', () => {
    expect(() => createDevToSDK('')).toThrowError('Dev.to API key is not set.');
  });

  describe('createPost', () => {
    it('should create a post', async () => {
      const post = {
        article: {
          title: 'Test Title',
          body_markdown: 'Test Body',
        },
      };

      (ky.create as Mock).mockReturnValue({
        post: vi.fn().mockReturnValue({
          json: vi.fn().mockResolvedValue(mockPostResponse),
        }),
      });

      sdk = createDevToSDK(apiKey);
      const response = await sdk.createPost(post);

      expect(response).toEqual(mockPostResponse);
      expect(ky.create).toHaveBeenCalledWith({
        prefixUrl: 'https://dev.to/api',
        headers: {
          'api-key': apiKey,
          Accept: 'application/vnd.forem.api-v1+json',
        },
      });
      expect(ky.create().post).toHaveBeenCalledWith('articles', { json: post });
    });

    it('should fail to create a post with a HTTPError', async () => {
      const post = {
        article: {
          title: 'Test Title',
          body_markdown: 'Test Body',
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
      expect(async () => await sdk.createPost(post)).rejects.toThrowError(
        'Error publishing post \n Status: 422 \n Reason: HTTP Error 422',
      );
    });

    it('should fail to create a post with another error type', async () => {
      const post = {
        article: {
          title: 'Test Title',
          body_markdown: 'Test Body',
        },
      };

      (ky.create as Mock).mockReturnValue({
        post: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(new Error('Error converting response to JSON')),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.createPost(post)).rejects.toThrowError('Error converting response to JSON');
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const post = {
        article: {
          title: 'Updated Title',
          body_markdown: 'Updated Body',
        },
      };
      const postId = 1;

      (ky.create as Mock).mockReturnValue({
        put: vi.fn().mockReturnValue({
          json: vi.fn().mockResolvedValue(mockPostResponse),
        }),
      });

      sdk = createDevToSDK(apiKey);
      const response = await sdk.updatePost(postId, post);

      expect(response).toEqual(mockPostResponse);
      expect(ky.create).toHaveBeenCalledWith({
        prefixUrl: 'https://dev.to/api',
        headers: {
          'api-key': apiKey,
          Accept: 'application/vnd.forem.api-v1+json',
        },
      });
      expect(ky.create().put).toHaveBeenCalledWith(`articles/${postId}`, { json: post });
    });

    it('should fail to update a post with a HTTPError', async () => {
      const post = {
        article: {
          title: 'Updated Title',
          body_markdown: 'Updated Body',
        },
      };
      const postId = 1;

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
      expect(async () => await sdk.updatePost(postId, post)).rejects.toThrowError(
        'Error updating post \n Status: 422 \n Reason: HTTP Error 422',
      );
    });

    it('should fail to update a post with another error type', async () => {
      const post = {
        article: {
          title: 'Updated Title',
          body_markdown: 'Updated Body',
        },
      };
      const postId = 1;

      (ky.create as Mock).mockReturnValue({
        put: vi.fn().mockReturnValue({
          json: vi.fn().mockRejectedValue(new Error('Error converting response to JSON')),
        }),
      });

      sdk = createDevToSDK(apiKey);
      expect(async () => await sdk.updatePost(postId, post)).rejects.toThrowError('Error converting response to JSON');
    });
  });
});
