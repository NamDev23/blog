'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail, ArrowRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { exploreLinks } from '@/lib/navigation';
import { siteConfig } from '@/lib/site';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Mail, href: `mailto:${siteConfig.email}`, label: 'Email' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <footer className="border-t border-[var(--line)] mt-16 sm:mt-20">
      <div className="container-custom py-12 sm:py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12"
        >
          <motion.div variants={itemVariants}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(244,241,232,0.06)]">
                <Terminal size={18} className="text-[var(--accent)]" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[var(--text)]">{siteConfig.name}</h3>
            </div>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">
              Engineering notes on resilient interfaces, secure APIs, and performance-focused web products.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-[var(--text)] mb-4 text-sm sm:text-base">Explore</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:gap-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm inline-flex items-center gap-2 group"
                  >
                    {link.label}
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>


          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-[var(--text)] mb-4 text-sm sm:text-base">Contact</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors text-sm inline-flex items-center gap-2 group"
                >
                  <Mail size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                  {siteConfig.email}
                </a>
              </li>
              <li className="text-[var(--text-muted)] text-sm">Based in {siteConfig.location}</li>
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-[var(--text)] mb-4 text-sm sm:text-base">Signals</h4>
            <div className="flex gap-3 flex-wrap">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.05)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all"
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="border-t border-[var(--line)] pt-8 sm:pt-12"
        >
          <p className="text-center text-[var(--text-soft)] text-xs sm:text-sm">
            © {currentYear} {siteConfig.name}. Built with Next.js, Supabase, and a bias for durable UX.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
