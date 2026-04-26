import type { Metadata } from 'next';
import { generateContactMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateContactMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default function LocalizedContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
