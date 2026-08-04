"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Phone,
} from "lucide-react";

import useLanguage from "@/hooks/useLanguage";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type LoginResponse = {
  success: boolean;
  message?: string;
  member?: {
    id: string;
    fullName: string;
    phone: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const {
    tr,
    direction,
    isHebrew,
  } = useLanguage();

  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setIsSuccess(false);

    const cleanPhone = phone.replace(/\D/g, "");
    const cleanPin = pin.replace(/\D/g, "");

    if (!/^05\d{8}$/.test(cleanPhone)) {
      setMessage(
        isHebrew
          ? "יש להזין מספר טלפון ישראלי תקין"
          : "Enter a valid Israeli phone number"
      );
      return;
    }

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setMessage(
        isHebrew
          ? "יש להזין קוד אישי בן 4 עד 6 ספרות"
          : "Enter a personal PIN containing 4 to 6 digits"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanPhone,
          pin: cleanPin,
        }),
      });

      const data =
        (await response.json()) as LoginResponse;

      if (!response.ok || !data.success || !data.member) {
        setMessage(
          isHebrew
            ? data.message ??
                "לא ניתן לבצע כניסה למערכת"
            : getEnglishLoginError(response.status)
        );
        return;
      }

      localStorage.setItem(
        "teamSyncMember",
        JSON.stringify(data.member)
      );

      setIsSuccess(true);

      setMessage(
        isHebrew
          ? `ברוך הבא ${data.member.fullName}`
          : `Welcome, ${data.member.fullName}`
      );

      setTimeout(() => {
        router.replace("/");
      }, 600);
    } catch (error) {
      console.error("Login request error:", error);

      setMessage(
        isHebrew
          ? "אירעה שגיאה לא צפויה. נסה שוב"
          : "An unexpected error occurred. Please try again"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main
      dir={direction}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06080d] px-5 py-10 text-white"
    >
      <div className="pointer-events-none absolute right-[-120px] top-[-120px] h-[340px] w-[340px] rounded-full bg-purple-600/20 blur-[100px]" />

      <div className="pointer-events-none absolute bottom-[-140px] left-[-100px] h-[360px] w-[360px] rounded-full bg-amber-400/10 blur-[110px]" />

      <div className="absolute left-5 top-5 z-20 sm:left-8 sm:top-8">
        <LanguageSwitcher />
      </div>

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
            <div className="absolute inset-2 rounded-full bg-purple-500/30 blur-3xl" />

            <div className="absolute inset-0 animate-pulse rounded-full border border-purple-400/20 shadow-[0_0_60px_rgba(168,85,247,0.45)]" />

            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-500/20 via-transparent to-amber-400/10 blur-xl" />

            <Image
              src="/branding/nightmare-logo.png"
              alt="NightmareCamp"
              width={280}
              height={280}
              priority
              className="relative z-10 h-full w-full object-contain drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] transition duration-500 hover:scale-110 hover:drop-shadow-[0_0_46px_rgba(192,132,252,1)]"
            />

            <div className="pointer-events-none absolute -bottom-3 h-4 w-24 rounded-full bg-purple-500/35 blur-xl" />
          </div>

          <p className="mb-2 text-sm font-black tracking-[0.35em] text-purple-300 drop-shadow-[0_0_14px_rgba(168,85,247,0.65)]">
            NIGHTMARECAMP
          </p>

          <h1 className="text-3xl font-black tracking-tight">
            {tr("login.secureLogin")}
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/55">
            {tr("login.subtitle")}
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {tr("login.loginTitle")}
            </h2>

            <p className="mt-1 text-sm text-white/50">
              {tr("login.membersOnly")}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                {tr("login.phone")}
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
                    setMessage("");
                    setIsSuccess(false);
                  }}
                  placeholder="0501234567"
                  className="h-14 w-full bg-transparent px-3 text-left text-lg tracking-wider outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="pin"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                {tr("login.pin")}
              </label>

              <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-purple-300/60 focus-within:ring-4 focus-within:ring-purple-300/10">
                <LockKeyhole
                  size={18}
                  className="shrink-0 text-white/35"
                />

                <input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  value={pin}
                  disabled={isLoading}
                  onChange={(event) => {
                    setPin(
                      event.target.value.replace(/\D/g, "")
                    );
                    setMessage("");
                    setIsSuccess(false);
                  }}
                  placeholder="••••"
                  className="h-14 w-full bg-transparent px-3 text-left text-lg tracking-[0.35em] outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPin((current) => !current)
                  }
                  disabled={isLoading}
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
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  {showPin ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs text-white/30">
                {tr("login.pinHint")}
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-2xl bg-gradient-to-l from-purple-500 to-purple-700 font-bold text-white shadow-[0_12px_35px_rgba(126,34,206,0.25)] transition hover:-translate-y-0.5 hover:from-purple-400 hover:to-purple-600 hover:shadow-[0_16px_45px_rgba(126,34,206,0.35)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading
                ? tr("login.loggingIn")
                : tr("login.loginButton")}
            </button>

            {message && (
              <p
                role="alert"
                className={`rounded-xl px-3 py-3 text-center text-sm ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-red-500/10 text-red-300"
                }`}
              >
                {message}
              </p>
            )}
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />

            <span className="text-xs text-white/30">
              {tr("login.notMember")}
            </span>

            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Link
            href="/register"
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-500/10 text-sm font-bold text-purple-200 transition hover:border-purple-300/40 hover:bg-purple-500/20 hover:text-white"
          >
            {tr("login.registerRequest")}
          </Link>

          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-white/35">
            <span>🔒</span>

            <span>
              {tr("login.secureNote")}
            </span>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-white/25">
          NightmareCamp © 2026
        </p>
      </section>
    </main>
  );
}

function getEnglishLoginError(status: number) {
  switch (status) {
    case 400:
      return "The phone number or PIN is invalid";

    case 401:
      return "The phone number or personal PIN is incorrect";

    case 403:
      return "Your account is inactive or has not been approved";

    case 404:
      return "The user was not found";

    default:
      return "Unable to sign in at this time";
  }
}