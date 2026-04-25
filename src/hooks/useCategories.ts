import { useState, useEffect } from 'react';
import { mockPosts } from '@/lib/mockData';

interface UseCategoriesReturn {
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook để fetch categories từ API
 * Fallback to mock data nếu API không hoạt động
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
        // Fallback to mock data
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

