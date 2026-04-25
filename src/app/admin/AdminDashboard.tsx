'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Edit3,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import { Post } from '@/types';
import { formatDate } from '@/lib/utils';

type StatusFilter = 'all' | 'published' | 'draft';

const opsCards = [
  {
    icon: FileText,
    title: 'Content workflow',
    detail: 'Draft, publish, edit, and review SEO quality from one admin surface.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected writes',
    detail: 'Admin pages use an HttpOnly session; API mutations still verify on the server.',
  },
  {
    icon: BarChart3,
    title: 'Portfolio signal',
    detail: 'Plan blog posts around Laravel, LMS, CMS, CRM, chatbot, Vue, and Next.js experience.',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/posts?limit=48', {
          cache: 'no-store',
        });
        const payload = await response.json().catch(() => []);

        if (!response.ok) {
          throw new Error(payload.error || 'Could not load posts.');
        }

        if (active) setPosts(Array.isArray(payload) ? payload : []);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Could not load posts.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPosts();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const published = posts.filter((post) => Boolean(post.published_at)).length;
    const drafts = posts.length - published;
    const noindex = posts.filter((post) => post.noindex).length;
    const missingSeo = posts.filter((post) => !post.seo_title || !post.seo_description).length;

    return [
      { label: 'Total posts', value: posts.length.toString() },
      { label: 'Published', value: published.toString() },
      { label: 'Drafts', value: drafts.toString() },
      { label: 'Need SEO', value: missingSeo.toString() },
      { label: 'Noindex', value: noindex.toString() },
    ];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'published' && Boolean(post.published_at)) ||
        (status === 'draft' && !post.published_at);
      const matchesQuery =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.slug.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term) ||
        post.tags.some((tag) => tag.toLowerCase().includes(term));

      return matchesStatus && matchesQuery;
    });
  }, [posts, query, status]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  }

  return (
    <>
      <Section className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="max-w-4xl">
            <div className="micro-label mb-4 flex items-center gap-2">
              <LayoutDashboard size={15} />
              Admin Dashboard
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              Manage blog content, SEO readiness, and publishing states.
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              This is the control room for ShadowDev content. Use it to create interview-ready articles, edit drafts,
              improve SEO metadata, and keep the blog aligned with your Laravel, LMS, CMS/CRM, chatbot, Vue, and Next.js profile.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button asChild>
              <Link href="/admin/posts/new">
                <FilePlus2 size={16} />
                New post
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Sign out
            </Button>
          </div>
        </motion.div>
      </Section>

      <Section withDividerBottom>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <article key={stat.label} className="surface-card p-5">
              <p className="text-xs uppercase text-[var(--text-soft)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--text)]">{stat.value}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section withDividerBottom>
        <div className="grid gap-4 md:grid-cols-3">
          {opsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="surface-card p-5"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)]">
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>
                <h2 className="text-lg font-semibold text-[var(--text)]">{card.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{card.detail}</p>
              </motion.article>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="surface-card overflow-hidden p-0">
          <div className="border-b border-[var(--line)] p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="micro-label mb-2">Posts</p>
                <h2 className="text-2xl font-semibold text-[var(--text)]">Content library</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(240px,320px)_auto]">
                <div className="relative">
                  <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search title, slug, category..."
                    className="pl-11"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.5)] p-1">
                  {(['all', 'published', 'draft'] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setStatus(item)}
                      className={`rounded-md px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                        status === item
                          ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-3 p-12 text-[var(--text-muted)]">
              <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
              Loading posts...
            </div>
          )}

          {error && !loading && (
            <div className="m-5 flex gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-300" />
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.035)] text-xs uppercase text-[var(--text-soft)]">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Title</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">SEO</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => {
                    const published = Boolean(post.published_at);
                    const seoReady = Boolean(post.seo_title && post.seo_description);
                    return (
                      <tr key={post.id} className="border-b border-[var(--line)] last:border-b-0">
                        <td className="px-5 py-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-[var(--text)]">{post.title}</p>
                            <p className="mt-1 text-xs text-[var(--text-soft)]">/{post.slug}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                            published
                              ? 'border-[rgba(102,217,194,0.32)] bg-[rgba(102,217,194,0.1)] text-[var(--accent)]'
                              : 'border-[rgba(231,182,90,0.32)] bg-[rgba(231,182,90,0.1)] text-[var(--amber)]'
                          }`}>
                            {published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                            {seoReady ? (
                              <>
                                <CheckCircle2 size={15} className="text-[var(--accent)]" />
                                Ready
                              </>
                            ) : (
                              <>
                                <AlertCircle size={15} className="text-[var(--amber)]" />
                                Needs work
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[var(--text-muted)]">{post.category}</td>
                        <td className="px-5 py-4 text-[var(--text-muted)]">
                          {post.published_at ? formatDate(post.published_at) : 'Unpublished'}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/posts/${post.slug}/edit`}>
                              <Edit3 size={14} />
                              Edit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredPosts.length === 0 && (
                <div className="p-12 text-center text-sm text-[var(--text-muted)]">
                  No posts match this filter.
                </div>
              )}
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
