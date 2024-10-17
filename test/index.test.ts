import fs from 'fs';

import { describe, expect, vi, test, beforeEach, beforeAll, afterAll, Mock } from 'vitest';
import matter from 'gray-matter';

import main from '@/pbp/index';
import { authorizeUser, getBuildInput, getFilesToBePublished, setBuildFailed } from '@/pbp/git';
import { ACTION_INPUT_KEY_INCLUDE_FOLDERS } from '@/pbp/utils/const';

vi.mock('@/pbp/git');
vi.mock('@/pbp/utils/error');

vi.mock(import('fs'), async importOriginal => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      ...actual.default,
      writeFileSync: vi.fn().mockImplementation(() => ''),
    },
  };
});

describe.skip('main function', () => {
  let mockIncludeFolders: Mock;

  const mockedDate = new Date();

  beforeAll(() => {
    vi.useFakeTimers({ now: mockedDate.getTime() });
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.mocked(getBuildInput).mockImplementation((key: string) => {
      if (key === ACTION_INPUT_KEY_INCLUDE_FOLDERS) return mockIncludeFolders();
      return 'default_value';
    });

    vi.clearAllMocks();
  });

  test('should post an error if user is not authorized', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(false);
    await main().catch(e => {
      setBuildFailed(e);
      expect(setBuildFailed).toHaveBeenCalledWith(e);
    });

    expect.assertions(1);
  });

  test('should not publish any file if there is no post file in the include directory list', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('folder_without_post_files');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
      {
        fileStatus: 'A',
        fileName: 'test/other_folder/markdown-example-1.md',
      },
      {
        fileStatus: 'M',
        fileName: 'src/index.ts',
      },
      {
        fileStatus: 'A',
        fileName: 'test/post-samples/markdown-example-1.md',
      },
    ]);

    await main();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test('should not publish any file file is being deleted or renamed', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('examples');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'D',
        fileName: 'test/examples/markdown-example-1.md',
      },
      {
        fileStatus: 'R077',
        fileName: 'test/examples/markdown-example-3.md',
      },
    ]);

    await main();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test('should publish a new post file with updated published date', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('examples');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-1.md',
      },
      {
        fileStatus: 'M',
        fileName: 'src/index.ts',
      },
    ]);

    await main();

    const fileContent = fs.readFileSync('test/examples/markdown-example-1.md', 'utf-8');
    const fileMatter = matter(fileContent);
    fileMatter.data.published_at = mockedDate.toISOString();
    const newContent = matter.stringify(fileMatter.content, fileMatter.data);

    expect(fs.writeFileSync).toHaveBeenCalledWith('test/examples/markdown-example-1.md', newContent, 'utf-8');
  });

  test('should update published post file with updated date', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('examples');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'M',
        fileName: 'test/examples/markdown-example-2.mdx',
      },
    ]);

    await main();

    const fileContent = fs.readFileSync('test/examples/markdown-example-2.mdx', 'utf-8');
    const fileMatter = matter(fileContent);
    fileMatter.data.updated_at = mockedDate.toISOString();
    const newContent = matter.stringify(fileMatter.content, fileMatter.data);

    expect(fs.writeFileSync).toHaveBeenCalledWith('test/examples/markdown-example-2.mdx', newContent, 'utf-8');
  });

  test('should not publish a markdown file without frontmatter config', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('examples');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'A',
        fileName: 'test/examples/markdown-example-3.md',
      },
    ]);

    await main();

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test('should publish all files found when include folders is not specified', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'M',
        fileName: 'test/examples/markdown-example-1.md',
      },
      {
        fileStatus: 'M',
        fileName: 'test/examples/markdown-example-2.mdx',
      },
      {
        fileStatus: 'A',
        fileName: 'test/post-samples/markdown-example-1.md',
      },
    ]);

    await main();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
  });

  test('should publish all files found when multiple include folders are specified', async () => {
    vi.mocked(authorizeUser).mockResolvedValue(true);
    mockIncludeFolders = vi.fn().mockReturnValue('examples\npost-samples');

    vi.mocked(getFilesToBePublished).mockResolvedValue([
      {
        fileStatus: 'M',
        fileName: 'test/examples/markdown-example-1.md',
      },
      {
        fileStatus: 'M',
        fileName: 'test/examples/markdown-example-2.mdx',
      },
      {
        fileStatus: 'A',
        fileName: 'test/post-samples/markdown-example-1.md',
      },
    ]);

    await main();

    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);
  });
});
