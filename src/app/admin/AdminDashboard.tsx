'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FilePlus2,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MailOpen,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import { useDebounce } from '@/hooks/useDebounce';
import { Comment, ContactMessage, Post } from '@/types';
import { formatDate } from '@/lib/utils';

type AdminView = 'overview' | 'posts' | 'comments' | 'inbox';
type StatusFilter = 'all' | 'published' | 'draft';
type CommentFilter = 'all' | 'pending' | 'approved';
type MessageFilter = 'all' | ContactMessage['status'];
type MessageStatus = ContactMessage['status'];

type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type SummaryState = {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  pendingComments: number;
  newMessages: number;
};

type ListResponse<T> = {
  data: T[];
  pagination: PaginationState;
};

const POSTS_LIMIT = 8;
const COMMENTS_LIMIT = 6;
const MESSAGES_LIMIT = 6;

const emptyPagination = (limit: number): PaginationState => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 1,
});

const adminNavItems: Array<{
  id: AdminView;
  label: string;
  detail: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Overview', detail: 'Health and queues', icon: LayoutDashboard },
  { id: 'posts', label: 'Posts', detail: 'Content library', icon: FileText },
  { id: 'comments', label: 'Comments', detail: 'Moderation', icon: MessageSquare },
  { id: 'inbox', label: 'Inbox', detail: 'Contact messages', icon: Inbox },
];

const opsCards = [
  {
    icon: FileText,
    title: 'Content workflow',
    detail: 'Draft, publish, edit, and review SEO state.',
  },
  {
    icon: ShieldCheck,
    title: 'Protected writes',
    detail: 'Admin writes use server-side checks and an HttpOnly session.',
  },
  {
    icon: BarChart3,
    title: 'Operational signal',
    detail: 'Moderation queues and contact messages stay visible.',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('posts');
  const [summary, setSummary] = useState<SummaryState>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    pendingComments: 0,
    newMessages: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [postLookup, setPostLookup] = useState<Map<string, string>>(new Map());

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsPagination, setPostsPagination] = useState<PaginationState>(emptyPagination(POSTS_LIMIT));
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [status, setStatus] = useState<StatusFilter>('all');

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsPagination, setCommentsPagination] = useState<PaginationState>(emptyPagination(COMMENTS_LIMIT));
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [commentFilter, setCommentFilter] = useState<CommentFilter>('all');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesPagination, setMessagesPagination] = useState<PaginationState>(emptyPagination(MESSAGES_LIMIT));
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState('');
  const [messageFilter, setMessageFilter] = useState<MessageFilter>('all');

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);

    try {
      const [postsAll, postsPublished, postsDrafts, commentsPending, messagesNew] = await Promise.all([
        fetch('/api/posts?meta=true&limit=100', { cache: 'no-store' }),
        fetch('/api/posts?meta=true&limit=1&status=published', { cache: 'no-store' }),
        fetch('/api/posts?meta=true&limit=1&status=draft', { cache: 'no-store' }),
        fetch('/api/comments?meta=true&limit=1&approved=false', { cache: 'no-store' }),
        fetch('/api/contact/messages?meta=true&limit=1&status=new', { cache: 'no-store' }),
      ]);

      const [postsAllPayload, postsPublishedPayload, postsDraftsPayload, commentsPendingPayload, messagesNewPayload] =
        await Promise.all([
          postsAll.json().catch(() => null),
          postsPublished.json().catch(() => null),
          postsDrafts.json().catch(() => null),
          commentsPending.json().catch(() => null),
          messagesNew.json().catch(() => null),
        ]);
      const postsAllList = normalizeListResponse<Post>(postsAllPayload, 100, 1);

      setPostLookup(new Map(postsAllList.data.map((post) => [post.id, post.title])));

      setSummary({
        totalPosts: postsAllList.pagination.total,
        publishedPosts: getTotal(postsPublishedPayload),
        draftPosts: getTotal(postsDraftsPayload),
        pendingComments: getTotal(commentsPendingPayload),
        newMessages: getTotal(messagesNewPayload),
      });
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async (page = postsPagination.page) => {
    setPostsLoading(true);
    setPostsError('');

    try {
      const params = new URLSearchParams({
        meta: 'true',
        page: String(page),
        limit: String(POSTS_LIMIT),
      });

      if (debouncedQuery.trim()) params.set('search', debouncedQuery.trim());
      if (status !== 'all') params.set('status', status);

      const response = await fetch(`/api/posts?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not load posts.');
      }

      const normalized = normalizeListResponse<Post>(payload, POSTS_LIMIT, page);
      setPosts(normalized.data);
      setPostsPagination(normalized.pagination);
    } catch (loadError) {
      setPostsError(loadError instanceof Error ? loadError.message : 'Could not load posts.');
      setPosts([]);
      setPostsPagination(emptyPagination(POSTS_LIMIT));
    } finally {
      setPostsLoading(false);
    }
  }, [debouncedQuery, postsPagination.page, status]);

  const loadComments = useCallback(async (page = commentsPagination.page) => {
    setCommentsLoading(true);
    setCommentsError('');

    try {
      const params = new URLSearchParams({
        meta: 'true',
        page: String(page),
        limit: String(COMMENTS_LIMIT),
      });

      if (commentFilter === 'pending') params.set('approved', 'false');
      if (commentFilter === 'approved') params.set('approved', 'true');

      const response = await fetch(`/api/comments?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not load comments.');
      }

      const normalized = normalizeListResponse<Comment>(payload, COMMENTS_LIMIT, page);
      setComments(normalized.data);
      setCommentsPagination(normalized.pagination);
    } catch (loadError) {
      setCommentsError(loadError instanceof Error ? loadError.message : 'Could not load comments.');
      setComments([]);
      setCommentsPagination(emptyPagination(COMMENTS_LIMIT));
    } finally {
      setCommentsLoading(false);
    }
  }, [commentFilter, commentsPagination.page]);

  const loadMessages = useCallback(async (page = messagesPagination.page) => {
    setMessagesLoading(true);
    setMessagesError('');

    try {
      const params = new URLSearchParams({
        meta: 'true',
        page: String(page),
        limit: String(MESSAGES_LIMIT),
      });

      if (messageFilter !== 'all') params.set('status', messageFilter);

      const response = await fetch(`/api/contact/messages?${params.toString()}`, { cache: 'no-store' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not load contact messages.');
      }

      const normalized = normalizeListResponse<ContactMessage>(payload, MESSAGES_LIMIT, page);
      setMessages(normalized.data);
      setMessagesPagination(normalized.pagination);
    } catch (loadError) {
      setMessagesError(loadError instanceof Error ? loadError.message : 'Could not load contact messages.');
      setMessages([]);
      setMessagesPagination(emptyPagination(MESSAGES_LIMIT));
    } finally {
      setMessagesLoading(false);
    }
  }, [messageFilter, messagesPagination.page]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (activeView === 'posts') loadPosts(postsPagination.page);
  }, [activeView, loadPosts, postsPagination.page]);

  useEffect(() => {
    if (activeView === 'comments') loadComments(commentsPagination.page);
  }, [activeView, commentsPagination.page, loadComments]);

  useEffect(() => {
    if (activeView === 'inbox') loadMessages(messagesPagination.page);
  }, [activeView, loadMessages, messagesPagination.page]);

  useEffect(() => {
    setPostsPagination((current) => ({ ...current, page: 1 }));
  }, [debouncedQuery, status]);

  useEffect(() => {
    setCommentsPagination((current) => ({ ...current, page: 1 }));
  }, [commentFilter]);

  useEffect(() => {
    setMessagesPagination((current) => ({ ...current, page: 1 }));
  }, [messageFilter]);

  const postTitleById = useMemo(() => {
    const lookup = new Map(postLookup);
    posts.forEach((post) => lookup.set(post.id, post.title));
    return lookup;
  }, [postLookup, posts]);

  const summaryCards = [
    { label: 'Total posts', value: summary.totalPosts },
    { label: 'Published', value: summary.publishedPosts },
    { label: 'Drafts', value: summary.draftPosts },
    { label: 'Pending comments', value: summary.pendingComments },
    { label: 'New inbox', value: summary.newMessages },
  ];

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' }).catch(() => null);
    router.replace('/admin/login');
  }

  async function refreshActiveView() {
    await loadSummary();
    if (activeView === 'posts') await loadPosts(postsPagination.page);
    if (activeView === 'comments') await loadComments(commentsPagination.page);
    if (activeView === 'inbox') await loadMessages(messagesPagination.page);
  }

  async function updateCommentApproval(commentId: string, approved: boolean) {
    setActionId(`comment:${commentId}`);
    setCommentsError('');

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not update comment.');
      }

      await Promise.all([loadComments(commentsPagination.page), loadSummary()]);
    } catch (actionError) {
      setCommentsError(actionError instanceof Error ? actionError.message : 'Could not update comment.');
    } finally {
      setActionId(null);
    }
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm('Delete this comment permanently?')) return;

    setActionId(`comment:${commentId}`);
    setCommentsError('');

    try {
      const response = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not delete comment.');
      }

      await Promise.all([loadComments(commentsPagination.page), loadSummary()]);
    } catch (actionError) {
      setCommentsError(actionError instanceof Error ? actionError.message : 'Could not delete comment.');
    } finally {
      setActionId(null);
    }
  }

  async function updateMessageStatus(messageId: string, nextStatus: MessageStatus) {
    setActionId(`message:${messageId}`);
    setMessagesError('');

    try {
      const response = await fetch(`/api/contact/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not update message.');
      }

      await Promise.all([loadMessages(messagesPagination.page), loadSummary()]);
    } catch (actionError) {
      setMessagesError(actionError instanceof Error ? actionError.message : 'Could not update message.');
    } finally {
      setActionId(null);
    }
  }

  async function deleteMessage(messageId: string) {
    if (!window.confirm('Delete this inbox message permanently?')) return;

    setActionId(`message:${messageId}`);
    setMessagesError('');

    try {
      const response = await fetch(`/api/contact/messages/${messageId}`, { method: 'DELETE' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPayloadError(payload) || 'Could not delete message.');
      }

      await Promise.all([loadMessages(messagesPagination.page), loadSummary()]);
    } catch (actionError) {
      setMessagesError(actionError instanceof Error ? actionError.message : 'Could not delete message.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <Section className="border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)] py-8 sm:py-10">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="micro-label mb-3 flex items-center gap-2">
              <LayoutDashboard size={15} />
              Admin Dashboard
            </div>
            <h1 className="text-2xl font-bold leading-tight text-[var(--text)] sm:text-3xl">
              Manage publishing, moderation, and inbox operations.
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Button asChild>
              <Link href="/admin/posts/new">
                <FilePlus2 size={16} />
                New post
              </Link>
            </Button>
            <Button type="button" variant="outline" onClick={refreshActiveView}>
              <RefreshCw size={16} />
              Refresh
            </Button>
            <Button type="button" variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              Sign out
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[206px_1fr] lg:items-start">
          <aside className="surface-card p-3 lg:sticky lg:top-24">
            <nav className="grid gap-1" aria-label="Admin sections">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      active
                        ? 'border border-[rgba(102,217,194,0.34)] bg-[rgba(102,217,194,0.12)] text-[var(--text)]'
                        : 'border border-transparent text-[var(--text-muted)] hover:bg-[rgba(244,241,232,0.05)] hover:text-[var(--text)]'
                    }`}
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.04)]">
                      <Icon size={17} className={active ? 'text-[var(--accent)]' : 'text-[var(--text-soft)]'} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="block truncate text-xs text-[var(--text-soft)]">{item.detail}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-w-0">
            {activeView === 'overview' && renderOverview()}
            {activeView === 'posts' && renderPosts()}
            {activeView === 'comments' && renderComments()}
            {activeView === 'inbox' && renderInbox()}
          </main>
        </div>
      </Section>
    </>
  );

  function renderOverview() {
    return (
      <div className="grid gap-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {summaryCards.map((stat) => (
            <article key={stat.label} className="surface-card p-5">
              <p className="text-xs uppercase text-[var(--text-soft)]">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-[var(--text)]">
                {summaryLoading ? <Loader2 size={24} className="animate-spin text-[var(--accent)]" /> : stat.value}
              </p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {opsCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="surface-card p-5">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.28)] bg-[rgba(102,217,194,0.1)]">
                  <Icon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text)]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{card.detail}</p>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  function renderPosts() {
    return (
      <section className="surface-card overflow-hidden p-0">
        <PanelHeader
          label="Posts"
          title="Content library"
          detail={`${postsPagination.total} ${postsPagination.total === 1 ? 'post' : 'posts'}`}
        />

        <div className="border-b border-[var(--line)] p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,420px)_auto] lg:items-center lg:justify-between">
            <div className="relative">
              <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title, slug, category..."
                className="pl-11"
              />
            </div>
            <SegmentedControl
              value={status}
              items={[
                { value: 'all', label: 'All' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
              onChange={(next) => setStatus(next as StatusFilter)}
            />
          </div>
        </div>

        {postsLoading && <LoadingRow label="Loading posts..." />}
        {postsError && !postsLoading && <ErrorBanner message={postsError} />}

        {!postsLoading && !postsError && (
          <>
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
                  {posts.map((post) => {
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
                          <StatusPill tone={published ? 'success' : 'warning'}>{published ? 'Published' : 'Draft'}</StatusPill>
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
              {posts.length === 0 && <EmptyState label="No posts match this filter." />}
            </div>
            <PaginationControls
              pagination={postsPagination}
              loading={postsLoading}
              onPageChange={(page) => setPostsPagination((current) => ({ ...current, page }))}
            />
          </>
        )}
      </section>
    );
  }

  function renderComments() {
    return (
      <section className="surface-card overflow-hidden p-0">
        <PanelHeader
          label="Moderation"
          title="Comments"
          detail={`${commentsPagination.total} ${commentsPagination.total === 1 ? 'comment' : 'comments'}`}
        />

        <div className="border-b border-[var(--line)] p-5">
          <SegmentedControl
            value={commentFilter}
            items={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Approved' },
            ]}
            onChange={(next) => setCommentFilter(next as CommentFilter)}
          />
        </div>

        {commentsLoading && <LoadingRow label="Loading comments..." />}
        {commentsError && !commentsLoading && <ErrorBanner message={commentsError} />}
        {!commentsLoading && !commentsError && comments.length === 0 && <EmptyState label="No comments found." />}

        {!commentsLoading && !commentsError && comments.length > 0 && (
          <>
            <div className="divide-y divide-[var(--line)]">
              {comments.map((comment) => {
                const busy = actionId === `comment:${comment.id}`;

                return (
                  <article key={comment.id} className="p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <StatusPill tone={comment.approved ? 'success' : 'warning'}>
                            {comment.approved ? 'Approved' : 'Pending'}
                          </StatusPill>
                          <span className="text-xs text-[var(--text-soft)]">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="font-semibold text-[var(--text)]">{comment.author_name}</p>
                        {comment.author_email && (
                          <a href={`mailto:${comment.author_email}`} className="mt-1 block text-xs text-[var(--text-soft)] hover:text-[var(--accent)]">
                            {comment.author_email}
                          </a>
                        )}
                        <p className="mt-2 text-xs text-[var(--text-soft)]">
                          On: {postTitleById.get(comment.post_id) || comment.post_id}
                        </p>
                        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">
                          {comment.content}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateCommentApproval(comment.id, !comment.approved)}
                          disabled={busy}
                        >
                          {busy ? <Loader2 size={14} className="animate-spin" /> : comment.approved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                          {comment.approved ? 'Unapprove' : 'Approve'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteComment(comment.id)}
                          disabled={busy}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <PaginationControls
              pagination={commentsPagination}
              loading={commentsLoading}
              onPageChange={(page) => setCommentsPagination((current) => ({ ...current, page }))}
            />
          </>
        )}
      </section>
    );
  }

  function renderInbox() {
    return (
      <section className="surface-card overflow-hidden p-0">
        <PanelHeader
          label="Inbox"
          title="Contact messages"
          detail={`${messagesPagination.total} ${messagesPagination.total === 1 ? 'message' : 'messages'}`}
        />

        <div className="border-b border-[var(--line)] p-5">
          <SegmentedControl
            value={messageFilter}
            items={[
              { value: 'all', label: 'All' },
              { value: 'new', label: 'New' },
              { value: 'read', label: 'Read' },
              { value: 'archived', label: 'Archived' },
            ]}
            onChange={(next) => setMessageFilter(next as MessageFilter)}
          />
        </div>

        {messagesLoading && <LoadingRow label="Loading inbox..." />}
        {messagesError && !messagesLoading && <ErrorBanner message={messagesError} />}
        {!messagesLoading && !messagesError && messages.length === 0 && <EmptyState label="No contact messages found." />}

        {!messagesLoading && !messagesError && messages.length > 0 && (
          <>
            <div className="divide-y divide-[var(--line)]">
              {messages.map((message) => {
                const busy = actionId === `message:${message.id}`;

                return (
                  <article key={message.id} className="p-5">
                    <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <StatusPill tone={message.status === 'new' ? 'warning' : message.status === 'read' ? 'success' : 'muted'}>
                            {message.status}
                          </StatusPill>
                          <span className="text-xs text-[var(--text-soft)]">{formatDate(message.created_at)}</span>
                        </div>
                        <p className="font-semibold text-[var(--text)]">{message.subject}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">{message.name}</p>
                        <a href={`mailto:${message.email}`} className="mt-1 block text-xs text-[var(--text-soft)] hover:text-[var(--accent)]">
                          {message.email}
                        </a>
                        <p className="mt-3 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-[var(--text-muted)]">
                          {message.message}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {message.status !== 'read' && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateMessageStatus(message.id, 'read')}
                            disabled={busy}
                          >
                            {busy ? <Loader2 size={14} className="animate-spin" /> : <MailOpen size={14} />}
                            Read
                          </Button>
                        )}
                        {message.status !== 'archived' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateMessageStatus(message.id, 'archived')}
                            disabled={busy}
                          >
                            <Archive size={14} />
                            Archive
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateMessageStatus(message.id, 'new')}
                            disabled={busy}
                          >
                            <Inbox size={14} />
                            Reopen
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMessage(message.id)}
                          disabled={busy}
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
            <PaginationControls
              pagination={messagesPagination}
              loading={messagesLoading}
              onPageChange={(page) => setMessagesPagination((current) => ({ ...current, page }))}
            />
          </>
        )}
      </section>
    );
  }
}

function PanelHeader({ label, title, detail }: { label: string; title: string; detail: string }) {
  return (
    <div className="border-b border-[var(--line)] p-5 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="micro-label mb-2">{label}</p>
          <h2 className="text-2xl font-semibold text-[var(--text)]">{title}</h2>
        </div>
        <p className="text-sm text-[var(--text-soft)]">{detail}</p>
      </div>
    </div>
  );
}

function SegmentedControl({
  value,
  items,
  onChange,
}: {
  value: string;
  items: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-1 rounded-lg border border-[var(--line)] bg-[rgba(13,18,15,0.5)] p-1 sm:inline-grid sm:auto-cols-fr sm:grid-flow-col">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors ${
            value === item.value
              ? 'bg-[rgba(102,217,194,0.16)] text-[var(--accent)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function PaginationControls({
  pagination,
  loading,
  onPageChange,
}: {
  pagination: PaginationState;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const start = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--line)] p-5 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {start}-{end} of {pagination.total}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={loading || pagination.page <= 1}
        >
          <ChevronLeft size={14} />
          Previous
        </Button>
        <span className="min-w-24 text-center text-xs text-[var(--text-soft)]">
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={loading || pagination.page >= pagination.totalPages}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function StatusPill({ tone, children }: { tone: 'success' | 'warning' | 'muted'; children: ReactNode }) {
  const className =
    tone === 'success'
      ? 'border-[rgba(102,217,194,0.32)] bg-[rgba(102,217,194,0.1)] text-[var(--accent)]'
      : tone === 'warning'
        ? 'border-[rgba(231,182,90,0.32)] bg-[rgba(231,182,90,0.1)] text-[var(--amber)]'
        : 'border-[var(--line)] bg-[rgba(244,241,232,0.04)] text-[var(--text-soft)]';

  return <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize ${className}`}>{children}</span>;
}

function LoadingRow({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-12 text-[var(--text-muted)]">
      <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
      {label}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="m-5 flex gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100">
      <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-300" />
      {message}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="p-12 text-center text-sm text-[var(--text-muted)]">{label}</div>;
}

function normalizeListResponse<T>(payload: unknown, fallbackLimit: number, fallbackPage: number): ListResponse<T> {
  if (isRecord(payload) && Array.isArray(payload.data)) {
    return {
      data: payload.data as T[],
      pagination: normalizePagination(payload.pagination, fallbackLimit, fallbackPage),
    };
  }

  const data = Array.isArray(payload) ? (payload as T[]) : [];
  return {
    data,
    pagination: {
      page: fallbackPage,
      limit: fallbackLimit,
      total: data.length,
      totalPages: 1,
    },
  };
}

function normalizePagination(value: unknown, fallbackLimit: number, fallbackPage: number): PaginationState {
  if (!isRecord(value)) return emptyPagination(fallbackLimit);

  const page = Number(value.page || fallbackPage);
  const limit = Number(value.limit || fallbackLimit);
  const total = Number(value.total || 0);
  const totalPages = Number(value.totalPages || Math.max(1, Math.ceil(total / limit)));

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallbackPage,
    limit: Number.isFinite(limit) && limit > 0 ? limit : fallbackLimit,
    total: Number.isFinite(total) && total >= 0 ? total : 0,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : 1,
  };
}

function getTotal(payload: unknown) {
  if (!isRecord(payload) || !isRecord(payload.pagination)) return 0;
  const total = Number(payload.pagination.total || 0);
  return Number.isFinite(total) && total >= 0 ? total : 0;
}

function getPayloadError(payload: unknown) {
  if (!isRecord(payload)) return '';
  return typeof payload.error === 'string' ? payload.error : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
