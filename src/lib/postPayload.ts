import { sanitizeLongText, sanitizeText } from '@/lib/security';
import { sanitizeHtmlContent } from '@/lib/htmlSanitizer';
import { slugify } from '@/lib/utils';

const supportedTranslationLocales = new Set(['vi', 'en']);

/**
 * Parser/validator cho dữ liệu ghi bài viết từ admin API.
 *
 * Route không insert trực tiếp request body vào Supabase. Mọi field đi qua file
 * này để được sanitize, giới hạn độ dài, chuẩn hóa slug/tags/date và gom lỗi
 * validation. `partial=true` dùng cho PATCH, chỉ ghi những field thật sự gửi lên.
 */
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
  translations?: unknown;
};

type RawPostTranslationBody = {
  locale?: unknown;
  title?: unknown;
  content?: unknown;
  excerpt?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
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

export type PostTranslationWritePayload = {
  locale: 'vi' | 'en';
  title: string;
  content: string;
  excerpt: string;
  seo_title: string | null;
  seo_description: string | null;
};

export function parsePostPayload(body: unknown, partial = false) {
  const raw = (body || {}) as RawPostBody;
  const errors: string[] = [];
  const payload: Partial<PostWritePayload> = {};
  const translations = parseTranslations(raw.translations, errors);

  // Title và slug là hai trường nhận diện bài viết; slug luôn được sinh lại bằng
  // `slugify` để tránh ký tự không phù hợp URL kể cả khi admin nhập thủ công.
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

  // SEO title/description có fallback từ title/excerpt để bài mới không bị thiếu
  // metadata, nhưng admin vẫn có thể chỉnh riêng trong editor.
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

  // Tags nhận cả mảng và chuỗi comma-separated để tương thích editor hiện tại và
  // các client API khác nếu sau này có import script.
  if (raw.tags !== undefined || !partial) {
    payload.tags = parseTags(raw.tags);
  }

  const nextPublishedAt = raw.published_at !== undefined
    ? parsePublishedAt(raw.published_at)
    : !partial
      ? new Date().toISOString()
      : undefined;

  if (nextPublishedAt !== undefined) {
    payload.published_at = nextPublishedAt;
  }

  if (payload.published_at) {
    validatePublishTranslations(payload, translations, errors);
  }

  if (partial && Object.keys(payload).length === 0 && translations.length === 0) {
    errors.push('No valid fields to update');
  }

  return { payload, translations, errors };
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

function parseTranslations(value: unknown, errors: string[]) {
  if (value === undefined) return [];

  const items = Array.isArray(value)
    ? value
    : typeof value === 'object' && value
      ? Object.entries(value as Record<string, unknown>).map(([locale, translation]) => ({
          ...((translation || {}) as RawPostTranslationBody),
          locale,
        }))
      : [];

  const translations: PostTranslationWritePayload[] = [];

  items.forEach((item) => {
    const rawTranslation = (item || {}) as RawPostTranslationBody;
    const locale = sanitizeText(rawTranslation.locale, 8);

    if (!supportedTranslationLocales.has(locale)) {
      errors.push(`Unsupported translation locale: ${locale || 'unknown'}`);
      return;
    }

    const title = sanitizeText(rawTranslation.title, 180);
    const excerpt = sanitizeLongText(rawTranslation.excerpt, 500);
    const content = sanitizePostHtml(rawTranslation.content);
    const seoTitle = sanitizeText(rawTranslation.seo_title, 70) || null;
    const seoDescription = sanitizeLongText(rawTranslation.seo_description, 170) || null;

    if (!title && !excerpt && !content && !seoTitle && !seoDescription) return;

    translations.push({
      locale: locale as 'vi' | 'en',
      title,
      excerpt,
      content,
      seo_title: seoTitle,
      seo_description: seoDescription,
    });
  });

  return translations;
}

function validatePublishTranslations(
  payload: Partial<PostWritePayload>,
  translations: PostTranslationWritePayload[],
  errors: string[]
) {
  const byLocale = new Map(translations.map((translation) => [translation.locale, translation]));
  const vi = byLocale.get('vi') || {
    locale: 'vi' as const,
    title: payload.title || '',
    excerpt: payload.excerpt || '',
    content: payload.content || '',
    seo_title: payload.seo_title || null,
    seo_description: payload.seo_description || null,
  };
  const en = byLocale.get('en');

  validateLocalizedContent('vi', vi, errors);
  validateLocalizedContent('en', en, errors);
}

function validateLocalizedContent(
  locale: 'vi' | 'en',
  translation: PostTranslationWritePayload | undefined,
  errors: string[]
) {
  if (!translation?.title) errors.push(`${locale} title is required before publishing`);
  if (!translation?.excerpt || translation.excerpt.length < 20) {
    errors.push(`${locale} excerpt must be at least 20 characters before publishing`);
  }
  if (!translation?.content || translation.content.length < 20) {
    errors.push(`${locale} content must be at least 20 characters before publishing`);
  }
}

function parsePublishedAt(value: unknown) {
  // `null` nghĩa là draft; `now`/true publish ngay; ISO string được normalize về UTC.
  if (value === null || value === false || value === 'draft' || value === '') return null;
  if (value === true || value === 'now') return new Date().toISOString();
  if (typeof value !== 'string') return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function isSafeUrl(value: string) {
  // Chỉ cho http/https để tránh `javascript:` hoặc scheme lạ trong image/canonical.
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
