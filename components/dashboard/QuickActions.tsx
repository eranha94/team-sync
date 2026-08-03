"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardPlus,
  UsersRound,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";

type QuickActionItem = {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const actions: QuickActionItem[] = [
  {
    href: "/polls/new",
    title: "פתיחת סקר חדש",
    description: "יצירת סקר זמינות חדש",
    icon: <ClipboardPlus size={24} />,
  },
  {
    href: "/members",
    title: "ניהול שחקנים",
    description: "הוספה וניהול של חברי הקבוצה",
    icon: <UsersRound size={24} />,
  },
  {
    href: "/polls",
    title: "כל הסקרים",
    description: "צפייה וניהול של הסקרים",
    icon: <CalendarDays size={24} />,
  },
];

export default function QuickActions() {
  return (
    <Section title="פעולות מהירות">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group"
          >
            <Card
              interactive
              glow
              className="h-full"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300 transition duration-300 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white">
                  {action.icon}
                </div>

                <div>
                  <h3 className="font-black text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm text-white/40">
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}