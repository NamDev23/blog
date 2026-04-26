import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  isValidAdminKey,
  jsonResponse,
  rateLimit,
  requireSafeRequestOrigin,
  setAdminSessionCookie,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const invalidOrigin = requireSafeRequestOrigin(request);
    if (invalidOrigin) return invalidOrigin;

    const limited = rateLimit(request, 'admin-login', 5, 5 * 60 * 1000);
    if (limited) return limited;

    const body = await request.json().catch(() => ({}));
    const adminKey = typeof body.adminKey === 'string' ? body.adminKey.trim() : '';

    if (!isValidAdminKey(adminKey)) {
      return jsonResponse(
        { error: 'Invalid admin credentials' },
        { status: 401 },
        'private, no-store'
      );
    }

    const { token, expiresAt } = createAdminSessionToken();
    const response = jsonResponse({ success: true, expiresAt }, {}, 'private, no-store');
    setAdminSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return jsonResponse({ error: 'Unable to sign in' }, { status: 500 }, 'private, no-store');
  }
}
