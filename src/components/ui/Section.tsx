"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type SectionWidth = "sm" | "md" | "lg" | "xl";

const widthClass: Record<SectionWidth, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

/**
 * Section primitive quản lý padding, container width và divider.
 *
 * Dùng primitive này giúp các page giữ nhịp layout nhất quán, thay vì mỗi page tự
 * viết `section + container` khác nhau.
 */
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  width?: SectionWidth;
  withDividerTop?: boolean;
  withDividerBottom?: boolean;
}

export function Section({
  as = "section",
  className,
  children,
  width = "xl",
  withDividerTop = false,
  withDividerBottom = false,
  ...props
}: SectionProps) {
  // `as` cho phép đổi semantic tag (`main`, `header`, `section`) mà vẫn giữ layout.
  const Comp = (as || "section") as React.ElementType;
  return (
    <Comp
      className={twMerge(
        clsx(
          "section-padding px-4 sm:px-6 lg:px-8",
          withDividerTop && "border-t border-[var(--line)]",
          withDividerBottom && "border-b border-[var(--line)]",
          className
        )
      )}
      {...props}
    >
      <div className={twMerge(clsx("container-custom", widthClass[width]))}>{children}</div>
    </Comp>
  );
}

export default Section;
