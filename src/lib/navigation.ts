/**
 * Danh sách route public theo thứ tự xuất hiện trong Header/Footer.
 *
 * `label` là fallback tiếng Anh; UI thực tế sẽ lấy bản dịch qua `navigationLabels`
 * trong i18n để tránh hard-code text ở nhiều nơi.
 */
export const exploreLinks = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'journal', label: 'Journal', href: '/blog' },
  { key: 'projects', label: 'Projects', href: '/projects' },
  { key: 'resume', label: 'Resume', href: '/resume' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'contact', label: 'Contact', href: '/contact' },
  { key: 'privacy', label: 'Privacy', href: '/privacy' },
] as const;
