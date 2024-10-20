import matter from 'gray-matter';

import { ContentFileData } from './types';

import { FileStatusData } from '@/pbp/git/types';
import { readFile } from '@/pbp/utils/file';
import { MatterData, parseMatter } from '@/pbp/utils/matter';

export const parsePostFileContent = (files: FileStatusData[]): ContentFileData[] => {
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
  // @ts-expect-error - lineWidth is not in the types
  return matter.stringify(body, matterData, { lineWidth: -1 });
};
