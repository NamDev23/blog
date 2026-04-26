"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export interface SectionHeaderProps extends Omit<HTMLMotionProps<"div">, "children"> {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "start" | "center";
}

/**
 * Header nhỏ cho từng section trong page.
 *
 * Animation chạy khi vào viewport và chỉ chạy một lần để trang dài không bị nhấp
 * nháy khi người dùng scroll qua lại.
 */
export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  ...props
}: SectionHeaderProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={twMerge(clsx("mb-10 sm:mb-14", alignClass, className))}
      {...props}
    >
      {eyebrow ? (
        <div className="micro-label mb-3">{eyebrow}</div>
      ) : null}
      <h2 className="gradient-text mb-3 sm:mb-4">{title}</h2>
      {description ? (
        <p className={twMerge(clsx("text-[var(--text-muted)] text-base sm:text-lg max-w-2xl", align === "center" ? "mx-auto" : ""))}>
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
