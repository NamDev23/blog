import AdminDashboard from '@/app/admin/AdminDashboard';
import { requireAdminPage } from '@/lib/adminPage';

export default async function AdminPage() {
  await requireAdminPage();

  return <AdminDashboard />;
}
