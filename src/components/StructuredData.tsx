import { siteConfig } from '@/lib/site';
import { languageAlternates, localizedUrl } from '@/lib/metadata';

/**
 * JSON-LD cấp website.
 *
 * Structured data được render ở root để search engine hiểu entity chính, ngôn ngữ
 * hỗ trợ và search action của blog. `suppressHydrationWarning` tránh cảnh báo do
 * script JSON-LD không cần hydrate như component tương tác.
 */
export default function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: ['vi', 'en'],
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      email: siteConfig.email,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${localizedUrl('/blog', 'vi')}?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
    sameAs: Object.values(languageAlternates('/')),
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
