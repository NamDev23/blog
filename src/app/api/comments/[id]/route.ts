import { NextRequest } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { hasAdminAccess, jsonResponse, PUBLIC_COMMENT_SELECT, requireAdmin, sanitizeLongText } from '@/lib/security';
import {
  ensureSupabaseConfigured,
  isSupabaseNotFoundError,
  supabaseFailureResponse,
} from '@/lib/supabaseRoute';

type CommentUpdateBody = {
  approved?: unknown;
  content?: unknown;
};

type CommentUpdateData = {
  approved?: boolean;
  content?: string;
};

/**
 * GET /api/comments/[id]
 * Lấy chi tiết một comment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isAdmin = hasAdminAccess(request);

    if (isAdmin) {
      const unavailable = ensureSupabaseConfigured(true);
      if (unavailable) return unavailable;
    } else if (!isSupabaseConfigured) {
      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isAdmin && isSupabaseAdminConfigured ? supabaseAdmin : supabase;

    let query = client
      .from('comments')
      .select(isAdmin ? '*' : PUBLIC_COMMENT_SELECT)
      .eq('id', id);

    if (!isAdmin) {
      query = query.eq('approved', true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (!isSupabaseNotFoundError(error)) {
        console.error('Supabase error:', error);
        return supabaseFailureResponse(error);
      }

      return jsonResponse(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    return jsonResponse(data, {}, isAdmin ? 'private, no-store' : 'public, max-age=30');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}

/**
 * PATCH /api/comments/[id]
 * Cập nhật comment (approve, edit content)
 * Body: { approved?, content? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const { id } = await params;
    const body = (await request.json()) as CommentUpdateBody;

    // Validate at least one field to update
    if (body.approved === undefined && body.content === undefined) {
      return jsonResponse(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: CommentUpdateData = {};

    if (body.approved !== undefined) {
      if (typeof body.approved !== 'boolean') {
        return jsonResponse(
          { error: 'approved must be a boolean' },
          { status: 400 }
        );
      }
      updateData.approved = body.approved;
    }

    if (body.content !== undefined) {
      if (typeof body.content !== 'string') {
        return jsonResponse(
          { error: 'content must be a string' },
          { status: 400 }
        );
      }

      const content = sanitizeLongText(body.content, 5000);

      if (content.trim().length < 3) {
        return jsonResponse(
          { error: 'Comment must be at least 3 characters long' },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    const { data, error } = await supabaseAdmin
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse(data, {}, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}

/**
 * DELETE /api/comments/[id]
 * Xóa comment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return supabaseFailureResponse(error);
    }

    return jsonResponse({ success: true, message: 'Comment deleted successfully' }, {}, 'private, no-store');
  } catch (error) {
    console.error('API error:', error);
    return supabaseFailureResponse(error);
  }
}
