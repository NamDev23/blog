import { NextRequest, NextResponse } from 'next/server';
import { defaultLocale, getLocaleFromPathname, localizedPath } from '@/lib/locales';

const PUBLIC_FILE = /\.(?:.*)$/;

/**
 * Proxy chạy trước route matching để ép public URL luôn có locale.
 *
 * `/blog` được redirect 308 sang `/vi/blog` theo locale mặc định. API, admin,
 * static assets và các file SEO đặc biệt được bỏ qua vì chúng không phải trang
 * nội dung song ngữ hoặc không nên bị redirect.
 */
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
  // Header nội bộ giúp server component/layout biết locale mà không cần parse lại URL.
  requestHeaders.set('x-shadowdev-locale', pathnameLocale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

function shouldIgnore(pathname: string) {
  // Không redirect tài nguyên tĩnh; nếu redirect nhầm chunk JS/CSS thì client dễ
  // gặp lỗi "Failed to load chunk" sau khi build/dev server đổi asset.
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
