import {
  authorizeUser,
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
import { ACTION_INPUT_KEY_COMMIT_MESSAGE_TEMPLATE } from '@/pbp/utils/const';

const main = async () => {
  const isAuthorized = await authorizeUser();
  if (!isAuthorized) {
    throw new Error('You have no permission in this repository to use this action.');
  }

  const filesToPublish = await getFilesToBePublished();
  const parsedPostFilesData = parsePostFileContent(filesToPublish);

  if (!parsedPostFilesData || parsedPostFilesData.length === 0) {
    return null;
  }

  const modifiedFiles = await processPostsData(parsedPostFilesData);

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

  logBuildInfo('Build completed successfully.');
};

main().catch(setBuildFailed);

export default main;
