"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const base =
  "w-full px-4 py-3 bg-[rgba(244,241,232,0.06)] border border-[var(--line)] rounded-lg text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(102,217,194,0.22)] transition-all resize-none text-sm shadow-sm";

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} className={twMerge(clsx(base, className))} {...props} />;
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
