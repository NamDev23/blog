import { Metadata } from 'next';
import { Post } from '@/types';
import { absoluteUrl, siteConfig } from '@/lib/site';
import { defaultLocale, localizedPath, type Locale } from '@/lib/locales';
import { localizePost } from '@/lib/postTranslations';

/**
 * Metadata tập trung cho toàn bộ website.
 *
 * Lý do gom ở một nơi:
 * - canonical URL và hreflang phải nhất quán giữa `/vi` và `/en`;
 * - Open Graph/Twitter card dùng cùng nguồn dữ liệu với SEO title/description;
 * - khi đổi brand/domain, chỉ cần sửa `siteConfig` và các helper tại đây.
 */
const SITE_NAME = siteConfig.name;
const SITE_URL = siteConfig.url;
const TWITTER_HANDLE = siteConfig.twitterHandle;

type PageKey = 'home' | 'blog' | 'tags' | 'about' | 'contact' | 'projects' | 'resume' | 'privacy';

// Nội dung SEO tĩnh theo từng page. `path` luôn là path chưa gắn locale để helper
// có thể tự sinh canonical và alternates cho cả tiếng Việt lẫn tiếng Anh.
const pageCopy: Record<PageKey, Record<Locale, { title: string; description: string; path: string }>> = {
  home: {
    vi: {
      title: SITE_NAME,
      description:
        'ShadowDev là portfolio kỹ thuật và blog chia sẻ kiến thức về DevOps, Docker, network, kiến trúc web, Git, bảo mật, Laravel, Next.js và hệ thống production.',
      path: '/',
    },
    en: {
      title: SITE_NAME,
      description:
        'ShadowDev is a technical portfolio and engineering journal about DevOps, Docker, networking, web architecture, Git, security, Laravel, Next.js, and production systems.',
      path: '/',
    },
  },
  blog: {
    vi: {
      title: 'Bài viết IT',
      description:
        'Bài viết chuyên sâu về DevOps, Docker, Kubernetes, networking, kiến trúc hệ thống, Git, bảo mật API, PostgreSQL và SEO kỹ thuật.',
      path: '/blog',
    },
    en: {
      title: 'IT Engineering Journal',
      description:
        'Deep technical articles on DevOps, Docker, Kubernetes, networking, system architecture, Git, API security, PostgreSQL, and technical SEO.',
      path: '/blog',
    },
  },
  tags: {
    vi: {
      title: 'Chủ đề',
      description: 'Duyệt bài viết ShadowDev theo chủ đề kỹ thuật như DevOps, Docker, Git, bảo mật, database và SEO.',
      path: '/tags',
    },
    en: {
      title: 'Tags',
      description: 'Browse ShadowDev articles by engineering topics such as DevOps, Docker, Git, security, database, and SEO.',
      path: '/tags',
    },
  },
  about: {
    vi: {
      title: 'Giới thiệu',
      description: 'Tìm hiểu cách ShadowDev tiếp cận kỹ thuật sản phẩm, hệ thống web, UX, bảo mật và hiệu năng.',
      path: '/about',
    },
    en: {
      title: 'About',
      description: 'Learn about the engineering approach behind ShadowDev: product systems, web UX, security, and performance.',
      path: '/about',
    },
  },
  contact: {
    vi: {
      title: 'Liên hệ',
      description: 'Liên hệ ShadowDev về product engineering, web application, UX, hiệu năng, bảo mật và nội dung kỹ thuật.',
      path: '/contact',
    },
    en: {
      title: 'Contact',
      description: 'Contact ShadowDev for product engineering, web applications, UX, performance, security, and technical content.',
      path: '/contact',
    },
  },
  projects: {
    vi: {
      title: 'Dự án',
      description:
        'Case study về Laravel, LMS, CMS, CRM, chatbot giáo dục, Vue.js, Next.js, admin UX, bảo mật API, SEO và hiệu năng.',
      path: '/projects',
    },
    en: {
      title: 'Projects',
      description:
        'ShadowDev case studies covering Laravel, LMS, CMS, CRM, education chatbots, Vue.js, Next.js, admin UX, API security, SEO, and performance.',
      path: '/projects',
    },
  },
  resume: {
    vi: {
      title: 'Hồ sơ',
      description:
        'Hồ sơ phỏng vấn tập trung vào PHP, Laravel, LMS, CMS, CRM, chatbot giáo dục, Vue.js, Next.js, UX và API an toàn.',
      path: '/resume',
    },
    en: {
      title: 'Resume',
      description:
        'A focused interview profile for PHP, Laravel, LMS, CMS, CRM, education chatbots, Vue.js, Next.js, UX, and secure APIs.',
      path: '/resume',
    },
  },
  privacy: {
    vi: {
      title: 'Chính sách bảo mật',
      description: 'Đọc chính sách bảo mật của ShadowDev và cách dữ liệu được xử lý trên website này.',
      path: '/privacy',
    },
    en: {
      title: 'Privacy Policy',
      description: 'Read the ShadowDev privacy policy and how your data is handled on this site.',
      path: '/privacy',
    },
  },
};

export function localizedUrl(path: string, locale: Locale) {
  return absoluteUrl(localizedPath(path, locale));
}

export function languageAlternates(path: string) {
  // `x-default` trỏ về locale mặc định để Google hiểu bản mặc định của site.
  return {
    vi: localizedUrl(path, 'vi'),
    en: localizedUrl(path, 'en'),
    'x-default': localizedUrl(path, defaultLocale),
  };
}

function ogLocale(locale: Locale) {
  return locale === 'vi' ? 'vi_VN' : 'en_US';
}

function alternateOgLocale(locale: Locale) {
  return locale === 'vi' ? ['en_US'] : ['vi_VN'];
}

function generatePageMetadata(page: PageKey, locale: Locale = defaultLocale, type: 'website' | 'profile' = 'website'): Metadata {
  const copy = pageCopy[page][locale];
  const url = localizedUrl(copy.path, locale);
  const title = page === 'home' ? copy.title : `${copy.title} | ${SITE_NAME}`;

  // Next Metadata API sẽ tự render `<title>`, canonical, robots, OG và Twitter
  // tags. Tạo object tại đây giúp các layout/page chỉ cần chọn đúng locale.
  return {
    title: page === 'home'
      ? {
          default: SITE_NAME,
          template: `%s | ${SITE_NAME}`,
        }
      : copy.title,
    description: copy.description,
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    category: 'technology',
    keywords: [...siteConfig.keywords],
    authors: [{ name: siteConfig.author, url: SITE_URL }],
    creator: siteConfig.author,
    publisher: SITE_NAME,
    referrer: 'strict-origin-when-cross-origin',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type,
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocale(locale),
      url,
      siteName: SITE_NAME,
      title,
      description: copy.description,
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: copy.description,
      creator: TWITTER_HANDLE,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: url,
      languages: languageAlternates(copy.path),
      ...(page === 'home'
        ? {
            types: {
              'application/rss+xml': absoluteUrl('/rss.xml'),
            },
          }
        : {}),
    },
  };
}

export function generateHomeMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('home', locale);
}

export function generateBlogMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('blog', locale);
}

export function generateTagsMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('tags', locale);
}

export function generateAboutMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('about', locale, 'profile');
}

export function generateContactMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('contact', locale);
}

export function generateProjectsMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('projects', locale);
}

export function generateResumeMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('resume', locale, 'profile');
}

export function generatePrivacyMetadata(locale: Locale = defaultLocale): Metadata {
  return generatePageMetadata('privacy', locale);
}

export function generatePostMetadata(post: Post, locale: Locale = defaultLocale): Metadata {
  // Post vẫn lưu nội dung canonical, còn `localizePost` phủ bản dịch runtime để
  // metadata của trang `/en/blog/...` không bị lẫn tiếng Việt.
  const displayPost = localizePost(post, locale);
  const path = `/blog/${post.slug}`;
  const url = localizedUrl(path, locale);
  const imageUrl = post.featured_image || absoluteUrl('/opengraph-image');
  const title = displayPost.seo_title || displayPost.title;
  const description = displayPost.seo_description || displayPost.excerpt;

  return {
    title,
    description,
    metadataBase: new URL(SITE_URL),
    keywords: displayPost.tags,
    authors: [{ name: siteConfig.author, url: SITE_URL }],
    robots: post.noindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type: 'article',
      locale: ogLocale(locale),
      alternateLocale: alternateOgLocale(locale),
      url,
      siteName: SITE_NAME,
      title,
      description,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [siteConfig.author],
      tags: displayPost.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: displayPost.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
  };
}
