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

export type DayResult = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  availableCount: number;
  maybeCount: number;
};

type BuildDashboardParams = {
  activeMembersCount: number;
  pollDays: PollDay[];
  availability: Availability[];
};

function cleanTime(value: string | null) {
  return value ? value.slice(0, 5) : "";
}

export function buildDashboard({
  activeMembersCount,
  pollDays,
  availability,
}: BuildDashboardParams) {
  const answeredMembersCount = new Set(
    availability.map((answer) => answer.member_id)
  ).size;

  const waitingMembersCount = Math.max(
    activeMembersCount - answeredMembersCount,
    0
  );

  const responseRate =
    activeMembersCount > 0
      ? Math.round(
          (answeredMembersCount / activeMembersCount) * 100
        )
      : 0;

  const dayResults: DayResult[] = pollDays.map((day) => {
    const dayAnswers = availability.filter(
      (answer) => answer.poll_day_id === day.id
    );

    return {
      id: day.id,
      date: day.date_x,
      startTime: cleanTime(day.start_time),
      endTime: cleanTime(day.end_time),
      availableCount: dayAnswers.filter(
        (answer) => answer.status === "available"
      ).length,
      maybeCount: dayAnswers.filter(
        (answer) => answer.status === "maybe"
      ).length,
    };
  });

  const bestDay =
    dayResults.length > 0
      ? [...dayResults].sort((firstDay, secondDay) => {
          if (
            secondDay.availableCount !==
            firstDay.availableCount
          ) {
            return (
              secondDay.availableCount -
              firstDay.availableCount
            );
          }

          return (
            secondDay.maybeCount -
            firstDay.maybeCount
          );
        })[0]
      : null;

  return {
    answeredMembersCount,
    waitingMembersCount,
    responseRate,
    dayResults,
    bestDay,
  };
}