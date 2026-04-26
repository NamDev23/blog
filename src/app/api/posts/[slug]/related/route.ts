import { NextRequest } from 'next/server';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { clampLimit, jsonResponse } from '@/lib/security';
import { isMissingPostTranslationsRelation, POST_SELECT_WITH_TRANSLATIONS } from '@/lib/postTranslationStorage';
import { canUseMockApiFallback, getMockRelatedPosts } from '@/lib/mockApi';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';
import type { Post } from '@/types';

/**
 * GET /api/posts/[slug]/related
 * Lấy bài viết liên quan dựa trên tags và category.
 *
 * Thuật toán hiện tại ưu tiên tính dễ hiểu:
 * - cùng category: +10 điểm;
 * - mỗi tag trùng: +5 điểm;
 * - nếu chưa đủ số lượng thì bù bằng bài mới nhất.
 *
 * Khi dữ liệu lớn hơn, nên chuyển scoring này thành SQL/RPC để không phải kéo
 * toàn bộ bài viết về server trước khi sort.
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

    // Lấy tín hiệu của bài hiện tại trước, sau đó mới query danh sách ứng viên.
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

    // Chỉ bài đã publish mới được xuất hiện trong related posts public.
    const buildRelatedQuery = (selectFields: string) =>
      supabase
        .from('posts')
        .select(selectFields)
        .neq('id', currentPost.id)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    let { data: allPosts, error: postsError } = await buildRelatedQuery(POST_SELECT_WITH_TRANSLATIONS);

    if (postsError && isMissingPostTranslationsRelation(postsError)) {
      ({ data: allPosts, error: postsError } = await buildRelatedQuery('*'));
    }

    if (postsError) {
      if (canUseMockApiFallback()) {
        return jsonResponse(getMockRelatedPosts(slug, limit) || [], {}, 'public, max-age=120');
      }

      console.error('Supabase error:', postsError);
      return supabaseFailureResponse(postsError);
    }

    type ScoredPost = Post & { relevanceScore: number; matchingTags: number };
    const candidatePosts = (allPosts || []) as unknown as Post[];

    if (candidatePosts.length === 0) {
      return jsonResponse([], {}, 'public, max-age=120');
    }

    const postsWithScore: ScoredPost[] = candidatePosts.map(post => {
      let score = 0;

      // Category là tín hiệu rộng nhưng ổn định.
      if (post.category === currentPost.category) {
        score += 10;
      }

      const currentTags = (currentPost.tags || []) as string[];
      const postTags = (post.tags || []) as string[];
      const matchingTags = currentTags.filter(tag => postTags.includes(tag));
      
      // Tag là tín hiệu cụ thể hơn nên cộng theo số lượng trùng.
      score += matchingTags.length * 5;

      return {
        ...post,
        relevanceScore: score,
        matchingTags: matchingTags.length,
      };
    });

    const sortedPosts = postsWithScore
      .filter(post => post.relevanceScore > 0)
      .sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      });

    // Nếu không đủ bài cùng chủ đề, bù bằng bài mới nhất để UI không bị trống.
    let relatedPosts: ScoredPost[] = sortedPosts.slice(0, limit);
    
    if (relatedPosts.length < limit) {
      const remainingCount = limit - relatedPosts.length;
      const recentPosts = candidatePosts
        .filter(post => !relatedPosts.find(rp => rp.id === post.id))
        .slice(0, remainingCount)
        .map((post) => ({
          ...post,
          relevanceScore: 0,
          matchingTags: 0,
        }));
      
      relatedPosts = [...relatedPosts, ...recentPosts];
    }

    // Không trả metadata scoring ra public API vì client không cần biết chi tiết này.
    const cleanedPosts = relatedPosts.map((post) => {
      const cleanedPost = { ...post } as Partial<ScoredPost>;
      delete cleanedPost.relevanceScore;
      delete cleanedPost.matchingTags;
      return cleanedPost as Post;
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
