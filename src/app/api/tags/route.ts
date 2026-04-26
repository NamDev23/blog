import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';
import { canUseMockApiFallback, getMockTags } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/tags
 * Lấy danh sách tag và số bài đã publish theo từng tag.
 *
 * Tag count dùng cho trang Tags và filter blog. Chỉ đếm bài public để số liệu trên
 * UI không tiết lộ draft hoặc bài hẹn giờ.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockTags(), {}, 'public, max-age=300');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const { data, error } = await supabase
      .from('posts')
      .select('tags')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString());

    if (error) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockTags(), {}, 'public, max-age=300');
      }

      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    // Flatten toàn bộ mảng tags rồi đếm số lần xuất hiện.
    const tagCounts: Record<string, number> = {};
    
    data?.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Sort giảm dần để chủ đề phổ biến hiển thị trước.
    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return jsonResponse(tags, {}, 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800');
  } catch (error) {
    console.error('API error:', error);
    if (canUseMockApiFallback()) {
      return jsonResponse(getMockTags(), {}, 'public, max-age=300');
    }

    return supabaseFailureResponse(error);
  }
}
