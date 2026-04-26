import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import {
  hasAdminAccess,
  jsonResponse,
  PUBLIC_COMMENT_SELECT,
  rateLimit,
  requireSafeRequestOrigin,
  clampLimit,
  clampPage,
  sanitizeLongText,
  sanitizeText,
} from '@/lib/security';
import { canUseMockApiFallback } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/comments
 * Lấy danh sách comments.
 *
 * Public request chỉ thấy comment đã duyệt và không nhận email. Admin request
 * dùng service role, có pagination metadata và được xem email để kiểm duyệt.
 *
 * Query params:
 * - post_id: Lọc theo bài viết
 * - approved: Lọc theo trạng thái approved (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');
    const approved = searchParams.get('approved');
    const isAdmin = hasAdminAccess(request);
    const page = clampPage(searchParams.get('page'));
    const limit = clampLimit(searchParams.get('limit'), isAdmin ? 12 : 24, isAdmin ? 100 : 48);
    const withMeta = searchParams.get('meta') === 'true';
    const offset = (page - 1) * limit;

    if (isAdmin) {
      const unavailable = ensureSupabaseConfigured(true);
      if (unavailable) return unavailable;
    } else if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse([], {}, 'public, max-age=30');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isAdmin && isSupabaseAdminConfigured ? supabaseAdmin : supabase;

    // Public select dùng whitelist để không lộ author_email ra client.
    let query = client
      .from('comments')
      .select(isAdmin ? '*' : PUBLIC_COMMENT_SELECT, withMeta ? { count: 'exact' } : undefined)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postId) {
      query = query.eq('post_id', postId);
    }

    if (isAdmin && approved !== null) {
      const isApproved = approved === 'true';
      query = query.eq('approved', isApproved);
    } else if (!isAdmin) {
      query = query.eq('approved', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return jsonResponse(
        { code: 'comment_storage_unavailable', error: 'Comment storage is temporarily unavailable.' },
        { status: 503 },
        'private, no-store'
      );
    }

    const cacheControl = isAdmin ? 'private, no-store' : 'public, max-age=30, s-maxage=180, stale-while-revalidate=300';

    if (withMeta) {
      return jsonResponse(
        {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
          },
        },
        {},
        cacheControl
      );
    }

    return jsonResponse(data || [], {}, cacheControl);
  } catch (error) {
    console.error('API error:', error);
    if (!hasAdminAccess(request) && canUseMockApiFallback()) {
      return jsonResponse([], {}, 'public, max-age=30');
    }

    return supabaseFailureResponse(error);
  }
}

/**
 * POST /api/comments
 * Tạo comment mới từ form public.
 *
 * Endpoint này có origin check, rate limit, sanitize input và mặc định
 * `approved=false` để admin duyệt trước khi hiển thị.
 *
 * Body: { post_id, author_name, author_email, content }
 */
export async function POST(request: NextRequest) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const limited = rateLimit(request, 'comment-create', 10, 10 * 60 * 1000);
    if (limited) return limited;

    const unavailable = ensureSupabaseConfigured(false);
    if (unavailable) return unavailable;

    const body = await request.json();

    // Validate phía server là bắt buộc; validate phía client chỉ để UX tốt hơn.
    const post_id = sanitizeText(body.post_id, 80);
    const author_name = sanitizeText(body.author_name, 80);
    const author_email = sanitizeText(body.author_email, 254).toLowerCase();
    const content = sanitizeLongText(body.content, 5000);

    if (!post_id || !author_name || !author_email || !content) {
      return jsonResponse(
        {
          code: 'invalid_comment_payload',
          error: 'Missing required fields: post_id, author_name, author_email, content',
        },
        { status: 400 },
        'private, no-store'
      );
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(author_email)) {
      return jsonResponse(
        { code: 'invalid_email', error: 'Invalid email format' },
        { status: 400 },
        'private, no-store'
      );
    }

    if (content.trim().length < 3) {
      return jsonResponse(
        { code: 'comment_too_short', error: 'Comment must be at least 3 characters long' },
        { status: 400 },
        'private, no-store'
      );
    }

    // Nếu service role có cấu hình thì dùng admin client để ghi ổn định với RLS.
    const writeClient = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
    const { data, error } = await writeClient
      .from('comments')
      .insert([{
        post_id,
        author_name,
        author_email,
        content: content.trim(),
        approved: false, // Cần admin approve
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(
      {
        id: data.id,
        post_id: data.post_id,
        author_name: data.author_name,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        code: 'comment_pending_review',
        message: 'Comment submitted successfully. It will be visible after approval.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
