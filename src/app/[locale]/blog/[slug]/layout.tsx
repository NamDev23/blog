import type { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatePostMetadata } from '@/lib/metadata';
import { isMissingPostTranslationsRelation, POST_SELECT_WITH_TRANSLATIONS } from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import { defaultLocale, isLocale } from '@/lib/locales';
import type { Post } from '@/types';

/**
 * Metadata động cho route bài viết có locale.
 *
 * Đây là route SEO chính của article page. Metadata dùng `locale` từ URL để chọn
 * title/excerpt/content tương ứng qua `generatePostMetadata`.
 */
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

    const buildPostQuery = (selectFields: string) =>
      supabase
        .from('posts')
        .select(selectFields)
        .eq('slug', slug)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .single();

    let { data: post, error } = await buildPostQuery(POST_SELECT_WITH_TRANSLATIONS);

    if (error && isMissingPostTranslationsRelation(error)) {
      ({ data: post, error } = await buildPostQuery('*'));
    }

    if (error || !post) {
      if (mockPost) return generatePostMetadata(mockPost, locale);

      return {
        title: locale === 'vi' ? 'Không tìm thấy bài viết' : 'Post Not Found',
        description: locale === 'vi'
          ? 'Bài viết được yêu cầu không tồn tại.'
          : 'The requested post could not be found.',
      };
    }

    return generatePostMetadata(post as unknown as Post, locale);
  } catch (error) {
    console.error('Error generating localized post metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    };
  }
}

export default function LocalizedPostLayout({ children }: { children: React.ReactNode }) {
  // Layout không thêm wrapper để HTML article giống route legacy; chỉ metadata khác theo locale.
  return <>{children}</>;
}
