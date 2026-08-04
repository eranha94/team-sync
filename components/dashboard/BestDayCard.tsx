"use client";

import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import useLanguage from "@/hooks/useLanguage";

export type BestDay = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  maybeCount: number;
};

type BestDayCardProps = {
  bestDay: BestDay | null;
  pollId: string;
};

function formatDate(
  dateString: string,
  locale: "he-IL" | "en-US"
) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

export default function BestDayCard({
  bestDay,
  pollId,
}: BestDayCardProps) {
  const { direction, isHebrew } = useLanguage();

  const locale = isHebrew ? "he-IL" : "en-US";

  if (!bestDay) {
    return (
      <Card
        variant="gold"
        glow
        className="h-full"
      >
        <EmptyState
          icon={<Crown size={30} />}
          title={
            isHebrew
              ? "עדיין אין ימים בסקר"
              : "No poll dates yet"
          }
          description={
            isHebrew
              ? "הוסף ימים לסקר כדי שנוכל לחשב את היום המומלץ ביותר לסשן."
              : "Add dates to the poll so we can calculate the best session day."
          }
        />
      </Card>
    );
  }

  return (
    <Card
      variant="gold"
      glow
      className="h-full"
      padding="lg"
    >
      <div
        dir={direction}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-amber-300">
            <Crown size={22} />

            <span className="text-sm font-bold">
              {isHebrew
                ? "היום המומלץ לסשן"
                : "Recommended session day"}
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-black text-white">
            {formatDate(bestDay.date, locale)}
          </h2>

          <p className="mt-2 text-lg font-semibold text-white/65">
            {bestDay.startTime
              ? isHebrew
                ? `בשעה ${bestDay.startTime}`
                : `At ${bestDay.startTime}`
              : isHebrew
                ? "לא הוגדרה שעה"
                : "No time selected"}
          </p>

          {bestDay.endTime && (
            <p className="mt-1 text-sm text-white/40">
              {isHebrew
                ? `עד ${bestDay.endTime}`
                : `Until ${bestDay.endTime}`}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-black shadow-lg shadow-amber-400/20">
          <p className="text-3xl font-black">
            {bestDay.availableCount}
          </p>

          <p className="text-xs font-bold">
            {isHebrew
              ? "זמינים"
              : "Available"}
          </p>
        </div>
      </div>

      <p className="mt-7 text-sm leading-7 text-white/50">
        {isHebrew
          ? `ביום הזה קיימת כמות הזמינים הגבוהה ביותר. בנוסף יש ${bestDay.maybeCount} שחקנים שסימנו אולי.`
          : `This day currently has the highest number of available players. ${bestDay.maybeCount} players marked Maybe.`}
      </p>

      <Link
        href={`/polls/${pollId}`}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-amber-400 px-5 font-bold text-black transition hover:bg-amber-300"
      >
        {isHebrew
          ? "צפייה בסקר"
          : "View poll"}

        <ArrowLeft
          size={18}
          className={
            direction === "ltr"
              ? "rotate-180"
              : ""
          }
        />
      </Link>
    </Card>
  );
}