import { MatterData } from '@/pbp/utils/matter';
import { FileStatusData } from '@/pbp/git/types';

export type ContentFileData = { fileData: FileStatusData; matterData: MatterData };
