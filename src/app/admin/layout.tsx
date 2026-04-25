import type { Metadata } from 'next';

export const metadata: Metadata = {
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
