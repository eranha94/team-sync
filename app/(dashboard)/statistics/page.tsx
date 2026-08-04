"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleHelp,
  RefreshCw,
  Trophy,
  UserCheck,
  UsersRound,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import useLanguage from "@/hooks/useLanguage";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Loading from "@/components/ui/Loading";
import PageTitle from "@/components/ui/PageTitle";
import Section from "@/components/ui/Section";
import StatCard from "@/components/ui/StatCard";

type AvailabilityStatus =
  | "available"
  | "maybe"
  | "unavailable";

type Member = {
  id: string;
  full_name: string;
  is_active: boolean;
};

type Poll = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "draft" | "open" | "closed";
  created_at: string;
};

type PollDay = {
  id: string;
  poll_id: string;
  date_x: string;
  start_time: string | null;
  end_time: string | null;
};

type Availability = {
  poll_day_id: string;
  member_id: string;
  status: AvailabilityStatus;
};

type DayStatistic = {
  id: string;
  date: string;
  available: number;
  maybe: number;
  unavailable: number;
  totalAnswers: number;
};

type MemberStatistic = {
  id: string;
  fullName: string;
  answeredDays: number;
  availableCount: number;
  maybeCount: number;
  unavailableCount: number;
  participationRate: number;
};

type StatisticsData = {
  members: Member[];
  polls: Poll[];
  pollDays: PollDay[];
  availability: Availability[];
};

function formatDate(
  dateString: string,
  locale: "he-IL" | "en-US"
) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function clampPercentage(value: number) {
  return Math.min(Math.max(value, 0), 100);
}

export default function StatisticsPage() {
  const { direction, isHebrew } = useLanguage();
  const locale = isHebrew ? "he-IL" : "en-US";

  const [data, setData] = useState<StatisticsData>({
    members: [],
    polls: [],
    pollDays: [],
    availability: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const loadStatistics = useCallback(
    async (fullLoading = false) => {
      if (fullLoading) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      setMessage("");

      try {
        const [
          membersResult,
          pollsResult,
          pollDaysResult,
          availabilityResult,
        ] = await Promise.all([
          supabase
            .from("members")
            .select("id, full_name, is_active")
            .eq("is_active", true)
            .order("full_name", {
              ascending: true,
            }),

          supabase
            .from("polls")
            .select(
              "id, title, start_date, end_date, status, created_at"
            )
            .order("created_at", {
              ascending: false,
            }),

          supabase
            .from("poll_days")
            .select(
              "id, poll_id, date_x, start_time, end_time"
            )
            .order("date_x", {
              ascending: false,
            }),

          supabase
            .from("availability")
            .select("poll_day_id, member_id, status"),
        ]);

        if (membersResult.error) {
          throw membersResult.error;
        }

        if (pollsResult.error) {
          throw pollsResult.error;
        }

        if (pollDaysResult.error) {
          throw pollDaysResult.error;
        }

        if (availabilityResult.error) {
          throw availabilityResult.error;
        }

        setData({
          members: (membersResult.data ?? []) as Member[],
          polls: (pollsResult.data ?? []) as Poll[],
          pollDays: (pollDaysResult.data ?? []) as PollDay[],
          availability:
            (availabilityResult.data ?? []) as Availability[],
        });
      } catch (error) {
        console.error("Statistics error:", error);

        setMessage(
          error instanceof Error
            ? error.message
            : isHebrew
              ? "לא ניתן לטעון את נתוני הסטטיסטיקה"
              : "Unable to load statistics data"
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isHebrew]
  );

  useEffect(() => {
    loadStatistics(true);
  }, [loadStatistics]);

  const totalAvailable = useMemo(
    () =>
      data.availability.filter(
        (answer) => answer.status === "available"
      ).length,
    [data.availability]
  );

  const totalMaybe = useMemo(
    () =>
      data.availability.filter(
        (answer) => answer.status === "maybe"
      ).length,
    [data.availability]
  );

  const totalUnavailable = useMemo(
    () =>
      data.availability.filter(
        (answer) => answer.status === "unavailable"
      ).length,
    [data.availability]
  );

  const totalAnswers = data.availability.length;

  const positiveAvailabilityRate =
    totalAnswers > 0
      ? Math.round((totalAvailable / totalAnswers) * 100)
      : 0;

  const answeredMemberIds = useMemo(
    () =>
      new Set(
        data.availability.map(
          (answer) => answer.member_id
        )
      ),
    [data.availability]
  );

  const membersWhoAnswered = answeredMemberIds.size;

  const memberResponseRate =
    data.members.length > 0
      ? Math.round(
          (membersWhoAnswered / data.members.length) * 100
        )
      : 0;

  const dayStatistics = useMemo<DayStatistic[]>(() => {
    return data.pollDays
      .map((day) => {
        const answers = data.availability.filter(
          (answer) => answer.poll_day_id === day.id
        );

        return {
          id: day.id,
          date: day.date_x,
          available: answers.filter(
            (answer) => answer.status === "available"
          ).length,
          maybe: answers.filter(
            (answer) => answer.status === "maybe"
          ).length,
          unavailable: answers.filter(
            (answer) => answer.status === "unavailable"
          ).length,
          totalAnswers: answers.length,
        };
      })
      .sort((firstDay, secondDay) => {
        if (secondDay.available !== firstDay.available) {
          return secondDay.available - firstDay.available;
        }

        return secondDay.maybe - firstDay.maybe;
      });
  }, [data.pollDays, data.availability]);

  const bestDay = dayStatistics[0] ?? null;

  const memberStatistics = useMemo<MemberStatistic[]>(() => {
    const totalDays = data.pollDays.length;

    return data.members
      .map((member) => {
        const answers = data.availability.filter(
          (answer) => answer.member_id === member.id
        );

        return {
          id: member.id,
          fullName: member.full_name,
          answeredDays: answers.length,
          availableCount: answers.filter(
            (answer) => answer.status === "available"
          ).length,
          maybeCount: answers.filter(
            (answer) => answer.status === "maybe"
          ).length,
          unavailableCount: answers.filter(
            (answer) => answer.status === "unavailable"
          ).length,
          participationRate:
            totalDays > 0
              ? Math.round(
                  (answers.length / totalDays) * 100
                )
              : 0,
        };
      })
      .sort((firstMember, secondMember) => {
        if (
          secondMember.participationRate !==
          firstMember.participationRate
        ) {
          return (
            secondMember.participationRate -
            firstMember.participationRate
          );
        }

        return (
          secondMember.availableCount -
          firstMember.availableCount
        );
      });
  }, [data.members, data.pollDays, data.availability]);

  const mostActiveMember =
    memberStatistics.length > 0
      ? memberStatistics[0]
      : null;

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="lg"
        text={
          isHebrew
            ? "טוען את נתוני הסטטיסטיקה..."
            : "Loading statistics..."
        }
      />
    );
  }

  return (
    <main
      dir={direction}
      className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
    >
      <PageTitle
        title={isHebrew ? "סטטיסטיקות" : "Statistics"}
        subtitle={
          isHebrew
            ? "תמונת מצב מלאה של ההיענות והזמינות בקבוצה"
            : "A complete overview of team response and availability"
        }
        icon={<BarChart3 size={26} />}
        action={
          <button
            type="button"
            onClick={() => loadStatistics(false)}
            disabled={isRefreshing}
            className="flex h-11 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-bold transition hover:bg-white/[0.09] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={
                isRefreshing ? "animate-spin" : ""
              }
            />

            {isRefreshing
              ? isHebrew
                ? "מרענן..."
                : "Refreshing..."
              : isHebrew
                ? "רענון נתונים"
                : "Refresh data"}
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

      <Section
        title={isHebrew ? "תמונת מצב" : "Overview"}
        subtitle={
          isHebrew
            ? "מדדים כלליים מכל הסקרים שנשמרו במערכת"
            : "General metrics from all polls saved in the system"
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={
              isHebrew
                ? "חברי קבוצה פעילים"
                : "Active team members"
            }
            value={data.members.length}
            subtitle={
              isHebrew
                ? "חברים מורשים במערכת"
                : "Authorized members in the system"
            }
            icon={<UsersRound size={24} />}
            color="purple"
          />

          <StatCard
            title={isHebrew ? "אחוז מענה" : "Response rate"}
            value={`${memberResponseRate}%`}
            subtitle={
              isHebrew
                ? `${membersWhoAnswered} מתוך ${data.members.length} חברים`
                : `${membersWhoAnswered} out of ${data.members.length} members`
            }
            icon={<UserCheck size={24} />}
            color="green"
          />

          <StatCard
            title={
              isHebrew
                ? "זמינות חיובית"
                : "Positive availability"
            }
            value={`${positiveAvailabilityRate}%`}
            subtitle={
              isHebrew
                ? `${totalAvailable} סימוני זמין`
                : `${totalAvailable} available responses`
            }
            icon={<CheckCircle2 size={24} />}
            color="gold"
          />

          <StatCard
            title={
              isHebrew ? "סקרים במערכת" : "Polls in system"
            }
            value={data.polls.length}
            subtitle={
              isHebrew
                ? `${data.pollDays.length} ימי זמינות`
                : `${data.pollDays.length} availability days`
            }
            icon={<CalendarDays size={24} />}
            color="blue"
          />
        </div>
      </Section>

      <Section
        title={
          isHebrew ? "התפלגות תשובות" : "Response distribution"
        }
        subtitle={
          isHebrew
            ? "חלוקת כל תשובות הזמינות שנשמרו במערכת"
            : "Distribution of all saved availability responses"
        }
        className="mt-10"
      >
        {totalAnswers === 0 ? (
          <EmptyState
            icon={<BarChart3 size={34} />}
            title={
              isHebrew
                ? "אין עדיין נתוני זמינות"
                : "No availability data yet"
            }
            description={
              isHebrew
                ? "לאחר שחברי הקבוצה ימלאו סקרים, הנתונים יוצגו כאן."
                : "Once team members complete polls, the data will appear here."
            }
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
            <Card variant="purple" glow padding="lg">
              <h3 className="text-lg font-black text-white">
                {isHebrew ? "סיכום תשובות" : "Response summary"}
              </h3>

              <div className="mt-7 space-y-6">
                <ProgressRow
                  label={isHebrew ? "זמין" : "Available"}
                  value={totalAvailable}
                  total={totalAnswers}
                  className="bg-emerald-400"
                  textClassName="text-emerald-300"
                  icon={
                    <CheckCircle2 size={18} />
                  }
                />

                <ProgressRow
                  label={isHebrew ? "אולי" : "Maybe"}
                  value={totalMaybe}
                  total={totalAnswers}
                  className="bg-amber-400"
                  textClassName="text-amber-300"
                  icon={<CircleHelp size={18} />}
                />

                <ProgressRow
                  label={isHebrew ? "לא זמין" : "Unavailable"}
                  value={totalUnavailable}
                  total={totalAnswers}
                  className="bg-red-400"
                  textClassName="text-red-300"
                  icon={<XCircle size={18} />}
                />
              </div>

              <div className="mt-8 rounded-2xl border border-white/[0.07] bg-black/20 p-4 text-center">
                <p className="text-3xl font-black text-white">
                  {totalAnswers}
                </p>

                <p className="mt-1 text-xs text-white/40">
                  {isHebrew ? "סך כל התשובות" : "Total responses"}
                </p>
              </div>
            </Card>

            <Card variant="gold" glow padding="lg">
              {bestDay ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-amber-300">
                        <Trophy size={22} />

                        <span className="text-sm font-black">
                          {isHebrew
                            ? "היום הפופולרי ביותר"
                            : "Most popular day"}
                        </span>
                      </div>

                      <h3 className="mt-5 text-2xl font-black text-white">
                        {formatDate(bestDay.date, locale)}
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-amber-400 px-4 py-3 text-center text-black">
                      <p className="text-3xl font-black">
                        {bestDay.available}
                      </p>

                      <p className="text-xs font-bold">
                        {isHebrew ? "זמינים" : "Available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 gap-3">
                    <SmallMetric
                      value={bestDay.available}
                      label={isHebrew ? "זמינים" : "Available"}
                      className="bg-emerald-500/10 text-emerald-300"
                    />

                    <SmallMetric
                      value={bestDay.maybe}
                      label={isHebrew ? "אולי" : "Maybe"}
                      className="bg-amber-500/10 text-amber-300"
                    />

                    <SmallMetric
                      value={bestDay.unavailable}
                      label={isHebrew ? "לא זמינים" : "Unavailable"}
                      className="bg-red-500/10 text-red-300"
                    />
                  </div>

                  <p className="mt-6 text-sm leading-7 text-white/45">
                    {isHebrew
                      ? "היום הזה קיבל את מספר סימוני הזמינות הגבוה ביותר מבין כל הימים שנשמרו במערכת."
                      : "This day received the highest number of available responses among all saved days."}
                  </p>
                </>
              ) : (
                <EmptyState
                  icon={<Trophy size={30} />}
                  title={
                    isHebrew
                      ? "אין יום מומלץ"
                      : "No recommended day"
                  }
                  description={
                    isHebrew
                      ? "עדיין אין מספיק נתונים לחישוב היום הפופולרי."
                      : "There is not enough data yet to calculate the most popular day."
                  }
                />
              )}
            </Card>
          </div>
        )}
      </Section>

      <Section
        title={
          isHebrew
            ? "ביצועי חברי הקבוצה"
            : "Team member performance"
        }
        subtitle={
          isHebrew
            ? "מי משתתף באופן קבוע ומי עדיין כמעט לא עונה"
            : "Who participates regularly and who rarely responds"
        }
        className="mt-10"
      >
        {memberStatistics.length === 0 ? (
          <EmptyState
            icon={<UsersRound size={34} />}
            title={
              isHebrew
                ? "אין חברים להצגה"
                : "No members to display"
            }
            description={
              isHebrew
                ? "לא נמצאו חברי קבוצה פעילים."
                : "No active team members were found."
            }
          />
        ) : (
          <>
            {mostActiveMember && (
              <Card
                variant="purple"
                glow
                padding="lg"
                className="mb-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500/15 text-purple-300">
                      <Trophy size={30} />
                    </div>

                    <div>
                      <p className="text-xs font-black tracking-[0.16em] text-purple-300">
                        {isHebrew
                          ? "המשתתף הפעיל ביותר"
                          : "Most active participant"}
                      </p>

                      <h3 className="mt-2 text-2xl font-black text-white">
                        {mostActiveMember.fullName}
                      </h3>

                      <p className="mt-1 text-sm text-white/40">
                        {isHebrew
                          ? `${mostActiveMember.answeredDays} תשובות נשמרו`
                          : `${mostActiveMember.answeredDays} responses saved`}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-purple-500 px-5 py-4 text-center text-white">
                    <p className="text-3xl font-black">
                      {mostActiveMember.participationRate}%
                    </p>

                    <p className="text-xs font-bold">
                      {isHebrew ? "השתתפות" : "Participation"}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#12141c]/90">
              <div className="hidden grid-cols-[2fr_repeat(5,1fr)] gap-3 border-b border-white/[0.08] px-5 py-4 text-xs font-bold text-white/35 md:grid">
                <span>{isHebrew ? "שחקן" : "Player"}</span>
                <span className="text-center">
                  {isHebrew ? "השתתפות" : "Participation"}
                </span>
                <span className="text-center">
                  {isHebrew ? "תשובות" : "Responses"}
                </span>
                <span className="text-center">
                  {isHebrew ? "זמין" : "Available"}
                </span>
                <span className="text-center">
                  {isHebrew ? "אולי" : "Maybe"}
                </span>
                <span className="text-center">
                  {isHebrew ? "לא זמין" : "Unavailable"}
                </span>
              </div>

              <div className="divide-y divide-white/[0.06]">
                {memberStatistics.map(
                  (memberStatistic, index) => (
                    <div
                      key={memberStatistic.id}
                      className="grid gap-4 px-5 py-5 transition hover:bg-white/[0.025] md:grid-cols-[2fr_repeat(5,1fr)] md:items-center md:gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/15 font-black text-purple-300">
                          {memberStatistic.fullName
                            .trim()
                            .charAt(0)}
                        </div>

                        <div>
                          <p className="font-bold text-white">
                            {memberStatistic.fullName}
                          </p>

                          <p className="mt-0.5 text-xs text-white/30">
                            {isHebrew
                              ? `מקום ${index + 1}`
                              : `Rank ${index + 1}`}
                          </p>
                        </div>
                      </div>

                      <MobileMetric
                        label={
                          isHebrew ? "השתתפות" : "Participation"
                        }
                        value={`${memberStatistic.participationRate}%`}
                        className="text-purple-300"
                      />

                      <MobileMetric
                        label={isHebrew ? "תשובות" : "Responses"}
                        value={memberStatistic.answeredDays}
                        className="text-white"
                      />

                      <MobileMetric
                        label={isHebrew ? "זמין" : "Available"}
                        value={memberStatistic.availableCount}
                        className="text-emerald-300"
                      />

                      <MobileMetric
                        label={isHebrew ? "אולי" : "Maybe"}
                        value={memberStatistic.maybeCount}
                        className="text-amber-300"
                      />

                      <MobileMetric
                        label={isHebrew ? "לא זמין" : "Unavailable"}
                        value={
                          memberStatistic.unavailableCount
                        }
                        className="text-red-300"
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </Section>

      <Section
        title={
          isHebrew ? "הימים החזקים ביותר" : "Top days"
        }
        subtitle={
          isHebrew
            ? "דירוג הימים לפי מספר השחקנים שסימנו זמין"
            : "Days ranked by the number of players marked available"
        }
        className="mt-10"
      >
        {dayStatistics.length === 0 ? (
          <EmptyState
            icon={<CalendarDays size={34} />}
            title={
              isHebrew
                ? "אין ימים להצגה"
                : "No days to display"
            }
            description={
              isHebrew
                ? "לא נמצאו ימי סקר עם נתונים."
                : "No poll days with data were found."
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dayStatistics.slice(0, 9).map((day, index) => {
              const percentage =
                data.members.length > 0
                  ? Math.round(
                      (day.available /
                        data.members.length) *
                        100
                    )
                  : 0;

              return (
                <Card
                  key={day.id}
                  variant={index === 0 ? "gold" : "default"}
                  glow={index === 0}
                  interactive
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black text-purple-300">
                        {isHebrew
                          ? `מקום ${index + 1}`
                          : `Rank ${index + 1}`}
                      </p>

                      <h3 className="mt-2 font-black text-white">
                        {formatDate(day.date, locale)}
                      </h3>
                    </div>

                    <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-center text-emerald-300">
                      <p className="text-2xl font-black">
                        {day.available}
                      </p>

                      <p className="text-[10px] font-bold">
                        {isHebrew ? "זמינים" : "Available"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-purple-400 to-purple-600"
                      style={{
                        width: `${clampPercentage(
                          percentage
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/35">
                      {isHebrew
                        ? "זמינות הקבוצה"
                        : "Team availability"}
                    </span>

                    <span className="font-black text-purple-300">
                      {percentage}%
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </main>
  );
}

function ProgressRow({
  label,
  value,
  total,
  className,
  textClassName,
  icon,
}: {
  label: string;
  value: number;
  total: number;
  className: string;
  textClassName: string;
  icon: React.ReactNode;
}) {
  const percentage =
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div
          className={`flex items-center gap-2 text-sm font-bold ${textClassName}`}
        >
          {icon}
          {label}
        </div>

        <div className="text-left">
          <span className="font-black text-white">
            {value}
          </span>

          <span className="mr-2 text-xs text-white/35">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full transition-all duration-700 ${className}`}
          style={{
            width: `${clampPercentage(percentage)}%`,
          }}
        />
      </div>
    </div>
  );
}

function SmallMetric({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-3 text-center ${className}`}>
      <p className="text-2xl font-black">{value}</p>

      <p className="mt-1 text-[11px] opacity-70">
        {label}
      </p>
    </div>
  );
}

function MobileMetric({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className: string;
}) {
  return (
    <div className="flex items-center justify-between md:block md:text-center">
      <span className="text-xs text-white/35 md:hidden">
        {label}
      </span>

      <span className={`font-black ${className}`}>
        {value}
      </span>
    </div>
  );
}