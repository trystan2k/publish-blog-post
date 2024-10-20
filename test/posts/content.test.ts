import { describe, test, vi, Mock, expect } from 'vitest';

import { parsePostFileContent, stringifyPostContent } from '@/pbp/posts/content';
import { readFile } from '@/pbp/utils/file';
import { parseMatter } from '@/pbp/utils/matter';

vi.mock('@/pbp/utils/file');
vi.mock('@/pbp/utils/matter');

describe('Content', () => {
  describe('parsePostFileContent', () => {
    test('should parse post file content that contains metadata only', () => {
      const files = [
        {
          fileStatus: 'M',
          fileName: 'test.md',
        },
        {
          fileStatus: 'A',
          fileName: 'test2.md',
        },
        {
          fileStatus: 'M',
          fileName: 'test3.mdx',
        },
        {
          fileStatus: 'A',
          fileName: 'test4.mdx',
        },
        {
          fileStatus: 'M',
          fileName: 'test5.md',
        },
      ];

      vi.mocked(readFile).mockReturnValueOnce('---\ntitle: Test\n---\n\nTest content');
      vi.mocked(readFile).mockReturnValueOnce('---\ntitle: Test2\n---\n\nTest content 2');
      vi.mocked(readFile).mockReturnValueOnce('');
      vi.mocked(readFile).mockReturnValueOnce('Test content 4');
      vi.mocked(readFile).mockReturnValueOnce('---\n---\n\nTest content 5');

      (parseMatter as Mock).mockReturnValueOnce({ data: { title: 'Test' } });
      (parseMatter as Mock).mockReturnValueOnce({ data: { title: 'Test2' } });
      (parseMatter as Mock).mockReturnValueOnce(null);
      (parseMatter as Mock).mockReturnValueOnce({ data: null });
      (parseMatter as Mock).mockReturnValueOnce({ data: {} });

      const result = parsePostFileContent(files);

      expect(result).toEqual([
        {
          fileData: { fileStatus: 'M', fileName: 'test.md' },
          matterData: { data: { title: 'Test' } },
        },
        {
          fileData: { fileStatus: 'A', fileName: 'test2.md' },
          matterData: { data: { title: 'Test2' } },
        },
      ]);
    });
  });

  describe('stringifyPostContent', () => {
    test('should stringify post content', () => {
      const result = stringifyPostContent('Test content', { title: 'Test' });
      expect(result).toBe('---\ntitle: Test\n---\nTest content\n');
    });
  });
});
