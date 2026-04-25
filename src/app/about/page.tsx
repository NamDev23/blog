'use client';

import { motion } from 'framer-motion';
import { Code, Palette, ShieldCheck, Zap } from 'lucide-react';
import Section from '@/components/ui/Section';
import PageHeader from '@/components/ui/PageHeader';
import { siteConfig } from '@/lib/site';

export default function AboutPage() {
  const skills = [
    { icon: Code, title: 'Product Engineering', description: 'Building modern applications with React, Next.js, TypeScript, and pragmatic architecture.' },
    { icon: Palette, title: 'UX Systems', description: 'Designing interfaces that scan quickly, explain state clearly, and support repeated work.' },
    { icon: Zap, title: 'Performance', description: 'Optimizing loading paths, rendering cost, and content delivery for measurable speed.' },
    { icon: ShieldCheck, title: 'Security', description: 'Hardening public routes, API writes, form handling, and data exposure by default.' },
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
        title="About ShadowDev"
        description="A product-minded engineering studio journal focused on interface quality, security, and performance."
      />

      {/* Bio Section */}
      <Section>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center"
          >
            {/* Text */}
            <motion.div variants={itemVariants}>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[var(--text)]">
                Built for the quiet work behind reliable products.
              </h2>
              <div className="space-y-4 text-[var(--text-muted)] text-sm sm:text-base">
                <p className="leading-relaxed">
                  {siteConfig.name} documents the decisions that make web products feel sharp: information architecture, interaction states, accessible interfaces, secure data flow, and reliable delivery.
                </p>
                <p className="leading-relaxed">
                  The stack is intentionally modern but conservative: Next.js, TypeScript, Supabase, and small UI primitives that keep the interface fast and maintainable.
                </p>
                <p className="leading-relaxed">
                  The writing is for builders who care about both craft and production behavior: how it looks, how it feels, how it fails, and how quickly it recovers.
                </p>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="surface-card flex aspect-square w-full items-center justify-center p-8">
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-[rgba(102,217,194,0.12)] sm:h-32 sm:w-32"
                  >
                    <span className="text-4xl sm:text-5xl font-bold text-[var(--accent)]">S</span>
                  </motion.div>
                  <p className="text-[var(--text-muted)] text-sm sm:text-base">{siteConfig.name}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
      </Section>

      {/* Skills Section */}
      <Section withDividerTop>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="gradient-text mb-4">
              My Skills
            </h2>
            <p className="text-[var(--text-muted)] text-base sm:text-lg text-balance">
              The operating system behind the redesign
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {skills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="surface-card p-6 text-center transition-all hover:-translate-y-1 hover:border-[rgba(102,217,194,0.45)]"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 mx-auto mb-4 bg-[rgba(102,217,194,0.12)] border border-[rgba(102,217,194,0.3)] rounded-lg flex items-center justify-center"
                  >
                    <Icon size={24} className="text-[var(--accent)]" />
                  </motion.div>
                  <h3 className="text-base sm:text-lg font-semibold text-[var(--text)] mb-2">
                    {skill.title}
                  </h3>
                  <p className="text-[var(--text-muted)] text-xs sm:text-sm leading-relaxed">
                    {skill.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
      </Section>

      {/* Experience Section */}
      <Section withDividerTop>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="gradient-text mb-4">
              Operating Principles
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4 sm:space-y-6"
          >
            {[
              {
                title: 'Ship the first useful screen',
                company: 'UX',
                period: 'Clarity',
                description: 'Every page starts with the task the visitor came to do, not decorative marketing weight.',
              },
              {
                title: 'Secure public surfaces',
                company: 'API',
                period: 'Trust',
                description: 'Public read routes stay simple, write routes require admin credentials, and data exposure is reduced.',
              },
              {
                title: 'Measure before adding weight',
                company: 'Performance',
                period: 'Speed',
                description: 'Animation and imagery support content, while loading paths stay lean and cache-friendly.',
              },
            ].map((exp, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ x: 5 }}
                className="surface-card border-l-4 border-[var(--accent)] p-6 transition-all hover:translate-x-1 hover:border-[var(--amber)] sm:p-8"
              >
                <h3 className="text-lg sm:text-xl font-semibold text-[var(--text)] mb-2">
                  {exp.title}
                </h3>
                <p className="text-[var(--accent)] font-medium mb-3 text-sm sm:text-base">
                  {exp.company} / <span className="text-[var(--text-muted)]">{exp.period}</span>
                </p>
                <p className="text-[var(--text-muted)] text-sm sm:text-base leading-relaxed">
                  {exp.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
      </Section>
    </>
  );
}
