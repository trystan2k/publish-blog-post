import { setFailed, getInput, info, debug, isDebug } from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';

import { FileStatusData } from './types';

import {
  supportedFileExtensions,
  ACTION_INPUT_KEY_INCLUDE_FOLDERS,
  GIT_ADD_FILE_STATUS,
  GIT_MODIFIED_FILE_STATUS,
  ACTION_INPUT_KEY_TOKEN,
} from '@/pbp/utils/const';

export const setBuildFailed = setFailed;

export const getBuildInput = getInput;

export const buildContext = context;

export const logBuildInfo = info;

export const logBuildDebug = (message: string) => {
  if (isDebug()) {
    debug(message);
  }
};

// eslint-disable-next-line no-console
export const logBuildError = console.error;

export const getGitInstance = () => {
  const GITHUB_TOKEN = getBuildInput(ACTION_INPUT_KEY_TOKEN);
  if (!GITHUB_TOKEN) {
    setFailed('Error: GITHUB_TOKEN is a required input.');
  }

  return getOctokit(GITHUB_TOKEN);
};

export const gitSetConfig = async () => {
  logBuildInfo('Setting git config...');

  const user = {
    name: 'github-actions[bot]',
    email: '41898282+github-actions[bot]@users.noreply.github.com',
  };

  await exec('git', ['config', 'user.name', user.name]);
  await exec('git', ['config', 'user.email', user.email]);
};

type GitCommitPush = {
  branch: string;
  filePath: string;
  message: string;
};

export const gitCommitPush = async ({ branch, filePath, message }: GitCommitPush) => {
  logBuildInfo('Committing and pushing...');

  await gitCommit({ filePath, message });
  await gitPush({ branch });
};

export const gitCommit = async ({ filePath, message }: Pick<GitCommitPush, 'message' | 'filePath'>) => {
  logBuildInfo('Committing...');

  await exec('git', ['add', filePath]);

  await exec('git', ['commit', '-m', message]);
};

export const gitPush = async ({ branch }: Pick<GitCommitPush, 'branch'>) => {
  logBuildInfo('Pushing...');

  await exec('git', ['push', 'origin', branch]);
};

export const gitCheckout = async () => {
  logBuildInfo('Checking out...');

  const {
    rest: { pulls },
  } = getGitInstance();

  const {
    data: {
      head: { ref: branch },
    },
  } = await pulls.get({
    ...context.repo,
    pull_number: context.issue.number,
  });

  await exec('git', ['fetch', 'origin', branch]);
  await exec('git', ['checkout', branch]);

  return branch;
};

export const authorizeUser = async () => {
  const {
    rest: { repos },
  } = getGitInstance();

  const { data: user } = await repos.getCollaboratorPermissionLevel({
    ...context.repo,
    username: context.actor,
  });

  logBuildInfo(`User permission: ${user.permission}`);

  return user.permission === 'admin' || user.permission === 'write';
};

export const getCommitMessage = (template: string) => {
  const commitMessageTemplate = getBuildInput(template);
  return commitMessageTemplate;
};

const parseGitStatusOutput = (output: string): FileStatusData[] => {
  const lines = output.trim().split('\n');
  return lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const fileStatus = parts[0].trim();
    const fileName = parts.slice(1).join(' ').trim();
    return { fileStatus, fileName };
  });
};

const getFilesBetweenCommits = async (fromCommitHash: string, toCommitHash: string) => {
  let files = '';
  await exec('git', ['diff', '--name-status', fromCommitHash, toCommitHash], {
    listeners: {
      stdout: (data: Buffer) => {
        files += data.toString();
      },
    },
  });

  return parseGitStatusOutput(files);
};

const filterFilesByGitStatus = (files: FileStatusData[], status: string[]) => {
  // Filter to get only the files modified and added
  return files
    .filter(file => status.includes(file.fileStatus))
    .filter(file => {
      return supportedFileExtensions.some(ext => file.fileName.endsWith(ext));
    });
};

const filterFilesByIncludeFolders = (files: FileStatusData[]) => {
  // Check for include folders
  const includeFolders = getBuildInput(ACTION_INPUT_KEY_INCLUDE_FOLDERS);
  if (!includeFolders || includeFolders.trim().length === 0) {
    return files;
  }

  return files.filter(data => includeFolders.split(/\r|\n/).some(folder => data.fileName.includes(folder)));
};

export const getFilesToBePublished = async () => {
  const filesSinceLastCommit = await getFilesBetweenCommits(context.payload.before, context.payload.after);

  const modifiedOrAddedFiles = filterFilesByGitStatus(filesSinceLastCommit, [
    GIT_ADD_FILE_STATUS,
    GIT_MODIFIED_FILE_STATUS,
  ]);

  return filterFilesByIncludeFolders(modifiedOrAddedFiles);
};
