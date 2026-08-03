"use client";

import { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;

  color?: "purple" | "gold" | "green" | "red" | "blue";

  trend?: string;

  onClick?: () => void;
};

const colors = {
  purple: {
    glow: "shadow-[0_0_40px_rgba(147,51,234,0.18)]",
    border: "border-purple-500/20",
    bg: "from-purple-500/15",
    icon: "text-purple-300",
    badge: "bg-purple-500/15",
  },

  gold: {
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.18)]",
    border: "border-yellow-500/20",
    bg: "from-yellow-500/15",
    icon: "text-yellow-300",
    badge: "bg-yellow-500/15",
  },

  green: {
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.18)]",
    border: "border-emerald-500/20",
    bg: "from-emerald-500/15",
    icon: "text-emerald-300",
    badge: "bg-emerald-500/15",
  },

  red: {
    glow: "shadow-[0_0_40px_rgba(239,68,68,0.18)]",
    border: "border-red-500/20",
    bg: "from-red-500/15",
    icon: "text-red-300",
    badge: "bg-red-500/15",
  },

  blue: {
    glow: "shadow-[0_0_40px_rgba(59,130,246,0.18)]",
    border: "border-sky-500/20",
    bg: "from-sky-500/15",
    icon: "text-sky-300",
    badge: "bg-sky-500/15",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "purple",
  trend,
  onClick,
}: StatCardProps) {
  const theme = colors[color];

  return (
    <button
      onClick={onClick}
      className={`
      relative
      overflow-hidden
      rounded-[28px]
      border
      ${theme.border}
      bg-gradient-to-br
      ${theme.bg}
      to-[#11131a]
      backdrop-blur-xl
      p-6
      text-right
      transition-all
      duration-300
      hover:-translate-y-1
      hover:scale-[1.02]
      ${theme.glow}
      group
      w-full
    `}
    >
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/45">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {value}
          </h2>

          {subtitle && (
            <p className="mt-2 text-sm text-white/40">
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            ${theme.badge}
            ${theme.icon}
            transition-all
            duration-300
            group-hover:rotate-6
            group-hover:scale-110
          `}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-300">
          <ArrowUpRight size={14} />

          {trend}
        </div>
      )}
    </button>
  );
}