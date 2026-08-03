"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import Loading from "@/components/ui/Loading";
import PageTitle from "@/components/ui/PageTitle";
import EmptyState from "@/components/ui/EmptyState";

type PollStatus = "draft" | "open" | "closed";

type CalendarPollDay = {
  id: string;
  poll_id: string;
  date_x: string;
  start_time: string | null;
  end_time: string | null;
  poll: {
    id: string;
    title: string;
    status: PollStatus;
  } | null;
};

const WEEK_DAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

function dateToKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function cleanTime(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("he-IL", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getMonthRange(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  return {
    start: dateToKey(start),
    end: dateToKey(end),
  };
}

function getCalendarDays(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const leadingDays = firstDay.getDay();
  const totalCells = Math.ceil(
    (leadingDays + lastDay.getDate()) / 7
  ) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - leadingDays + 1;
    const date = new Date(year, month, dayNumber);

    return {
      date,
      dateKey: dateToKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getStatusStyles(status: PollStatus) {
  switch (status) {
    case "open":
      return {
        label: "פתוח",
        className:
          "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
      };

    case "closed":
      return {
        label: "נסגר",
        className:
          "border-white/10 bg-white/[0.05] text-white/50",
      };

    default:
      return {
        label: "טיוטה",
        className:
          "border-amber-400/20 bg-amber-400/10 text-amber-300",
      };
  }
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date()
  );

  const [pollDays, setPollDays] = useState<CalendarPollDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const loadCalendar = useCallback(
    async (showFullLoading = false) => {
      if (showFullLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setMessage("");

      try {
        const range = getMonthRange(currentMonth);

        const { data, error } = await supabase
          .from("poll_days")
          .select(`
            id,
            poll_id,
            date_x,
            start_time,
            end_time,
            poll:polls (
              id,
              title,
              status
            )
          `)
          .gte("date_x", range.start)
          .lte("date_x", range.end)
          .order("date_x", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        setPollDays((data ?? []) as unknown as CalendarPollDay[]);
      } catch (error) {
        console.error("Calendar error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : "לא ניתן לטעון את לוח השנה"
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentMonth]
  );

  useEffect(() => {
    loadCalendar(true);
  }, [loadCalendar]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const pollDaysByDate = useMemo(() => {
    return pollDays.reduce<Record<string, CalendarPollDay[]>>(
      (result, day) => {
        if (!result[day.date_x]) {
          result[day.date_x] = [];
        }

        result[day.date_x].push(day);

        return result;
      },
      {}
    );
  }, [pollDays]);

  const todayKey = dateToKey(new Date());

  const moveMonth = (direction: number) => {
    setCurrentMonth(
      (previousMonth) =>
        new Date(
          previousMonth.getFullYear(),
          previousMonth.getMonth() + direction,
          1
        )
    );
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="lg"
        text="טוען את לוח השנה..."
      />
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <PageTitle
        title="לוח שנה"
        subtitle="כל הסקרים והסשנים במקום אחד"
        icon={<CalendarDays size={24} />}
        action={
          <button
            type="button"
            onClick={() => loadCalendar(false)}
            disabled={isRefreshing}
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin" : ""}
            />

            {isRefreshing ? "מרענן..." : "רענון"}
          </button>
        }
      />

      {message && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {message}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-purple-300">
              תצוגה חודשית
            </p>

            <h2 className="mt-1 text-2xl font-black capitalize">
              {formatMonthTitle(currentMonth)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              aria-label="חודש קודם"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.1]"
            >
              <ChevronRight size={20} />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="h-11 rounded-2xl border border-purple-400/20 bg-purple-400/10 px-5 text-sm font-bold text-purple-200 transition hover:bg-purple-400/20"
            >
              היום
            </button>

            <button
              type="button"
              onClick={() => moveMonth(1)}
              aria-label="חודש הבא"
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] transition hover:bg-white/[0.1]"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
        </div>

        <div className="hidden grid-cols-7 border-b border-white/10 sm:grid">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="border-l border-white/5 px-3 py-4 text-center text-sm font-bold text-white/45 last:border-l-0"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="hidden grid-cols-7 sm:grid">
          {calendarDays.map(
            ({ date, dateKey, isCurrentMonth }) => {
              const dayPolls = pollDaysByDate[dateKey] ?? [];
              const isToday = dateKey === todayKey;

              return (
                <div
                  key={dateKey}
                  className={`min-h-36 border-b border-l border-white/5 p-3 transition last:border-l-0 ${
                    isCurrentMonth
                      ? "bg-transparent"
                      : "bg-black/10 opacity-35"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        isToday
                          ? "bg-purple-500 text-white"
                          : "text-white/65"
                      }`}
                    >
                      {date.getDate()}
                    </span>

                    {dayPolls.length > 0 && (
                      <span className="text-xs font-bold text-purple-300">
                        {dayPolls.length} אירועים
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-2">
                    {dayPolls.slice(0, 2).map((pollDay) => {
                      const status = getStatusStyles(
                        pollDay.poll?.status ?? "draft"
                      );

                      return (
                        <Link
                          key={pollDay.id}
                          href={`/polls/${pollDay.poll_id}`}
                          className="block rounded-xl border border-white/10 bg-white/[0.05] p-2.5 transition hover:border-purple-400/30 hover:bg-purple-400/10"
                        >
                          <p className="truncate text-xs font-bold text-white">
                            {pollDay.poll?.title ?? "סקר"}
                          </p>

                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 text-[11px] text-white/45">
                              <Clock3 size={11} />
                              {cleanTime(pollDay.start_time) ||
                                "--:--"}
                            </span>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                        </Link>
                      );
                    })}

                    {dayPolls.length > 2 && (
                      <p className="text-center text-xs font-bold text-purple-300">
                        ועוד {dayPolls.length - 2}
                      </p>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>

        <div className="p-4 sm:hidden">
          {pollDays.length === 0 ? (
            <EmptyState
              icon={<CalendarDays size={30} />}
              title="אין אירועים בחודש הזה"
              description="לא נמצאו סקרים או סשנים בחודש הנבחר."
            />
          ) : (
            <div className="space-y-3">
              {pollDays.map((pollDay) => {
                const status = getStatusStyles(
                  pollDay.poll?.status ?? "draft"
                );

                const formattedDate =
                  new Intl.DateTimeFormat("he-IL", {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                  }).format(
                    new Date(`${pollDay.date_x}T12:00:00`)
                  );

                return (
                  <Link
                    key={pollDay.id}
                    href={`/polls/${pollDay.poll_id}`}
                    className="block rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-purple-400/30 hover:bg-purple-400/10"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {pollDay.poll?.title ?? "סקר"}
                        </p>

                        <p className="mt-1 text-sm text-white/45">
                          {formattedDate}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-white/55">
                      <Clock3 size={16} />

                      <span>
                        {cleanTime(pollDay.start_time) ||
                          "לא הוגדרה שעה"}

                        {pollDay.end_time
                          ? ` עד ${cleanTime(pollDay.end_time)}`
                          : ""}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}