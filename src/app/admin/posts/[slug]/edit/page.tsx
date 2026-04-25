import PostEditor from '@/app/admin/posts/PostEditor';
import { requireAdminPage } from '@/lib/adminPage';

type EditPostPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireAdminPage();
  const { slug } = await params;

  return <PostEditor mode="edit" slug={slug} />;
}
