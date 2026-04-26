'use client';

import { Comment } from '@/types';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { formatLocalizedDate, useLanguage } from '@/lib/i18n';

interface CommentItemProps {
  comment: Comment;
  index?: number;
}

/**
 * Hiển thị một comment đã được API trả về.
 *
 * Public API không gửi `author_email`, vì vậy component chỉ render tên, ngày và
 * nội dung. Avatar chữ cái được tạo deterministically từ tên để không cần lưu ảnh.
 */
export default function CommentItem({ comment, index = 0 }: CommentItemProps) {
  const { locale } = useLanguage();
  // Lấy tối đa hai chữ cái đầu để avatar vẫn gọn với tên dài.
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Màu avatar dựa trên ký tự đầu, giúp cùng một người nhìn nhất quán giữa renders.
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-lime-500 to-emerald-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-teal-600',
      'from-yellow-500 to-amber-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="surface-card p-4 sm:p-6"
    >
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar chữ cái, không dùng dữ liệu ngoài nên tránh request ảnh dư thừa. */}
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${getAvatarColor(
            comment.author_name
          )} flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}
        >
          {getInitials(comment.author_name)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header dùng flex-wrap để tên dài không đè lên ngày trên mobile. */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <h4 className="font-semibold text-[var(--text)] text-sm sm:text-base">
              {comment.author_name}
            </h4>
            <div className="flex items-center gap-1.5 text-[var(--text-soft)] text-xs sm:text-sm">
              <Calendar size={14} className="flex-shrink-0" />
              <time dateTime={comment.created_at}>
                {formatLocalizedDate(comment.created_at, locale)}
              </time>
            </div>
          </div>

          {/* Giữ xuống dòng người dùng nhập nhưng vẫn break từ dài để không vỡ layout. */}
          <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
