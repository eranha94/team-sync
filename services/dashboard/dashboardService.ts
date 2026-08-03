import { supabase } from "@/lib/supabase";

export type Poll = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  closes_at: string | null;
  status: "draft" | "open" | "closed";
};

export type PollDay = {
  id: string;
  date_x: string;
  start_time: string | null;
  end_time: string | null;
};

export type Availability = {
  poll_day_id: string;
  member_id: string;
  status: "available" | "maybe" | "unavailable";
  available_from: string | null;
  available_until: string | null;
};

export type DashboardData = {
  activeMembersCount: number;
  openPoll: Poll | null;
  pollDays: PollDay[];
  availability: Availability[];
};

async function getActiveMembersCount() {
  const {
    count,
    error,
  } = await supabase
    .from("members")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("is_active", true);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function getOpenPoll() {
  const {
    data,
    error,
  } = await supabase
    .from("polls")
    .select(
      "id, title, start_date, end_date, closes_at, status"
    )
    .eq("status", "open")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as Poll | null;
}

async function getPollDays(pollId: string) {
  const {
    data,
    error,
  } = await supabase
    .from("poll_days")
    .select("id, date_x, start_time, end_time")
    .eq("poll_id", pollId)
    .order("date_x", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as PollDay[];
}

async function getAvailability(pollDayIds: string[]) {
  if (pollDayIds.length === 0) {
    return [];
  }

  const {
    data,
    error,
  } = await supabase
    .from("availability")
    .select(
      "poll_day_id, member_id, status, available_from, available_until"
    )
    .in("poll_day_id", pollDayIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as Availability[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [activeMembersCount, openPoll] = await Promise.all([
    getActiveMembersCount(),
    getOpenPoll(),
  ]);

  if (!openPoll) {
    return {
      activeMembersCount,
      openPoll: null,
      pollDays: [],
      availability: [],
    };
  }

  const pollDays = await getPollDays(openPoll.id);

  if (pollDays.length === 0) {
    return {
      activeMembersCount,
      openPoll,
      pollDays: [],
      availability: [],
    };
  }

  const pollDayIds = pollDays.map((day) => day.id);

  const availability = await getAvailability(pollDayIds);

  return {
    activeMembersCount,
    openPoll,
    pollDays,
    availability,
  };
}