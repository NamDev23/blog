import type { Metadata } from 'next';
import Home from '@/app/page';
import { generateHomeMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateHomeMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default Home;
