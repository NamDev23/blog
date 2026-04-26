import { createHmac } from 'crypto';
import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import {
  getClientIp,
  jsonResponse,
  rateLimit,
  requireSafeRequestOrigin,
  sanitizeText,
} from '@/lib/security';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

type ViewResponse = {
  view_count: number;
  counted: boolean;
  audited: boolean;
  source: 'database' | 'legacy' | 'mock';
};

const VIEW_WINDOW_MS = 30 * 60 * 1000;

/**
 * Endpoint đọc số view cho trang bài viết.
 *
 * Tách đọc và ghi là chủ ý: GET chỉ refresh số hiển thị khi polling realtime,
 * không tạo view mới. POST mới là endpoint được phép ghi audit record/counter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await getSafeSlug(params);
    if (!slug) {
      return jsonResponse({ error: 'Invalid post slug' }, { status: 400 }, 'private, no-store');
    }

    const viewCount = await getPublishedPostViewCount(slug);
    if (viewCount === null) {
      return jsonResponse({ error: 'Post not found' }, { status: 404 }, 'private, no-store');
    }

    return jsonResponse<ViewResponse>(
      { view_count: viewCount, counted: false, audited: false, source: isSupabaseConfigured ? 'database' : 'mock' },
      {},
      'private, no-store'
    );
  } catch (error) {
    console.error('Post view read API error:', error);
    return supabaseFailureResponse(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const { slug } = await getSafeSlug(params);
    if (!slug) {
      return jsonResponse({ error: 'Invalid post slug' }, { status: 400 }, 'private, no-store');
    }

    if (!isSupabaseConfigured) {
      const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;
      if (mockPost) {
        return jsonResponse<ViewResponse>(
          { view_count: mockPost.view_count, counted: false, audited: false, source: 'mock' },
          {},
          'private, no-store'
        );
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    // Unique key trong database mới là nguồn sự thật để chống đếm trùng. Rate
    // limit in-memory chỉ là lớp rẻ phía trước để giảm refresh spam trước khi
    // request chạm Supabase.
    const limited = rateLimit(request, `post-view:${slug}`, 4, VIEW_WINDOW_MS);
    if (limited) {
      const viewCount = await getPublishedPostViewCount(slug);
      return jsonResponse<ViewResponse>(
        { view_count: viewCount ?? 0, counted: false, audited: false, source: 'database' },
        {},
        'private, no-store'
      );
    }

    const result = await trackPostView(request, slug);
    if (result.view_count === null) {
      return jsonResponse({ error: 'Post not found' }, { status: 404 }, 'private, no-store');
    }

    return jsonResponse<ViewResponse>(
      {
        view_count: result.view_count,
        counted: result.counted,
        audited: result.audited,
        source: result.audited ? 'database' : 'legacy',
      },
      {},
      'private, no-store'
    );
  } catch (error) {
    console.error('Post view API error:', error);
    return supabaseFailureResponse(error);
  }
}

async function getSafeSlug(params: Promise<{ slug: string }>) {
  const { slug: rawSlug } = await params;
  const slug = sanitizeText(rawSlug, 180);
  return { slug: /^[a-z0-9-]+$/.test(slug) ? slug : '' };
}

async function trackPostView(
  request: NextRequest,
  slug: string
): Promise<{ view_count: number; counted: boolean; audited: boolean } | { view_count: null; counted: false; audited: false }> {
  const viewMetadata = getViewMetadata(request);
  const rpcClient = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
  const { data, error } = await rpcClient.rpc('track_post_view', {
    p_post_slug: slug,
    p_visitor_hash: viewMetadata.visitorHash,
    p_ip_hash: viewMetadata.ipHash,
    p_user_agent_hash: viewMetadata.userAgentHash,
    p_view_bucket: viewMetadata.viewBucket,
    p_referrer: viewMetadata.referrer,
    p_locale: viewMetadata.locale,
    p_path: viewMetadata.path,
  });

  if (!error && Array.isArray(data) && data[0]) {
    return {
      view_count: Number(data[0].view_count || 0),
      counted: Boolean(data[0].counted),
      audited: true,
    };
  }

  if (error) {
    console.error('Post view RPC failed:', error);
  }

  const fallback = await legacyIncrementOrRead(slug);
  return fallback;
}

async function legacyIncrementOrRead(slug: string) {
  // Khi deploy, code có thể lên trước migration SQL. Fallback giữ sản phẩm vẫn
  // chạy được, nhưng response đánh dấu `audited: false` để admin biết flow đếm
  // view chuẩn qua bảng `post_views` chưa hoạt động.
  if (!isSupabaseAdminConfigured) {
    const currentCount = await getPublishedPostViewCount(slug);
    return currentCount === null
      ? { view_count: null, counted: false as const, audited: false as const }
      : { view_count: currentCount, counted: false, audited: false };
  }

  const currentCount = await getPublishedPostViewCount(slug);
  if (currentCount === null) {
    return { view_count: null, counted: false as const, audited: false as const };
  }

  const { data: updatedPost, error: updateError } = await supabaseAdmin
    .from('posts')
    .update({ view_count: currentCount + 1 })
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .select('view_count')
    .single();

  if (updateError) throw updateError;

  return {
    view_count: Number(updatedPost?.view_count ?? currentCount + 1),
    counted: true,
    audited: false,
  };
}

async function getPublishedPostViewCount(slug: string) {
  if (!isSupabaseConfigured) {
    const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;
    return mockPost ? mockPost.view_count : null;
  }

  const client = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
  const { data, error } = await client
    .from('posts')
    .select('view_count')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    if (isSupabaseNotFoundError(error)) return null;
    throw error;
  }

  return Number(data?.view_count ?? 0);
}

function getViewMetadata(request: NextRequest) {
  // Lưu HMAC hash thay vì IP/User-Agent thô để bảo vệ riêng tư. Bucket 30 phút
  // giúp database đảm bảo mỗi visitor chỉ được tính một view cho mỗi bài trong
  // một cửa sổ thời gian, nhưng vẫn đủ tín hiệu để audit/debug.
  const clientIp = getClientIp(request);
  const userAgent = sanitizeText(request.headers.get('user-agent'), 240) || 'unknown';
  const referrer = normalizeReferrer(request.headers.get('referer'));
  const viewBucket = new Date(Math.floor(Date.now() / VIEW_WINDOW_MS) * VIEW_WINDOW_MS).toISOString();
  const path = referrer?.path || sanitizeText(request.nextUrl.pathname, 500);
  const locale = extractLocale(path);

  return {
    visitorHash: hashViewValue(`visitor:${clientIp}:${userAgent}`),
    ipHash: hashViewValue(`ip:${clientIp}`),
    userAgentHash: hashViewValue(`ua:${userAgent}`),
    viewBucket,
    referrer: referrer?.value || '',
    locale,
    path,
  };
}

function normalizeReferrer(value: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return {
      value: sanitizeText(`${url.origin}${url.pathname}`, 500),
      path: sanitizeText(url.pathname, 500),
    };
  } catch {
    const safeValue = sanitizeText(value, 500);
    return safeValue ? { value: safeValue, path: '' } : null;
  }
}

function extractLocale(path: string) {
  const match = path.match(/^\/(vi|en)(?:\/|$)/);
  return match?.[1] || '';
}

function hashViewValue(value: string) {
  const secret =
    process.env.VIEW_TRACKING_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_API_KEY ||
    'shadowdev-view-tracking-dev-secret';

  return createHmac('sha256', secret).update(value).digest('hex');
}
