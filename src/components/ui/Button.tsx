"use client";

import * as React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import { Slot } from "@radix-ui/react-slot";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonShape = "default" | "pill";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  asChild?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(102,217,194,0.6)] disabled:opacity-55 disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-[#06100d] border border-[var(--accent)] hover:bg-[#7ce8d3] hover:shadow-lg hover:shadow-teal-900/30",
  secondary:
    "bg-[rgba(231,182,90,0.14)] text-[var(--amber)] border border-[rgba(231,182,90,0.36)] hover:bg-[rgba(231,182,90,0.2)]",
  outline:
    "border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--accent)] hover:bg-[rgba(102,217,194,0.08)]",
  ghost: "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(244,241,232,0.06)]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const shapeStyles: Record<ButtonShape, string> = {
  default: "rounded-lg",
  pill: "rounded-lg",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", shape = "default", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={twMerge(clsx(base, variantStyles[variant], sizeStyles[size], shapeStyles[shape], className))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default Button;
