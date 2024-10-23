import { createDevToSDK } from './devto';
import { HostingAPIModel, HostingType } from './types';

import { MatterData } from '@/pbp/utils/matter';

const hostingInitializers: Record<string, (apiKey: string) => HostingAPIModel> = {
  [HostingType.DEV_TO]: createDevToSDK,
};

export class HostingAPI {
  private readonly hosting: HostingAPIModel;
  constructor(
    private readonly name: string,
    apiKey: string,
  ) {
    this.hosting = this.getHostingInstance(apiKey);
  }

  private getHostingInstance(apiKey: string) {
    const initializer = hostingInitializers[this.name];
    if (!initializer) {
      throw new Error(`Hosting ${this.name} is not supported.`);
    }

    return initializer(apiKey);
  }

  async createPost(matterData: MatterData) {
    return this.hosting.createPost(matterData);
  }

  async updatePost(matterData: MatterData) {
    return this.hosting.updatePost(matterData);
  }
}

export const createHostingAPI = (name: string, apiKey: string) => new HostingAPI(name, apiKey);
