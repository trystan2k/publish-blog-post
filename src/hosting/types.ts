export enum HostingType {
  DEV_TO = 'devTo',
  MEDIUM = 'medium',
}

export type Article = {
  title?: string;
  body_markdown: string;
  published?: boolean;
  series?: string;
  tags?: string[];
  canonical_url?: string;
  cover_image?: string;
  date?: string;
};

export type CreatePost = {
  article: Article;
};

export type UpdatePost = {
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

export interface HostingAPIModel {
  createPost: (post: CreatePost) => Promise<ArticleResponse>;
  updatePost: (id: number, post: UpdatePost) => Promise<ArticleResponse>;
}
