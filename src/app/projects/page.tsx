'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Gauge,
  GitBranch,
  LockKeyhole,
  PanelsTopLeft,
  SearchCheck,
  Server,
  Workflow,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import { commonCopy, useLanguage } from '@/lib/i18n';
import { localizedPath } from '@/lib/locales';

const PROJECTS_PER_PAGE = 4;

/**
 * Trang projects/case map.
 *
 * Dữ liệu vẫn nằm trong component vì đây là bản mô tả năng lực/case-study ngắn,
 * chưa phải CMS project thật. Pagination chạy client-side để giữ trang gọn khi số
 * lượng case tăng, đồng thời không cần thêm API riêng cho dữ liệu tĩnh này.
 */
export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const projectListTopRef = useRef<HTMLDivElement | null>(null);
  const { locale } = useLanguage();
  const common = commonCopy[locale];
  const copy = locale === 'vi'
    ? {
        eyebrow: 'Bản đồ năng lực',
        title: 'Giữ trang Dự án để người đọc thấy cách ShadowDev giải quyết vấn đề thật.',
        description:
          'Tôi vẫn giữ trang này vì nó là nơi gom bằng chứng triển khai, không chỉ là danh sách công nghệ. Mỗi thẻ mô tả một nhóm việc quan trọng: hệ thống nội dung, bảo mật API, quy trình phát hành, Docker, giám sát, cơ sở dữ liệu, SEO kỹ thuật và hiệu năng giao diện.',
        resume: 'Xem hồ sơ',
        brief: 'Trao đổi dự án',
        pageLabel: 'Trang',
        previous: 'Trước',
        next: 'Sau',
        nextEyebrow: 'Hướng phát triển',
        nextTitle: 'Cách nâng trang Dự án thành case study đầy đủ.',
        nextDescription:
          'Bước tiếp theo nên bổ sung bằng chứng cụ thể: ảnh màn hình, sơ đồ luồng xử lý, số đo trước/sau, rủi ro đã xử lý và lý do chọn từng hướng triển khai.',
        contentEyebrow: 'Mạch nội dung',
        contentTitle: 'Bài viết và dự án cần kể cùng một câu chuyện chuyên môn.',
        contentDescription:
          'Mỗi nhóm dự án nên dẫn sang bài viết liên quan: gia cố bảo mật, đóng gói bằng Docker, sao lưu dữ liệu, giám sát hệ thống, SEO kỹ thuật hoặc tối ưu hiệu năng giao diện.',
        readJournal: 'Đọc bài viết',
        caseStudies: [
          {
            icon: PanelsTopLeft,
            title: 'Nền tảng xuất bản song ngữ',
            type: 'Hệ thống nội dung',
            summary:
              'Blog có quản trị bài viết, bản nháp, trạng thái xuất bản, dữ liệu SEO, RSS, sitemap, canonical/hreflang và dữ liệu dự phòng khi chạy ở máy local.',
            focus: ['Mô hình bài viết và bản dịch', 'Luồng dữ liệu SEO', 'Xem trước trước khi đăng'],
            outcome: 'Nội dung tiếng Việt và tiếng Anh đi cùng một cấu trúc, hạn chế tình trạng một trang dùng hai ngôn ngữ lẫn lộn.',
            href: '/blog',
            stack: ['Next.js', 'Supabase', 'SEO'],
          },
          {
            icon: LockKeyhole,
            title: 'Ranh giới bảo mật cho API quản trị',
            type: 'Bảo mật ứng dụng',
            summary:
              'Tách rõ API đọc công khai và API ghi của quản trị bằng phiên HttpOnly, kiểm tra nguồn gửi, giới hạn tần suất, kiểm tra dữ liệu và chỉ trả field cần thiết.',
            focus: ['Phiên đăng nhập HttpOnly', 'Kiểm tra nguồn gửi và tần suất', 'Lọc sạch nội dung CMS'],
            outcome: 'Đăng bài, duyệt bình luận và xử lý liên hệ đều được kiểm tra ở server, không phụ thuộc vào việc ẩn nút trên giao diện.',
            href: '/privacy',
            stack: ['Auth', 'API', 'OWASP'],
          },
          {
            icon: GitBranch,
            title: 'Quy trình đưa thay đổi lên môi trường thật',
            type: 'DevOps',
            summary:
              'Luồng từ commit đến phát hành gồm lint, kiểm tra kiểu dữ liệu, build, tách môi trường, kế hoạch rollback và checklist sau khi triển khai.',
            focus: ['Kiểm tra tự động trong CI', 'Gói build có thể truy vết', 'Kịch bản rollback'],
            outcome: 'Mỗi thay đổi có đường đi rõ ràng, được kiểm tra trước khi lên môi trường thật và có tín hiệu để theo dõi sau khi phát hành.',
            href: '/blog',
            stack: ['CI/CD', 'Git', 'Deploy'],
          },
          {
            icon: Server,
            title: 'Nền chạy chuẩn hóa bằng Docker',
            type: 'Hạ tầng ứng dụng',
            summary:
              'Chuẩn hóa môi trường chạy bằng Dockerfile và Compose, tách phụ thuộc lúc build/lúc chạy, quản lý volume, mạng, biến môi trường và health check.',
            focus: ['Image nhiều giai đoạn', 'Các service trong Compose', 'Health check có ý nghĩa'],
            outcome: 'Giảm lỗi “máy em chạy được”, onboarding nhanh hơn và dễ tái tạo môi trường khi cần debug.',
            href: '/blog',
            stack: ['Docker', 'Runtime', 'Ops'],
          },
          {
            icon: Activity,
            title: 'Giám sát và sẵn sàng xử lý sự cố',
            type: 'Độ tin cậy',
            summary:
              'Thiết kế log, metric, trace, mã request, ngưỡng lỗi và cảnh báo theo dấu hiệu người dùng thật sự bị ảnh hưởng.',
            focus: ['Log có cấu trúc', 'Độ trễ p95/p99', 'Checklist xử lý sự cố'],
            outcome: 'Khi lỗi xảy ra, hệ thống có dữ liệu để xác định request, dependency, deploy liên quan và mức độ ảnh hưởng.',
            href: '/blog',
            stack: ['Logs', 'Metrics', 'Tracing'],
          },
          {
            icon: Database,
            title: 'Lớp tin cậy cho cơ sở dữ liệu',
            type: 'Vận hành dữ liệu',
            summary:
              'Thiết kế index, migration, backup, diễn tập restore, connection pool và chính sách truy cập để dữ liệu không trở thành điểm yếu vận hành.',
            focus: ['Migration an toàn', 'Diễn tập khôi phục', 'Rà soát truy vấn và index'],
            outcome: 'Dữ liệu có đường khôi phục rõ, thay đổi schema ít rủi ro hơn và truy vấn chính được tối ưu theo cách hệ thống đọc/ghi.',
            href: '/blog',
            stack: ['PostgreSQL', 'Backup', 'Indexing'],
          },
          {
            icon: SearchCheck,
            title: 'SEO kỹ thuật và khả năng được tìm thấy',
            type: 'Nền tảng tăng trưởng',
            summary:
              'Metadata từng trang, Open Graph, robots, sitemap, RSS, cấu trúc nội dung, link nội bộ và card xem trước để bài viết dễ index hơn.',
            focus: ['Canonical và hreflang', 'Ảnh chia sẻ Open Graph', 'Đường đọc liên quan'],
            outcome: 'Nội dung kỹ thuật có ngữ cảnh tìm kiếm rõ hơn, chia sẻ đẹp hơn và giúp người đọc đi sâu theo từng chủ đề.',
            href: '/blog',
            stack: ['SEO', 'Content', 'Schema'],
          },
          {
            icon: Gauge,
            title: 'Hệ thống hiệu năng giao diện',
            type: 'Kỹ thuật giao diện',
            summary:
              'Tối ưu trạng thái tải, lưới responsive, chiến lược ảnh, giới hạn animation, kích thước gói JavaScript và thứ bậc nội dung.',
            focus: ['Core Web Vitals', 'Chiến lược hình ảnh', 'Mật độ hiển thị responsive'],
            outcome: 'Giao diện nhẹ hơn, ổn định hơn trên mobile và vẫn giữ được bản sắc ShadowDev bằng hiệu ứng có kiểm soát.',
            href: '/',
            stack: ['React', 'Next.js', 'UX'],
          },
        ],
        roadmap: [
          {
            title: 'Trang chi tiết cho từng dự án',
            detail: 'Tách từng cụm thành `/projects/[slug]` với bối cảnh, kiến trúc, quyết định, ảnh chụp và kết quả đo được.',
          },
          {
            title: 'Bộ bằng chứng trực quan',
            detail: 'Bổ sung ảnh màn hình quản trị, sơ đồ luồng request, kế hoạch migration và checklist bảo mật cho từng dự án.',
          },
          {
            title: 'Ưu tiên số đo',
            detail: 'Gắn số liệu như Lighthouse, Web Vitals, tỷ lệ lỗi, độ trễ hoặc tốc độ xuất bản để người đọc có thể kiểm chứng.',
          },
          {
            title: 'Quản lý dự án trong CMS',
            detail: 'Khi số lượng dự án tăng, chuyển dữ liệu sang Supabase để khu quản trị cập nhật giống phần blog.',
          },
        ],
      }
    : {
        eyebrow: 'Case Map',
        title: 'ShadowDev project clusters presented by real engineering problems.',
        description:
          'Instead of oversized cards with generic descriptions, this page groups capability around production surfaces that matter: architecture, API security, DevOps, observability, performance, databases, and content systems.',
        resume: 'View resume',
        brief: 'Start a brief',
        pageLabel: 'Page',
        previous: 'Previous',
        next: 'Next',
        nextEyebrow: 'Roadmap',
        nextTitle: 'How Projects can evolve into full case studies.',
        nextDescription:
          'The next step should focus on evidence: screenshots, architecture diagrams, before/after metrics, handled risks, and trade-offs behind each decision.',
        contentEyebrow: 'Content Engine',
        contentTitle: 'Blog and Projects should support the same expertise story.',
        contentDescription:
          'Each case should connect to related writing: security hardening, Docker runtime, database backup, observability, technical SEO, or frontend performance.',
        readJournal: 'Read the journal',
        caseStudies: [
          {
            icon: PanelsTopLeft,
            title: 'Bilingual Technical Publishing Platform',
            type: 'Content architecture',
            summary:
              'A bilingual blog system with an admin editor, draft/publish workflow, SEO metadata, RSS, sitemap, canonical/hreflang, and local fallback data.',
            focus: ['Post model + translations', 'SEO metadata pipeline', 'Admin preview states'],
            outcome: 'Technical content stays consistent across Vietnamese and English, reducing mixed-language risk on the public site.',
            href: '/blog',
            stack: ['Next.js', 'Supabase', 'SEO'],
          },
          {
            icon: LockKeyhole,
            title: 'Admin API Security Boundary',
            type: 'Security engineering',
            summary:
              'Public read routes and admin write routes are separated with HttpOnly sessions, origin checks, rate limits, payload validation, and response minimization.',
            focus: ['HttpOnly session', 'Origin + rate limit', 'Sanitized CMS payload'],
            outcome: 'Content, comment, and contact mutations are verified server-side instead of relying on hidden frontend controls.',
            href: '/privacy',
            stack: ['Auth', 'API', 'OWASP'],
          },
          {
            icon: GitBranch,
            title: 'Production Delivery Pipeline',
            type: 'DevOps workflow',
            summary:
              'A delivery path from commit to production with linting, type checks, build artifacts, environment separation, rollback planning, and post-deploy checks.',
            focus: ['CI validation', 'Release artifact', 'Rollback playbook'],
            outcome: 'Each change has a clear path, can be verified before release, and has signals to observe after deployment.',
            href: '/blog',
            stack: ['CI/CD', 'Git', 'Deploy'],
          },
          {
            icon: Server,
            title: 'Dockerized Runtime Blueprint',
            type: 'Platform foundation',
            summary:
              'Runtime standardization through Dockerfile/Compose, build-time vs runtime dependency separation, volumes, networks, environment variables, and health checks.',
            focus: ['Multi-stage image', 'Compose services', 'Health checks'],
            outcome: 'Fewer local-only failures, faster onboarding, and easier environment reproduction when debugging production.',
            href: '/blog',
            stack: ['Docker', 'Runtime', 'Ops'],
          },
          {
            icon: Activity,
            title: 'Observability And Incident Readiness',
            type: 'Reliability',
            summary:
              'Logs, metrics, traces, correlation IDs, error budgets, and alert rules designed around user-visible symptoms.',
            focus: ['Structured logs', 'p95/p99 latency', 'Incident checklist'],
            outcome: 'When failures happen, the system has data to identify request paths, dependencies, related deploys, and user impact.',
            href: '/blog',
            stack: ['Logs', 'Metrics', 'Tracing'],
          },
          {
            icon: Database,
            title: 'Database Reliability Layer',
            type: 'Data operations',
            summary:
              'Indexes, migrations, backup plans, restore drills, connection pools, and access policies so data does not become an operational weakness.',
            focus: ['Migration safety', 'Backup restore drill', 'Query/index review'],
            outcome: 'Data has a recovery process, schema changes are lower-risk, and key queries are optimized around read/write patterns.',
            href: '/blog',
            stack: ['PostgreSQL', 'Backup', 'Indexing'],
          },
          {
            icon: SearchCheck,
            title: 'Technical SEO And Discovery',
            type: 'Growth foundation',
            summary:
              'Route metadata, Open Graph, robots, sitemap, RSS, structured content, internal linking, and preview cards for stronger indexing.',
            focus: ['Canonical/hreflang', 'Open Graph cards', 'Internal link paths'],
            outcome: 'Engineering content appears with the right search context, shares better, and lets readers go deeper by topic.',
            href: '/blog',
            stack: ['SEO', 'Content', 'Schema'],
          },
          {
            icon: Gauge,
            title: 'Frontend Performance System',
            type: 'Interface engineering',
            summary:
              'Loading states, responsive grids, image strategy, animation budgets, bundle cost, and hierarchy tuned for a sharp but usable UI.',
            focus: ['Core Web Vitals', 'Image strategy', 'Responsive density'],
            outcome: 'The interface feels lighter, works better on mobile, and keeps the ShadowDev identity through controlled visual detail.',
            href: '/',
            stack: ['React', 'Next.js', 'UX'],
          },
        ],
        roadmap: [
          {
            title: 'Case study detail pages',
            detail: 'Split each cluster into `/projects/[slug]` with context, architecture, decisions, screenshots, and measured outcomes.',
          },
          {
            title: 'Evidence gallery',
            detail: 'Add admin screenshots, request-flow diagrams, migration plans, and security checklists for each case.',
          },
          {
            title: 'Metrics first',
            detail: 'Attach Lighthouse, Web Vitals, error rate, latency, or publishing-speed metrics so readers can verify claims.',
          },
          {
            title: 'CMS-managed projects',
            detail: 'When the case count grows, move project data into Supabase so admin can manage it like blog content.',
          },
        ],
      };

  const totalPages = Math.ceil(copy.caseStudies.length / PROJECTS_PER_PAGE);
  const startIndex = (page - 1) * PROJECTS_PER_PAGE;
  const visibleProjects = copy.caseStudies.slice(startIndex, startIndex + PROJECTS_PER_PAGE);

  function goToPage(nextPage: number) {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    window.requestAnimationFrame(() => {
      projectListTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

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
          <h1 className="text-2xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
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
        <div ref={projectListTopRef} className="scroll-mt-24" />
        <div className="grid gap-4 md:grid-cols-2">
          {visibleProjects.map((project, index) => {
            const Icon = project.icon;
            return (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-4 transition-colors hover:border-[rgba(102,217,194,0.5)] sm:p-5"
              >
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(102,217,194,0.75),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="mb-4 flex items-start justify-between gap-3 sm:gap-4">
                  <div className="min-w-0">
                    <p className="micro-label mb-2">{project.type}</p>
                    <h2 className="text-lg font-semibold leading-snug text-[var(--text)] sm:text-xl">{project.title}</h2>
                  </div>
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)] shadow-[0_0_24px_rgba(102,217,194,0.1)]">
                    <Icon size={19} className="text-[var(--accent)]" />
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{project.summary}</p>

                <div className="mt-4 grid gap-2">
                  {project.focus.map((result) => (
                    <div key={result} className="flex items-start gap-2 text-xs font-medium leading-relaxed text-[var(--text-muted)]">
                      <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                      {result}
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-[rgba(231,182,90,0.18)] bg-[rgba(231,182,90,0.055)] p-3">
                  <p className="text-xs leading-relaxed text-[var(--text-muted)]">{project.outcome}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="rounded-md border border-[var(--line)] bg-[rgba(244,241,232,0.04)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-soft)]">
                      {item}
                    </span>
                  ))}
                </div>

                <Link href={localizedPath(project.href, locale)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
                  {common.inspect}
                  <ArrowRight size={15} />
                </Link>
              </motion.article>
            );
          })}
        </div>

        {totalPages > 1 && (
          <nav className="mt-8 flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.03)] p-3 sm:flex-row" aria-label="Projects pagination">
            <p className="text-xs font-semibold text-[var(--text-soft)]">
              {copy.pageLabel} {page} / {totalPages}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--line)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
              >
                <ChevronLeft size={15} />
                {copy.previous}
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-current={page === item ? 'page' : undefined}
                  className={`h-9 w-9 rounded-md border text-xs font-bold transition-colors ${
                    page === item
                      ? 'border-[var(--accent)] bg-[rgba(102,217,194,0.14)] text-[var(--accent)]'
                      : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                  }`}
                >
                  {item}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[var(--line)] px-2.5 text-xs font-semibold text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
              >
                {copy.next}
                <ChevronRight size={15} />
              </button>
            </div>
          </nav>
        )}
      </Section>

      <Section withDividerTop>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <Gauge size={15} />
              {copy.nextEyebrow}
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-4xl">{copy.nextTitle}</h2>
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
        <div className="surface-card grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <Workflow size={15} />
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
