import fs from 'fs';

import matter from 'gray-matter';

import { DevToSDK } from './hosting/devto';

import {
  ACTION_INPUT_KEY_INCLUDE_FOLDERS,
  FILE_ENCODING,
  GIT_ADD_FILE_STATUS,
  GIT_MODIFIED_FILE_STATUS,
  supportedFileExtensions,
} from '@/pbp/utils/const';
import { authorizeUser, getBuildInput, getFilesSinceLastCommit, setBuildFailed } from '@/pbp/git';

async function main() {
  const isAuthorized = await authorizeUser();
  if (!isAuthorized) {
    throw new Error('You have no permission in this repository to use this action.');
  }

  // Get a list of files changed since last commit
  const filesSinceLastCommit = await getFilesSinceLastCommit();

  // Filter to get only the files modified and added
  const modifiedOrAddedMarkdownFiles = filesSinceLastCommit
    .filter(file => file.fileStatus === GIT_MODIFIED_FILE_STATUS || file.fileStatus === GIT_ADD_FILE_STATUS)
    .filter(file => {
      return supportedFileExtensions.some(ext => file.fileName.endsWith(ext));
    });

  // Check for include folders
  const includeFolders = getBuildInput(ACTION_INPUT_KEY_INCLUDE_FOLDERS).split(/\r|\n/);
  const filesToWorkOn = modifiedOrAddedMarkdownFiles.filter(data =>
    includeFolders.some(folder => data.fileName.includes(folder)),
  );

  // Load the frontmatter
  const postsData = filesToWorkOn
    .map(file => {
      const fileContent = fs.readFileSync(file.fileName, FILE_ENCODING);
      const fileMatter = matter(fileContent);
      if (!fileMatter || !Object.keys(fileMatter.data).length) {
        return {};
      }

      // TODO: Validate the frontmatter params with Zod

      return {
        fileData: file,
        matterData: fileMatter,
      };
    })
    .filter(data => Object.keys(data).length);

  postsData.forEach(({ fileData, matterData }) => {
    // If publish date is not set, publish the post
    let newMatter = matterData?.data;
    if (!matterData!.data.published_at) {
      newMatter = {
        ...matterData!.data,
        published_at: new Date().toISOString(),
      };
    } else {
      // If publish date is set, update the post

      newMatter = {
        ...matterData!.data,
        updated_at: new Date().toISOString(),
      };
    }

    const newContent = matter.stringify(matterData!.content, newMatter);
    fs.writeFileSync(fileData!.fileName, newContent, FILE_ENCODING);

    const devToApiKey = getBuildInput('devToApiKey');
    if (!devToApiKey) {
      throw new Error('Dev.to API key is not set.');
    }

    const devSDK = new DevToSDK(devToApiKey);
    const response = devSDK.createPost({
      article: {
        title: newMatter.title,
        body_markdown: newContent,
      },
    });

    // eslint-disable-next-line no-console
    console.log('response', response);

    // Publish the file to dev.to
    //     const devSDK = new DevToSDK('api-key');
    //     devSDK.createPost({
    //       article: {
    //         title: newMatter.title,
    //         body_markdown: newContent,
    //       },
    //     });
    // Git commit and push
    //     gitCommitPush({
    //       branch: 'main',
    //       filePath: file,
    //       message: `Publishing ${file}`,
    //     });
  });
}

main().catch(setBuildFailed);

export default main;
