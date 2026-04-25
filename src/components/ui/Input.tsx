"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const base =
  "w-full px-4 py-3 bg-[rgba(244,241,232,0.06)] border border-[var(--line)] rounded-lg text-[var(--text)] placeholder-[var(--text-soft)] focus:outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(102,217,194,0.22)] transition-all text-sm shadow-sm";

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={twMerge(clsx(base, className))} {...props} />;
  }
);

Input.displayName = "Input";

export default Input;
