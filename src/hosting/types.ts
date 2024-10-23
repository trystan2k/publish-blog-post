import { MatterData } from '@/pbp/utils/matter';

export enum HostingType {
  DEV_TO = 'devTo',
}

export interface HostingAPIModel {
  createPost: (matterData: MatterData) => Promise<MatterData['data']>;
  updatePost: (matterData: MatterData) => Promise<MatterData['data']>;
}
