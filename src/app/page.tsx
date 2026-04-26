'use client';

import HeroSection from '@/components/HeroSection';
import FeaturedPosts from '@/components/FeaturedPosts';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { Input } from '@/components/ui/Input';
import { usePosts } from '@/hooks/usePosts';
import {
  AlertCircle,
  ArrowRight,
  Code2,
  Gauge,
  LayoutDashboard,
  Loader2,
  Network,
  Radio,
  Send,
  ShieldCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/lib/site';
import { commonCopy, useLanguage } from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';

/**
 * Trang chủ public.
 *
 * Trang này vừa là landing page vừa là bản tóm tắt năng lực: hero, tín hiệu phỏng
 * vấn, đường dẫn bằng chứng, bài viết nổi bật và form newsletter. Nội dung ngắn
 * được localize tại component; dữ liệu bài viết lấy qua API để phản ánh CMS.
 */
export default function Home() {
  const { locale } = useLanguage();
  const common = commonCopy[locale];
  const copy = locale === 'vi'
    ? {
        snapshotEyebrow: 'Cách ShadowDev vận hành',
        snapshotTitle: 'Không chỉ đăng bài, ShadowDev được xây như một sản phẩm kỹ thuật.',
        snapshotDescription:
          'Mỗi phần trên website đều có vai trò rõ ràng: bài viết để chia sẻ kiến thức, trang dự án để chứng minh cách triển khai, hồ sơ để tóm tắt năng lực, còn hệ thống quản trị giúp nội dung được xuất bản có kiểm soát.',
        openResume: 'Mở hồ sơ',
        viewProjects: 'Xem dự án',
        proofEyebrow: 'Đường dẫn chứng minh',
        proofTitle: 'Những phần quan trọng giúp người đọc kiểm chứng năng lực.',
        featuredEyebrow: 'Nổi bật',
        featuredTitle: 'Ghi chú kỹ thuật mới nhất',
        featuredDescription:
          'Bài viết chuyên sâu về DevOps, Docker, mạng máy tính, kiến trúc hệ thống, Git, bảo mật, hiệu năng và vận hành web thực tế.',
        loadingPosts: 'Đang tải bài viết nổi bật...',
        failedPosts: 'Không tải được bài viết',
        viewAll: 'Xem tất cả bài viết',
        emptyTitle: 'Chưa có bài viết.',
        emptyDescription: 'Hãy quay lại sau để đọc ghi chú mới.',
        newsletterEyebrow: 'Tín hiệu',
        newsletterTitle: 'Theo dõi bản tin ShadowDev.',
        newsletterDescription:
          'Nhận các ghi chú thực tế về thiết kế hệ thống, API an toàn mặc định và hiệu năng đủ tốt khi đưa sản phẩm ra môi trường thật.',
        subscribe: 'Đăng ký',
        newsletterNote: 'Không pixel theo dõi, không spam, không yêu cầu đăng nhập.',
        interviewSignals: [
          {
            value: 'ARCH',
            label: 'Kiến trúc hệ thống',
            detail: 'Thiết kế ranh giới nghiệp vụ, hợp đồng API, mô hình dữ liệu, bộ nhớ đệm, tác vụ nền và khả năng mở rộng theo tải.',
          },
          {
            value: 'OPS',
            label: 'Quy trình phát hành',
            detail: 'Quy trình tự động, Docker, môi trường nhất quán, chiến lược phát hành, rollback, log và metric để triển khai có kiểm soát.',
          },
          {
            value: 'SEC',
            label: 'Nền tảng bảo mật',
            detail: 'Xác thực, phiên đăng nhập, giới hạn tần suất, CSP, kiểm tra dữ liệu, phân quyền API và giảm dữ liệu nhạy cảm trả ra công khai.',
          },
          {
            value: 'PERF',
            label: 'Hiệu năng giao diện',
            detail: 'Core Web Vitals, phân cấp nội dung, giao diện responsive, trạng thái tải và giới hạn gói JavaScript để người dùng thấy nhanh.',
          },
        ],
        proofLinks: [
          {
            icon: Code2,
            title: 'Hồ sơ kỹ thuật',
            detail: 'Tóm tắt năng lực full-stack, kiến trúc, bảo mật, DevOps, giao diện và vận hành sản phẩm trên môi trường thật.',
            href: '/resume',
          },
          {
            icon: LayoutDashboard,
            title: 'Bản đồ dự án',
            detail: 'Các cụm dự án được mô tả theo vấn đề, quyết định kỹ thuật, rủi ro vận hành và tiêu chí đo lường.',
            href: '/projects',
          },
          {
            icon: ShieldCheck,
            title: 'Tư duy bảo mật',
            detail: 'Cách website xử lý phiên đăng nhập, kiểm tra nguồn gửi, giới hạn tần suất, lọc nội dung và ranh giới API công khai/quản trị.',
            href: '/privacy',
          },
          {
            icon: Network,
            title: 'Kho kiến thức',
            detail: 'Bài viết chuyên sâu về DevOps, Docker, mạng máy tính, kiến trúc, Git, cơ sở dữ liệu và giám sát hệ thống.',
            href: '/blog',
          },
        ],
      }
    : {
        snapshotEyebrow: 'ShadowDev OS',
        snapshotTitle: 'A technical journal designed like a product surface.',
        snapshotDescription:
          'ShadowDev is not a pile of posts. It organizes architecture, DevOps, security, performance, content systems, and admin workflow into a readable, inspectable, and extensible engineering product.',
        openResume: 'Open resume',
        viewProjects: 'View projects',
        proofEyebrow: 'Proof Paths',
        proofTitle: 'Surfaces that show how ShadowDev thinks about technical products.',
        featuredEyebrow: 'Featured',
        featuredTitle: 'Latest Field Notes',
        featuredDescription:
          'Long-form writing on DevOps, Docker, networking, architecture, Git, security, performance, and production web systems.',
        loadingPosts: 'Loading featured posts...',
        failedPosts: 'Failed to load posts',
        viewAll: 'View all notes',
        emptyTitle: 'No posts available yet.',
        emptyDescription: 'Check back soon for new notes.',
        newsletterEyebrow: 'Signal',
        newsletterTitle: 'Join the ShadowDev dispatch.',
        newsletterDescription:
          'A practical feed for design systems, secure-by-default APIs, and performance work that survives production.',
        subscribe: 'Subscribe',
        newsletterNote: 'No tracking pixels, no spam, no credential requests.',
        interviewSignals: [
          {
            value: 'ARCH',
            label: 'System architecture',
            detail: 'Domain boundaries, API contracts, data models, caching, background jobs, and scalability under load.',
          },
          {
            value: 'OPS',
            label: 'DevOps delivery',
            detail: 'Pipelines, Docker, environment parity, release strategy, rollback, logs, and metrics for controlled deploys.',
          },
          {
            value: 'SEC',
            label: 'Security baseline',
            detail: 'Auth, sessions, rate limits, CSP, validation, API authorization, and reduced public data exposure.',
          },
          {
            value: 'PERF',
            label: 'Performance UX',
            detail: 'Core Web Vitals, content hierarchy, responsive UI, loading states, and bundle budgets for fast perception.',
          },
        ],
        proofLinks: [
          {
            icon: Code2,
            title: 'Technical profile',
            detail: 'A concise view of full-stack, architecture, security, DevOps, frontend, and production product work.',
            href: '/resume',
          },
          {
            icon: LayoutDashboard,
            title: 'Case map',
            detail: 'Project clusters described by problem, technical decision, operational risk, and measurable criteria.',
            href: '/projects',
          },
          {
            icon: ShieldCheck,
            title: 'Security posture',
            detail: 'How the site handles sessions, origin checks, rate limits, content sanitization, and public/admin API boundaries.',
            href: '/privacy',
          },
          {
            icon: Network,
            title: 'Knowledge base',
            detail: 'Deep articles on DevOps, Docker, networking, architecture, Git, databases, and observability.',
            href: '/blog',
          },
        ],
      };

  // Lấy 6 bài mới nhất để đủ dữ liệu cho cụm featured và CTA xem tất cả.
  const { posts: featuredPosts, loading, error } = usePosts({ limit: 6 });
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Interview Snapshot: nêu nhanh định vị năng lực cho recruiter/interviewer. */}
      <Section className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="micro-label mb-3 flex items-center gap-2">
              <Gauge size={15} />
              {copy.snapshotEyebrow}
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-4xl">
              {copy.snapshotTitle}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              {copy.snapshotDescription}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={localizedPath('/resume', locale)}>
                  {copy.openResume}
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath('/projects', locale)}>{copy.viewProjects}</Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {copy.interviewSignals.map((item, index) => (
              <motion.article
                key={item.value}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="surface-card p-5"
              >
                <p className="mb-4 text-2xl font-bold text-[var(--accent)]">{item.value}</p>
                <h3 className="text-base font-semibold text-[var(--text)]">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </Section>

      {/* Proof Links: đưa người đọc tới các trang có bằng chứng cụ thể hơn. */}
      <Section withDividerBottom>
        <div className="mb-10 max-w-3xl">
          <div className="micro-label mb-3 flex items-center gap-2">
            <ShieldCheck size={15} />
            {copy.proofEyebrow}
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] sm:text-4xl">
            {copy.proofTitle}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.proofLinks.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.href}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="surface-card flex flex-col p-5"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)]">
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--text)]">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
                <Link href={localizedPath(item.href, locale)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
                  {common.open}
                  <ArrowRight size={15} />
                </Link>
              </motion.article>
            );
          })}
        </div>
      </Section>

      {/* Featured Posts Section */}
      <Section>
        <SectionHeader
          eyebrow={copy.featuredEyebrow}
          title={copy.featuredTitle}
          description={copy.featuredDescription}
          align="center"
          className="mb-12 sm:mb-16"
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={48} />
            <p className="text-[var(--text-muted)] text-lg">{copy.loadingPosts}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-[var(--text-muted)] text-lg mb-2">{copy.failedPosts}</p>
            <p className="text-[var(--text-soft)] text-sm">{error}</p>
          </div>
        )}

        {/* Featured Layout */}
        {!loading && !error && featuredPosts.length > 0 && (
          <>
            <FeaturedPosts posts={featuredPosts.slice(0, 3)} />

            {/* View All Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-10"
            >
              <Button asChild variant="outline" size="lg" shape="pill">
                <Link href={localizedPath('/blog', locale)}>{copy.viewAll}</Link>
              </Button>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && featuredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] text-lg">{copy.emptyTitle}</p>
            <p className="text-[var(--text-soft)] text-sm mt-2">{copy.emptyDescription}</p>
          </div>
        )}
      </Section>

      {/* Newsletter Section */}
      <Section className="border-y border-[var(--line)] bg-[rgba(244,241,232,0.03)]">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[1fr_420px] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="micro-label mb-3 flex items-center gap-2">
              <Radio size={15} />
              {copy.newsletterEyebrow}
            </div>
            <h3 className="mb-4 text-2xl font-bold text-[var(--text)] sm:text-4xl">{copy.newsletterTitle}</h3>
            <p className="text-[var(--text-muted)] text-sm sm:text-base text-balance">
              {copy.newsletterDescription}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="surface-card p-5 sm:p-6"
          >
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder={`you@${siteConfig.shortName}.dev`} required className="flex-1" />
              <Button type="submit" className="w-full sm:w-auto sm:whitespace-nowrap">
                <Send size={16} />
                {copy.subscribe}
              </Button>
            </form>
            <p className="mt-3 text-xs text-[var(--text-soft)]">{copy.newsletterNote}</p>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
