const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ShadowDev';

/**
 * Cấu hình thương hiệu và SEO dùng chung.
 *
 * Dữ liệu trong file này được metadata, structured data, header/footer và RSS dùng
 * lại. Khi đổi domain/brand/email, ưu tiên sửa ở đây hoặc biến môi trường tương
 * ứng thay vì hard-code rải rác trong từng component.
 */
export const siteConfig = {
  name: siteName,
  shortName: siteName.toLowerCase().replace(/\s+/g, ''),
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowdev.dev',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'ShadowDev is a technical engineering journal about secure web architecture, DevOps, performance, API design, frontend systems, observability, and production-grade product delivery.',
  author: 'ShadowDev',
  email: 'hello@shadowdev.dev',
  location: 'Vietnam',
  twitterHandle: '@shadowdev',
  keywords: [
    'ShadowDev',
    'software architecture',
    'product engineering',
    'web development',
    'DevOps',
    'Docker',
    'networking',
    'API security',
    'observability',
    'Vue.js',
    'frontend engineering',
    'Next.js',
    'React',
    'TypeScript',
    'UX design',
    'web performance',
    'web security',
    'technical portfolio',
    'headless CMS',
  ],
} as const;

export function absoluteUrl(path = '/') {
  // Metadata/OpenGraph cần URL tuyệt đối; helper này chuẩn hóa dấu `/` giữa domain và path.
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
