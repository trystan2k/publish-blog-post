import fs from 'fs';

import { FILE_ENCODING } from './const';

export const modifyFile = (filePath: string, data: string) => {
  fs.writeFileSync(filePath, data, FILE_ENCODING);
};

export const readFile = (filePath: string) => {
  return fs.readFileSync(filePath, FILE_ENCODING);
};
