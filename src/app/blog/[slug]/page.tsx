'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { calculateReadingTime, slugify } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Share2, Loader2, AlertCircle, Clock, Eye } from 'lucide-react';
import Section from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { usePost } from '@/hooks/usePost';
import { useRelatedPosts } from '@/hooks/useRelatedPosts';
import CommentsSection from '@/components/CommentsSection';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { createCodeCopyHandler, enhanceCodeBlocks } from '@/lib/codeBlocks';
import { sanitizeHtmlContent } from '@/lib/htmlSanitizer';
import {
  commonCopy,
  formatLocalizedDate,
  formatLocalizedReadingTime,
  getCategoryLabel,
  useLanguage,
} from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';
import { localizePost, localizePosts } from '@/lib/postTranslations';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

type TocItem = { id: string; text: string; level: number };

function slugifyHeading(text: string) {
  // Heading id dùng cùng slugify với post slug để anchor dễ đọc và ổn định.
  return slugify(text);
}

function escapeAttribute(value: string) {
  // Anchor id/text được nhúng vào HTML string nên cần escape attribute thủ công.
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function prepareArticleContent(content: string) {
  // Chuẩn bị HTML article một lần: sanitize, bọc code block, thêm id/anchor cho h2-h3
  // và đồng thời sinh Table of Contents.
  const toc: TocItem[] = [];
  const idCounts = new Map<string, number>();
  const safeContent = sanitizeArticleHtml(content);

  const html = enhanceCodeBlocks(safeContent).replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, level: string, attributes: string, innerHtml: string) => {
      const text = innerHtml.replace(/<[^>]*>/g, '').trim();
      if (!text) return match;

      const existingId = attributes.match(/\sid=["']([^"']+)["']/i)?.[1];
      const baseId = existingId || slugifyHeading(text);
      if (!baseId) return match;

      const count = idCounts.get(baseId) || 0;
      idCounts.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
      const cleanAttributes = existingId
        ? attributes.replace(/\sid=["'][^"']+["']/i, '')
        : attributes;

      toc.push({ id, text, level: Number(level) });

      return `<h${level}${cleanAttributes} id="${escapeAttribute(id)}">${innerHtml}<a href="#${escapeAttribute(id)}" class="heading-anchor" aria-label="Link to ${escapeAttribute(text)}">#</a></h${level}>`;
    }
  );

  return { html, toc };
}

function sanitizeArticleHtml(content: string) {
  // Tách hàm nhỏ để nếu sau này đổi sanitizer chuyên dụng thì chỉ sửa một điểm.
  return sanitizeHtmlContent(content);
}

function ArticleHeroImage({ src, title }: { src: string | null; title: string }) {
  // Ảnh remote có thể lỗi/hết hạn; fallback giữ hero không bị trống hoàn toàn.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageSrc = src && failedSrc !== src ? src : 'https://picsum.photos/1200/600?blur=1';

  if (!src) return null;

  return (
    <Image
      src={imageSrc}
      alt={title}
      fill
      priority
      sizes="100vw"
      className="object-cover opacity-80 saturate-[0.86]"
      onError={() => setFailedSrc(src)}
    />
  );
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { locale } = useLanguage();
  const copy = commonCopy[locale];
  const [slug, setSlug] = useState<string>('');

  // App Router truyền params dạng Promise cho client wrapper, nên unwrap trong effect.
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch post từ API public/admin-aware; hook có fallback mock ở development.
  const { post, loading, error } = usePost(slug);

  // Related posts chỉ cần 2 bài để không làm cuối bài quá dài.
  const { posts: relatedPosts, loading: relatedLoading } = useRelatedPosts(slug, 2);
  const displayPost = useMemo(() => (post ? localizePost(post, locale) : null), [post, locale]);
  const localizedRelatedPosts = useMemo(
    () => localizePosts(relatedPosts, locale),
    [relatedPosts, locale]
  );
  const [viewState, setViewState] = useState<{ slug: string; count: number } | null>(null);
  const countedSlugsRef = useRef<Set<string>>(new Set());

  // Ref article content phục vụ IntersectionObserver và event delegation copy code.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const articleContent = useMemo(
    () => prepareArticleContent(displayPost?.content || ''),
    [displayPost?.content]
  );
  const toc = articleContent.toc;
  const currentActiveId = activeId ?? toc[0]?.id ?? null;

  useEffect(() => {
    if (!displayPost?.slug) return;

    const viewUrl = `/api/posts/${encodeURIComponent(displayPost.slug)}/view`;
    const storageKey = `shadowdev:viewed:${displayPost.slug}`;
    const viewTtlMs = 30 * 60 * 1000;
    const now = Date.now();
    let cancelled = false;

    const applyViewCount = (payload: unknown) => {
      // API view trả payload nhỏ; validate dạng object trước khi cập nhật UI.
      if (cancelled || !payload || typeof payload !== 'object' || !('view_count' in payload)) return;
      const nextCount = Number((payload as { view_count?: unknown }).view_count);
      if (Number.isFinite(nextCount)) {
        setViewState({ slug: displayPost.slug, count: nextCount });
      }
    };

    const fetchCurrentViewCount = () => {
      // Không polling khi tab ẩn để giảm request không cần thiết.
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;

      fetch(viewUrl, { cache: 'no-store' })
        .then((response) => response.json().catch(() => null))
        .then(applyViewCount)
        .catch(() => null);
    };

    try {
      const lastViewedAt = Number(window.localStorage.getItem(storageKey) || '0');
      if (lastViewedAt && now - lastViewedAt < viewTtlMs) {
        // Nếu user đã được tính view trong TTL, chỉ đọc count hiện tại thay vì POST.
        fetchCurrentViewCount();
        const intervalId = window.setInterval(fetchCurrentViewCount, 45_000);
        return () => {
          cancelled = true;
          window.clearInterval(intervalId);
        };
      }
    } catch {
      // localStorage có thể bị chặn; server rate limit/DB unique key vẫn là lớp quyết định.
    }

    if (!countedSlugsRef.current.has(displayPost.slug)) {
      countedSlugsRef.current.add(displayPost.slug);

      fetch(viewUrl, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => response.json().catch(() => null))
        .then((payload) => {
          applyViewCount(payload);

          try {
            window.localStorage.setItem(storageKey, String(now));
          } catch {
            // Bỏ qua lỗi storage; view counting vẫn chạy qua server.
          }
        })
        .catch(() => null);
    } else {
      fetchCurrentViewCount();
    }

    const intervalId = window.setInterval(fetchCurrentViewCount, 45_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [displayPost?.slug, displayPost?.view_count]);

  const handleShare = async () => {
    if (!displayPost || typeof window === 'undefined') return;

    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        // Web Share API cho trải nghiệm native trên mobile.
        await navigator.share({
          title: displayPost.title,
          text: displayPost.excerpt,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard?.writeText(shareUrl);
    } catch {
      // Nếu share native bị hủy/lỗi, thử copy URL như fallback nhẹ.
      await navigator.clipboard?.writeText(shareUrl);
    }
  };

  useEffect(() => {
    if (!contentRef.current) return;
    const headings = Array.from(contentRef.current.querySelectorAll('h2, h3')) as HTMLHeadingElement[];
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id;
            if (id) setActiveId(id);
          }
        });
      },
      // Vùng active nằm gần giữa viewport để TOC không đổi quá sớm khi vừa chạm heading.
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [articleContent.html]);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;
    // Nội dung article là HTML động nên listener copy code dùng event delegation.
    const handleCopy = createCodeCopyHandler();
    container.addEventListener('click', handleCopy);
    return () => {
      container.removeEventListener('click', handleCopy);
    };
  }, [articleContent.html]);


  // Loading state.
  if (loading) {
    return (
      <Section>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={48} />
          <p className="text-[var(--text-muted)] text-lg">{copy.loadingArticle}</p>
        </motion.div>
      </Section>
    );
  }

  // Error/not-found state.
  if (error || !displayPost) {
    return (
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">{copy.postNotFound}</h1>
          <p className="text-[var(--text-muted)] mb-6">
            {error || copy.postNotFoundDescription}
          </p>
          <Link
            href={localizedPath('/blog', locale)}
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--amber)] transition-colors"
          >
            <ArrowLeft size={18} />
            {copy.backToBlog}
          </Link>
        </motion.div>
      </Section>
    );
  }

  const articleJsonLd = {
    // JSON-LD riêng cho bài viết giúp search engine hiểu author, ngày publish và ngôn ngữ.
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: displayPost.title,
    description: displayPost.excerpt,
    image: [displayPost.featured_image || absoluteUrl('/opengraph-image')],
    datePublished: displayPost.published_at,
    dateModified: displayPost.updated_at,
    author: {
      '@type': 'Person',
      name: siteConfig.author,
      url: siteConfig.url,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: absoluteUrl(localizedPath(`/blog/${displayPost.slug}`, locale)),
    inLanguage: locale,
    keywords: displayPost.tags.join(', '),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-48 overflow-hidden bg-[#090d0b] sm:h-72 md:h-[28rem]"
      >
        <ArticleHeroImage src={displayPost.featured_image} title={displayPost.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d120f] via-[#0d120f]/38 to-transparent"></div>
      </motion.div>

      {/* Article Content */}
      <Section as="article" width="lg">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 sm:mb-8"
        >
          <Link
            href={localizedPath('/blog', locale)}
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--amber)] transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="flex-shrink-0" />
            {copy.backToBlog}
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Badge variant="primary">{getCategoryLabel(displayPost.category, locale)}</Badge>
          </div>
          <h1 className="mb-5 text-2xl font-bold leading-tight sm:mb-8 sm:text-4xl md:text-5xl gradient-text">
            {displayPost.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[var(--text-muted)] text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="flex-shrink-0" />
              <span>{siteConfig.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="flex-shrink-0" />
              <time dateTime={displayPost.published_at}>
                {formatLocalizedDate(displayPost.published_at, locale)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="flex-shrink-0" />
              <span>{formatLocalizedReadingTime(calculateReadingTime(displayPost.content), locale)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} className="flex-shrink-0" />
              <span>
                {viewState?.slug === displayPost.slug ? viewState.count : displayPost.view_count} {copy.views}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-6 flex flex-wrap gap-2 border-b border-[var(--line)] pb-6 sm:mb-8 sm:pb-8"
        >
          {displayPost.tags.map((tag) => (
            <motion.div key={tag} whileHover={{ scale: 1.05 }}>
              <Badge className="text-xs sm:text-sm">#{tag}</Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Table of Contents */}
        {toc.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="surface-card mb-6 p-3 sm:mb-10 sm:p-5 lg:hidden"
          >
            <div className="micro-label mb-3">{copy.onThisPage}</div>
            <nav aria-label={copy.onThisPage}>
              <ul className="space-y-1">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                    <a
                      href={`#${item.id}`}
                      className={`text-sm transition-colors ${currentActiveId === item.id ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                      aria-current={currentActiveId === item.id ? 'true' : undefined}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}

        {/* Layout: Content + TOC (desktop sticky) */}
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div ref={contentRef} className="min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="prose mb-8 max-w-none min-w-0 text-sm sm:mb-12 sm:text-base"
              dangerouslySetInnerHTML={{ __html: articleContent.html }}
            />
          </div>
          {toc.length > 0 && (
            <aside className="hidden lg:block sticky top-24 self-start">
              <div className="surface-card p-4 sm:p-5">
                <div className="micro-label mb-3">{copy.onThisPage}</div>
                <nav aria-label={copy.onThisPage}>
                  <ul className="space-y-1">
                    {toc.map((item) => (
                      <li key={item.id} className={item.level === 3 ? 'pl-3' : ''}>
                        <a
                          href={`#${item.id}`}
                          className={`text-sm transition-colors ${currentActiveId === item.id ? 'text-[var(--accent)] font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                          aria-current={currentActiveId === item.id ? 'true' : undefined}
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Share Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="border-t border-[var(--line)] pt-6 sm:pt-8"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-sm font-semibold text-[var(--text)] sm:mb-2 sm:text-lg">
                {copy.shareArticle}
              </h3>
              <p className="line-clamp-2 text-xs text-[var(--text-muted)] sm:text-sm">
                {copy.shareHelp}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              aria-label={copy.shareArticle}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.06)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] sm:h-10 sm:w-10"
            >
              <Share2 size={18} />
            </motion.button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <CommentsSection postId={displayPost.id} />

        {/* Related Posts */}
        {localizedRelatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-8 border-t border-[var(--line)] pt-8 sm:mt-12 sm:pt-12"
          >
            <h3 className="mb-5 text-xl font-bold sm:mb-8 sm:text-2xl gradient-text">
              {copy.relatedArticles}
            </h3>

            {relatedLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto text-[var(--accent)] mb-3 animate-spin" size={32} />
                <p className="text-[var(--text-muted)] text-sm">{copy.loadingRelated}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:gap-5 md:grid-cols-2">
                {localizedRelatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      href={localizedPath(`/blog/${relatedPost.slug}`, locale)}
                      className="surface-card group block h-full p-4 transition-all hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)] sm:p-5"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" className="text-xs">
                          {getCategoryLabel(relatedPost.category, locale)}
                        </Badge>
                      </div>
                      <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-[var(--text)] transition-all group-hover:text-[var(--accent)] sm:text-base">
                        {relatedPost.title}
                      </h4>
                      <p className="text-[var(--text-muted)] text-xs sm:text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <span className="text-[var(--accent)] text-xs sm:text-sm font-medium inline-flex items-center gap-1">
                        {copy.readMore} <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </Section>
    </>
  );
}
