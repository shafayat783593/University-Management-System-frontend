"use client";

import { CalendarDays } from "lucide-react";
import type { MyRoutineEntry } from "@/api";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-ui";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyRoutine } from "@/hooks";
import { getApiErrorMessage } from "@/hooks/auth.hook";

// Sunday → Saturday, so the timetable reads top-to-bottom in week order.
const DAY_ORDER = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

function dayLabel(day: string) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}

// Group entries by day. Backend already sorts by startTime within a day.
function groupByDay(entries: MyRoutineEntry[]) {
  const groups = new Map<string, MyRoutineEntry[]>();
  for (const entry of entries) {
    const list = groups.get(entry.dayOfWeek) ?? [];
    list.push(entry);
    groups.set(entry.dayOfWeek, list);
  }
  return DAY_ORDER.filter((day) => groups.has(day)).map((day) => ({
    day,
    entries: groups.get(day) ?? [],
  }));
}

export default function MyRoutineTimetable() {
  const query = useMyRoutine();
  const entries = query.data ?? [];
  const days = groupByDay(entries);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="My class routine"
          subtitle="Your weekly timetable across all enrolled sections."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <p className="text-sm font-semibold">Could not load routine</p>
          <p className="text-[13px] text-muted-foreground">
            {getApiErrorMessage(query.error, "Try again in a moment.")}
          </p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-1 h-8 rounded-xl border px-3 text-sm font-medium hover:bg-muted"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <DashboardPageHeader
          title="My class routine"
          subtitle="Your weekly timetable across all enrolled sections."
        />
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
            <CalendarDays className="size-5" />
          </span>
          <p className="text-sm font-semibold">No classes scheduled</p>
          <p className="max-w-sm text-[13px] text-muted-foreground">
            Your timetable appears here once your instructors add class times.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        title="My class routine"
        subtitle={`${entries.length} class${entries.length > 1 ? "es" : ""} per week.`}
      />

      <div className="grid items-start gap-3 lg:grid-cols-2">
        {days.map(({ day, entries: dayEntries }) => (
          <section
            key={day}
            className="rounded-2xl border bg-card p-5 shadow-soft"
          >
            <h2 className="text-[15px] font-bold">{dayLabel(day)}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {dayEntries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold tracking-wide text-primary">
                      {entry.section.course.code}
                    </p>
                    <p className="truncate text-sm font-bold">
                      {entry.section.course.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.startTime} – {entry.endTime}
                      {entry.room ? ` · Room ${entry.room}` : ""}
                      {entry.section.instructor
                        ? ` · ${entry.section.instructor.user.name}`
                        : ""}
                    </p>
                  </div>
                  <Badge variant="secondary">{dayLabel(day)}</Badge>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
