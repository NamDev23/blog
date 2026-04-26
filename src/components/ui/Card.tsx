"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

/**
 * Card primitive cho các khối nội dung lặp lại.
 *
 * `hover` và `padded` giúp tái sử dụng trong dashboard/blog mà không phải copy
 * class surface/padding nhiều lần.
 */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
}

export function Card({ className, hover = true, padded = true, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          "surface-card",
          hover && "hover:border-[rgba(102,217,194,0.5)] hover:shadow-lg hover:shadow-black/30 transition-all",
          padded && "p-6",
          className
        )
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx("mb-3", className))} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={twMerge(clsx("text-lg font-semibold text-[var(--text)]", className))} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge(clsx("text-[var(--text-muted)] text-sm", className))} {...props} />;
}

export default Card;
