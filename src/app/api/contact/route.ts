import { NextRequest, NextResponse } from 'next/server';
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured,
  supabase,
  supabaseAdmin,
} from '@/lib/supabase';
import { canUseMockApiFallback } from '@/lib/mockApi';
import {
  jsonResponse,
  rateLimit,
  requireSafeRequestOrigin,
  sanitizeLongText,
  sanitizeText,
} from '@/lib/security';
import { ensureSupabaseConfigured } from '@/lib/supabaseRoute';

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const limited = rateLimit(request, 'contact-create', 5, 10 * 60 * 1000);
    if (limited) return limited;

    const body = (await request.json()) as ContactPayload;

    if (sanitizeText(body.company, 80)) {
      return jsonResponse({ ok: true, code: 'contact_message_received' }, { status: 202 }, 'private, no-store');
    }

    const name = sanitizeText(body.name, 80);
    const email = sanitizeText(body.email, 254).toLowerCase();
    const subject = sanitizeText(body.subject, 120);
    const message = sanitizeLongText(body.message, 3000);

    if (!name || !email || !subject || message.length < 10) {
      return jsonResponse(
        {
          code: 'invalid_contact_payload',
          error: 'Please provide a name, email, subject, and message with at least 10 characters.',
        },
        { status: 400 },
        'private, no-store'
      );
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return jsonResponse(
        { code: 'invalid_email', error: 'Please provide a valid email address.' },
        { status: 400 },
        'private, no-store'
      );
    }

    if (!isSupabaseConfigured) {
      if (canUseMockApiFallback()) {
        return jsonResponse(
          {
            ok: true,
            code: 'contact_message_received',
            message: 'Message received. ShadowDev will respond by email.',
            stored: false,
          },
          { status: 202 },
          'private, no-store'
        );
      }

      const unavailable = ensureSupabaseConfigured(false);
      if (unavailable) return unavailable;
    }

    const client = isSupabaseAdminConfigured ? supabaseAdmin : supabase;
    const { data, error } = await client
      .from('contact_messages')
      .insert({
        name,
        email,
        subject,
        message,
        status: 'new',
        source: 'contact_form',
        user_agent: sanitizeText(request.headers.get('user-agent'), 500) || null,
      })
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Contact insert error:', error);
      return jsonResponse(
        { code: 'contact_storage_unavailable', error: 'Contact message storage is temporarily unavailable.' },
        { status: 503 },
        'private, no-store'
      );
    }

    return jsonResponse(
      {
        ok: true,
        code: 'contact_message_received',
        id: data.id,
        created_at: data.created_at,
        message: 'Message received. ShadowDev will respond by email.',
        stored: true,
      },
      { status: 202 },
      'private, no-store'
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ code: 'server_error', error: 'Internal server error' }, { status: 500 });
  }
}
