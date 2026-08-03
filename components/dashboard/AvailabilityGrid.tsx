"use client";

import Link from "next/link";
import { CalendarDays, Crown } from "lucide-react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";

export type AvailabilityDay = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  maybeCount: number;
};

type AvailabilityGridProps = {
  days: AvailabilityDay[];
  bestDayId?: string | null;
};

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

export default function AvailabilityGrid({
  days,
  bestDayId,
}: AvailabilityGridProps) {
  return (
    <Section
      title="זמינות לפי ימים"
      action={
        <Link
          href="/polls"
          className="text-sm font-bold text-purple-300 transition hover:text-purple-200"
        >
          כל הסקרים
        </Link>
      }
    >
      {days.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays size={30} />}
            title="אין ימים להצגה"
            description="לא הוגדרו עדיין ימים בסקר הפתוח."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {days.map((day) => {
            const isBestDay = bestDayId === day.id;

            return (
              <Card
                key={day.id}
                variant={isBestDay ? "gold" : "default"}
                glow={isBestDay}
                interactive
                className="relative overflow-hidden"
              >
                {isBestDay && (
                  <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black">
                    <Crown size={13} />
                    מומלץ
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white">
                      {formatHebrewDate(day.date)}
                    </h3>

                    <p className="mt-1 text-sm text-white/40">
                      {day.startTime || "--:--"}
                      {day.endTime
                        ? ` עד ${day.endTime}`
                        : ""}
                    </p>
                  </div>

                  {!isBestDay && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-purple-300">
                      <CalendarDays size={19} />
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-emerald-500/10 p-3 text-center">
                    <p className="text-2xl font-black text-emerald-300">
                      {day.availableCount}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      זמינים
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 p-3 text-center">
                    <p className="text-2xl font-black text-amber-300">
                      {day.maybeCount}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      אולי
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}