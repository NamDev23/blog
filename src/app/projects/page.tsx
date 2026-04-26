'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  Bot,
  BookOpenText,
  CheckCircle2,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  PanelsTopLeft,
  SearchCheck,
  Server,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import { commonCopy, useLanguage } from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';

export default function ProjectsPage() {
  const { locale } = useLanguage();
  const common = commonCopy[locale];
  const copy = locale === 'vi'
    ? {
        eyebrow: 'Bằng chứng năng lực',
        title: 'Bản đồ dự án cho Laravel, hệ thống giáo dục, CMS/CRM, chatbot và frontend UI.',
        description:
          'Portfolio được sắp xếp theo hệ thống sản phẩm thay vì liệt kê kỹ năng rời rạc. Interviewer có thể nhanh chóng thấy chiều sâu backend, domain giáo dục, tư duy sản phẩm admin và năng lực giao diện Vue/Next.',
        resume: 'Xem hồ sơ',
        brief: 'Trao đổi dự án',
        nextEyebrow: 'Phát triển tiếp',
        nextTitle: 'Những việc làm sản phẩm hấp dẫn hơn.',
        nextDescription:
          'Các bước tiếp theo mạnh nhất không nằm ở trang trí. Chúng nên làm kinh nghiệm thật dễ kiểm chứng hơn: sản phẩm giáo dục, hệ thống admin, ví dụ code và kết quả đo được.',
        contentEyebrow: 'Content Engine',
        contentTitle: 'Blog nên hỗ trợ câu chuyện phỏng vấn của bạn.',
        contentDescription:
          'Viết bài quanh kiến trúc Laravel, quyết định LMS, thiết kế workflow CMS/CRM, chiến lược chatbot giáo dục, UI pattern Vue.js và kỹ thuật portfolio Next.js.',
        readJournal: 'Đọc bài viết',
        caseStudies: [
          {
            icon: GraduationCap,
            title: 'Kinh nghiệm sản phẩm LMS',
            type: 'Nền tảng giáo dục',
            summary:
              'Kinh nghiệm với workflow học tập: khóa học, bài học, học viên, trạng thái tiến độ, vận hành nội dung và hành trình theo vai trò.',
            results: ['Cấu trúc khóa học/bài học', 'Luồng tiến độ học viên', 'UX admin giáo dục'],
            href: '/resume',
            stack: ['LMS', 'Laravel', 'Education'],
          },
          {
            icon: LayoutDashboard,
            title: 'Hệ thống CMS và CRM',
            type: 'Vận hành doanh nghiệp',
            summary:
              'Hệ thống nặng về admin để quản lý nội dung, hồ sơ, bộ lọc, trạng thái, dashboard và công việc lặp lại của staff.',
            results: ['Mô hình nội dung', 'Quản lý hồ sơ', 'Dashboard vận hành'],
            href: '/resume',
            stack: ['CMS', 'CRM', 'Admin'],
          },
          {
            icon: Bot,
            title: 'Luồng chatbot giáo dục',
            type: 'Tự động hóa',
            summary:
              'Tư duy chatbot cho giáo dục: câu hỏi học viên, hướng dẫn khóa học, thu lead, FAQ automation và handoff hỗ trợ.',
            results: ['FAQ automation', 'Lead capture', 'Luồng hỗ trợ học tập'],
            href: '/blog',
            stack: ['Chatbot', 'Education', 'UX'],
          },
          {
            icon: Server,
            title: 'Module backend Laravel',
            type: 'Backend engineering',
            summary:
              'Triển khai PHP/Laravel qua API, xác thực, quan hệ database, validation và business rule dễ bảo trì.',
            results: ['Ranh giới REST API', 'Auth và role', 'Mô hình database'],
            href: '/resume',
            stack: ['PHP', 'Laravel', 'API'],
          },
          {
            icon: PanelsTopLeft,
            title: 'Hệ giao diện Vue / Next',
            type: 'Frontend UI',
            summary:
              'Giao diện hiện đại cho dashboard và content site bằng Vue.js, Next.js, React, Tailwind CSS, responsive state và hierarchy rõ.',
            results: ['Component tái sử dụng', 'Layout responsive', 'Màn hình theo trạng thái'],
            href: '/',
            stack: ['Vue.js', 'Next.js', 'Tailwind'],
          },
          {
            icon: LockKeyhole,
            title: 'Bảo mật admin ShadowDev',
            type: 'Bằng chứng portfolio',
            summary:
              'Website này thể hiện admin login được bảo vệ, HttpOnly session, admin noindex, sanitize CMS payload và public read route an toàn.',
            results: ['HttpOnly admin session', 'CMS write được bảo vệ', 'Public read ẩn draft'],
            href: '/privacy',
            stack: ['Next.js', 'Security', 'CMS'],
          },
          {
            icon: SearchCheck,
            title: 'Lớp SEO và discovery',
            type: 'Nền tảng tăng trưởng',
            summary:
              'Metadata, sitemap, robots, RSS, canonical URL, Open Graph và cấu trúc nội dung semantic để hỗ trợ search/share.',
            results: ['Route metadata', 'RSS feed', 'Article page dễ chia sẻ'],
            href: '/blog',
            stack: ['SEO', 'Content', 'Growth'],
          },
        ],
        roadmap: [
          {
            title: 'Supabase Auth với role',
            detail: 'Chuyển từ một admin secret sang multi-user login, role-based access, audit log và trạng thái duyệt nội dung.',
          },
          {
            title: 'Trang case study giáo dục',
            detail: 'Tạo trang riêng cho LMS, CMS, CRM và chatbot với ảnh chụp, ghi chú kiến trúc và kết quả.',
          },
          {
            title: 'Search và gợi ý đọc',
            detail: 'Thêm indexed search, đường đọc liên quan và topic hub quanh Laravel, hệ thống giáo dục, Vue và Next.js.',
          },
          {
            title: 'Bằng chứng cho recruiter',
            detail: 'Thêm PDF resume, link GitHub, ghi chú deploy và sơ đồ kiến trúc gọn cho phỏng vấn.',
          },
        ],
      }
    : {
        eyebrow: 'Proof Of Work',
        title: 'Project map for Laravel, education systems, CMS/CRM, chatbots, and frontend UI.',
        description:
          'The portfolio is arranged by product systems instead of random skills. Interviewers can quickly see backend depth, education domain experience, admin product thinking, and modern Vue/Next interface capability.',
        resume: 'View resume',
        brief: 'Start a brief',
        nextEyebrow: 'Next Development',
        nextTitle: 'What will make the product more attractive.',
        nextDescription:
          'The strongest next moves are not decorative. They should make your real experience more inspectable: education products, admin systems, code examples, and measurable outcomes.',
        contentEyebrow: 'Content Engine',
        contentTitle: 'The blog should support your interview narrative.',
        contentDescription:
          'Write articles around Laravel architecture, LMS decisions, CMS/CRM workflow design, education chatbot strategy, Vue.js UI patterns, and Next.js portfolio engineering.',
        readJournal: 'Read the journal',
        caseStudies: [
          {
            icon: GraduationCap,
            title: 'LMS Product Experience',
            type: 'Education platform',
            summary:
              'Experience with learning workflows: courses, lessons, learners, progress states, content operations, and role-based education journeys.',
            results: ['Course and lesson structure', 'Learner progress flows', 'Education admin UX'],
            href: '/resume',
            stack: ['LMS', 'Laravel', 'Education'],
          },
          {
            icon: LayoutDashboard,
            title: 'CMS and CRM Systems',
            type: 'Business operations',
            summary:
              'Admin-heavy systems for managing content, records, filters, statuses, dashboards, and repeated staff workflows.',
            results: ['Content models', 'Record management', 'Operational dashboards'],
            href: '/resume',
            stack: ['CMS', 'CRM', 'Admin'],
          },
          {
            icon: Bot,
            title: 'Education Chatbot Flows',
            type: 'Automation',
            summary:
              'Chatbot thinking for education: learner questions, course guidance, lead capture, FAQ automation, and support handoff.',
            results: ['FAQ automation', 'Lead capture', 'Learning support paths'],
            href: '/blog',
            stack: ['Chatbot', 'Education', 'UX'],
          },
          {
            icon: Server,
            title: 'Laravel Backend Modules',
            type: 'Backend engineering',
            summary:
              'PHP/Laravel implementation work across APIs, authentication, database relationships, validation, and maintainable business rules.',
            results: ['REST API boundaries', 'Auth and roles', 'Database modeling'],
            href: '/resume',
            stack: ['PHP', 'Laravel', 'API'],
          },
          {
            icon: PanelsTopLeft,
            title: 'Vue / Next Interface System',
            type: 'Frontend UI',
            summary:
              'Modern interface work for product dashboards and content sites using Vue.js, Next.js, React, Tailwind CSS, responsive states, and clear UI hierarchy.',
            results: ['Reusable UI components', 'Responsive layouts', 'State-aware screens'],
            href: '/',
            stack: ['Vue.js', 'Next.js', 'Tailwind'],
          },
          {
            icon: LockKeyhole,
            title: 'ShadowDev Admin Security',
            type: 'Portfolio proof',
            summary:
              'This website demonstrates protected admin login, HttpOnly sessions, noindexed admin pages, sanitized CMS payloads, and safe public read routes.',
            results: ['HttpOnly admin session', 'Protected CMS writes', 'Draft-safe public reads'],
            href: '/privacy',
            stack: ['Next.js', 'Security', 'CMS'],
          },
          {
            icon: SearchCheck,
            title: 'SEO and Discovery Layer',
            type: 'Growth foundation',
            summary:
              'Metadata, sitemap, robots, RSS, canonical URLs, Open Graph imagery, and semantic content structure built for search and sharing.',
            results: ['Route metadata', 'RSS feed', 'Share-ready article pages'],
            href: '/blog',
            stack: ['SEO', 'Content', 'Growth'],
          },
        ],
        roadmap: [
          {
            title: 'Supabase Auth with roles',
            detail: 'Move from one admin secret to multi-user login, role-based access, audit logs, and content approval states.',
          },
          {
            title: 'Education case study pages',
            detail: 'Create dedicated LMS, CMS, CRM, and chatbot case pages with screenshots, architecture notes, and outcomes.',
          },
          {
            title: 'Search and recommendations',
            detail: 'Add indexed search, related reading paths, and topic hubs around Laravel, education systems, Vue, and Next.js.',
          },
          {
            title: 'Recruiter-ready proof',
            detail: 'Add PDF resume, GitHub links, deployment notes, and a compact architecture diagram for interviews.',
          },
        ],
      };
  return (
    <>
      <Section className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-4xl"
        >
          <div className="micro-label mb-4 flex items-center gap-2">
            <BarChart3 size={15} />
            {copy.eyebrow}
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            {copy.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={localizedPath('/resume', locale)}>
                {copy.resume}
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={localizedPath('/contact', locale)}>{copy.brief}</Link>
            </Button>
          </div>
        </motion.div>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {copy.caseStudies.map((project, index) => {
            const Icon = project.icon;
            return (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="surface-card flex flex-col p-5 sm:p-6"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="micro-label mb-3">{project.type}</p>
                    <h2 className="text-2xl font-semibold text-[var(--text)]">{project.title}</h2>
                  </div>
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)]">
                    <Icon size={20} className="text-[var(--accent)]" />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{project.summary}</p>
                <ul className="mt-5 space-y-3">
                  {project.results.map((result) => (
                    <li key={result} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <CheckCircle2 size={16} className="text-[var(--accent)]" />
                      {result}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] px-3 py-1 text-xs font-medium text-[var(--text-soft)]">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-5">
                  <Button asChild variant="outline" size="sm">
                    <Link href={localizedPath(project.href, locale)}>
                      {common.inspect}
                      <ArrowRight size={15} />
                    </Link>
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Section>

      <Section withDividerTop>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <Gauge size={15} />
              {copy.nextEyebrow}
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">{copy.nextTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              {copy.nextDescription}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.roadmap.map((item) => (
              <article key={item.title} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] p-5">
                <h3 className="text-base font-semibold text-[var(--text)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section withDividerTop>
        <div className="surface-card grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <BookOpenText size={15} />
              {copy.contentEyebrow}
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">{copy.contentTitle}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              {copy.contentDescription}
            </p>
          </div>
          <Button asChild size="lg">
            <Link href={localizedPath('/blog', locale)}>
              {copy.readJournal}
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
