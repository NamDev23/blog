-- =====================================================
-- Blog Database Schema for Supabase
-- =====================================================
-- Tạo các bảng cho blog: posts, comments, users
-- Bao gồm RLS policies và indexes để tối ưu performance
-- =====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
SET search_path = public, extensions;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Bảng lưu thông tin tác giả/người dùng
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- =====================================================
-- 2. POSTS TABLE
-- =====================================================
-- Bảng lưu bài viết blog
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image VARCHAR(500),
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  canonical_url VARCHAR(500),
  noindex BOOLEAN DEFAULT false,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  view_count INTEGER DEFAULT 0,
  
  -- Constraints
  CONSTRAINT posts_slug_format CHECK (slug ~ '^[a-z0-9-]+$'),
  CONSTRAINT posts_view_count_positive CHECK (view_count >= 0)
);

-- Indexes để tối ưu queries
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON public.posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_noindex ON public.posts(noindex);

-- =====================================================
-- 3. POST TRANSLATIONS TABLE
-- =====================================================
-- Bảng lưu từng bản ngôn ngữ của bài viết. posts vẫn giữ bản canonical/default
-- để tương thích code cũ; bảng này là nguồn cho UI song ngữ thật.
CREATE TABLE IF NOT EXISTS public.post_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  locale VARCHAR(8) NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  seo_title VARCHAR(70),
  seo_description VARCHAR(170),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT post_translations_locale_check CHECK (locale IN ('vi', 'en')),
  CONSTRAINT post_translations_unique_locale UNIQUE (post_id, locale)
);

CREATE INDEX IF NOT EXISTS idx_post_translations_post_id ON public.post_translations(post_id);
CREATE INDEX IF NOT EXISTS idx_post_translations_locale ON public.post_translations(locale);

-- =====================================================
-- 4. POST VIEWS TABLE
-- =====================================================
-- Audit từng lượt xem hợp lệ. Không lưu IP/User-Agent raw; chỉ lưu HMAC hash
-- để có thể kiểm tra chống spam mà không giữ PII trực tiếp.
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_hash CHAR(64) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  user_agent_hash CHAR(64) NOT NULL,
  view_bucket TIMESTAMP WITH TIME ZONE NOT NULL,
  referrer VARCHAR(500),
  locale VARCHAR(8),
  path VARCHAR(500),
  counted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT post_views_locale_format CHECK (locale IS NULL OR locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
  CONSTRAINT post_views_hash_format CHECK (
    visitor_hash ~ '^[a-f0-9]{64}$'
    AND ip_hash ~ '^[a-f0-9]{64}$'
    AND user_agent_hash ~ '^[a-f0-9]{64}$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_post_views_unique_bucket
  ON public.post_views(post_id, visitor_hash, view_bucket);
CREATE INDEX IF NOT EXISTS idx_post_views_post_created_at
  ON public.post_views(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_views_created_at
  ON public.post_views(created_at DESC);

-- =====================================================
-- 5. COMMENTS TABLE
-- =====================================================
-- Bảng lưu comments cho bài viết
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT comments_email_format CHECK (author_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON public.comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- =====================================================
-- 6. CONTACT MESSAGES TABLE
-- =====================================================
-- Bảng lưu tin nhắn liên hệ để admin có thể tra soát inbox
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(160) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  source VARCHAR(80) NOT NULL DEFAULT 'contact_form',
  user_agent VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT contact_messages_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read', 'archived'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON public.contact_messages(email);

-- =====================================================
-- 7. FUNCTIONS
-- =====================================================

-- Function để tự động update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function ghi audit view và tăng view_count dạng atomic cho bài đã publish.
CREATE OR REPLACE FUNCTION public.track_post_view(
  post_slug TEXT,
  visitor_hash TEXT,
  ip_hash TEXT,
  user_agent_hash TEXT,
  view_bucket TIMESTAMP WITH TIME ZONE,
  referrer TEXT DEFAULT NULL,
  locale TEXT DEFAULT NULL,
  path TEXT DEFAULT NULL
)
RETURNS TABLE(view_count INTEGER, counted BOOLEAN) AS $$
DECLARE
  target_post_id UUID;
  next_count INTEGER;
  inserted_count INTEGER;
BEGIN
  SELECT id INTO target_post_id
  FROM public.posts
  WHERE slug = post_slug
    AND published_at IS NOT NULL
    AND published_at <= NOW();

  IF target_post_id IS NULL THEN
    RETURN QUERY SELECT 0::INTEGER, false;
    RETURN;
  END IF;

  INSERT INTO public.post_views (
    post_id,
    visitor_hash,
    ip_hash,
    user_agent_hash,
    view_bucket,
    referrer,
    locale,
    path,
    counted
  )
  VALUES (
    target_post_id,
    visitor_hash,
    ip_hash,
    user_agent_hash,
    view_bucket,
    NULLIF(LEFT(referrer, 500), ''),
    NULLIF(LEFT(locale, 8), ''),
    NULLIF(LEFT(path, 500), ''),
    true
  )
  ON CONFLICT (post_id, visitor_hash, view_bucket) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;

  IF inserted_count > 0 THEN
    UPDATE public.posts
    SET view_count = view_count + 1
    WHERE id = target_post_id
    RETURNING posts.view_count INTO next_count;

    RETURN QUERY SELECT COALESCE(next_count, 0), true;
    RETURN;
  END IF;

  SELECT posts.view_count INTO next_count
  FROM public.posts
  WHERE id = target_post_id;

  RETURN QUERY SELECT COALESCE(next_count, 0), false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Legacy helper kept for compatibility with older deployments/scripts.
CREATE OR REPLACE FUNCTION public.increment_post_view(post_slug TEXT)
RETURNS INTEGER AS $$
DECLARE
  next_count INTEGER;
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE slug = post_slug
    AND published_at IS NOT NULL
    AND published_at <= NOW()
  RETURNING view_count INTO next_count;

  RETURN COALESCE(next_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers cho auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_translations_updated_at ON public.post_translations;
CREATE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON public.post_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON public.contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS POLICIES
-- =====================================================

-- Public read access
DROP POLICY IF EXISTS "Users are publicly readable" ON public.users;
CREATE POLICY "Users are publicly readable"
  ON public.users FOR SELECT
  USING (true);

-- Only authenticated users can insert
DROP POLICY IF EXISTS "Authenticated users can insert users" ON public.users;
CREATE POLICY "Authenticated users can insert users"
  ON public.users FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- POSTS POLICIES
-- =====================================================

-- Public read access for published posts
DROP POLICY IF EXISTS "Published posts are publicly readable" ON public.posts;
CREATE POLICY "Published posts are publicly readable"
  ON public.posts FOR SELECT
  USING (published_at IS NOT NULL AND published_at <= NOW());

-- Authenticated users can insert posts
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
CREATE POLICY "Authenticated users can insert posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Authors can update their own posts
DROP POLICY IF EXISTS "Authors can update own posts" ON public.posts;
CREATE POLICY "Authors can update own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id);

-- Authors can delete their own posts
DROP POLICY IF EXISTS "Authors can delete own posts" ON public.posts;
CREATE POLICY "Authors can delete own posts"
  ON public.posts FOR DELETE
  USING (auth.uid() = author_id);

-- =====================================================
-- POST TRANSLATIONS POLICIES
-- =====================================================

-- Public read access for translations of published posts
DROP POLICY IF EXISTS "Published post translations are publicly readable" ON public.post_translations;
CREATE POLICY "Published post translations are publicly readable"
  ON public.post_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts
      WHERE posts.id = post_translations.post_id
        AND posts.published_at IS NOT NULL
        AND posts.published_at <= NOW()
    )
  );

-- Authenticated users can manage translations. Server admin uses service_role.
DROP POLICY IF EXISTS "Authenticated users can insert post translations" ON public.post_translations;
CREATE POLICY "Authenticated users can insert post translations"
  ON public.post_translations FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update post translations" ON public.post_translations;
CREATE POLICY "Authenticated users can update post translations"
  ON public.post_translations FOR UPDATE
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete post translations" ON public.post_translations;
CREATE POLICY "Authenticated users can delete post translations"
  ON public.post_translations FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- COMMENTS POLICIES
-- =====================================================

-- Public read access for approved comments
DROP POLICY IF EXISTS "Approved comments are publicly readable" ON public.comments;
CREATE POLICY "Approved comments are publicly readable"
  ON public.comments FOR SELECT
  USING (approved = true);

-- Anyone can insert comments (will need approval)
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.comments;
CREATE POLICY "Anyone can insert comments"
  ON public.comments FOR INSERT
  WITH CHECK (true);

-- Only authenticated users can update comments
DROP POLICY IF EXISTS "Authenticated users can update comments" ON public.comments;
CREATE POLICY "Authenticated users can update comments"
  ON public.comments FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Only authenticated users can delete comments
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;
CREATE POLICY "Authenticated users can delete comments"
  ON public.comments FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- CONTACT MESSAGES POLICIES
-- =====================================================

-- Public visitors can submit contact messages; public read/update/delete is not granted.
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- API GRANTS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT SELECT ON public.post_translations TO anon, authenticated;
GRANT SELECT, INSERT ON public.comments TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
REVOKE ALL ON public.post_views FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.track_post_view(TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_post_view(TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
REVOKE ALL ON FUNCTION public.increment_post_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_view(TEXT) TO anon, authenticated, service_role;

GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.post_translations TO service_role;
GRANT ALL ON public.post_views TO service_role;
GRANT ALL ON public.comments TO service_role;
GRANT ALL ON public.contact_messages TO service_role;

-- =====================================================
-- 9. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample user
INSERT INTO public.users (id, email, name, bio, avatar_url)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'nam@example.com',
  'Nam Dev',
  'Full-stack developer passionate about web technologies',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nam'
)
ON CONFLICT (id) DO NOTHING;

-- Blog seed content is maintained in src/lib/mockData.ts.
-- Run `npm run seed:posts` after applying this schema to replace existing
-- Supabase posts with the current IT knowledge article set.

-- =====================================================
-- DONE! 
-- =====================================================

NOTIFY pgrst, 'reload schema';
-- Chạy script này trong Supabase SQL Editor
-- Sau đó cập nhật .env.local với Supabase credentials
-- =====================================================
