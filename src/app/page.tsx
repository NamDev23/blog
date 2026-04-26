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
  Bot,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Loader2,
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
        snapshotEyebrow: 'Sẵn sàng phỏng vấn',
        snapshotTitle: 'Đây không chỉ là blog. Đây là CV sống và bản demo sản phẩm.',
        snapshotDescription:
          'ShadowDev trình bày năng lực qua các bề mặt có thể kiểm chứng: backend Laravel/PHP, hệ thống giáo dục, quy trình CMS/CRM, tư duy chatbot, frontend Vue/Next và hồ sơ dễ đọc cho recruiter.',
        openResume: 'Mở hồ sơ',
        viewProjects: 'Xem dự án',
        proofEyebrow: 'Đường dẫn chứng minh',
        proofTitle: 'Lộ trình rõ ràng cho người đọc, recruiter và cộng tác viên.',
        featuredEyebrow: 'Nổi bật',
        featuredTitle: 'Ghi chú kỹ thuật mới nhất',
        featuredDescription:
          'Bài viết chuyên sâu về DevOps, Docker, networking, kiến trúc, Git, bảo mật, hiệu năng và hệ thống web production.',
        loadingPosts: 'Đang tải bài viết nổi bật...',
        failedPosts: 'Không tải được bài viết',
        viewAll: 'Xem tất cả bài viết',
        emptyTitle: 'Chưa có bài viết.',
        emptyDescription: 'Hãy quay lại sau để đọc ghi chú mới.',
        newsletterEyebrow: 'Tín hiệu',
        newsletterTitle: 'Theo dõi bản tin ShadowDev.',
        newsletterDescription:
          'Nguồn ghi chú thực tế về hệ thống thiết kế, API an toàn mặc định và hiệu năng có thể đứng vững trong production.',
        subscribe: 'Đăng ký',
        newsletterNote: 'Không tracking pixel, không spam, không yêu cầu thông tin đăng nhập.',
        interviewSignals: [
          {
            value: 'LAR',
            label: 'Backend Laravel',
            detail: 'Kinh nghiệm PHP/Laravel về API, auth, mô hình dữ liệu, logic CMS và module nghiệp vụ.',
          },
          {
            value: 'LMS',
            label: 'Hệ thống giáo dục',
            detail: 'Luồng LMS, nội dung khóa học, trạng thái học viên và vận hành sản phẩm giáo dục.',
          },
          {
            value: 'CRM',
            label: 'Quy trình CMS / CRM',
            detail: 'Dashboard admin, hồ sơ dữ liệu, bộ lọc, trạng thái xuất bản và màn hình vận hành lặp lại.',
          },
          {
            value: 'VUE',
            label: 'UI Vue / Next',
            detail: 'Giao diện hiện đại với Vue.js, Next.js, React, Tailwind CSS và UX responsive.',
          },
        ],
        proofLinks: [
          {
            icon: GraduationCap,
            title: 'Hồ sơ năng lực',
            detail: 'Dùng website như CV sống cho phỏng vấn Laravel, LMS, CMS, CRM, chatbot, Vue và Next.js.',
            href: '/resume',
          },
          {
            icon: LayoutDashboard,
            title: 'Bản đồ dự án',
            detail: 'Thể hiện tư duy sản phẩm qua nền tảng giáo dục và ứng dụng admin-heavy.',
            href: '/projects',
          },
          {
            icon: ShieldCheck,
            title: 'Mô hình bảo mật',
            detail: 'Xem cách bảo vệ nội dung, session và API write kiểm tra quyền phía server.',
            href: '/privacy',
          },
          {
            icon: Bot,
            title: 'Góc nhìn chatbot',
            detail: 'Biến kinh nghiệm chatbot giáo dục và tự động hóa thành ghi chú kỹ thuật dễ đọc.',
            href: '/blog',
          },
        ],
      }
    : {
        snapshotEyebrow: 'Interview Ready',
        snapshotTitle: 'This is more than a blog. It is a live CV and product demo.',
        snapshotDescription:
          'ShadowDev now presents your skills through working surfaces: Laravel/PHP backend, education systems, CMS/CRM workflows, chatbot thinking, Vue/Next frontend, and a recruiter-friendly resume path.',
        openResume: 'Open resume',
        viewProjects: 'View projects',
        proofEyebrow: 'Proof Paths',
        proofTitle: 'Clear paths for visitors, recruiters, and collaborators.',
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
            value: 'LAR',
            label: 'Laravel backend',
            detail: 'PHP/Laravel experience across APIs, auth, database modeling, CMS logic, and business modules.',
          },
          {
            value: 'LMS',
            label: 'Education systems',
            detail: 'Experience with LMS workflows, course content, learner states, and education product operations.',
          },
          {
            value: 'CRM',
            label: 'CMS / CRM workflows',
            detail: 'Admin dashboards, records, filters, publishing states, and repeated operational screens.',
          },
          {
            value: 'VUE',
            label: 'Vue / Next UI',
            detail: 'Modern frontend interfaces with Vue.js, Next.js, React, Tailwind CSS, and responsive UX.',
          },
        ],
        proofLinks: [
          {
            icon: GraduationCap,
            title: 'Resume profile',
            detail: 'Use this site as a live CV for Laravel, LMS, CMS, CRM, chatbot, Vue, and Next.js interviews.',
            href: '/resume',
          },
          {
            icon: LayoutDashboard,
            title: 'Project cases',
            detail: 'Show product-system thinking across education platforms and admin-heavy applications.',
            href: '/projects',
          },
          {
            icon: ShieldCheck,
            title: 'Security model',
            detail: 'Review the public privacy and security posture behind content, sessions, and server-checked API writes.',
            href: '/privacy',
          },
          {
            icon: Bot,
            title: 'Education bot angle',
            detail: 'Turn chatbot and education automation experience into readable technical notes.',
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
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
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
          <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
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
            <h3 className="mb-4 text-3xl font-bold text-[var(--text)] sm:text-4xl">{copy.newsletterTitle}</h3>
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
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <Input type="email" placeholder={`you@${siteConfig.shortName}.dev`} required className="flex-1" />
              <Button type="submit" className="whitespace-nowrap">
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
