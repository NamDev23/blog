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
 * Section bình luận của bài viết.
 *
 * Chỉ yêu cầu comment `approved=true`, nên mọi bình luận mới gửi sẽ chờ admin
 * duyệt trước khi xuất hiện. `refetch` được truyền xuống form để cập nhật danh
 * sách sau khi gửi thành công.
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
    approved: true, // Chỉ hiển thị comment đã duyệt ở public article page.
  });

  return (
    <div className="mt-8 border-t border-[var(--line)] pt-8 sm:mt-12 sm:pt-12">
      {/* Header hiển thị số comment đã được duyệt, không tính comment đang pending. */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-10"
      >
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="text-[var(--accent)]" size={24} />
          <h2 className="text-xl sm:text-3xl font-bold gradient-text">
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

      {/* Danh sách trạng thái được tách rõ để tránh vừa hiện loading vừa hiện empty. */}
      <div className="mb-6 space-y-5 sm:mb-10 sm:space-y-6">
        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center sm:py-8"
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
            className="py-6 text-center sm:py-8"
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
            className="surface-card py-6 text-center sm:py-8"
          >
            <MessageCircle className="mx-auto text-[var(--text-soft)] mb-3" size={32} />
            <p className="text-[var(--text-muted)] text-sm sm:text-base">
              {copy.empty}
            </p>
          </motion.div>
        )}
      </div>

      {/* Form nằm sau danh sách để người đọc thấy thảo luận hiện có trước khi gửi. */}
      <CommentForm postId={postId} onCommentAdded={refetch} />
    </div>
  );
}
