import PostEditor from '@/app/admin/posts/PostEditor';
import { requireAdminPage } from '@/lib/adminPage';

export default async function NewPostPage() {
  await requireAdminPage();

  return <PostEditor mode="create" />;
}
