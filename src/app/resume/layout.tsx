import type { Metadata } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

const title = 'Resume';
const description =
  'A focused interview profile for ShadowDev: PHP, Laravel, LMS, CMS, CRM, education chatbots, Vue.js, Next.js, UX, and secure CMS APIs.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl('/resume'),
  },
  openGraph: {
    type: 'profile',
    url: absoluteUrl('/resume'),
    siteName: siteConfig.name,
    title: `${title} | ${siteConfig.name}`,
    description,
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} resume`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${title} | ${siteConfig.name}`,
    description,
    images: [absoluteUrl('/opengraph-image')],
  },
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
