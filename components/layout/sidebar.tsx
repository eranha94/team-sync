"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Settings,
  UsersRound,
} from "lucide-react";

import { useCurrentMember } from "@/hooks/useCurrentMember";

const navigationItems = [
  {
    label: "ראשי",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "סקרים",
    href: "/polls",
    icon: ClipboardList,
  },
  {
    label: "לוח שנה",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "שחקנים",
    href: "/members",
    icon: UsersRound,
  },
  {
    label: "סטטיסטיקות",
    href: "/statistics",
    icon: BarChart3,
  },
  {
    label: "הגדרות",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { member } = useCurrentMember();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem("teamSyncMember");
    router.replace("/login");
  }

  const memberInitial =
    member?.fullName?.trim().charAt(0).toUpperCase() || "N";

  return (
    <aside
      dir="rtl"
      className="fixed right-0 top-0 z-40 hidden h-screen w-72 flex-col overflow-hidden border-l border-white/[0.08] bg-[#07080d] lg:flex"
    >
      {/* Purple background glow */}
      <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-purple-600/20 blur-[110px]" />

      <div className="relative flex h-full flex-col">
        {/* Branding */}
        <header className="border-b border-white/[0.08] px-5 pb-5 pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-4 rounded-full bg-purple-500/25 blur-2xl" />

              <Image
                src="/branding/nightmare-logo.png"
                alt="NightmareCamp"
                width={220}
                height={220}
                priority
                className="relative h-full w-full object-contain drop-shadow-[0_0_22px_rgba(168,85,247,0.45)]"
              />
            </div>

            <Image
              src="/branding/nightmare-wordmark.png"
              alt="NightmareCamp"
              width={340}
              height={120}
              priority
              className="mt-1 h-auto w-52 object-contain"
            />

            <p className="mt-2 text-xs text-white/40">
              ניהול הקבוצה במקום אחד
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30">
              <Image
                src="/branding/ipl-badge.png"
                alt="Israeli Premier League"
                width={100}
                height={100}
                className="h-11 w-11 object-contain"
              />
            </div>

            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-bold text-white">
                Israeli Premier League
              </p>

              <p className="mt-1 text-[11px] font-semibold text-amber-300">
                Official Competition
              </p>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex h-12 items-center justify-between overflow-hidden rounded-2xl px-4 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-l from-purple-500 to-purple-700 text-white shadow-[0_10px_30px_rgba(126,34,206,0.25)]"
                    : "text-white/50 hover:bg-white/[0.055] hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute inset-y-2 right-0 w-1 rounded-l-full bg-amber-300" />
                )}

                <span className="relative">{item.label}</span>

                <Icon
                  size={19}
                  strokeWidth={active ? 2.5 : 2}
                  className={`relative transition ${
                    active
                      ? "text-amber-300"
                      : "text-white/35 group-hover:text-purple-300"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <footer className="border-t border-white/[0.08] p-4">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-800 text-lg font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]">
                {memberInitial}

                <span className="absolute bottom-0 left-0 h-3 w-3 rounded-full border-2 border-[#101117] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {member?.fullName ?? "חבר קבוצה"}
                </p>

                <p className="mt-0.5 text-xs text-white/35">
                  {member?.role === "admin"
                    ? "מנהל הקבוצה"
                    : "שחקן הקבוצה"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                title="התנתקות"
                aria-label="התנתקות"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </aside>
  );
}