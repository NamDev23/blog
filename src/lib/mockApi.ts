import { mockPosts } from '@/lib/mockData';

type PostFilter = {
  category?: string | null;
  search?: string;
  limit?: number;
  excludeSlug?: string;
};

export function canUseMockApiFallback() {
  return process.env.NODE_ENV !== 'production';
}

export function getMockPosts({ category, search = '', limit, excludeSlug }: PostFilter = {}) {
  const now = Date.now();
  const searchTerm = search.toLowerCase();

  let posts = mockPosts
    .filter((post) => post.published_at && new Date(post.published_at).getTime() <= now)
    .filter((post) => (excludeSlug ? post.slug !== excludeSlug : true));

  if (category) {
    posts = posts.filter((post) => post.category === category);
  }

  if (searchTerm) {
    posts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm)
    );
  }

  posts = posts.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  return typeof limit === 'number' ? posts.slice(0, limit) : posts;
}

export function getMockPostBySlug(slug: string) {
  return getMockPosts().find((post) => post.slug === slug) || null;
}

export function getMockCategories() {
  return Array.from(new Set(getMockPosts().map((post) => post.category).filter(Boolean)));
}

export function getMockTags() {
  const tagCounts: Record<string, number> = {};

  getMockPosts().forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getMockRelatedPosts(slug: string, limit: number) {
  const currentPost = getMockPostBySlug(slug);
  if (!currentPost) return null;

  const scoredPosts = getMockPosts({ excludeSlug: slug }).map((post) => {
    const matchingTags = currentPost.tags.filter((tag) => post.tags.includes(tag)).length;
    const categoryScore = post.category === currentPost.category ? 10 : 0;

    return {
      post,
      score: categoryScore + matchingTags * 5,
    };
  });

  return scoredPosts
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.post.published_at).getTime() - new Date(a.post.published_at).getTime();
    })
    .map(({ post }) => post)
    .slice(0, limit);
}
