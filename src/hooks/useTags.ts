import { useState, useEffect } from 'react';
import { mockPosts } from '@/lib/mockData';

export interface Tag {
  name: string;
  count: number;
}

interface UseTagsReturn {
  tags: Tag[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook để fetch tags từ API
 * Fallback to mock data nếu API không hoạt động
 */
export function useTags(): UseTagsReturn {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/tags', {
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }

        const data = await response.json();
        setTags(data);
      } catch (fetchErr) {
        // Fallback to mock data
        console.warn('Using mock data - Supabase not configured or API error:', fetchErr);

        const tagCounts: Record<string, number> = {};
        mockPosts.forEach(post => {
          post.tags?.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const mockTags = Object.entries(tagCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setTags(mockTags);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    refetch: fetchTags,
  };
}

