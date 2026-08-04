import {
  CheckCircle2,
  CircleHelp,
  ClipboardPlus,
  UsersRound,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";
import useLanguage from "@/hooks/useLanguage";

type DashboardStatsProps = {
  activeMembersCount: number;
  answeredMembersCount: number;
  waitingMembersCount: number;
  responseRate: number;
  openPollTitle?: string | null;
};

export default function DashboardStats({
  activeMembersCount,
  answeredMembersCount,
  waitingMembersCount,
  responseRate,
  openPollTitle,
}: DashboardStatsProps) {
  const { direction } = useLanguage();

  const hasOpenPoll = Boolean(openPollTitle);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title={
          direction === "rtl"
            ? "חברי קבוצה פעילים"
            : "Active Players"
        }
        value={activeMembersCount}
        subtitle={
          direction === "rtl"
            ? "חברים מורשים במערכת"
            : "Authorized team members"
        }
        icon={<UsersRound size={22} />}
        color="purple"
      />

      <StatCard
        title={
          direction === "rtl"
            ? "ענו לסקר"
            : "Answered"
        }
        value={answeredMembersCount}
        subtitle={
          hasOpenPoll
            ? direction === "rtl"
              ? `מתוך ${activeMembersCount} חברים`
              : `Out of ${activeMembersCount} players`
            : direction === "rtl"
              ? "אין כרגע סקר פתוח"
              : "No active poll"
        }
        icon={<CheckCircle2 size={22} />}
        color="green"
      />

      <StatCard
        title={
          direction === "rtl"
            ? "טרם ענו"
            : "Waiting"
        }
        value={waitingMembersCount}
        subtitle={
          hasOpenPoll
            ? direction === "rtl"
              ? "ממתינים לתגובה"
              : "Waiting for responses"
            : direction === "rtl"
              ? "אין כרגע סקר פתוח"
              : "No active poll"
        }
        icon={<CircleHelp size={22} />}
        color="red"
      />

      <StatCard
        title={
          direction === "rtl"
            ? "אחוז היענות"
            : "Response Rate"
        }
        value={`${responseRate}%`}
        subtitle={
          hasOpenPoll
            ? openPollTitle!
            : direction === "rtl"
              ? "פתח סקר כדי להתחיל"
              : "Create a poll to get started"
        }
        icon={<ClipboardPlus size={22} />}
        color="gold"
      />
    </section>
  );
}