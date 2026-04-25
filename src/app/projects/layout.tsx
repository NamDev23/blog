import type { Metadata } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

const title = 'Projects';
const description =
  'ShadowDev case studies covering Laravel, LMS, CMS, CRM, education chatbots, Vue.js, Next.js, admin UX, API security, SEO, and performance.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl('/projects'),
  },
  openGraph: {
    type: 'website',
    url: absoluteUrl('/projects'),
    siteName: siteConfig.name,
    title: `${title} | ${siteConfig.name}`,
    description,
    images: [
      {
        url: absoluteUrl('/opengraph-image'),
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} projects`,
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

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
