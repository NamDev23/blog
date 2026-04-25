import { MetadataRoute } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { canUseMockApiFallback, getMockPosts } from '@/lib/mockApi';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * Generate sitemap.xml động
 * Next.js sẽ tự động generate file sitemap.xml từ function này
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/projects'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/resume'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/contact'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    if (!isSupabaseConfigured) {
      const mockPostPages: MetadataRoute.Sitemap = canUseMockApiFallback()
        ? getMockPosts().map((post) => ({
            url: absoluteUrl(`/blog/${post.slug}`),
            lastModified: new Date(post.updated_at),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          }))
        : [];

      return [...staticPages, ...mockPostPages];
    }

    // Fetch tất cả published posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts for sitemap:', error);
    }

    // Dynamic post pages
    const postPages: MetadataRoute.Sitemap = (posts || []).map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...postPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages only nếu có lỗi
    return staticPages;
  }
}
