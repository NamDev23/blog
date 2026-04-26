import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { clampLimit, clampPage, jsonResponse, requireAdmin } from '@/lib/security';
import { ensureSupabaseConfigured } from '@/lib/supabaseRoute';

const messageStatuses = new Set(['new', 'read', 'archived']);

export async function GET(request: NextRequest) {
  try {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const unavailable = ensureSupabaseConfigured(true);
    if (unavailable) return unavailable;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = clampPage(searchParams.get('page'));
    const limit = clampLimit(searchParams.get('limit'), 12, 100);
    const withMeta = searchParams.get('meta') === 'true';
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('contact_messages')
      .select('*', withMeta ? { count: 'exact' } : undefined)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && messageStatuses.has(status)) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Contact messages query error:', error);
      return contactInboxUnavailable();
    }

    if (withMeta) {
      return jsonResponse(
        {
          data: data || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.max(1, Math.ceil((count || 0) / limit)),
          },
        },
        {},
        'private, no-store'
      );
    }

    return jsonResponse(data || [], {}, 'private, no-store');
  } catch (error) {
    console.error('Contact messages API error:', error);
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
