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

import {
  approvePendingMember,
  getPendingMembers,
  rejectPendingMember,
  type PendingMember,
} from "@/services/members/pendingMembersService";

type PendingRequestsProps = {
  adminPhone?: string | null;
};

export default function PendingRequests({
  adminPhone,
}: PendingRequestsProps) {
  const [adminPin, setAdminPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [members, setMembers] = useState<PendingMember[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<
    Record<string, "player" | "captain" | "admin">
  >({});

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const loadRequests = useCallback(async () => {
    if (!adminPhone) {
      setMessageType("error");
      setMessage("לא נמצא מספר הטלפון של המנהל");
      return;
    }

    if (!/^\d{4,6}$/.test(adminPin)) {
      setMessageType("error");
      setMessage("יש להזין את הקוד האישי של המנהל");
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
        )
      );
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "טעינת הבקשות נכשלה"
      );
    } finally {
      setIsLoading(false);
    }
  }, [adminPhone, adminPin]);

  async function approve(member: PendingMember) {
    if (!adminPhone) {
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
      setMessage(result.message ?? "המשתמש אושר בהצלחה");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "אישור המשתמש נכשל"
      );
    } finally {
      setProcessingId("");
    }
  }

  async function reject(member: PendingMember) {
    if (!adminPhone) {
      return;
    }

    const approved = window.confirm(
      `לדחות את בקשת ההצטרפות של ${member.full_name}?`
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
      setMessage(result.message ?? "הבקשה נדחתה");
    } catch (error) {
      setMessageType("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "דחיית הבקשה נכשלה"
      );
    } finally {
      setProcessingId("");
    }
  }

  return (
    <Section
      title={`בקשות הצטרפות${hasLoaded ? ` (${members.length})` : ""}`}
      subtitle="אישור או דחייה של שחקנים חדשים"
    >
      <Card variant="purple" glow padding="lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="adminPin"
              className="mb-2 block text-sm font-bold text-white/60"
            >
              קוד מנהל לאימות
            </label>

            <div className="flex items-center rounded-2xl border border-white/10 bg-black/25 px-4 focus-within:border-purple-400/50">
              <input
                id="adminPin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                maxLength={6}
                value={adminPin}
                onChange={(event) =>
                  setAdminPin(
                    event.target.value.replace(/\D/g, "")
                  )
                }
                className="h-12 w-full bg-transparent text-left tracking-[0.3em] outline-none"
                dir="ltr"
              />

              <button
                type="button"
                onClick={() => setShowPin((current) => !current)}
                className="text-white/40 transition hover:text-white"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <GlowButton
            type="button"
            onClick={loadRequests}
            loading={isLoading}
            leftIcon={<RefreshCw size={18} />}
          >
            טעינת בקשות
          </GlowButton>
        </div>
      </Card>

      {message && (
        <div
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
        <Loading text="טוען בקשות הצטרפות..." />
      ) : !hasLoaded ? (
        <EmptyState
          icon={<UserCheck size={32} />}
          title="יש לבצע אימות מנהל"
          description="הזן את הקוד האישי שלך כדי לטעון את בקשות ההצטרפות."
        />
      ) : members.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={32} />}
          title="אין בקשות ממתינות"
          description="כל בקשות ההצטרפות טופלו."
        />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {members.map((member) => {
            const isProcessing = processingId === member.id;

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
                      {new Intl.DateTimeFormat("he-IL", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(member.created_at))}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold text-white/45">
                    תפקיד לאחר האישור
                  </label>

                  <select
                    value={selectedRoles[member.id] ?? "player"}
                    disabled={isProcessing}
                    onChange={(event) =>
                      setSelectedRoles((current) => ({
                        ...current,
                        [member.id]: event.target.value as
                          | "player"
                          | "captain"
                          | "admin",
                      }))
                    }
                    className="h-11 w-full rounded-xl border border-white/10 bg-[#10131a] px-3 outline-none"
                  >
                    <option value="player">שחקן</option>
                    <option value="captain">קפטן</option>
                    <option value="admin">מנהל</option>
                  </select>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <GlowButton
                    type="button"
                    variant="success"
                    loading={isProcessing}
                    leftIcon={<Check size={18} />}
                    onClick={() => approve(member)}
                  >
                    אישור
                  </GlowButton>

                  <GlowButton
                    type="button"
                    variant="danger"
                    disabled={isProcessing}
                    leftIcon={<X size={18} />}
                    onClick={() => reject(member)}
                  >
                    דחייה
                  </GlowButton>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Section>
  );
}