import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { jsonResponse } from '@/lib/security';
import { canUseMockApiFallback, getMockTags } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/tags
 * Lấy danh sách tất cả tags với số lượng posts
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

    // Flatten all tags và đếm số lượng
    const tagCounts: Record<string, number> = {};
    
    data?.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // Convert to array và sort theo count
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
