import fs from 'fs';

import { describe, expect, vi, test, Mocked } from 'vitest';

import { modifyFile, readFile } from '@/pbp/utils/file';
import { FILE_ENCODING } from '@/pbp/utils/const';

vi.mock('fs');
const mockedFs = fs as Mocked<typeof fs>;

describe('modifyFile', () => {
  test('should write data to file', async () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    mockedFs.writeFile.mockResolvedValueOnce(undefined);

    await modifyFile(filePath, data);

    expect(mockedFs.writeFileSync).toHaveBeenCalledWith(filePath, data, FILE_ENCODING);
  });
});

describe('readFile', () => {
  test('should read data from file', () => {
    const data = 'Hello, world!';
    const filePath = 'path/to/file.txt';

    mockedFs.readFileSync.mockReturnValueOnce(data);

    const result = readFile(filePath);

    expect(result).toBe(data);
  });
});
