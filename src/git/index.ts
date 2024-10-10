import { setFailed, getInput, info } from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';

export const getGitInstance = () => {
  const GITHUB_TOKEN = getInput('token');
  if (!GITHUB_TOKEN) {
    setFailed('Error: GITHUB_TOKEN is a required input.');
  }

  return getOctokit(GITHUB_TOKEN);
};

export const setBuildFailed = setFailed;

export const getBuildInput = getInput;

export const buildContext = context;

export const logBuildInfo = info;

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

  await exec('git', ['add', filePath]);

  await exec('git', ['commit', '-m', message]);
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

const parseGitStatusOutput = (output: string): { fileStatus: string; fileName: string }[] => {
  const lines = output.trim().split('\n');
  return lines.map(line => {
    const parts = line.trim().split(/\s+/);
    const fileStatus = parts[0].trim();
    const fileName = parts.slice(1).join(' ').trim();
    return { fileStatus, fileName };
  });
};

export const getFilesSinceLastCommit = async () => {
  let files = '';
  await exec('git', ['diff', '--name-status', context.payload.before, context.payload.after], {
    listeners: {
      stdout: (data: Buffer) => {
        files += data.toString();
      },
    },
  });

  return parseGitStatusOutput(files);
};
