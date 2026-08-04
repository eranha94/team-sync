"use client";

import QuickActions from "@/components/dashboard/QuickActions";
import BestDayCard from "@/components/dashboard/BestDayCard";
import OpenPollCard from "@/components/dashboard/OpenPollCard";
import AvailabilityGrid from "@/components/dashboard/AvailabilityGrid";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardHero from "@/components/dashboard/DashboardHero";
import NoOpenPoll from "@/components/dashboard/NoOpenPoll";
import DashboardAlert from "@/components/dashboard/DashboardAlert";

import Loading from "@/components/ui/Loading";
import useDashboard from "@/hooks/useDashboard";
import useLanguage from "@/hooks/useLanguage";

export default function DashboardPage() {
  const { tr, direction } = useLanguage();

  const {
    member,
    openPoll,
    isLoading,
    message,
    activeMembersCount,
    answeredMembersCount,
    waitingMembersCount,
    responseRate,
    dayResults,
    bestDay,
    refresh,
  } = useDashboard();

  if (isLoading) {
    return (
      <Loading
        fullScreen
        size="lg"
        text={
          direction === "rtl"
            ? "טוען את נתוני הקבוצה..."
            : "Loading team data..."
        }
      />
    );
  }

  return (
    <main
      dir={direction}
      className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10"
    >
      <DashboardHero
        memberName={member?.fullName}
        onRefresh={refresh}
      />

      <DashboardAlert message={message} />

      <DashboardStats
        activeMembersCount={activeMembersCount}
        answeredMembersCount={answeredMembersCount}
        waitingMembersCount={waitingMembersCount}
        responseRate={responseRate}
        openPollTitle={openPoll?.title}
      />

      {openPoll ? (
        <>
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <BestDayCard
              bestDay={bestDay}
              pollId={openPoll.id}
            />

            <OpenPollCard
              pollId={openPoll.id}
              title={openPoll.title}
              startDate={openPoll.start_date}
              endDate={openPoll.end_date}
              responseRate={responseRate}
              isAdmin={member?.role === "admin"}
              adminPhone={member?.phone}
              onPollClosed={refresh}
            />
          </section>

          <div className="mt-6">
            <AvailabilityGrid
              days={dayResults}
              bestDayId={bestDay?.id ?? null}
            />
          </div>
        </>
      ) : (
        <NoOpenPoll />
      )}

      <div className="mt-8">
        <QuickActions />
      </div>
    </main>
  );
}