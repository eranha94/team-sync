"use client";

import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-[#11131a]
        p-10
        text-center
        shadow-[0_20px_60px_rgba(0,0,0,.25)]
        ${className}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center">
        {icon && (
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-300 shadow-[0_0_35px_rgba(147,51,234,.18)]">
            {icon}
          </div>
        )}

        <h3 className="text-2xl font-black text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-3 max-w-md text-sm leading-7 text-white/50">
            {description}
          </p>
        )}

        {action && (
          <div className="mt-8">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}