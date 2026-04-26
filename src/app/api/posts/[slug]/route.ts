import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { hasAdminAccess, jsonResponse, requireAdmin } from '@/lib/security';
import { parsePostPayload } from '@/lib/postPayload';
import {
  isMissingPostTranslationsRelation,
  POST_SELECT_WITH_TRANSLATIONS,
  syncPostTranslations,
} from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

/**
 * GET /api/posts/[slug]
 * Lấy chi tiết một bài viết theo slug.
 *
 * Public request chỉ trả bài đã publish; admin request có thể đọc cả draft để
 * editor hoạt động. Fallback mock chỉ bật ở development và chỉ cho public path.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const isAdmin = hasAdminAccess(request);
    const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;

    if (isAdmin) {
      const unavailable = ensureSupabaseConfigured(true);
      if (unavailable) return unavailable;
    } else if (!isSupabaseConfigured) {
      if (mockPost) {
        return jsonResponse(mockPost, {}, 'public, max-age=60');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isAdmin && isSupabaseAdminConfigured ? supabaseAdmin : supabase;

    const buildQuery = (selectFields: string) => {
      // `.single()` giúp phân biệt rõ "không tìm thấy" với lỗi DB khác qua PGRST116.
      let query = client
        .from('posts')
        .select(selectFields)
        .eq('slug', slug);

      if (!isAdmin) {
        query = query
          .not('published_at', 'is', null)
          .lte('published_at', new Date().toISOString());
      }

      return query.single();
    };

    let { data, error } = await buildQuery(POST_SELECT_WITH_TRANSLATIONS);

    if (error && isMissingPostTranslationsRelation(error)) {
      ({ data, error } = await buildQuery('*'));
    }

    if (error) {
      if (!isAdmin && canUseMockApiFallback()) {
        if (mockPost) {
          return jsonResponse(mockPost, {}, 'public, max-age=60');
        }
      }

      if (isSupabaseNotFoundError(error)) {
        return jsonResponse(
          { error: 'Post not found' },
          { status: 404 },
          isAdmin ? 'private, no-store' : 'public, max-age=60'
        );
      }

      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(
      data,
      {},
      isAdmin ? 'private, no-store' : 'public, max-age=60, s-maxage=300, stale-while-revalidate=600'
    );
  } catch (error) {
    console.error('API error:', error);
    if (!hasAdminAccess(request) && canUseMockApiFallback()) {
      const { slug } = await params;
      const mockPost = getMockPostBySlug(slug);
      if (mockPost) return jsonResponse(mockPost, {}, 'public, max-age=60');
    }

    return supabaseFailureResponse(error);
  }
}

/**
 * PATCH /api/posts/[slug]
 * Cập nhật bài viết từ admin editor.
 *
 * `partial=true` cho phép gửi một phần field nhưng vẫn sanitize mọi field được
 * gửi lên. Slug trong URL là bản ghi hiện tại; slug mới nếu có nằm trong payload.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const { slug } = await params;
    const body = await request.json();
    const { payload, translations, errors } = parsePostPayload(body, true);

    if (errors.length > 0) {
      return jsonResponse({ error: errors.join(', ') }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .update(payload)
      .eq('slug', slug)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    const translationError = await syncPostTranslations(data.id, translations);
    if (translationError) {
      console.error('Post translation sync error:', translationError);
      return supabaseFailureResponse(translationError);
    }

    return jsonResponse(data, {}, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}

/**
 * DELETE /api/posts/[slug]
 * Xóa bài viết.
 *
 * Chỉ admin được gọi endpoint này. Nếu cần soft delete trong tương lai, thay
 * `.delete()` bằng field `deleted_at` để giữ lịch sử analytics/comment.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const { slug } = await params;

    const { error } = await supabaseAdmin
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse({ success: true }, {}, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
