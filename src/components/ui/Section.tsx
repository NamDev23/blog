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
