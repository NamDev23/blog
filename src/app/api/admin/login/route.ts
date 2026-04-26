import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  isValidAdminKey,
  jsonResponse,
  rateLimit,
  requireSafeRequestOrigin,
  setAdminSessionCookie,
} from '@/lib/security';

/**
 * POST /api/admin/login
 * Đăng nhập admin bằng ADMIN_API_KEY và cấp cookie session HttpOnly.
 *
 * API key chỉ gửi một lần ở form login; các request dashboard sau đó dùng cookie
 * HMAC session để giảm việc lưu key trong client state/localStorage.
 */
export async function POST(request: NextRequest) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const limited = rateLimit(request, 'admin-login', 5, 5 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json().catch(() => ({}));
    const adminKey = typeof body.adminKey === 'string' ? body.adminKey.trim() : '';

    // Trả lỗi chung, không tiết lộ key thiếu hay sai.
    if (!isValidAdminKey(adminKey)) {
      return jsonResponse(
        { error: 'Invalid admin credentials' },
        { status: 401 },
        'private, no-store'
      );
    }

    const { token, expiresAt } = createAdminSessionToken();
    // Cookie security flags được set trong `setAdminSessionCookie`.
    const response = jsonResponse({ success: true, expiresAt }, {}, 'private, no-store');
    setAdminSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return jsonResponse({ error: 'Unable to sign in' }, { status: 500 }, 'private, no-store');
  }
}
