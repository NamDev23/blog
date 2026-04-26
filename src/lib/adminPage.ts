import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/security';

/**
 * Guard server-side cho mọi trang admin.
 *
 * Kiểm tra cookie HttpOnly ngay trong Server Component/layout để người chưa đăng
 * nhập không nhận được HTML admin. API route vẫn tự gọi `requireAdmin()` riêng vì
 * người dùng có thể gọi API trực tiếp mà không đi qua page.
 */
export async function requireAdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value || '';

  if (!verifyAdminSessionToken(sessionToken)) {
    redirect('/admin/login');
  }
}
