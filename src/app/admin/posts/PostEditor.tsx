'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  FilePenLine,
  Globe2,
  Loader2,
  Save,
  SearchCheck,
  Settings2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import RichPostEditor from '@/components/admin/RichPostEditor';
import { Input } from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import { Textarea } from '@/components/ui/Textarea';
import { Post } from '@/types';
import { slugify } from '@/lib/utils';
import { createCodeCopyHandler, enhanceCodeBlocks } from '@/lib/codeBlocks';

const DEFAULT_AUTHOR_ID = '00000000-0000-0000-0000-000000000001';

type EditorMode = 'create' | 'edit';
type EditorTab = 'content' | 'seo' | 'preview';
type PublishMode = 'draft' | 'now';

type FormState = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string;
  featuredImage: string;
  content: string;
  authorId: string;
  publishMode: PublishMode;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noindex: boolean;
};

type StatusState = {
  type: 'idle' | 'success' | 'error';
  message: string;
  slug?: string;
};

type PostEditorProps = {
  mode: EditorMode;
  slug?: string;
};

const initialForm: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  category: 'Education Tech',
  tags: 'laravel, lms, cms',
  featuredImage: '',
  content:
    '<h2>Context</h2><p>Describe the product, user role, business problem, and education workflow.</p><h2>Implementation</h2><p>Explain the Laravel/API/CMS/frontend decision, tradeoffs, and measurable outcome.</p><h2>Result</h2><p>Summarize the impact, tradeoff, or lesson.</p>',
  authorId: DEFAULT_AUTHOR_ID,
  publishMode: 'draft',
  seoTitle: '',
  seoDescription: '',
  canonicalUrl: '',
  noindex: false,
};

const topicSuggestions = [
  'Laravel LMS architecture',
  'CMS admin workflow',
  'CRM pipeline for education',
  'Education chatbot flow',
  'Vue dashboard UI',
  'Next.js portfolio SEO',
];

export default function PostEditor({ mode, slug }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [tab, setTab] = useState<EditorTab>('content');
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusState>({ type: 'idle', message: '' });
  const previewRef = useRef<HTMLDivElement | null>(null);

  const resolvedSlug = useMemo(() => slugify(form.slug || form.title), [form.slug, form.title]);
  const tagList = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12),
    [form.tags]
  );
  const previewHtml = useMemo(() => sanitizePreviewHtml(form.content), [form.content]);
  const seoTitle = form.seoTitle || form.title;
  const seoDescription = form.seoDescription || form.excerpt;
  const seoScore = useMemo(() => getSeoScore(form, resolvedSlug), [form, resolvedSlug]);

  useEffect(() => {
    if (mode !== 'edit' || !slug) return;

    let active = true;

    async function loadPost() {
      setIsLoading(true);
      setStatus({ type: 'idle', message: '' });

      try {
        const response = await fetch(`/api/posts/${slug}`, { cache: 'no-store' });
        const payload = (await response.json().catch(() => null)) as Post | { error?: string } | null;

        if (!response.ok || !isPostPayload(payload)) {
          throw new Error(payload && 'error' in payload ? payload.error || 'Could not load this post.' : 'Could not load this post.');
        }

        if (!active) return;

        setForm({
          title: payload.title,
          slug: payload.slug,
          excerpt: payload.excerpt || '',
          category: payload.category || 'Education Tech',
          tags: payload.tags.join(', '),
          featuredImage: payload.featured_image || '',
          content: payload.content || initialForm.content,
          authorId: payload.author_id || DEFAULT_AUTHOR_ID,
          publishMode: payload.published_at ? 'now' : 'draft',
          seoTitle: payload.seo_title || '',
          seoDescription: payload.seo_description || '',
          canonicalUrl: payload.canonical_url || '',
          noindex: Boolean(payload.noindex),
        });
      } catch (loadError) {
        if (active) {
          setStatus({
            type: 'error',
            message: loadError instanceof Error ? loadError.message : 'Could not load this post.',
          });
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadPost();
    return () => {
      active = false;
    };
  }, [mode, slug]);

  useEffect(() => {
    if (!previewRef.current) return;

    const container = previewRef.current;
    const handleCopy = createCodeCopyHandler();
    container.addEventListener('click', handleCopy);
    return () => {
      container.removeEventListener('click', handleCopy);
    };
  }, [previewHtml]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    const payload = {
      title: form.title,
      slug: resolvedSlug,
      excerpt: form.excerpt,
      category: form.category,
      tags: tagList,
      featured_image: form.featuredImage || null,
      content: form.content,
      author_id: form.authorId,
      published_at: form.publishMode === 'now' ? 'now' : null,
      seo_title: seoTitle,
      seo_description: seoDescription,
      canonical_url: form.canonicalUrl || null,
      noindex: form.noindex,
    };

    try {
      const endpoint = mode === 'edit' && slug ? `/api/posts/${slug}` : '/api/posts';
      const response = await fetch(endpoint, {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || 'Could not save this post.');
      }

      const savedSlug = result.slug || resolvedSlug;
      setStatus({
        type: 'success',
        message: mode === 'edit' ? 'Post updated successfully.' : 'Post created successfully.',
        slug: savedSlug,
      });

      if (mode === 'create') {
        router.replace(`/admin/posts/${savedSlug}/edit`);
      } else if (savedSlug !== slug) {
        router.replace(`/admin/posts/${savedSlug}/edit`);
      }
      router.refresh();
    } catch (saveError) {
      setStatus({
        type: 'error',
        message: saveError instanceof Error ? saveError.message : 'Could not save this post.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Section className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"
        >
          <div className="max-w-4xl">
            <Link href="/admin" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] hover:underline">
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
            <div className="micro-label mb-4 flex items-center gap-2">
              <FilePenLine size={15} />
              {mode === 'edit' ? 'Edit Post' : 'New Post'}
            </div>
            <h1 className="max-w-4xl text-3xl font-bold leading-tight text-[var(--text)] sm:text-4xl lg:text-5xl">
              {mode === 'edit' ? 'Edit content, SEO, and publish state.' : 'Create a blog post with SEO built in.'}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Write articles that support your portfolio: Laravel, LMS, CMS, CRM, chatbot education, Vue.js, Next.js,
              architecture notes, and admin UX decisions.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/blog">Open public blog</Link>
          </Button>
        </motion.div>
      </Section>

      <Section>
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-[var(--text-muted)]">
            <Loader2 size={22} className="animate-spin text-[var(--accent)]" />
            Loading post...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="surface-card p-0">
              <div className="border-b border-[var(--line)] p-4 sm:p-5">
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.52)] p-1">
                  {([
                    ['content', FilePenLine, 'Content'],
                    ['seo', SearchCheck, 'SEO'],
                    ['preview', Eye, 'Preview'],
                  ] as const).map(([value, Icon, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value)}
                      className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${
                        tab === value
                          ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Icon size={16} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {tab === 'content' && (
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Title</span>
                        <Input
                          value={form.title}
                          onChange={(event) => updateField('title', event.target.value)}
                          placeholder="Lessons from building an LMS in Laravel"
                          required
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Slug</span>
                        <Input
                          value={form.slug}
                          onChange={(event) => updateField('slug', event.target.value)}
                          placeholder={resolvedSlug || 'auto-generated-from-title'}
                        />
                      </label>
                    </div>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">Excerpt</span>
                      <Textarea
                        value={form.excerpt}
                        onChange={(event) => updateField('excerpt', event.target.value)}
                        placeholder="A short summary for cards, search, and metadata."
                        rows={3}
                        required
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Category</span>
                        <Input
                          value={form.category}
                          onChange={(event) => updateField('category', event.target.value)}
                          placeholder="Education Tech"
                          required
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Tags</span>
                        <Input
                          value={form.tags}
                          onChange={(event) => updateField('tags', event.target.value)}
                          placeholder="laravel, lms, cms"
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Featured image URL</span>
                        <Input
                          value={form.featuredImage}
                          onChange={(event) => updateField('featuredImage', event.target.value)}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Author ID</span>
                        <Input
                          value={form.authorId}
                          onChange={(event) => updateField('authorId', event.target.value)}
                          placeholder={DEFAULT_AUTHOR_ID}
                          required
                        />
                      </label>
                    </div>

                    <div className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">Content</span>
                      <RichPostEditor
                        value={form.content}
                        onChange={(content) => updateField('content', content)}
                        featuredImage={form.featuredImage}
                      />
                    </div>
                  </div>
                )}

                {tab === 'seo' && (
                  <div className="grid gap-5">
                    <div className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="micro-label mb-1">SEO Score</p>
                          <h2 className="text-2xl font-bold text-[var(--text)]">{seoScore.score}/100</h2>
                        </div>
                        <div className={`rounded-lg border px-3 py-1 text-xs font-semibold ${seoScore.score >= 80 ? 'border-[rgba(102,217,194,0.35)] text-[var(--accent)]' : 'border-[rgba(231,182,90,0.35)] text-[var(--amber)]'}`}>
                          {seoScore.score >= 80 ? 'Ready' : 'Needs work'}
                        </div>
                      </div>
                      <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                        {seoScore.notes.map((note) => (
                          <li key={note} className="flex gap-2">
                            <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <label className="grid gap-2">
                      <span className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--text)]">
                        SEO title
                        <span className="text-xs text-[var(--text-soft)]">{seoTitle.length}/60 recommended</span>
                      </span>
                      <Input
                        value={form.seoTitle}
                        onChange={(event) => updateField('seoTitle', event.target.value)}
                        placeholder={form.title || 'SEO title'}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--text)]">
                        Meta description
                        <span className="text-xs text-[var(--text-soft)]">{seoDescription.length}/155 recommended</span>
                      </span>
                      <Textarea
                        value={form.seoDescription}
                        onChange={(event) => updateField('seoDescription', event.target.value)}
                        placeholder={form.excerpt || 'Search result description'}
                        rows={4}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--text)]">Canonical URL</span>
                      <Input
                        value={form.canonicalUrl}
                        onChange={(event) => updateField('canonicalUrl', event.target.value)}
                        placeholder="Leave empty for the default blog URL"
                      />
                    </label>

                    <label className="flex items-start gap-3 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-4">
                      <input
                        type="checkbox"
                        checked={form.noindex}
                        onChange={(event) => updateField('noindex', event.target.checked)}
                        className="mt-1 h-4 w-4 accent-[var(--accent)]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--text)]">Noindex this post</span>
                        <span className="mt-1 block text-xs leading-relaxed text-[var(--text-muted)]">
                          Use for drafts, private notes, or thin pages that should not appear in search results.
                        </span>
                      </span>
                    </label>
                  </div>
                )}

                {tab === 'preview' && (
                  <div className="grid gap-5">
                    <div className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-5">
                      <p className="micro-label mb-2">Search Preview</p>
                      <p className="text-xs text-[var(--accent)]">shadowdev.dev/blog/{resolvedSlug || 'post-slug'}</p>
                      <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{seoTitle || 'Untitled post'}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                        {seoDescription || 'Meta description preview appears here.'}
                      </p>
                    </div>

                    <article className="rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.45)] p-5">
                      <div className="mb-4 flex flex-wrap gap-2">
                        <span className="rounded-lg border border-[rgba(231,182,90,0.32)] bg-[rgba(231,182,90,0.1)] px-3 py-1 text-xs font-semibold text-[var(--amber)]">
                          {form.category || 'Category'}
                        </span>
                        {tagList.map((tag) => (
                          <span key={tag} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)] px-3 py-1 text-xs text-[var(--text-muted)]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-3xl font-bold text-[var(--text)]">{form.title || 'Untitled post'}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{form.excerpt || 'Excerpt preview appears here.'}</p>
                      <div
                        ref={previewRef}
                        className="prose prose-invert mt-6 max-w-none text-sm text-[var(--text-muted)]"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    </article>
                  </div>
                )}
              </div>
            </div>

            <aside className="space-y-4">
              <div className="surface-card p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Settings2 size={17} className="text-[var(--accent)]" />
                  <h2 className="font-semibold text-[var(--text)]">Publish settings</h2>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.55)] p-1">
                  {(['draft', 'now'] as const).map((modeItem) => (
                    <button
                      key={modeItem}
                      type="button"
                      onClick={() => updateField('publishMode', modeItem)}
                      className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                        form.publishMode === modeItem
                          ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      {modeItem === 'draft' ? 'Draft' : 'Publish'}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-soft)]">
                  Drafts stay hidden from public API requests. Published posts become public unless noindex is enabled.
                </p>
              </div>

              <div className="surface-card-subtle p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Globe2 size={17} className="text-[var(--amber)]" />
                  <h2 className="font-semibold text-[var(--text)]">Topic strategy</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topicSuggestions.map((topic) => (
                    <span key={topic} className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] px-3 py-1.5 text-xs text-[var(--text-muted)]">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {status.type !== 'idle' && (
                <div
                  className={`rounded-lg border p-4 text-sm ${
                    status.type === 'success'
                      ? 'border-[rgba(102,217,194,0.35)] bg-[rgba(102,217,194,0.09)] text-[var(--text)]'
                      : 'border-red-500/35 bg-red-500/10 text-red-100'
                  }`}
                >
                  <div className="flex gap-3">
                    {status.type === 'success' ? (
                      <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-[var(--accent)]" />
                    ) : (
                      <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-300" />
                    )}
                    <div>
                      <p>{status.message}</p>
                      {status.slug && (
                        <Link href={`/blog/${status.slug}`} className="mt-2 inline-flex text-[var(--accent)] hover:underline">
                          Open public post
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create post'}
              </Button>
            </aside>
          </form>
        )}
      </Section>
    </>
  );
}

function getSeoScore(form: FormState, slug: string) {
  let score = 0;
  const notes: string[] = [];
  const title = form.seoTitle || form.title;
  const description = form.seoDescription || form.excerpt;
  const wordCount = form.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

  if (title.length >= 30 && title.length <= 60) {
    score += 25;
    notes.push('SEO title length is in a good range.');
  } else {
    notes.push('Aim for a 30-60 character SEO title.');
  }

  if (description.length >= 120 && description.length <= 160) {
    score += 25;
    notes.push('Meta description is search-result friendly.');
  } else {
    notes.push('Aim for a 120-160 character meta description.');
  }

  if (slug && slug.length <= 80) {
    score += 15;
    notes.push('Slug is concise.');
  } else {
    notes.push('Keep the slug short and readable.');
  }

  if (form.featuredImage) {
    score += 10;
    notes.push('Featured image is set for cards and sharing.');
  } else {
    notes.push('Add a featured image for share previews.');
  }

  if (form.category && form.tags.split(',').filter((tag) => tag.trim()).length >= 2) {
    score += 15;
    notes.push('Category and tags support discovery.');
  } else {
    notes.push('Use one clear category and at least two tags.');
  }

  if (wordCount >= 250) {
    score += 10;
    notes.push('Content has enough depth for a useful article.');
  } else {
    notes.push('Add more depth before publishing.');
  }

  return { score: Math.min(score, 100), notes };
}

function isPostPayload(value: Post | { error?: string } | null): value is Post {
  return Boolean(
    value &&
      'id' in value &&
      'title' in value &&
      'slug' in value &&
      'content' in value &&
      'tags' in value &&
      Array.isArray(value.tags)
  );
}

function sanitizePreviewHtml(value: string) {
  return enhanceCodeBlocks(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=\S+/gi, '')
    .replace(/\s(href|src)=(["'])javascript:[\s\S]*?\2/gi, ' $1="#"');
}
