import { NextRequest, NextResponse } from 'next/server';
import { jsonResponse, sanitizeLongText, sanitizeText } from '@/lib/security';

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;

    if (sanitizeText(body.company, 80)) {
      return jsonResponse({ ok: true }, { status: 202 });
    }

    const name = sanitizeText(body.name, 80);
    const email = sanitizeText(body.email, 254).toLowerCase();
    const subject = sanitizeText(body.subject, 120);
    const message = sanitizeLongText(body.message, 3000);

    if (!name || !email || !subject || message.length < 10) {
      return jsonResponse(
        { error: 'Please provide a name, email, subject, and message with at least 10 characters.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return jsonResponse({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    return jsonResponse(
      { ok: true, message: 'Message received. ShadowDev will respond by email.' },
      { status: 202 }
    );
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
