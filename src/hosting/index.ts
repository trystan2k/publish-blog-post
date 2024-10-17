import { createDevToSDK } from './devto';
import { CreatePost, HostingAPIModel, HostingType, UpdatePost } from './types';

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

  async createPost(post: CreatePost) {
    return this.hosting.createPost(post);
  }

  async updatePost(id: number, post: UpdatePost) {
    return this.hosting.updatePost(id, post);
  }
}

export const createHostingAPI = (name: string, apiKey: string) => new HostingAPI(name, apiKey);
