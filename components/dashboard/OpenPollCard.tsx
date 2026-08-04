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
import useLanguage from "@/hooks/useLanguage";

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
  const { direction, isHebrew } = useLanguage();

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

  const dateLocale = isHebrew ? "he-IL" : "en-US";

  async function closePoll(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("error");

    if (!adminPhone) {
      setMessage(
        isHebrew
          ? "לא נמצא מספר הטלפון של המנהל"
          : "The administrator phone number was not found"
      );
      return;
    }

    if (!/^\d{4,6}$/.test(adminPin)) {
      setMessage(
        isHebrew
          ? "יש להזין קוד מנהל בן 4 עד 6 ספרות"
          : "Enter an administrator PIN containing 4 to 6 digits"
      );
      return;
    }

    const approved = window.confirm(
      isHebrew
        ? `לסגור את הסקר "${title}"?\n\nלאחר הסגירה הוא לא יוצג עוד כסקר פתוח.`
        : `Close the poll "${title}"?\n\nAfter closing, it will no longer appear as an open poll.`
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
          isHebrew
            ? data.message ?? "לא ניתן לסגור את הסקר"
            : getEnglishClosePollError(response.status)
        );

        return;
      }

      setMessageType("success");

      setMessage(
        isHebrew
          ? data.message ?? "הסקר נסגר בהצלחה"
          : "The poll was closed successfully"
      );

      setAdminPin("");
      setShowCloseForm(false);

      await onPollClosed?.();
    } catch (error) {
      console.error("Close poll request error:", error);

      setMessageType("error");

      setMessage(
        isHebrew
          ? "אירעה שגיאה בעת סגירת הסקר"
          : "An error occurred while closing the poll"
      );
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
      <div
        dir={direction}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p className="text-sm font-bold text-purple-300">
            {isHebrew ? "הסקר הפתוח" : "Open poll"}
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            {title}
          </h2>

          <p className="mt-2 text-sm text-white/40">
            {formatDate(startDate, dateLocale)}
            {isHebrew ? " עד " : " to "}
            {formatDate(endDate, dateLocale)}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-300">
          <CalendarDays size={23} />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/45">
            {isHebrew
              ? "התקדמות המענה"
              : "Response progress"}
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
        {isHebrew
          ? "מעבר למילוי הסקר"
          : "Open poll"}
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

              {isHebrew
                ? "סגירת הסקר"
                : "Close poll"}
            </button>
          ) : (
            <form
              onSubmit={closePoll}
              dir={direction}
              className="rounded-2xl border border-red-400/20 bg-red-500/[0.06] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-white">
                    {isHebrew
                      ? "סגירת הסקר"
                      : "Close poll"}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {isHebrew
                      ? "יש להזין את הקוד האישי של המנהל כדי לאשר את הפעולה."
                      : "Enter the administrator PIN to confirm this action."}
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
                  aria-label={
                    isHebrew ? "ביטול" : "Cancel"
                  }
                  title={
                    isHebrew ? "ביטול" : "Cancel"
                  }
                >
                  <XCircle size={20} />
                </button>
              </div>

              <label
                htmlFor="closePollAdminPin"
                className="mb-2 mt-4 block text-xs font-bold text-white/55"
              >
                {isHebrew
                  ? "קוד מנהל"
                  : "Administrator PIN"}
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
                    showPin
                      ? isHebrew
                        ? "הסתר קוד"
                        : "Hide PIN"
                      : isHebrew
                        ? "הצג קוד"
                        : "Show PIN"
                  }
                  title={
                    showPin
                      ? isHebrew
                        ? "הסתר קוד"
                        : "Hide PIN"
                      : isHebrew
                        ? "הצג קוד"
                        : "Show PIN"
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
                  ? isHebrew
                    ? "סוגר את הסקר..."
                    : "Closing poll..."
                  : isHebrew
                    ? "אישור סגירת הסקר"
                    : "Confirm poll closure"}
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

function getEnglishClosePollError(status: number) {
  switch (status) {
    case 400:
      return "The poll is not open or has already been closed";

    case 403:
      return "Administrator verification failed";

    case 404:
      return "The poll was not found";

    default:
      return "Unable to close the poll at this time";
  }
}