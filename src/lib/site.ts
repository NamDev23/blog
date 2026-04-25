const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'ShadowDev';

export const siteConfig = {
  name: siteName,
  shortName: siteName.toLowerCase().replace(/\s+/g, ''),
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://shadowdev.dev',
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    'ShadowDev is a technical portfolio and engineering journal about Laravel, education systems, LMS, CMS, CRM, chatbot workflows, modern frontend UI, security, and performance.',
  author: 'ShadowDev',
  email: 'hello@shadowdev.dev',
  location: 'Vietnam',
  twitterHandle: '@shadowdev',
  keywords: [
    'ShadowDev',
    'web development',
    'PHP',
    'Laravel',
    'LMS',
    'CRM',
    'education technology',
    'chatbot',
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
  const baseUrl = siteConfig.url.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
