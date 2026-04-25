import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';
import { canUseMockApiFallback, getMockCategories } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/categories
 * Lấy danh sách tất cả categories từ posts
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

    // Lấy unique categories
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
