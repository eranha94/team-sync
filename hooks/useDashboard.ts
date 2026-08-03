"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useCurrentMember } from "@/hooks/useCurrentMember";
import { buildDashboard } from "@/components/dashboard/dashboardUtils";
import {
  getDashboardData,
  type Availability,
  type Poll,
  type PollDay,
} from "@/services/dashboard/dashboardService";

export default function useDashboard() {
  const { member } = useCurrentMember();

  const [activeMembersCount, setActiveMembersCount] = useState(0);
  const [openPoll, setOpenPoll] = useState<Poll | null>(null);
  const [pollDays, setPollDays] = useState<PollDay[]>([]);
  const [availability, setAvailability] = useState<Availability[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const data = await getDashboardData();

      setActiveMembersCount(data.activeMembersCount);
      setOpenPoll(data.openPoll);
      setPollDays(data.pollDays);
      setAvailability(data.availability);
    } catch (error) {
      console.error("Dashboard error:", error);

      setMessage(
        error instanceof Error
          ? error.message
          : "לא ניתן לטעון את נתוני הדאשבורד"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const dashboard = useMemo(
    () =>
      buildDashboard({
        activeMembersCount,
        pollDays,
        availability,
      }),
    [activeMembersCount, pollDays, availability]
  );

  return {
    member,
    openPoll,
    isLoading,
    message,
    activeMembersCount,
    answeredMembersCount: dashboard.answeredMembersCount,
    waitingMembersCount: dashboard.waitingMembersCount,
    responseRate: dashboard.responseRate,
    dayResults: dashboard.dayResults,
    bestDay: dashboard.bestDay,
    refresh: loadDashboard,
  };
}