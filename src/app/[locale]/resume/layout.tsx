import type { Metadata } from 'next';
import { generateResumeMetadata } from '@/lib/metadata';
import { defaultLocale, isLocale } from '@/lib/locales';

// Layout locale chỉ sinh metadata đúng ngôn ngữ, không thêm DOM wrapper.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateResumeMetadata(isLocale(locale) ? locale : defaultLocale);
}

export default function LocalizedResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
