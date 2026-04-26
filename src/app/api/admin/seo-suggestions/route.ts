import { NextRequest } from 'next/server';
import { sanitizeHtmlContent } from '@/lib/htmlSanitizer';
import { requestOpenAIStructuredJson } from '@/lib/openaiStructured';
import {
  jsonResponse,
  rateLimit,
  requireAdmin,
  sanitizeLongText,
  sanitizeText,
} from '@/lib/security';
import { slugify } from '@/lib/utils';

type SeoLocale = 'vi' | 'en';

type SeoSuggestionBody = {
  locale?: unknown;
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  category?: unknown;
  tags?: unknown;
};

type SeoSuggestionResult = {
  seo_title: string;
  seo_description: string;
  slug: string;
  tags: string[];
  focus_keyword: string;
  notes: string[];
};

const localeLabels: Record<SeoLocale, string> = {
  vi: 'Vietnamese',
  en: 'English',
};

/**
 * POST /api/admin/seo-suggestions
 * Sinh gợi ý SEO bằng AI dựa trên bản nháp hiện tại của admin.
 *
 * Route này không thay thế kiến thức SEO của người biên tập; nó tạo metadata,
 * slug và tag đề xuất theo ngữ cảnh bài viết để admin review rồi mới lưu.
 */
export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const limited = rateLimit(request, 'admin-seo-suggestions', 40, 10 * 60 * 1000);
    if (limited) return limited;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        {
          code: 'seo_ai_unavailable',
          error: 'AI SEO suggestions are not configured. Set OPENAI_API_KEY on the server.',
        },
        { status: 503 },
        'private, no-store'
      );
    }

    const body = (await request.json().catch(() => ({}))) as SeoSuggestionBody;
    const locale = parseLocale(body.locale);
    if (!locale) {
      return jsonResponse(
        { code: 'invalid_seo_locale', error: 'locale must be vi or en.' },
        { status: 400 },
        'private, no-store'
      );
    }

    const source = {
      locale,
      title: sanitizeText(body.title, 180),
      excerpt: sanitizeLongText(body.excerpt, 700),
      contentText: stripHtml(sanitizeHtmlContent(body.content, 40000)).slice(0, 12000),
      category: sanitizeText(body.category, 80),
      tags: sanitizeTags(body.tags),
    };

    if (!source.title || (source.excerpt.length < 20 && source.contentText.length < 80)) {
      return jsonResponse(
        {
          code: 'invalid_seo_source',
          error: 'Title plus either a useful excerpt or enough body content are required before AI SEO suggestions.',
        },
        { status: 400 },
        'private, no-store'
      );
    }

    const result = await generateSeoSuggestions(apiKey, source);
    return jsonResponse(result, {}, 'private, no-store');
  } catch (error) {
    console.error('Admin SEO suggestion error:', error);
    return jsonResponse(
      {
        code: 'seo_suggestion_failed',
        error: error instanceof Error ? error.message : 'Could not generate SEO suggestions.',
      },
      { status: 502 },
      'private, no-store'
    );
  }
}

function parseLocale(value: unknown): SeoLocale | null {
  return value === 'vi' || value === 'en' ? value : null;
}

async function generateSeoSuggestions(
  apiKey: string,
  source: {
    locale: SeoLocale;
    title: string;
    excerpt: string;
    contentText: string;
    category: string;
    tags: string[];
  }
) {
  const model = process.env.OPENAI_SEO_MODEL || process.env.OPENAI_MODEL || 'gpt-5';
  const parsed = await requestOpenAIStructuredJson<SeoSuggestionResult>({
    apiKey,
    model,
    instructions: buildSeoInstructions(source.locale),
    input: source,
    schemaName: 'blog_seo_suggestions',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['seo_title', 'seo_description', 'slug', 'tags', 'focus_keyword', 'notes'],
      properties: {
        seo_title: { type: 'string' },
        seo_description: { type: 'string' },
        slug: { type: 'string' },
        tags: {
          type: 'array',
          minItems: 3,
          maxItems: 6,
          items: { type: 'string' },
        },
        focus_keyword: { type: 'string' },
        notes: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
          items: { type: 'string' },
        },
      },
    },
  });

  return sanitizeSeoSuggestion(parsed, source);
}

function buildSeoInstructions(locale: SeoLocale) {
  return [
    `Create practical SEO metadata for a technical blog post written in ${localeLabels[locale]}.`,
    'Return only JSON that matches the schema.',
    'Write naturally for senior software engineering readers; avoid keyword stuffing and clickbait.',
    'Keep seo_title between 30 and 60 characters when possible.',
    'Keep seo_description between 120 and 160 characters when possible.',
    'Create a lowercase ASCII slug with hyphens and no tracking parameters.',
    'Suggest 3-6 concise lowercase tags relevant to DevOps, Docker, networking, architecture, Git, security, database, or web engineering when applicable.',
    'Use notes to explain concrete SEO improvements, not generic encouragement.',
  ].join('\n');
}

function sanitizeSeoSuggestion(
  value: Partial<SeoSuggestionResult>,
  source: {
    title: string;
    excerpt: string;
    contentText: string;
    tags: string[];
  }
): SeoSuggestionResult {
  const seoTitle = sanitizeText(value.seo_title, 70);
  const seoDescription = sanitizeLongText(value.seo_description, 170);
  const slug = slugify(sanitizeText(value.slug, 100) || source.title).slice(0, 80);
  const tags = sanitizeTags(value.tags);
  const notes = sanitizeStringArray(value.notes, 5, 180);

  if (!seoTitle || seoDescription.length < 60) {
    throw new Error('AI SEO suggestions did not return enough usable metadata.');
  }

  return {
    seo_title: seoTitle,
    seo_description: seoDescription,
    slug: slug || slugify(source.title).slice(0, 80),
    tags: tags.length ? tags : source.tags.slice(0, 6),
    focus_keyword: sanitizeText(value.focus_keyword, 80) || seoTitle,
    notes: notes.length ? notes : ['Review keyword focus, title length, and meta description before publishing.'],
  };
}

function sanitizeTags(value: unknown) {
  const rawTags = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return [...new Set(
    rawTags
      .map((tag) => sanitizeText(tag, 40).toLowerCase())
      .filter(Boolean)
  )].slice(0, 6);
}

function sanitizeStringArray(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => sanitizeLongText(item, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
