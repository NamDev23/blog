'use client';

import { useState } from 'react';
import PostCard from '@/components/PostCard';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, X } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import SectionHeader from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { usePosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Debounce search query để tránh gọi API quá nhiều
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch posts từ API với debounced search
  const { posts, loading: postsLoading, error: postsError } = usePosts({
    category: selectedCategory,
    search: debouncedSearch,
  });

  // Fetch categories từ API
  const { categories, loading: categoriesLoading } = useCategories();

  // Check if currently searching (user is typing)
  const isSearching = searchQuery !== debouncedSearch;

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Journal"
        description="Browse notes on Laravel, LMS, CMS, CRM, education chatbots, Vue.js, Next.js, secure APIs, and product UI."
      />

      {/* Search and Filter */}
      <Section withDividerBottom>
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--text-soft)] flex-shrink-0" size={20} />
            <Input
              type="search"
              placeholder="Search notes..."
              aria-label="Search articles"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12"
              enterKeyHint="search"
            />
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text)] transition-colors"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
            {/* Searching indicator */}
            {isSearching && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <Loader2 className="animate-spin text-[var(--accent)]" size={16} />
              </div>
            )}
          </div>
          {/* Search hint */}
          {searchQuery && (
            <p className="text-xs text-[var(--text-soft)] mt-2">
              {isSearching ? 'Searching...' : `Found ${posts.length} ${posts.length === 1 ? 'note' : 'notes'}`}
            </p>
          )}
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap gap-2 sm:gap-3"
        >
          <Button
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            variant={selectedCategory === null ? 'secondary' : 'outline'}
            size="sm"
            shape="pill"
            className={`whitespace-nowrap ${selectedCategory === null ? 'ring-1 ring-[rgba(102,217,194,0.4)]' : ''}`}
          >
            All
          </Button>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <Loader2 className="animate-spin" size={16} />
              <span>Loading categories...</span>
            </div>
          ) : (
            categories.map(category => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                variant={selectedCategory === category ? 'secondary' : 'outline'}
                size="sm"
                shape="pill"
                className={`whitespace-nowrap ${selectedCategory === category ? 'ring-1 ring-[rgba(102,217,194,0.4)]' : ''}`}
              >
                {category}
              </Button>
            ))
          )}
        </motion.div>
      </Section>

      {/* Posts Grid */}
      <Section>
        <SectionHeader
          eyebrow="Archive"
          title="All Notes"
          description="Filter by topic, search by problem, and keep moving."
          align="start"
          className="mb-8 sm:mb-10"
        />

        {/* Error State */}
        {postsError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sm:py-16"
          >
            <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
            <p className="text-[var(--text-muted)] text-base sm:text-lg mb-2">
              Failed to load posts
            </p>
            <p className="text-[var(--text-soft)] text-sm">
              {postsError}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {postsLoading && !postsError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sm:py-16"
          >
            <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={32} />
            <p className="text-[var(--text-muted)] text-base sm:text-lg">
              Loading notes...
            </p>
          </motion.div>
        )}

        {/* Posts Grid */}
        {!postsLoading && !postsError && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {posts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!postsLoading && !postsError && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sm:py-16"
          >
            <Search className="mx-auto text-[var(--text-soft)] mb-4" size={32} />
            <p className="text-[var(--text-muted)] text-base sm:text-lg">
              No notes found. Try adjusting your search or filters.
            </p>
          </motion.div>
        )}
      </Section>
    </>
  );
}
