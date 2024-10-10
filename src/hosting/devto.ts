import ky, { type KyInstance } from 'ky';

type Article = {
  title: string;
  body_markdown: string;
  published?: boolean;
  series?: string;
  tags?: string[];
  canonical_url?: string;
  cover_image?: string;
  date?: string;
};

type CreatePost = {
  article: Article;
};

type UpdatePost = {
  article: Article;
};

export type ArticleResponse = {
  id: number;
  slug: string;
  path: string;
  url: string;
  created_at: string;
  published_at: string;
};

export class DevToSDK {
  private readonly client: KyInstance;

  constructor(private readonly apiKey: string) {
    this.client = ky.create({
      prefixUrl: 'https://dev.to/api',
      headers: {
        'api-key': this.apiKey,
      },
    });
  }

  async createPost(post: CreatePost) {
    return this.client.post<ArticleResponse>('/articles', { json: post }).json();
  }

  async updatePost(id: number, post: UpdatePost) {
    return this.client.put<ArticleResponse>(`/articles/${id}`, { json: post }).json();
  }
}
