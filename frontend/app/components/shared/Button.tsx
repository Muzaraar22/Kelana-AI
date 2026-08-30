import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

const variantClasses: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-600/60",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
  danger:
    "border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10",
  ghost: "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:cursor-not-allowed";

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  pill?: boolean;
  fullWidth?: boolean;
  href?: string;
  className?: string;
  children: ReactNode;
  onClick?: MouseEventHandler;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function Button({
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
  href,
  className = "",
  children,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = [
    base,
    pill ? "rounded-full" : "rounded-lg",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
