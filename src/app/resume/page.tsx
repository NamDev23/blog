'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Database,
  Gauge,
  LayoutDashboard,
  Printer,
  Server,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import { siteConfig } from '@/lib/site';
import { useLanguage } from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';

const strengths = [
  {
    icon: Server,
    label: 'Backend & API',
    detail: 'RESTful APIs, authentication, authorization, validation, database modeling, background jobs, and maintainable service boundaries.',
  },
  {
    icon: ShieldCheck,
    label: 'Security Engineering',
    detail: 'Secure sessions, API hardening, rate limiting, CSP, input validation, least privilege, and careful public data exposure.',
  },
  {
    icon: Workflow,
    label: 'DevOps & Delivery',
    detail: 'Dockerized runtime, CI/CD validation, environment separation, release discipline, rollback planning, and operational checklists.',
  },
  {
    icon: Code2,
    label: 'Frontend Systems',
    detail: 'Modern interfaces with Next.js, React, Vue.js, TypeScript, Tailwind CSS, responsive states, accessibility, and performance budgets.',
  },
];

const systemExperience = [
  {
    icon: LayoutDashboard,
    title: 'Admin-heavy Platforms',
    detail: 'Dashboards, filters, moderation queues, publishing states, role-based screens, and repeated operational workflows.',
  },
  {
    icon: Database,
    title: 'Data Reliability',
    detail: 'Schema design, migrations, indexes, query review, backup/restore thinking, and safe handling of user-generated data.',
  },
  {
    icon: Gauge,
    title: 'Performance Engineering',
    detail: 'Core Web Vitals, caching strategy, image delivery, bundle budgets, loading states, and production monitoring signals.',
  },
  {
    icon: Workflow,
    title: 'Automation And Delivery',
    detail: 'CI/CD pipelines, containerized environments, structured release notes, rollback plans, and incident-ready operating habits.',
  },
];

const skillGroups = [
  {
    title: 'Backend',
    items: ['Node.js', 'PHP', 'Laravel', 'REST APIs', 'Auth', 'PostgreSQL'],
  },
  {
    title: 'Frontend',
    items: ['Vue.js', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Responsive UI'],
  },
  {
    title: 'Platform',
    items: ['Docker', 'CI/CD', 'Linux basics', 'Git workflow', 'Supabase', 'Environment config'],
  },
  {
    title: 'Production',
    items: ['SEO', 'Security', 'Performance', 'Observability', 'Content modeling', 'UX writing'],
  },
];

const proof = [
  {
    title: 'Production product thinking',
    meta: 'Architecture / UX',
    detail: 'You can discuss product requirements as system boundaries, user workflows, data ownership, latency, and operational risk.',
  },
  {
    title: 'Secure-by-default implementation',
    meta: 'API / Security',
    detail: 'You can explain why authorization, validation, rate limits, response shaping, and secure cookies belong on the server.',
  },
  {
    title: 'Full-stack implementation',
    meta: 'API / UI / Data',
    detail: 'You can connect backend logic, data design, admin workflow, and frontend states instead of treating UI as a separate layer.',
  },
  {
    title: 'ShadowDev as proof',
    meta: 'Next.js / CMS / SEO',
    detail: 'This project demonstrates protected admin login, bilingual publishing, SEO, responsive UI, API hardening, and operational content workflows.',
  },
];

const interviewPoints = [
  'Walk through a feature from domain model to API contract, admin workflow, frontend state, and observability signal.',
  'Explain how you would harden a public form, comment system, or admin write API against common attacks.',
  'Discuss Docker, CI/CD, environment variables, rollback, logs, metrics, and production readiness for a web app.',
  'Show the ShadowDev admin login, bilingual CMS publishing flow, protected API routes, SEO structure, and pagination behavior.',
];

/**
 * Trang resume dạng "CV sống".
 *
 * Nội dung được nhóm theo năng lực, hệ thống sản phẩm và bằng chứng phỏng vấn để
 * người đọc kỹ thuật hiểu nhanh kinh nghiệm thực tế. Các mảng data ở đầu file
 * giúp layout render lặp lại nhất quán và dễ chuyển sang CMS sau này.
 */
export default function ResumePage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        eyebrow: 'Hồ sơ phỏng vấn',
        title: 'Kỹ sư full-stack có tư duy sản phẩm và vận hành.',
        subtitle: 'Kiến trúc, bảo mật API, DevOps, hiệu năng giao diện và hệ thống nội dung.',
        badges: ['5-6 năm kinh nghiệm', 'Backend và API', 'Tư duy DevOps', 'Ưu tiên bảo mật'],
        description:
          `${siteConfig.name} được định vị như một CV sống cho kỹ sư có khả năng đi từ yêu cầu sản phẩm đến kiến trúc, API, cơ sở dữ liệu, giao diện, SEO, bảo mật và vận hành trên môi trường thật.`,
        projectMap: 'Xem bản đồ dự án',
        print: 'In hồ sơ',
        corePositioning: 'Định vị cốt lõi',
        imageTitle: 'Kỹ thuật sản phẩm và phát hành an toàn',
        facts: [
          ['Kinh nghiệm', '5-6 năm full-stack'],
          ['Backend', 'API, xác thực, dữ liệu'],
          ['Frontend', 'Next.js, React, Vue.js'],
          ['Vận hành', 'Bảo mật, DevOps, SEO'],
        ],
        capabilityEyebrow: 'Bản đồ năng lực',
        capabilityTitle: 'Điều hồ sơ kỹ thuật nên truyền tải đầu tiên.',
        systemEyebrow: 'Hệ thống sản phẩm',
        systemTitle: 'Kinh nghiệm được sắp xếp theo năng lực vận hành thực tế.',
        systemDescription:
          'Cấu trúc này giúp người đọc đánh giá chiều sâu thay vì chỉ nhìn danh sách framework: hệ thống quản trị, dữ liệu, hiệu năng, bảo mật, quy trình phát hành và khả năng vận hành sau khi deploy.',
        stackEyebrow: 'Bộ kỹ năng',
        stackTitle: 'Kỹ năng được nhóm để đọc nhanh.',
        proofEyebrow: 'Bằng chứng',
        proofTitle: 'Những điểm cụ thể để trình bày trong phỏng vấn kỹ thuật.',
        scriptEyebrow: 'Kịch bản phỏng vấn',
        scriptTitle: 'Dùng website này làm walkthrough kỹ thuật.',
        strengths: [
          {
            icon: Server,
            label: 'Backend và API',
            detail: 'REST API, xác thực, phân quyền, kiểm tra dữ liệu, mô hình dữ liệu, tác vụ nền và ranh giới service dễ bảo trì.',
          },
          {
            icon: ShieldCheck,
            label: 'Kỹ thuật bảo mật',
            detail: 'Phiên đăng nhập an toàn, gia cố API, giới hạn tần suất, CSP, kiểm tra đầu vào, least privilege và giảm dữ liệu public.',
          },
          {
            icon: Workflow,
            label: 'DevOps và phát hành',
            detail: 'Môi trường chạy bằng Docker, kiểm tra CI/CD, tách môi trường, kỷ luật phát hành, rollback và checklist vận hành.',
          },
          {
            icon: Code2,
            label: 'Hệ thống giao diện',
            detail: 'Giao diện với Next.js, React, Vue.js, TypeScript, Tailwind CSS, trạng thái responsive, khả năng truy cập và giới hạn hiệu năng.',
          },
        ],
        systemExperience: [
          {
            icon: LayoutDashboard,
            title: 'Nền tảng nhiều màn hình quản trị',
            detail: 'Dashboard, bộ lọc, hàng đợi duyệt nội dung, trạng thái xuất bản, màn hình theo quyền và quy trình vận hành lặp lại.',
          },
          {
            icon: Database,
            title: 'Độ tin cậy dữ liệu',
            detail: 'Thiết kế schema, migration, index, rà soát truy vấn, backup/restore và xử lý an toàn dữ liệu do người dùng tạo.',
          },
          {
            icon: Gauge,
            title: 'Kỹ thuật hiệu năng',
            detail: 'Core Web Vitals, chiến lược bộ nhớ đệm, phân phối hình ảnh, giới hạn gói JavaScript, trạng thái tải và tín hiệu giám sát.',
          },
          {
            icon: Workflow,
            title: 'Tự động hóa và phát hành',
            detail: 'Pipeline CI/CD, môi trường container, ghi chú phát hành rõ ràng, kế hoạch rollback và thói quen sẵn sàng xử lý sự cố.',
          },
        ],
        skillGroups: [
          {
            title: 'Backend',
            items: ['Node.js', 'PHP', 'Laravel', 'REST APIs', 'Auth', 'PostgreSQL'],
          },
          {
            title: 'Frontend',
            items: ['Vue.js', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Responsive UI'],
          },
          {
            title: 'Nền tảng',
            items: ['Docker', 'CI/CD', 'Linux cơ bản', 'Quy trình Git', 'Supabase', 'Cấu hình môi trường'],
          },
          {
            title: 'Vận hành',
            items: ['SEO', 'Bảo mật', 'Hiệu năng', 'Giám sát', 'Mô hình nội dung', 'Viết UX'],
          },
        ],
        proof: [
          {
            title: 'Tư duy sản phẩm trên môi trường thật',
            meta: 'Kiến trúc / UX',
            detail: 'Có thể chuyển yêu cầu sản phẩm thành ranh giới hệ thống, quy trình người dùng, quyền sở hữu dữ liệu, độ trễ và rủi ro vận hành.',
          },
          {
            title: 'Triển khai an toàn từ mặc định',
            meta: 'API / Bảo mật',
            detail: 'Có thể giải thích vì sao phân quyền, kiểm tra dữ liệu, giới hạn tần suất, định hình response và cookie an toàn phải nằm ở server.',
          },
          {
            title: 'Triển khai full-stack',
            meta: 'API / UI / Data',
            detail: 'Có thể nối logic backend, thiết kế dữ liệu, quy trình quản trị và trạng thái frontend thay vì xem UI là lớp tách rời.',
          },
          {
            title: 'ShadowDev làm bằng chứng',
            meta: 'Next.js / CMS / SEO',
            detail: 'Dự án này chứng minh đăng nhập quản trị, xuất bản song ngữ, SEO, giao diện responsive, gia cố API và quy trình nội dung.',
          },
        ],
        interviewPoints: [
          'Đi qua một tính năng từ mô hình nghiệp vụ, hợp đồng API, quy trình quản trị, trạng thái giao diện đến tín hiệu giám sát.',
          'Giải thích cách gia cố form công khai, hệ thống bình luận hoặc API ghi của quản trị trước các kiểu tấn công phổ biến.',
          'Trình bày Docker, CI/CD, biến môi trường, rollback, log, metric và mức sẵn sàng vận hành cho một web app.',
          'Trình bày đăng nhập quản trị ShadowDev, CMS song ngữ, API được bảo vệ, cấu trúc SEO và hành vi phân trang.',
        ],
      }
    : {
        eyebrow: 'Interview Profile',
        title: 'Full-stack/product engineer with production discipline.',
        subtitle: 'Architecture, API security, DevOps, frontend performance, and content systems.',
        badges: ['5-6 years experience', 'Backend & API', 'DevOps mindset', 'Security-first UI'],
        description:
          `${siteConfig.name} is positioned as a live CV for an engineer who can move from product requirements to architecture, APIs, databases, interfaces, SEO, security, and production operations.`,
        projectMap: 'View project map',
        print: 'Print profile',
        corePositioning: 'Core Positioning',
        imageTitle: 'Product Engineering + Secure Delivery',
        facts: [
          ['Experience', '5-6 years full-stack'],
          ['Backend', 'APIs, auth, data models'],
          ['Frontend', 'Vue.js, Next.js, React'],
          ['Production', 'Security, DevOps, SEO'],
        ],
        capabilityEyebrow: 'Capability Map',
        capabilityTitle: 'What a technical profile should communicate first.',
        systemEyebrow: 'Product Systems',
        systemTitle: 'Experience arranged by production capability.',
        systemDescription:
          'This structure helps readers assess depth instead of scanning a framework list: admin systems, data, performance, security, delivery, and behavior after deploy.',
        stackEyebrow: 'Technical Stack',
        stackTitle: 'Skills grouped for quick scanning.',
        proofEyebrow: 'Proof Points',
        proofTitle: 'Concrete things to show during a technical interview.',
        scriptEyebrow: 'Interview Script',
        scriptTitle: 'Use this site as your technical walkthrough.',
        strengths,
        systemExperience,
        skillGroups,
        proof,
        interviewPoints,
      };
  return (
    <>
      <Section className="relative overflow-hidden border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="micro-label mb-4 flex items-center gap-2">
              <BriefcaseBusiness size={15} />
              {copy.eyebrow}
            </div>
            <h1 className="max-w-3xl text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
              {copy.title}
              <span className="mt-2 block text-xl leading-snug text-[var(--text-muted)] sm:text-2xl lg:text-3xl">
                {copy.subtitle}
              </span>
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {copy.badges.map((item) => (
                <span key={item} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.05)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {copy.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={localizedPath('/projects', locale)}>
                  {copy.projectMap}
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
                <Printer size={18} />
                {copy.print}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="surface-card overflow-hidden p-0"
          >
            <div className="relative aspect-[16/10] border-b border-[var(--line)]">
              <Image
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=800&fit=crop"
                alt="Modern product engineering workspace"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d120f] via-[#0d120f]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="micro-label mb-2">{copy.corePositioning}</p>
                <h2 className="text-2xl font-semibold text-[var(--text)]">{copy.imageTitle}</h2>
              </div>
            </div>
            <dl className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {copy.facts.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-4">
                  <dt className="text-xs uppercase text-[var(--text-soft)]">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-[var(--text)]">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </div>
      </Section>

      <Section>
        <div className="mb-10 max-w-3xl">
          <div className="micro-label mb-3 flex items-center gap-2">
            <Gauge size={15} />
            {copy.capabilityEyebrow}
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] sm:text-4xl">{copy.capabilityTitle}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {copy.strengths.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="surface-card p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)]">
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-base font-semibold text-[var(--text)]">{item.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
              </motion.article>
            );
          })}
        </div>
      </Section>

      <Section withDividerTop>
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <LayoutDashboard size={15} />
              {copy.systemEyebrow}
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-4xl">{copy.systemTitle}</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              {copy.systemDescription}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {copy.systemExperience.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] p-5"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-[rgba(231,182,90,0.28)] bg-[rgba(231,182,90,0.1)]">
                    <Icon size={19} className="text-[var(--amber)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Section>

      <Section withDividerTop>
        <div className="mb-10 max-w-3xl">
          <div className="micro-label mb-3 flex items-center gap-2">
            <Code2 size={15} />
            {copy.stackEyebrow}
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">{copy.stackTitle}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {copy.skillGroups.map((group) => (
            <article key={group.title} className="surface-card p-5">
              <h3 className="text-lg font-semibold text-[var(--text)]">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span key={item} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)]">
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section withDividerTop>
        <div className="mb-10 max-w-3xl">
          <div className="micro-label mb-3 flex items-center gap-2">
            <ShieldCheck size={15} />
            {copy.proofEyebrow}
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">{copy.proofTitle}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {copy.proof.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.06 }}
              className="surface-card p-5 sm:p-6"
            >
              <p className="micro-label mb-3">{item.meta}</p>
              <h3 className="text-xl font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.detail}</p>
            </motion.article>
          ))}
        </div>
      </Section>

      <Section withDividerTop>
        <div className="surface-card grid gap-6 p-5 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="micro-label mb-3">{copy.scriptEyebrow}</p>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">{copy.scriptTitle}</h2>
          </div>
          <ul className="space-y-3">
            {copy.interviewPoints.map((point) => (
              <li key={point} className="flex gap-3 text-sm leading-relaxed text-[var(--text-muted)]">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
