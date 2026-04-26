export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  canonical_url?: string | null;
  noindex?: boolean;
  author_id: string;
  category: string;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
  view_count: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email?: string;
  content: string;
  approved?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  source: string;
  user_agent?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}
