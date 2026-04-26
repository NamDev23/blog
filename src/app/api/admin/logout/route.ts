import { NextRequest } from 'next/server';
import { clearAdminSessionCookie, jsonResponse, requireSafeRequestOrigin } from '@/lib/security';

export async function POST(request: NextRequest) {
  const invalidOrigin = requireSafeRequestOrigin(request);
  if (invalidOrigin) return invalidOrigin;

  const response = jsonResponse({ success: true }, {}, 'private, no-store');
  clearAdminSessionCookie(response);

  return response;
}
