import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';
import { canUseMockApiFallback, getMockCategories } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/categories
 * Lấy danh sách category từ các bài đã publish.
 *
 * Category là dữ liệu dẫn xuất từ bảng posts, không phải bảng riêng. Cache dài hơn
 * bài viết chi tiết vì danh sách category thay đổi ít và không chứa dữ liệu nhạy cảm.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockCategories(), {}, 'public, max-age=300');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('category')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString());

    if (error) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockCategories(), {}, 'public, max-age=300');
      }

      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    // Dedupe ở server để client nhận mảng category gọn, không phải xử lý thêm.
    const categories = Array.from(
      new Set(data?.map(post => post.category).filter(Boolean))
    );

    return jsonResponse(categories, {}, 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800');
  } catch (error) {
    console.error('API error:', error);
    if (canUseMockApiFallback()) {
      return jsonResponse(getMockCategories(), {}, 'public, max-age=300');
    }

    return supabaseFailureResponse(error);
  }
}
