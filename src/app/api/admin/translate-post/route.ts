import { NextRequest } from 'next/server';
import { sanitizeHtmlContent } from '@/lib/htmlSanitizer';
import { requestOpenAIStructuredJson } from '@/lib/openaiStructured';
import {
  jsonResponse,
  rateLimit,
  requireAdmin,
  requireSafeRequestOrigin,
  sanitizeLongText,
  sanitizeText,
} from '@/lib/security';

type TranslationLocale = 'vi' | 'en';

type TranslatePostBody = {
  source_locale?: unknown;
  target_locale?: unknown;
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
};

type TranslationResult = {
  title: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
};

const localeLabels: Record<TranslationLocale, string> = {
  vi: 'Vietnamese',
  en: 'English',
};

/**
 * POST /api/admin/translate-post
 * Tạo bản dịch bài viết cho admin CMS bằng OpenAI Responses API.
 *
 * Endpoint này chỉ dành cho admin, không public. API nhận một bản ngôn ngữ nguồn,
 * yêu cầu model dịch sang ngôn ngữ đích, giữ nguyên HTML/code block và trả JSON
 * đã sanitize để editor có thể điền vào tab còn lại.
 */
export async function POST(request: NextRequest) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const limited = rateLimit(request, 'admin-translate-post', 30, 10 * 60 * 1000);
    if (limited) return limited;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return jsonResponse(
        {
          code: 'translation_ai_unavailable',
          error: 'AI translation is not configured. Set OPENAI_API_KEY on the server.',
        },
        { status: 503 },
        'private, no-store'
      );
    }

    const body = (await request.json().catch(() => ({}))) as TranslatePostBody;
    const sourceLocale = parseLocale(body.source_locale);
    const targetLocale = parseLocale(body.target_locale);

    if (!sourceLocale || !targetLocale || sourceLocale === targetLocale) {
      return jsonResponse(
        { code: 'invalid_translation_locale', error: 'source_locale and target_locale must be vi/en and different.' },
        { status: 400 },
        'private, no-store'
      );
    }

    const source = {
      title: sanitizeText(body.title, 180),
      excerpt: sanitizeLongText(body.excerpt, 500),
      content: sanitizeHtmlContent(body.content, 100000),
      seo_title: sanitizeText(body.seo_title, 70),
      seo_description: sanitizeLongText(body.seo_description, 170),
    };

    if (!source.title || source.excerpt.length < 20 || source.content.length < 20) {
      return jsonResponse(
        {
          code: 'invalid_translation_source',
          error: 'Source title, excerpt, and content are required before AI translation.',
        },
        { status: 400 },
        'private, no-store'
      );
    }

    const result = await translatePostWithOpenAI(apiKey, sourceLocale, targetLocale, source);
    return jsonResponse(result, {}, 'private, no-store');
  } catch (error) {
    console.error('Admin post translation error:', error);
    return jsonResponse(
      {
        code: 'translation_failed',
        error: error instanceof Error ? error.message : 'Could not generate the translation.',
      },
      { status: 502 },
      'private, no-store'
    );
  }
}

function parseLocale(value: unknown): TranslationLocale | null {
  return value === 'vi' || value === 'en' ? value : null;
}

async function translatePostWithOpenAI(
  apiKey: string,
  sourceLocale: TranslationLocale,
  targetLocale: TranslationLocale,
  source: TranslationResult
) {
  const model = process.env.OPENAI_TRANSLATION_MODEL || process.env.OPENAI_MODEL || 'gpt-5';
  const parsed = await requestOpenAIStructuredJson<TranslationResult>({
    apiKey,
    model,
    instructions: buildTranslationInstructions(sourceLocale, targetLocale),
    input: {
      source_locale: sourceLocale,
      target_locale: targetLocale,
      title: source.title,
      excerpt: source.excerpt,
      content: source.content,
      seo_title: source.seo_title,
      seo_description: source.seo_description,
    },
    schemaName: 'localized_blog_post',
    schema: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'excerpt', 'content', 'seo_title', 'seo_description'],
      properties: {
        title: { type: 'string' },
        excerpt: { type: 'string' },
        content: { type: 'string' },
        seo_title: { type: 'string' },
        seo_description: { type: 'string' },
      },
    },
  });

  return sanitizeTranslationResult(parsed);
}

function buildTranslationInstructions(sourceLocale: TranslationLocale, targetLocale: TranslationLocale) {
  return [
    `Translate a technical blog post from ${localeLabels[sourceLocale]} to ${localeLabels[targetLocale]}.`,
    'Return only JSON that matches the schema.',
    'Preserve the original HTML structure: keep tags, heading levels, lists, links, tables, and code/pre blocks.',
    'Do not translate code, command output, package names, API identifiers, URLs, environment variable names, or file paths.',
    'Use natural expert-level technical writing, not literal word-by-word translation.',
    'Keep the meaning precise for DevOps, Docker, networking, architecture, Git, security, database, and web engineering topics.',
    'Make seo_title concise and search-friendly, ideally 30-60 characters.',
    'Make seo_description useful for search results, ideally 120-160 characters.',
  ].join('\n');
}

function sanitizeTranslationResult(value: Partial<TranslationResult>): TranslationResult {
  const result = {
    title: sanitizeText(value.title, 180),
    excerpt: sanitizeLongText(value.excerpt, 500),
    content: sanitizeHtmlContent(value.content, 100000),
    seo_title: sanitizeText(value.seo_title, 70),
    seo_description: sanitizeLongText(value.seo_description, 170),
  };

  if (!result.title || result.excerpt.length < 20 || result.content.length < 20) {
    throw new Error('AI translation did not return enough usable content.');
  }

  return {
    ...result,
    seo_title: result.seo_title || result.title.slice(0, 70),
    seo_description: result.seo_description || result.excerpt.slice(0, 170),
  };
}
