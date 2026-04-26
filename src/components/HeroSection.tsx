'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Bot, GraduationCap, Server, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/lib/site';
import { useLanguage } from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';

/**
 * Hero của trang chủ.
 *
 * Nội dung được viết song ngữ tại component vì đây là copy marketing ngắn, không
 * đến từ CMS. Các CTA dùng `localizedPath` để người dùng không rời khỏi locale
 * hiện tại khi đi sang blog/contact.
 */
export default function HeroSection() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        badge: `${siteConfig.shortName} / Laravel, hệ thống giáo dục và giao diện hiện đại`,
        titleTop: 'Xây dựng hệ thống giáo dục',
        titleAccent: 'bằng tư duy full-stack.',
        description: `${siteConfig.name} là portfolio kỹ thuật cho backend Laravel/PHP, sản phẩm LMS/CMS/CRM, luồng chatbot giáo dục, giao diện Vue/Next, API an toàn và UX sẵn sàng production.`,
        primary: 'Đọc bài viết',
        secondary: 'Trao đổi dự án',
        stats: [
          { icon: Server, number: 'Laravel', label: 'Module backend, API, auth và mô hình dữ liệu.' },
          { icon: GraduationCap, number: 'LMS / CMS', label: 'Nội dung giáo dục, quy trình admin và hệ thống CRM.' },
          { icon: Bot, number: 'Chatbot UX', label: 'Hỗ trợ học viên, thu lead và luồng tự động hóa.' },
        ],
      }
    : {
        badge: `${siteConfig.shortName} / Laravel, education systems, and modern UI`,
        titleTop: 'Building education systems',
        titleAccent: 'with full-stack discipline.',
        description: `${siteConfig.name} is a technical portfolio for Laravel/PHP backend work, LMS/CMS/CRM products, education chatbot flows, Vue/Next interfaces, secure APIs, and production-ready UX.`,
        primary: 'Read the journal',
        secondary: 'Discuss a build',
        stats: [
          { icon: Server, number: 'Laravel', label: 'Backend modules, APIs, auth, and data modeling.' },
          { icon: GraduationCap, number: 'LMS / CMS', label: 'Education content, admin workflows, CRM systems.' },
          { icon: Bot, number: 'Chatbot UX', label: 'Learning support, lead capture, and automation flows.' },
        ],
      };

  // Animation chỉ dùng opacity/translate nhẹ để không ảnh hưởng layout shift.
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <section className="relative min-h-[88vh] overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1800&h=1200&fit=crop"
          alt="Server racks and infrastructure lights"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-38"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0d120f_0%,rgba(13,18,15,0.9)_42%,rgba(13,18,15,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,18,15,0.3),#0d120f_96%)]" />
      </div>

      <motion.div
        className="container-custom flex min-h-[72vh] max-w-6xl items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-3xl">
          <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 border border-[var(--line-strong)] bg-[rgba(13,18,15,0.68)] px-3 py-2 text-sm text-[var(--text-muted)]">
            <ShieldCheck size={16} className="text-[var(--accent)]" />
            <span>{copy.badge}</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl"
          >
            <span className="block text-[var(--text)]">{copy.titleTop}</span>
            <span className="gradient-text block">{copy.titleAccent}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-9 max-w-2xl text-base leading-8 text-[var(--text-muted)] sm:text-lg text-balance"
          >
            {copy.description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="group">
                <Link href={localizedPath('/blog', locale)}>
                  {copy.primary}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Button asChild variant="outline" size="lg" className="group">
                <Link href={localizedPath('/contact', locale)}>{copy.secondary}</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-12 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {copy.stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.number}
                  whileHover={{ y: -4 }}
                  className="surface-card-subtle p-4"
                >
                  <Icon size={20} className="mb-3 text-[var(--accent)]" />
                  <div className="mb-1 text-sm font-bold text-[var(--text)]">{stat.number}</div>
                  <div className="text-xs leading-5 text-[var(--text-soft)]">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-[var(--accent)] to-transparent"
        animate={{ scaleY: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </section>
  );
}
