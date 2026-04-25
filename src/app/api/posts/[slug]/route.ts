import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { hasAdminAccess, jsonResponse, requireAdmin } from '@/lib/security';
import { parsePostPayload } from '@/lib/postPayload';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

/**
 * GET /api/posts/[slug]
 * Lấy chi tiết một bài viết theo slug
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

    let query = client
      .from('posts')
      .select('*')
      .eq('slug', slug);

    if (!isAdmin) {
      query = query
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString());
    }

    const { data, error } = await query.single();

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
 * Cập nhật bài viết (cần authentication trong tương lai)
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
    const { payload, errors } = parsePostPayload(body, true);

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

    return jsonResponse(data, {}, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}

/**
 * DELETE /api/posts/[slug]
 * Xóa bài viết (cần authentication trong tương lai)
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
