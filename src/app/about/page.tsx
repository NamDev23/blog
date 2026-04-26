'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Code, Palette, ShieldCheck, Zap } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import { siteConfig } from '@/lib/site';
import { useLanguage } from '@/lib/i18n';

/**
 * Trang giới thiệu public.
 *
 * Nội dung được giữ trong component vì đây là copy profile ngắn, không cần CMS.
 * Mỗi nhánh locale chứa cùng cấu trúc dữ liệu để layout không phải rẽ nhánh phức tạp.
 */
export default function AboutPage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        pageTitle: 'Giới thiệu ShadowDev',
        pageDescription: 'Nơi chia sẻ kiến thức về kiến trúc web, bảo mật, DevOps, hiệu năng và cách vận hành sản phẩm thực tế.',
        heroTitle: 'ShadowDev tập trung vào những quyết định kỹ thuật làm sản phẩm đáng tin hơn.',
        paragraphs: [
          `${siteConfig.name} ghi lại cách xây hệ thống web có thể vận hành lâu dài: ranh giới kiến trúc, hợp đồng API, xác thực, dữ liệu, quy trình phát hành, giám sát và trải nghiệm người dùng sau khi triển khai.`,
          'Trang này không phải portfolio trang trí. Nó dùng chính website làm ví dụ: blog song ngữ, khu quản trị, API được bảo vệ, SEO, bình luận, liên hệ và các ghi chú quyết định kỹ thuật có thể kiểm chứng.',
          'Nội dung dành cho người làm kỹ thuật muốn đi xa hơn mức “chạy được”: có bảo mật, có số đo, có đường rollback, có dữ liệu để debug và có cấu trúc để phát triển lâu dài.',
        ],
        skillsTitle: 'Kỹ năng',
        skillsDescription: 'Các năng lực chính phía sau ShadowDev',
        principlesTitle: 'Nguyên tắc vận hành',
        skills: [
          { icon: Code, title: 'Kiến trúc và API', description: 'Thiết kế ranh giới module, hợp đồng API, dữ liệu, kiểm tra đầu vào và quy trình quản trị có thể mở rộng.' },
          { icon: Palette, title: 'Trải nghiệm sản phẩm', description: 'Giao diện dễ đọc, dễ thao tác lặp lại, trạng thái rõ ràng và hiển thị tốt trên nhiều kích thước màn hình.' },
          { icon: Zap, title: 'Hiệu năng và phát hành', description: 'Tối ưu đường tải, bộ nhớ đệm, chiến lược hình ảnh, CI/CD, Docker và kiểm soát mỗi lần phát hành.' },
          { icon: ShieldCheck, title: 'Nền tảng bảo mật', description: 'Gia cố xác thực, phiên đăng nhập, API công khai/quản trị, form, bình luận, lọc HTML và giới hạn tần suất.' },
        ],
        principles: [
          {
            title: 'Thiết kế theo ranh giới sở hữu',
            company: 'Kiến trúc',
            period: 'Dễ bảo trì',
            description: 'Mỗi module cần biết dữ liệu nào thuộc về nó, API nào là hợp đồng công khai và phần nào chỉ là chi tiết nội bộ để hệ thống không phình ra khó kiểm soát.',
          },
          {
            title: 'Bảo mật là mặc định, không phải bước cuối',
            company: 'Bảo mật',
            period: 'Tin cậy',
            description: 'Xác thực, phân quyền, kiểm tra dữ liệu, giới hạn tần suất, CSP, chính sách cookie và giảm dữ liệu trả ra phải được tính ngay từ lúc thiết kế API.',
          },
          {
            title: 'Môi trường thật phải quan sát được',
            company: 'Độ tin cậy',
            period: 'Vận hành',
            description: 'Một tính năng chỉ thật sự xong khi có log, metric, trạng thái lỗi, đường rollback và tín hiệu đủ rõ để debug khi người dùng bị ảnh hưởng.',
          },
          {
            title: 'Hiệu năng có ngân sách',
            company: 'Hiệu năng',
            period: 'Tốc độ',
            description: 'Animation, ảnh và thư viện phải phục vụ nội dung. Kích thước gói JavaScript, Core Web Vitals và trạng thái tải cần được kiểm soát như một phần của chất lượng sản phẩm.',
          },
        ],
      }
    : {
        pageTitle: 'About ShadowDev',
        pageDescription: 'A technical engineering journal about web architecture, security, DevOps, performance, and production product systems.',
        heroTitle: 'ShadowDev writes about the engineering work that makes products trustworthy.',
        paragraphs: [
          `${siteConfig.name} documents how to build web systems that can operate: architecture boundaries, API contracts, auth, data, delivery pipelines, observability, and user experience after deployment.`,
          'This is not a decorative portfolio. It presents engineering thinking through real surfaces: bilingual publishing, admin workflows, protected APIs, SEO, comments/contact, and inspectable decision notes.',
          'The writing is for builders who want to move from “it works” to “it survives production”: security, measurement, rollback paths, debugging signals, and structures that can grow.',
        ],
        skillsTitle: 'My Skills',
        skillsDescription: 'Core capabilities behind ShadowDev',
        principlesTitle: 'Operating Principles',
        skills: [
          { icon: Code, title: 'Architecture & API', description: 'Designing module boundaries, contracts, data, validation, and admin workflows that can grow.' },
          { icon: Palette, title: 'Product UX', description: 'Interfaces optimized for scanning, repeated work, clear states, and responsive density.' },
          { icon: Zap, title: 'Performance & Delivery', description: 'Loading paths, caching, image strategy, CI/CD, Docker, and release discipline.' },
          { icon: ShieldCheck, title: 'Security Baseline', description: 'Auth, sessions, public/admin APIs, forms, comments, HTML sanitization, and rate limits.' },
        ],
        principles: [
          {
            title: 'Design around ownership boundaries',
            company: 'Architecture',
            period: 'Maintainability',
            description: 'Each module should know which data it owns, which APIs are public contracts, and which parts are internal implementation details.',
          },
          {
            title: 'Security is default, not a final checklist',
            company: 'Security',
            period: 'Trust',
            description: 'Auth, authorization, validation, rate limits, CSP, cookie policy, and response minimization belong in the API design from the start.',
          },
          {
            title: 'Production must be observable',
            company: 'Reliability',
            period: 'Operate',
            description: 'A feature is not complete until logs, metrics, error states, rollback paths, and debugging signals exist for user-impacting failures.',
          },
          {
            title: 'Performance has a budget',
            company: 'Performance',
            period: 'Speed',
            description: 'Animation, imagery, and libraries must serve the content. Bundle cost, Core Web Vitals, and loading states are product quality concerns.',
          },
        ],
      };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      <PageHeader
        title={copy.pageTitle}
        description={copy.pageDescription}
      />

      {/* Bio Section */}
      <Section>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center"
          >
            {/* Text */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[var(--text)]">
                {copy.heroTitle}
              </h2>
              <div className="space-y-4 text-[var(--text-muted)] text-sm sm:text-base">
                {copy.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </motion.div>

            {/* Ảnh nhận diện dùng asset nội bộ để tránh phụ thuộc CDN ngoài trên trang About. */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto w-full max-w-[calc(100%-1.5rem)] sm:max-w-[440px]"
              >
                <div aria-hidden className="absolute -inset-3 rounded-lg border border-[rgba(102,217,194,0.14)]" />
                <div aria-hidden className="absolute -inset-1 rounded-lg border border-[rgba(231,182,90,0.12)]" />
                <div className="relative aspect-square overflow-hidden rounded-lg border border-[rgba(102,217,194,0.38)] bg-[linear-gradient(180deg,rgba(2,5,4,0.96),rgba(4,12,10,0.86))] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.42),0_0_44px_rgba(102,217,194,0.16)]">
                  <Image
                    src="/images/logo.png"
                    alt={`${siteConfig.name} logo`}
                    width={1024}
                    height={1024}
                    sizes="(min-width: 768px) 440px, 88vw"
                    priority
                    unoptimized
                    className="h-full w-full rounded-md object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-2 rounded-md border border-[rgba(244,241,232,0.08)]"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-2 rounded-md bg-[linear-gradient(115deg,transparent_0%,rgba(102,217,194,0.1)_46%,transparent_58%)] opacity-70 mix-blend-screen"
                  />
                  <motion.div
                    aria-hidden
                    animate={{ top: ['8%', '92%', '8%'] }}
                    transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="pointer-events-none absolute inset-x-4 h-px bg-[rgba(102,217,194,0.62)] shadow-[0_0_14px_rgba(102,217,194,0.75)]"
                  />
                  <span aria-hidden className="absolute left-3 top-3 h-8 w-8 border-l border-t border-[rgba(102,217,194,0.75)]" />
                  <span aria-hidden className="absolute right-3 top-3 h-8 w-8 border-r border-t border-[rgba(102,217,194,0.75)]" />
                  <span aria-hidden className="absolute bottom-3 left-3 h-8 w-8 border-b border-l border-[rgba(102,217,194,0.75)]" />
                  <span aria-hidden className="absolute bottom-3 right-3 h-8 w-8 border-b border-r border-[rgba(102,217,194,0.75)]" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
      </Section>

      {/* Skills Section */}
      <Section withDividerTop>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="gradient-text mb-4">
              {copy.skillsTitle}
            </h2>
            <p className="text-[var(--text-muted)] text-base sm:text-lg text-balance">
              {copy.skillsDescription}
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {copy.skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="surface-card p-5 text-center transition-all hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)] sm:p-6"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 mx-auto mb-4 bg-[rgba(102,217,194,0.12)] border border-[rgba(102,217,194,0.3)] rounded-lg flex items-center justify-center"
                  >
                    <Icon size={24} className="text-[var(--accent)]" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2">
                    {skill.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-xs sm:text-sm leading-relaxed">
                    {skill.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
      </Section>

      {/* Experience Section */}
      <Section withDividerTop>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="gradient-text mb-4">
              {copy.principlesTitle}
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            {copy.principles.map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="surface-card border-l-4 border-[var(--accent)] p-5 transition-all hover:translate-x-1 hover:border-[var(--amber)] sm:p-8"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text)] mb-2">
                  {exp.title}
                </h3>
                <p className="text-[var(--accent)] font-medium mb-3 text-sm sm:text-base">
                  {exp.company} / <span className="text-[var(--text-muted)]">{exp.period}</span>
                </p>
                <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
      </Section>
    </>
  );
}
