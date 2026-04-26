import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';

/**
 * Security helper dùng chung cho API route.
 *
 * File này gom các lớp bảo vệ nhẹ nhưng quan trọng:
 * - sanitize input trước khi query/insert;
 * - rate limit theo IP cho form public;
 * - kiểm tra Origin/Sec-Fetch-Site để giảm rủi ro CSRF;
 * - xác thực admin bằng API key hoặc cookie session HttpOnly;
 * - set header phản hồi an toàn cho JSON API.
 */
export const PUBLIC_COMMENT_SELECT =
  'id, post_id, author_name, content, created_at, updated_at';
export const ADMIN_SESSION_COOKIE = 'shadowdev_admin_session';

const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const globalRateLimitStore = globalThis as typeof globalThis & {
  __shadowdevRateLimitStore?: Map<string, RateLimitRecord>;
};

const rateLimitStore =
  globalRateLimitStore.__shadowdevRateLimitStore ||
  new Map<string, RateLimitRecord>();

// Lưu trên globalThis để hot reload trong dev không reset bộ đếm quá thường xuyên.
globalRateLimitStore.__shadowdevRateLimitStore = rateLimitStore;

export function sanitizeText(value: unknown, maxLength: number) {
  // Text ngắn: gom whitespace thành một khoảng trắng để dùng cho title/name/email.
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeLongText(value: unknown, maxLength: number) {
  // Text dài: giữ xuống dòng cho message/comment nhưng loại control characters nguy hiểm.
  if (typeof value !== 'string') return '';

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeSearch(value: string | null) {
  // Supabase `.or(...ilike...)` dùng `%`, `,`, `()` làm cú pháp nên cần loại bỏ
  // những ký tự này khỏi search input để tránh phá query expression.
  if (!value) return '';
  return value.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function clampLimit(value: string | null, fallback = 24, max = 48) {
  // Chặn client yêu cầu limit quá lớn gây tải DB hoặc render quá nhiều item.
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, 1), max);
}

export function clampPage(value: string | null, fallback = 1) {
  // Page luôn bắt đầu từ 1 để offset tính được ổn định.
  const parsed = Number.parseInt(value || '', 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.max(parsed, 1);
}

export function rateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowMs: number
) {
  // Rate limit in-memory phù hợp single instance/local. Khi scale nhiều instance,
  // nên chuyển store sang Redis/Supabase RPC để giới hạn nhất quán toàn hệ thống.
  const now = Date.now();
  const clientIp = getClientIp(request);
  const key = `${scope}:${clientIp}`;
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  current.count += 1;

  if (current.count <= limit) {
    return null;
  }

  const retryAfter = Math.ceil((current.resetAt - now) / 1000);
  return jsonResponse(
    { code: 'rate_limited', error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
      },
    },
    'private, no-store'
  );
}

export function requireSafeRequestOrigin(request: NextRequest) {
  // GET/HEAD/OPTIONS không thay đổi dữ liệu nên không cần origin check.
  if (SAFE_METHODS.has(request.method)) return null;

  const secFetchSite = request.headers.get('sec-fetch-site');
  if (secFetchSite === 'cross-site') {
    return jsonResponse({ code: 'invalid_origin', error: 'Invalid request origin' }, { status: 403 }, 'private, no-store');
  }

  const origin = request.headers.get('origin');
  // Một số client nội bộ/cURL không gửi Origin. Với form trình duyệt hiện đại,
  // Sec-Fetch-Site phía trên đã chặn cross-site trước khi đến nhánh này.
  if (!origin) return null;

  const allowedHosts = new Set<string>();
  const host = request.headers.get('host');
  if (host) allowedHosts.add(host);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      allowedHosts.add(new URL(siteUrl).host);
    } catch {
      // Ignore invalid environment values; they are reported elsewhere.
    }
  }

  try {
    const originHost = new URL(origin).host;
    if (allowedHosts.has(originHost)) return null;
  } catch {
    return jsonResponse({ code: 'invalid_origin', error: 'Invalid request origin' }, { status: 403 }, 'private, no-store');
  }

  return jsonResponse({ code: 'invalid_origin', error: 'Invalid request origin' }, { status: 403 }, 'private, no-store');
}

export function hasAdminAccess(request: NextRequest) {
  // Hỗ trợ cả x-admin-key/Bearer cho script admin và cookie session cho UI admin.
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

  // So sánh constant-time để tránh lộ độ dài/prefix đúng qua timing side channel.
  return timingSafeEqual(value, expected);
}

export function createAdminSessionToken() {
  // Session token tự ký bằng HMAC, không cần lưu DB. Payload chỉ chứa role/iat/exp.
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
  // Cookie HttpOnly + SameSite strict để JS client không đọc được và giảm CSRF.
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
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
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

export function requireAdmin(request: NextRequest) {
  // Admin write vẫn kiểm tra origin để tránh dùng cookie session cho request cross-site.
  const invalidOrigin = requireSafeRequestOrigin(request);
  if (invalidOrigin) return invalidOrigin;

  if (hasAdminAccess(request)) return null;

  return NextResponse.json(
    { code: 'admin_required', error: 'Admin authorization required' },
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
  // Chặn browser đoán sai MIME type nếu có proxy/CDN cấu hình chưa chuẩn.
  headers.set('X-Content-Type-Options', 'nosniff');

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

function timingSafeEqual(a: string, b: string) {
  // Không dùng early return theo từng ký tự; luôn duyệt max length để giảm timing leak.
  const maxLength = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (a.charCodeAt(index) || 0) ^ (b.charCodeAt(index) || 0);
  }

  return diff === 0;
}

function signAdminSession(payload: string) {
  // Ưu tiên secret riêng cho session; fallback ADMIN_API_KEY để local setup đơn giản hơn.
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY || '';
  if (!secret) return '';

  return createHmac('sha256', secret).update(payload).digest('base64url');
}

export function getClientIp(request: NextRequest) {
  // Ưu tiên header từ CDN/reverse proxy, sau đó fallback "unknown". Giá trị này
  // dùng cho rate limit và hash bảo vệ riêng tư, không hiển thị cho user và không
  // lưu IP thô trong flow đếm view.
  const forwardedFor = request.headers.get('x-forwarded-for') || '';
  const firstForwardedIp = forwardedFor.split(',')[0]?.trim();

  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    firstForwardedIp ||
    'unknown'
  );
}
