import { MetadataRoute } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { canUseMockApiFallback, getMockPosts } from '@/lib/mockApi';
import { languageAlternates, localizedUrl } from '@/lib/metadata';
import { locales, type Locale } from '@/lib/locales';
import type { Post } from '@/types';

export const dynamic = 'force-dynamic';

const staticPages = [
  { path: '/', changeFrequency: 'daily' as const, priority: 1.0 },
  { path: '/blog', changeFrequency: 'daily' as const, priority: 0.9 },
  { path: '/tags', changeFrequency: 'weekly' as const, priority: 0.7 },
  { path: '/projects', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/resume', changeFrequency: 'monthly' as const, priority: 0.8 },
  { path: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
  { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
  { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const localizedStaticPages: MetadataRoute.Sitemap = staticPages.flatMap((page) =>
    locales.map((locale) => ({
      url: localizedUrl(page.path, locale),
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: languageAlternates(page.path),
      },
    }))
  );

  const posts = await getPublishedPostsForSitemap();
  const localizedPostPages: MetadataRoute.Sitemap = posts.flatMap((post) => {
    const path = `/blog/${post.slug}`;
    return locales.map((locale: Locale) => ({
      url: localizedUrl(path, locale),
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: languageAlternates(path),
      },
    }));
  });

  return [...localizedStaticPages, ...localizedPostPages];
}

async function getPublishedPostsForSitemap(): Promise<Pick<Post, 'slug' | 'updated_at'>[]> {
  try {
    if (!isSupabaseConfigured) {
      return canUseMockApiFallback() ? getMockPosts().map(({ slug, updated_at }) => ({ slug, updated_at })) : [];
    }

    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts for sitemap:', error);
      return canUseMockApiFallback() ? getMockPosts().map(({ slug, updated_at }) => ({ slug, updated_at })) : [];
    }

    return posts || [];
  } catch (error) {
    console.error('Error generating sitemap posts:', error);
    return canUseMockApiFallback() ? getMockPosts().map(({ slug, updated_at }) => ({ slug, updated_at })) : [];
  }
}
