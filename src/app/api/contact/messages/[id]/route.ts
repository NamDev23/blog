import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { jsonResponse, requireAdmin, sanitizeText } from '@/lib/security';
import { ensureSupabaseConfigured } from '@/lib/supabaseRoute';

type MessageUpdateBody = {
  status?: unknown;
};

const allowedStatuses = new Set(['new', 'read', 'archived']);

/**
 * PATCH /api/contact/messages/[id]
 * Cập nhật trạng thái xử lý tin nhắn trong admin inbox.
 *
 * Status dùng enum mềm (`new`, `read`, `archived`) để dashboard có thể lọc nhanh
 * mà chưa cần hệ thống ticket phức tạp.
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
    const body = (await request.json()) as MessageUpdateBody;
    const status = sanitizeText(body.status, 20);

    // Allowlist tránh ghi trạng thái tùy ý vào DB và giữ UI filter nhất quán.
    if (!allowedStatuses.has(status)) {
      return jsonResponse(
        { code: 'invalid_message_status', error: 'status must be new, read, or archived' },
        { status: 400 },
        'private, no-store'
      );
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Contact message update error:', error);
      return contactInboxUnavailable();
    }

    return jsonResponse(data, {}, 'private, no-store');
  } catch (error) {
    console.error('Contact message update API error:', error);
    return contactInboxUnavailable();
  }
}

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
    // Hiện tại delete là xóa cứng. Nếu cần audit trail, đổi sang archived/deleted_at.
    const { error } = await supabaseAdmin
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Contact message delete error:', error);
      return contactInboxUnavailable();
    }

    return jsonResponse({ success: true }, {}, 'private, no-store');
  } catch (error) {
    console.error('Contact message delete API error:', error);
    return contactInboxUnavailable();
  }
}

function contactInboxUnavailable() {
  return jsonResponse(
    {
      code: 'contact_inbox_unavailable',
      error: 'Contact inbox is not available. Apply supabase/schema.sql to the database.',
    },
    { status: 503 },
    'private, no-store'
  );
}
