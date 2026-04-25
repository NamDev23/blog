'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Code2,
  Database,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Printer,
  Server,
  ShieldCheck,
  Workflow,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Section from '@/components/ui/Section';
import { siteConfig } from '@/lib/site';

const strengths = [
  {
    icon: Server,
    label: 'PHP / Laravel',
    detail: 'Backend APIs, auth, database modeling, admin workflows, CMS logic, and maintainable business modules.',
  },
  {
    icon: GraduationCap,
    label: 'Education Systems',
    detail: 'LMS flows, course structure, learner progress, content operations, and education product thinking.',
  },
  {
    icon: LayoutDashboard,
    label: 'CMS / CRM',
    detail: 'Content management, customer/student records, dashboards, filters, roles, and operational screens.',
  },
  {
    icon: Code2,
    label: 'Vue / Next UI',
    detail: 'Modern frontend interfaces with Vue.js, Next.js, React, TypeScript, Tailwind CSS, and responsive UX.',
  },
];

const systemExperience = [
  {
    icon: GraduationCap,
    title: 'LMS Platforms',
    detail: 'Course catalogs, lesson pages, enrollment states, progress tracking, assessments, and role-based learning flows.',
  },
  {
    icon: Database,
    title: 'CMS Products',
    detail: 'Post models, categories, tags, publishing states, media fields, admin forms, and SEO-friendly content structure.',
  },
  {
    icon: Workflow,
    title: 'CRM Workflows',
    detail: 'Lead/student records, status pipelines, search/filter screens, reporting views, and repeated staff operations.',
  },
  {
    icon: Bot,
    title: 'Education Chatbots',
    detail: 'Support flows for course questions, lead capture, learning assistance, FAQ automation, and education messaging.',
  },
];

const skillGroups = [
  {
    title: 'Backend',
    items: ['PHP', 'Laravel', 'REST APIs', 'Auth', 'MySQL', 'PostgreSQL'],
  },
  {
    title: 'Frontend',
    items: ['Vue.js', 'Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Responsive UI'],
  },
  {
    title: 'Product Systems',
    items: ['LMS', 'CMS', 'CRM', 'Admin dashboards', 'Education workflows', 'Chatbot flows'],
  },
  {
    title: 'Production',
    items: ['SEO', 'Security', 'Performance', 'Supabase', 'Content modeling', 'UX writing'],
  },
];

const proof = [
  {
    title: 'Education product experience',
    meta: 'LMS / Chatbot',
    detail: 'You can discuss real education workflows: learner journeys, content delivery, automation, and support flows.',
  },
  {
    title: 'Business system thinking',
    meta: 'CMS / CRM',
    detail: 'You can explain admin screens, data relationships, roles, filters, records, and daily operational use cases.',
  },
  {
    title: 'Full-stack implementation',
    meta: 'Laravel / API / UI',
    detail: 'You can bridge backend logic and frontend UX instead of treating the interface as a separate layer.',
  },
  {
    title: 'ShadowDev as proof',
    meta: 'Next.js / CMS',
    detail: 'This project demonstrates protected admin login, blog publishing, SEO, responsive UI, and API hardening.',
  },
];

const interviewPoints = [
  'Walk through an LMS feature from database model to learner-facing screen.',
  'Explain how a CMS or CRM admin interface should support staff doing repeated work.',
  'Compare Laravel backend responsibilities with Vue.js or Next.js frontend responsibilities.',
  'Show the ShadowDev admin login, CMS posting flow, protected API routes, and SEO structure.',
];

export default function ResumePage() {
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
              Interview Profile
            </div>
            <h1 className="max-w-3xl text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl lg:text-4xl">
              Full-stack developer for education systems.
              <span className="mt-2 block text-xl leading-snug text-[var(--text-muted)] sm:text-2xl lg:text-3xl">
                CMS/CRM products, chatbot flows, and modern frontend interfaces.
              </span>
            </h1>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Laravel backend', 'Education SaaS', 'CMS/CRM UX', 'Vue / Next UI'].map((item) => (
                <span key={item} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.05)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)]">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
              {siteConfig.name} is positioned as a live CV: it presents Laravel/PHP backend experience, LMS/CMS/CRM
              product thinking, education chatbot work, and polished Vue.js or Next.js interface capability.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/projects">
                  View project map
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => window.print()}>
                <Printer size={18} />
                Print profile
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
                alt="Modern education technology workspace"
                fill
                sizes="(min-width: 1024px) 46vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d120f] via-[#0d120f]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="micro-label mb-2">Core Positioning</p>
                <h2 className="text-2xl font-semibold text-[var(--text)]">Education SaaS + Full-stack Delivery</h2>
              </div>
            </div>
            <dl className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
              {[
                ['Backend', 'PHP, Laravel, APIs'],
                ['Products', 'LMS, CMS, CRM'],
                ['Frontend', 'Vue.js, Next.js, React'],
                ['Domain', 'Education chatbot flows'],
              ].map(([label, value]) => (
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
            Capability Map
          </div>
          <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">What your profile should communicate first.</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {strengths.map((item, index) => {
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
              Product Systems
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">Experience arranged by system type.</h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]">
              This structure is interview-friendly because it maps your skills to products companies recognize:
              education platforms, content operations, customer operations, and automation.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {systemExperience.map((item, index) => {
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
            Technical Stack
          </div>
          <h2 className="text-3xl font-bold text-[var(--text)]">Skills grouped for quick scanning.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
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
            Proof Points
          </div>
          <h2 className="text-3xl font-bold text-[var(--text)]">Concrete things to show during a technical interview.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {proof.map((item, index) => (
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
        <div className="surface-card grid gap-6 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="micro-label mb-3">Interview Script</p>
            <h2 className="text-2xl font-bold text-[var(--text)] sm:text-3xl">Use this site as your technical walkthrough.</h2>
          </div>
          <ul className="space-y-3">
            {interviewPoints.map((point) => (
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
