import { MetadataRoute } from 'next';
import { absoluteUrl, siteConfig } from '@/lib/site';

/**
 * Generate robots.txt
 * Next.js sẽ tự động generate file robots.txt từ function này
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',           // Không index API routes
          '/_next/',         // Không index Next.js internals
          '/admin',          // Không index admin
          '/admin/',         // Không index admin (nếu có)
        ],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: siteConfig.url,
  };
}
