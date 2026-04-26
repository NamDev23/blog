'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Activity, ArrowRight, Gauge, Server, ShieldCheck } from 'lucide-react';
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
        badge: `${siteConfig.shortName} / hệ thống an toàn, DevOps, hiệu năng`,
        titleTop: 'Ghi chú kỹ thuật',
        titleAccent: 'hệ thống web đáng tin cậy.',
        description: `${siteConfig.name} là nơi ghi lại kinh nghiệm xây hệ thống web: kiến trúc, DevOps, Docker, bảo mật API, giám sát, hiệu năng giao diện và cách đưa sản phẩm lên môi trường thật có thể đo lường.`,
        primary: 'Đọc bài viết',
        secondary: 'Trao đổi dự án',
        stats: [
          { icon: Server, number: 'Kiến trúc', label: 'Ranh giới nghiệp vụ, hợp đồng API, luồng dữ liệu và khả năng mở rộng.' },
          { icon: ShieldCheck, number: 'Bảo mật', label: 'Xác thực, giới hạn tần suất, CSP, quản lý secret và giảm bề mặt tấn công.' },
          { icon: Gauge, number: 'Hiệu năng', label: 'Core Web Vitals, bộ nhớ đệm, giới hạn gói JavaScript và đường tải trên môi trường thật.' },
        ],
      }
    : {
        badge: `${siteConfig.shortName} / secure systems, DevOps, performance`,
        titleTop: 'Engineering notes for',
        titleAccent: 'reliable web systems.',
        description: `${siteConfig.name} is a technical journal about web architecture, DevOps, Docker, API security, observability, frontend performance, and moving products from idea to measurable production behavior.`,
        primary: 'Read the journal',
        secondary: 'Discuss a build',
        stats: [
          { icon: Server, number: 'Architecture', label: 'Domain boundaries, API contracts, data flow, and scalability.' },
          { icon: ShieldCheck, number: 'Security', label: 'Auth, rate limits, CSP, secret handling, and attack surface reduction.' },
          { icon: Gauge, number: 'Performance', label: 'Core Web Vitals, caching, bundle budgets, and production loading paths.' },
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
    <section className="relative min-h-[88vh] overflow-hidden px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
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
          <motion.div variants={itemVariants} className="mb-6 inline-flex max-w-full items-center gap-2 border border-[var(--line-strong)] bg-[rgba(13,18,15,0.68)] px-3 py-2 text-xs text-[var(--text-muted)] sm:text-sm">
            <Activity size={16} className="text-[var(--accent)]" />
            <span className="min-w-0">{copy.badge}</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="mb-6 max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl"
          >
            <span className="block text-[var(--text)]">{copy.titleTop}</span>
            <span className="gradient-text block">{copy.titleAccent}</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-8 max-w-2xl text-base leading-7 text-[var(--text-muted)] text-balance sm:mb-9 sm:text-lg sm:leading-8"
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
            className="mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-3"
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
