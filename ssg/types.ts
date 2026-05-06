export interface SiteConfig {
  title: string;
  url: string;
  baseurl: string;
  author: string;
  email: string;
  description: string;
  qiita_id: string;
  github_id: string;
  twitter_id: string;
  tumblr_id: string;
  time: Date;
}

export interface Post {
  title: string;
  date: Date;
  slug: string;
  url: string;
  content: string;
  excerpt: string;
  layout: string;
  filePath: string;
}

export interface SiteData {
  config: SiteConfig;
  posts: Post[];
}
