import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { canUseMockApiFallback, getMockPostBySlug } from '@/lib/mockApi';
import { jsonResponse, rateLimit, requireSafeRequestOrigin, sanitizeText } from '@/lib/security';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

type ViewResponse = {
  view_count: number;
  counted: boolean;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const { slug: rawSlug } = await params;
    const slug = sanitizeText(rawSlug, 180);

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return jsonResponse({ error: 'Invalid post slug' }, { status: 400 }, 'private, no-store');
    }

    if (!isSupabaseConfigured) {
      const mockPost = canUseMockApiFallback() ? getMockPostBySlug(slug) : null;
      if (mockPost) {
        return jsonResponse<ViewResponse>(
          { view_count: mockPost.view_count, counted: false },
          {},
          'private, no-store'
        );
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const limited = rateLimit(request, `post-view:${slug}`, 1, 30 * 60 * 1000);
    if (limited) {
      const viewCount = await getPublishedPostViewCount(slug);
      return jsonResponse<ViewResponse>(
        { view_count: viewCount ?? 0, counted: false },
        {},
        'private, no-store'
      );
    }

    const result = await incrementPostView(slug);
    if (result.view_count === null) {
      return jsonResponse({ error: 'Post not found' }, { status: 404 }, 'private, no-store');
    }

    return jsonResponse<ViewResponse>(result, {}, 'private, no-store');
  } catch (error) {
    console.error('Post view API error:', error);
    return supabaseFailureResponse(error);
  }
}

async function incrementPostView(slug: string): Promise<ViewResponse | { view_count: null; counted: false }> {
  const rpcClient = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
  const { data, error } = await rpcClient.rpc('increment_post_view', { post_slug: slug });

  if (!error && typeof data === 'number') {
    if (data === 0) {
      const currentCount = await getPublishedPostViewCount(slug);
      return currentCount === null
        ? { view_count: null, counted: false }
        : { view_count: currentCount, counted: false };
    }

    return { view_count: data, counted: true };
  }

  if (error) {
    console.error('Post view RPC failed:', error);
  }

  if (!isSupabaseAdminConfigured) {
    const currentCount = await getPublishedPostViewCount(slug);
    return currentCount === null
      ? { view_count: null, counted: false }
      : { view_count: currentCount, counted: false };
  }

  const currentCount = await getPublishedPostViewCount(slug);
  if (currentCount === null) {
    return { view_count: null, counted: false };
  }

  const { data: updatedPost, error: updateError } = await supabaseAdmin
    .from('posts')
    .update({ view_count: currentCount + 1 })
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .select('view_count')
    .single();

  if (updateError) throw updateError;

  return {
    view_count: Number(updatedPost?.view_count ?? currentCount + 1),
    counted: true,
  };
}

async function getPublishedPostViewCount(slug: string) {
  const client = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
  const { data, error } = await client
    .from('posts')
    .select('view_count')
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    if (isSupabaseNotFoundError(error)) return null;
    throw error;
  }

  return Number(data?.view_count ?? 0);
}
