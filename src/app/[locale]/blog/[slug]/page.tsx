import PostDetailPage from '@/app/blog/[slug]/page';

export default function LocalizedPostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const slugParams = params.then(({ slug }) => ({ slug }));
  return <PostDetailPage params={slugParams} />;
}
