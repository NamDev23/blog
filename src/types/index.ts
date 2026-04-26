/**
 * Bản ghi bài viết như API/Supabase trả về.
 *
 * Field SEO là optional vì các bản ghi cũ có thể chưa có dữ liệu này; UI phải có
 * fallback từ title/excerpt. `published_at` dùng để phân biệt public/draft ở API.
 */
export interface PostTranslation {
  id?: string;
  post_id?: string;
  locale: 'vi' | 'en';
  title: string;
  content: string;
  excerpt: string;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

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
  post_translations?: PostTranslation[];
  translations?: PostTranslation[];
}

/**
 * Comment public/admin.
 *
 * Public API không trả `author_email` và `approved`; admin API có thể trả để phục
 * vụ moderation. Vì vậy hai field này được đánh dấu optional ở type dùng chung.
 */
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

/**
 * Tin nhắn từ form liên hệ trong admin inbox.
 *
 * `status` là workflow xử lý nhẹ: new -> read -> archived. Nếu sau này cần team
 * support thật, có thể mở rộng thành ticket/assignee/audit log.
 */
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

/**
 * User profile placeholder.
 *
 * Hiện project chưa dùng Supabase Auth user table chính thức; type này giữ chỗ
 * cho hồ sơ author/admin nếu mở rộng multi-user.
 */
export interface User {
  id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  created_at: string;
}
