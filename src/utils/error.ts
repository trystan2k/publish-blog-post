import { setBuildFailed } from '@/pbp/git';

export const postError = async (message: string) => {
  setBuildFailed(message);
  throw new Error(message);
};
