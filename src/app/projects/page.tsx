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

const caseStudies = [
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
];

const roadmap = [
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
];

export default function ProjectsPage() {
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
            Proof Of Work
          </div>
          <h1 className="text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
            Project map for Laravel, education systems, CMS/CRM, chatbots, and frontend UI.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
            The portfolio is arranged by product systems instead of random skills. Interviewers can quickly see backend
            depth, education domain experience, admin product thinking, and modern Vue/Next interface capability.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/resume">
                View resume
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Start a brief</Link>
            </Button>
          </div>
        </motion.div>
      </Section>

      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {caseStudies.map((project, index) => {
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
                    <Link href={project.href}>
                      Inspect
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
              Next Development
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">What will make the product more attractive.</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              The strongest next moves are not decorative. They should make your real experience more inspectable:
              education products, admin systems, code examples, and measurable outcomes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {roadmap.map((item) => (
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
              Content Engine
            </div>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">The blog should support your interview narrative.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)]">
              Write articles around Laravel architecture, LMS decisions, CMS/CRM workflow design, education chatbot
              strategy, Vue.js UI patterns, and Next.js portfolio engineering.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/blog">
              Read the journal
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
