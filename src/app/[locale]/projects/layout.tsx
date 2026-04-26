import type { Metadata } from 'next';
import { generateProjectsMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

// Layout locale chỉ sinh metadata đúng ngôn ngữ, không thêm DOM wrapper.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateProjectsMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default function LocalizedProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
