"use client";

import { type ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "correct" | "wrong";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary:
    "bg-jazz-accent text-white hover:bg-red-600 active:scale-95 shadow-lg shadow-red-900/30",
  secondary:
    "bg-jazz-teal text-jazz-text hover:bg-blue-800 border border-blue-700",
  ghost:
    "bg-transparent text-jazz-muted hover:text-jazz-text hover:bg-white/5 border border-white/10",
  correct:
    "bg-emerald-600 text-white border border-emerald-400 shadow-lg shadow-emerald-900/40",
  wrong:
    "bg-red-700/80 text-white border border-red-500 shadow-lg shadow-red-900/40",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-5 py-2.5 text-base rounded-lg",
  lg: "px-7 py-3.5 text-lg rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: Props) {
  return (
    <button
      className={clsx(
        "font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
