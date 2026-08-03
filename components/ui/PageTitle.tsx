"use client";

import { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

type PageTitleProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  className?: string;
};

export default function PageTitle({
  title,
  subtitle,
  icon,
  action,
  backHref,
  className = "",
}: PageTitleProps) {
  return (
    <div
      className={`mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between ${className}`}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-500/20 to-[#181b25] text-purple-300 shadow-[0_0_35px_rgba(147,51,234,.18)]">
            {icon}
          </div>
        )}

        <div>
          {backHref && (
            <Link
              href={backHref}
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-purple-300"
            >
              <ChevronLeft size={16} />
              חזרה
            </Link>
          )}

          <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/50 lg:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex shrink-0 items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
}