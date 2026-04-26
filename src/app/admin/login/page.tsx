'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, KeyRound, Loader2, LockKeyhole, ShieldCheck, Terminal } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Section from '@/components/ui/Section';
import { siteConfig } from '@/lib/site';

const loginNotes = [
  'Admin key is exchanged for an HttpOnly session cookie.',
  'The CMS editor never stores the key in localStorage.',
  'API mutations still verify access on the server.',
];

/**
 * Trang đăng nhập admin.
 *
 * Key chỉ được POST lên `/api/admin/login`; sau khi thành công server trả cookie
 * HttpOnly nên component không lưu secret trong localStorage/sessionStorage.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey }),
      });
      const payload = await response.json().catch(() => ({}));

      // API cố tình trả lỗi chung để không lộ thông tin credential.
      if (!response.ok) {
        throw new Error(payload.error || 'Could not sign in.');
      }

      router.replace('/admin');
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section className="min-h-[calc(100vh-160px)] border-b border-[var(--line)] bg-[rgba(244,241,232,0.025)]">
      <div className="grid min-h-[620px] gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="max-w-2xl"
        >
          <div className="micro-label mb-4 flex items-center gap-2">
            <LockKeyhole size={15} />
            Admin Login
          </div>
          <h1 className="text-4xl font-bold leading-tight text-[var(--text)] sm:text-5xl">
            Sign in to manage ShadowDev content.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[var(--text-muted)]">
            The admin area is for publishing blog posts, planning CMS content, and managing the technical portfolio.
            For a larger team, the next step should be Supabase Auth with roles and audit logs.
          </p>
          <div className="mt-7 grid gap-3">
            {loginNotes.map((note) => (
              <div key={note} className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                <CheckCircle2 size={17} className="text-[var(--accent)]" />
                {note}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="surface-card p-5 sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div>
              <p className="text-sm text-[var(--text-soft)]">Console</p>
              <h2 className="text-2xl font-semibold text-[var(--text)]">{siteConfig.name} Admin</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.3)] bg-[rgba(102,217,194,0.1)]">
              <Terminal size={21} className="text-[var(--accent)]" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--text)]">Admin key</span>
              <div className="relative">
                <KeyRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-soft)]" />
                <Input
                  type="password"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="Enter ADMIN_API_KEY"
                  className="pl-11"
                  autoComplete="current-password"
                  required
                />
              </div>
            </label>

            {error && (
              <div className="flex gap-3 rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-100">
                <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-300" />
                {error}
              </div>
            )}

            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              {isSubmitting ? 'Signing in...' : 'Enter admin'}
            </Button>
          </form>
        </motion.div>
      </div>
    </Section>
  );
}
