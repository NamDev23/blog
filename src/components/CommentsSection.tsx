'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { useComments } from '@/hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useLanguage } from '@/lib/i18n';

interface CommentsSectionProps {
  postId: string;
}

/**
 * Section hiển thị comments và form
 */
export default function CommentsSection({ postId }: CommentsSectionProps) {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Bình luận',
        loading: 'Đang tải bình luận...',
        failed: 'Không tải được bình luận',
        count: (count: number) => `${count} bình luận`,
        empty: 'Chưa có bình luận. Hãy là người đầu tiên bình luận.',
      }
    : {
        title: 'Comments',
        loading: 'Loading comments...',
        failed: 'Failed to load comments',
        count: (count: number) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
        empty: 'No comments yet. Be the first to comment!',
      };
  const { comments, loading, error, refetch } = useComments({
    postId,
    approved: true, // Chỉ hiển thị comments đã được approve
  });

  return (
    <div className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-[var(--line)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 sm:mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="text-[var(--accent)]" size={28} />
          <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
            {copy.title}
          </h2>
        </div>
        <p className="text-[var(--text-muted)] text-sm sm:text-base">
          {loading ? (
            copy.loading
          ) : error ? (
            copy.failed
          ) : (
            copy.count(comments.length)
          )}
        </p>
      </motion.div>

      {/* Comments List */}
      <div className="space-y-6 mb-8 sm:mb-10">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <Loader2 className="mx-auto text-[var(--accent)] mb-3 animate-spin" size={32} />
            <p className="text-[var(--text-muted)] text-sm sm:text-base">{copy.loading}</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
            <p className="text-[var(--text-muted)] text-sm sm:text-base mb-2">
              {copy.failed}
            </p>
            <p className="text-[var(--text-soft)] text-xs sm:text-sm">{error}</p>
          </motion.div>
        )}

        {/* Comments */}
        {!loading && !error && comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <CommentItem key={comment.id} comment={comment} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && comments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8 surface-card"
          >
            <MessageCircle className="mx-auto text-[var(--text-soft)] mb-3" size={32} />
            <p className="text-[var(--text-muted)] text-sm sm:text-base">
              {copy.empty}
            </p>
          </motion.div>
        )}
      </div>

      {/* Comment Form */}
      <CommentForm postId={postId} onCommentAdded={refetch} />
    </div>
  );
}
