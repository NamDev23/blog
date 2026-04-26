import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: 'Admin',
  description: 'Private ShadowDev admin console and CMS publishing studio.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
