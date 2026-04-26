import { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatePostMetadata } from '@/lib/metadata';
import { isMissingPostTranslationsRelation, POST_SELECT_WITH_TRANSLATIONS } from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import type { Post } from '@/types';

/**
 * Helper metadata cũ cho post detail.
 *
 * File này đang trùng vai trò với `layout.tsx`; giữ lại để tránh phá import nếu có
 * code cũ tham chiếu, nhưng logic chính nên ưu tiên layout/generatePostMetadata.
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

    // Query trực tiếp post theo slug để tạo title/description/OpenGraph động.
    const buildPostQuery = (selectFields: string) =>
      supabase
        .from('posts')
        .select(selectFields)
        .eq('slug', slug)
        .single();

    let { data: post, error } = await buildPostQuery(POST_SELECT_WITH_TRANSLATIONS);

    if (error && isMissingPostTranslationsRelation(error)) {
      ({ data: post, error } = await buildPostQuery('*'));
    }

    if (error || !post) {
      if (mockPost) return generatePostMetadata(mockPost);

      // Fallback metadata nếu không tìm thấy post.
      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }

    // Generate metadata từ post data.
    return generatePostMetadata(post as unknown as Post);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Error',
      description: 'An error occurred while loading the post.',
    };
  }
}
