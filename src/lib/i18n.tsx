'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import {
  defaultLocale,
  getLocaleFromPathname,
  type Locale,
} from '@/lib/locales';

export type { Locale } from '@/lib/locales';

/**
 * Trung tâm trạng thái ngôn ngữ ở phía client.
 *
 * Quy ước của website là locale nằm trên URL (`/vi/...`, `/en/...`). Vì vậy
 * locale đọc từ pathname luôn được ưu tiên hơn `localStorage`; `localStorage`
 * chỉ giữ lựa chọn gần nhất khi người dùng đổi ngôn ngữ thủ công để các UI
 * client-only có giá trị mặc định nhất quán trước khi route mới được render.
 */
type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const STORAGE_KEY = 'shadowdev_locale';

export const categoryLabels: Record<string, Record<Locale, string>> = {
  DevOps: { en: 'DevOps', vi: 'DevOps' },
  Docker: { en: 'Docker', vi: 'Docker' },
  Networking: { en: 'Networking', vi: 'Mạng máy tính' },
  Architecture: { en: 'Architecture', vi: 'Kiến trúc' },
  Git: { en: 'Git', vi: 'Git' },
  Security: { en: 'Security', vi: 'Bảo mật' },
  Performance: { en: 'Performance', vi: 'Hiệu năng' },
  Observability: { en: 'Observability', vi: 'Giám sát' },
  Database: { en: 'Database', vi: 'Cơ sở dữ liệu' },
  Kubernetes: { en: 'Kubernetes', vi: 'Kubernetes' },
  SEO: { en: 'SEO', vi: 'SEO' },
};

export const navigationLabels = {
  en: {
    home: 'Home',
    journal: 'Journal',
    projects: 'Projects',
    resume: 'Resume',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy',
  },
  vi: {
    home: 'Trang chủ',
    journal: 'Bài viết',
    projects: 'Dự án',
    resume: 'Hồ sơ',
    about: 'Giới thiệu',
    contact: 'Liên hệ',
    privacy: 'Bảo mật',
  },
} as const;

export const commonCopy = {
  en: {
    indexLabel: 'ShadowDev Index',
    startBrief: 'Start a brief',
    readMore: 'Read More',
    open: 'Open',
    inspect: 'Inspect',
    backToBlog: 'Back to Blog',
    onThisPage: 'On this page',
    shareArticle: 'Share this article',
    shareHelp: 'Help others discover this article',
    relatedArticles: 'Related Articles',
    loadingArticle: 'Loading article...',
    postNotFound: 'Post Not Found',
    postNotFoundDescription: 'The article you are looking for does not exist.',
    loadingRelated: 'Loading related posts...',
    views: 'views',
    minRead: 'min read',
    lessThanMinute: 'Less than 1 min read',
    language: 'Language',
  },
  vi: {
    indexLabel: 'Mục lục ShadowDev',
    startBrief: 'Trao đổi dự án',
    readMore: 'Đọc tiếp',
    open: 'Mở',
    inspect: 'Xem chi tiết',
    backToBlog: 'Quay lại bài viết',
    onThisPage: 'Trong bài này',
    shareArticle: 'Chia sẻ bài viết',
    shareHelp: 'Giúp người khác tìm thấy bài viết này',
    relatedArticles: 'Bài viết liên quan',
    loadingArticle: 'Đang tải bài viết...',
    postNotFound: 'Không tìm thấy bài viết',
    postNotFoundDescription: 'Bài viết bạn đang tìm không tồn tại.',
    loadingRelated: 'Đang tải bài viết liên quan...',
    views: 'lượt xem',
    minRead: 'phút đọc',
    lessThanMinute: 'Dưới 1 phút đọc',
    language: 'Ngôn ngữ',
  },
} as const;

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const pathname = usePathname();
  const pathnameLocale = getLocaleFromPathname(pathname || '');

  /**
   * Chỉ đọc `localStorage` trong initializer để tránh lệch hydration giữa server
   * và client. Khi URL có locale, trạng thái này không quyết định ngôn ngữ hiển
   * thị mà chỉ đóng vai trò preference dự phòng.
   */
  const [preferredLocale, setPreferredLocale] = useState<Locale>(() => {
    if (pathnameLocale) return pathnameLocale;
    if (typeof window === 'undefined') return initialLocale;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'vi' ? stored : initialLocale;
  });
  const locale = pathnameLocale || preferredLocale;

  const setLocale = (nextLocale: Locale) => {
    setPreferredLocale(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  useEffect(() => {
    // Cập nhật thuộc tính HTML để trình đọc màn hình, trình duyệt và công cụ SEO
    // hiểu đúng ngôn ngữ hiện tại của nội dung sau khi client navigation xảy ra.
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale: () => setLocale(locale === 'vi' ? 'en' : 'vi'),
    }),
    [locale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}

export function getCategoryLabel(category: string, locale: Locale) {
  // Category trong database giữ dạng canonical tiếng Anh; label được dịch ở UI.
  return categoryLabels[category]?.[locale] || category;
}

export function formatLocalizedDate(date: string | Date, locale: Locale) {
  // Dùng Intl của trình duyệt/Node để tránh tự format ngày tháng theo chuỗi cứng.
  return new Date(date).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatLocalizedReadingTime(minutes: number, locale: Locale) {
  if (locale === 'vi') {
    if (minutes < 1) return commonCopy.vi.lessThanMinute;
    return `${minutes} ${commonCopy.vi.minRead}`;
  }

  if (minutes < 1) return commonCopy.en.lessThanMinute;
  if (minutes === 1) return `1 ${commonCopy.en.minRead}`;
  return `${minutes} ${commonCopy.en.minRead}`;
}
