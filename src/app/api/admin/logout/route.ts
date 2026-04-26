import { NextRequest } from 'next/server';
import { clearAdminSessionCookie, jsonResponse, requireSafeRequestOrigin } from '@/lib/security';

/**
 * POST /api/admin/logout
 * Xóa cookie session admin.
 *
 * Vẫn kiểm tra origin vì endpoint dùng cookie; không để trang khác ép browser của
 * admin gửi request logout ngoài ý muốn.
 */
export async function POST(request: NextRequest) {
  const invalidOrigin = requireSafeRequestOrigin(request);
  if (invalidOrigin) return invalidOrigin;

  const response = jsonResponse({ success: true }, {}, 'private, no-store');
  clearAdminSessionCookie(response);

  return response;
}
