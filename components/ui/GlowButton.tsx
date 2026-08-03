"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "gold"
  | "ghost";

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
};

const variants = {
  primary:
    "bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:from-purple-500 hover:to-violet-400 shadow-[0_0_30px_rgba(147,51,234,.30)]",

  secondary:
    "bg-[#1a1d27] border border-white/10 text-white hover:bg-[#232736]",

  success:
    "bg-gradient-to-r from-emerald-600 to-green-500 text-white hover:from-emerald-500 hover:to-green-400 shadow-[0_0_30px_rgba(16,185,129,.30)]",

  danger:
    "bg-gradient-to-r from-red-600 to-rose-500 text-white hover:from-red-500 hover:to-rose-400 shadow-[0_0_30px_rgba(239,68,68,.30)]",

  gold:
    "bg-gradient-to-r from-yellow-500 to-amber-400 text-black hover:from-yellow-400 hover:to-amber-300 shadow-[0_0_30px_rgba(251,191,36,.30)]",

  ghost:
    "bg-transparent border border-white/10 text-white hover:bg-white/5",
};

export default function GlowButton({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-2xl
        px-5
        py-3
        font-bold
        transition-all
        duration-300
        active:scale-95
        hover:-translate-y-0.5
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {leftIcon}

      {loading ? (
        <>
          <svg
            className="h-5 w-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              opacity=".2"
            />
            <path
              d="M22 12a10 10 0 0 1-10 10"
              stroke="currentColor"
              strokeWidth="4"
            />
          </svg>

          טוען...
        </>
      ) : (
        children
      )}

      {!loading && rightIcon}
    </button>
  );
}