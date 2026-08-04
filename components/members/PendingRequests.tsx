"use client";

import { useCallback, useState } from "react";
import {
  Check,
  Clock3,
  Eye,
  EyeOff,
  Phone,
  RefreshCw,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";

import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import GlowButton from "@/components/ui/GlowButton";
import Loading from "@/components/ui/Loading";
import Section from "@/components/ui/Section";

import useLanguage from "@/hooks/useLanguage";

import {
  approvePendingMember,
  getPendingMembers,
  rejectPendingMember,
  type PendingMember,
} from "@/services/members/pendingMembersService";

type PendingRequestsProps = {
  adminPhone?: string | null;
};

type MemberRole = "player" | "captain" | "admin";

export default function PendingRequests({
  adminPhone,
}: PendingRequestsProps) {
  const { direction, isHebrew } = useLanguage();

  const [adminPin, setAdminPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [members, setMembers] = useState<PendingMember[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, MemberRole>
  >({});

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const locale = isHebrew ? "he-IL" : "en-US";

  const loadRequests = useCallback(async () => {
    if (!adminPhone) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא נמצא מספר הטלפון של המנהל"
          : "The administrator phone number was not found"
      );
      return;
    }

    if (!/^\d{4,6}$/.test(adminPin)) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "יש להזין את הקוד האישי של המנהל"
          : "Enter the administrator PIN"
      );
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const data = await getPendingMembers({
        adminPhone,
        adminPin,
      });

      setMembers(data);
      setHasLoaded(true);

      setSelectedRoles(
        Object.fromEntries(
          data.map((member) => [member.id, "player"])
        ) as Record<string, MemberRole>
      );
    } catch (error) {
      console.error("Load pending requests error:", error);

      setMessageType("error");
      setMessage(
        isHebrew
          ? error instanceof Error
            ? error.message
            : "טעינת הבקשות נכשלה"
          : "Unable to load pending join requests"
      );
    } finally {
      setIsLoading(false);
    }
  }, [adminPhone, adminPin, isHebrew]);

  async function approve(member: PendingMember) {
    if (!adminPhone) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא נמצא מספר הטלפון של המנהל"
          : "The administrator phone number was not found"
      );
      return;
    }

    setProcessingId(member.id);
    setMessage("");

    try {
      const result = await approvePendingMember({
        memberId: member.id,
        role: selectedRoles[member.id] ?? "player",
        adminPhone,
        adminPin,
      });

      setMembers((current) =>
        current.filter((item) => item.id !== member.id)
      );

      setMessageType("success");
      setMessage(
        isHebrew
          ? result.message ?? "המשתמש אושר בהצלחה"
          : `${member.full_name} was approved successfully`
      );
    } catch (error) {
      console.error("Approve pending member error:", error);

      setMessageType("error");
      setMessage(
        isHebrew
          ? error instanceof Error
            ? error.message
            : "אישור המשתמש נכשל"
          : "Unable to approve the join request"
      );
    } finally {
      setProcessingId("");
    }
  }

  async function reject(member: PendingMember) {
    if (!adminPhone) {
      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא נמצא מספר הטלפון של המנהל"
          : "The administrator phone number was not found"
      );
      return;
    }

    const approved = window.confirm(
      isHebrew
        ? `לדחות את בקשת ההצטרפות של ${member.full_name}?`
        : `Reject ${member.full_name}'s join request?`
    );

    if (!approved) {
      return;
    }

    setProcessingId(member.id);
    setMessage("");

    try {
      const result = await rejectPendingMember({
        memberId: member.id,
        adminPhone,
        adminPin,
      });

      setMembers((current) =>
        current.filter((item) => item.id !== member.id)
      );

      setMessageType("success");
      setMessage(
        isHebrew
          ? result.message ?? "הבקשה נדחתה"
          : `${member.full_name}'s request was rejected`
      );
    } catch (error) {
      console.error("Reject pending member error:", error);

      setMessageType("error");
      setMessage(
        isHebrew
          ? error instanceof Error
            ? error.message
            : "דחיית הבקשה נכשלה"
          : "Unable to reject the join request"
      );
    } finally {
      setProcessingId("");
    }
  }

  return (
    <div dir={direction}>
      <Section
        title={
          isHebrew
            ? `בקשות הצטרפות${
                hasLoaded ? ` (${members.length})` : ""
              }`
            : `Join Requests${
                hasLoaded ? ` (${members.length})` : ""
              }`
        }
        subtitle={
          isHebrew
            ? "אישור או דחייה של שחקנים חדשים"
            : "Approve or reject new team members"
        }
      >
        <Card variant="purple" glow padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="adminPin"
                className="mb-2 block text-sm font-bold text-white/60"
              >
                {isHebrew
                  ? "קוד מנהל לאימות"
                  : "Administrator PIN"}
              </label>

              <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 focus-within:border-purple-400/50">
                <input
                  id="adminPin"
                  type={showPin ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="current-password"
                  maxLength={6}
                  value={adminPin}
                  disabled={isLoading || Boolean(processingId)}
                  onChange={(event) => {
                    setAdminPin(
                      event.target.value.replace(/\D/g, "")
                    );
                    setMessage("");
                  }}
                  placeholder="••••"
                  className="h-12 w-full bg-transparent text-left tracking-[0.3em] outline-none placeholder:text-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPin((current) => !current)
                  }
                  disabled={isLoading || Boolean(processingId)}
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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                >
                  {showPin ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <GlowButton
              type="button"
              onClick={loadRequests}
              loading={isLoading}
              disabled={Boolean(processingId)}
              leftIcon={<RefreshCw size={18} />}
            >
              {isHebrew
                ? "טעינת בקשות"
                : "Load Requests"}
            </GlowButton>
          </div>
        </Card>

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

        {isLoading ? (
          <Loading
            text={
              isHebrew
                ? "טוען בקשות הצטרפות..."
                : "Loading join requests..."
            }
          />
        ) : !hasLoaded ? (
          <EmptyState
            icon={<UserCheck size={32} />}
            title={
              isHebrew
                ? "יש לבצע אימות מנהל"
                : "Administrator verification required"
            }
            description={
              isHebrew
                ? "הזן את הקוד האישי שלך כדי לטעון את בקשות ההצטרפות."
                : "Enter your personal administrator PIN to load the join requests."
            }
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<UserCheck size={32} />}
            title={
              isHebrew
                ? "אין בקשות ממתינות"
                : "No pending requests"
            }
            description={
              isHebrew
                ? "כל בקשות ההצטרפות טופלו."
                : "All join requests have been handled."
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {members.map((member) => {
              const isProcessing =
                processingId === member.id;

              return (
                <Card
                  key={member.id}
                  interactive
                  padding="lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
                      <UserRound size={26} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black">
                        {member.full_name}
                      </h3>

                      <p
                        className="mt-2 flex items-center gap-2 text-sm text-white/50"
                        dir="ltr"
                      >
                        <Phone size={15} />
                        {member.phone}
                      </p>

                      <p className="mt-2 flex items-center gap-2 text-xs text-white/35">
                        <Clock3 size={14} />

                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(
                          new Date(member.created_at)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor={`role-${member.id}`}
                      className="mb-2 block text-xs font-bold text-white/45"
                    >
                      {isHebrew
                        ? "תפקיד לאחר האישור"
                        : "Role after approval"}
                    </label>

                    <select
                      id={`role-${member.id}`}
                      value={
                        selectedRoles[member.id] ??
                        "player"
                      }
                      disabled={isProcessing}
                      onChange={(event) =>
                        setSelectedRoles((current) => ({
                          ...current,
                          [member.id]:
                            event.target.value as MemberRole,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-white/10 bg-[#10131a] px-3 outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="player">
                        {isHebrew ? "שחקן" : "Player"}
                      </option>

                      <option value="captain">
                        {isHebrew ? "קפטן" : "Captain"}
                      </option>

                      <option value="admin">
                        {isHebrew ? "מנהל" : "Admin"}
                      </option>
                    </select>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <GlowButton
                      type="button"
                      variant="success"
                      loading={isProcessing}
                      disabled={
                        Boolean(processingId) &&
                        !isProcessing
                      }
                      leftIcon={<Check size={18} />}
                      onClick={() => approve(member)}
                    >
                      {isHebrew ? "אישור" : "Approve"}
                    </GlowButton>

                    <GlowButton
                      type="button"
                      variant="danger"
                      disabled={Boolean(processingId)}
                      leftIcon={<X size={18} />}
                      onClick={() => reject(member)}
                    >
                      {isHebrew ? "דחייה" : "Reject"}
                    </GlowButton>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </div>
  );
}