"use client";

import Image from "next/image";
import Link from "next/link";
import { Post } from "@/types";
import { calculateReadingTime, formatDate, formatReadingTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export default function FeaturedPosts({ posts = [] as Post[] }) {
  if (!posts || posts.length === 0) return null;
  const [first, ...rest] = posts;
  const side = rest.slice(0, 2);

  const firstReading = calculateReadingTime(first.content);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      <Link href={`/blog/${first.slug}`} className="group surface-card relative lg:col-span-2 overflow-hidden">
        <div className="relative h-80 sm:h-[24rem]">
          {first.featured_image && (
            <Image
              src={first.featured_image}
              alt={first.title}
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
              <time dateTime={first.published_at}>{formatDate(first.published_at)}</time>
              <span className="opacity-50">•</span>
              <span>{formatReadingTime(firstReading)}</span>
            </div>
            {first.category && <Badge variant="primary" className="text-xs">{first.category}</Badge>}
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2 text-[var(--text)]">
            {first.title}
          </h3>
          <p className="hidden sm:block text-[var(--text-muted)] line-clamp-2">{first.excerpt}</p>
        </div>
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        {side.map((p) => {
          const rt = calculateReadingTime(p.content);
          return (
            <Link
              key={p.id}
              href={`/blog/${p.slug}`}
              className="group surface-card relative overflow-hidden"
            >
              <div className="relative h-40 sm:h-48">
                {p.featured_image && (
                  <Image
                    src={p.featured_image}
                    alt={p.title}
                    fill
                    className="object-cover opacity-88 saturate-[0.86] transition-all duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
                    sizes="(max-width:1024px) 100vw, 33vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111711] via-[#111711]/45 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="text-[11px] text-[var(--text-muted)] mb-1 flex items-center gap-2">
                  <time dateTime={p.published_at}>{formatDate(p.published_at)}</time>
                  <span className="opacity-50">•</span>
                  <span>{formatReadingTime(rt)}</span>
                </div>
                <h4 className="text-[var(--text)] font-bold text-lg line-clamp-2">{p.title}</h4>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
