import { describe, expect, vi, test } from 'vitest';

import { processPostsData } from '@/pbp/posts/process';
import { parsePostFileContent } from '@/pbp/posts/content';
import {
  ACTION_INPUT_KEY_API_KEY,
  ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE,
  ACTION_INPUT_KEY_INCLUDE_FOLDERS,
  ACTION_INPUT_KEY_PUBLISH_TO,
} from '@/pbp/utils/const';
import { HostingAPI } from '@/pbp/hosting';
import main from '@/pbp/index';
import { authorizeUser, getBuildInput, getCommitMessage, getFilesToBePublished, gitCheckout, gitPush } from '@/pbp/git';

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

    vi.mocked(getBuildInput).mockImplementation((key: string) => {
      if (key === ACTION_INPUT_KEY_INCLUDE_FOLDERS) {
        return '';
      }
      return '';
    });

    vi.mocked(getFilesToBePublished).mockResolvedValue([]);

    const result = await main();

    expect(result).toBeNull();
    expect(processPostsData).not.toHaveBeenCalled();
  });

  test('should not publish any post file content is not a post file', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(getBuildInput).mockImplementation((key: string) => {
      if (key === ACTION_INPUT_KEY_INCLUDE_FOLDERS) {
        return '';
      }
      return '';
    });

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

  test('should not publish any post publish to is not informed', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(getBuildInput).mockImplementation((key: string) => {
      if (key === ACTION_INPUT_KEY_INCLUDE_FOLDERS) {
        return '';
      } else if (key === ACTION_INPUT_KEY_PUBLISH_TO) {
        return '';
      }

      return '';
    });

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
    ]);

    const filesToPublish = [
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
    ];
    vi.mocked(parsePostFileContent).mockReturnValue(filesToPublish);

    const result = await main();

    expect(result).toBeNull();
    expect(processPostsData).not.toHaveBeenCalled();
  });

  test('should process files, commit and push published/updated posts', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);

    vi.mocked(gitCheckout).mockResolvedValue('main');

    vi.mocked(getBuildInput).mockImplementation((key: string) => {
      if (key === ACTION_INPUT_KEY_INCLUDE_FOLDERS) {
        return 'test/examples';
      } else if (key === ACTION_INPUT_KEY_PUBLISH_TO) {
        return 'devTo';
      } else if (key === `devTo${ACTION_INPUT_KEY_API_KEY}`) {
        return '123456';
      } else if (key === ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE) {
        return 'Publishing %file';
      }

      return '';
    });

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
    ]);
    const filesToPublish = [
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
    ];
    vi.mocked(parsePostFileContent).mockReturnValue(filesToPublish);
    vi.mocked(processPostsData).mockResolvedValue(new Set(['test/examples/markdown-example-1.md']));
    vi.mocked(getCommitMessage).mockReturnValue('Publishing %file');

    await main();
    expect(processPostsData).toHaveBeenCalledWith(filesToPublish, new Map([['devTo', expect.any(HostingAPI)]]));
    expect(getCommitMessage).toHaveBeenCalledWith(ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE);
    expect(gitPush).toHaveBeenCalledWith({ branch: 'main' });
  });
});
