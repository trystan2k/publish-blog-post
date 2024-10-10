import matter, { GrayMatterFile } from 'gray-matter';

export type MatterData = GrayMatterFile<string>;

export const parseMatter = (content: string) => {
  const matterData = matter(content);
  return matterData;
};
