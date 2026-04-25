import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import {
  hasAdminAccess,
  jsonResponse,
  PUBLIC_COMMENT_SELECT,
  sanitizeLongText,
  sanitizeText,
} from '@/lib/security';
import { canUseMockApiFallback } from '@/lib/mockApi';
import { ensureSupabaseConfigured, supabaseFailureResponse } from '@/lib/supabaseRoute';

/**
 * GET /api/comments
 * Lấy danh sách comments
 * Query params:
 * - post_id: Lọc theo bài viết
 * - approved: Lọc theo trạng thái approved (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');
    const approved = searchParams.get('approved');
    const isAdmin = hasAdminAccess(request);

    if (isAdmin) {
      const unavailable = ensureSupabaseConfigured(true);
      if (unavailable) return unavailable;
    } else if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse([], {}, 'public, max-age=30');
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isAdmin && isSupabaseAdminConfigured ? supabaseAdmin : supabase;

    // Bắt đầu query
    let query = client
      .from('comments')
      .select(isAdmin ? '*' : PUBLIC_COMMENT_SELECT)
      .order('created_at', { ascending: false });

    // Lọc theo post_id nếu có
    if (postId) {
      query = query.eq('post_id', postId);
    }

    // Lọc theo approved status nếu có
    if (isAdmin && approved !== null) {
      const isApproved = approved === 'true';
      query = query.eq('approved', isApproved);
    } else {
      query = query.eq('approved', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(
      data || [],
      {},
      isAdmin ? 'private, no-store' : 'public, max-age=30, s-maxage=180, stale-while-revalidate=300'
    );
  } catch (error) {
    console.error('API error:', error);
    if (!hasAdminAccess(request) && canUseMockApiFallback()) {
      return jsonResponse([], {}, 'public, max-age=30');
    }

    return supabaseFailureResponse(error);
  }
}

/**
 * POST /api/comments
 * Tạo comment mới
 * Body: { post_id, author_name, author_email, content }
 */
export async function POST(request: NextRequest) {
  try {
    const unavailable = ensureSupabaseConfigured(false);
    if (unavailable) return unavailable;

    const body = await request.json();

    // Validate required fields
    const post_id = sanitizeText(body.post_id, 80);
    const author_name = sanitizeText(body.author_name, 80);
    const author_email = sanitizeText(body.author_email, 254).toLowerCase();
    const content = sanitizeLongText(body.content, 5000);

    if (!post_id || !author_name || !author_email || !content) {
      return jsonResponse(
        { error: 'Missing required fields: post_id, author_name, author_email, content' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(author_email)) {
      return jsonResponse(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.trim().length < 3) {
      return jsonResponse(
        { error: 'Comment must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Insert comment (approved = false by default)
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        post_id,
        author_name,
        author_email,
        content: content.trim(),
        approved: false, // Cần admin approve
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(
      {
        id: data.id,
        post_id: data.post_id,
        author_name: data.author_name,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        message: 'Comment submitted successfully. It will be visible after approval.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
