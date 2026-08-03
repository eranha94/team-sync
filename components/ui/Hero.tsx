"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  Gamepad2,
  Sparkles,
  UsersRound,
} from "lucide-react";

type HeroProps = {
  memberName?: string;
  sessionTitle?: string | null;
  sessionDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  availableCount?: number;
  pollId?: string | null;
};

function cleanTime(value?: string | null) {
  return value ? value.slice(0, 5) : "";
}

function formatHebrewDate(value?: string | null) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${value}T12:00:00`));
}

export default function Hero({
  memberName,
  sessionTitle,
  sessionDate,
  startTime,
  endTime,
  availableCount = 0,
  pollId,
}: HeroProps) {
  const hasUpcomingSession =
    Boolean(sessionDate) && Boolean(startTime);

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-[32px] border border-purple-400/20 bg-[#090811] shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
    >
      <div className="absolute inset-0">
        <Image
          src="/branding/dashboard-hero.png"
          alt="NightmareCamp"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 1200px"
        />

        <div className="absolute inset-0 bg-gradient-to-l from-[#08070d]/95 via-[#08070d]/65 to-[#08070d]/30" />

        <div className="absolute inset-0 bg-gradient-to-t from-[#08070d] via-transparent to-black/20" />
      </div>

      <div className="pointer-events-none absolute right-[-100px] top-[-100px] h-80 w-80 rounded-full bg-purple-600/25 blur-[120px]" />

      <div className="pointer-events-none absolute bottom-[-120px] left-[-100px] h-72 w-72 rounded-full bg-amber-400/10 blur-[110px]" />

      <div className="relative grid min-h-[360px] gap-8 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:p-10">
        <div className="flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-500/10 px-4 py-2 text-xs font-black tracking-[0.18em] text-purple-200 backdrop-blur">
                <Sparkles size={15} />
                NIGHTMARECAMP
              </span>

              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-xs font-bold text-amber-200 backdrop-blur">
                Israeli Premier League
              </span>
            </div>

            <h1 className="mt-6 max-w-2xl text-3xl font-black leading-tight text-white sm:text-5xl">
              שלום {memberName || "חבר קבוצה"} 👋
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55 sm:text-base">
              ברוך הבא ל־NightmareCamp Hub. כאן מנהלים זמינות,
              סשנים, שחקנים וכל מה שהקבוצה צריכה במקום אחד.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/polls"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-purple-500 to-purple-700 px-5 text-sm font-black text-white shadow-[0_14px_35px_rgba(126,34,206,0.3)] transition hover:-translate-y-0.5 hover:from-purple-400 hover:to-purple-600"
            >
              <Gamepad2 size={18} />
              מעבר לסקרים
            </Link>

            <Link
              href="/members"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 text-sm font-bold text-white/75 backdrop-blur transition hover:bg-white/[0.1] hover:text-white"
            >
              <UsersRound size={18} />
              סגל הקבוצה
            </Link>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl sm:p-6">
          {hasUpcomingSession ? (
            <>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.18em] text-amber-300">
                    הסשן הקרוב
                  </p>

                  <h2 className="mt-2 text-xl font-black text-white">
                    {sessionTitle || "סשן קבוצתי"}
                  </h2>
                </div>

                <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-black">
                  <p className="text-2xl font-black">
                    {availableCount}
                  </p>

                  <p className="text-[10px] font-bold">
                    זמינים
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.055] px-4 py-3">
                  <CalendarDays
                    size={18}
                    className="text-purple-300"
                  />

                  <span className="text-sm font-semibold text-white/70">
                    {formatHebrewDate(sessionDate)}
                  </span>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.055] px-4 py-3">
                  <Clock3
                    size={18}
                    className="text-purple-300"
                  />

                  <span className="text-sm font-semibold text-white/70">
                    {cleanTime(startTime)}

                    {endTime
                      ? ` עד ${cleanTime(endTime)}`
                      : ""}
                  </span>
                </div>
              </div>

              {pollId && (
                <Link
                  href={`/polls/${pollId}`}
                  className="mt-5 flex h-11 items-center justify-center rounded-2xl bg-white text-sm font-black text-black transition hover:bg-purple-100"
                >
                  צפייה בפרטי הסשן
                </Link>
              )}
            </>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                <Gamepad2 size={30} />
              </div>

              <h2 className="mt-5 text-xl font-black text-white">
                אין סשן קרוב
              </h2>

              <p className="mt-2 max-w-xs text-sm leading-6 text-white/40">
                קבע סשן מתוך תוצאות הסקר והוא יופיע כאן אוטומטית.
              </p>

              <Link
                href="/polls"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-amber-400 px-5 text-sm font-black text-black transition hover:bg-amber-300"
              >
                מעבר לסקרים
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}