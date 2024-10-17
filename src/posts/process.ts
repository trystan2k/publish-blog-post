import { stringifyPostContent } from './content';

import { modifyFile } from '@/pbp/utils/file';
import { FileStatusData } from '@/pbp/git/types';
import { createHostingAPI } from '@/pbp/hosting';
import { HostingAPIModel } from '@/pbp/hosting/types';
import { getBuildInput, logBuildDebug, logBuildError, logBuildInfo } from '@/pbp/git';
import { MatterData } from '@/pbp/utils/matter';

const publishOrUpdatedPost = async (hostingSDK: HostingAPIModel, hostingKeyName: string, matterData: MatterData) => {
  const contentToPublish = stringifyPostContent(matterData.content, matterData.data);

  let response = null;

  if (matterData.data[`${hostingKeyName}`] === undefined || matterData.data[`${hostingKeyName}`] === null) {
    response = await hostingSDK.createPost({
      article: {
        body_markdown: contentToPublish,
      },
    });
  } else if (matterData.data[`${hostingKeyName}`] !== false) {
    response = await hostingSDK.updatePost(matterData.data[`${hostingKeyName}`], {
      article: {
        body_markdown: contentToPublish,
      },
    });
  } else {
    logBuildInfo(`Post is not published to ${hostingKeyName}`);
  }

  return response;
};

export const processPostsData = async (
  filesData: {
    fileData: FileStatusData;
    matterData: MatterData;
  }[],
) => {
  const publishTo = getBuildInput('publishTo');
  if (!publishTo || publishTo.trim().length === 0 || publishTo.split(',').length === 0) {
    throw new Error('No hosting platform specified to publish the post');
  }

  const publishHostsSDK = new Map<string, HostingAPIModel>();
  publishTo.split(',').forEach(host => {
    const devToApiKey = getBuildInput(`${host}ApiKey`);
    publishHostsSDK.set(host, createHostingAPI(host, devToApiKey));
  });

  const filesUpdated = new Set<string>();

  const processedData = filesData.map(async data => {
    const { matterData, fileData } = data;

    try {
      for (const [host, hostingSDK] of publishHostsSDK.entries()) {
        const response = await publishOrUpdatedPost(hostingSDK, host, matterData);

        if (response !== null) {
          const { id, published_at } = response;
          const publishedMatterData: MatterData['data'] = {
            ...matterData.data,
            [host]: id,
            published_at: published_at,
          };

          const updatePublishedContent = stringifyPostContent(matterData.content, publishedMatterData);
          modifyFile(fileData.fileName, updatePublishedContent);
          filesUpdated.add(fileData.fileName);
        }
      }
    } catch (error) {
      logBuildError(`Error publishing post "${fileData.fileName}" \n Cause: ${(error as Error).message}`);
      logBuildDebug((error as Error).toString());
    }
  });

  await Promise.all(processedData);
  return filesUpdated;
};
