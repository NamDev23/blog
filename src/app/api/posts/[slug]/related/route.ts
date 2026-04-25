import { NextRequest } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { clampLimit, jsonResponse } from '@/lib/security';
import { canUseMockApiFallback, getMockRelatedPosts } from '@/lib/mockApi';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

/**
 * GET /api/posts/[slug]/related
 * Lấy bài viết liên quan dựa trên tags và category
 * Algorithm:
 * 1. Lấy post hiện tại
 * 2. Tìm posts có cùng tags (ưu tiên)
 * 3. Tìm posts có cùng category
 * 4. Sắp xếp theo số lượng tags trùng khớp
 * 5. Giới hạn số lượng kết quả
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = clampLimit(searchParams.get('limit'), 3, 8);
    const mockRelatedPosts = canUseMockApiFallback() ? getMockRelatedPosts(slug, limit) : null;

    if (!isSupabaseConfigured) {
      if (mockRelatedPosts) {
        return jsonResponse(mockRelatedPosts, {}, 'public, max-age=120');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    // 1. Lấy post hiện tại
    const { data: currentPost, error: currentError } = await supabase
      .from('posts')
      .select('id, category, tags')
      .eq('slug', slug)
      .single();

    if (currentError || !currentPost) {
      if (mockRelatedPosts) {
        return jsonResponse(mockRelatedPosts, {}, 'public, max-age=120');
      }

      if (currentError && !isSupabaseNotFoundError(currentError)) {
        console.error('Supabase error:', currentError);
        return supabaseFailureResponse(currentError);
      }

      return jsonResponse({ error: 'Post not found' }, { status: 404 }, 'public, max-age=120');
    }

    // 2. Lấy tất cả posts khác (đã publish)
    const { data: allPosts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .neq('id', currentPost.id)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (postsError) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockRelatedPosts(slug, limit) || [], {}, 'public, max-age=120');
      }

      console.error('Supabase error:', postsError);
      return supabaseFailureResponse(postsError);
    }

    if (!allPosts || allPosts.length === 0) {
      return jsonResponse([], {}, 'public, max-age=120');
    }

    // 3. Tính điểm relevance cho mỗi post
    const postsWithScore = allPosts.map(post => {
      let score = 0;

      // Cùng category: +10 điểm
      if (post.category === currentPost.category) {
        score += 10;
      }

      // Tính số tags trùng khớp
      const currentTags = (currentPost.tags || []) as string[];
      const postTags = (post.tags || []) as string[];
      const matchingTags = currentTags.filter(tag => postTags.includes(tag));
      
      // Mỗi tag trùng: +5 điểm
      score += matchingTags.length * 5;

      return {
        ...post,
        relevanceScore: score,
        matchingTags: matchingTags.length,
      };
    });

    // 4. Sắp xếp theo điểm relevance (cao nhất trước)
    const sortedPosts = postsWithScore
      .filter(post => post.relevanceScore > 0) // Chỉ lấy posts có điểm > 0
      .sort((a, b) => {
        // Ưu tiên điểm cao hơn
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        // Nếu điểm bằng nhau, ưu tiên bài mới hơn
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });

    // 5. Nếu không đủ posts có relevance, thêm posts mới nhất
    let relatedPosts = sortedPosts.slice(0, limit);
    
    if (relatedPosts.length < limit) {
      const remainingCount = limit - relatedPosts.length;
      const recentPosts = allPosts
        .filter(post => !relatedPosts.find(rp => rp.id === post.id))
        .slice(0, remainingCount);
      
      relatedPosts = [...relatedPosts, ...recentPosts];
    }

    // 6. Remove relevanceScore và matchingTags trước khi return
    const cleanedPosts = relatedPosts.map((post) => {
      const cleanedPost = { ...post };
      delete cleanedPost.relevanceScore;
      delete cleanedPost.matchingTags;
      return cleanedPost;
    });

    return jsonResponse(cleanedPosts, {}, 'public, max-age=120, s-maxage=600, stale-while-revalidate=900');
  } catch (error) {
    console.error('API error:', error);
    if (canUseMockApiFallback()) {
      const { slug } = await params;
      return jsonResponse(getMockRelatedPosts(slug, 3) || [], {}, 'public, max-age=120');
    }

    return supabaseFailureResponse(error);
  }
}
