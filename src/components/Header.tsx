'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { exploreLinks } from '@/lib/navigation';
import { siteConfig } from '@/lib/site';
import { commonCopy, navigationLabels, useLanguage } from '@/lib/i18n';
import { localizedPath, stripLocaleFromPathname, switchLocalePath } from '@/lib/locales';

/**
 * Header public của website.
 *
 * Header đọc locale từ `LanguageProvider`, tự localize link và đổi route khi người
 * dùng chuyển VI/EN. Admin path trả `null` để dashboard không bị bọc bởi navigation
 * public và giữ trải nghiệm console riêng.
 */
export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { locale, setLocale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const activePathname = stripLocaleFromPathname(pathname || '/');
  const navLabels = navigationLabels[locale];
  const copy = commonCopy[locale];
  const localizedLinks = exploreLinks.map((item) => ({
    ...item,
    label: navLabels[item.key],
    href: localizedPath(item.href, locale),
  }));

  useEffect(() => {
    // Thay đổi nền khi scroll để header nổi rõ trên hero nhưng vẫn nhẹ trên mobile.
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const changeLocale = (nextLocale: typeof locale) => {
    // Cập nhật preference client rồi push sang URL cùng page với locale mới.
    setLocale(nextLocale);
    router.push(switchLocalePath(pathname || '/', nextLocale));
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 },
    },
  };

  if (activePathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? 'border-[var(--line-strong)] bg-[#0d120f]/92 shadow-lg shadow-black/20 backdrop-blur-xl'
          : 'border-[var(--line)] bg-[#0d120f]/78 backdrop-blur-xl'
      }`}
    >
      <nav className="container-custom py-3">
        <div className="flex justify-between items-center">
          <Link href={localizedPath('/', locale)} className="flex items-center gap-2 group flex-shrink-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 border border-[var(--line-strong)] bg-[rgba(244,241,232,0.06)] rounded-lg flex items-center justify-center group-hover:border-[var(--accent)] transition-all"
            >
              <Terminal size={18} className="text-[var(--accent)]" />
            </motion.div>
            <span className="text-lg sm:text-xl font-bold text-[var(--text)] hidden sm:inline whitespace-nowrap">
              {siteConfig.name}
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1 surface-card-subtle p-1">
            {localizedLinks.map((item) => {
              const active = item.href === localizedPath('/', locale)
                ? activePathname === '/'
                : activePathname.startsWith(stripLocaleFromPathname(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-2.5 py-2 text-xs font-semibold transition-colors xl:px-3 xl:text-sm ${active ? 'bg-[rgba(102,217,194,0.14)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(244,241,232,0.05)]'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <div className="flex rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] p-1" aria-label={copy.language}>
              {(['vi', 'en'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => changeLocale(item)}
                  aria-pressed={locale === item}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
                    locale === item
                      ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <Button asChild className="px-4 lg:px-6">
              <Link href={localizedPath('/contact', locale)}>{copy.startBrief}</Link>
            </Button>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-[var(--text-muted)] hover:text-[var(--text)] transition-colors p-2 flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile navigation dùng AnimatePresence để đóng/mở mượt nhưng không giữ DOM dư. */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="lg:hidden mt-4 pb-4 border-t border-[var(--line)] pt-4"
            >
              <div className="flex flex-col gap-2">
                {localizedLinks.map((item) => {
                  const active = item.href === localizedPath('/', locale)
                    ? activePathname === '/'
                    : activePathname.startsWith(stripLocaleFromPathname(item.href));
                  return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`px-4 py-3 transition-all rounded-lg font-medium ${
                      active
                        ? 'bg-[rgba(102,217,194,0.14)] text-[var(--accent)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(244,241,232,0.06)]'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                  );
                })}
              </div>
              <div className="mt-4 flex rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] p-1" aria-label={copy.language}>
                {(['vi', 'en'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => changeLocale(item)}
                    aria-pressed={locale === item}
                    className={`flex-1 rounded-md px-3 py-2 text-sm font-bold transition-colors ${
                      locale === item
                        ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                    }`}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
              <Button asChild className="w-full mt-4">
                <Link href={localizedPath('/contact', locale)} onClick={() => setIsOpen(false)}>{copy.startBrief}</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
