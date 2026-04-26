'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { calculateReadingTime } from '@/lib/utils';
import { Post } from '@/types';
import { ArrowRight, Calendar, Tag, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  commonCopy,
  formatLocalizedDate,
  formatLocalizedReadingTime,
  getCategoryLabel,
  useLanguage,
} from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';
import { localizePost } from '@/lib/postTranslations';

interface PostCardProps {
  post: Post;
  index?: number;
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const { locale } = useLanguage();
  const copy = commonCopy[locale];
  const localizedPost = localizePost(post, locale);
  // Calculate reading time
  const readingTime = calculateReadingTime(localizedPost.content);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
      },
    },
  };

  return (
    <motion.article
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="group surface-card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)] flex flex-col h-full"
    >
      {post.featured_image && (
        <div className="relative h-44 sm:h-52 overflow-hidden bg-[#0a0e0c] flex-shrink-0">
          <Image
            src={post.featured_image}
            alt={localizedPost.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-90 saturate-[0.86] group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111711] via-transparent to-transparent opacity-90" />
        </div>
      )}

      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-[var(--text-soft)] text-xs sm:text-sm">
            <Calendar size={14} className="flex-shrink-0" />
            <time dateTime={post.published_at} className="whitespace-nowrap">
              {formatLocalizedDate(post.published_at, locale)}
            </time>
          </div>
          {post.category && (
            <Badge variant="primary" className="whitespace-nowrap">{getCategoryLabel(post.category, locale)}</Badge>
          )}
        </div>

        <Link href={localizedPath(`/blog/${post.slug}`, locale)} className="group/title">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] mb-2 sm:mb-3 group-hover/title:text-[var(--accent)] transition-all line-clamp-2">
            {localizedPost.title}
          </h3>
        </Link>

        <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-3 flex-grow">
          {localizedPost.excerpt}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} className="gap-1">
                <Tag size={12} className="flex-shrink-0" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <span className="text-xs text-[var(--text-soft)]">+{post.tags.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-[var(--line)] gap-2">
          <div className="flex items-center gap-3 text-xs text-[var(--text-soft)]">
            <div className="flex items-center gap-1">
              <Clock size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{formatLocalizedReadingTime(readingTime, locale)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye size={14} className="flex-shrink-0" />
              <span className="whitespace-nowrap">{post.view_count} {copy.views}</span>
            </div>
          </div>
          <Link
            href={localizedPath(`/blog/${post.slug}`, locale)}
            className="inline-flex items-center gap-2 text-[var(--accent)] hover:text-[var(--amber)] transition-colors font-medium text-sm group/link whitespace-nowrap"
          >
            {copy.readMore}
            <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform flex-shrink-0" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
