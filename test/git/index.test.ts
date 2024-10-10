import { describe, expect, vi, test, beforeEach, Mock, beforeAll } from 'vitest';
import { exec } from '@actions/exec';
import { getInput, setFailed } from '@actions/core';
import { context, getOctokit } from '@actions/github';

import {
  authorizeUser,
  getCommitMessage,
  getGitInstance,
  getFilesToBePublished,
  gitCheckout,
  gitCommitPush,
  gitSetConfig,
} from '@/pbp/git';

vi.mock('@actions/exec');
vi.mock('@actions/github');
vi.mock('@actions/core');

describe('Git Utilities', () => {
  beforeAll(() => {
    Object.defineProperty(context, 'repo', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });

    Object.defineProperty(context, 'issue', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getGitInstance', () => {
    test('should return an Octokit instance when GITHUB_TOKEN is provided', () => {
      vi.mocked(getInput).mockReturnValue('fake-token');
      vi.mocked(getOctokit as Mock).mockReturnValue({});
      const octokit = getGitInstance();
      expect(getInput).toHaveBeenCalledWith('token');
      expect(getOctokit).toHaveBeenCalledWith('fake-token');
      expect(octokit).toBeDefined();
    });

    test('should call setFailed when GITHUB_TOKEN is not provided', () => {
      vi.mocked(getInput).mockReturnValue('');
      getGitInstance();
      expect(setFailed).toHaveBeenCalledWith('Error: GITHUB_TOKEN is a required input.');
    });
  });

  describe('gitSetConfig', () => {
    test('should set git config for user', async () => {
      await gitSetConfig();
      expect(exec).toHaveBeenCalledWith('git', ['config', 'user.name', 'github-actions[bot]']);
      expect(exec).toHaveBeenCalledWith('git', [
        'config',
        'user.email',
        '41898282+github-actions[bot]@users.noreply.github.com',
      ]);
    });
  });

  describe('gitCommitPush', () => {
    test('should commit and push changes', async () => {
      await gitCommitPush({ branch: 'main', filePath: 'path/to/file', message: 'Test commit' });
      expect(exec).toHaveBeenCalledWith('git', ['add', 'path/to/file']);
      expect(exec).toHaveBeenCalledWith('git', ['commit', '-m', 'Test commit']);
      expect(exec).toHaveBeenCalledWith('git', ['push', 'origin', 'main']);
    });
  });

  describe('gitCheckout', () => {
    test('should checkout a branch', async () => {
      const mockPulls = {
        get: vi.fn<() => { data: { head: { ref: string } } }>(() => ({ data: { head: { ref: 'feature-branch' } } })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { pulls: mockPulls } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.issue = { number: 1 };

      const branch = await gitCheckout();
      expect(exec).toHaveBeenCalledWith('git', ['fetch', 'origin', 'feature-branch']);
      expect(exec).toHaveBeenCalledWith('git', ['checkout', 'feature-branch']);
      expect(branch).toBe('feature-branch');
    });
  });

  describe('authorizeUser', () => {
    test('should authorize user with admin or write permission', async () => {
      const mockRepos = {
        getCollaboratorPermissionLevel: vi.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'admin' },
        })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { repos: mockRepos } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      context.actor = 'user';

      const isAuthorized = await authorizeUser();
      expect(mockRepos.getCollaboratorPermissionLevel).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        username: 'user',
      });
      expect(isAuthorized).toBe(true);
    });

    test('should not authorize user without admin or write permission', async () => {
      const mockRepos = {
        getCollaboratorPermissionLevel: vi.fn<() => { data: { permission: string } }>(() => ({
          data: { permission: 'read' },
        })),
      };
      vi.mocked(getOctokit as Mock).mockReturnValue({ rest: { repos: mockRepos } });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      context.repo = { owner: 'owner', repo: 'repo' };
      context.actor = 'user';

      const isAuthorized = await authorizeUser();
      expect(mockRepos.getCollaboratorPermissionLevel).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        username: 'user',
      });
      expect(isAuthorized).toBe(false);
    });
  });

  describe('getCommitMessage', () => {
    test('should return a commit message template', () => {
      vi.mocked(getInput).mockReturnValue('Test commit message');
      const commitMessage = getCommitMessage('commit-message');
      expect(getInput).toHaveBeenCalledWith('commit-message');
      expect(commitMessage).toBe('Test commit message');
    });
  });

  describe('getFilesToBePublished', () => {
    test('should return modified files', async () => {
      const mockOutput = 'M\tfile1.txt\nA\tfile2.txt\nD\tfile3.txt\nR077\tfile4.txt\nA\tfile5.txt\nR093\tfile6.txt';
      vi.mocked(exec).mockImplementation((cmd, args, options) => {
        if (options?.listeners?.stdout) {
          options.listeners.stdout(Buffer.from(mockOutput));
        }
        return Promise.resolve(0);
      });

      context.payload = { before: 'before-sha', after: 'after-sha' };

      const modifiedFiles = await getFilesToBePublished();
      expect(exec).toHaveBeenCalledWith(
        'git',
        ['diff', '--name-status', 'before-sha', 'after-sha'],
        expect.any(Object),
      );
      expect(modifiedFiles).toEqual([
        { fileStatus: 'M', fileName: 'file1.txt' },
        { fileStatus: 'A', fileName: 'file2.txt' },
        { fileStatus: 'D', fileName: 'file3.txt' },
        { fileStatus: 'R077', fileName: 'file4.txt' },
        { fileStatus: 'A', fileName: 'file5.txt' },
        { fileStatus: 'R093', fileName: 'file6.txt' },
      ]);
    });
  });
});
