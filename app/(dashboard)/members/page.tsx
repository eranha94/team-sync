"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";
import { useCurrentMember } from "@/hooks/useCurrentMember";
import useLanguage from "@/hooks/useLanguage";

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
  const { member: currentMember } =
    useCurrentMember();

  const {
    direction,
    isHebrew,
  } = useLanguage();

  const [members, setMembers] = useState<Member[]>([]);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("error");

  const [isLoadingMembers, setIsLoadingMembers] =
    useState(true);

  const [isAddingMember, setIsAddingMember] =
    useState(false);

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

      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא ניתן לטעון את חברי הקבוצה"
          : "Unable to load team members"
      );

      setIsLoadingMembers(false);
      return;
    }

    setMembers((data ?? []) as Member[]);
    setIsLoadingMembers(false);
  }, [isHebrew]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  function clearMessage() {
    setMessage("");
    setMessageType("error");
  }

  async function addMember(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    clearMessage();

    if (!isAdmin) {
      setMessage(
        isHebrew
          ? "רק מנהל הקבוצה יכול להוסיף שחקנים"
          : "Only a team administrator can add players"
      );
      return;
    }

    const cleanName = fullName.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanName.length < 2) {
      setMessage(
        isHebrew
          ? "יש להזין שם מלא"
          : "Please enter the player's full name"
      );
      return;
    }

    if (cleanName.length > 80) {
      setMessage(
        isHebrew
          ? "השם שהוזן ארוך מדי"
          : "The entered name is too long"
      );
      return;
    }

    if (
      cleanPhone.length < 8 ||
      cleanPhone.length > 15
    ) {
      setMessage(
        isHebrew
          ? "יש להזין מספר טלפון תקין"
          : "Please enter a valid phone number"
      );
      return;
    }

    setIsAddingMember(true);

    try {
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

        setMessageType("error");
        setMessage(
          error.code === "23505"
            ? isHebrew
              ? "מספר הטלפון כבר קיים במערכת"
              : "This phone number already exists"
            : isHebrew
              ? "לא ניתן להוסיף את המשתמש"
              : "Unable to add the player"
        );

        return;
      }

      setFullName("");
      setPhone("");

      setMessageType("success");
      setMessage(
        isHebrew
          ? "השחקן נוסף בהצלחה"
          : "The player was added successfully"
      );

      await loadMembers();
    } catch (error) {
      console.error(
        "Unexpected add member error:",
        error
      );

      setMessageType("error");
      setMessage(
        isHebrew
          ? "אירעה שגיאה לא צפויה בעת הוספת השחקן"
          : "An unexpected error occurred while adding the player"
      );
    } finally {
      setIsAddingMember(false);
    }
  }

  async function toggleMember(member: Member) {
    clearMessage();

    if (!isAdmin) {
      setMessage(
        isHebrew
          ? "רק מנהל הקבוצה יכול לעדכן שחקנים"
          : "Only a team administrator can update players"
      );
      return;
    }

    if (member.role === "admin") {
      setMessage(
        isHebrew
          ? "לא ניתן להשבית מנהל"
          : "An administrator cannot be disabled"
      );
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

      setMessageType("error");
      setMessage(
        isHebrew
          ? "לא ניתן לעדכן את המשתמש"
          : "Unable to update the player"
      );
      return;
    }

    setMessageType("success");
    setMessage(
      member.is_active
        ? isHebrew
          ? `${member.full_name} הושבת בהצלחה`
          : `${member.full_name} was disabled successfully`
        : isHebrew
          ? `${member.full_name} הופעל בהצלחה`
          : `${member.full_name} was activated successfully`
    );

    await loadMembers();
  }

  function getRoleLabel(role: MemberRole) {
    switch (role) {
      case "admin":
        return isHebrew ? "מנהל" : "Admin";

      case "captain":
        return isHebrew ? "קפטן" : "Captain";

      default:
        return isHebrew ? "שחקן" : "Player";
    }
  }

  return (
    <main
      dir={direction}
      className="min-h-screen bg-[#06080d] px-5 py-10 text-white"
    >
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold tracking-[0.2em] text-amber-300">
            NIGHTMARECAMP
          </p>

          <h1 className="mt-2 text-3xl font-black">
            {isHebrew
              ? "ניהול חברי קבוצה"
              : "Team Member Management"}
          </h1>

          <p className="mt-2 text-white/50">
            {isHebrew
              ? "אישור בקשות, הוספה, צפייה והשבתה של חברי הקבוצה"
              : "Approve requests, add players, view members and manage their access"}
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
              type="text"
              autoComplete="name"
              maxLength={80}
              value={fullName}
              disabled={isAddingMember}
              onChange={(event) => {
                setFullName(event.target.value);
                clearMessage();
              }}
              placeholder={
                isHebrew
                  ? "שם השחקן"
                  : "Player name"
              }
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <input
              type="tel"
              value={phone}
              disabled={isAddingMember}
              onChange={(event) => {
                setPhone(
                  event.target.value.replace(/\D/g, "")
                );
                clearMessage();
              }}
              placeholder={
                isHebrew
                  ? "מספר טלפון"
                  : "Phone number"
              }
              inputMode="tel"
              autoComplete="tel"
              maxLength={15}
              dir="ltr"
              className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-left outline-none transition focus:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
            />

            <button
              type="submit"
              disabled={isAddingMember}
              className="h-12 rounded-2xl bg-amber-400 px-6 font-bold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingMember
                ? isHebrew
                  ? "מוסיף..."
                  : "Adding..."
                : isHebrew
                  ? "הוסף שחקן"
                  : "Add Player"}
            </button>
          </form>
        )}

        {!isAdmin && (
          <div className="mb-8 rounded-3xl border border-purple-400/20 bg-purple-400/[0.08] p-5 text-sm text-purple-200">
            {isHebrew
              ? "רשימת השחקנים זמינה לצפייה. פעולות ניהול זמינות למנהל בלבד."
              : "The player list is available for viewing. Management actions are available to administrators only."}
          </div>
        )}

        {message && (
          <div
            role="alert"
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              messageType === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {isLoadingMembers ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center text-white/40">
            {isHebrew
              ? "טוען את חברי הקבוצה..."
              : "Loading team members..."}
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
                        {getRoleLabel(member.role)}
                      </span>
                    )}

                    {member.role === "captain" && (
                      <span className="rounded-full bg-purple-400/15 px-2.5 py-1 text-xs font-bold text-purple-300">
                        {getRoleLabel(member.role)}
                      </span>
                    )}

                    {member.role === "player" && (
                      <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/45">
                        {getRoleLabel(member.role)}
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
                    !isAdmin ||
                    member.role === "admin"
                  }
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    member.is_active
                      ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  {member.is_active
                    ? isHebrew
                      ? "פעיל"
                      : "Active"
                    : isHebrew
                      ? "לא פעיל"
                      : "Inactive"}
                </button>
              </article>
            ))}

            {members.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/15 p-10 text-center text-white/40">
                {isHebrew
                  ? "עדיין אין חברי קבוצה מאושרים"
                  : "There are no approved team members yet"}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}