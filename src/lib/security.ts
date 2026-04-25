import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

export const PUBLIC_COMMENT_SELECT =
  'id, post_id, author_name, content, created_at, updated_at';
export const ADMIN_SESSION_COOKIE = 'shadowdev_admin_session';

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export function sanitizeText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeLongText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeSearch(value: string | null) {
  if (!value) return '';
  return value.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function clampLimit(value: string | null, fallback = 24, max = 48) {
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
}

export function hasAdminAccess(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : '';
  const provided = request.headers.get('x-admin-key') || bearerToken;

  if (provided && isValidAdminKey(provided)) return true;

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value || '';
  return verifyAdminSessionToken(sessionToken);
}

export function isValidAdminKey(value: string) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !value) return false;

  return timingSafeEqual(value, expected);
}

export function createAdminSessionToken() {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + ADMIN_SESSION_TTL_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({
      role: 'admin',
      iat: issuedAt,
      exp: expiresAt,
    })
  ).toString('base64url');
  const signature = signAdminSession(payload);

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  };
}

export function verifyAdminSessionToken(token: string) {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = signAdminSession(payload);
  if (!timingSafeEqual(signature, expectedSignature)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string;
      exp?: number;
    };

    return session.role === 'admin' && typeof session.exp === 'number' && session.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function setAdminSessionCookie(response: NextResponse, token: string, expiresAt: number) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt * 1000),
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export function requireAdmin(request: NextRequest) {
  if (hasAdminAccess(request)) return null;

  return NextResponse.json(
    { error: 'Admin authorization required' },
    { status: 401 }
  );
}

export function jsonResponse<T>(
  body: T,
  init: ResponseInit = {},
  cacheControl?: string
) {
  const headers = new Headers(init.headers);
  if (cacheControl) headers.set('Cache-Control', cacheControl);
  headers.set('X-Content-Type-Options', 'nosniff');

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function timingSafeEqual(a: string, b: string) {
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }

  return diff === 0;
}

function signAdminSession(payload: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY || '';
  if (!secret) return '';

  return createHmac('sha256', secret).update(payload).digest('base64url');
}
