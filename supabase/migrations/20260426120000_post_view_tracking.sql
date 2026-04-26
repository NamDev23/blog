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

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
REVOKE ALL ON public.post_views FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.track_post_view(TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_post_view(TEXT, TEXT, TEXT, TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
GRANT ALL ON public.post_views TO service_role;

NOTIFY pgrst, 'reload schema';
