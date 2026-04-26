import { notFound } from 'next/navigation';
import { isLocale, locales } from '@/lib/locales';

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
