import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/lib/locales';

/**
 * Dynamic segment `[locale]` cho toàn bộ public site.
 *
 * `generateStaticParams` giúp Next biết hai locale hợp lệ khi build, còn runtime
 * guard `notFound()` chặn URL như `/fr/...` để không tạo nội dung sai hreflang.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<unknown>;
}) {
  const { locale } = (await params) as { locale?: string };
  if (!isLocale(locale)) notFound();

  return <>{children}</>;
}
