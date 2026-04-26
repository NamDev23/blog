export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function getLocaleFromPathname(pathname: string): Locale | null {
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : null;
}

export function stripLocaleFromPathname(pathname: string) {
  const [pathPart, suffix = ''] = splitPathSuffix(pathname);
  const segments = pathPart.split('/').filter(Boolean);
  if (isLocale(segments[0])) {
    const stripped = `/${segments.slice(1).join('/')}`;
    return `${stripped === '/' ? '/' : stripped.replace(/\/$/, '')}${suffix}`;
  }

  return pathname || '/';
}

export function localizedPath(pathname: string, locale: Locale) {
  if (!pathname || pathname.startsWith('#')) return pathname;
  if (/^[a-z][a-z0-9+.-]*:/i.test(pathname)) return pathname;

  const [pathPart, suffix] = splitPathSuffix(pathname);
  const stripped = stripLocaleFromPathname(pathPart);
  const normalized = stripped === '/' ? '' : stripped;
  return `/${locale}${normalized}${suffix}`;
}

export function switchLocalePath(pathname: string, locale: Locale) {
  return localizedPath(stripLocaleFromPathname(pathname || '/'), locale);
}

function splitPathSuffix(pathname: string): [string, string] {
  const match = pathname.match(/^([^?#]*)(.*)$/);
  return [match?.[1] || '/', match?.[2] || ''];
}
