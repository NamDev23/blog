export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

/**
 * Helper chuẩn hóa URL song ngữ.
 *
 * Toàn bộ public page dùng prefix locale để SEO có canonical/hreflang rõ ràng.
 * Các hàm trong file này không phụ thuộc React/Next nên có thể dùng lại ở proxy,
 * metadata server-side và component client-side.
 */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  // Chỉ segment đầu tiên được xem là locale; `/blog/vi-foo` không bị nhận nhầm.
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string) {
  // Tách query/hash trước khi xử lý để đổi locale không làm mất `?search=` hoặc `#section`.
  const [pathPart, suffix = ''] = splitPathSuffix(pathname);
  const segments = pathPart.split('/').filter(Boolean);
  if (isLocale(segments[0])) {
    const stripped = `/${segments.slice(1).join('/')}`;
    return `${stripped === '/' ? '/' : stripped.replace(/\/$/, '')}${suffix}`;
  }

  return pathname || '/';
}

export function localizedPath(pathname: string, locale: Locale) {
  // Bỏ qua anchor và URL tuyệt đối vì đây không phải internal route của Next.
  if (!pathname || pathname.startsWith('#')) return pathname;
  if (/^[a-z][a-z0-9+.-]*:/i.test(pathname)) return pathname;

  const [pathPart, suffix] = splitPathSuffix(pathname);
  const stripped = stripLocaleFromPathname(pathPart);
  const normalized = stripped === '/' ? '' : stripped;
  return `/${locale}${normalized}${suffix}`;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  // Đổi locale trên cùng route hiện tại thay vì điều hướng về trang chủ.
  return localizedPath(stripLocaleFromPathname(pathname || '/'), locale);
}

function splitPathSuffix(pathname: string): [string, string] {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  return [match?.[1] || '/', match?.[2] || ''];
}
