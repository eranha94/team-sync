"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  KeyRound,
  Save,
} from "lucide-react";

import Card, {
  CardContent,
  CardHeader,
} from "@/components/ui/Card";
import GlowButton from "@/components/ui/GlowButton";
import useLanguage from "@/hooks/useLanguage";

type ChangePinResponse = {
  success: boolean;
  message?: string;
};

type ChangePinCardProps = {
  phone?: string | null;
};

export default function ChangePinCard({
  phone,
}: ChangePinCardProps) {
  const { isHebrew } = useLanguage();

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const [showCurrentPin, setShowCurrentPin] =
    useState(false);

  const [showNewPin, setShowNewPin] =
    useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!phone) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא נמצא מספר טלפון למשתמש"
          : "No phone number was found for this user"
      );
      return;
    }

    if (!/^\d{4,6}$/.test(currentPin)) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "יש להזין קוד נוכחי בן 4 עד 6 ספרות"
          : "Enter your current PIN using 4 to 6 digits"
      );
      return;
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "הקוד החדש חייב להכיל 4 עד 6 ספרות"
          : "The new PIN must contain 4 to 6 digits"
      );
      return;
    }

    if (newPin !== confirmPin) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "הקוד החדש ואימות הקוד אינם תואמים"
          : "The new PIN and PIN confirmation do not match"
      );
      return;
    }

    if (currentPin === newPin) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "הקוד החדש חייב להיות שונה מהקוד הנוכחי"
          : "The new PIN must be different from the current PIN"
      );
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        "/api/auth/change-pin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            currentPin,
            newPin,
          }),
        }
      );

      const data =
        (await response.json()) as ChangePinResponse;

      if (!response.ok || !data.success) {
        setMessageType("error");

        setMessage(
          isHebrew
            ? data.message ?? "שינוי הקוד נכשל"
            : getEnglishChangePinError(response.status)
        );

        return;
      }

      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");

      setMessageType("success");
      setMessage(
        isHebrew
          ? data.message ?? "הקוד האישי עודכן בהצלחה"
          : "Your personal PIN was updated successfully"
      );
    } catch (error) {
      console.error("Change PIN error:", error);

      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא ניתן לשנות את הקוד כרגע"
          : "Unable to change the PIN right now"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card variant="purple" glow padding="lg">
      <CardHeader
        title={
          isHebrew
            ? "שינוי קוד אישי"
            : "Change Personal PIN"
        }
        description={
          isHebrew
            ? "בחר קוד חדש בן 4 עד 6 ספרות"
            : "Choose a new PIN containing 4 to 6 digits"
        }
        icon={<KeyRound size={22} />}
      />

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <PinInput
            id="currentPin"
            label={
              isHebrew
                ? "קוד נוכחי"
                : "Current PIN"
            }
            value={currentPin}
            show={showCurrentPin}
            disabled={isSaving}
            isHebrew={isHebrew}
            onChange={setCurrentPin}
            onToggle={() =>
              setShowCurrentPin(
                (current) => !current
              )
            }
          />

          <PinInput
            id="newPin"
            label={
              isHebrew
                ? "קוד חדש"
                : "New PIN"
            }
            value={newPin}
            show={showNewPin}
            disabled={isSaving}
            isHebrew={isHebrew}
            onChange={setNewPin}
            onToggle={() =>
              setShowNewPin(
                (current) => !current
              )
            }
          />

          <PinInput
            id="confirmPin"
            label={
              isHebrew
                ? "אימות קוד חדש"
                : "Confirm New PIN"
            }
            value={confirmPin}
            show={showNewPin}
            disabled={isSaving}
            isHebrew={isHebrew}
            onChange={setConfirmPin}
            onToggle={() =>
              setShowNewPin(
                (current) => !current
              )
            }
          />

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

          <GlowButton
            type="submit"
            variant="primary"
            loading={isSaving}
            leftIcon={<Save size={18} />}
            fullWidth
          >
            {isHebrew
              ? "עדכון קוד אישי"
              : "Update Personal PIN"}
          </GlowButton>
        </form>
      </CardContent>
    </Card>
  );
}

function PinInput({
  id,
  label,
  value,
  show,
  disabled,
  isHebrew,
  onChange,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  disabled: boolean;
  isHebrew: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-bold text-white/60"
      >
        {label}
      </label>

      <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 transition focus-within:border-purple-400/50 focus-within:ring-4 focus-within:ring-purple-500/10">
        <input
          id={id}
          type={show ? "text" : "password"}
          inputMode="numeric"
          autoComplete={
            id === "currentPin"
              ? "current-password"
              : "new-password"
          }
          maxLength={6}
          value={value}
          disabled={disabled}
          onChange={(event) =>
            onChange(
              event.target.value.replace(/\D/g, "")
            )
          }
          className="h-13 w-full bg-transparent text-left text-lg tracking-[0.3em] text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
          dir="ltr"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            show
              ? isHebrew
                ? "הסתר קוד"
                : "Hide PIN"
              : isHebrew
                ? "הצג קוד"
                : "Show PIN"
          }
          title={
            show
              ? isHebrew
                ? "הסתר קוד"
                : "Hide PIN"
              : isHebrew
                ? "הצג קוד"
                : "Show PIN"
          }
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
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

function getEnglishChangePinError(status: number) {
  switch (status) {
    case 400:
      return "The entered PIN details are invalid";

    case 401:
    case 403:
      return "The current PIN is incorrect";

    case 404:
      return "The user was not found";

    default:
      return "Unable to change the PIN right now";
  }
}