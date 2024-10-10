import { FileStatusData } from '@/pbp/git/types';
import { readFile } from '@/pbp/utils/file';
import { MatterData, parseMatter } from '@/pbp/utils/matter';

export const parsePostFileContent = (files: FileStatusData[]) => {
  return files
    .map(file => {
      const fileContent = readFile(file.fileName);
      const fileMatter = parseMatter(fileContent);
      if (!fileMatter || !fileMatter.data || !Object.keys(fileMatter.data).length) {
        return null;
      }

      return {
        fileData: file,
        matterData: fileMatter,
      };
    })
    .filter(data => data !== null);
};

export const stringifyPostContent = (body: string, matterData: MatterData['data']) => {
  // @ts-expect-error - This is a valid operation, options object has lineWidth property
  return matter.stringify(body, matterData, { lineWidth: -1 });
};
