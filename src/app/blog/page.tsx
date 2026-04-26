'use client';

import { useMemo, useState } from 'react';
import PostCard from '@/components/PostCard';
import { motion } from 'framer-motion';
import { Search, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import SectionHeader from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { usePosts } from '@/hooks/usePosts';
import { useCategories } from '@/hooks/useCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { getCategoryLabel, useLanguage } from '@/lib/i18n';
import { localizePosts } from '@/lib/postTranslations';

const POSTS_PER_PAGE = 6;

function BlogCardSkeleton() {
  return (
    <div className="surface-card overflow-hidden animate-pulse flex flex-col h-full">
      <div className="h-44 sm:h-52 bg-[rgba(244,241,232,0.08)]" />
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="h-4 w-28 rounded bg-[rgba(244,241,232,0.08)]" />
          <div className="h-6 w-20 rounded-lg bg-[rgba(102,217,194,0.14)]" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-full rounded bg-[rgba(244,241,232,0.08)]" />
          <div className="h-5 w-3/4 rounded bg-[rgba(244,241,232,0.08)]" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-[rgba(244,241,232,0.07)]" />
          <div className="h-4 w-5/6 rounded bg-[rgba(244,241,232,0.07)]" />
          <div className="h-4 w-2/3 rounded bg-[rgba(244,241,232,0.07)]" />
        </div>
        <div className="mt-auto h-10 rounded border-t border-[var(--line)]" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Bài viết',
        description: 'Đọc ghi chú về DevOps, Docker, networking, kiến trúc, Git, bảo mật, hiệu năng và sản phẩm web.',
        searchPlaceholder: 'Tìm bài viết...',
        searchAria: 'Tìm bài viết',
        clearSearch: 'Xóa tìm kiếm',
        searching: 'Đang tìm...',
        found: (count: number) => `Tìm thấy ${count} bài viết`,
        all: 'Tất cả',
        loadingCategories: 'Đang tải danh mục...',
        archiveEyebrow: 'Kho bài',
        archiveTitle: 'Tất cả bài viết',
        archiveDescription: 'Lọc theo chủ đề, tìm theo vấn đề và đọc theo nhu cầu.',
        failed: 'Không tải được bài viết',
        loading: 'Đang tải bài viết...',
        empty: 'Không tìm thấy bài viết. Hãy thử đổi từ khóa hoặc bộ lọc.',
        previous: 'Trước',
        next: 'Tiếp',
        page: 'Trang',
        pageSummary: (current: number, total: number, count: number) => `Trang ${current}/${total} - ${count} bài viết`,
      }
    : {
        title: 'Journal',
        description: 'Browse notes on DevOps, Docker, networking, architecture, Git, security, performance, and web products.',
        searchPlaceholder: 'Search notes...',
        searchAria: 'Search articles',
        clearSearch: 'Clear search',
        searching: 'Searching...',
        found: (count: number) => `Found ${count} ${count === 1 ? 'note' : 'notes'}`,
        all: 'All',
        loadingCategories: 'Loading categories...',
        archiveEyebrow: 'Archive',
        archiveTitle: 'All Notes',
        archiveDescription: 'Filter by topic, search by problem, and keep moving.',
        failed: 'Failed to load posts',
        loading: 'Loading notes...',
        empty: 'No notes found. Try adjusting your search or filters.',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        pageSummary: (current: number, total: number, count: number) => `Page ${current}/${total} - ${count} ${count === 1 ? 'note' : 'notes'}`,
      };
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search query để tránh lọc lại quá nhiều khi người dùng đang gõ
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch posts từ API theo category; search chạy trên dữ liệu đã localize để EN/VI nhất quán.
  const { posts, loading: postsLoading, error: postsError } = usePosts({
    category: selectedCategory,
  });

  // Fetch categories từ API
  const { categories, loading: categoriesLoading } = useCategories();

  // Check if currently searching (user is typing)
  const isSearching = searchQuery !== debouncedSearch;

  const localizedPosts = useMemo(() => localizePosts(posts, locale), [posts, locale]);

  const filteredPosts = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (!term) return localizedPosts;

    return localizedPosts.filter((post) => {
      const categoryLabel = getCategoryLabel(post.category, locale).toLowerCase();
      const searchableText = [
        post.title,
        post.excerpt,
        post.category,
        categoryLabel,
        ...(post.tags || []),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [debouncedSearch, localizedPosts, locale]);

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const paginatedPosts = filteredPosts.slice(
    (safeCurrentPage - 1) * POSTS_PER_PAGE,
    safeCurrentPage * POSTS_PER_PAGE
  );

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title={copy.title}
        description={copy.description}
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
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchAria}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-12"
              enterKeyHint="search"
            />
            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--text-soft)] hover:text-[var(--text)] transition-colors"
                aria-label={copy.clearSearch}
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
              {isSearching ? copy.searching : copy.found(filteredPosts.length)}
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
            onClick={() => {
              setSelectedCategory(null);
              setCurrentPage(1);
            }}
            aria-pressed={selectedCategory === null}
            variant={selectedCategory === null ? 'secondary' : 'outline'}
            size="sm"
            shape="pill"
            className={`whitespace-nowrap ${selectedCategory === null ? 'ring-1 ring-[rgba(102,217,194,0.4)]' : ''}`}
          >
            {copy.all}
          </Button>
          {categoriesLoading ? (
            <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
              <Loader2 className="animate-spin" size={16} />
              <span>{copy.loadingCategories}</span>
            </div>
          ) : (
            categories.map(category => (
              <Button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                aria-pressed={selectedCategory === category}
                variant={selectedCategory === category ? 'secondary' : 'outline'}
                size="sm"
                shape="pill"
                className={`whitespace-nowrap ${selectedCategory === category ? 'ring-1 ring-[rgba(102,217,194,0.4)]' : ''}`}
              >
                {getCategoryLabel(category, locale)}
              </Button>
            ))
          )}
        </motion.div>
      </Section>

      {/* Posts Grid */}
      <Section>
        <SectionHeader
          eyebrow={copy.archiveEyebrow}
          title={copy.archiveTitle}
          description={copy.archiveDescription}
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
              {copy.failed}
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            aria-label={copy.loading}
            aria-busy="true"
          >
            {Array.from({ length: POSTS_PER_PAGE }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </motion.div>
        )}

        {/* Posts Grid */}
        {!postsLoading && !postsError && filteredPosts.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {paginatedPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </motion.div>

            {pageCount > 1 && (
              <nav
                aria-label="Blog pagination"
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <p className="text-sm text-[var(--text-soft)]">
                  {copy.pageSummary(safeCurrentPage, pageCount, filteredPosts.length)}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={safeCurrentPage === 1}
                    variant="outline"
                    size="sm"
                    aria-label={copy.previous}
                  >
                    <ChevronLeft size={16} />
                    {copy.previous}
                  </Button>
                  {Array.from({ length: pageCount }).map((_, index) => {
                    const pageNumber = index + 1;
                    const isActive = pageNumber === safeCurrentPage;
                    return (
                      <Button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        variant={isActive ? 'secondary' : 'ghost'}
                        size="sm"
                        aria-label={`${copy.page} ${pageNumber}`}
                        aria-current={isActive ? 'page' : undefined}
                        className="min-w-10 px-3"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                  <Button
                    onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                    disabled={safeCurrentPage === pageCount}
                    variant="outline"
                    size="sm"
                    aria-label={copy.next}
                  >
                    {copy.next}
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}

        {/* Empty State */}
        {!postsLoading && !postsError && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12 sm:py-16"
          >
            <Search className="mx-auto text-[var(--text-soft)] mb-4" size={32} />
            <p className="text-[var(--text-muted)] text-base sm:text-lg">
              {copy.empty}
            </p>
          </motion.div>
        )}
      </Section>
    </>
  );
}
