import { sanitizeLongText, sanitizeText } from '@/lib/security';
import { sanitizeHtmlContent } from '@/lib/htmlSanitizer';
import { slugify } from '@/lib/utils';

const DEFAULT_AUTHOR_ID =
  process.env.DEFAULT_AUTHOR_ID || '00000000-0000-0000-0000-000000000001';

type RawPostBody = {
  title?: unknown;
  slug?: unknown;
  content?: unknown;
  excerpt?: unknown;
  featured_image?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  canonical_url?: unknown;
  noindex?: unknown;
  author_id?: unknown;
  category?: unknown;
  tags?: unknown;
  published_at?: unknown;
};

export type PostWritePayload = {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  noindex: boolean;
  author_id: string;
  category: string;
  tags: string[];
  published_at: string | null;
};

export function parsePostPayload(body: unknown, partial = false) {
  const raw = (body || {}) as RawPostBody;
  const errors: string[] = [];
  const payload: Partial<PostWritePayload> = {};

  const title = sanitizeText(raw.title, 180);
  if (title) payload.title = title;
  if (!partial && !title) errors.push('title is required');

  const rawSlug = sanitizeText(raw.slug, 220);
  const slug = slugify(rawSlug || title);
  if (slug) payload.slug = slug;
  if (!partial && !slug) errors.push('slug is required');

  const content = sanitizePostHtml(raw.content);
  if (content) payload.content = content;
  if (!partial && content.length < 20) errors.push('content must be at least 20 characters');

  const excerpt = sanitizeLongText(raw.excerpt, 500);
  if (excerpt) payload.excerpt = excerpt;
  if (!partial && excerpt.length < 20) errors.push('excerpt must be at least 20 characters');

  if (raw.featured_image !== undefined) {
    const imageUrl = sanitizeText(raw.featured_image, 500);
    payload.featured_image = imageUrl && isSafeUrl(imageUrl) ? imageUrl : null;
  } else if (!partial) {
    payload.featured_image = null;
  }

  if (raw.seo_title !== undefined) {
    payload.seo_title = sanitizeText(raw.seo_title, 70) || null;
  } else if (!partial) {
    payload.seo_title = title || null;
  }

  if (raw.seo_description !== undefined) {
    payload.seo_description = sanitizeLongText(raw.seo_description, 170) || null;
  } else if (!partial) {
    payload.seo_description = excerpt || null;
  }

  if (raw.canonical_url !== undefined) {
    const canonicalUrl = sanitizeText(raw.canonical_url, 500);
    payload.canonical_url = canonicalUrl && isSafeUrl(canonicalUrl) ? canonicalUrl : null;
  } else if (!partial) {
    payload.canonical_url = null;
  }

  if (raw.noindex !== undefined) {
    payload.noindex = raw.noindex === true || raw.noindex === 'true';
  } else if (!partial) {
    payload.noindex = false;
  }

  if (raw.author_id !== undefined || !partial) {
    const authorId = sanitizeText(raw.author_id, 80) || DEFAULT_AUTHOR_ID;
    if (authorId) payload.author_id = authorId;
    if (!isUuid(authorId)) errors.push('author_id must be a valid UUID');
  }

  const category = sanitizeText(raw.category, 80);
  if (category) payload.category = category;
  if (!partial && !category) errors.push('category is required');

  if (raw.tags !== undefined || !partial) {
    payload.tags = parseTags(raw.tags);
  }

  if (raw.published_at !== undefined) {
    payload.published_at = parsePublishedAt(raw.published_at);
  } else if (!partial) {
    payload.published_at = new Date().toISOString();
  }

  if (partial && Object.keys(payload).length === 0) {
    errors.push('No valid fields to update');
  }

  return { payload, errors };
}

function sanitizePostHtml(value: unknown) {
  return sanitizeHtmlContent(value, 100000);
}

function parseTags(value: unknown) {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return Array.from(
    new Set(
      rawTags
        .map((tag) => sanitizeText(tag, 40).toLowerCase())
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function parsePublishedAt(value: unknown) {
  if (value === null || value === false || value === 'draft' || value === '') return null;
  if (value === true || value === 'now') return new Date().toISOString();
  if (typeof value !== 'string') return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isSafeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
