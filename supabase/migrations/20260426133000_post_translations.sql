-- CMS song ngữ cho bài viết blog.
-- Bảng này lưu nội dung theo locale, trong khi public route vẫn dùng cùng slug
-- để canonical/hreflang hiện tại không bị phá vỡ.

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

DROP TRIGGER IF EXISTS update_post_translations_updated_at ON public.post_translations;
CREATE TRIGGER update_post_translations_updated_at
  BEFORE UPDATE ON public.post_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.post_translations ENABLE ROW LEVEL SECURITY;

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

GRANT SELECT ON public.post_translations TO anon, authenticated;
GRANT ALL ON public.post_translations TO service_role;

NOTIFY pgrst, 'reload schema';
