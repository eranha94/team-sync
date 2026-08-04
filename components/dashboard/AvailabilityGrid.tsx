"use client";

import Link from "next/link";
import { CalendarDays, Crown } from "lucide-react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Section from "@/components/ui/Section";
import useLanguage from "@/hooks/useLanguage";

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

export default function AvailabilityGrid({
  days,
  bestDayId,
}: AvailabilityGridProps) {
  const { direction, isHebrew } = useLanguage();

  const locale = isHebrew ? "he-IL" : "en-US";

  return (
    <Section
      title={
        isHebrew
          ? "זמינות לפי ימים"
          : "Availability by day"
      }
      action={
        <Link
          href="/polls"
          className="text-sm font-bold text-purple-300 transition hover:text-purple-200"
        >
          {isHebrew ? "כל הסקרים" : "All polls"}
        </Link>
      }
    >
      {days.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarDays size={30} />}
            title={
              isHebrew
                ? "אין ימים להצגה"
                : "No days to display"
            }
            description={
              isHebrew
                ? "לא הוגדרו עדיין ימים בסקר הפתוח."
                : "No days have been added to the open poll yet."
            }
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
                  <div
                    className={`absolute top-4 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black ${
                      direction === "rtl"
                        ? "left-4"
                        : "right-4"
                    }`}
                  >
                    <Crown size={13} />
                    {isHebrew ? "מומלץ" : "Recommended"}
                  </div>
                )}

                <div
                  dir={direction}
                  className="flex items-start justify-between gap-3"
                >
                  <div>
                    <h3 className="font-black text-white">
                      {formatDate(day.date, locale)}
                    </h3>

                    <p className="mt-1 text-sm text-white/40">
                      {day.startTime || "--:--"}

                      {day.endTime
                        ? isHebrew
                          ? ` עד ${day.endTime}`
                          : ` to ${day.endTime}`
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
                      {isHebrew ? "זמינים" : "Available"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-amber-500/10 p-3 text-center">
                    <p className="text-2xl font-black text-amber-300">
                      {day.maybeCount}
                    </p>

                    <p className="mt-1 text-xs text-white/40">
                      {isHebrew ? "אולי" : "Maybe"}
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