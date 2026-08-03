"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import Card from "@/components/ui/Card";

type OpenPollCardProps = {
  pollId: string;
  title: string;
  startDate: string;
  endDate: string;
  responseRate: number;
};

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

export default function OpenPollCard({
  pollId,
  title,
  startDate,
  endDate,
  responseRate,
}: OpenPollCardProps) {
  const safeResponseRate = Math.min(
    Math.max(responseRate, 0),
    100
  );

  return (
    <Card
      variant="purple"
      glow
      className="h-full"
      padding="lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-purple-300">
            הסקר הפתוח
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm text-white/40">
            {formatHebrewDate(startDate)}
            {" עד "}
            {formatHebrewDate(endDate)}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
          <CalendarDays size={23} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/45">
            התקדמות המענה
          </span>

          <span className="font-black text-purple-300">
            {safeResponseRate}%
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-l from-purple-400 to-purple-600 transition-all duration-700"
            style={{
              width: `${safeResponseRate}%`,
            }}
          />
        </div>
      </div>

      <Link
        href={`/polls/${pollId}`}
        className="mt-8 flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-white transition hover:border-purple-400/30 hover:bg-purple-500/15"
      >
        מעבר למילוי הסקר
      </Link>
    </Card>
  );
}