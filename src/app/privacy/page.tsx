'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import { siteConfig } from '@/lib/site';

export default function PrivacyPage() {
  return (
    <>
      {/* Page Header */}
      {/* Page Header */}
      <PageHeader
        title="Privacy Policy"
        description="Last updated: April 2026"
      />

      {/* Content */}
      <Section>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="prose max-w-none text-sm sm:text-base"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-0">Introduction</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Welcome to {siteConfig.name}. This policy explains what information may be collected through the website and how it is handled.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Information We Collect</h2>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            We may collect information about you in various ways, including:
          </p>
          <ul className="text-[var(--text-muted)] mb-6 space-y-2">
            <li>Information you voluntarily provide through contact or comment forms</li>
            <li>Operational analytics if analytics environment variables are configured</li>
            <li>Email addresses submitted for newsletters or comment moderation</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">How We Use Your Information</h2>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            We use the information we collect for various purposes:
          </p>
          <ul className="text-[var(--text-muted)] mb-6 space-y-2">
            <li>To respond to inquiries and moderate comments</li>
            <li>To improve content quality and site reliability</li>
            <li>To protect public forms, APIs, and publishing workflows from abuse</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Cookies and Tracking</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Analytics scripts are loaded only when the corresponding public environment variables are configured. You can control cookies and similar browser storage through your browser preferences.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Third-Party Links</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            Our website may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Data Security</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            The site uses security headers, form validation, admin-key protection for write endpoints, and reduced public comment fields. No website can guarantee absolute security, but the implementation is designed to reduce common exposure.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Your Rights</h2>
          <p className="text-[var(--text-muted)] mb-4 leading-relaxed">
            You have the right to:
          </p>
          <ul className="text-[var(--text-muted)] mb-6 space-y-2">
            <li>Access personal information you submitted</li>
            <li>Request correction or deletion where applicable</li>
            <li>Opt out of marketing communications</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Contact Us</h2>
          <p className="text-[var(--text-muted)] mb-6 leading-relaxed">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p className="text-[var(--text-muted)] leading-relaxed">
            Email: {siteConfig.email}<br />
            Location: {siteConfig.location}
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-4 mt-8">Changes to This Policy</h2>
          <p className="text-[var(--text-muted)] leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date above.
          </p>
        </motion.div>
      </Section>
    </>
  );
}
