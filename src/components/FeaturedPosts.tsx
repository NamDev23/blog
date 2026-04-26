"use client";

import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { calculateReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { formatLocalizedDate, formatLocalizedReadingTime, getCategoryLabel, useLanguage } from "@/lib/i18n";
import { localizedPath } from "@/lib/locales";
import { localizePost } from "@/lib/postTranslations";

/**
 * Cụm bài nổi bật ở trang blog/home.
 *
 * Component lấy tối đa 3 bài đầu: bài mới/quan trọng nhất chiếm diện tích lớn,
 * hai bài còn lại làm cột phụ. Toàn bộ text đi qua `localizePost` để không bị
 * lẫn tiếng Việt trên giao diện tiếng Anh.
 */
export default function FeaturedPosts({ posts = [] as Post[] }) {
  const { locale } = useLanguage();
  if (!posts || posts.length === 0) return null;
  // Giữ layout ổn định bằng cách bỏ qua phần dư; danh sách đầy đủ nằm ở grid/pagination.
  const [first, ...rest] = posts;
  const side = rest.slice(0, 2);
  const localizedFirst = localizePost(first, locale);

  const firstReading = calculateReadingTime(localizedFirst.content);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Link href={localizedPath(`/blog/${first.slug}`, locale)} className="group surface-card relative overflow-hidden lg:col-span-2">
        <div className="relative h-64 sm:h-[22rem]">
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--text-muted)] sm:text-sm">
              <time dateTime={first.published_at}>{formatLocalizedDate(first.published_at, locale)}</time>
              <span className="opacity-50">•</span>
              <span>{formatLocalizedReadingTime(firstReading, locale)}</span>
            </div>
            {first.category && <Badge variant="primary" className="text-xs">{getCategoryLabel(first.category, locale)}</Badge>}
          </div>
          <h3 className="mb-2 text-xl font-extrabold leading-tight text-[var(--text)] sm:text-3xl">
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
              <div className="relative h-36 sm:h-48">
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
                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--text-muted)]">
                  <time dateTime={p.published_at}>{formatLocalizedDate(p.published_at, locale)}</time>
                  <span className="opacity-50">•</span>
                  <span>{formatLocalizedReadingTime(rt, locale)}</span>
                </div>
                <h4 className="line-clamp-2 text-base font-bold text-[var(--text)] sm:text-lg">{localizedPost.title}</h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
