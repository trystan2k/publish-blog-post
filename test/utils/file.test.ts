import fs from 'fs';

import { describe, expect, vi, test } from 'vitest';

import { modifyFile, readFile } from '@/pbp/utils/file';
import { FILE_ENCODING } from '@/pbp/utils/const';

vi.mock('fs');

describe('modifyFile', () => {
  test('should write data to file', async () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    vi.mocked(fs).writeFile.mockResolvedValueOnce(undefined);

    await modifyFile(filePath, data);

    expect(fs.writeFileSync).toHaveBeenCalledWith(filePath, data, FILE_ENCODING);
  });
});

describe('readFile', () => {
  test('should read data from file', () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    vi.mocked(fs).readFileSync.mockReturnValueOnce(data);

    const result = readFile(filePath);

    expect(result).toBe(data);
  });
});
