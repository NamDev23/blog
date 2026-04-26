"use client";

import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { calculateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { formatLocalizedDate, formatLocalizedReadingTime, getCategoryLabel, useLanguage } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";
import { localizePost } from "@/lib/postTranslations";

export default function FeaturedPosts({ posts = [] as Post[] }) {
  const { locale } = useLanguage();
  if (!posts || posts.length === 0) return null;
  const [first, ...rest] = posts;
  const side = rest.slice(0, 2);
  const localizedFirst = localizePost(first, locale);

  const firstReading = calculateReadingTime(localizedFirst.content);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Link href={localizedPath(`/blog/${first.slug}`, locale)} className="group surface-card relative lg:col-span-2 overflow-hidden">
        <div className="relative h-80 sm:h-[24rem]">
          {first.featured_image && (
            <Image
              src={first.featured_image}
              alt={localizedFirst.title}
              fill
              className="object-cover opacity-88 saturate-[0.86] transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
              sizes="(max-width:1024px) 100vw, 66vw"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111711] via-[#111711]/45 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="text-xs sm:text-sm text-[var(--text-muted)] flex items-center gap-2">
              <time dateTime={first.published_at}>{formatLocalizedDate(first.published_at, locale)}</time>
              <span className="opacity-50">•</span>
              <span>{formatLocalizedReadingTime(firstReading, locale)}</span>
            </div>
            {first.category && <Badge variant="primary" className="text-xs">{getCategoryLabel(first.category, locale)}</Badge>}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2 text-[var(--text)]">
            {localizedFirst.title}
          </h3>
          <p className="hidden sm:block text-[var(--text-muted)] line-clamp-2">{localizedFirst.excerpt}</p>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {side.map((p) => {
          const localizedPost = localizePost(p, locale);
          const rt = calculateReadingTime(localizedPost.content);
          return (
            <Link
              key={p.id}
              href={localizedPath(`/blog/${p.slug}`, locale)}
              className="group surface-card relative overflow-hidden"
            >
              <div className="relative h-40 sm:h-48">
                {p.featured_image && (
                  <Image
                    src={p.featured_image}
                    alt={localizedPost.title}
                    fill
                    className="object-cover opacity-88 saturate-[0.86] transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111711] via-[#111711]/45 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-1 flex items-center gap-2">
                  <time dateTime={p.published_at}>{formatLocalizedDate(p.published_at, locale)}</time>
                  <span className="opacity-50">•</span>
                  <span>{formatLocalizedReadingTime(rt, locale)}</span>
                </div>
                <h4 className="text-[var(--text)] font-bold text-lg line-clamp-2">{localizedPost.title}</h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
