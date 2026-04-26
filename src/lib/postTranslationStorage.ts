import { supabaseAdmin } from '@/lib/supabase';
import type { PostTranslationWritePayload } from '@/lib/postPayload';

/**
 * Helper lưu và đọc translation bài viết trong Supabase.
 *
 * `posts` vẫn giữ bản canonical để tương thích code/dữ liệu cũ, còn bảng
 * `post_translations` lưu từng bản ngôn ngữ. Public query dùng relation này để
 * `localizePost` chọn đúng nội dung theo locale.
 */
export const POST_SELECT_WITH_TRANSLATIONS = '*, post_translations(*)';

export function isMissingPostTranslationsRelation(error: unknown) {
  if (!error || typeof error !== 'object') return false;
  const code = 'code' in error ? (error as { code?: unknown }).code : '';
  const message = 'message' in error ? (error as { message?: unknown }).message : '';
  return code === 'PGRST200' && typeof message === 'string' && message.includes('post_translations');
}

export async function syncPostTranslations(
  postId: string,
  translations: PostTranslationWritePayload[]
) {
  if (translations.length === 0) return null;

  const rows = translations.map((translation) => ({
    post_id: postId,
    locale: translation.locale,
    title: translation.title,
    excerpt: translation.excerpt,
    content: translation.content,
    seo_title: translation.seo_title,
    seo_description: translation.seo_description,
  }));

  const { error } = await supabaseAdmin
    .from('post_translations')
    .upsert(rows, { onConflict: 'post_id,locale' });

  return error;
}
