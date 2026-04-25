import { useState, useEffect, useCallback } from 'react';
import { Post } from '@/types';
import { mockPosts } from '@/lib/mockData';

interface UsePostReturn {
  post: Post | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook để fetch một post theo slug
 * Fallback to mock data nếu API không hoạt động
 */
export function usePost(slug: string): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/posts/${slug}`, {
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Post not found');
        }

        const data = await response.json();
        setPost(data);
      } catch (fetchErr) {
        // Fallback to mock data
        console.warn('Using mock data - Supabase not configured or API error:', fetchErr);
        const mockPost = mockPosts.find(p => p.slug === slug);

        if (mockPost) {
          setPost(mockPost);
        } else {
          throw new Error('Post not found');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug, fetchPost]);

  return {
    post,
    loading,
    error,
    refetch: fetchPost,
  };
}
