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
-- 4. FUNCTIONS
-- =====================================================

-- Function để tự động update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

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
-- API GRANTS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.users TO anon, authenticated;
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT SELECT, INSERT ON public.comments TO anon, authenticated;

GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.posts TO service_role;
GRANT ALL ON public.comments TO service_role;

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

-- Insert sample posts
INSERT INTO public.posts (title, slug, content, excerpt, featured_image, author_id, category, tags, published_at, view_count)
VALUES
(
  'Getting Started with Next.js 14',
  'getting-started-nextjs-14',
  '<h2>Introduction</h2><p>Next.js 14 brings exciting new features and improvements to the React framework. In this comprehensive guide, we will explore the key features and how to get started with your first Next.js 14 project.</p><h2>What is New in Next.js 14?</h2><p>Next.js 14 introduces several groundbreaking features:</p><ul><li>Improved performance with Turbopack</li><li>Enhanced Server Components</li><li>Better error handling</li><li>Streaming and Suspense improvements</li></ul><h2>Getting Started</h2><p>To create a new Next.js 14 project, run the following command:</p><pre><code>npx create-next-app@latest my-app</code></pre><h2>Conclusion</h2><p>Next.js 14 is a powerful framework for building modern web applications.</p>',
  'A comprehensive guide to setting up and using Next.js 14 for your next project.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
  '00000000-0000-0000-0000-000000000001',
  'Web Development',
  ARRAY['nextjs', 'react', 'javascript'],
  NOW() - INTERVAL '5 days',
  1250
),
(
  'Mastering Tailwind CSS',
  'mastering-tailwind-css',
  '<h2>Introduction to Tailwind</h2><p>Tailwind CSS is a utility-first CSS framework that makes styling your applications a breeze.</p><h2>Key Features</h2><ul><li>Utility-first approach</li><li>Responsive design</li><li>Customizable</li><li>Dark mode support</li></ul><h2>Best Practices</h2><p>Learn how to use Tailwind CSS effectively in your projects.</p>',
  'Learn advanced techniques and best practices for using Tailwind CSS in your projects.',
  'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop',
  '00000000-0000-0000-0000-000000000001',
  'CSS',
  ARRAY['tailwind', 'css', 'design'],
  NOW() - INTERVAL '10 days',
  980
),
(
  'Building Scalable APIs',
  'building-scalable-apis',
  '<h2>API Design Principles</h2><p>Learn the best practices for designing and building scalable APIs that can handle growth.</p><h2>Architecture Patterns</h2><ul><li>RESTful design</li><li>GraphQL</li><li>Microservices</li></ul><h2>Performance Optimization</h2><p>Techniques to optimize your API performance.</p>',
  'Explore architectural patterns and techniques for building APIs that can handle growth.',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop',
  '00000000-0000-0000-0000-000000000001',
  'Backend',
  ARRAY['api', 'backend', 'architecture'],
  NOW() - INTERVAL '15 days',
  750
)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DONE! 
-- =====================================================

NOTIFY pgrst, 'reload schema';
-- Chạy script này trong Supabase SQL Editor
-- Sau đó cập nhật .env.local với Supabase credentials
-- =====================================================
