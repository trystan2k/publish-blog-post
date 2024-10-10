import { DevToSDK } from './devto';
import { CreatePost, HostingAPIModel, HostingType, UpdatePost } from './types';

const hostingInitializers: Record<string, () => HostingAPIModel> = {
  [HostingType.DEV_TO]: () => new DevToSDK(),
};

export class HostingAPI {
  private readonly hosting: HostingAPIModel;
  constructor(private readonly name: string) {
    this.hosting = this.getHostingInstance();
  }

  private getHostingInstance() {
    const initializer = hostingInitializers[this.name];
    if (!initializer) {
      throw new Error(`Hosting ${this.name} is not supported.`);
    }

    return initializer();
  }

  async createPost(post: CreatePost) {
    return this.hosting.createPost(post);
  }

  async updatePost(id: number, post: UpdatePost) {
    return this.hosting.updatePost(id, post);
  }
}

export const createHostingAPI = (name: string) => new HostingAPI(name);
