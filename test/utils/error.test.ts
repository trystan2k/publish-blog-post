import { describe, expect, vi, test } from 'vitest';

import { postError } from '@/pbp/utils/error';
import { setBuildFailed } from '@/pbp/git';

vi.mock('@/pbp/git', () => ({
  setBuildFailed: vi.fn(),
}));

describe('error.ts', () => {
  describe('postError', () => {
    test('should call setBuildFailed, and exit the process', async () => {
      const message = 'Test error message';

      await expect(postError(message)).rejects.toThrow('Test error messag');
      expect(setBuildFailed).toHaveBeenCalledWith(message);
    });
  });
});
