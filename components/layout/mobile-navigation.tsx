"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  LogOut,
  Plus,
  Settings,
  UsersRound,
} from "lucide-react";

import useLanguage from "@/hooks/useLanguage";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof Home;
  primary?: boolean;
  exact?: boolean;
};

export default function MobileNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    direction,
    isHebrew,
  } = useLanguage();

  const navigation: NavigationItem[] = [
    {
      label: isHebrew ? "ראשי" : "Home",
      href: "/",
      icon: Home,
      exact: true,
    },
    {
      label: isHebrew ? "סקרים" : "Polls",
      href: "/polls",
      icon: ClipboardList,
      exact: true,
    },
    {
      label: isHebrew ? "חדש" : "New",
      href: "/polls/new",
      icon: Plus,
      primary: true,
      exact: true,
    },
    {
      label: isHebrew ? "לוח" : "Calendar",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      label: isHebrew ? "שחקנים" : "Players",
      href: "/members",
      icon: UsersRound,
    },
    {
      label: isHebrew ? "הגדרות" : "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  function isActive(item: NavigationItem) {
    if (item.exact) {
      return pathname === item.href;
    }

    return pathname.startsWith(item.href);
  }

  function handleLogout() {
    const approved = window.confirm(
      isHebrew
        ? "להתנתק מהמערכת?"
        : "Log out of the system?"
    );

    if (!approved) {
      return;
    }

    localStorage.removeItem("teamSyncMember");
    router.replace("/login");
  }

  return (
    <nav
      dir={direction}
      aria-label={
        isHebrew
          ? "ניווט ראשי במובייל"
          : "Mobile main navigation"
      }
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#080a10]/95 px-2 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-7 items-end">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  active ? "page" : undefined
                }
                className="flex min-w-0 flex-col items-center justify-center gap-1"
              >
                <span
                  className={`-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#080a10] text-black shadow-lg transition ${
                    active
                      ? "bg-amber-300 shadow-amber-400/30"
                      : "bg-amber-400 shadow-amber-400/20"
                  }`}
                >
                  <Icon
                    size={26}
                    strokeWidth={3}
                  />
                </span>

                <span className="max-w-full truncate text-[10px] font-bold text-amber-300">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active ? "page" : undefined
              }
              className={`flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-[10px] font-semibold transition ${
                active
                  ? "text-amber-300"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
              />

              <span className="max-w-full truncate">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          aria-label={
            isHebrew ? "התנתקות" : "Log out"
          }
          className="flex min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1 text-[10px] font-semibold text-red-300/70 transition hover:text-red-300"
        >
          <LogOut size={20} />

          <span className="max-w-full truncate">
            {isHebrew ? "יציאה" : "Logout"}
          </span>
        </button>
      </div>
    </nav>
  );
}