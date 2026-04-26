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
-- 3. COMMENTS TABLE
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
-- 4. CONTACT MESSAGES TABLE
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
-- 5. FUNCTIONS
-- =====================================================

-- Function để tự động update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function tăng view_count dạng atomic cho bài đã publish.
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
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
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
GRANT SELECT, INSERT ON public.comments TO anon, authenticated;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_post_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_post_view(TEXT) TO anon, authenticated, service_role;

GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.comments TO service_role;
GRANT ALL ON public.contact_messages TO service_role;

-- =====================================================
-- 6. SAMPLE DATA (Optional - for testing)
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
