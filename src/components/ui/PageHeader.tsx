"use client";

import { motion } from "framer-motion";
import Section from "@/components/ui/Section";
import { commonCopy, useLanguage } from "@/lib/i18n";

export default function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const { locale } = useLanguage();

  return (
    <Section withDividerBottom className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-3xl text-center"
      >
        <div className="micro-label mb-4">{commonCopy[locale].indexLabel}</div>
        <h1 className="gradient-text mb-5">{title}</h1>
        {description ? (
          <p className="text-[var(--text-muted)] text-base sm:text-lg max-w-2xl mx-auto text-balance">
            {description}
          </p>
        ) : null}
      </motion.div>
    </Section>
  );
}
