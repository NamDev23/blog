import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { clampLimit, clampPage, hasAdminAccess, jsonResponse, requireAdmin, sanitizeSearch } from '@/lib/security';
import { parsePostPayload } from '@/lib/postPayload';
import {
  isMissingPostTranslationsRelation,
  POST_SELECT_WITH_TRANSLATIONS,
  syncPostTranslations,
} from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockPosts } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/posts
 * Lấy danh sách bài viết cho public blog và admin dashboard.
 *
 * Public request chỉ thấy bài đã publish và có thể cache ngắn. Admin request
 * được nhận diện bằng API key/cookie session, dùng service role và có thể lọc cả
 * draft/published. Khi `meta=true`, API trả thêm pagination để UI không phải tải
 * toàn bộ bảng.
 *
 * Query params:
 * - category: Lọc theo category
 * - search: Tìm kiếm theo title hoặc excerpt
 * - limit: Giới hạn số lượng kết quả
 * - page/meta/status: dùng cho pagination và màn hình admin
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

    // Admin route không fallback mock để tránh người quản trị tưởng dữ liệu mẫu là dữ liệu thật.
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

    const buildQuery = (selectFields: string) => {
      // Query được xây dựng theo role để tránh public đọc draft hoặc bài hẹn giờ.
      let query = client
        .from('posts')
        .select(selectFields, withMeta ? { count: 'exact' } : undefined)
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

      if (category) {
        query = query.eq('category', category);
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
      }

      if (limitNumber) {
        query = query.range(offset, offset + limitNumber - 1);
      }

      return query;
    };

    let { data, error, count } = await buildQuery(POST_SELECT_WITH_TRANSLATIONS);

    if (error && isMissingPostTranslationsRelation(error)) {
      // Cho phép admin/public API tiếp tục hoạt động trước khi migration translation
      // được apply. Sau migration, query relation sẽ tự trả dữ liệu song ngữ.
      ({ data, error, count } = await buildQuery('*'));
    }

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
 * Tạo bài viết mới từ admin editor.
 *
 * Body không được insert trực tiếp; `parsePostPayload` chịu trách nhiệm sanitize,
 * chuẩn hóa slug/tags/date và trả lỗi validation trước khi ghi Supabase.
 */
export async function POST(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const body = await request.json();
    const { payload, translations, errors } = parsePostPayload(body);

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

    const translationError = await syncPostTranslations(data.id, translations);
    if (translationError) {
      console.error('Post translation sync error:', translationError);
      return supabaseFailureResponse(translationError);
    }

    return jsonResponse(data, { status: 201 }, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
