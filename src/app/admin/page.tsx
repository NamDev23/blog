import AdminDashboard from '@/app/admin/AdminDashboard';
import { requireAdminPage } from '@/lib/adminPage';

// Dashboard cần đọc cookie/session mỗi request, không cache static HTML.
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  await requireAdminPage();

  return <AdminDashboard />;
}
