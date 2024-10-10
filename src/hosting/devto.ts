import ky, { HTTPError, type KyInstance } from 'ky';

import { ArticleResponse, CreatePost, HostingAPIModel, UpdatePost } from './types';

import { getBuildInput } from '@/pbp/git';

export class DevToSDK implements HostingAPIModel {
  private readonly client: KyInstance;
  private readonly prefixUrl = 'https://dev.to/api';
  private readonly defaultHeaders = {
    Accept: 'application/vnd.forem.api-v1+json',
  };

  constructor() {
    const devToApiKey = getBuildInput('devToApiKey');
    if (!devToApiKey) {
      throw new Error('Dev.to API key is not set.');
    }

    this.client = ky.create({
      prefixUrl: this.prefixUrl,
      headers: {
        'api-key': devToApiKey,
        ...this.defaultHeaders,
      },
    });
  }

  async createPost(post: CreatePost) {
    return this.client
      .post<ArticleResponse>('articles', { json: post })
      .json()
      .catch(async error => {
        if (error instanceof HTTPError) {
          throw new Error(
            `Error publishing post \n Status: ${error.response.status} \n Reason: ${(await error.response.json()).error || error.message}`,
          );
        } else {
          throw new Error((error as Error).message);
        }
      });
  }

  async updatePost(id: number, post: UpdatePost) {
    return this.client
      .put<ArticleResponse>(`articles/${id}`, { json: post })
      .json()
      .catch(async error => {
        if (error instanceof HTTPError) {
          throw new Error(
            `Error updating post \n Status: ${error.response.status} \n Reason: ${(await error.response.json()).error || error.message}`,
          );
        } else {
          throw new Error((error as Error).message);
        }
      });
  }
}
