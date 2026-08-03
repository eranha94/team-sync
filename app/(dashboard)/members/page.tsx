"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { useCurrentMember } from "@/hooks/useCurrentMember";

import PendingRequests from "@/components/members/PendingRequests";

type MemberRole = "admin" | "captain" | "player";

type ApprovalStatus =
  | "pending"
  | "approved"
  | "rejected";

type Member = {
  id: string;
  full_name: string;
  phone: string;
  role: MemberRole;
  is_active: boolean;
  approval_status: ApprovalStatus;
};

export default function MembersPage() {
  const { member: currentMember } = useCurrentMember();

  const [members, setMembers] = useState<Member[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] =
    useState(true);

  const isAdmin = currentMember?.role === "admin";

  const loadMembers = useCallback(async () => {
    setIsLoadingMembers(true);

    const { data, error } = await supabase
      .from("members")
      .select(
        `
          id,
          full_name,
          phone,
          role,
          is_active,
          approval_status
        `
      )
      .eq("approval_status", "approved")
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.error("Load members error:", error);
      setMessage("לא ניתן לטעון את חברי הקבוצה");
      setIsLoadingMembers(false);
      return;
    }

    setMembers((data ?? []) as Member[]);
    setIsLoadingMembers(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function addMember(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setMessage("");

    if (!isAdmin) {
      setMessage(
        "רק מנהל הקבוצה יכול להוסיף שחקנים"
      );
      return;
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanName) {
      setMessage("יש להזין שם");
      return;
    }

    if (!/^05\d{8}$/.test(cleanPhone)) {
      setMessage(
        "יש להזין מספר טלפון ישראלי תקין"
      );
      return;
    }

    const { error } = await supabase
      .from("members")
      .insert({
        full_name: cleanName,
        phone: cleanPhone,
        role: "player",
        is_active: true,
        approval_status: "approved",
      });

    if (error) {
      console.error("Add member error:", error);

      setMessage(
        error.code === "23505"
          ? "מספר הטלפון כבר קיים במערכת"
          : "לא ניתן להוסיף את המשתמש"
      );

      return;
    }

    setFullName("");
    setPhone("");
    setMessage("השחקן נוסף בהצלחה");

    await loadMembers();
  }

  async function toggleMember(member: Member) {
    if (!isAdmin) {
      setMessage(
        "רק מנהל הקבוצה יכול לעדכן שחקנים"
      );
      return;
    }

    if (member.role === "admin") {
      setMessage("לא ניתן להשבית מנהל");
      return;
    }

    const { error } = await supabase
      .from("members")
      .update({
        is_active: !member.is_active,
      })
      .eq("id", member.id);

    if (error) {
      console.error("Toggle member error:", error);
      setMessage("לא ניתן לעדכן את המשתמש");
      return;
    }

    await loadMembers();
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#06080d] px-5 py-10 text-white"
    >
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-300">
            NIGHTMARECAMP
          </p>

          <h1 className="mt-2 text-3xl font-black">
            ניהול חברי קבוצה
          </h1>

          <p className="mt-2 text-white/50">
            אישור בקשות, הוספה, צפייה והשבתה של
            חברי הקבוצה
          </p>
        </div>

        {isAdmin && (
          <div className="mb-10">
            <PendingRequests
              adminPhone={currentMember?.phone}
            />
          </div>
        )}

        {isAdmin && (
          <form
            onSubmit={addMember}
            className="mb-8 grid gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 md:grid-cols-[1fr_1fr_auto]"
          >
            <input
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setMessage("");
              }}
              placeholder="שם השחקן"
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60"
            />

            <input
              value={phone}
              onChange={(event) => {
                setPhone(
                  event.target.value.replace(/\D/g, "")
                );
                setMessage("");
              }}
              placeholder="0501234567"
              inputMode="numeric"
              maxLength={10}
              dir="ltr"
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-left outline-none transition focus:border-amber-300/60"
            />

            <button
              type="submit"
              className="h-12 rounded-2xl bg-amber-400 px-6 font-bold text-black transition hover:bg-amber-300"
            >
              הוסף שחקן
            </button>
          </form>
        )}

        {!isAdmin && (
          <div className="mb-8 rounded-3xl border border-purple-400/20 bg-purple-400/[0.08] p-5 text-sm text-purple-200">
            רשימת השחקנים זמינה לצפייה. פעולות ניהול
            זמינות למנהל בלבד.
          </div>
        )}

        {message && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm">
            {message}
          </div>
        )}

        {isLoadingMembers ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/40">
            טוען את חברי הקבוצה...
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <article
                key={member.id}
                className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">
                      {member.full_name}
                    </h2>

                    {member.role === "admin" && (
                      <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300">
                        מנהל
                      </span>
                    )}

                    {member.role === "captain" && (
                      <span className="rounded-full bg-purple-400/15 px-2.5 py-1 text-xs font-bold text-purple-300">
                        קפטן
                      </span>
                    )}

                    {member.role === "player" && (
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/45">
                        שחקן
                      </span>
                    )}
                  </div>

                  <p
                    className="mt-1 text-sm text-white/45"
                    dir="ltr"
                  >
                    {member.phone}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleMember(member)}
                  disabled={
                    !isAdmin || member.role === "admin"
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    member.is_active
                      ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {member.is_active
                    ? "פעיל"
                    : "לא פעיל"}
                </button>
              </article>
            ))}

            {members.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/40">
                עדיין אין חברי קבוצה מאושרים
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}