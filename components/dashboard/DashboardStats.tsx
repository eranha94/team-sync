import {
  CheckCircle2,
  CircleHelp,
  ClipboardPlus,
  UsersRound,
} from "lucide-react";

import StatCard from "@/components/ui/StatCard";

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
  const hasOpenPoll = Boolean(openPollTitle);

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="חברי קבוצה פעילים"
        value={activeMembersCount}
        subtitle="חברים מורשים במערכת"
        icon={<UsersRound size={22} />}
        color="purple"
      />

      <StatCard
        title="ענו לסקר"
        value={answeredMembersCount}
        subtitle={
          hasOpenPoll
            ? `מתוך ${activeMembersCount} חברים`
            : "אין כרגע סקר פתוח"
        }
        icon={<CheckCircle2 size={22} />}
        color="green"
      />

      <StatCard
        title="טרם ענו"
        value={waitingMembersCount}
        subtitle={
          hasOpenPoll
            ? "ממתינים לתגובה"
            : "אין כרגע סקר פתוח"
        }
        icon={<CircleHelp size={22} />}
        color="red"
      />

      <StatCard
        title="אחוז היענות"
        value={`${responseRate}%`}
        subtitle={
          hasOpenPoll
            ? openPollTitle!
            : "פתח סקר כדי להתחיל"
        }
        icon={<ClipboardPlus size={22} />}
        color="gold"
      />
    </section>
  );
}