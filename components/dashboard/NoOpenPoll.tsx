import Link from "next/link";
import { CalendarDays } from "lucide-react";

import EmptyState from "@/components/ui/EmptyState";

export default function NoOpenPoll() {
  return (
    <div className="mt-6">
      <EmptyState
        icon={<CalendarDays size={30} />}
        title="אין כרגע סקר פתוח"
        description="פתח סקר חדש כדי לאסוף את הזמינות של חברי הקבוצה ולגלות מהו היום הטוב ביותר לסשן."
        action={
          <Link
            href="/polls/new"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-amber-400 px-6 font-bold text-black transition hover:bg-amber-300"
          >
            פתיחת סקר חדש
          </Link>
        }
      />
    </div>
  );
}