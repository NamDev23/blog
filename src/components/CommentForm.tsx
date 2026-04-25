'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

/**
 * Form để thêm comment mới
 */
export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit comment');
      }

      // Success
      setSuccess(true);
      setName('');
      setEmail('');
      setContent('');

      // Call callback
      if (onCommentAdded) {
        onCommentAdded();
      }

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="surface-card p-4 sm:p-6"
    >
      <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-4 sm:mb-6">
        Leave a Comment
      </h3>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-3"
        >
          <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-green-700 text-sm sm:text-base font-medium">
              Comment submitted successfully!
            </p>
            <p className="text-green-600 text-xs sm:text-sm mt-1">
              Your comment will be visible after approval.
            </p>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
        >
          <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-red-700 text-sm sm:text-base font-medium">
              Failed to submit comment
            </p>
            <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Name <span className="text-red-400">*</span>
            </label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              maxLength={255}
            />
            <p className="text-xs text-[var(--text-soft)] mt-1">
              Your email will not be published
            </p>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-[var(--text-muted)] mb-2">
            Comment <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            disabled={loading}
            maxLength={5000}
            rows={5}
            className="w-full px-4 py-3 bg-[rgba(244,241,232,0.06)] border border-[var(--line)] rounded-lg text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[rgba(102,217,194,0.22)] focus:border-[var(--accent)] transition-all resize-none text-sm sm:text-base shadow-sm"
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-[var(--text-soft)]">
              Minimum 3 characters
            </p>
            <p className="text-xs text-[var(--text-soft)]">
              {content.length} / 5000
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !name.trim() || !email.trim() || !content.trim() || content.trim().length < 3}
            className="min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Submit
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
