import type { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatePostMetadata } from '@/lib/metadata';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import { defaultLocale, isLocale } from '@/lib/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  try {
    const { locale: rawLocale, slug } = await params;
    const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
    const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;

    if (!isSupabaseConfigured) {
      return mockPost
        ? generatePostMetadata(mockPost, locale)
        : {
            title: locale === 'vi' ? 'Không tìm thấy bài viết' : 'Post Not Found',
            description: locale === 'vi'
              ? 'Bài viết được yêu cầu không tồn tại.'
              : 'The requested post could not be found.',
          };
    }

    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .single();

    if (error || !post) {
      if (mockPost) return generatePostMetadata(mockPost, locale);

      return {
        title: locale === 'vi' ? 'Không tìm thấy bài viết' : 'Post Not Found',
        description: locale === 'vi'
          ? 'Bài viết được yêu cầu không tồn tại.'
          : 'The requested post could not be found.',
      };
    }

    return generatePostMetadata(post, locale);
  } catch (error) {
    console.error('Error generating localized post metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    };
  }
}

export default function LocalizedPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
