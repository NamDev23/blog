import { Metadata } from 'next';
import { Post } from '@/types';
import { absoluteUrl, siteConfig } from '@/lib/site';

const SITE_NAME = siteConfig.name;
const SITE_DESCRIPTION = siteConfig.description;
const SITE_URL = siteConfig.url;
const TWITTER_HANDLE = siteConfig.twitterHandle;

/**
 * Generate metadata cho homepage
 */
export function generateHomeMetadata(): Metadata {
  return {
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
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
      type: 'website',
      locale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: absoluteUrl('/opengraph-image'),
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      creator: TWITTER_HANDLE,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: SITE_URL,
      types: {
        'application/rss+xml': absoluteUrl('/rss.xml'),
      },
    },
  };
}

/**
 * Generate metadata cho blog listing page
 */
export function generateBlogMetadata(): Metadata {
  const title = 'Blog';
  const description = 'Deep dives on web systems, frontend design, performance, and secure delivery.';
  const url = absoluteUrl('/blog');

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata cho post detail page
 */
export function generatePostMetadata(post: Post): Metadata {
  const url = absoluteUrl(`/blog/${post.slug}`);
  const imageUrl = post.featured_image || absoluteUrl('/opengraph-image');
  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;
  const canonical = post.canonical_url || url;

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: siteConfig.author, url: SITE_URL }],
    robots: post.noindex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
    openGraph: {
      type: 'article',
      url,
      title,
      description,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [siteConfig.author],
      tags: post.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
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
      canonical,
    },
  };
}

/**
 * Generate metadata cho tags page
 */
export function generateTagsMetadata(): Metadata {
  const title = 'Tags';
  const description = 'Browse ShadowDev articles by technical topic and engineering theme.';
  const url = absoluteUrl('/tags');

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata cho about page
 */
export function generateAboutMetadata(): Metadata {
  const title = 'About';
  const description = 'Learn about the engineering approach behind ShadowDev.';
  const url = absoluteUrl('/about');

  return {
    title,
    description,
    openGraph: {
      type: 'profile',
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * Generate metadata cho contact page
 */
export function generateContactMetadata(): Metadata {
  const title = 'Contact';
  const description = 'Contact ShadowDev for product engineering, UX, performance, and security work.';
  const url = absoluteUrl('/contact');

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
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
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [absoluteUrl('/opengraph-image')],
    },
    alternates: {
      canonical: url,
    },
  };
}
