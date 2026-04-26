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
  Sparkles,
  Settings2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import RichPostEditor from '@/components/admin/RichPostEditor';
import PostCard from '@/components/PostCard';
import { Input } from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import { Textarea } from '@/components/ui/Textarea';
import { Post, PostTranslation } from '@/types';
import { slugify } from '@/lib/utils';
import { createCodeCopyHandler, enhanceCodeBlocks } from '@/lib/codeBlocks';

const DEFAULT_AUTHOR_ID = '00000000-0000-0000-0000-000000000001';

type EditorMode = 'create' | 'edit';
type EditorTab = 'content' | 'seo' | 'preview';
type PublishMode = 'draft' | 'now';
type ContentLocale = 'vi' | 'en';

type LocalizedFields = {
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
};

type FormState = {
  vi: LocalizedFields;
  en: LocalizedFields;
  slug: string;
  category: string;
  tags: string;
  featuredImage: string;
  authorId: string;
  publishMode: PublishMode;
  canonicalUrl: string;
  noindex: boolean;
};

type StatusState = {
  type: 'idle' | 'success' | 'error';
  message: string;
  slug?: string;
};

type TranslationApiResult = {
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  seo_title?: unknown;
  seo_description?: unknown;
  error?: unknown;
};

type SeoSuggestionApiResult = {
  seo_title?: unknown;
  seo_description?: unknown;
  slug?: unknown;
  tags?: unknown;
  focus_keyword?: unknown;
  notes?: unknown;
  error?: unknown;
};

type PostEditorProps = {
  mode: EditorMode;
  slug?: string;
};

const initialLocalizedFields: Record<ContentLocale, LocalizedFields> = {
  vi: {
    title: '',
    excerpt: '',
    content:
      '<h2>Bối cảnh</h2><p>Mô tả vấn đề kỹ thuật, người dùng bị ảnh hưởng, ràng buộc hệ thống và rủi ro production.</p><h2>Triển khai</h2><p>Giải thích quyết định architecture/API/security/performance, tradeoff và kết quả đo được.</p><h2>Kết quả</h2><p>Tóm tắt tác động, đánh đổi, checklist áp dụng và bài học.</p>',
    seoTitle: '',
    seoDescription: '',
  },
  en: {
    title: '',
    excerpt: '',
    content:
      '<h2>Context</h2><p>Describe the engineering problem, affected users, system constraints, and production risk.</p><h2>Implementation</h2><p>Explain the architecture/API/security/performance decision, tradeoffs, and measurable outcome.</p><h2>Result</h2><p>Summarize the impact, tradeoff, reusable checklist, and lesson.</p>',
    seoTitle: '',
    seoDescription: '',
  },
};

const initialForm: FormState = {
  vi: initialLocalizedFields.vi,
  en: initialLocalizedFields.en,
  slug: '',
  category: 'Architecture',
  tags: 'architecture, security, devops',
  featuredImage: '',
  authorId: DEFAULT_AUTHOR_ID,
  publishMode: 'draft',
  canonicalUrl: '',
  noindex: false,
};

const languageLabels: Record<ContentLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

const topicSuggestions = [
  'API security hardening',
  'Docker production runtime',
  'Observability incident checklist',
  'Database backup and restore',
  'Frontend performance budget',
  'Next.js technical SEO',
];

export default function PostEditor({ mode, slug }: PostEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [tab, setTab] = useState<EditorTab>('content');
  const [activeLocale, setActiveLocale] = useState<ContentLocale>('vi');
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [seoSuggestionNotes, setSeoSuggestionNotes] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusState>({ type: 'idle', message: '' });
  const previewRef = useRef<HTMLDivElement | null>(null);

  const activeFields = form[activeLocale];
  const resolvedSlug = useMemo(() => slugify(form.slug || form.vi.title || form.en.title), [form.slug, form.vi.title, form.en.title]);
  // Tags lưu trong Supabase dưới dạng mảng, nhưng editor dùng chuỗi phân tách dấu
  // phẩy để admin không cần thao tác UI phức tạp khi thêm/xóa nhanh.
  const tagList = useMemo(
    () =>
      form.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 12),
    [form.tags]
  );
  // HTML preview được sanitize trước khi render. Admin được tin cậy để viết bài,
  // nhưng nội dung paste từ tool ngoài vẫn không nên chạy script trong editor.
  const previewHtml = useMemo(() => sanitizePreviewHtml(activeFields.content), [activeFields.content]);
  const seoTitle = activeFields.seoTitle || activeFields.title;
  const seoDescription = activeFields.seoDescription || activeFields.excerpt;
  // Dùng lại card blog public trong preview để lỗi hiển thị được thấy ngay khi
  // biên tập, không phải sau khi publish.
  const previewPost = useMemo(
    () => buildPreviewPost(form, activeLocale, resolvedSlug, tagList, seoTitle, seoDescription),
    [form, activeLocale, resolvedSlug, tagList, seoTitle, seoDescription]
  );
  const seoScore = useMemo(() => getSeoScore(activeFields, resolvedSlug), [activeFields, resolvedSlug]);
  const languageReadiness = useMemo(() => getLanguageReadiness(form), [form]);
  const translationTargetLocale = getOtherLocale(activeLocale);
  const translationBlockers = useMemo(
    () => getTranslationBlockers(activeFields, activeLocale),
    [activeFields, activeLocale]
  );
  const seoSuggestionBlockers = useMemo(
    () => getSeoSuggestionBlockers(activeFields, activeLocale),
    [activeFields, activeLocale]
  );
  const targetHasDraftContent = hasAnyLocalizedContent(form[translationTargetLocale], translationTargetLocale);
  const translationActionLabel = `${targetHasDraftContent ? 'Regenerate' : 'Generate'} ${languageLabels[translationTargetLocale]}`;

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

        const viTranslation = getPostTranslation(payload, 'vi');
        const enTranslation = getPostTranslation(payload, 'en');

        setForm({
          vi: {
            title: viTranslation?.title || payload.title,
            excerpt: viTranslation?.excerpt || payload.excerpt || '',
            content: viTranslation?.content || payload.content || initialLocalizedFields.vi.content,
            seoTitle: viTranslation?.seo_title || payload.seo_title || '',
            seoDescription: viTranslation?.seo_description || payload.seo_description || '',
          },
          en: {
            title: enTranslation?.title || '',
            excerpt: enTranslation?.excerpt || '',
            content: enTranslation?.content || initialLocalizedFields.en.content,
            seoTitle: enTranslation?.seo_title || '',
            seoDescription: enTranslation?.seo_description || '',
          },
          slug: payload.slug,
          category: payload.category || 'Education Tech',
          tags: payload.tags.join(', '),
          featuredImage: payload.featured_image || '',
          authorId: payload.author_id || DEFAULT_AUTHOR_ID,
          publishMode: payload.published_at ? 'now' : 'draft',
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

    // Nút copy code được inject vào HTML sinh ra, nên listener đặt ở container
    // preview thay vì gắn riêng từng button.
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

  function updateLocalizedField<K extends keyof LocalizedFields>(
    locale: ContentLocale,
    field: K,
    value: LocalizedFields[K]
  ) {
    setForm((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        [field]: value,
      },
    }));
  }

  /**
   * Gọi endpoint AI server-side để admin chỉ cần viết một bản ngôn ngữ.
   *
   * API key không bao giờ lộ ra client: UI chỉ gửi nội dung nguồn về route admin,
   * route đó mới gọi OpenAI, sanitize kết quả rồi trả lại dữ liệu cho editor.
   */
  async function requestTranslation(sourceLocale: ContentLocale, currentForm: FormState = form): Promise<FormState> {
    const targetLocale = getOtherLocale(sourceLocale);
    const sourceFields = currentForm[sourceLocale];
    const blockers = getTranslationBlockers(sourceFields, sourceLocale);

    if (blockers.length) {
      throw new Error(`Cannot generate ${languageLabels[targetLocale]} yet: ${blockers.join(' ')}`);
    }

    setIsTranslating(true);

    try {
      const response = await fetch('/api/admin/translate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_locale: sourceLocale,
          target_locale: targetLocale,
          title: sourceFields.title,
          excerpt: sourceFields.excerpt,
          content: sourceFields.content,
          seo_title: sourceFields.seoTitle || sourceFields.title,
          seo_description: sourceFields.seoDescription || sourceFields.excerpt,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as TranslationApiResult;
      if (!response.ok) {
        throw new Error(readApiError(result) || 'Could not generate the translated version.');
      }

      const translatedFields: LocalizedFields = {
        title: readString(result.title),
        excerpt: readString(result.excerpt),
        content: readString(result.content),
        seoTitle: readString(result.seo_title),
        seoDescription: readString(result.seo_description),
      };

      if (!hasPublishableLocalizedContent(translatedFields)) {
        throw new Error('AI translation returned incomplete content. Please retry or edit the target language manually.');
      }

      const nextForm = {
        ...currentForm,
        [targetLocale]: translatedFields,
      };

      setForm(nextForm);
      setActiveLocale(targetLocale);
      setStatus({
        type: 'success',
        message: `${languageLabels[targetLocale]} version generated. Review it before publishing.`,
      });

      return nextForm;
    } finally {
      setIsTranslating(false);
    }
  }

  async function handleGenerateSeoSuggestions() {
    setStatus({ type: 'idle', message: '' });
    setSeoSuggestionNotes([]);

    if (seoSuggestionBlockers.length) {
      setStatus({
        type: 'error',
        message: `Cannot generate SEO suggestions yet: ${seoSuggestionBlockers.join(' ')}`,
      });
      return;
    }

    setIsGeneratingSeo(true);

    try {
      const response = await fetch('/api/admin/seo-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: activeLocale,
          title: activeFields.title,
          excerpt: activeFields.excerpt,
          content: activeFields.content,
          category: form.category,
          tags: tagList,
        }),
      });

      const result = (await response.json().catch(() => ({}))) as SeoSuggestionApiResult;
      if (!response.ok) {
        throw new Error(readApiError(result) || 'Could not generate SEO suggestions.');
      }

      const suggestedSeoTitle = readString(result.seo_title);
      const suggestedSeoDescription = readString(result.seo_description);
      const suggestedSlug = slugify(readString(result.slug));
      const suggestedTags = readStringArray(result.tags);
      const notes = readStringArray(result.notes);

      if (!suggestedSeoTitle || suggestedSeoDescription.length < 60) {
        throw new Error('AI SEO suggestions returned incomplete metadata.');
      }

      setForm((current) => ({
        ...current,
        slug: current.slug || suggestedSlug || resolvedSlug,
        tags: mergeTags(current.tags, suggestedTags),
        [activeLocale]: {
          ...current[activeLocale],
          seoTitle: suggestedSeoTitle,
          seoDescription: suggestedSeoDescription,
        },
      }));
      setSeoSuggestionNotes(notes);
      setStatus({
        type: 'success',
        message: `SEO suggestions generated for ${languageLabels[activeLocale]}. Review them before saving.`,
      });
    } catch (seoError) {
      setStatus({
        type: 'error',
        message: seoError instanceof Error ? seoError.message : 'Could not generate SEO suggestions.',
      });
    } finally {
      setIsGeneratingSeo(false);
    }
  }

  async function handleTranslateFromActiveLocale() {
    setStatus({ type: 'idle', message: '' });

    try {
      await requestTranslation(activeLocale);
    } catch (translationError) {
      setStatus({
        type: 'error',
        message: translationError instanceof Error ? translationError.message : 'Could not generate the translated version.',
      });
    }
  }

  /**
   * Khi admin publish mà chỉ có một bản ngôn ngữ hoàn chỉnh, hệ thống tự tạo bản
   * còn lại trước khi gọi API lưu bài. Nếu cả hai đều chưa đủ dữ liệu thì không
   * cố dịch để tránh publish nội dung mỏng hoặc sai ngữ cảnh.
   */
  async function ensureBilingualForPublish(currentForm: FormState) {
    const readiness = getLanguageReadiness(currentForm);
    if (readiness.vi && readiness.en) return currentForm;

    const sourceLocale = findTranslationSource(currentForm);
    if (!sourceLocale) {
      throw new Error('Publish requires one complete language version so AI can generate the other version.');
    }

    return requestTranslation(sourceLocale, currentForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    let formToSave = form;

    if (form.publishMode === 'now') {
      try {
        formToSave = await ensureBilingualForPublish(form);
      } catch (translationError) {
        setStatus({
          type: 'error',
          message: translationError instanceof Error ? translationError.message : 'Could not prepare the bilingual post.',
        });
        setIsSubmitting(false);
        return;
      }
    }

    const payloadSlug = slugify(formToSave.slug || formToSave.vi.title || formToSave.en.title);
    const payloadTags = formToSave.tags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 12);

    // Chuẩn hóa state editor sang contract của API. Validation và sanitize cuối
    // cùng vẫn nằm ở route layer; UI chỉ tập trung vào trải nghiệm biên tập.
    const payload = {
      title: formToSave.vi.title,
      slug: payloadSlug,
      excerpt: formToSave.vi.excerpt,
      category: formToSave.category,
      tags: payloadTags,
      featured_image: formToSave.featuredImage || null,
      content: formToSave.vi.content,
      author_id: formToSave.authorId,
      published_at: formToSave.publishMode === 'now' ? 'now' : null,
      seo_title: formToSave.vi.seoTitle || formToSave.vi.title,
      seo_description: formToSave.vi.seoDescription || formToSave.vi.excerpt,
      canonical_url: formToSave.canonicalUrl || null,
      noindex: formToSave.noindex,
      translations: {
        vi: toTranslationPayload('vi', formToSave.vi),
        en: toTranslationPayload('en', formToSave.en),
      },
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

      const savedSlug = result.slug || payloadSlug;
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
              Write articles that support ShadowDev: architecture, API security, DevOps, Docker, observability,
              performance, database reliability, technical SEO, and admin UX decisions.
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
                <LanguageSwitcher
                  activeLocale={activeLocale}
                  readiness={languageReadiness}
                  onChange={setActiveLocale}
                />

                {tab === 'content' && (
                  <div className="grid gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">Title ({languageLabels[activeLocale]})</span>
                        <Input
                          value={activeFields.title}
                          onChange={(event) => updateLocalizedField(activeLocale, 'title', event.target.value)}
                          placeholder={activeLocale === 'vi' ? 'Checklist harden API admin trong Next.js' : 'Hardening an admin API in Next.js'}
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
                      <span className="text-sm font-medium text-[var(--text)]">Excerpt ({languageLabels[activeLocale]})</span>
                      <Textarea
                        value={activeFields.excerpt}
                        onChange={(event) => updateLocalizedField(activeLocale, 'excerpt', event.target.value)}
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
                      <span className="text-sm font-medium text-[var(--text)]">Content ({languageLabels[activeLocale]})</span>
                      <RichPostEditor
                        value={activeFields.content}
                        onChange={(content) => updateLocalizedField(activeLocale, 'content', content)}
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

                    <div className="rounded-lg border border-[rgba(102,217,194,0.25)] bg-[rgba(102,217,194,0.06)] p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[var(--text)]">AI SEO suggestions</p>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--text-soft)]">
                            Generate a search-friendly title, meta description, slug, and tag suggestions for {languageLabels[activeLocale]}.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting || isTranslating || isGeneratingSeo}
                          onClick={handleGenerateSeoSuggestions}
                        >
                          {isGeneratingSeo ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                          {isGeneratingSeo ? 'Generating...' : 'Suggest SEO'}
                        </Button>
                      </div>
                      {seoSuggestionBlockers.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[var(--amber)]">
                          {seoSuggestionBlockers.map((blocker) => (
                            <li key={blocker}>- {blocker}</li>
                          ))}
                        </ul>
                      )}
                      {seoSuggestionNotes.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[var(--text-muted)]">
                          {seoSuggestionNotes.map((note) => (
                            <li key={note}>- {note}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <label className="grid gap-2">
                      <span className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--text)]">
                        SEO title
                        <span className="text-xs text-[var(--text-soft)]">{seoTitle.length}/60 recommended</span>
                      </span>
                      <Input
                        value={activeFields.seoTitle}
                        onChange={(event) => updateLocalizedField(activeLocale, 'seoTitle', event.target.value)}
                        placeholder={activeFields.title || 'SEO title'}
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="flex items-center justify-between gap-3 text-sm font-medium text-[var(--text)]">
                        Meta description
                        <span className="text-xs text-[var(--text-soft)]">{seoDescription.length}/155 recommended</span>
                      </span>
                      <Textarea
                        value={activeFields.seoDescription}
                        onChange={(event) => updateLocalizedField(activeLocale, 'seoDescription', event.target.value)}
                        placeholder={activeFields.excerpt || 'Search result description'}
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
                      <p className="micro-label mb-4">Blog Card Preview</p>
                      <div className="mx-auto max-w-md">
                        <PostCard post={previewPost} index={0} />
                      </div>
                    </div>

                    <div className="rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-5">
                      <p className="micro-label mb-2">Search Preview</p>
                      <p className="text-xs text-[var(--accent)]">shadowdev.dev/{activeLocale}/blog/{resolvedSlug || 'post-slug'}</p>
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
                      <h2 className="text-3xl font-bold text-[var(--text)]">{activeFields.title || 'Untitled post'}</h2>
                      <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{activeFields.excerpt || 'Excerpt preview appears here.'}</p>
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
                  Drafts stay hidden from public API requests. Published posts require both Vietnamese and English content.
                </p>
                {form.publishMode === 'now' && (!languageReadiness.vi || !languageReadiness.en) && (
                  <p className="mt-3 rounded-lg border border-[rgba(231,182,90,0.32)] bg-[rgba(231,182,90,0.08)] p-3 text-xs leading-relaxed text-[var(--amber)]">
                    Publish will generate the missing language automatically if one version is complete.
                  </p>
                )}
              </div>

              <div className="surface-card-subtle p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Sparkles size={17} className="text-[var(--accent)]" />
                  <h2 className="font-semibold text-[var(--text)]">AI translation</h2>
                </div>
                <p className="text-xs leading-relaxed text-[var(--text-soft)]">
                  Use {languageLabels[activeLocale]} as the source and fill {languageLabels[translationTargetLocale]}. HTML, code blocks,
                  commands, API names, and file paths are kept unchanged.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full"
                  disabled={isSubmitting || isTranslating || isGeneratingSeo}
                  onClick={handleTranslateFromActiveLocale}
                >
                  {isTranslating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {isTranslating
                    ? 'Generating...'
                    : translationActionLabel}
                </Button>
                {translationBlockers.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs leading-relaxed text-[var(--amber)]">
                    {translationBlockers.map((blocker) => (
                      <li key={blocker}>- {blocker}</li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-xs leading-relaxed text-[var(--text-soft)]">
                  Drafts are not translated on every keystroke to avoid latency, AI cost, and overwriting manual edits. Generate when the
                  source draft is ready; publish also auto-generates the missing language if one version is complete.
                </p>
                {targetHasDraftContent && (
                  <p className="mt-3 rounded-lg border border-[rgba(231,182,90,0.28)] bg-[rgba(231,182,90,0.08)] p-3 text-xs leading-relaxed text-[var(--amber)]">
                    Regenerating will replace the current {languageLabels[translationTargetLocale]} draft in this editor.
                  </p>
                )}
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

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || isTranslating || isGeneratingSeo}>
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

function LanguageSwitcher({
  activeLocale,
  readiness,
  onChange,
}: {
  activeLocale: ContentLocale;
  readiness: Record<ContentLocale, boolean>;
  onChange: (locale: ContentLocale) => void;
}) {
  return (
    <div className="mb-5 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="micro-label mb-1">Bilingual CMS</p>
          <p className="text-xs text-[var(--text-soft)]">
            Soạn một ngôn ngữ trước, dùng AI để tạo bản còn lại rồi review trước khi publish.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(['vi', 'en'] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => onChange(locale)}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
              activeLocale === locale
                ? 'border-[rgba(102,217,194,0.45)] bg-[rgba(102,217,194,0.14)] text-[var(--accent)]'
                : 'border-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <span>{languageLabels[locale]}</span>
            <span className={readiness[locale] ? 'text-[var(--accent)]' : 'text-[var(--amber)]'}>
              {readiness[locale] ? 'Ready' : 'Draft'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function getLanguageReadiness(form: FormState): Record<ContentLocale, boolean> {
  return {
    vi: hasPublishableLocalizedContent(form.vi, 'vi'),
    en: hasPublishableLocalizedContent(form.en, 'en'),
  };
}

function hasPublishableLocalizedContent(fields: LocalizedFields, locale?: ContentLocale) {
  return getTranslationBlockers(fields, locale).length === 0;
}

function getTranslationBlockers(fields: LocalizedFields, locale?: ContentLocale) {
  const blockers: string[] = [];
  const contentText = getContentText(fields.content);

  if (!fields.title.trim()) blockers.push('Title is required.');
  if (fields.excerpt.trim().length < 20) blockers.push('Excerpt needs at least 20 characters.');
  if (contentText.length < 20 || isInitialTemplateContent(fields.content, locale)) {
    blockers.push('Body content needs real article text, not the starter template.');
  }

  return blockers;
}

function getSeoSuggestionBlockers(fields: LocalizedFields, locale: ContentLocale) {
  const blockers: string[] = [];
  const contentText = getContentText(fields.content);

  if (!fields.title.trim()) blockers.push('Title is required for SEO suggestions.');
  if (fields.excerpt.trim().length < 20 && contentText.length < 80) {
    blockers.push('Add a useful excerpt or at least 80 characters of body content.');
  }
  if (isInitialTemplateContent(fields.content, locale)) {
    blockers.push('Replace the starter template before generating SEO suggestions.');
  }

  return blockers;
}

function hasAnyLocalizedContent(fields: LocalizedFields, locale: ContentLocale) {
  return Boolean(
    fields.title.trim() ||
      fields.excerpt.trim() ||
      fields.seoTitle.trim() ||
      fields.seoDescription.trim() ||
      (getContentText(fields.content) && !isInitialTemplateContent(fields.content, locale))
  );
}

function getContentText(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isInitialTemplateContent(value: string, locale?: ContentLocale) {
  if (!locale) return false;
  return normalizeHtmlForComparison(value) === normalizeHtmlForComparison(initialLocalizedFields[locale].content);
}

function normalizeHtmlForComparison(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function getOtherLocale(locale: ContentLocale): ContentLocale {
  return locale === 'vi' ? 'en' : 'vi';
}

function findTranslationSource(form: FormState): ContentLocale | null {
  const readiness = getLanguageReadiness(form);
  if (readiness.vi && !readiness.en) return 'vi';
  if (readiness.en && !readiness.vi) return 'en';
  return null;
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean)
    .slice(0, 8);
}

function readApiError(value: { error?: unknown }) {
  return typeof value.error === 'string' ? value.error : '';
}

function mergeTags(currentTags: string, suggestedTags: string[]) {
  const merged = [
    ...currentTags.split(',').map((tag) => tag.trim().toLowerCase()),
    ...suggestedTags.map((tag) => tag.trim().toLowerCase()),
  ].filter(Boolean);

  return [...new Set(merged)].slice(0, 12).join(', ');
}

function toTranslationPayload(locale: ContentLocale, fields: LocalizedFields) {
  return {
    locale,
    title: fields.title,
    excerpt: fields.excerpt,
    content: fields.content,
    seo_title: fields.seoTitle || fields.title,
    seo_description: fields.seoDescription || fields.excerpt,
  };
}

function getPostTranslation(post: Post, locale: ContentLocale): PostTranslation | undefined {
  const translations = post.post_translations || post.translations || [];
  return translations.find((translation) => translation.locale === locale);
}

function getSeoScore(fields: LocalizedFields, slug: string) {
  // Điểm SEO chỉ là hướng dẫn biên tập, không phải cam kết thứ hạng search engine.
  // Mục tiêu là bắt metadata thiếu trước khi publish và giữ bài viết nhất quán.
  let score = 0;
  const notes: string[] = [];
  const title = fields.seoTitle || fields.title;
  const description = fields.seoDescription || fields.excerpt;
  const wordCount = fields.content.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;

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

  if (wordCount >= 250) {
    score += 35;
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

/**
 * Tạo object có shape `Post` cho card preview trong admin.
 *
 * Component card public kỳ vọng contract giống API trả về. Dùng lại ở đây giúp
 * preview admin phản ánh đúng thực tế: nếu layout card public đổi, preview editor
 * cũng đổi theo thay vì bị lệch.
 */
function buildPreviewPost(
  form: FormState,
  locale: ContentLocale,
  slug: string,
  tags: string[],
  seoTitle: string,
  seoDescription: string
): Post {
  const now = new Date().toISOString();
  const fields = form[locale];

  return {
    id: 'preview-post',
    title: fields.title || 'Untitled post',
    slug: slug || 'post-slug',
    content: fields.content || '',
    excerpt: fields.excerpt || 'Excerpt preview appears here.',
    featured_image: form.featuredImage || null,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    canonical_url: form.canonicalUrl || null,
    noindex: form.noindex,
    author_id: form.authorId || DEFAULT_AUTHOR_ID,
    category: form.category || 'Category',
    tags,
    published_at: now,
    created_at: now,
    updated_at: now,
    view_count: 0,
  };
}

function sanitizePreviewHtml(value: string) {
  // Mirror đủ gần với sanitizer ở route để preview admin an toàn. API vẫn sanitize
  // lần cuối trước khi ghi nội dung vào Supabase.
  return enhanceCodeBlocks(value)
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+=(["']).*?\1/gi, '')
    .replace(/\son\w+=\S+/gi, '')
    .replace(/\s(href|src)=(["'])javascript:[\s\S]*?\2/gi, ' $1="#"');
}
