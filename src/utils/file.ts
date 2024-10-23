import fs from 'fs';

import { FILE_ENCODING } from './const';

import { FileStatusData } from '@/pbp/git/types';

export const modifyFile = (filePath: string, data: string) => {
  fs.writeFileSync(filePath, data, FILE_ENCODING);
};

export const readFile = (filePath: string) => {
  return fs.readFileSync(filePath, FILE_ENCODING);
};

export const filterFilesByIncludeFolders = (files: FileStatusData[], includeFolders: string[]) => {
  if (!includeFolders.length) {
    return files;
  }

  return files.filter(data => includeFolders.some(folder => data.fileName.includes(folder)));
};
