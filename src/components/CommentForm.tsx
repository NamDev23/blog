'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/lib/i18n';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

/**
 * Form gửi comment public.
 *
 * Client validate để phản hồi nhanh theo locale hiện tại. Server vẫn validate lại,
 * rate-limit, sanitize và đặt comment ở trạng thái chờ duyệt nên không tin vào
 * bất kỳ dữ liệu nào từ form này.
 */
export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Để lại bình luận',
        successTitle: 'Gửi bình luận thành công.',
        successDescription: 'Bình luận của bạn sẽ hiển thị sau khi được duyệt.',
        failedTitle: 'Không gửi được bình luận',
        requiredName: 'Tên',
        email: 'Email',
        comment: 'Bình luận',
        namePlaceholder: 'Tên của bạn',
        emailPlaceholder: 'ban@email.com',
        emailNote: 'Email của bạn sẽ không được công khai',
        commentPlaceholder: 'Chia sẻ suy nghĩ của bạn...',
        min: 'Tối thiểu 3 ký tự',
        submitting: 'Đang gửi...',
        submit: 'Gửi',
        submitError: 'Không gửi được bình luận',
        genericError: 'Đã xảy ra lỗi',
        requiredError: 'Vui lòng nhập tên, email và nội dung bình luận.',
        emailError: 'Vui lòng nhập email hợp lệ.',
        minError: 'Bình luận cần tối thiểu 3 ký tự.',
        rateLimited: 'Bạn gửi quá nhiều bình luận. Vui lòng thử lại sau ít phút.',
        invalidOrigin: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.',
        serverError: 'Máy chủ chưa lưu được bình luận. Vui lòng thử lại sau.',
      }
    : {
        title: 'Leave a Comment',
        successTitle: 'Comment submitted successfully!',
        successDescription: 'Your comment will be visible after approval.',
        failedTitle: 'Failed to submit comment',
        requiredName: 'Name',
        email: 'Email',
        comment: 'Comment',
        namePlaceholder: 'Your name',
        emailPlaceholder: 'your@email.com',
        emailNote: 'Your email will not be published',
        commentPlaceholder: 'Share your thoughts...',
        min: 'Minimum 3 characters',
        submitting: 'Submitting...',
        submit: 'Submit',
        submitError: 'Failed to submit comment',
        genericError: 'An error occurred',
        requiredError: 'Please provide your name, email, and comment.',
        emailError: 'Please provide a valid email address.',
        minError: 'Comment must be at least 3 characters long.',
        rateLimited: 'Too many comments. Please try again in a few minutes.',
        invalidOrigin: 'Invalid request. Please reload the page and try again.',
        serverError: 'The server could not save the comment. Please try again later.',
      };
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationError = validateCommentForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          author_name: name.trim(),
          author_email: email.trim(),
          content: content.trim(),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getCommentErrorMessage(result, response.status));
      }

      // Thành công nghĩa là server đã nhận comment, chưa có nghĩa comment được public ngay.
      setSuccess(true);
      setName('');
      setEmail('');
      setContent('');

      // Cho parent refetch danh sách comment nếu cần.
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Ẩn thông báo sau vài giây để form trở lại trạng thái gọn.
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.genericError);
    } finally {
      setLoading(false);
    }
  };

  function validateCommentForm() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedContent = content.trim();

    if (!trimmedName || !trimmedEmail || !trimmedContent) {
      return copy.requiredError;
    }

    if (trimmedContent.length < 3) {
      return copy.minError;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return copy.emailError;
    }

    return null;
  }

  function getCommentErrorMessage(result: unknown, status: number) {
    // API trả `code` ổn định, component map sang thông báo theo locale thay vì
    // hiển thị trực tiếp message tiếng Anh từ server.
    const code = typeof result === 'object' && result && 'code' in result
      ? String((result as { code?: unknown }).code || '')
      : '';

    if (code === 'invalid_comment_payload') return copy.requiredError;
    if (code === 'invalid_email') return copy.emailError;
    if (code === 'comment_too_short') return copy.minError;
    if (code === 'rate_limited' || status === 429) return copy.rateLimited;
    if (code === 'invalid_origin' || status === 403) return copy.invalidOrigin;
    if (code === 'comment_storage_unavailable' || status >= 500) return copy.serverError;

    return copy.submitError;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="surface-card p-4 sm:p-6"
    >
      <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-4 sm:mb-6">
        {copy.title}
      </h3>

      {/* Thông báo thành công chỉ nói comment đang chờ duyệt, không hứa hiển thị ngay. */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
        >
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-green-700 text-sm sm:text-base font-medium">
              {copy.successTitle}
            </p>
            <p className="text-green-600 text-xs sm:text-sm mt-1">
              {copy.successDescription}
            </p>
          </div>
        </motion.div>
      )}

      {/* Lỗi hiển thị bằng copy đã localize để không lẫn ngôn ngữ trong UI. */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-700 text-sm sm:text-base font-medium">
              {copy.failedTitle}
            </p>
            <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tên/email tách 2 cột trên desktop và xếp dọc trên mobile. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              {copy.requiredName} <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder={copy.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              maxLength={80}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              {copy.email} <span className="text-red-400">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              maxLength={254}
            />
            <p className="text-xs text-[var(--text-soft)] mt-1">
              {copy.emailNote}
            </p>
          </div>
        </div>

        {/* Giới hạn 5000 ký tự để tránh payload quá lớn và giữ admin moderation dễ đọc. */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            {copy.comment} <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            placeholder={copy.commentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            maxLength={5000}
            rows={5}
            className="w-full px-4 py-3 bg-[rgba(244,241,232,0.06)] border border-[var(--line)] rounded-lg text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[rgba(102,217,194,0.22)] focus:border-[var(--accent)] transition-all resize-none text-sm sm:text-base shadow-sm"
          />
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-soft)]">
              {copy.min}
            </p>
            <p className="text-xs text-[var(--text-soft)]">
              {content.length} / 5000
            </p>
          </div>
        </div>

        {/* Disable nút gửi khi form chưa đạt điều kiện tối thiểu để giảm request lỗi. */}
        <div className="flex justify-stretch sm:justify-end">
          <Button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !content.trim() || content.trim().length < 3}
            className="w-full sm:w-auto sm:min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                {copy.submitting}
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                {copy.submit}
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
