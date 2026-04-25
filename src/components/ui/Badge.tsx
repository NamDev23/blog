"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type BadgeVariant = "default" | "primary" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-[rgba(244,241,232,0.08)] text-[var(--text-muted)]",
  primary: "bg-[rgba(102,217,194,0.12)] text-[var(--accent)] border border-[rgba(102,217,194,0.28)]",
  outline: "border border-[var(--line)] text-[var(--text-muted)]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center px-3 py-1 rounded-md text-xs font-medium",
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
}

export default Badge;
