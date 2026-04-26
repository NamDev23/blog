import PostDetailPage from '@/app/blog/[slug]/page';

/**
 * Wrapper route `/[locale]/blog/[slug]`.
 *
 * Component bài viết gốc chỉ cần `slug`, còn locale được lấy từ `LanguageProvider`
 * ở root layout. Wrapper này bỏ `locale` khỏi params trước khi truyền xuống.
 */
export default function LocalizedPostDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const slugParams = params.then(({ slug }) => ({ slug }));
  return <PostDetailPage params={slugParams} />;
}
