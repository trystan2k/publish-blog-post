import { createHostingAPI } from './hosting';
import { HostingAPIModel } from './hosting/types';

import {
  authorizeUser,
  getBuildInput,
  getCommitMessage,
  getFilesToBePublished,
  gitCheckout,
  gitCommit,
  gitPush,
  gitSetConfig,
  logBuildInfo,
  setBuildFailed,
} from '@/pbp/git';
import { parsePostFileContent } from '@/pbp/posts/content';
import { processPostsData } from '@/pbp/posts/process';
import {
  ACTION_INPUT_KEY_API_KEY,
  ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE,
  ACTION_INPUT_KEY_INCLUDE_FOLDERS,
  ACTION_INPUT_KEY_PUBLISH_TO,
} from '@/pbp/utils/const';

const getFilesToBeProcessed = async () => {
  const includeFolders = getBuildInput(ACTION_INPUT_KEY_INCLUDE_FOLDERS);

  const filesToPublish = await getFilesToBePublished(includeFolders.split(/\r|\n/));
  const parsedPostFilesData = parsePostFileContent(filesToPublish);

  if (!parsedPostFilesData || parsedPostFilesData.length === 0) {
    return null;
  }

  return parsedPostFilesData;
};

const getPublishHostSDKs = () => {
  const publishTo = getBuildInput(ACTION_INPUT_KEY_PUBLISH_TO);
  if (!publishTo || publishTo.trim().length === 0) {
    return null;
  }

  const publishHostSDKs = new Map<string, HostingAPIModel>();
  publishTo.split(',').forEach(host => {
    const devToApiKey = getBuildInput(`${host}${ACTION_INPUT_KEY_API_KEY}`);
    publishHostSDKs.set(host, createHostingAPI(host, devToApiKey));
  });

  return publishHostSDKs;
};

const commitPushModifiedFiles = async (modifiedFiles: Set<string>) => {
  await gitSetConfig();
  const branch = await gitCheckout();

  const commitMessage = getCommitMessage(ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE);

  for (const fileName of modifiedFiles) {
    await gitCommit({
      filePath: fileName,
      message: commitMessage.replace('%file', fileName),
    });
  }

  await gitPush({ branch });
};

const main = async () => {
  const isAuthorized = await authorizeUser();
  if (!isAuthorized) {
    throw new Error('You have no permission in this repository to use this action.');
  }

  const filesToBeProcessed = await getFilesToBeProcessed();
  if (!filesToBeProcessed) {
    logBuildInfo('No post files found to process.');
    return null;
  }

  const publishHostsSDK = getPublishHostSDKs();
  if (!publishHostsSDK || publishHostsSDK.size === 0) {
    logBuildInfo('No hosting platforms found to publish.');
    return null;
  }

  const modifiedFiles = await processPostsData(filesToBeProcessed, publishHostsSDK);

  if (!modifiedFiles || modifiedFiles.size === 0) {
    logBuildInfo('No files modified.');
    return null;
  }

  await commitPushModifiedFiles(modifiedFiles);

  logBuildInfo('Build completed successfully.');
};

main().catch(setBuildFailed);

export default main;
