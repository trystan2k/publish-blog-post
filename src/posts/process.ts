import { stringifyPostContent } from './content';
import { ContentFileData } from './types';

import { modifyFile } from '@/pbp/utils/file';
import { HostingAPIModel } from '@/pbp/hosting/types';
import { logBuildDebug, logBuildError, logBuildInfo } from '@/pbp/git';
import { MatterData } from '@/pbp/utils/matter';

const publishOrUpdatedPost = async (hostingSDK: HostingAPIModel, hostingKeyName: string, matterData: MatterData) => {
  let response = null;
  if (matterData.data[`${hostingKeyName}`] === undefined || matterData.data[`${hostingKeyName}`] === null) {
    response = await hostingSDK.createPost(matterData);
  } else if (matterData.data[`${hostingKeyName}`] !== false) {
    response = await hostingSDK.updatePost(matterData);
  } else {
    logBuildInfo(`Post is not published to ${hostingKeyName}`);
  }

  return response;
};

export const processPostsData = async (filesData: ContentFileData[], publishHostsSDK: Map<string, HostingAPIModel>) => {
  const filesUpdated = new Set<string>();

  const processedData = filesData.map(async data => {
    const { matterData, fileData } = data;

    try {
      for (const [host, hostingSDK] of publishHostsSDK.entries()) {
        const response = await publishOrUpdatedPost(hostingSDK, host, matterData);

        if (response !== null) {
          const publishedMatterData: MatterData['data'] = {
            ...matterData.data,
            ...response,
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
