import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { clampLimit, clampPage, hasAdminAccess, jsonResponse, requireAdmin, sanitizeSearch } from '@/lib/security';
import { parsePostPayload } from '@/lib/postPayload';
import { canUseMockApiFallback, getMockPosts } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/posts
 * Lấy danh sách tất cả bài viết
 * Query params:
 * - category: Lọc theo category
 * - search: Tìm kiếm theo title hoặc excerpt
 * - limit: Giới hạn số lượng kết quả
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = sanitizeSearch(searchParams.get('search'));
    const limit = searchParams.get('limit');
    const page = clampPage(searchParams.get('page'));
    const withMeta = searchParams.get('meta') === 'true';
    const status = searchParams.get('status');
    const isAdmin = hasAdminAccess(request);
    const limitNumber = limit ? clampLimit(limit, 24, isAdmin ? 100 : 48) : undefined;
    const offset = limitNumber ? (page - 1) * limitNumber : 0;

    if (isAdmin) {
      const unavailable = ensureSupabaseConfigured(true);
      if (unavailable) return unavailable;
    } else if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse(
          getMockPosts({ category, search, limit: limitNumber }),
          {},
          'public, max-age=30'
        );
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isAdmin && isSupabaseAdminConfigured ? supabaseAdmin : supabase;

    // Bắt đầu query
    let query = client
      .from('posts')
      .select('*', withMeta ? { count: 'exact' } : undefined)
      .order('published_at', { ascending: false });

    if (!isAdmin) {
      query = query
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString());
    } else if (status === 'published') {
      query = query.not('published_at', 'is', null);
    } else if (status === 'draft') {
      query = query.is('published_at', null);
    }

    // Lọc theo category nếu có
    if (category) {
      query = query.eq('category', category);
    }

    // Tìm kiếm nếu có
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Giới hạn số lượng nếu có
    if (limitNumber) {
      query = query.range(offset, offset + limitNumber - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      if (!isAdmin && canUseMockApiFallback()) {
        return jsonResponse(
          getMockPosts({
            category,
            search,
            limit: limitNumber,
          }),
          {},
          'public, max-age=30'
        );
      }

      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    const cacheControl = isAdmin ? 'private, no-store' : 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';

    if (withMeta && limitNumber) {
      return jsonResponse(
        {
          data: data || [],
          pagination: {
            page,
            limit: limitNumber,
            total: count || 0,
            totalPages: Math.max(1, Math.ceil((count || 0) / limitNumber)),
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
      return jsonResponse(getMockPosts(), {}, 'public, max-age=30');
    }

    return supabaseFailureResponse(error);
  }
}

/**
 * POST /api/posts
 * Tạo bài viết mới (cần authentication trong tương lai)
 */
export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const body = await request.json();
    const { payload, errors } = parsePostPayload(body);

    if (errors.length > 0) {
      return jsonResponse({ error: errors.join(', ') }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(data, { status: 201 }, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
