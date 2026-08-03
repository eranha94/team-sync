"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PollDay = {
  date: string;
  selected: boolean;
};

function formatHebrewDate(dateString: string) {
  return new Intl.DateTimeFormat("he-IL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(`${dateString}T12:00:00`));
}

function createDateRange(startDate: string, endDate: string): PollDay[] {
  if (!startDate || !endDate) return [];

  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  if (end < start) return [];

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

  const [title, setTitle] = useState("זמינות לשבוע הקרוב");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("22:00");
  const [endTime, setEndTime] = useState("00:00");
  const [days, setDays] = useState<PollDay[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const selectedDaysCount = useMemo(
    () => days.filter((day) => day.selected).length,
    [days]
  );

  function generateDays() {
    setMessage("");

    if (!startDate || !endDate) {
      setMessage("יש לבחור תאריך התחלה ותאריך סיום");
      return;
    }

    const generatedDays = createDateRange(startDate, endDate);

    if (generatedDays.length === 0) {
      setMessage("תאריך הסיום חייב להיות אחרי תאריך ההתחלה");
      return;
    }

    setDays(generatedDays);
  }

  function toggleDay(date: string) {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.date === date
          ? { ...day, selected: !day.selected }
          : day
      )
    );
  }

  async function createPoll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const selectedDays = days.filter((day) => day.selected);

    if (!title.trim()) {
      setMessage("יש להזין שם לסקר");
      return;
    }

    if (!startDate || !endDate) {
      setMessage("יש לבחור טווח תאריכים");
      return;
    }

    if (selectedDays.length === 0) {
      setMessage("יש לבחור לפחות יום אחד");
      return;
    }

    setIsSaving(true);

    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
        status: "open",
      })
      .select("id")
      .single();

    if (pollError || !poll) {
      setMessage(`לא ניתן ליצור את הסקר: ${pollError?.message ?? ""}`);
      setIsSaving(false);
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
      await supabase.from("polls").delete().eq("id", poll.id);

      setMessage(`הסקר נוצר אך הימים לא נשמרו: ${daysError.message}`);
      setIsSaving(false);
      return;
    }

    setMessage("הסקר נפתח בהצלחה");

    setTimeout(() => {
      router.push("/polls");
    }, 900);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#06080d] px-5 py-10 text-white"
    >
      <section className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-300">
            TEAM SYNC
          </p>

          <h1 className="mt-2 text-3xl font-black">
            פתיחת סקר זמינות
          </h1>

          <p className="mt-2 text-white/50">
            בחר את השבוע, הימים והשעות שיופיעו לחברי הקבוצה
          </p>
        </div>

        <form
          onSubmit={createPoll}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.05] p-6"
        >
          <div>
            <label className="mb-2 block text-sm text-white/65">
              שם הסקר
            </label>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none focus:border-amber-300/60"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/65">
                מתאריך
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(event) => {
                  setStartDate(event.target.value);
                  setDays([]);
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/65">
                עד תאריך
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(event) => {
                  setEndDate(event.target.value);
                  setDays([]);
                }}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={generateDays}
            className="h-12 w-full rounded-2xl border border-amber-300/30 bg-amber-300/10 font-bold text-amber-300"
          >
            הצג את ימי הסקר
          </button>

          {days.length > 0 && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-bold">בחר ימים</h2>

                <span className="text-sm text-white/45">
                  נבחרו {selectedDaysCount} ימים
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {days.map((day) => (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => toggleDay(day.date)}
                    className={`flex items-center justify-between rounded-2xl border p-4 text-right transition ${
                      day.selected
                        ? "border-amber-300/50 bg-amber-300/10"
                        : "border-white/10 bg-black/20 opacity-50"
                    }`}
                  >
                    <span className="font-semibold">
                      {formatHebrewDate(day.date)}
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
              <label className="mb-2 block text-sm text-white/65">
                שעה התחלתית
              </label>

              <input
                type="time"
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/65">
                שעה סופית
              </label>

              <input
                type="time"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 px-4 outline-none"
              />
            </div>
          </div>

          {message && (
            <div className="rounded-2xl bg-white/[0.07] px-4 py-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="h-14 w-full rounded-2xl bg-amber-400 font-black text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "פותח את הסקר..." : "פתח סקר"}
          </button>
        </form>
      </section>
    </main>
  );
}