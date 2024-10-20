import { describe, expect, vi, test } from 'vitest';

import { processPostsData } from '../src/posts/process';
import { parsePostFileContent } from '../src/posts/content';

import main from '@/pbp/index';
import { authorizeUser, getCommitMessage, getFilesToBePublished } from '@/pbp/git';

vi.mock('@/pbp/git');
vi.mock('@/pbp/utils/error');
vi.mock('@/pbp/posts/process');
vi.mock('@/pbp/posts/content');

describe('main function', () => {
  test('should post an error if user is not authorized', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(false);
    expect(async () => await main()).rejects.toThrowError(
      'You have no permission in this repository to use this action.',
    );
  });

  test('should not publish any post if there is no file to process', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(getFilesToBePublished).mockResolvedValue([]);

    const result = await main();

    expect(result).toBeNull();
    expect(processPostsData).not.toHaveBeenCalled();
  });

  test('should not publish any post file content is not a post file', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
    ]);
    vi.mocked(parsePostFileContent).mockReturnValue(null as unknown as never);

    const result = await main();

    expect(result).toBeNull();
    expect(processPostsData).not.toHaveBeenCalled();

    vi.mocked(parsePostFileContent).mockReturnValue([]);

    const result2 = await main();

    expect(result2).toBeNull();
    expect(processPostsData).not.toHaveBeenCalled();
  });

  test('should process files, commit and push published/updated posts', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
    ]);
    vi.mocked(parsePostFileContent).mockReturnValue([
      {
        fileData: {
          fileStatus: 'A',
          fileName: 'test/examples/markdown-example-1.md',
        },
        matterData: {
          content: '---\ntitle: Test post\n---\n\nThis is a test post.',
          data: { title: 'Test post' },
          orig: '',
          language: '',
          matter: '',
          stringify: function (lang: string): string {
            throw new Error('Function not implemented.');
          },
        },
      },
    ]);
    vi.mocked(processPostsData).mockResolvedValue(new Set(['test/examples/markdown-example-1.md']));
    vi.mocked(getCommitMessage).mockReturnValue('Publishing %file');

    await main();
    expect(processPostsData).toHaveBeenCalled();
  });
});
