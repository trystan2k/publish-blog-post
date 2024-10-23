import { describe, expect, Mock, test, vi } from 'vitest';

import { createHostingAPI } from '@/pbp/hosting';
import { ContentFileData } from '@/pbp/posts/types';
import { processPostsData } from '@/pbp/posts/process';
import { HostingAPIModel, HostingType } from '@/pbp/hosting/types';

vi.mock('@/pbp/git');
vi.mock('@/pbp/hosting');
vi.mock('@/pbp/utils/file');

describe('Process', () => {
  describe('processPostsData', () => {
    test('should process post data and publish a new post', async () => {
      const mockCreatePost = vi.fn().mockImplementation(async () => ({
        id: 1,
        published_at: '2021-01-01',
        url: 'https://dev.to',
        slug: 'slug',
        path: 'path',
        created_at: '2021-01-01',
      }));

      (createHostingAPI as Mock).mockReturnValueOnce({
        createPost: mockCreatePost,
      });

      const publishHostSDKs = new Map<string, HostingAPIModel>();
      publishHostSDKs.set(HostingType.DEV_TO, createHostingAPI(HostingType.DEV_TO, 'devToApiKey'));

      const filesData: ContentFileData[] = [
        {
          matterData: {
            content: 'content',
            data: {
              title: 'title',
              description: 'description',
              tags: ['tag1', 'tag2'],
            },
            orig: '',
            language: '',
            matter: '',
            stringify: function (lang: string): string {
              throw new Error('Function not implemented.');
            },
          },
          fileData: {
            fileStatus: 'A',
            fileName: 'test.md',
          },
        },
      ];

      const result = await processPostsData(filesData, publishHostSDKs);
      expect(mockCreatePost).toHaveBeenLastCalledWith(filesData[0].matterData);
      expect(result).toEqual(new Set(['test.md']));
    });

    test('should process post data and update a published post', async () => {
      const mockUpdatePost = vi.fn().mockImplementation(async () => ({
        id: 1,
        published_at: '2021-01-01',
        url: 'https://dev.to',
        slug: 'slug',
        path: 'path',
        updated_at: '2021-01-01',
      }));

      (createHostingAPI as Mock).mockReturnValueOnce({
        updatePost: mockUpdatePost,
      });

      const publishHostSDKs = new Map<string, HostingAPIModel>();
      publishHostSDKs.set(HostingType.DEV_TO, createHostingAPI(HostingType.DEV_TO, 'devToApiKey'));

      const filesData: ContentFileData[] = [
        {
          matterData: {
            content: 'content',
            data: {
              title: 'title',
              description: 'description',
              tags: ['tag1', 'tag2'],
              [HostingType.DEV_TO]: 1,
            },
            orig: '',
            language: '',
            matter: '',
            stringify: function (lang: string): string {
              throw new Error('Function not implemented.');
            },
          },
          fileData: {
            fileStatus: 'M',
            fileName: 'test.md',
          },
        },
      ];

      const result = await processPostsData(filesData, publishHostSDKs);
      expect(mockUpdatePost).toHaveBeenLastCalledWith(filesData[0].matterData);
      expect(result).toEqual(new Set(['test.md']));
    });

    test('should process post data and not publish or update a post when hosting is false', async () => {
      const mockUpdatePost = vi.fn();
      const mockCreatePost = vi.fn();

      (createHostingAPI as Mock).mockReturnValueOnce({
        updatePost: mockUpdatePost,
        createPost: mockCreatePost,
      });

      const publishHostSDKs = new Map<string, HostingAPIModel>();
      publishHostSDKs.set(HostingType.DEV_TO, createHostingAPI(HostingType.DEV_TO, 'devToApiKey'));

      const filesData: ContentFileData[] = [
        {
          matterData: {
            content: 'content',
            data: {
              title: 'title',
              description: 'description',
              tags: ['tag1', 'tag2'],
              [HostingType.DEV_TO]: false,
            },
            orig: '',
            language: '',
            matter: '',
            stringify: function (lang: string): string {
              throw new Error('Function not implemented.');
            },
          },
          fileData: {
            fileStatus: 'M',
            fileName: 'test.md',
          },
        },
      ];

      const result = await processPostsData(filesData, publishHostSDKs);
      expect(mockUpdatePost).not.toHaveBeenCalled();
      expect(mockCreatePost).not.toHaveBeenCalled();
      expect(result).toEqual(new Set([]));
    });

    test('should process post data and not modify any file if publish fails', async () => {
      const mockUpdatePost = vi.fn().mockRejectedValue(new Error('Error updating post'));
      const mockCreatePost = vi.fn().mockRejectedValue(new Error('Error creating post'));

      (createHostingAPI as Mock).mockReturnValueOnce({
        updatePost: mockUpdatePost,
        createPost: mockCreatePost,
      });

      const publishHostSDKs = new Map<string, HostingAPIModel>();
      publishHostSDKs.set(HostingType.DEV_TO, createHostingAPI(HostingType.DEV_TO, 'devToApiKey'));

      const filesData: ContentFileData[] = [
        {
          matterData: {
            content: 'content',
            data: {
              title: 'title',
              description: 'description',
              tags: ['tag1', 'tag2'],
            },
            orig: '',
            language: '',
            matter: '',
            stringify: function (lang: string): string {
              throw new Error('Function not implemented.');
            },
          },
          fileData: {
            fileStatus: 'M',
            fileName: 'test.md',
          },
        },
      ];

      const result = await processPostsData(filesData, publishHostSDKs);
      expect(mockCreatePost).toHaveBeenCalled();
      expect(result).toEqual(new Set([]));
    });
  });
});
