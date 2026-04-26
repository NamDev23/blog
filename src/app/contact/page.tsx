'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BriefcaseBusiness, CheckCircle, Loader2, Mail, MapPin, Phone, Send } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { siteConfig } from '@/lib/site';
import { useLanguage } from '@/lib/i18n';

/**
 * Trang liên hệ public.
 *
 * Form dùng client validation để phản hồi nhanh theo ngôn ngữ hiện tại. Server
 * vẫn là lớp quyết định: kiểm tra origin, rate-limit, honeypot, sanitize và lưu
 * tin nhắn vào bảng `contact_messages`.
 */
export default function ContactPage() {
  const { locale } = useLanguage();
  const copy = locale === 'vi'
    ? {
        title: 'Liên hệ',
        description: 'Gửi vấn đề về sản phẩm, hiệu năng, UX hoặc bảo mật. ShadowDev sẽ giữ brief thật thực tế.',
        sendFailed: 'Không gửi được tin nhắn.',
        email: 'Email',
        phone: 'Điện thoại',
        location: 'Địa điểm',
        briefType: 'Loại brief',
        briefTitle: 'Laravel, hệ thống giáo dục, CMS/CRM, chatbot hoặc frontend UI.',
        briefDescription:
          'Gửi brief ngắn gọn: mục tiêu sản phẩm, stack hiện tại, workflow người dùng, yêu cầu admin và quyết định tiếp theo bạn cần đưa ra.',
        bestTopics: 'Chủ đề phù hợp để trao đổi',
        topics: ['Kiến trúc LMS/CMS/CRM', 'Laravel API và workflow admin', 'Thiết kế lại UI Vue hoặc Next.js', 'Tự động hóa chatbot giáo dục'],
        success: 'Đã nhận tin nhắn. Tôi sẽ phản hồi qua email.',
        name: 'Tên',
        subject: 'Chủ đề',
        message: 'Nội dung',
        namePlaceholder: 'Tên của bạn',
        emailPlaceholder: 'ban@email.com',
        subjectPlaceholder: 'Bạn muốn trao đổi gì?',
        messagePlaceholder: 'Nội dung tin nhắn...',
        sending: 'Đang gửi...',
        send: 'Gửi tin nhắn',
        requiredError: 'Vui lòng nhập tên, email, chủ đề và nội dung tối thiểu 10 ký tự.',
        emailError: 'Vui lòng nhập email hợp lệ.',
        rateLimited: 'Bạn gửi quá nhiều yêu cầu. Vui lòng thử lại sau ít phút.',
        invalidOrigin: 'Yêu cầu không hợp lệ. Vui lòng tải lại trang và thử lại.',
        serverError: 'Máy chủ chưa xử lý được tin nhắn. Vui lòng thử lại sau.',
      }
    : {
        title: 'Get In Touch',
        description: 'Bring a product, performance, UX, or security problem. ShadowDev will keep the brief practical.',
        sendFailed: 'Message could not be sent.',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        briefType: 'Brief Type',
        briefTitle: 'Laravel, education systems, CMS/CRM, chatbot, or frontend UI.',
        briefDescription:
          'Send a practical brief: product goal, current stack, user workflow, admin requirement, and the next decision you need to make.',
        bestTopics: 'Best topics to discuss',
        topics: ['LMS/CMS/CRM architecture', 'Laravel API and admin workflow', 'Vue or Next.js UI redesign', 'Education chatbot automation'],
        success: "Message received. I'll reply by email.",
        name: 'Name',
        subject: 'Subject',
        message: 'Message',
        namePlaceholder: 'Your name',
        emailPlaceholder: 'your@email.com',
        subjectPlaceholder: "What's this about?",
        messagePlaceholder: 'Your message...',
        sending: 'Sending...',
        send: 'Send Message',
        requiredError: 'Please provide a name, email, subject, and message with at least 10 characters.',
        emailError: 'Please provide a valid email address.',
        rateLimited: 'Too many requests. Please try again in a few minutes.',
        invalidOrigin: 'Invalid request. Please reload the page and try again.',
        serverError: 'The server could not process the message. Please try again later.',
      };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(false);
    setError(null);

    const validationError = validateContactForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getContactErrorMessage(result, response.status));
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', company: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.sendFailed);
    } finally {
      setLoading(false);
    }
  };

  function validateContactForm() {
    const name = formData.name.trim();
    const email = formData.email.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    if (!name || !email || !subject || message.length < 10) {
      return copy.requiredError;
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return copy.emailError;
    }

    return null;
  }

  function getContactErrorMessage(result: unknown, status: number) {
    // API trả code tiếng Anh ổn định; component map sang copy theo locale để UI
    // tiếng Việt không bị lẫn thông báo server tiếng Anh.
    const code = typeof result === 'object' && result && 'code' in result
      ? String((result as { code?: unknown }).code || '')
      : '';

    if (code === 'invalid_contact_payload') return copy.requiredError;
    if (code === 'invalid_email') return copy.emailError;
    if (code === 'rate_limited' || status === 429) return copy.rateLimited;
    if (code === 'invalid_origin' || status === 403) return copy.invalidOrigin;
    if (code === 'contact_storage_unavailable') return copy.serverError;
    if (status >= 500) return copy.serverError;

    return copy.sendFailed;
  }

  const contactInfo = [
    { icon: Mail, label: copy.email, value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: Phone, label: copy.phone, value: '+84 123 456 789', href: 'tel:+84123456789' },
    { icon: MapPin, label: copy.location, value: siteConfig.location, href: '#' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <>
      <PageHeader
        title={copy.title}
        description={copy.description}
      />

      {/* Contact Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-6 sm:gap-8 mb-12">
            {/* Cột thông tin giúp người đọc biết loại brief nào phù hợp trước khi gửi form. */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="surface-card p-5 sm:p-6"
            >
              <motion.div variants={itemVariants}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.3)] bg-[rgba(102,217,194,0.12)]">
                  <BriefcaseBusiness size={22} className="text-[var(--accent)]" />
                </div>
                <p className="micro-label mb-3">{copy.briefType}</p>
                <h2 className="text-2xl font-semibold text-[var(--text)]">{copy.briefTitle}</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  {copy.briefDescription}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="my-6 border-t border-[var(--line)]" />

              <div className="grid gap-3">
                {contactInfo.map((info) => {
                  const Icon = info.icon;
                  return (
                    <motion.a
                      key={info.label}
                      variants={itemVariants}
                      href={info.href}
                      whileHover={{ x: 3 }}
                      className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[rgba(244,241,232,0.035)] p-3 transition-colors hover:border-[rgba(102,217,194,0.45)]"
                    >
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-[rgba(102,217,194,0.24)] bg-[rgba(102,217,194,0.08)]">
                        <Icon size={17} className="text-[var(--accent)]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs uppercase text-[var(--text-soft)]">{info.label}</span>
                        <span className="block truncate text-sm font-medium text-[var(--text-muted)]">{info.value}</span>
                      </span>
                    </motion.a>
                  );
                })}
              </div>

              <motion.div variants={itemVariants} className="mt-6 rounded-lg border border-[rgba(231,182,90,0.28)] bg-[rgba(231,182,90,0.08)] p-4">
                <p className="text-sm font-semibold text-[var(--text)]">{copy.bestTopics}</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  {copy.topics.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Form chính: có honeypot `company` ẩn ở cuối để lọc bot đơn giản. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="min-w-0"
            >
              <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8">
                {submitted && (
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                    <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{copy.success}</span>
                  </div>
                )}
                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                    <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                  value={formData.company}
                  onChange={handleChange}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                      {copy.name}
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      maxLength={80}
                      placeholder={copy.namePlaceholder}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                      {copy.email}
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      maxLength={254}
                      placeholder={copy.emailPlaceholder}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                    {copy.subject}
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    maxLength={120}
                    placeholder={copy.subjectPlaceholder}
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                    {copy.message}
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    maxLength={3000}
                    rows={5}
                    placeholder={copy.messagePlaceholder}
                    className="w-full resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={
                    loading ||
                    !formData.name.trim() ||
                    !formData.email.trim() ||
                    !formData.subject.trim() ||
                    formData.message.trim().length < 10
                  }
                  className="w-full flex items-center justify-center gap-2 group"
                >
                  {loading ? (
                    <Loader2 size={20} className="animate-spin flex-shrink-0" />
                  ) : (
                    <Send size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  )}
                  {loading ? copy.sending : copy.send}
                </Button>
              </form>
            </motion.div>
          </div>
      </Section>
    </>
  );
}
