import { Metadata } from 'next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { generatePostMetadata } from '@/lib/metadata';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';

/**
 * Generate metadata cho post detail page
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

    // Fetch post từ Supabase
    const { data: post, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !post) {
      if (mockPost) return generatePostMetadata(mockPost);

      return {
        title: 'Post Not Found',
        description: 'The requested post could not be found.',
      };
    }

    return generatePostMetadata(post);
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
