import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';

/**
 * Metadata riêng cho admin.
 *
 * Admin không nằm dưới locale và luôn `noindex` để search engine không index màn
 * hình quản trị, kể cả khi ai đó vô tình public URL login/dashboard.
 */
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
  // Layout admin giữ rỗng vì RootLayout đã bọc font/theme; Header/Footer tự ẩn theo path.
  return <>{children}</>;
}
