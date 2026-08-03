"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Home,
  Plus,
  UsersRound,
} from "lucide-react";

const navigation = [
  {
    label: "ראשי",
    href: "/",
    icon: Home,
  },
  {
    label: "סקרים",
    href: "/polls",
    icon: ClipboardList,
  },
  {
    label: "חדש",
    href: "/polls/new",
    icon: Plus,
    primary: true,
  },
  {
    label: "לוח",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "שחקנים",
    href: "/members",
    icon: UsersRound,
  },
];

export default function MobileNavigation() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <nav
      dir="rtl"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#080a10]/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1"
              >
                <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#080a10] bg-amber-400 text-black shadow-lg shadow-amber-400/20">
                  <Icon size={26} strokeWidth={3} />
                </span>

                <span className="text-[11px] font-bold text-amber-300">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold ${
                active ? "text-amber-300" : "text-white/40"
              }`}
            >
              <Icon size={21} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}