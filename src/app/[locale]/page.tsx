import type { Metadata } from 'next';
import Home from '@/app/page';
import { generateHomeMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

/**
 * Wrapper trang chủ có locale.
 *
 * UI dùng cùng component `src/app/page.tsx`; layout/proxy đảm nhiệm locale trong
 * URL, còn metadata được sinh riêng để canonical/hreflang đúng ngôn ngữ.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateHomeMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default Home;
