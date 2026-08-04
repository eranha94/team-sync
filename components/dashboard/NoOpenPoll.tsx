"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";
import useLanguage from "@/hooks/useLanguage";

export default function NoOpenPoll() {
  const { isHebrew } = useLanguage();

  return (
    <div className="mt-6">
      <EmptyState
        icon={<CalendarDays size={30} />}
        title={
          isHebrew
            ? "אין כרגע סקר פתוח"
            : "There is no active poll"
        }
        description={
          isHebrew
            ? "פתח סקר חדש כדי לאסוף את הזמינות של חברי הקבוצה ולגלות מהו היום הטוב ביותר לסשן."
            : "Create a new poll to collect your team's availability and find the best day for the next session."
        }
        action={
          <Link
            href="/polls/new"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-amber-400 px-6 font-bold text-black transition hover:bg-amber-300"
          >
            {isHebrew
              ? "פתיחת סקר חדש"
              : "Create New Poll"}
          </Link>
        }
      />
    </div>
  );
}