"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  ClipboardPlus,
  Clock3,
  Crown,
  Gamepad2,
  RefreshCw,
  UsersRound,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useCurrentMember } from "@/hooks/useCurrentMember";

type Poll = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  closes_at: string | null;
  status: "draft" | "open" | "closed";
};

type PollDay = {
  id: string;
  date_x: string;
  start_time: string | null;
  end_time: string | null;
};

type Availability = {
  poll_day_id: string;
  member_id: string;
  status: "available" | "maybe" | "unavailable";
  available_from: string | null;
  available_until: string | null;
};

type UpcomingSession = {
  id: string;
  poll_id: string | null;
  poll_day_id: string | null;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

type DayResult = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  maybeCount: number;
};

function cleanTime(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DashboardPage() {
  const { member } = useCurrentMember();

  const [activeMembersCount, setActiveMembersCount] = useState(0);

  const [openPoll, setOpenPoll] = useState<Poll | null>(null);
  const [pollDays, setPollDays] = useState<PollDay[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);

  const [upcomingSession, setUpcomingSession] =
    useState<UpcomingSession | null>(null);

  const [sessionAvailableCount, setSessionAvailableCount] =
    useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      /*
       * חברי קבוצה פעילים
       */
      const { count: membersCount, error: membersError } =
        await supabase
          .from("members")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("is_active", true);

      if (membersError) {
        throw membersError;
      }

      setActiveMembersCount(membersCount ?? 0);

      /*
       * הסשן הקרוב
       */
      const today = getLocalDateString();

      const { data: sessionData, error: sessionError } =
        await supabase
          .from("sessions")
          .select(
            `
              id,
              poll_id,
              poll_day_id,
              title,
              session_date,
              start_time,
              end_time,
              status
            `
          )
          .eq("status", "scheduled")
          .gte("session_date", today)
          .order("session_date", {
            ascending: true,
          })
          .order("start_time", {
            ascending: true,
          })
          .limit(1)
          .maybeSingle();

      if (sessionError) {
        throw sessionError;
      }

      setUpcomingSession(sessionData ?? null);
      setSessionAvailableCount(0);

      if (sessionData?.poll_day_id) {
        const {
          count: availableCount,
          error: availableCountError,
        } = await supabase
          .from("availability")
          .select("*", {
            count: "exact",
            head: true,
          })
          .eq("poll_day_id", sessionData.poll_day_id)
          .eq("status", "available");

        if (availableCountError) {
          throw availableCountError;
        }

        setSessionAvailableCount(availableCount ?? 0);
      }

      /*
       * הסקר הפתוח האחרון
       */
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select(
          "id, title, start_date, end_date, closes_at, status"
        )
        .eq("status", "open")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (pollError) {
        throw pollError;
      }

      setOpenPoll(pollData ?? null);

      if (!pollData) {
        setPollDays([]);
        setAvailability([]);
        return;
      }

      /*
       * ימי הסקר
       */
      const { data: daysData, error: daysError } = await supabase
        .from("poll_days")
        .select("id, date_x, start_time, end_time")
        .eq("poll_id", pollData.id)
        .order("date_x", {
          ascending: true,
        })
        .order("start_time", {
          ascending: true,
        });

      if (daysError) {
        throw daysError;
      }

      const loadedDays = daysData ?? [];

      setPollDays(loadedDays);

      if (loadedDays.length === 0) {
        setAvailability([]);
        return;
      }

      /*
       * תשובות הזמינות של הסקר
       */
      const dayIds = loadedDays.map((day) => day.id);

      const {
        data: availabilityData,
        error: availabilityError,
      } = await supabase
        .from("availability")
        .select(
          `
            poll_day_id,
            member_id,
            status,
            available_from,
            available_until
          `
        )
        .in("poll_day_id", dayIds);

      if (availabilityError) {
        throw availabilityError;
      }

      setAvailability(availabilityData ?? []);
    } catch (error) {
      console.error("Dashboard error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "לא ניתן לטעון את נתוני הדאשבורד"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const answeredMembersCount = useMemo(() => {
    return new Set(
      availability.map((answer) => answer.member_id)
    ).size;
  }, [availability]);

  const waitingMembersCount = openPoll
    ? Math.max(
        activeMembersCount - answeredMembersCount,
        0
      )
    : 0;

  const responseRate =
    openPoll && activeMembersCount > 0
      ? Math.round(
          (answeredMembersCount / activeMembersCount) * 100
        )
      : 0;

  const dayResults = useMemo<DayResult[]>(() => {
    return pollDays.map((day) => {
      const dayAnswers = availability.filter(
        (answer) => answer.poll_day_id === day.id
      );

      return {
        id: day.id,
        date: day.date_x,
        startTime: cleanTime(day.start_time),
        endTime: cleanTime(day.end_time),
        availableCount: dayAnswers.filter(
          (answer) => answer.status === "available"
        ).length,
        maybeCount: dayAnswers.filter(
          (answer) => answer.status === "maybe"
        ).length,
      };
    });
  }, [pollDays, availability]);

  const bestDay = useMemo(() => {
    if (dayResults.length === 0) {
      return null;
    }

    return [...dayResults].sort((firstDay, secondDay) => {
      if (
        secondDay.availableCount !== firstDay.availableCount
      ) {
        return (
          secondDay.availableCount -
          firstDay.availableCount
        );
      }

      if (secondDay.maybeCount !== firstDay.maybeCount) {
        return secondDay.maybeCount - firstDay.maybeCount;
      }

      return firstDay.date.localeCompare(secondDay.date);
    })[0];
  }, [dayResults]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-amber-400" />

          <p className="mt-4 text-sm text-white/45">
            טוען את נתוני הקבוצה...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
    >
      <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-amber-300">
            TEAM SYNC
          </p>

          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            שלום {member?.fullName ?? "מנהל"} 👋
          </h1>

          <p className="mt-2 text-white/45">
            הנה תמונת המצב של הקבוצה
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="flex h-11 w-fit items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:bg-white/[0.09]"
        >
          <RefreshCw size={17} />
          רענון נתונים
        </button>
      </header>

      {message && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="חברי קבוצה פעילים"
          value={activeMembersCount.toString()}
          subtitle="חברים מורשים במערכת"
          icon={<UsersRound size={22} />}
        />

        <DashboardCard
          title="ענו לסקר"
          value={answeredMembersCount.toString()}
          subtitle={
            openPoll
              ? `מתוך ${activeMembersCount} חברים`
              : "אין כרגע סקר פתוח"
          }
          icon={<CheckCircle2 size={22} />}
        />

        <DashboardCard
          title="טרם ענו"
          value={waitingMembersCount.toString()}
          subtitle={
            openPoll
              ? "ממתינים לתגובה"
              : "אין כרגע סקר פתוח"
          }
          icon={<CircleHelp size={22} />}
        />

        <DashboardCard
          title="אחוז היענות"
          value={`${responseRate}%`}
          subtitle={
            openPoll
              ? openPoll.title
              : "פתח סקר כדי להתחיל"
          }
          icon={<ClipboardPlus size={22} />}
        />
      </section>

      <section className="mt-6">
        {upcomingSession ? (
          <article className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/15 via-white/[0.04] to-transparent p-6 sm:p-8">
            <div className="absolute left-[-60px] top-[-70px] h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Gamepad2 size={21} />

                  <span className="text-sm font-bold">
                    הסשן הקרוב
                  </span>
                </div>

                <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                  {upcomingSession.title}
                </h2>

                <div className="mt-4 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-xl bg-black/20 px-4 py-2 text-sm text-white/65">
                    <CalendarDays
                      size={17}
                      className="text-emerald-300"
                    />

                    {formatHebrewDate(
                      upcomingSession.session_date
                    )}
                  </div>

                  <div className="flex items-center gap-2 rounded-xl bg-black/20 px-4 py-2 text-sm text-white/65">
                    <Clock3
                      size={17}
                      className="text-emerald-300"
                    />

                    {cleanTime(
                      upcomingSession.start_time
                    )}

                    {upcomingSession.end_time
                      ? ` עד ${cleanTime(
                          upcomingSession.end_time
                        )}`
                      : ""}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <div className="min-w-28 rounded-2xl bg-emerald-400 p-4 text-center text-black">
                  <p className="text-3xl font-black">
                    {sessionAvailableCount}
                  </p>

                  <p className="mt-1 text-xs font-bold">
                    שחקנים זמינים
                  </p>
                </div>

                {upcomingSession.poll_id && (
                  <Link
                    href={`/polls/${upcomingSession.poll_id}`}
                    className="flex min-w-28 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-center text-sm font-bold transition hover:bg-white/[0.1]"
                  >
                    צפייה בפרטים
                  </Link>
                )}
              </div>
            </div>
          </article>
        ) : (
          <article className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] text-white/35">
                  <Gamepad2 size={25} />
                </div>

                <div>
                  <h2 className="font-black">
                    אין סשן קרוב
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    קבע סשן מתוך תוצאות הסקר
                  </p>
                </div>
              </div>

              {openPoll && (
                <Link
                  href={`/polls/${openPoll.id}`}
                  className="flex h-11 items-center justify-center rounded-xl bg-amber-400 px-5 text-sm font-bold text-black transition hover:bg-amber-300"
                >
                  מעבר לסקר
                </Link>
              )}
            </div>
          </article>
        )}
      </section>

      {openPoll ? (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/15 to-transparent p-6 sm:p-8">
              {bestDay ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300">
                        <Crown size={22} />

                        <span className="text-sm font-bold">
                          היום המומלץ לסשן
                        </span>
                      </div>

                      <h2 className="mt-5 text-3xl font-black">
                        {formatHebrewDate(bestDay.date)}
                      </h2>

                      <p className="mt-2 text-lg font-semibold text-white/65">
                        {bestDay.startTime
                          ? `בשעה ${bestDay.startTime}`
                          : "לא הוגדרה שעה"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-black">
                      <p className="text-3xl font-black">
                        {bestDay.availableCount}
                      </p>

                      <p className="text-xs font-bold">
                        זמינים
                      </p>
                    </div>
                  </div>

                  <p className="mt-7 text-sm leading-7 text-white/50">
                    ביום הזה קיימת כמות הזמינים הגבוהה
                    ביותר. בנוסף יש {bestDay.maybeCount}{" "}
                    שסימנו אולי.
                  </p>

                  <Link
                    href={`/polls/${openPoll.id}`}
                    className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-amber-400 px-5 font-bold text-black transition hover:bg-amber-300"
                  >
                    צפייה בסקר
                    <ArrowLeft size={18} />
                  </Link>
                </>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-lg font-bold">
                    עדיין אין ימים בסקר
                  </p>

                  <p className="mt-2 text-sm text-white/45">
                    הוסף ימים לסקר כדי לקבל המלצה
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-white/45">
                הסקר הפתוח
              </p>

              <h2 className="mt-2 text-xl font-black">
                {openPoll.title}
              </h2>

              <p className="mt-2 text-sm text-white/40">
                {formatHebrewDate(openPoll.start_date)}
                {" עד "}
                {formatHebrewDate(openPoll.end_date)}
              </p>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{
                    width: `${Math.min(responseRate, 100)}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-white/40">
                  התקדמות המענה
                </span>

                <span className="font-bold text-amber-300">
                  {responseRate}%
                </span>
              </div>

              <Link
                href={`/polls/${openPoll.id}`}
                className="mt-6 flex h-11 items-center justify-center rounded-xl bg-white/10 text-sm font-bold transition hover:bg-white/15"
              >
                מעבר למילוי הסקר
              </Link>
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">
                זמינות לפי ימים
              </h2>

              <Link
                href="/polls"
                className="text-sm font-bold text-amber-300"
              >
                כל הסקרים
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {dayResults.map((day) => (
                <article
                  key={day.id}
                  className={`rounded-3xl border p-5 ${
                    bestDay?.id === day.id
                      ? "border-amber-300/40 bg-amber-400/[0.08]"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">
                        {formatHebrewDate(day.date)}
                      </h3>

                      <p className="mt-1 text-sm text-white/40">
                        {day.startTime || "--:--"}

                        {day.endTime
                          ? ` עד ${day.endTime}`
                          : ""}
                      </p>
                    </div>

                    {bestDay?.id === day.id && (
                      <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black">
                        מומלץ
                      </span>
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
                </article>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className="mt-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
            <CalendarDays size={30} />
          </div>

          <h2 className="mt-5 text-2xl font-black">
            אין כרגע סקר פתוח
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">
            פתח סקר חדש כדי לאסוף את הזמינות של חברי
            הקבוצה ולגלות מהו היום הטוב ביותר לסשן.
          </p>

          <Link
            href="/polls/new"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-amber-400 px-6 font-bold text-black transition hover:bg-amber-300"
          >
            פתיחת סקר חדש
          </Link>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-black">
          פעולות מהירות
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            href="/polls/new"
            title="פתיחת סקר חדש"
            description="יצירת סקר זמינות חדש"
            icon={<ClipboardPlus size={24} />}
          />

          <QuickAction
            href="/members"
            title="ניהול שחקנים"
            description="הוספה והפעלה של חברי הקבוצה"
            icon={<UsersRound size={24} />}
          />

          <QuickAction
            href="/polls"
            title="כל הסקרים"
            description="צפייה וניהול של הסקרים"
            icon={<CalendarDays size={24} />}
          />
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/45">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-amber-300">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-black">{value}</p>

      <p className="mt-2 text-xs text-white/35">
        {subtitle}
      </p>
    </article>
  );
}

function QuickAction({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-amber-300/30 hover:bg-white/[0.07]"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300 transition group-hover:bg-amber-400 group-hover:text-black">
        {icon}
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>

        <p className="mt-1 text-sm text-white/40">
          {description}
        </p>
      </div>
    </Link>
  );
}