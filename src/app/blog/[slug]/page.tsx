'use client';

/* eslint-disable @next/next/no-img-element */

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
  return slugify(text);
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function prepareArticleContent(content: string) {
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
  return sanitizeHtmlContent(content);
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { locale } = useLanguage();
  const copy = commonCopy[locale];
  const [slug, setSlug] = useState<string>('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch post từ API
  const { post, loading, error } = usePost(slug);

  // Fetch related posts
  const { posts: relatedPosts, loading: relatedLoading } = useRelatedPosts(slug, 2);
  const displayPost = useMemo(() => (post ? localizePost(post, locale) : null), [post, locale]);
  const localizedRelatedPosts = useMemo(
    () => localizePosts(relatedPosts, locale),
    [relatedPosts, locale]
  );
  const [viewState, setViewState] = useState<{ slug: string; count: number } | null>(null);
  const countedSlugsRef = useRef<Set<string>>(new Set());

  // TOC state and content ref
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

    if (countedSlugsRef.current.has(displayPost.slug)) return;
    countedSlugsRef.current.add(displayPost.slug);

    const storageKey = `shadowdev:viewed:${displayPost.slug}`;
    const viewTtlMs = 30 * 60 * 1000;
    const now = Date.now();

    try {
      const lastViewedAt = Number(window.localStorage.getItem(storageKey) || '0');
      if (lastViewedAt && now - lastViewedAt < viewTtlMs) return;
    } catch {
      // Local storage may be unavailable in restricted browsers; server rate limit is still authoritative.
    }

    let cancelled = false;

    fetch(`/api/posts/${encodeURIComponent(displayPost.slug)}/view`, {
      method: 'POST',
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json().catch(() => null))
      .then((payload) => {
        if (cancelled || !payload || typeof payload.view_count !== 'number') return;
        setViewState({ slug: displayPost.slug, count: payload.view_count });

        try {
          window.localStorage.setItem(storageKey, String(now));
        } catch {
          // Ignore storage failures; view counting still works through the server.
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [displayPost?.slug, displayPost?.view_count]);

  const handleShare = async () => {
    if (!displayPost || typeof window === 'undefined') return;

    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayPost.title,
          text: displayPost.excerpt,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard?.writeText(shareUrl);
    } catch {
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
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1] }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [articleContent.html]);

  useEffect(() => {
    if (!contentRef.current) return;

    const container = contentRef.current;
    const handleCopy = createCodeCopyHandler();
    container.addEventListener('click', handleCopy);
    return () => {
      container.removeEventListener('click', handleCopy);
    };
  }, [articleContent.html]);


  // Loading state
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

  // Error state
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
        className="relative h-56 overflow-hidden bg-[#090d0b] sm:h-72 md:h-[28rem]"
      >
        {displayPost.featured_image && (
          <img
            src={displayPost.featured_image}
            alt={displayPost.title}
            className="w-full h-full object-cover opacity-80 saturate-[0.86]"
            loading="lazy"
            decoding="async"
            onError={(e) => { const t = e.currentTarget as HTMLImageElement; t.onerror = null; t.src = 'https://picsum.photos/1200/600?blur=1'; }}
          />
        )}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 gradient-text">
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
          className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-[var(--line)]"
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
            className="surface-card p-4 sm:p-5 mb-8 sm:mb-10 lg:hidden"
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
        <div className="grid lg:grid-cols-[1fr_280px] gap-8">
          <div ref={contentRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="prose max-w-none mb-12 text-sm sm:text-base"
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
          className="border-t border-[var(--line)] pt-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-1 sm:mb-2">
                {copy.shareArticle}
              </h3>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                {copy.shareHelp}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              aria-label={copy.shareArticle}
              className="w-10 h-10 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.06)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all flex-shrink-0"
            >
              <Share2 size={20} />
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
            className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-[var(--line)]"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 gradient-text">
              {copy.relatedArticles}
            </h3>

            {relatedLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto text-[var(--accent)] mb-3 animate-spin" size={32} />
                <p className="text-[var(--text-muted)] text-sm">{copy.loadingRelated}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {localizedRelatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      href={localizedPath(`/blog/${relatedPost.slug}`, locale)}
                      className="surface-card p-6 transition-all group hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)] block h-full"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" className="text-xs">
                          {getCategoryLabel(relatedPost.category, locale)}
                        </Badge>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-all line-clamp-2">
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
