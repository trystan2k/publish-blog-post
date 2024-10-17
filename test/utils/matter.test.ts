import { describe, expect, test } from 'vitest';

import { parseMatter } from '@/pbp/utils/matter';

describe('parseMatter', () => {
  test('should parse matter data', () => {
    const result = parseMatter(
      '---\ntitle: Hello, world!\ndescription: This is the Hello world description\n---\nHello, world!',
    );
    expect(result.data).toEqual({ title: 'Hello, world!', description: 'This is the Hello world description' });
    expect(result.content).toBe('Hello, world!');
  });
});
