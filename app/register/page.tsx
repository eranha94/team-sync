"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
  UserRound,
} from "lucide-react";

type PlayerPosition =
  | "goalkeeper"
  | "center_back"
  | "full_back"
  | "defensive_midfielder"
  | "midfielder"
  | "winger"
  | "striker";

type PositionOption = {
  value: PlayerPosition;
  label: string;
  icon: string;
};

type RegisterResponse = {
  success: boolean;
  message?: string;
};

const POSITION_OPTIONS: PositionOption[] = [
  {
    value: "goalkeeper",
    label: "שוער",
    icon: "🥅",
  },
  {
    value: "center_back",
    label: "בלם",
    icon: "🛡️",
  },
  {
    value: "full_back",
    label: "מגן",
    icon: "🏃",
  },
  {
    value: "defensive_midfielder",
    label: "קשר אחורי",
    icon: "⚙️",
  },
  {
    value: "midfielder",
    label: "קשר",
    icon: "🎮",
  },
  {
    value: "winger",
    label: "כנף",
    icon: "⚡",
  },
  {
    value: "striker",
    label: "חלוץ",
    icon: "🎯",
  },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [positions, setPositions] = useState<PlayerPosition[]>([]);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("error");

  function clearMessage() {
    setMessage("");
  }

  function togglePosition(position: PlayerPosition) {
    setPositions((currentPositions) => {
      if (currentPositions.includes(position)) {
        return currentPositions.filter(
          (currentPosition) => currentPosition !== position
        );
      }

      return [...currentPositions, position];
    });

    clearMessage();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setMessageType("error");

    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanPin = pin.replace(/\D/g, "");
    const cleanConfirmPin = confirmPin.replace(/\D/g, "");

    if (cleanName.length < 2) {
      setMessage("יש להזין שם מלא");
      return;
    }

    if (cleanName.length > 80) {
      setMessage("השם שהוזן ארוך מדי");
      return;
    }

    if (!/^05\d{8}$/.test(cleanPhone)) {
      setMessage("יש להזין מספר טלפון ישראלי תקין");
      return;
    }

    if (positions.length === 0) {
      setMessage("יש לבחור לפחות עמדה אחת");
      return;
    }

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setMessage("הקוד האישי חייב להכיל 4 עד 6 ספרות");
      return;
    }

    if (cleanPin !== cleanConfirmPin) {
      setMessage("הקוד האישי ואימות הקוד אינם תואמים");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: cleanName,
          phone: cleanPhone,
          positions,
          pin: cleanPin,
        }),
      });

      const data =
        (await response.json()) as RegisterResponse;

      if (!response.ok || !data.success) {
        setMessageType("error");
        setMessage(
          data.message ??
            "לא ניתן לשלוח את בקשת ההצטרפות"
        );
        return;
      }

      setIsSubmitted(true);
      setMessageType("success");
      setMessage(
        data.message ??
          "בקשת ההצטרפות נשלחה וממתינה לאישור מנהל הקבוצה"
      );

      setFullName("");
      setPhone("");
      setPositions([]);
      setPin("");
      setConfirmPin("");
    } catch (error) {
      console.error("Registration error:", error);

      setMessageType("error");
      setMessage("אירעה שגיאה לא צפויה. נסה שוב");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <main
        dir="rtl"
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080d] px-5 py-10 text-white"
      >
        <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-600/20 blur-[100px]" />

        <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-[360px] w-[360px] rounded-full bg-amber-400/10 blur-[110px]" />

        <section className="relative z-10 w-full max-w-md">
          <div className="rounded-[30px] border border-emerald-400/20 bg-white/[0.06] p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-300">
              <CheckCircle2 size={42} />
            </div>

            <h1 className="mt-6 text-2xl font-black">
              הבקשה נשלחה
            </h1>

            <p className="mt-3 text-sm leading-7 text-white/55">
              הבקשה שלך ממתינה לאישור מנהל הקבוצה.
              לאחר האישור יהיה ניתן להיכנס באמצעות מספר
              הטלפון והקוד האישי שבחרת.
            </p>

            {message && (
              <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {message}
              </div>
            )}

            <Link
              href="/login"
              className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-purple-500 to-purple-700 font-bold text-white transition hover:from-purple-400 hover:to-purple-600"
            >
              מעבר לעמוד הכניסה
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080d] px-5 py-10 text-white"
    >
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-600/20 blur-[100px]" />

      <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-[360px] w-[360px] rounded-full bg-amber-400/10 blur-[110px]" />

      <section className="relative z-10 w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-purple-300/30 bg-gradient-to-br from-purple-500 to-purple-800 text-4xl shadow-[0_0_50px_rgba(168,85,247,0.28)]">
            ⚽
          </div>

          <p className="mb-2 text-sm font-semibold tracking-[0.25em] text-purple-300">
            NIGHTMARECAMP
          </p>

          <h1 className="text-3xl font-black tracking-tight">
            בקשת הצטרפות
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            מלא את הפרטים, בחר עמדות וקוד אישי. הכניסה
            תתאפשר לאחר אישור מנהל הקבוצה.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                שם מלא
              </label>

              <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-purple-300/60 focus-within:ring-4 focus-within:ring-purple-300/10">
                <UserRound
                  size={18}
                  className="shrink-0 text-white/35"
                />

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  maxLength={80}
                  value={fullName}
                  disabled={isLoading}
                  onChange={(event) => {
                    setFullName(event.target.value);
                    clearMessage();
                  }}
                  placeholder="שם פרטי ומשפחה"
                  className="h-14 w-full bg-transparent px-3 text-base outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                מספר טלפון
              </label>

              <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-purple-300/60 focus-within:ring-4 focus-within:ring-purple-300/10">
                <Phone
                  size={18}
                  className="shrink-0 text-white/35"
                />

                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  value={phone}
                  disabled={isLoading}
                  onChange={(event) => {
                    setPhone(
                      event.target.value.replace(/\D/g, "")
                    );
                    clearMessage();
                  }}
                  placeholder="0501234567"
                  className="h-14 w-full bg-transparent px-3 text-left text-lg tracking-wider outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white/70">
                    עמדות משחק
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    ניתן לבחור יותר מעמדה אחת
                  </p>
                </div>

                {positions.length > 0 && (
                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-200">
                    נבחרו {positions.length}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {POSITION_OPTIONS.map((position) => {
                  const isSelected = positions.includes(
                    position.value
                  );

                  return (
                    <button
                      key={position.value}
                      type="button"
                      disabled={isLoading}
                      aria-pressed={isSelected}
                      onClick={() =>
                        togglePosition(position.value)
                      }
                      className={`relative flex min-h-16 items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3 text-right transition ${
                        isSelected
                          ? "border-purple-400/60 bg-purple-500/20 text-white shadow-[0_0_24px_rgba(168,85,247,0.16)]"
                          : "border-white/10 bg-black/20 text-white/50 hover:border-purple-400/30 hover:bg-purple-500/10 hover:text-white"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span className="text-xl">
                        {position.icon}
                      </span>

                      <span className="text-sm font-bold">
                        {position.label}
                      </span>

                      {isSelected && (
                        <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-purple-400 text-black">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {positions.length === 0 && (
                <p className="mt-3 text-xs text-white/30">
                  יש לבחור לפחות עמדה אחת
                </p>
              )}
            </div>

            <PinField
              id="pin"
              label="קוד אישי"
              value={pin}
              show={showPin}
              disabled={isLoading}
              placeholder="בחר 4–6 ספרות"
              onChange={(value) => {
                setPin(value);
                clearMessage();
              }}
              onToggle={() =>
                setShowPin((current) => !current)
              }
            />

            <PinField
              id="confirmPin"
              label="אימות קוד אישי"
              value={confirmPin}
              show={showConfirmPin}
              disabled={isLoading}
              placeholder="הקלד שוב את הקוד"
              onChange={(value) => {
                setConfirmPin(value);
                clearMessage();
              }}
              onToggle={() =>
                setShowConfirmPin((current) => !current)
              }
            />

            {message && (
              <div
                role="alert"
                className={`rounded-2xl border px-4 py-3 text-center text-sm ${
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
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-gradient-to-l from-purple-500 to-purple-700 font-bold text-white shadow-[0_12px_35px_rgba(126,34,206,0.25)] transition hover:-translate-y-0.5 hover:from-purple-400 hover:to-purple-600 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? "שולח בקשה..."
                : "שליחת בקשת הצטרפות"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3 text-xs leading-6 text-amber-200/70">
            ההרשמה אינה מאפשרת כניסה אוטומטית. מנהל
            הקבוצה צריך לאשר את הבקשה תחילה.
          </div>

          <div className="mt-6 text-center text-sm text-white/40">
            כבר רשום?{" "}
            <Link
              href="/login"
              className="font-bold text-purple-300 transition hover:text-purple-200"
            >
              מעבר לכניסה
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          NightmareCamp © 2026
        </p>
      </section>
    </main>
  );
}

function PinField({
  id,
  label,
  value,
  show,
  disabled,
  placeholder,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-white/70"
      >
        {label}
      </label>

      <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-purple-300/60 focus-within:ring-4 focus-within:ring-purple-300/10">
        <LockKeyhole
          size={18}
          className="shrink-0 text-white/35"
        />

        <input
          id={id}
          type={show ? "text" : "password"}
          inputMode="numeric"
          maxLength={6}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value.replace(/\D/g, "")
            )
          }
          placeholder={placeholder}
          className="h-14 w-full bg-transparent px-3 text-left text-lg tracking-[0.25em] outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          dir="ltr"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={show ? "הסתר קוד" : "הצג קוד"}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
        >
          {show ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}