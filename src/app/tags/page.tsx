'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Loader2, AlertCircle, Hash } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import PostCard from '@/components/PostCard';
import { useTags } from '@/hooks/useTags';
import { usePosts } from '@/hooks/usePosts';
import { useLanguage } from '@/lib/i18n';

export default function TagsPage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Thẻ chủ đề',
        description: 'Khám phá ghi chú ShadowDev theo chủ đề, stack và vấn đề kỹ thuật.',
        allTags: 'Tất cả thẻ',
        loadingTags: 'Đang tải thẻ...',
        failedTags: 'Không tải được thẻ',
        emptyTags: 'Chưa có thẻ',
        postsTagged: 'Bài viết có thẻ',
        clear: 'Xóa bộ lọc',
        loadingPosts: 'Đang tải bài viết...',
        noPosts: (tag: string) => `Không có bài viết với thẻ #${tag}`,
      }
    : {
        title: 'Tags',
        description: 'Explore ShadowDev notes by topic, stack, and engineering concern.',
        allTags: 'All Tags',
        loadingTags: 'Loading tags...',
        failedTags: 'Failed to load tags',
        emptyTags: 'No tags found',
        postsTagged: 'Posts tagged with',
        clear: 'Clear filter',
        loadingPosts: 'Loading posts...',
        noPosts: (tag: string) => `No posts found with tag #${tag}`,
      };
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { tags, loading: tagsLoading, error: tagsError } = useTags();
  
  const { posts: allPosts, loading: postsLoading } = usePosts();
  const posts = selectedTag
    ? allPosts.filter((post) => post.tags.includes(selectedTag))
    : [];

  // Get tag size based on count (for tag cloud effect)
  const getTagSize = (count: number, maxCount: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'text-2xl';
    if (ratio > 0.4) return 'text-xl';
    if (ratio > 0.2) return 'text-lg';
    return 'text-base';
  };

  const maxCount = Math.max(...tags.map(t => t.count), 1);

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      {/* Tags Cloud */}
      <Section withDividerBottom>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <Hash className="text-[var(--accent)]" size={28} />
            <h2 className="text-2xl sm:text-3xl font-bold gradient-text">
              {copy.allTags}
            </h2>
          </div>

          {/* Loading State */}
          {tagsLoading && (
            <div className="text-center py-12">
              <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={32} />
              <p className="text-[var(--text-muted)] text-sm sm:text-base">{copy.loadingTags}</p>
            </div>
          )}

          {/* Error State */}
          {tagsError && !tagsLoading && (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
              <p className="text-[var(--text-muted)] text-sm sm:text-base mb-2">
                {copy.failedTags}
              </p>
              <p className="text-[var(--text-soft)] text-xs sm:text-sm">{tagsError}</p>
            </div>
          )}

          {/* Tags Cloud */}
          {!tagsLoading && !tagsError && tags.length > 0 && (
            <div className="flex flex-wrap gap-3 sm:gap-4 justify-center items-center p-6 sm:p-8 surface-card">
              {tags.map((tag, index) => (
                <motion.button
                  key={tag.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTag(selectedTag === tag.name ? null : tag.name)}
                  className={`
                    ${getTagSize(tag.count, maxCount)}
                    font-semibold transition-all
                    ${selectedTag === tag.name
                      ? 'text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--amber)]'
                    }
                  `}
                >
                  #{tag.name}
                  <span className="text-xs text-[var(--text-soft)] ml-1">({tag.count})</span>
                </motion.button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!tagsLoading && !tagsError && tags.length === 0 && (
            <div className="text-center py-12 surface-card">
              <Tag className="mx-auto text-[var(--text-soft)] mb-4" size={32} />
              <p className="text-[var(--text-muted)] text-sm sm:text-base">
                {copy.emptyTags}
              </p>
            </div>
          )}
        </motion.div>
      </Section>

      {/* Posts by Selected Tag */}
      {selectedTag && (
        <Section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)]">
                {copy.postsTagged} <span className="gradient-text">#{selectedTag}</span>
              </h2>
              <button
                onClick={() => setSelectedTag(null)}
                className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                {copy.clear}
              </button>
            </div>

            {/* Loading */}
            {postsLoading && (
              <div className="text-center py-12">
                <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={32} />
                <p className="text-[var(--text-muted)] text-sm sm:text-base">{copy.loadingPosts}</p>
              </div>
            )}

            {/* Posts Grid */}
            {!postsLoading && posts.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {posts.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}

            {/* No Posts */}
            {!postsLoading && posts.length === 0 && (
              <div className="text-center py-12 surface-card">
                <Tag className="mx-auto text-[var(--text-soft)] mb-4" size={32} />
                <p className="text-[var(--text-muted)] text-sm sm:text-base">
                  {copy.noPosts(selectedTag)}
                </p>
              </div>
            )}
          </motion.div>
        </Section>
      )}
    </>
  );
}
