"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  HelpCircle,
  Loader2,
  Save,
  UsersRound,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { useCurrentMember } from "@/hooks/useCurrentMember";

type Poll = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: "draft" | "open" | "closed";
};

type PollDay = {
  id: string;
  poll_id: string;
  date_x: string;
  start_time: string | null;
  end_time: string | null;
};

type Member = {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
};

type AvailabilityStatus = "available" | "maybe" | "unavailable";

type Availability = {
  id?: string;
  poll_day_id: string;
  member_id: string;
  status: AvailabilityStatus;
  available_from: string | null;
  available_until: string | null;
};

type Session = {
  id: string;
  poll_day_id: string | null;
  session_date: string;
  start_time: string;
  end_time: string | null;
  status: "scheduled" | "completed" | "cancelled";
};

type DayResult = {
  day: PollDay;
  available: Member[];
  maybe: Member[];
  unavailable: Member[];
};

function cleanTime(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

export default function PollDetailsPage() {
  const params = useParams();
  const pollId = params.id as string;

  const { member } = useCurrentMember();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [pollDays, setPollDays] = useState<PollDay[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [existingSessions, setExistingSessions] = useState<Session[]>([]);

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [answers, setAnswers] = useState<
    Record<string, AvailabilityStatus>
  >({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [creatingSessionDayId, setCreatingSessionDayId] = useState<
    string | null
  >(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const isAdmin = member?.role === "admin";

  const loadPoll = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const { data: pollData, error: pollError } = await supabase
        .from("polls")
        .select("id, title, start_date, end_date, status")
        .eq("id", pollId)
        .single();

      if (pollError) {
        throw pollError;
      }

      setPoll(pollData);

      const { data: daysData, error: daysError } = await supabase
        .from("poll_days")
        .select("id, poll_id, date_x, start_time, end_time")
        .eq("poll_id", pollId)
        .order("date_x", {
          ascending: true,
        });

      if (daysError) {
        throw daysError;
      }

      const loadedDays = daysData ?? [];
      setPollDays(loadedDays);

      const { data: membersData, error: membersError } =
        await supabase
          .from("members")
          .select("id, full_name, phone, role, is_active")
          .eq("is_active", true)
          .order("full_name", {
            ascending: true,
          });

      if (membersError) {
        throw membersError;
      }

      const loadedMembers = membersData ?? [];
      setMembers(loadedMembers);

      if (!selectedMemberId && member?.id) {
        setSelectedMemberId(member.id);
      }

      if (loadedDays.length > 0) {
        const dayIds = loadedDays.map((day) => day.id);

        const {
          data: availabilityData,
          error: availabilityError,
        } = await supabase
          .from("availability")
          .select(
            "id, poll_day_id, member_id, status, available_from, available_until"
          )
          .in("poll_day_id", dayIds);

        if (availabilityError) {
          throw availabilityError;
        }

        setAvailability(availabilityData ?? []);

        const { data: sessionsData, error: sessionsError } =
          await supabase
            .from("sessions")
            .select(
              "id, poll_day_id, session_date, start_time, end_time, status"
            )
            .eq("poll_id", pollId)
            .neq("status", "cancelled");

        if (sessionsError) {
          throw sessionsError;
        }

        setExistingSessions(sessionsData ?? []);
      } else {
        setAvailability([]);
        setExistingSessions([]);
      }
    } catch (error) {
      console.error("Load poll error:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "לא ניתן לטעון את הסקר"
      );
    } finally {
      setIsLoading(false);
    }
  }, [pollId, member?.id, selectedMemberId]);

  useEffect(() => {
    loadPoll();
  }, [loadPoll]);

  useEffect(() => {
    if (!selectedMemberId) {
      setAnswers({});
      return;
    }

    const memberAnswers = availability.filter(
      (answer) => answer.member_id === selectedMemberId
    );

    const nextAnswers: Record<string, AvailabilityStatus> = {};

    memberAnswers.forEach((answer) => {
      nextAnswers[answer.poll_day_id] = answer.status;
    });

    setAnswers(nextAnswers);
  }, [selectedMemberId, availability]);

  const dayResults = useMemo<DayResult[]>(() => {
    return pollDays.map((day) => {
      const dayAnswers = availability.filter(
        (answer) => answer.poll_day_id === day.id
      );

      const getMembersByStatus = (
        status: AvailabilityStatus
      ) => {
        const memberIds = new Set(
          dayAnswers
            .filter((answer) => answer.status === status)
            .map((answer) => answer.member_id)
        );

        return members.filter((currentMember) =>
          memberIds.has(currentMember.id)
        );
      };

      return {
        day,
        available: getMembersByStatus("available"),
        maybe: getMembersByStatus("maybe"),
        unavailable: getMembersByStatus("unavailable"),
      };
    });
  }, [pollDays, availability, members]);

  const bestDayId = useMemo(() => {
    if (dayResults.length === 0) {
      return null;
    }

    return [...dayResults].sort((firstDay, secondDay) => {
      if (
        secondDay.available.length !== firstDay.available.length
      ) {
        return (
          secondDay.available.length -
          firstDay.available.length
        );
      }

      return secondDay.maybe.length - firstDay.maybe.length;
    })[0].day.id;
  }, [dayResults]);

  const answeredMemberIds = useMemo(() => {
    return new Set(
      availability.map((answer) => answer.member_id)
    );
  }, [availability]);

  const waitingMembers = members.filter(
    (currentMember) => !answeredMemberIds.has(currentMember.id)
  );

  async function saveAvailability() {
    if (!selectedMemberId) {
      setMessageType("error");
      setMessage("יש לבחור שחקן");
      return;
    }

    if (Object.keys(answers).length === 0) {
      setMessageType("error");
      setMessage("יש לסמן זמינות לפחות ביום אחד");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const rows = pollDays
        .filter((day) => answers[day.id])
        .map((day) => ({
          poll_day_id: day.id,
          member_id: selectedMemberId,
          status: answers[day.id],
          available_from: day.start_time,
          available_until: day.end_time,
        }));

      const { error } = await supabase
        .from("availability")
        .upsert(rows, {
          onConflict: "poll_day_id,member_id",
        });

      if (error) {
        throw error;
      }

      setMessageType("success");
      setMessage("הזמינות נשמרה בהצלחה");

      await loadPoll();
    } catch (error) {
      console.error("Save availability error:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "שמירת הזמינות נכשלה"
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function createSession(day: PollDay) {
    if (!isAdmin) {
      setMessageType("error");
      setMessage("רק מנהל יכול לקבוע סשן");
      return;
    }

    if (!day.start_time) {
      setMessageType("error");
      setMessage("לא הוגדרה שעת התחלה ליום הזה");
      return;
    }

    const alreadyExists = existingSessions.some(
      (session) => session.poll_day_id === day.id
    );

    if (alreadyExists) {
      setMessageType("error");
      setMessage("כבר קיים סשן ליום הזה");
      return;
    }

    const approved = window.confirm(
      `לקבוע סשן ביום ${formatHebrewDate(
        day.date_x
      )} בשעה ${cleanTime(day.start_time)}?`
    );

    if (!approved) {
      return;
    }

    setCreatingSessionDayId(day.id);
    setMessage("");

    try {
      const { error } = await supabase.from("sessions").insert({
        poll_id: pollId,
        poll_day_id: day.id,
        title: poll?.title
          ? `סשן - ${poll.title}`
          : "סשן קבוצתי",
        session_date: day.date_x,
        start_time: day.start_time,
        end_time: day.end_time,
        status: "scheduled",
      });

      if (error) {
        throw error;
      }

      setMessageType("success");
      setMessage("הסשן נקבע בהצלחה");

      await loadPoll();
    } catch (error) {
      console.error("Create session error:", error);

      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "יצירת הסשן נכשלה"
      );
    } finally {
      setCreatingSessionDayId(null);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto animate-spin text-amber-300" />

          <p className="mt-4 text-sm text-white/45">
            טוען את הסקר...
          </p>
        </div>
      </main>
    );
  }

  if (!poll) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-300">
          הסקר לא נמצא
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <header className="mb-8">
        <p className="text-sm font-bold tracking-[0.2em] text-amber-300">
          TEAM SYNC
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">
              {poll.title}
            </h1>

            <p className="mt-2 text-white/45">
              {formatHebrewDate(poll.start_date)}
              {" עד "}
              {formatHebrewDate(poll.end_date)}
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
              poll.status === "open"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-white/10 text-white/50"
            }`}
          >
            {poll.status === "open" ? "סקר פתוח" : "סקר סגור"}
          </span>
        </div>
      </header>

      {message && (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="שחקנים פעילים"
          value={members.length}
          icon={<UsersRound size={22} />}
        />

        <SummaryCard
          title="ענו לסקר"
          value={answeredMemberIds.size}
          icon={<CheckCircle2 size={22} />}
        />

        <SummaryCard
          title="טרם ענו"
          value={waitingMembers.length}
          icon={<HelpCircle size={22} />}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <div className="mb-6">
          <h2 className="text-xl font-black">
            מילוי זמינות
          </h2>

          <p className="mt-1 text-sm text-white/40">
            בחר שחקן וסמן את הזמינות שלו בכל יום
          </p>
        </div>

        {isAdmin ? (
          <div className="mb-6">
            <label className="mb-2 block text-sm text-white/55">
              בחירת שחקן
            </label>

            <select
              value={selectedMemberId}
              onChange={(event) =>
                setSelectedMemberId(event.target.value)
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-[#10131a] px-4 outline-none focus:border-amber-300/50"
            >
              <option value="">בחר שחקן</option>

              {members.map((currentMember) => (
                <option
                  key={currentMember.id}
                  value={currentMember.id}
                >
                  {currentMember.full_name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-white/[0.05] px-4 py-3 text-sm">
            ממלא זמינות עבור:{" "}
            <strong>{member?.fullName}</strong>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pollDays.map((day) => (
            <article
              key={day.id}
              className="rounded-3xl border border-white/10 bg-black/20 p-5"
            >
              <h3 className="font-bold">
                {formatHebrewDate(day.date_x)}
              </h3>

              <p className="mt-1 flex items-center gap-2 text-sm text-white/40">
                <Clock3 size={15} />

                {cleanTime(day.start_time) || "--:--"}

                {day.end_time
                  ? ` עד ${cleanTime(day.end_time)}`
                  : ""}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <AvailabilityButton
                  active={answers[day.id] === "available"}
                  label="זמין"
                  icon={<Check size={17} />}
                  activeClass="border-emerald-400 bg-emerald-400 text-black"
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [day.id]: "available",
                    }))
                  }
                />

                <AvailabilityButton
                  active={answers[day.id] === "maybe"}
                  label="אולי"
                  icon={<HelpCircle size={17} />}
                  activeClass="border-amber-400 bg-amber-400 text-black"
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [day.id]: "maybe",
                    }))
                  }
                />

                <AvailabilityButton
                  active={answers[day.id] === "unavailable"}
                  label="לא"
                  icon={<X size={17} />}
                  activeClass="border-red-400 bg-red-400 text-black"
                  onClick={() =>
                    setAnswers((current) => ({
                      ...current,
                      [day.id]: "unavailable",
                    }))
                  }
                />
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          disabled={
            isSaving ||
            !selectedMemberId ||
            poll.status !== "open"
          }
          onClick={saveAvailability}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-7"
        >
          {isSaving ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              שומר...
            </>
          ) : (
            <>
              <Save size={18} />
              שמירת זמינות
            </>
          )}
        </button>
      </section>

      {isAdmin && (
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-black">
              תוצאות הסקר
            </h2>

            <p className="mt-1 text-sm text-white/40">
              פירוט הזמינות ואפשרות לקביעת סשן
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {dayResults.map((result) => {
              const isBestDay = result.day.id === bestDayId;

              const existingSession = existingSessions.find(
                (session) =>
                  session.poll_day_id === result.day.id
              );

              return (
                <article
                  key={result.day.id}
                  className={`rounded-3xl border p-5 sm:p-6 ${
                    isBestDay
                      ? "border-amber-300/40 bg-amber-400/[0.07]"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black">
                          {formatHebrewDate(result.day.date_x)}
                        </h3>

                        {isBestDay && (
                          <Crown
                            size={18}
                            className="text-amber-300"
                          />
                        )}
                      </div>

                      <p className="mt-1 text-sm text-white/40">
                        {cleanTime(result.day.start_time) ||
                          "--:--"}

                        {result.day.end_time
                          ? ` עד ${cleanTime(
                              result.day.end_time
                            )}`
                          : ""}
                      </p>
                    </div>

                    {isBestDay && (
                      <span className="w-fit rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-black">
                        היום המומלץ
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <ResultCount
                      value={result.available.length}
                      label="זמינים"
                      className="bg-emerald-500/10 text-emerald-300"
                    />

                    <ResultCount
                      value={result.maybe.length}
                      label="אולי"
                      className="bg-amber-500/10 text-amber-300"
                    />

                    <ResultCount
                      value={result.unavailable.length}
                      label="לא זמינים"
                      className="bg-red-500/10 text-red-300"
                    />
                  </div>

                  <div className="mt-5 space-y-4">
                    <MemberNames
                      title="זמינים"
                      members={result.available}
                      emptyText="אף אחד עדיין לא סימן זמין"
                    />

                    <MemberNames
                      title="אולי"
                      members={result.maybe}
                      emptyText="אין תשובות אולי"
                    />

                    <MemberNames
                      title="לא זמינים"
                      members={result.unavailable}
                      emptyText="אין תשובות לא זמין"
                    />
                  </div>

                  {existingSession ? (
                    <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300">
                      <CalendarCheck size={18} />
                      נקבע סשן ליום הזה
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        creatingSessionDayId === result.day.id
                      }
                      onClick={() =>
                        createSession(result.day)
                      }
                      className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 font-bold text-black transition hover:bg-amber-300 disabled:opacity-50"
                    >
                      {creatingSessionDayId ===
                      result.day.id ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          קובע סשן...
                        </>
                      ) : (
                        <>
                          <CalendarCheck size={18} />
                          קבע כסשן
                        </>
                      )}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {isAdmin && waitingMembers.length > 0 && (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h2 className="font-black">
            עדיין לא ענו
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            {waitingMembers.map((waitingMember) => (
              <span
                key={waitingMember.id}
                className="rounded-full bg-white/[0.06] px-3 py-2 text-sm text-white/60"
              >
                {waitingMember.full_name}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/45">
          {title}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] text-amber-300">
          {icon}
        </div>
      </div>

      <p className="mt-5 text-3xl font-black">
        {value}
      </p>
    </article>
  );
}

function AvailabilityButton({
  active,
  label,
  icon,
  activeClass,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-bold transition ${
        active
          ? activeClass
          : "border-white/10 bg-white/[0.04] text-white/45 hover:bg-white/[0.08]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ResultCount({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${className}`}
    >
      <p className="text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-xs opacity-70">
        {label}
      </p>
    </div>
  );
}

function MemberNames({
  title,
  members,
  emptyText,
}: {
  title: string;
  members: Member[];
  emptyText: string;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-white/40">
        {title}
      </p>

      {members.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {members.map((currentMember) => (
            <span
              key={currentMember.id}
              className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs text-white/65"
            >
              {currentMember.full_name}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-white/25">
          {emptyText}
        </p>
      )}
    </div>
  );
}