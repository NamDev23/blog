import { useState, useEffect } from 'react';
import { mockPosts } from '@/lib/mockData';

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook lấy danh sách category cho filter/navigation client-side.
 *
 * Category được dẫn xuất từ bài đã publish, nên fallback cũng lấy từ mock posts
 * public để hành vi local gần giống API thật.
 */
export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/categories', {
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }

        const data = await response.json();
        setCategories(data);
      } catch (fetchErr) {
        // Fallback local development khi Supabase/API chưa sẵn sàng.
        console.warn('Using mock data - Supabase not configured or API error:', fetchErr);
        const uniqueCategories = Array.from(
          new Set(mockPosts.map(post => post.category).filter(Boolean))
        );
        setCategories(uniqueCategories);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
}
