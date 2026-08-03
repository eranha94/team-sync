"use client";

import Link from "next/link";
import { ArrowLeft, Crown } from "lucide-react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";

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

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

export default function BestDayCard({
  bestDay,
  pollId,
}: BestDayCardProps) {
  if (!bestDay) {
    return (
      <Card
        variant="gold"
        glow
        className="h-full"
      >
        <EmptyState
          icon={<Crown size={30} />}
          title="עדיין אין ימים בסקר"
          description="הוסף ימים לסקר כדי שנוכל לחשב את היום המומלץ ביותר לסשן."
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300">
            <Crown size={22} />

            <span className="text-sm font-bold">
              היום המומלץ לסשן
            </span>
          </div>

          <h2 className="mt-5 text-3xl font-black text-white">
            {formatHebrewDate(bestDay.date)}
          </h2>

          <p className="mt-2 text-lg font-semibold text-white/65">
            {bestDay.startTime
              ? `בשעה ${bestDay.startTime}`
              : "לא הוגדרה שעה"}
          </p>

          {bestDay.endTime && (
            <p className="mt-1 text-sm text-white/40">
              עד {bestDay.endTime}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-black shadow-lg shadow-amber-400/20">
          <p className="text-3xl font-black">
            {bestDay.availableCount}
          </p>

          <p className="text-xs font-bold">
            זמינים
          </p>
        </div>
      </div>

      <p className="mt-7 text-sm leading-7 text-white/50">
        ביום הזה קיימת כמות הזמינים הגבוהה ביותר.
        בנוסף יש {bestDay.maybeCount} שחקנים שסימנו אולי.
      </p>

      <Link
        href={`/polls/${pollId}`}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-amber-400 px-5 font-bold text-black transition hover:bg-amber-300"
      >
        צפייה בסקר
        <ArrowLeft size={18} />
      </Link>
    </Card>
  );
}