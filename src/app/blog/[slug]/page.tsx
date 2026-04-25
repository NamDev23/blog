'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDate, calculateReadingTime, formatReadingTime } from '@/lib/utils';
import { ArrowLeft, Calendar, User, Share2, Loader2, AlertCircle, Clock } from 'lucide-react';
import Section from '@/components/ui/Section';
import { Badge } from '@/components/ui/Badge';
import { usePost } from '@/hooks/usePost';
import { useRelatedPosts } from '@/hooks/useRelatedPosts';
import CommentsSection from '@/components/CommentsSection';
import { siteConfig } from '@/lib/site';
import { createCodeCopyHandler, enhanceCodeBlocks } from '@/lib/codeBlocks';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

type TocItem = { id: string; text: string; level: number };

function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
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
  return content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=\S+/gi, '')
    .replace(/\s(href|src)=(["'])javascript:[\s\S]*?\2/gi, ' $1="#"');
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const [slug, setSlug] = useState<string>('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setSlug(p.slug));
  }, [params]);

  // Fetch post từ API
  const { post, loading, error } = usePost(slug);

  // Fetch related posts
  const { posts: relatedPosts, loading: relatedLoading } = useRelatedPosts(slug, 2);

  // TOC state and content ref
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const articleContent = useMemo(
    () => prepareArticleContent(post?.content || ''),
    [post?.content]
  );
  const toc = articleContent.toc;
  const currentActiveId = activeId ?? toc[0]?.id ?? null;

  const handleShare = async () => {
    if (!post || typeof window === 'undefined') return;

    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
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
          <p className="text-[var(--text-muted)] text-lg">Loading article...</p>
        </motion.div>
      </Section>
    );
  }

  // Error state
  if (error || !post) {
    return (
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-20"
        >
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Post Not Found</h1>
          <p className="text-[var(--text-muted)] mb-6">
            {error || 'The article you are looking for does not exist.'}
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--amber)] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Blog
          </Link>
        </motion.div>
      </Section>
    );
  }

  return (
    <>
      {/* Featured Image */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-56 overflow-hidden bg-[#090d0b] sm:h-72 md:h-[28rem]"
      >
        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
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
            href="/blog"
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--amber)] transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} className="flex-shrink-0" />
            Back to Blog
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
            <Badge variant="primary">{post.category}</Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 gradient-text">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-[var(--text-muted)] text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <User size={16} className="flex-shrink-0" />
              <span>{siteConfig.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} className="flex-shrink-0" />
              <time dateTime={post.published_at}>
                {formatDate(post.published_at)}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="flex-shrink-0" />
              <span>{formatReadingTime(calculateReadingTime(post.content))}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{post.view_count} views</span>
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
          {post.tags.map((tag) => (
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
            <div className="micro-label mb-3">On this page</div>
            <nav aria-label="Table of contents">
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
                <div className="micro-label mb-3">On this page</div>
                <nav aria-label="Table of contents">
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
                Share this article
              </h3>
              <p className="text-[var(--text-muted)] text-xs sm:text-sm">
                Help others discover this article
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              aria-label="Share this article"
              className="w-10 h-10 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.06)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all flex-shrink-0"
            >
              <Share2 size={20} />
            </motion.button>
          </div>
        </motion.div>

        {/* Comments Section */}
        <CommentsSection postId={post.id} />

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-[var(--line)]"
          >
            <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 gradient-text">
              Related Articles
            </h3>

            {relatedLoading ? (
              <div className="text-center py-8">
                <Loader2 className="mx-auto text-[var(--accent)] mb-3 animate-spin" size={32} />
                <p className="text-[var(--text-muted)] text-sm">Loading related posts...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {relatedPosts.map((relatedPost) => (
                  <motion.div
                    key={relatedPost.id}
                    whileHover={{ y: -5 }}
                  >
                    <Link
                      href={`/blog/${relatedPost.slug}`}
                      className="surface-card p-6 transition-all group hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)] block h-full"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="primary" className="text-xs">
                          {relatedPost.category}
                        </Badge>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-all line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-[var(--text-muted)] text-xs sm:text-sm mb-4 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <span className="text-[var(--accent)] text-xs sm:text-sm font-medium inline-flex items-center gap-1">
                        Read More <span className="group-hover:translate-x-1 transition-transform">→</span>
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
