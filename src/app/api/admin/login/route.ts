import { NextRequest } from 'next/server';
import {
  createAdminSessionToken,
  isValidAdminKey,
  jsonResponse,
  setAdminSessionCookie,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const adminKey = typeof body.adminKey === 'string' ? body.adminKey.trim() : '';

    if (!isValidAdminKey(adminKey)) {
      return jsonResponse({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const { token, expiresAt } = createAdminSessionToken();
    const response = jsonResponse({ success: true, expiresAt });
    setAdminSessionCookie(response, token, expiresAt);

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return jsonResponse({ error: 'Unable to sign in' }, { status: 500 });
  }
}
