import type { Metadata } from 'next';
import { generateTagsMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateTagsMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default function LocalizedTagsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
