"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import useLanguage from "@/hooks/useLanguage";

type PollDay = {
  date: string;
  selected: boolean;
};

const DEFAULT_TITLE_HE = "זמינות לשבוע הקרוב";
const DEFAULT_TITLE_EN = "Availability for the upcoming week";

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

function createDateRange(
  startDate: string,
  endDate: string
): PollDay[] {
  if (!startDate || !endDate) {
    return [];
  }

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  if (end < start) {
    return [];
  }

  const result: PollDay[] = [];
  const current = new Date(start);

  while (current <= end) {
    result.push({
      date: current.toISOString().slice(0, 10),
      selected: true,
    });

    current.setDate(current.getDate() + 1);
  }

  return result;
}

export default function NewPollPage() {
  const router = useRouter();
  const { direction, isHebrew } = useLanguage();

  const [title, setTitle] = useState(DEFAULT_TITLE_HE);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("00:00");
  const [days, setDays] = useState<PollDay[]>([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("error");
  const [isSaving, setIsSaving] = useState(false);

  const locale = isHebrew ? "he-IL" : "en-US";

  useEffect(() => {
    setTitle((currentTitle) => {
      const isDefaultTitle =
        currentTitle === DEFAULT_TITLE_HE ||
        currentTitle === DEFAULT_TITLE_EN;

      if (!isDefaultTitle) {
        return currentTitle;
      }

      return isHebrew
        ? DEFAULT_TITLE_HE
        : DEFAULT_TITLE_EN;
    });
  }, [isHebrew]);

  const selectedDaysCount = useMemo(
    () => days.filter((day) => day.selected).length,
    [days]
  );

  function clearMessage() {
    setMessage("");
    setMessageType("error");
  }

  function generateDays() {
    clearMessage();

    if (!startDate || !endDate) {
      setMessage(
        isHebrew
          ? "יש לבחור תאריך התחלה ותאריך סיום"
          : "Select a start date and an end date"
      );
      return;
    }

    const generatedDays = createDateRange(
      startDate,
      endDate
    );

    if (generatedDays.length === 0) {
      setMessage(
        isHebrew
          ? "תאריך הסיום חייב להיות אחרי תאריך ההתחלה"
          : "The end date must be after the start date"
      );
      return;
    }

    setDays(generatedDays);
  }

  function toggleDay(date: string) {
    clearMessage();

    setDays((currentDays) =>
      currentDays.map((day) =>
        day.date === date
          ? {
              ...day,
              selected: !day.selected,
            }
          : day
      )
    );
  }

  async function createPoll(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessage();

    const cleanTitle = title.trim();
    const selectedDays = days.filter(
      (day) => day.selected
    );

    if (!cleanTitle) {
      setMessage(
        isHebrew
          ? "יש להזין שם לסקר"
          : "Enter a poll name"
      );
      return;
    }

    if (!startDate || !endDate) {
      setMessage(
        isHebrew
          ? "יש לבחור טווח תאריכים"
          : "Select a date range"
      );
      return;
    }

    if (selectedDays.length === 0) {
      setMessage(
        isHebrew
          ? "יש לבחור לפחות יום אחד"
          : "Select at least one day"
      );
      return;
    }

    setIsSaving(true);

    try {
      const {
        data: poll,
        error: pollError,
      } = await supabase
        .from("polls")
        .insert({
          title: cleanTitle,
          start_date: startDate,
          end_date: endDate,
          status: "open",
        })
        .select("id")
        .single();

      if (pollError || !poll) {
        console.error(
          "Create poll error:",
          pollError
        );

        setMessageType("error");
        setMessage(
          isHebrew
            ? `לא ניתן ליצור את הסקר${
                pollError?.message
                  ? `: ${pollError.message}`
                  : ""
              }`
            : `Unable to create the poll${
                pollError?.message
                  ? `: ${pollError.message}`
                  : ""
              }`
        );

        return;
      }

      const pollDays = selectedDays.map((day) => ({
        poll_id: poll.id,
        date_x: day.date,
        start_time: startTime || null,
        end_time: endTime || null,
      }));

      const { error: daysError } = await supabase
        .from("poll_days")
        .insert(pollDays);

      if (daysError) {
        console.error(
          "Create poll days error:",
          daysError
        );

        await supabase
          .from("polls")
          .delete()
          .eq("id", poll.id);

        setMessageType("error");
        setMessage(
          isHebrew
            ? `הסקר נוצר אך הימים לא נשמרו: ${daysError.message}`
            : `The poll was created, but its days were not saved: ${daysError.message}`
        );

        return;
      }

      setMessageType("success");
      setMessage(
        isHebrew
          ? "הסקר נפתח בהצלחה"
          : "The poll was created successfully"
      );

      setTimeout(() => {
        router.push("/polls");
      }, 900);
    } catch (error) {
      console.error(
        "Unexpected create poll error:",
        error
      );

      setMessageType("error");
      setMessage(
        isHebrew
          ? "אירעה שגיאה לא צפויה בעת יצירת הסקר"
          : "An unexpected error occurred while creating the poll"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main
      dir={direction}
      className="min-h-screen bg-[#06080d] px-5 py-10 text-white"
    >
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-300">
            TEAM SYNC
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {isHebrew
              ? "פתיחת סקר זמינות"
              : "Create an Availability Poll"}
          </h1>

          <p className="mt-2 text-white/50">
            {isHebrew
              ? "בחר את השבוע, הימים והשעות שיופיעו לחברי הקבוצה"
              : "Select the date range, days and times that will be shown to team members"}
          </p>
        </div>

        <form
          onSubmit={createPoll}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6"
        >
          <div>
            <label
              htmlFor="pollTitle"
              className="mb-2 block text-sm text-white/65"
            >
              {isHebrew ? "שם הסקר" : "Poll name"}
            </label>

            <input
              id="pollTitle"
              type="text"
              maxLength={120}
              value={title}
              disabled={isSaving}
              onChange={(event) => {
                setTitle(event.target.value);
                clearMessage();
              }}
              placeholder={
                isHebrew
                  ? "לדוגמה: זמינות לשבוע הקרוב"
                  : "For example: Availability for next week"
              }
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="pollStartDate"
                className="mb-2 block text-sm text-white/65"
              >
                {isHebrew ? "מתאריך" : "Start date"}
              </label>

              <input
                id="pollStartDate"
                type="date"
                value={startDate}
                disabled={isSaving}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setDays([]);
                  clearMessage();
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="pollEndDate"
                className="mb-2 block text-sm text-white/65"
              >
                {isHebrew ? "עד תאריך" : "End date"}
              </label>

              <input
                id="pollEndDate"
                type="date"
                value={endDate}
                disabled={isSaving}
                min={startDate || undefined}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setDays([]);
                  clearMessage();
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateDays}
            disabled={isSaving}
            className="h-12 w-full rounded-2xl border border-amber-300/30 bg-amber-300/10 font-bold text-amber-300 transition hover:border-amber-300/50 hover:bg-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isHebrew
              ? "הצג את ימי הסקר"
              : "Generate Poll Days"}
          </button>

          {days.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="font-bold">
                  {isHebrew
                    ? "בחר ימים"
                    : "Select Days"}
                </h2>

                <span className="text-sm text-white/45">
                  {isHebrew
                    ? `נבחרו ${selectedDaysCount} ימים`
                    : `${selectedDaysCount} days selected`}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    disabled={isSaving}
                    aria-pressed={day.selected}
                    onClick={() => toggleDay(day.date)}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition ${
                      direction === "rtl"
                        ? "text-right"
                        : "text-left"
                    } ${
                      day.selected
                        ? "border-amber-300/50 bg-amber-300/10"
                        : "border-white/10 bg-black/20 opacity-50"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span className="font-semibold">
                      {formatDate(day.date, locale)}
                    </span>

                    <span className="text-xl">
                      {day.selected ? "✓" : "○"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="pollStartTime"
                className="mb-2 block text-sm text-white/65"
              >
                {isHebrew
                  ? "שעה התחלתית"
                  : "Start time"}
              </label>

              <input
                id="pollStartTime"
                type="time"
                value={startTime}
                disabled={isSaving}
                onChange={(event) => {
                  setStartTime(event.target.value);
                  clearMessage();
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="pollEndTime"
                className="mb-2 block text-sm text-white/65"
              >
                {isHebrew
                  ? "שעה סופית"
                  : "End time"}
              </label>

              <input
                id="pollEndTime"
                type="time"
                value={endTime}
                disabled={isSaving}
                onChange={(event) => {
                  setEndTime(event.target.value);
                  clearMessage();
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {message && (
            <div
              role="alert"
              className={`rounded-2xl border px-4 py-3 text-sm ${
                messageType === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="h-14 w-full rounded-2xl bg-amber-400 font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? isHebrew
                ? "פותח את הסקר..."
                : "Creating poll..."
              : isHebrew
                ? "פתח סקר"
                : "Create Poll"}
          </button>
        </form>
      </section>
    </main>
  );
}