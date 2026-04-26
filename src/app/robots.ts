import { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * Sinh robots.txt bằng MetadataRoute của Next.
 *
 * Cho phép index toàn bộ public site, nhưng chặn API, asset nội bộ và admin để
 * bot không crawl bề mặt không dành cho search result.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin',
          '/admin/',
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
