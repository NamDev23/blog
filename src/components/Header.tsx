'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { exploreLinks } from '@/lib/navigation';
import { siteConfig } from '@/lib/site';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const pathname = usePathname();


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
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
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
            {exploreLinks.map((item) => {
              const active = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
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

          <div className="hidden lg:block flex-shrink-0">
            <Button asChild className="px-4 lg:px-6">
              <Link href="/contact">Start a brief</Link>
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

        {/* Mobile Navigation */}
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
                {exploreLinks.map((item) => {
                  const active = item.href === '/' ? pathname === item.href : pathname.startsWith(item.href);
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
              <Button asChild className="w-full mt-4">
                <Link href="/contact" onClick={() => setIsOpen(false)}>Start a brief</Link>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
