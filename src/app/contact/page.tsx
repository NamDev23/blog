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

export default function ContactPage() {
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
    setLoading(true);
    setSubmitted(false);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Message could not be sent.');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', company: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message could not be sent.');
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { icon: Mail, label: 'Email', value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { icon: Phone, label: 'Phone', value: '+84 123 456 789', href: 'tel:+84123456789' },
    { icon: MapPin, label: 'Location', value: siteConfig.location, href: '#' },
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
      {/* Page Header */}
      {/* Page Header */}
      <PageHeader
        title="Get In Touch"
        description="Bring a product, performance, UX, or security problem. ShadowDev will keep the brief practical."
      />

      {/* Contact Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[0.82fr_1.18fr] gap-6 sm:gap-8 mb-12">
            {/* Contact Info */}
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
                <p className="micro-label mb-3">Brief Type</p>
                <h2 className="text-2xl font-semibold text-[var(--text)]">Laravel, education systems, CMS/CRM, chatbot, or frontend UI.</h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                  Send a practical brief: product goal, current stack, user workflow, admin requirement, and the next
                  decision you need to make.
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
                <p className="text-sm font-semibold text-[var(--text)]">Best topics to discuss</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                  {['LMS/CMS/CRM architecture', 'Laravel API and admin workflow', 'Vue or Next.js UI redesign', 'Education chatbot automation'].map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
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
                    <span>Message received. I&apos;ll reply by email.</span>
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
                      Name
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Your name"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your@email.com"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="subject" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                    Subject
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What's this about?"
                    className="w-full"
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-[var(--text-muted)] mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Your message..."
                    className="w-full resize-none"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 group">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin flex-shrink-0" />
                  ) : (
                    <Send size={20} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  )}
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </motion.div>
          </div>
      </Section>
    </>
  );
}
