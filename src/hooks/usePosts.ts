import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { mockPosts } from '@/lib/mockData';

interface UsePostsOptions {
  category?: string | null;
  search?: string;
  limit?: number;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook lấy danh sách bài viết cho UI client.
 *
 * Page server-side vẫn có thể fetch trực tiếp API để SEO tốt hơn; hook này dành
 * cho các vùng tương tác client-side như filter/search. Fallback mock chỉ giúp
 * local development chạy được khi Supabase chưa cấu hình.
 */
export function usePosts(options: UsePostsOptions = {}): UsePostsReturn {
  const { category = null, search = '', limit } = options;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params bằng URLSearchParams để encode search/category đúng chuẩn.
      const params = new URLSearchParams();
      if (category) {
        params.append('category', category);
      }
      if (search) {
        params.append('search', search);
      }
      if (limit) {
        params.append('limit', limit.toString());
      }

      const url = `/api/posts${params.toString() ? `?${params.toString()}` : ''}`;

      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000) // Tránh UI treo lâu khi API/Supabase không phản hồi.
        });

        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        setPosts(data);
      } catch (fetchErr) {
        // Fallback chỉ nằm trong hook để UI vẫn render được ở môi trường dev.
        console.warn('Using mock data - Supabase not configured or API error:', fetchErr);

        let filteredPosts = [...mockPosts];

        if (category) {
          filteredPosts = filteredPosts.filter(p => p.category === category);
        }

        if (search) {
          const searchLower = search.toLowerCase();
          filteredPosts = filteredPosts.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            p.excerpt.toLowerCase().includes(searchLower)
          );
        }

        if (limit) {
          filteredPosts = filteredPosts.slice(0, limit);
        }

        setPosts(filteredPosts);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search, limit]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
  };
}
