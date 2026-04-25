import { clearAdminSessionCookie, jsonResponse } from '@/lib/security';

export async function POST() {
  const response = jsonResponse({ success: true });
  clearAdminSessionCookie(response);

  return response;
}
