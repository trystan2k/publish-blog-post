import { describe, expect, Mock, test, vi } from 'vitest';

import { createHostingAPI } from '@/pbp/hosting';
import { ContentFileData } from '@/pbp/posts/types';
import { getBuildInput } from '@/pbp/git';
import { processPostsData } from '@/pbp/posts/process';
import { HostingType } from '@/pbp/hosting/types';

vi.mock('@/pbp/git');
vi.mock('@/pbp/hosting');
vi.mock('@/pbp/utils/file');

describe('Process', () => {
  describe('processPostsData', () => {
    test('should throw if no hosting platform is specified', async () => {
      vi.mocked(getBuildInput).mockReturnValueOnce(null as unknown as string);
      expect(async () => await processPostsData([])).rejects.toThrowError(
        'No hosting platform specified to publish the post',
      );

      vi.mocked(getBuildInput).mockReturnValueOnce('');
      expect(async () => await processPostsData([])).rejects.toThrowError(
        'No hosting platform specified to publish the post',
      );
    });

    test('should process post data and publish a new post', async () => {
      vi.mocked(getBuildInput).mockReturnValueOnce(HostingType.DEV_TO);
      vi.mocked(getBuildInput).mockReturnValueOnce('apiKeyValue');

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

      const result = await processPostsData(filesData);
      expect(mockCreatePost).toHaveBeenLastCalledWith({
        article: {
          body_markdown: '---\ntitle: title\ndescription: description\ntags:\n  - tag1\n  - tag2\n---\ncontent\n',
        },
      });
      expect(result).toEqual(new Set(['test.md']));
    });

    test('should process post data and update a published post', async () => {
      vi.mocked(getBuildInput).mockReturnValueOnce(HostingType.DEV_TO);
      vi.mocked(getBuildInput).mockReturnValueOnce('apiKeyValue');

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

      const result = await processPostsData(filesData);
      expect(mockUpdatePost).toHaveBeenLastCalledWith(1, {
        article: {
          body_markdown:
            '---\ntitle: title\ndescription: description\ntags:\n  - tag1\n  - tag2\ndevTo: 1\n---\ncontent\n',
        },
      });
      expect(result).toEqual(new Set(['test.md']));
    });

    test('should process post data and not publish or update a post when hosting is false', async () => {
      vi.mocked(getBuildInput).mockReturnValueOnce(HostingType.DEV_TO);
      vi.mocked(getBuildInput).mockReturnValueOnce('apiKeyValue');

      const mockUpdatePost = vi.fn();
      const mockCreatePost = vi.fn();

      (createHostingAPI as Mock).mockReturnValueOnce({
        updatePost: mockUpdatePost,
        createPost: mockCreatePost,
      });

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

      const result = await processPostsData(filesData);
      expect(mockUpdatePost).not.toHaveBeenCalled();
      expect(mockCreatePost).not.toHaveBeenCalled();
      expect(result).toEqual(new Set([]));
    });

    test('should process post data and not modify any file if publish fails', async () => {
      vi.mocked(getBuildInput).mockReturnValueOnce(HostingType.DEV_TO);
      vi.mocked(getBuildInput).mockReturnValueOnce('apiKeyValue');

      const mockUpdatePost = vi.fn().mockRejectedValue(new Error('Error updating post'));
      const mockCreatePost = vi.fn().mockRejectedValue(new Error('Error creating post'));

      (createHostingAPI as Mock).mockReturnValueOnce({
        updatePost: mockUpdatePost,
        createPost: mockCreatePost,
      });

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

      const result = await processPostsData(filesData);
      expect(mockCreatePost).toHaveBeenCalled();
      expect(result).toEqual(new Set([]));
    });
  });
});
