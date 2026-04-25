import { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';

interface UseCommentsOptions {
  postId?: string;
  approved?: boolean;
}

interface UseCommentsReturn {
  comments: Comment[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  addComment: (data: {
    post_id: string;
    author_name: string;
    author_email: string;
    content: string;
  }) => Promise<{ success: boolean; message?: string; error?: string }>;
}

/**
 * Custom hook để fetch và manage comments
 */
export function useComments(options: UseCommentsOptions = {}): UseCommentsReturn {
  const { postId, approved } = options;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (postId) {
        params.append('post_id', postId);
      }
      if (approved !== undefined) {
        params.append('approved', approved.toString());
      }

      const url = `/api/comments${params.toString() ? `?${params.toString()}` : ''}`;

      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }

        const data = await response.json();
        setComments(data);
      } catch (fetchErr) {
        // Fallback: no comments for now (mock data not needed for comments)
        console.warn('Comments API not available:', fetchErr);
        setComments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId, approved]);

  const addComment = async (data: {
    post_id: string;
    author_name: string;
    author_email: string;
    content: string;
  }) => {
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to add comment',
        };
      }

      // Refetch comments after adding
      await fetchComments();

      return {
        success: true,
        message: result.message || 'Comment added successfully',
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An error occurred',
      };
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
    addComment,
  };
}
