"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Eye,
  EyeOff,
  LockKeyhole,
  XCircle,
} from "lucide-react";

import Card from "@/components/ui/Card";

type OpenPollCardProps = {
  pollId: string;
  title: string;
  startDate: string;
  endDate: string;
  responseRate: number;
  isAdmin?: boolean;
  adminPhone?: string | null;
  onPollClosed?: () => void | Promise<void>;
};

type ClosePollResponse = {
  success: boolean;
  message?: string;
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
  isAdmin = false,
  adminPhone,
  onPollClosed,
}: OpenPollCardProps) {
  const [showCloseForm, setShowCloseForm] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [isClosing, setIsClosing] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("error");

  const safeResponseRate = Math.min(
    Math.max(responseRate, 0),
    100
  );

  async function closePoll(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("error");

    if (!adminPhone) {
      setMessage("לא נמצא מספר הטלפון של המנהל");
      return;
    }

    if (!/^\d{4,6}$/.test(adminPin)) {
      setMessage("יש להזין קוד מנהל בן 4 עד 6 ספרות");
      return;
    }

    const approved = window.confirm(
      `לסגור את הסקר "${title}"?\n\nלאחר הסגירה הוא לא יוצג עוד כסקר פתוח.`
    );

    if (!approved) {
      return;
    }

    setIsClosing(true);

    try {
      const response = await fetch("/api/polls/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pollId,
          adminPhone,
          adminPin,
        }),
      });

      const data =
        (await response.json()) as ClosePollResponse;

      if (!response.ok || !data.success) {
        setMessageType("error");
        setMessage(
          data.message ?? "לא ניתן לסגור את הסקר"
        );
        return;
      }

      setMessageType("success");
      setMessage(
        data.message ?? "הסקר נסגר בהצלחה"
      );

      setAdminPin("");
      setShowCloseForm(false);

      await onPollClosed?.();
    } catch (error) {
      console.error("Close poll request error:", error);

      setMessageType("error");
      setMessage("אירעה שגיאה בעת סגירת הסקר");
    } finally {
      setIsClosing(false);
    }
  }

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

      {isAdmin && (
        <div className="mt-4 border-t border-white/[0.08] pt-4">
          {!showCloseForm ? (
            <button
              type="button"
              onClick={() => {
                setShowCloseForm(true);
                setMessage("");
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/[0.08] text-sm font-bold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/15"
            >
              <XCircle size={18} />
              סגירת הסקר
            </button>
          ) : (
            <form
              onSubmit={closePoll}
              className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-white">
                    סגירת הסקר
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    יש להזין את הקוד האישי של המנהל כדי
                    לאשר את הפעולה.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowCloseForm(false);
                    setAdminPin("");
                    setMessage("");
                  }}
                  disabled={isClosing}
                  className="text-white/35 transition hover:text-white disabled:opacity-40"
                  aria-label="ביטול"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <label
                htmlFor="closePollAdminPin"
                className="mb-2 mt-4 block text-xs font-bold text-white/55"
              >
                קוד מנהל
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-black/25 px-3 focus-within:border-red-400/40">
                <LockKeyhole
                  size={17}
                  className="shrink-0 text-white/35"
                />

                <input
                  id="closePollAdminPin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={6}
                  value={adminPin}
                  disabled={isClosing}
                  onChange={(event) => {
                    setAdminPin(
                      event.target.value.replace(/\D/g, "")
                    );
                    setMessage("");
                  }}
                  className="h-11 w-full bg-transparent px-3 text-left tracking-[0.3em] text-white outline-none disabled:opacity-50"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPin((current) => !current)
                  }
                  disabled={isClosing}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                  aria-label={
                    showPin ? "הסתר קוד" : "הצג קוד"
                  }
                >
                  {showPin ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={isClosing}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <XCircle size={18} />

                {isClosing
                  ? "סוגר את הסקר..."
                  : "אישור סגירת הסקר"}
              </button>
            </form>
          )}

          {message && (
            <div
              role="alert"
              className={`mt-3 rounded-xl border px-3 py-2 text-sm ${
                messageType === "success"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                  : "border-red-500/20 bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}