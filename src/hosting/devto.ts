import ky, { HTTPError, type KyInstance } from 'ky';

import { HostingAPIModel, HostingType } from './types';

import { stringifyPostContent } from '@/pbp/posts/content';
import { MatterData } from '@/pbp/utils/matter';

type Article = {
  title?: string;
  body_markdown: string;
  published?: boolean;
  series?: string;
  tags?: string[];
  canonical_url?: string;
  cover_image?: string;
  date?: string;
};

type ArticleRequest = {
  article: Article;
};

type ArticleResponse = {
  id: number;
  slug: string;
  path: string;
  url: string;
  created_at: string;
  published_at: string;
  edited_at: string;
};

class DevToSDK implements HostingAPIModel {
  private readonly client: KyInstance;
  private readonly prefixUrl = 'https://dev.to/api';
  private readonly defaultHeaders = {
    Accept: 'application/vnd.forem.api-v1+json',
  };

  constructor(devToApiKey: string) {
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

  private createRequest(matterData: MatterData): ArticleRequest {
    const requestMatterData = {
      title: matterData.data.title,
      description: matterData.data.description,
      published: matterData.data.published,
      tags: matterData.data.tags,
      date: matterData.data[`published_${HostingType.DEV_TO}_at`],
      series: matterData.data.series,
      canonical_url: matterData.data.canonical_url,
      cover_image: matterData.data.cover_image,
    };

    const cleanedMatterData = Object.entries(requestMatterData).reduce(
      (a, [k, v]) => (v === null || v === undefined ? a : ((a[k] = v), a)),
      {} as MatterData['data'],
    );

    const contentToPublish = stringifyPostContent(matterData.content, cleanedMatterData);

    return {
      article: {
        body_markdown: contentToPublish,
      },
    };
  }

  async createPost(matterData: MatterData): Promise<MatterData['data']> {
    const postToPublish = this.createRequest(matterData);
    const response = await this.client
      .post<ArticleResponse>('articles', { json: postToPublish })
      .json()
      .catch(async error => {
        if (error instanceof HTTPError) {
          throw new Error(
            `Error publishing post \n Status: ${error.response.status} \n Reason: ${(await error.response.json()).error}`,
          );
        } else {
          throw new Error((error as Error).message);
        }
      });

    return {
      [HostingType.DEV_TO]: response.id,
      [`published_${HostingType.DEV_TO}_at`]: response.published_at,
    };
  }

  async updatePost(matterData: MatterData): Promise<MatterData['data']> {
    const postToPublish = this.createRequest(matterData);
    const response = await this.client
      .put<ArticleResponse>(`articles/${matterData.data[HostingType.DEV_TO]}`, { json: postToPublish })
      .json()
      .catch(async error => {
        if (error instanceof HTTPError) {
          throw new Error(
            `Error updating post \n Status: ${error.response.status} \n Reason: ${(await error.response.json()).error}`,
          );
        } else {
          throw new Error((error as Error).message);
        }
      });

    return {
      [HostingType.DEV_TO]: response.id,
      [`published_${HostingType.DEV_TO}_at`]: response.published_at,
      [`updated_${HostingType.DEV_TO}_at`]: response.edited_at,
    };
  }
}

export const createDevToSDK = (apiKey: string) => new DevToSDK(apiKey);
