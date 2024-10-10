import { describe, it, expect, vi, Mock } from 'vitest';
import ky from 'ky';

import { DevToSDK } from '../../src/hosting/devto';

vi.mock('ky');

describe('DevToSDK', () => {
  let sdk: DevToSDK;
  const apiKey = 'test-api-key';
  const mockPostResponse = {
    id: 1,
    slug: 'test-slug',
    path: '/test-path',
    url: 'https://dev.to/test-url',
    created_at: '2023-01-01T00:00:00Z',
    published_at: '2023-01-01T00:00:00Z',
  };

  it('should create a post', async () => {
    const post = {
      article: {
        title: 'Test Title',
        body_markdown: 'Test Body',
      },
    };

    (ky.create as Mock).mockReturnValue({
      post: vi.fn().mockReturnValue({
        json: vi.fn().mockReturnValue(mockPostResponse),
      }),
    });

    sdk = new DevToSDK();
    const response = await sdk.createPost(post);

    expect(response).toEqual(mockPostResponse);
    expect(ky.create).toHaveBeenCalledWith({
      prefixUrl: 'https://dev.to/api',
      headers: {
        'api-key': apiKey,
      },
    });
    expect(ky.create().post).toHaveBeenCalledWith('/articles', { json: post });
  });

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
        json: vi.fn().mockReturnValue(mockPostResponse),
      }),
    });

    sdk = new DevToSDK();
    const response = await sdk.updatePost(postId, post);

    expect(response).toEqual(mockPostResponse);
    expect(ky.create).toHaveBeenCalledWith({
      prefixUrl: 'https://dev.to/api',
      headers: {
        'api-key': apiKey,
      },
    });
    expect(ky.create().put).toHaveBeenCalledWith(`/articles/${postId}`, { json: post });
  });
});
