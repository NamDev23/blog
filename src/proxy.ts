import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocaleFromPathname, localizedPath } from '@/lib/locales';

const PUBLIC_FILE = /\.(?:.*)$/;

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (shouldIgnore(pathname)) {
    return NextResponse.next();
  }

  const pathnameLocale = getLocaleFromPathname(pathname);

  if (!pathnameLocale) {
    const url = request.nextUrl.clone();
    url.pathname = localizedPath(pathname, defaultLocale);
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-shadowdev-locale', pathnameLocale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function shouldIgnore(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/favicon.ico' ||
    pathname === '/opengraph-image' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/rss.xml' ||
    PUBLIC_FILE.test(pathname)
  );
}

export const config = {
  matcher: ['/((?!_next|api|admin).*)'],
};
