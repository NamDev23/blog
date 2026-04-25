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

const interviewSignals = [
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
] as const;

const proofLinks = [
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
] as const;

export default function Home() {
  // Fetch featured posts (use 6 for more content on homepage)
  const { posts: featuredPosts, loading, error } = usePosts({ limit: 6 });
  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Interview Snapshot */}
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
              Interview Ready
            </div>
            <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
              This is more than a blog. It is a live CV and product demo.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              ShadowDev now presents your skills through working surfaces: Laravel/PHP backend, education systems,
              CMS/CRM workflows, chatbot thinking, Vue/Next frontend, and a recruiter-friendly resume path.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/resume">
                  Open resume
                  <ArrowRight size={16} />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">View projects</Link>
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {interviewSignals.map((item, index) => (
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

      {/* Proof Links */}
      <Section withDividerBottom>
        <div className="mb-10 max-w-3xl">
          <div className="micro-label mb-3 flex items-center gap-2">
            <ShieldCheck size={15} />
            Proof Paths
          </div>
          <h2 className="text-3xl font-bold text-[var(--text)] sm:text-4xl">
            Clear paths for visitors, recruiters, and collaborators.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {proofLinks.map((item, index) => {
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
                <Link href={item.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
                  Open
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
          eyebrow="Featured"
          title="Latest Field Notes"
          description="Long-form writing on Laravel, education systems, CMS/CRM workflows, chatbot UX, Vue/Next interfaces, API security, and performance."
          align="center"
          className="mb-12 sm:mb-16"
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="mx-auto text-[var(--accent)] mb-4 animate-spin" size={48} />
            <p className="text-[var(--text-muted)] text-lg">Loading featured posts...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <p className="text-[var(--text-muted)] text-lg mb-2">Failed to load posts</p>
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
                <Link href="/blog">View all notes</Link>
              </Button>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && featuredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)] text-lg">No posts available yet.</p>
            <p className="text-[var(--text-soft)] text-sm mt-2">Check back soon for new notes.</p>
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
              Signal
            </div>
            <h3 className="mb-4 text-3xl font-bold text-[var(--text)] sm:text-4xl">Join the ShadowDev dispatch.</h3>
            <p className="text-[var(--text-muted)] text-sm sm:text-base text-balance">
              A practical feed for design systems, secure-by-default APIs, and performance work that survives production.
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
                Subscribe
              </Button>
            </form>
            <p className="mt-3 text-xs text-[var(--text-soft)]">No tracking pixels, no spam, no credential requests.</p>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
