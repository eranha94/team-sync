"use client";

import Link from "next/link";
import {
  CalendarDays,
  ClipboardPlus,
  UsersRound,
} from "lucide-react";

import Card from "@/components/ui/Card";
import Section from "@/components/ui/Section";
import useLanguage from "@/hooks/useLanguage";

type QuickActionItem = {
  href: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  icon: React.ReactNode;
};

export default function QuickActions() {
  const { isHebrew } = useLanguage();

  const actions: QuickActionItem[] = [
    {
      href: "/polls/new",
      titleHe: "פתיחת סקר חדש",
      titleEn: "Create New Poll",
      descriptionHe: "יצירת סקר זמינות חדש",
      descriptionEn: "Create a new availability poll",
      icon: <ClipboardPlus size={24} />,
    },
    {
      href: "/members",
      titleHe: "ניהול שחקנים",
      titleEn: "Manage Players",
      descriptionHe: "הוספה וניהול של חברי הקבוצה",
      descriptionEn: "Add and manage team members",
      icon: <UsersRound size={24} />,
    },
    {
      href: "/polls",
      titleHe: "כל הסקרים",
      titleEn: "All Polls",
      descriptionHe: "צפייה וניהול של הסקרים",
      descriptionEn: "View and manage all polls",
      icon: <CalendarDays size={24} />,
    },
  ];

  return (
    <Section
      title={
        isHebrew
          ? "פעולות מהירות"
          : "Quick Actions"
      }
    >
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
                    {isHebrew
                      ? action.titleHe
                      : action.titleEn}
                  </h3>

                  <p className="mt-1 text-sm text-white/40">
                    {isHebrew
                      ? action.descriptionHe
                      : action.descriptionEn}
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