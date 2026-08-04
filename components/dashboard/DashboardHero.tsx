"use client";

import { Crown, RefreshCw } from "lucide-react";

import PageTitle from "@/components/ui/PageTitle";
import useLanguage from "@/hooks/useLanguage";

type DashboardHeroProps = {
  memberName?: string | null;
  onRefresh: () => void;
  isRefreshing?: boolean;
};

export default function DashboardHero({
  memberName,
  onRefresh,
  isRefreshing = false,
}: DashboardHeroProps) {
  const { direction } = useLanguage();

  const defaultName =
    direction === "rtl" ? "מנהל" : "Admin";

  return (
    <PageTitle
      title={
        direction === "rtl"
          ? `שלום ${memberName || defaultName} 👋`
          : `Hello ${memberName || defaultName} 👋`
      }
      subtitle={
        direction === "rtl"
          ? "הנה תמונת המצב של הקבוצה"
          : "Here's your team's current overview"
      }
      icon={<Crown size={24} />}
      action={
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={isRefreshing ? "animate-spin" : ""}
          />

          {isRefreshing
            ? direction === "rtl"
              ? "מרענן..."
              : "Refreshing..."
            : direction === "rtl"
              ? "רענון נתונים"
              : "Refresh"}
        </button>
      }
    />
  );
}