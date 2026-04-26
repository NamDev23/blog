"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

/**
 * Badge dùng cho category/tag/status nhỏ.
 *
 * Component chỉ render `span` để tránh semantic sai; nếu cần tương tác thì bọc bằng
 * button/link ở nơi sử dụng.
 */
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
          "inline-flex max-w-full min-w-0 items-center rounded-md px-3 py-1 text-left text-xs font-medium break-words",
          variants[variant],
          className
        )
      )}
      {...props}
    />
  );
}

export default Badge;
