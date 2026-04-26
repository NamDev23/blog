import type { Metadata } from 'next';
import { generateBlogMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateBlogMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default function LocalizedBlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
