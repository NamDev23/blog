import { useState, useEffect } from 'react';
import { Post } from '@/types';
import { mockPosts } from '@/lib/mockData';

interface UseRelatedPostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook lấy bài viết liên quan cho article page.
 *
 * API server đã có scoring theo tag/category. Fallback local lặp lại thuật toán
 * đơn giản để layout related posts vẫn kiểm tra được khi chưa nối Supabase.
 */
export function useRelatedPosts(slug: string, limit: number = 3): UseRelatedPostsReturn {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedPosts = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch(`/api/posts/${slug}/related?limit=${limit}`, {
            signal: AbortSignal.timeout(5000)
          });

          if (!response.ok) {
            throw new Error('Failed to fetch related posts');
          }

          const data = await response.json();
          setPosts(data);
        } catch (fetchErr) {
          // Fallback mock chỉ dùng development; production API không dựa vào dữ liệu mẫu.
          console.warn('Using mock data - Supabase not configured or API error:', fetchErr);

          const currentPost = mockPosts.find(p => p.slug === slug);
          if (!currentPost) {
            setPosts([]);
            return;
          }

          // Thuật toán fallback: category là tín hiệu chính, tag trùng cộng điểm phụ.
          const relatedPosts = mockPosts
            .filter(p => p.slug !== slug)
            .map(p => {
              let score = 0;
              if (p.category === currentPost.category) score += 10;
              const matchingTags = (currentPost.tags || []).filter(t =>
                (p.tags || []).includes(t)
              );
              score += matchingTags.length * 5;
              return { post: p, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.post);

          setPosts(relatedPosts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPosts();
  }, [slug, limit]);

  return {
    posts,
    loading,
    error,
  };
}
