import { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatePostMetadata } from '@/lib/metadata';
import { isMissingPostTranslationsRelation, POST_SELECT_WITH_TRANSLATIONS } from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import type { Post } from '@/types';

/**
 * Metadata cho route legacy không có locale (`/blog/[slug]`).
 *
 * Proxy sẽ redirect public traffic sang `/vi/blog/[slug]`, nhưng file này vẫn giữ
 * metadata hợp lệ nếu Next render route trực tiếp trong dev hoặc qua import wrapper.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;

    if (!isSupabaseConfigured) {
      return mockPost
        ? generatePostMetadata(mockPost)
        : {
            title: 'Post Not Found',
            description: 'The requested post could not be found.',
          };
    }

    // Metadata chỉ dùng bài đã publish để không expose draft lên bot/share preview.
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
      if (mockPost) return generatePostMetadata(mockPost);

      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }

    return generatePostMetadata(post as unknown as Post);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    };
  }
}

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
